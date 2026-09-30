# Product Requirements Document

## Product
Real-Time Communication & Collaboration App

## Primary users
- Students
- Remote teams
- Freelancers
- Small businesses
- Teachers/trainers
- Project teams

## Core user journeys

### Journey 1 — Register
1. User opens Register.
2. Enters name, email, password.
3. Backend validates data.
4. Password is hashed.
5. User is stored.
6. User is authenticated or redirected to Login.

### Journey 2 — Login
1. User enters credentials.
2. Backend verifies password.
3. Secure authentication state is created.
4. User reaches Dashboard.

### Journey 3 — Create meeting
1. User clicks Create Meeting.
2. Server generates a unique meeting ID.
3. Meeting is stored.
4. User is redirected to meeting room.

### Journey 4 — Join meeting
1. User opens meeting link.
2. Authentication is checked.
3. Meeting existence is checked.
4. User joins Socket.io room.
5. WebRTC negotiation begins.
6. Participant media appears.

### Journey 5 — Collaboration
Inside a meeting users can:
- Mute/unmute
- Camera on/off
- Leave
- Share screen
- Send chat messages
- Upload/share files
- Draw on whiteboard

## Functional requirements

### Authentication
- Register
- Login
- Logout
- Current-user endpoint
- Protected routes
- Password hashing
- Authentication errors

### Meetings
- Create
- Join
- Leave
- Participant list
- Meeting history
- Unique meeting IDs

### Video/audio
- Camera
- Microphone
- Multi-user
- Connection/disconnection handling
- Remote media rendering
- Permission errors

### Screen sharing
- Start
- Stop
- Notify participants
- Restore camera/video track after stopping where appropriate

### Chat
- Real-time messages
- Sender
- Timestamp
- Meeting-scoped history if persistence is enabled

### File sharing
- Upload
- Validate type/size
- Store metadata
- Share file link/event with meeting participants
- Download/access control

### Whiteboard
- Pencil
- Eraser
- Color
- Stroke width
- Clear
- Undo if feasible
- Real-time synchronization

## Non-functional requirements
- Responsive
- Accessible controls
- Secure
- Maintainable
- Error-tolerant
- Fast initial load
- Clear empty/loading/error states
