# OmniSync — Real-Time Communication & Collaboration App

A production-grade, modular real-time communication platform built with React, Node.js, Socket.io, WebRTC mesh, and MongoDB.

---

## 🚀 Phase 1 Status: Scaffold & Foundation Completed

- ✅ **Project Scaffold**: Root, client, and server architecture organized with modular separation.
- ✅ **React Frontend**: Vite + React 18 + React Router v6 with modern dark SaaS design tokens, responsive layout, glassmorphism cards, and interactive meeting UI shell.
- ✅ **Node.js + Express Backend**: REST API with `/api/health`, Helmet security headers, CORS allowlist, request logging, and structured error handling.
- ✅ **Database Layer**: MongoDB connection management via Mongoose with auto-reconnect listeners and health diagnostics.
- ✅ **Real-Time Signaling**: Socket.io server initialized with connection monitoring, ping diagnostics, and meeting room scaffolding.
- ✅ **Environment & Git**: `.env.example` configurations and `.gitignore` setup across root, client, and server.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 (Vite)
- **Routing**: React Router DOM v6
- **Styling**: Vanilla CSS Design Tokens (Custom Glassmorphism, Micro-animations, Dark SaaS Palette)
- **Icons**: Lucide React
- **Real-Time**: Socket.io Client & WebRTC browser APIs (Phase 6-7)
- **Canvas**: HTML5 Canvas API (Phase 12)

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Real-Time**: Socket.io (Signaling & Presence)
- **Database**: MongoDB with Mongoose ODM
- **Security**: Helmet, CORS, bcryptjs, jsonwebtoken

---

## 📂 Project Structure

```text
Real-Time Communication App/
├── client/                      # Frontend Application (React + Vite)
│   ├── public/                  # Static assets & favicons
│   ├── src/
│   │   ├── components/          # Reusable UI & Layout components
│   │   ├── context/             # AuthContext & SocketContext
│   │   ├── hooks/               # Custom React hooks
│   │   ├── pages/               # Landing, Login, Register, Dashboard, MeetingRoom, NotFound
│   │   ├── services/            # API client (fetch) & Socket.io client
│   │   ├── styles/              # Design tokens (index.css), components.css, pages.css
│   │   ├── App.jsx              # Main router definition
│   │   └── main.jsx             # React entry point
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example
│
├── server/                      # Backend REST & WebSocket Server
│   ├── config/                  # Database connection & environment loaders
│   ├── controllers/             # Health controller & future auth/meeting controllers
│   ├── middleware/              # Error handler & 404 middleware
│   ├── models/                  # Mongoose models (User, Meeting, Message, File)
│   ├── routes/                  # API routing (/api/health, /api/auth, etc.)
│   ├── socket/                  # Socket.io connection handlers & event routing
│   ├── utils/                   # Structured logging helpers
│   ├── uploads/                 # Local storage abstraction directory (.gitkeep)
│   ├── server.js                # Server entry point
│   ├── package.json
│   └── .env.example
│
├── .gitignore
├── package.json                 # Root orchestrator (concurrently)
└── README.md
```

---

## 💻 Local Development Setup

### 1. Prerequisites
- Node.js >= 18.0.0
- MongoDB running locally (default: `mongodb://127.0.0.1:27017/realtime_communication`)

### 2. Install All Dependencies
From the root directory, run:
```bash
npm run install:all
```
*(Or install individually: `npm install` in root, `npm install` in `server`, and `npm install` in `client`)*

### 3. Environment Configuration
Copy the `.env.example` templates to `.env`:

**Server (`server/.env`):**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/realtime_communication
CLIENT_URL=http://localhost:5173
JWT_SECRET=your_jwt_secret_key_here
STUN_SERVERS=stun:stun.l.google.com:19302
MAX_FILE_SIZE_MB=10
```

**Client (`client/.env`):**
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 4. Start the Application
Run both backend and frontend concurrently:
```bash
npm run dev
```

- **Frontend Application**: [http://localhost:5173](http://localhost:5173)
- **Backend API Base**: [http://localhost:5000/api](http://localhost:5000/api)
- **Health Diagnostics Endpoint**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🔍 Verification & Health API

To verify the backend health status:
```bash
curl http://localhost:5000/api/health
```

Sample response:
```json
{
  "status": "ok",
  "version": "1.0.0",
  "timestamp": "2026-09-30T12:00:00.000Z",
  "uptime": "42s",
  "environment": "development",
  "services": {
    "server": "healthy",
    "database": "connected",
    "socket": "ready"
  }
}
```

---

## 🗺️ Roadmap & Build Order

- [x] **Phase 1**: Project scaffold, Express backend, React UI shell, health checks, Git configuration
- [ ] **Phase 2**: Full routing and responsive navigation refinement
- [ ] **Phase 3**: Authentication (Register, Login, JWT verification, Bcrypt)
- [ ] **Phase 4**: Database schemas & indexes (User, Meeting, Message, File)
- [ ] **Phase 5**: Meeting creation, join validation, room IDs
- [ ] **Phase 6**: Socket.io signaling pipeline
- [ ] **Phase 7**: 1-to-1 and multi-user WebRTC mesh
- [ ] **Phase 8**: Media device meeting controls (Mute, Camera toggle, Track management)
- [ ] **Phase 9**: Screen sharing integration
- [ ] **Phase 10**: In-meeting real-time chat
- [ ] **Phase 11**: Secure multipart file sharing
- [ ] **Phase 12**: Synchronized HTML5 Canvas whiteboard
- [ ] **Phase 13**: Security hardening & rate limiting
- [ ] **Phase 14**: Automated & manual test suites
- [ ] **Phase 15**: Production containerization & deployment
