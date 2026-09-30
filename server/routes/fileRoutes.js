const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// All file endpoints require authentication
router.use(protect);

router.post('/', upload.single('file'), fileController.uploadFile);
router.get('/meeting/:meetingId', fileController.getMeetingFiles);
router.delete('/:fileId', fileController.deleteFile);

module.exports = router;
