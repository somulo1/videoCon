const ws = new WebSocket('ws://localhost:8080/ws');
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const messageInput = document.getElementById('messageInput');
const chatMessages = document.getElementById('chatMessages');
const sendBtn = document.getElementById('sendBtn');
const screenShareBtn = document.getElementById('screenShareBtn');
const recordBtn = document.getElementById('recordBtn');
const endCallBtn = document.getElementById('endCallBtn');
const loginSection = document.getElementById('loginSection');
const callSection = document.getElementById('callSection');
let username = '';
let localStream;
let peerConnection;
let screenStream;
let mediaRecorder;
let recordedChunks = [];

// WebSocket message handling
ws.onmessage = (message) => {
    const data = JSON.parse(message.data);
    if (data.type === 'offer') {
        peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
        peerConnection.createAnswer().then((answer) => {
            peerConnection.setLocalDescription(answer);
            ws.send(JSON.stringify({ type: 'answer', answer: answer }));
        });
    } else if (data.type === 'answer') {
        peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
    } else if (data.type === 'candidate') {
        peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
    } else if (data.type === 'message') {
        chatMessages.innerHTML += `<p><strong>${data.user}:</strong> ${data.content}</p>`;
    }
};

// Login button click
document.getElementById('loginBtn').onclick = () => {
    username = document.getElementById('username').value;
    if (username) {
        loginSection.classList.add('hidden');
        callSection.classList.remove('hidden');
        startVideoCall();
        ws.send(JSON.stringify({ type: 'message', user: username, content: `${username} has joined the call.` }));
    }
};

// Send message button click
sendBtn.onclick = () => {
    const message = messageInput.value;
    if (message) {
        ws.send(JSON.stringify({ type: 'message', user: username, content: message }));
        messageInput.value = '';
    }
};

// Start WebRTC video call
async function startVideoCall() {
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localVideo.srcObject = localStream;

    peerConnection = new RTCPeerConnection();

    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            ws.send(JSON.stringify({ type: 'candidate', candidate: event.candidate }));
        }
    };

    peerConnection.ontrack = (event) => {
        remoteVideo.srcObject = event.streams[0];
    };

    // Add local stream to peer connection
    localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
    });

    // Create an offer
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    ws.send(JSON.stringify({ type: 'offer', offer: offer }));
}

// Screen sharing
screenShareBtn.onclick = async () => {
    try {
        screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = screenStream.getTracks()[0];

        // Replace the video track with the screen track
        const sender = peerConnection.getSenders().find(sender => sender.track.kind === 'video');
        if (sender) {
            sender.replaceTrack(screenTrack);
        }

        // Update the local video display
        localVideo.srcObject = screenStream;
    } catch (err) {
        console.error("Error accessing screen share:", err);
    }
};

// Start recording
recordBtn.onclick = () => {
    if (!mediaRecorder && localStream) {
        mediaRecorder = new MediaRecorder(localStream);
        mediaRecorder.ondataavailable = (event) => {
            recordedChunks.push(event.data);
        };
        mediaRecorder.onstop = () => {
            const blob = new Blob(recordedChunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'recording.webm';
            link.click();
        };
        mediaRecorder.start();
        recordBtn.textContent = 'Stop Recording';
    } else if (mediaRecorder) {
        mediaRecorder.stop();
        mediaRecorder = null;
        recordBtn.textContent = 'Start Recording';
    }
};

// End call button
endCallBtn.onclick = () => {
    localStream.getTracks().forEach(track => track.stop());
    if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
    }
    peerConnection.close();
    ws.send(JSON.stringify({ type: 'message', user: username, content: `${username} has left the call.` }));
    loginSection.classList.remove('hidden');
    callSection.classList.add('hidden');
};
