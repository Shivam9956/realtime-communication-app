# WebRTC Implementation Plan

## Goal
Implement reliable browser-to-browser audio/video communication.

## Step 1 — Local media
Use:
```javascript
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
});
```

Display the local stream immediately.

## Step 2 — Peer connection
Create:
```javascript
new RTCPeerConnection({
  iceServers: [...]
});
```

Add local tracks:
```javascript
stream.getTracks().forEach(track => {
  peerConnection.addTrack(track, stream);
});
```

## Step 3 — Signaling
Socket.io carries:
- Offer
- Answer
- ICE candidates

Socket.io is only signaling. It must not carry the actual media stream.

## Step 4 — Remote stream
Listen for:
```javascript
peerConnection.ontrack
```

Attach the received stream to the correct video element.

## Step 5 — ICE
Send ICE candidates through Socket.io.

Use environment-configured STUN/TURN servers.

## Step 6 — Multi-user
Maintain:
```text
peerConnections[socketId]
remoteStreams[socketId]
```

Create one peer connection per remote participant for the initial mesh implementation.

## Step 7 — Cleanup
On participant leave:
- Close peer connection.
- Remove remote video.
- Remove state.
- Stop local tracks when leaving the meeting.

## Step 8 — Screen sharing
Use:
```javascript
navigator.mediaDevices.getDisplayMedia({
  video: true
});
```

Prefer `RTCRtpSender.replaceTrack()` when switching the video source so an existing peer connection can continue without unnecessary renegotiation.

## Error handling
Handle:
- Permission denied
- No camera
- No microphone
- Device disconnected
- ICE failure
- Peer disconnected
- Browser incompatibility

## Important
Do not expose private TURN credentials in frontend source. Use short-lived credentials or a secure server-generated configuration when required.
