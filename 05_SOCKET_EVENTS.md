# Socket.io Event Contract

All events should be meeting-scoped and validated server-side.

## Connection

### client -> server
`join-meeting`
```json
{
  "meetingId": "ABC123"
}
```

### server -> client
`participant-joined`

`participant-left`

`participants-state`

## WebRTC signaling

### client -> server
`webrtc-offer`
```json
{
  "targetSocketId": "...",
  "offer": {}
}
```

`webrtc-answer`

`ice-candidate`

### server -> client
Route signaling events only to the intended participant/socket.

## Chat

### client -> server
`chat-message`
```json
{
  "meetingId": "ABC123",
  "message": "Hello"
}
```

### server -> client
`chat-message`

## Screen sharing
`screen-share-started`
`screen-share-stopped`

## Whiteboard
`whiteboard-draw`
`whiteboard-erase`
`whiteboard-clear`
`whiteboard-undo`

Do not trust client-provided user IDs. Derive identity from authenticated socket/session data.

## Disconnect
On disconnect:
- Remove participant from presence state.
- Notify room.
- Clean up server-side temporary state.
