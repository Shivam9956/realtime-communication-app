const path = require('path');
const fs = require('fs');
const FileModel = require('../models/File');
const Meeting = require('../models/Meeting');
const logger = require('../utils/logger');
const env = require('../config/env');

/**
 * @desc    Upload a file to a meeting session
 * @route   POST /api/files
 * @access  Private
 */
const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded or file format rejected.',
      });
    }

    const { meetingId } = req.body;
    if (!meetingId) {
      // Clean up uploaded file if meetingId missing
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Meeting ID is required for file uploads.',
      });
    }

    const user = req.user;
    const cleanMeetingId = meetingId.trim().toLowerCase();

    // Verify meeting exists
    const meeting = await Meeting.findOne({ meetingId: cleanMeetingId });
    if (!meeting) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: 'Target meeting room does not exist.',
      });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    const newFile = await FileModel.create({
      meetingId: cleanMeetingId,
      uploader: user._id,
      uploaderName: user.name,
      originalName: req.file.originalname,
      fileName: req.file.filename,
      mimeType: req.file.mimetype,
      size: req.file.size,
      filePath: req.file.path,
      url: fileUrl,
    });

    logger.info(`File uploaded: [${req.file.originalname}] in meeting [${cleanMeetingId}] by [${user.email}]`);

    return res.status(201).json({
      success: true,
      message: 'File uploaded successfully.',
      file: newFile.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all files shared in a meeting
 * @route   GET /api/files/meeting/:meetingId
 * @access  Private
 */
const getMeetingFiles = async (req, res, next) => {
  try {
    const rawId = req.params.meetingId?.trim().toLowerCase();
    const files = await FileModel.find({ meetingId: rawId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: files.length,
      files: files.map((f) => f.toJSON()),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a shared file
 * @route   DELETE /api/files/:fileId
 * @access  Private
 */
const deleteFile = async (req, res, next) => {
  try {
    const file = await FileModel.findById(req.params.fileId);
    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found.',
      });
    }

    // Only uploader or meeting host can delete
    const isUploader = file.uploader.toString() === req.user._id.toString();
    const meeting = await Meeting.findOne({ meetingId: file.meetingId });
    const isHost = meeting && meeting.host.toString() === req.user._id.toString();

    if (!isUploader && !isHost) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this file.',
      });
    }

    // Delete from disk
    if (fs.existsSync(file.filePath)) {
      fs.unlinkSync(file.filePath);
    }

    await FileModel.findByIdAndDelete(file._id);

    return res.status(200).json({
      success: true,
      message: 'File deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadFile,
  getMeetingFiles,
  deleteFile,
};
