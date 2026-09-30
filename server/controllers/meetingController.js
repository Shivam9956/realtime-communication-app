const Meeting = require('../models/Meeting');
const { generateMeetingId } = require('../utils/generateMeetingId');
const env = require('../config/env');
const logger = require('../utils/logger');

/**
 * @desc    Create a new meeting session
 * @route   POST /api/meetings
 * @access  Private
 */
const createMeeting = async (req, res, next) => {
  try {
    const { title, customMeetingId, settings } = req.body || {};
    const user = req.user;

    // Generate or sanitize meetingId
    let meetingId = customMeetingId
      ? customMeetingId.trim().toLowerCase().replace(/[^a-z0-9-]/g, '')
      : generateMeetingId('meet');

    // Ensure uniqueness
    let existing = await Meeting.findOne({ meetingId });
    while (existing) {
      meetingId = generateMeetingId('meet');
      existing = await Meeting.findOne({ meetingId });
    }

    // Initialize meeting with host as first participant
    const meeting = await Meeting.create({
      meetingId,
      title: title?.trim() || `${user.name}'s Collaboration Room`,
      host: user._id,
      status: 'active',
      startedAt: new Date(),
      settings: settings || {},
      participants: [
        {
          user: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: 'host',
          isActive: true,
          joinedAt: new Date(),
        },
      ],
    });

    const populatedMeeting = await Meeting.findById(meeting._id).populate(
      'host',
      'name email avatar'
    );

    const clientUrl = env.CLIENT_URL || 'http://localhost:5174';
    const meetingLink = `${clientUrl}/room/${meeting.meetingId}`;

    logger.info(`Meeting created: ${meeting.meetingId} by ${user.email}`);

    return res.status(201).json({
      success: true,
      message: 'Meeting room created successfully.',
      meeting: populatedMeeting.toJSON(),
      meetingLink,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get meeting details by meetingId
 * @route   GET /api/meetings/:meetingId
 * @access  Private
 */
const getMeetingById = async (req, res, next) => {
  try {
    const rawId = req.params.meetingId?.trim().toLowerCase();

    const meeting = await Meeting.findOne({ meetingId: rawId }).populate(
      'host',
      'name email avatar'
    );

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting room not found or has expired.',
      });
    }

    return res.status(200).json({
      success: true,
      meeting: meeting.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Join an existing meeting
 * @route   POST /api/meetings/:meetingId/join
 * @access  Private
 */
const joinMeeting = async (req, res, next) => {
  try {
    const rawId = req.params.meetingId?.trim().toLowerCase();
    const user = req.user;

    let meeting = await Meeting.findOne({ meetingId: rawId });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting room not found. Please check the meeting code.',
      });
    }

    // Check if participant already exists in meeting
    const participantIndex = meeting.participants.findIndex(
      (p) => p.user.toString() === user._id.toString()
    );

    const isHost = meeting.host.toString() === user._id.toString();

    if (participantIndex >= 0) {
      // Re-activate existing participant
      meeting.participants[participantIndex].isActive = true;
      meeting.participants[participantIndex].joinedAt = new Date();
      meeting.participants[participantIndex].leftAt = null;
      meeting.participants[participantIndex].name = user.name;
      meeting.participants[participantIndex].avatar = user.avatar;
    } else {
      // Add new participant
      meeting.participants.push({
        user: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: isHost ? 'host' : 'participant',
        isActive: true,
        joinedAt: new Date(),
      });
    }

    // If host re-joins and meeting was marked ended, restore to active
    if (isHost && meeting.status === 'ended') {
      meeting.status = 'active';
      meeting.endedAt = null;
    }

    await meeting.save();

    const populatedMeeting = await Meeting.findById(meeting._id).populate(
      'host',
      'name email avatar'
    );

    const currentParticipant = populatedMeeting.participants.find(
      (p) => p.user.toString() === user._id.toString()
    );

    logger.info(`User ${user.email} joined meeting: ${meeting.meetingId}`);

    return res.status(200).json({
      success: true,
      message: 'Joined meeting room successfully.',
      meeting: populatedMeeting.toJSON(),
      participant: currentParticipant,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Leave a meeting session
 * @route   POST /api/meetings/:meetingId/leave
 * @access  Private
 */
const leaveMeeting = async (req, res, next) => {
  try {
    const rawId = req.params.meetingId?.trim().toLowerCase();
    const user = req.user;

    const meeting = await Meeting.findOne({ meetingId: rawId });

    if (meeting) {
      const participant = meeting.participants.find(
        (p) => p.user.toString() === user._id.toString()
      );

      if (participant) {
        participant.isActive = false;
        participant.leftAt = new Date();
      }

      await meeting.save();
      logger.info(`User ${user.email} left meeting: ${meeting.meetingId}`);
    }

    return res.status(200).json({
      success: true,
      message: 'Left meeting room successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user meeting history
 * @route   GET /api/meetings/history
 * @access  Private
 */
const getMeetingHistory = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Find meetings where user is host or participant
    const meetings = await Meeting.find({
      $or: [{ host: userId }, { 'participants.user': userId }],
    })
      .populate('host', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(30);

    const formattedMeetings = meetings.map((m) => {
      const isHost = m.host?._id?.toString() === userId.toString();
      const activeCount = m.participants.filter((p) => p.isActive).length;
      const totalParticipants = m.participants.length;

      return {
        id: m.meetingId,
        _id: m._id,
        meetingId: m.meetingId,
        title: m.title,
        status: m.status,
        isHost,
        host: m.host,
        activeParticipants: activeCount,
        participantsCount: totalParticipants,
        startedAt: m.startedAt,
        createdAt: m.createdAt,
      };
    });

    return res.status(200).json({
      success: true,
      count: formattedMeetings.length,
      meetings: formattedMeetings,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createMeeting,
  getMeetingById,
  joinMeeting,
  leaveMeeting,
  getMeetingHistory,
};
