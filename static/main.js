// let username = '';
// let socket;
// let localStream;
// let peerConnection;
// let recorder;
// let recordedChunks = [];
// const config = {
//     iceServers: [
//         { urls: 'stun:stun.l.google.com:19302' }
//     ]
// };

// // DOM elements
// const loginSection = document.getElementById('loginSection');
// const callSection = document.getElementById('callSection');
// const displayUsername = document.getElementById('displayUsername'); // Display username here
// const localVideo = document.getElementById('localVideo');
// const remoteVideo = document.getElementById('remoteVideo');
// const messageInput = document.getElementById('messageInput');
// const chatMessages = document.getElementById('chatMessages');
// const sendBtn = document.getElementById('sendBtn');
// const screenShareBtn = document.getElementById('screenShareBtn');
// const recordBtn = document.getElementById('recordBtn');
// const endCallBtn = document.getElementById('endCallBtn');

// // Event Listeners
// document.getElementById('loginBtn').addEventListener('click', handleLogin);
// sendBtn.addEventListener('click', sendMessage);
// screenShareBtn.addEventListener('click', shareScreen);
// recordBtn.addEventListener('click', toggleRecording);
// endCallBtn.addEventListener('click', endCall);

// async function handleLogin() {
//     username = document.getElementById('username').value.trim();
//     if (username === '') {
//         alert('Please enter a username');
//         return;
//     }

//     // Open WebSocket connection for signaling
//     socket = new WebSocket('ws://localhost:8080/ws');
//     socket.onopen = () => {
//         socket.send(JSON.stringify({ type: 'login', user: username }));
//     };
//     socket.onmessage = (event) => handleSocketMessage(event);

//     // Show the username on the call section
//     displayUsername.textContent = username; // Display username after login
    
//     // Hide login section and start video call
//     loginSection.classList.add('hidden');
//     callSection.classList.remove('hidden');

//     await startVideoCall();
// }

// async function startVideoCall() {
//     try {
//         // Access local media stream (video + audio)
//         localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
//         localVideo.srcObject = localStream;
        
//         // Create WebRTC PeerConnection
//         peerConnection = new RTCPeerConnection(config);
        
//         // Add local stream to the peer connection
//         localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));
        
//         // Listen for remote video stream
//         peerConnection.ontrack = (event) => {
//             remoteVideo.srcObject = event.streams[0];
//         };

//         // Listen for ICE candidates
//         peerConnection.onicecandidate = (event) => {
//             if (event.candidate) {
//                 socket.send(JSON.stringify({ type: 'iceCandidate', candidate: event.candidate }));
//             }
//         };

//         // Create an offer and send it to the server
//         const offer = await peerConnection.createOffer();
//         await peerConnection.setLocalDescription(offer);
//         socket.send(JSON.stringify({ type: 'offer', offer }));
//     } catch (err) {
//         console.error('Error starting video call:', err);
//         alert('Error starting video call: ' + err.message);
//     }
// }

// function handleSocketMessage(event) {
//     const message = JSON.parse(event.data);

//     switch (message.type) {
//         case 'offer':
//             handleOffer(message.offer);
//             break;
//         case 'answer':
//             handleAnswer(message.answer);
//             break;
//         case 'iceCandidate':
//             handleICECandidate(message.candidate);
//             break;
//         case 'message':
//             displayChatMessage(message.user, message.content);
//             break;
//         default:
//             console.log('Unknown message type:', message);
//     }
// }

// async function handleOffer(offer) {
//     try {
//         // Create peer connection for the offer
//         peerConnection = new RTCPeerConnection(config);
        
//         // Set the remote description (offer)
//         await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

//         // Add local stream tracks
//         localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

//         // Create an answer and send it to the server
//         const answer = await peerConnection.createAnswer();
//         await peerConnection.setLocalDescription(answer);
//         socket.send(JSON.stringify({ type: 'answer', answer }));

//         // Listen for ICE candidates
//         peerConnection.onicecandidate = (event) => {
//             if (event.candidate) {
//                 socket.send(JSON.stringify({ type: 'iceCandidate', candidate: event.candidate }));
//             }
//         };

//         // Listen for remote video
//         peerConnection.ontrack = (event) => {
//             remoteVideo.srcObject = event.streams[0];
//         };
//     } catch (err) {
//         console.error('Error handling offer:', err);
//     }
// }

// async function handleAnswer(answer) {
//     try {
//         await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
//     } catch (err) {
//         console.error('Error handling answer:', err);
//     }
// }

// function handleICECandidate(candidate) {
//     peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
// }

// // Chat functionality
// function sendMessage() {
//     const message = messageInput.value.trim();
//     if (message === '') return;

//     socket.send(JSON.stringify({ type: 'message', user: username, content: message }));
//     displayChatMessage(username, message);
//     messageInput.value = '';
// }

// function displayChatMessage(user, content) {
//     const messageDiv = document.createElement('div');
//     messageDiv.textContent = `${user}: ${content}`;
//     chatMessages.appendChild(messageDiv);
//     chatMessages.scrollTop = chatMessages.scrollHeight;  // Scroll to bottom
// }

// // Screen sharing functionality
// async function shareScreen() {
//     try {
//         const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
//         const screenTrack = screenStream.getTracks()[0];
        
//         // Replace the local video track with the screen track
//         const sender = peerConnection.getSenders().find(s => s.track.kind === 'video');
//         sender.replaceTrack(screenTrack);

//         // Stop the screen sharing after the call ends or a new stream is started
//         screenTrack.onended = () => {
//             sender.replaceTrack(localStream.getTracks().find(t => t.kind === 'video'));
//         };
//     } catch (err) {
//         console.error('Error sharing screen:', err);
//     }
// }

// // Recording functionality
// function toggleRecording() {
//     if (!recorder) {
//         recorder = new MediaRecorder(localStream);
//         recorder.ondataavailable = (event) => {
//             recordedChunks.push(event.data);
//         };
//         recorder.onstop = () => {
//             const blob = new Blob(recordedChunks, { type: 'video/webm' });
//             const url = URL.createObjectURL(blob);
//             const downloadLink = document.createElement('a');
//             downloadLink.href = url;
//             downloadLink.download = 'recording.webm';
//             downloadLink.click();
//             recordedChunks = [];
//         };
//         recorder.start();
//         recordBtn.textContent = 'Stop Recording';
//     } else {
//         recorder.stop();
//         recorder = null;
//         recordBtn.textContent = 'Start Recording';
//     }
// }

// // End call functionality
// function endCall() {
//     socket.send(JSON.stringify({ type: 'endCall' }));
//     peerConnection.close();
//     callSection.classList.add('hidden');
//     loginSection.classList.remove('hidden');
// }
