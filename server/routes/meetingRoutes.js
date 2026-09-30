const express = require('express');
const router = express.Router();
const meetingController = require('../controllers/meetingController');
const { protect } = require('../middleware/auth');

// All meeting routes require authentication
router.use(protect);

router.post('/', meetingController.createMeeting);
router.get('/history', meetingController.getMeetingHistory);
router.get('/:meetingId', meetingController.getMeetingById);
router.post('/:meetingId/join', meetingController.joinMeeting);
router.post('/:meetingId/leave', meetingController.leaveMeeting);

module.exports = router;
