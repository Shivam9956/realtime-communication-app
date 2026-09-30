# Antigravity Coding Agent Rules

## Mission
Act as a senior full-stack engineer and build the project described in the documentation in small, verifiable phases.

## Before coding
1. Read all `.md` files in this project.
2. Inspect the existing repository.
3. Do not overwrite working code unnecessarily.
4. Identify missing dependencies and architecture gaps.
5. Create a short implementation plan before each major phase.

## Coding behavior
- Prefer simple, maintainable code.
- Do not create giant files.
- Reuse components.
- Keep server and client responsibilities separate.
- Use async/await consistently.
- Handle errors explicitly.
- Add loading and empty states.
- Add useful comments only for non-obvious logic.

## WebRTC rules
- Never transmit media through Socket.io.
- Use Socket.io only for signaling and real-time metadata.
- Clean up RTCPeerConnection instances.
- Clean up MediaStream tracks.
- Handle `onicecandidate`, `ontrack`, connection state changes, and negotiation carefully.
- Handle users joining and leaving dynamically.
- Avoid duplicate socket listeners.

## Socket.io rules
- Remove listeners on component unmount.
- Validate meeting membership.
- Do not trust client-provided identity.
- Keep event names documented in `06_SOCKET_EVENTS.md`.

## Security rules
- Never expose secrets.
- Never store plaintext passwords.
- Validate server-side.
- Protect all private resources.
- Restrict CORS.
- Validate uploads.
- Do not use dangerous dynamic HTML rendering.

## UI rules
- Responsive first.
- Accessible buttons.
- Clear meeting controls.
- Do not copy another company's UI exactly.
- Keep the meeting screen usable even when chat/files/whiteboard panels are open.

## Git rules
Make small commits where possible:
```text
feat: add authentication
feat: add meeting creation
feat: add websocket signaling
feat: add one-to-one WebRTC
feat: add screen sharing
feat: add collaborative whiteboard
fix: cleanup peer connections
```

## Completion rule
After each major phase:
1. Run the project.
2. Run available tests.
3. Fix errors.
4. Update documentation.
5. Mark completed tasks in `14_IMPLEMENTATION_TASKS.md`.
6. Only then proceed to the next phase.

## Do not
- Do not fake WebRTC functionality.
- Do not use mock video streams as a substitute for real WebRTC.
- Do not declare deployment-ready without testing.
- Do not remove security checks to make a feature work.
- Do not put all functionality into one file.
