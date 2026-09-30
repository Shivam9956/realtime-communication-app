const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/meeting/:meetingId', chatController.getMeetingMessages);

module.exports = router;
