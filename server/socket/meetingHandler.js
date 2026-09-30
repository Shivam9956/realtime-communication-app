const logger = require('../utils/logger');
const presenceManager = require('./presenceManager');

/**
 * Handle meeting presence events: join-meeting, leave-meeting, state updates, disconnect
 */
const registerMeetingHandlers = (io, socket) => {
  /**
   * Client requests to join a real-time meeting room
   */
  socket.on('join-meeting', ({ meetingId, user: clientUserData }) => {
    if (!meetingId) {
      logger.warn(`Socket [${socket.id}] tried to join meeting without meetingId`);
      return;
    }

    const cleanMeetingId = meetingId.trim().toLowerCase();
    const user = socket.user || clientUserData || {
      id: socket.id,
      name: 'Guest User',
      email: '',
      avatar: '',
    };

    // 1. Join Socket.io room channel
    socket.join(cleanMeetingId);

    // 2. Add to presence manager
    const participant = presenceManager.addParticipant(
      cleanMeetingId,
      socket.id,
      user
    );

    logger.socket(
      `Participant [${user.name || socket.id}] joined room: ${cleanMeetingId}`
    );

    // 3. Send the full current room presence state to the newly joined peer
    const allParticipants = presenceManager.getParticipants(cleanMeetingId);
    socket.emit('participants-state', {
      meetingId: cleanMeetingId,
      participants: allParticipants,
    });

    // 4. Broadcast to all OTHER peers in the room that a new participant arrived
    socket.to(cleanMeetingId).emit('participant-joined', {
      meetingId: cleanMeetingId,
      participant,
    });
  });

  /**
   * Client voluntarily leaves the meeting room
   */
  socket.on('leave-meeting', ({ meetingId }) => {
    if (!meetingId) return;
    const cleanMeetingId = meetingId.trim().toLowerCase();

    const participant = presenceManager.removeParticipant(
      cleanMeetingId,
      socket.id
    );

    socket.leave(cleanMeetingId);

    if (participant) {
      logger.socket(
        `Participant [${participant.name}] left room: ${cleanMeetingId}`
      );

      socket.to(cleanMeetingId).emit('participant-left', {
        meetingId: cleanMeetingId,
        socketId: socket.id,
        userId: participant.userId,
      });
    }
  });

  /**
   * Participant mic/camera/screenshare state changed
   */
  socket.on('participant-state-update', ({ meetingId, isMuted, isVideoOff, isScreenSharing }) => {
    if (!meetingId) return;
    const cleanMeetingId = meetingId.trim().toLowerCase();

    socket.to(cleanMeetingId).emit('participant-state-changed', {
      socketId: socket.id,
      userId: socket.user?.id,
      isMuted,
      isVideoOff,
      isScreenSharing,
    });
  });

  /**
   * Socket disconnect cleanup
   */
  socket.on('disconnect', (reason) => {
    logger.socket(`Socket disconnected: [${socket.id}] (Reason: ${reason})`);

    const affectedRooms = presenceManager.handleDisconnect(socket.id);

    for (const { meetingId, participant } of affectedRooms) {
      if (participant) {
        logger.socket(
          `Presence cleanup: removed [${participant.name}] from [${meetingId}]`
        );

        socket.to(meetingId).emit('participant-left', {
          meetingId,
          socketId: socket.id,
          userId: participant.userId,
        });
      }
    }
  });
};

module.exports = {
  registerMeetingHandlers,
};
