const { getConnectionStatus } = require('../config/db');
const env = require('../config/env');

/**
 * @desc   Get system and service health status
 * @route  GET /api/health
 * @access Public
 */
const getHealth = (req, res) => {
  const dbStatus = getConnectionStatus();
  const uptimeSeconds = Math.floor(process.uptime());
  const memoryUsage = process.memoryUsage();

  const isHealthy = dbStatus === 'connected' || dbStatus === 'connecting';

  res.status(isHealthy ? 200 : 200).json({
    status: isHealthy ? 'ok' : 'degraded',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: `${uptimeSeconds}s`,
    environment: env.NODE_ENV,
    services: {
      server: 'healthy',
      database: dbStatus,
      socket: 'ready',
    },
    system: {
      nodeVersion: process.version,
      platform: process.platform,
      memory: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
      }
    }
  });
};

/**
 * @desc   Simple ping endpoint
 * @route  GET /api/health/ping
 * @access Public
 */
const ping = (req, res) => {
  res.status(200).json({
    pong: true,
    time: new Date().toISOString(),
  });
};

module.exports = {
  getHealth,
  ping,
};
