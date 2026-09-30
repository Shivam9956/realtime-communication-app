# Collaborative Whiteboard

## Technology
Use HTML Canvas API.

## Required tools
- Pencil
- Eraser
- Color
- Stroke width
- Clear
- Undo if feasible

## Local drawing
Capture pointer events:
- pointerdown
- pointermove
- pointerup

Use pointer events instead of mouse-only events so touch devices can work.

## Real-time synchronization
Send compact drawing operations through Socket.io.

Example:
```json
{
  "type": "stroke",
  "points": [
    {"x": 10, "y": 20},
    {"x": 12, "y": 23}
  ],
  "color": "#111111",
  "width": 3
}
```

## Coordinate handling
Store normalized coordinates when possible so the drawing can scale between different canvas sizes.

## Performance
Do not send a separate Socket.io event for every raw pointer event without throttling/batching.

Use:
- throttling
- batching
- compact payloads

## Persistence
Optional:
- Periodically save a snapshot.
- Restore snapshot when a participant joins.

Do not write every stroke directly to MongoDB.
