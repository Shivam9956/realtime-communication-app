# System Architecture

## High-level architecture

```text
React Client
   |
   | HTTPS REST API
   v
Node.js + Express
   |
   +---- MongoDB
   |
   +---- Authentication
   |
   +---- File Storage
   |
   +---- Socket.io
             |
             +---- Signaling
             +---- Chat
             +---- Presence
             +---- Whiteboard events

React Client <---- WebRTC ----> Other Participants
                 |
                 +---- STUN/TURN
```

## Responsibilities

### React
- UI
- Routing
- Meeting state
- Media device controls
- WebRTC client logic
- Socket.io client
- Whiteboard rendering

### Express
- Authentication
- Users
- Meetings
- File APIs
- Validation
- Authorization
- Error handling

### Socket.io
- Join/leave room
- Presence
- WebRTC signaling
- Chat
- Whiteboard synchronization
- Screen-share state events

### WebRTC
Use peer connections for:
- Audio
- Video
- Screen-sharing media

Do not send the actual video stream through Socket.io.

## Recommended server modules
```text
server/
  config/
  controllers/
  middleware/
  models/
  routes/
  services/
  socket/
  utils/
  uploads/
  server.js
```

## Recommended client modules
```text
client/src/
  components/
  pages/
  hooks/
  context/
  services/
  utils/
  styles/
  App.jsx
  main.jsx
```

## Scaling note
The first implementation may use peer-to-peer WebRTC mesh for learning and small meetings. For larger production meetings, keep the media layer replaceable so an SFU such as LiveKit, mediasoup, or Janus can be introduced later.
