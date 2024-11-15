package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

type Message struct {
	Type    string `json:"type"`
	Content string `json:"content"`
	User    string `json:"user"`
}

var (
	clients   = make(map[*websocket.Conn]string) // Map to store WebSocket clients and their usernames
	broadcast = make(chan Message)
)

func main() {
	// Ensure the users.txt file exists
	checkAndCreateUsersFile()

	// Read the list of users when the server starts
	users := readUsers()
	log.Printf("Current users: %v", users)

	http.Handle("/", http.FileServer(http.Dir("./static"))) // Serving static files (includes login.html)
	http.HandleFunc("/ws", handleConnections)

	go handleMessages()

	log.Println("Server started on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

// Handle WebSocket connections
func handleConnections(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}
	defer conn.Close()

	var msg Message
	err = conn.ReadJSON(&msg)
	if err != nil {
		log.Printf("Error reading message: %v", err)
		return
	}

	// Handle login request
	if msg.Type == "login" {
		// Check if the username exists
		if !isUsernameTaken(msg.User) {
			// Send error message if username is not found
			conn.WriteJSON(Message{
				Type:    "error",
				Content: fmt.Sprintf("Username '%s' does not exist.", msg.User),
			})
			return
		}

		// Send success message
		conn.WriteJSON(Message{
			Type:    "login",
			Content: fmt.Sprintf("%s has logged in.", msg.User),
			User:    msg.User,
		})

		// Add the client to the list of clients
		clients[conn] = msg.User

		// Continue listening for WebRTC signaling messages
		for {
			err := conn.ReadJSON(&msg)
			if err != nil {
				log.Printf("Error reading message: %v", err)
				delete(clients, conn)
				break
			}
			// Handle WebRTC signaling messages
			if msg.Type == "offer" || msg.Type == "answer" || msg.Type == "candidate" {
				// Forward WebRTC signaling message to all other clients
				for client := range clients {
					if client != conn {
						err := client.WriteJSON(msg)
						if err != nil {
							log.Printf("Error sending message: %v", err)
							client.Close()
							delete(clients, client)
						}
					}
				}
			} else {
				// Handle regular chat messages
				broadcast <- msg
			}
		}
		return
	}

	// Handle registration request
	if msg.Type == "register" {
		// Check if the username already exists
		if isUsernameTaken(msg.User) {
			// Send error message if username is already taken
			conn.WriteJSON(Message{
				Type:    "error",
				Content: fmt.Sprintf("Username '%s' is already taken.", msg.User),
			})
			return
		}

		// Save the new username to the file
		saveUsername(msg.User)

		// Send success message to allow the user to move on
		conn.WriteJSON(Message{
			Type:    "register",
			Content: fmt.Sprintf("%s has registered successfully.", msg.User),
			User:    msg.User,
		})

		// Add the client to the list of clients
		clients[conn] = msg.User

		// Continue listening for WebRTC signaling messages
		for {
			err := conn.ReadJSON(&msg)
			if err != nil {
				log.Printf("Error reading message: %v", err)
				delete(clients, conn)
				break
			}
			// Handle WebRTC signaling messages
			if msg.Type == "offer" || msg.Type == "answer" || msg.Type == "candidate" {
				// Forward WebRTC signaling message to all other clients
				for client := range clients {
					if client != conn {
						err := client.WriteJSON(msg)
						if err != nil {
							log.Printf("Error sending message: %v", err)
							client.Close()
							delete(clients, client)
						}
					}
				}
			} else {
				// Handle regular chat messages
				broadcast <- msg
			}
		}
		return
	}

	// Send a generic error if the type is unknown
	conn.WriteJSON(Message{
		Type:    "error",
		Content: "Invalid request type.",
	})
}

// Handle messages to all clients
func handleMessages() {
	for {
		msg := <-broadcast
		for client := range clients {
			err := client.WriteJSON(msg)
			if err != nil {
				log.Printf("Error sending message: %v", err)
				client.Close()
				delete(clients, client)
			}
		}
	}
}

// Save the username to a text file (for simplicity, stores all usernames)
func saveUsername(username string) {
	f, err := os.OpenFile("users.txt", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0o644)
	if err != nil {
		log.Fatal(err)
	}
	defer f.Close()

	if _, err := f.WriteString(username + "\n"); err != nil {
		log.Fatal(err)
	}
}

// Check if the username is already taken
func isUsernameTaken(username string) bool {
	users := readUsers()
	for _, user := range users {
		if user == username {
			return true
		}
	}
	return false
}

// Read users from the text file
func readUsers() []string {
	// Check if the file exists, return an empty slice if not
	if _, err := os.Stat("users.txt"); os.IsNotExist(err) {
		return []string{}
	}

	content, err := os.ReadFile("users.txt")
	if err != nil {
		log.Fatal(err)
	}
	// Split the content by newlines and filter out empty lines
	users := strings.Split(string(content), "\n")
	for i := range users {
		users[i] = strings.TrimSpace(users[i]) // Trim any leading/trailing spaces
	}
	return users
}

// Check and create the users.txt file if it doesn't exist
func checkAndCreateUsersFile() {
	_, err := os.Stat("users.txt")
	if os.IsNotExist(err) {
		file, err := os.Create("users.txt")
		if err != nil {
			log.Fatal("Error creating users.txt file: ", err)
		}
		defer file.Close()
		log.Println("Created users.txt file.")
	}
}
