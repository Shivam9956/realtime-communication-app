# Testing Plan

## Frontend
Test:
- Login form validation
- Register validation
- Dashboard rendering
- Meeting controls
- Chat UI
- Whiteboard tools
- Responsive behavior

## Backend
Test:
- Register
- Login
- Logout
- Auth middleware
- Meeting creation
- Meeting authorization
- File validation
- Error handling

## Socket.io
Test:
- Join room
- Leave room
- Participant updates
- Chat
- Signaling
- Whiteboard events
- Disconnect cleanup

## WebRTC manual test matrix
Use at least:
- Two Chrome tabs
- Two separate browser windows
- Two devices
- Different networks if possible

Test:
- Camera permission
- Microphone permission
- Mute/unmute
- Camera on/off
- Screen share
- Leave/rejoin
- Network interruption
- Device disconnect

## Security tests
Attempt:
- Accessing another user's meeting
- Uploading disallowed files
- Oversized uploads
- Invalid tokens
- Missing authentication
- Malicious input

## Definition of done
Do not mark a feature complete until:
- Happy path works
- Error path works
- Cleanup works
- Responsive UI works
- No obvious console/server errors remain
