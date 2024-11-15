{/* <script>
    let localStream, screenSharingStream = null;
    let screenSharingActive = false;
    let peerConnections = {}; // Store peer connections for each peer
    let dataChannels = {}; // Store data channels for each peer
    const remoteVideosContainer = document.getElementById('remoteVideosContainer'); // Container for remote video elements
    const localVideo = document.getElementById('localVideo');
    const screenShareBtn = document.getElementById('screenShareBtn');
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');
    const chatMessages = document.getElementById('chatMessages');

    const iceServers = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' } // Google's public STUN server
        ]
    };

    // Initialize peer connection for new peer
    function createPeerConnection(peerId) {
        const peerConnection = new RTCPeerConnection(iceServers);

        // Handle remote stream
        peerConnection.ontrack = event => {
            const remoteVideoElement = document.createElement('video');
            remoteVideoElement.srcObject = event.streams[0];
            remoteVideoElement.autoplay = true;
            remoteVideosContainer.appendChild(remoteVideoElement);
        };

        // Add local stream to connection
        localStream.getTracks().forEach(track => {
            peerConnection.addTrack(track, localStream);
        });

        // Create data channel for peer messaging
        const dataChannel = peerConnection.createDataChannel('chat');

        // Handle data channel messages
        dataChannel.onmessage = (event) => {
            const messageData = event.data;
            receiveMessage(messageData, peerId);
        };

        // Store the peer connection and data channel
        peerConnections[peerId] = peerConnection;
        dataChannels[peerId] = dataChannel;

        // Handle ICE candidate events
        peerConnection.onicecandidate = event => {
            if (event.candidate) {
                // Send ICE candidates to other peers (via signaling)
                sendICECandidate(peerId, event.candidate);
            }
        };
    }

    // Start video and audio
    async function startVideo() {
        try {
            localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            localVideo.srcObject = localStream;
        } catch (error) {
            console.error('Error accessing media devices.', error);
        }
    }

    // Start screen sharing
    async function startScreenSharing() {
        try {
            screenSharingStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            localVideo.srcObject = screenSharingStream;
            screenSharingActive = true;
            screenShareBtn.textContent = 'Stop Screen Sharing';

            // Add screen sharing track to the connection
            screenSharingStream.getTracks().forEach(track => {
                Object.values(peerConnections).forEach(peerConnection => {
                    peerConnection.addTrack(track, screenSharingStream);
                });
            });
        } catch (error) {
            console.error('Error starting screen sharing:', error);
        }
    }

    // Stop screen sharing
    function stopScreenSharing() {
        if (screenSharingStream) {
            screenSharingStream.getTracks().forEach(track => track.stop());
            screenSharingStream = null;
            screenSharingActive = false;
            screenShareBtn.textContent = 'Start Screen Sharing';
            localVideo.srcObject = localStream; // Return to local video stream
        }
    }

    // Set up call for signaling and peer connection management
    async function setupCall() {
        await startVideo();

        // Signaling logic for exchanging ICE candidates and SDP information between peers
        // This can be implemented using WebSockets, Firebase, etc.
    }

    // Send message to a specific peer
    function sendMessage(peerId, message) {
        const channel = dataChannels[peerId];
        if (channel) {
            channel.send(message); // Send message through data channel
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('messageWrapper', 'sent');
            messageDiv.innerHTML = `<div class="message sent">${message}</div>`;
            chatMessages.appendChild(messageDiv);
        }
    }

    // Receive messages from a data channel and display them
    function receiveMessage(message, senderId) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('messageWrapper', 'received');
        messageDiv.innerHTML = `<div class="nameTag">${senderId}</div><div class="message received">${message}</div>`;
        chatMessages.appendChild(messageDiv);
    }

    // Handle incoming ICE candidate
    function sendICECandidate(peerId, candidate) {
        // Send the ICE candidate to the signaling server to forward to the correct peer
        // For example, through WebSockets or Firebase signaling system
        console.log(`Sending ICE candidate for peer ${peerId}`, candidate);
    }

    // Example of receiving a message from another peer (signaling system not shown)
    setTimeout(() => {
        receiveMessage('Hello, how are you?', 'John');
    }, 3000);

    // Event listeners for user interface
    document.getElementById('loginBtn').onclick = () => {
        const username = document.getElementById('username').value;
        if (username) {
            document.getElementById('loginSection').classList.add('hidden');
            document.getElementById('callSection').classList.remove('hidden');
            document.getElementById('displayUsername').textContent = username;
            setupCall();
        }
    };

    // Screen sharing toggle button
    screenShareBtn.onclick = () => {
        if (screenSharingActive) {
            stopScreenSharing();
        } else {
            startScreenSharing();
        }
    };
</script> */}
