const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const env = require('../config/env');
const User = require('../models/User');
const { registerMeetingHandlers } = require('./meetingHandler');
const { registerSignalingHandlers } = require('./signalingHandler');
const { registerChatHandlers } = require('./chatHandler');
const { registerWhiteboardHandlers } = require('./whiteboardHandler');

let io = null;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: true,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Socket Authentication Middleware
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(' ')[1] ||
        socket.handshake.query?.token;

      if (token) {
        try {
          const decoded = jwt.verify(token, env.JWT_SECRET);
          socket.user = {
            id: decoded.id,
            name: decoded.name,
            email: decoded.email,
          };

          // Fetch fresh avatar if possible
          const userDoc = await User.findById(decoded.id).select('avatar');
          if (userDoc) {
            socket.user.avatar = userDoc.avatar;
          }
        } catch (jwtErr) {
          logger.warn(`Socket JWT verify failed for [${socket.id}]: ${jwtErr.message}`);
        }
      }

      next();
    } catch (err) {
      next(err);
    }
  });

  io.on('connection', (socket) => {
    const userLabel = socket.user?.name ? `${socket.user.name} (${socket.user.email})` : 'Anonymous';
    logger.socket(`Client connected: [${socket.id}] - ${userLabel}`);

    // Ping / Diagnostic
    socket.on('ping', (callback) => {
      if (typeof callback === 'function') {
        callback({ status: 'ok', serverTime: new Date().toISOString() });
      }
    });

    // Register handlers
    registerMeetingHandlers(io, socket);
    registerSignalingHandlers(io, socket);
    registerChatHandlers(io, socket);
    registerWhiteboardHandlers(io, socket);
  });

  logger.success('Socket.io server initialized with Signaling, Chat & Whiteboard Handlers');
  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized yet');
  }
  return io;
};

module.exports = {
  initSocket,
  getIO,
};
