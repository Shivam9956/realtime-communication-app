const logger = require('../utils/logger');

/**
 * Handle WebRTC signaling events: offer, answer, ice-candidate
 */
const registerSignalingHandlers = (io, socket) => {
  // 1. Relay WebRTC Offer to specific target peer
  socket.on('webrtc-offer', ({ targetSocketId, offer, meetingId }) => {
    if (!targetSocketId || !offer) return;

    logger.socket(
      `Relaying WebRTC offer from [${socket.id}] to [${targetSocketId}] (Meeting: ${meetingId})`
    );

    io.to(targetSocketId).emit('webrtc-offer', {
      fromSocketId: socket.id,
      offer,
      user: socket.user || null,
      meetingId,
    });
  });

  // 2. Relay WebRTC Answer to specific target peer
  socket.on('webrtc-answer', ({ targetSocketId, answer, meetingId }) => {
    if (!targetSocketId || !answer) return;

    logger.socket(
      `Relaying WebRTC answer from [${socket.id}] to [${targetSocketId}] (Meeting: ${meetingId})`
    );

    io.to(targetSocketId).emit('webrtc-answer', {
      fromSocketId: socket.id,
      answer,
      user: socket.user || null,
      meetingId,
    });
  });

  // 3. Relay ICE Candidate to specific target peer
  socket.on('ice-candidate', ({ targetSocketId, candidate, meetingId }) => {
    if (!targetSocketId || !candidate) return;

    io.to(targetSocketId).emit('ice-candidate', {
      fromSocketId: socket.id,
      candidate,
      meetingId,
    });
  });
};

module.exports = {
  registerSignalingHandlers,
};
