const express = require('express');
const router = express.Router();
const healthRoutes = require('./healthRoutes');
const authRoutes = require('./authRoutes');
const meetingRoutes = require('./meetingRoutes');
const chatRoutes = require('./chatRoutes');
const fileRoutes = require('./fileRoutes');

// Mount sub-routes
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/meetings', meetingRoutes);
router.use('/chat', chatRoutes);
router.use('/files', fileRoutes);

// API root status
router.get('/', (req, res) => {
  res.json({
    name: 'Real-Time Communication & Collaboration API',
    version: '1.0.0',
    phase: 'Production Collaboration Suite',
    status: 'online',
    endpoints: {
      health: '/api/health',
      ping: '/api/health/ping',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        logout: 'POST /api/auth/logout',
        me: 'GET /api/auth/me',
      },
      meetings: {
        create: 'POST /api/meetings',
        history: 'GET /api/meetings/history',
        getById: 'GET /api/meetings/:meetingId',
        join: 'POST /api/meetings/:meetingId/join',
        leave: 'POST /api/meetings/:meetingId/leave',
      },
      chat: {
        history: 'GET /api/chat/meeting/:meetingId',
      },
      files: {
        upload: 'POST /api/files',
        list: 'GET /api/files/meeting/:meetingId',
        delete: 'DELETE /api/files/:fileId',
      },
    },
  });
});

module.exports = router;
