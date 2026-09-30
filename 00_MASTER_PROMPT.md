# Real-Time Communication App — Master Build Prompt

## Goal
Build a production-style real-time communication and collaboration web application with:
- Multi-user video/audio calling
- Screen sharing
- Real-time chat
- File sharing
- Collaborative whiteboard
- Secure authentication
- Meeting creation/joining
- Responsive UI
- Secure backend and deployment-ready architecture

## Required stack
### Frontend
- React.js
- JavaScript (or TypeScript if the project is explicitly upgraded later)
- React Router
- CSS/Tailwind CSS
- WebRTC browser APIs
- Canvas API

### Backend
- Node.js
- Express.js
- Socket.io
- JWT or secure cookie-based authentication
- bcrypt
- REST APIs

### Database
- MongoDB with Mongoose

### Storage
Start with a local/server upload abstraction. Keep the storage service replaceable so it can later use S3/Cloudinary/Supabase Storage.

### Real-time
- Socket.io for signaling, chat, presence, and whiteboard events
- WebRTC for audio/video and screen sharing
- STUN/TURN configuration through environment variables

## Non-negotiable engineering rules
1. Build incrementally. Do not attempt the entire application in one giant implementation.
2. Keep frontend, backend, socket, WebRTC, and data-access responsibilities separated.
3. Never hard-code secrets.
4. Never store plaintext passwords.
5. Validate all user input on the server.
6. Protect authenticated API routes.
7. Validate file size, type, and filename before storage.
8. Handle camera/microphone permissions and WebRTC errors gracefully.
9. Clean up media tracks, peer connections, listeners, and sockets when a meeting ends or a component unmounts.
10. Make the application responsive for desktop, tablet, and mobile.
11. Do not claim a feature is complete until it has been tested.
12. Keep a clear README and setup instructions.
13. Use meaningful names and comments only where they add value.
14. Never commit .env files or secrets.
15. Prefer secure defaults.

## Build order
1. Project scaffold
2. UI shell
3. Authentication
4. Database models
5. Meeting creation/joining
6. Socket.io signaling
7. 1-to-1 WebRTC
8. Multi-user WebRTC
9. Meeting controls
10. Screen sharing
11. Chat
12. File sharing
13. Collaborative whiteboard
14. Security hardening
15. Testing
16. Deployment
17. Documentation

## Definition of done
The final application must allow an authenticated user to create a meeting, invite another user with a meeting link/ID, join a meeting, exchange audio/video, mute/unmute, turn camera on/off, share a screen, chat, share files, and collaborate on a synchronized whiteboard.
