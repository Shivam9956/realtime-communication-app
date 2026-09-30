const Message = require('../models/Message');
const logger = require('../utils/logger');

/**
 * Handle real-time chat messages and typing indicators
 */
const registerChatHandlers = (io, socket) => {
  socket.on('send-chat-message', async ({ meetingId, text }) => {
    if (!meetingId || !text || !text.trim()) return;

    const cleanMeetingId = meetingId.trim().toLowerCase();
    const user = socket.user || {
      id: socket.id,
      name: 'Guest User',
      avatar: '',
    };

    try {
      // Save message to database
      const newMessage = await Message.create({
        meetingId: cleanMeetingId,
        sender: user.id || socket.id,
        senderName: user.name || 'User',
        senderAvatar: user.avatar || '',
        text: text.trim(),
      });

      const messagePayload = newMessage.toJSON();

      // Broadcast to EVERYONE in the meeting room including sender
      io.to(cleanMeetingId).emit('new-chat-message', {
        meetingId: cleanMeetingId,
        message: messagePayload,
      });

      logger.socket(`Chat message in [${cleanMeetingId}] by [${user.name}]`);
    } catch (err) {
      logger.error(`Failed to persist chat message: ${err.message}`);
    }
  });

  socket.on('user-typing', ({ meetingId, isTyping }) => {
    if (!meetingId) return;
    const cleanMeetingId = meetingId.trim().toLowerCase();

    socket.to(cleanMeetingId).emit('peer-typing', {
      socketId: socket.id,
      userId: socket.user?.id,
      userName: socket.user?.name,
      isTyping,
    });
  });
};

module.exports = {
  registerChatHandlers,
};
