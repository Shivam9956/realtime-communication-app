const logger = require('../utils/logger');

// In-memory whiteboard stroke cache per room
// Map<meetingId, Array<strokeObject>>
const roomWhiteboards = new Map();

/**
 * Handle real-time collaborative whiteboard drawing, erasing, clearing, undoing
 */
const registerWhiteboardHandlers = (io, socket) => {
  /**
   * Request initial snapshot of current canvas strokes
   */
  socket.on('get-whiteboard-snapshot', ({ meetingId }) => {
    if (!meetingId) return;
    const cleanMeetingId = meetingId.trim().toLowerCase();
    const strokes = roomWhiteboards.get(cleanMeetingId) || [];

    socket.emit('whiteboard-snapshot', {
      meetingId: cleanMeetingId,
      strokes,
    });
  });

  /**
   * New stroke drawn
   */
  socket.on('whiteboard-draw', ({ meetingId, stroke }) => {
    if (!meetingId || !stroke) return;
    const cleanMeetingId = meetingId.trim().toLowerCase();

    if (!roomWhiteboards.has(cleanMeetingId)) {
      roomWhiteboards.set(cleanMeetingId, []);
    }

    const strokes = roomWhiteboards.get(cleanMeetingId);
    // Limit strokes to 2000 per room to keep memory footprint light
    if (strokes.length > 2000) {
      strokes.shift();
    }
    strokes.push(stroke);

    // Relay to other participants in the room
    socket.to(cleanMeetingId).emit('whiteboard-draw', {
      meetingId: cleanMeetingId,
      stroke,
    });
  });

  /**
   * Clear canvas
   */
  socket.on('whiteboard-clear', ({ meetingId }) => {
    if (!meetingId) return;
    const cleanMeetingId = meetingId.trim().toLowerCase();
    roomWhiteboards.set(cleanMeetingId, []);

    // Broadcast clear to EVERYONE in the room
    io.to(cleanMeetingId).emit('whiteboard-clear', {
      meetingId: cleanMeetingId,
    });

    logger.socket(`Whiteboard cleared in room [${cleanMeetingId}]`);
  });

  /**
   * Undo last stroke
   */
  socket.on('whiteboard-undo', ({ meetingId }) => {
    if (!meetingId) return;
    const cleanMeetingId = meetingId.trim().toLowerCase();

    if (roomWhiteboards.has(cleanMeetingId)) {
      const strokes = roomWhiteboards.get(cleanMeetingId);
      strokes.pop();

      io.to(cleanMeetingId).emit('whiteboard-undo', {
        meetingId: cleanMeetingId,
        strokes,
      });
    }
  });
};

module.exports = {
  registerWhiteboardHandlers,
};
