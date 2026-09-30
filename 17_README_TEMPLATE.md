# Real-Time Communication & Collaboration App

A full-stack real-time communication platform built with React, Node.js, Socket.io, WebRTC, and MongoDB.

## Features
- Multi-user video/audio
- Screen sharing
- Real-time chat
- File sharing
- Collaborative whiteboard
- Authentication
- Meeting links
- Responsive UI
- Security controls

## Tech Stack
- React
- Node.js
- Express
- Socket.io
- WebRTC
- MongoDB
- Mongoose
- HTML Canvas

## Local setup

### 1. Clone/install
Install dependencies for both client and server.

### 2. Configure environment
Copy the example environment files and set local values.

### 3. Start backend
```bash
cd server
npm install
npm run dev
```

### 4. Start frontend
```bash
cd client
npm install
npm run dev
```

### 5. Open
Use the frontend URL printed by the development server.

## Testing
Document the exact test commands once configured.

## Security
Do not commit:
- `.env`
- database passwords
- JWT secrets
- cloud credentials
- TURN credentials

## Architecture
See:
- `02_ARCHITECTURE.md`
- `06_WEBRTC_IMPLEMENTATION.md`
- `10_SECURITY.md`

## Development plan
See:
- `14_IMPLEMENTATION_TASKS.md`
- `15_ANTIGRAVITY_AGENT_RULES.md`
