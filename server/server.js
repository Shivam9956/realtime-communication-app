const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const env = require('./config/env');
const { connectDB } = require('./config/db');
const { initSocket } = require('./socket');
const routes = require('./routes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const app = express();
const server = http.createServer(app);

// 1. Security & Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(cors({
  origin: (origin, callback) => {
    // Allow all origins (Vercel, custom domains, local, mobile, curl)
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// 2. Static uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 3. Root & API Routes
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'OmniSync Real-Time Communication API Server is running smoothly! 🚀',
    status: 'online',
    healthCheck: '/api/health',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api', routes);

// 4. Fallback and Error Handling
app.use(notFound);
app.use(errorHandler);

// 5. Initialize Socket.io
initSocket(server);

// 6. Connect DB and start HTTP server
const startServer = async () => {
  await connectDB();

  server.listen(env.PORT, () => {
    logger.success(`🚀 Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
    logger.info(`👉 REST API Base: http://localhost:${env.PORT}/api`);
    logger.info(`👉 Health Check: http://localhost:${env.PORT}/api/health`);
  });
};

// Graceful Shutdown
const handleShutdown = (signal) => {
  logger.warn(`Received ${signal}. Gracefully closing HTTP and Socket server...`);
  server.close(() => {
    logger.info('HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGINT', () => handleShutdown('SIGINT'));
if (require.main === module) {
  startServer();
}

module.exports = { app, server, startServer };
