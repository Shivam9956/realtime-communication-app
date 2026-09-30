const Message = require('../models/Message');

/**
 * @desc    Get chat message history for a meeting
 * @route   GET /api/chat/meeting/:meetingId
 * @access  Private
 */
const getMeetingMessages = async (req, res, next) => {
  try {
    const rawId = req.params.meetingId?.trim().toLowerCase();
    const messages = await Message.find({ meetingId: rawId })
      .sort({ createdAt: 1 })
      .limit(100);

    return res.status(200).json({
      success: true,
      count: messages.length,
      messages: messages.map((m) => m.toJSON()),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMeetingMessages,
};
