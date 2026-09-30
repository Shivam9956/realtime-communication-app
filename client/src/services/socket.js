/**
 * Socket.io client service for OmniSync
 * Manages WebSocket connection, authentication handshake, reconnects, and event subscription
 */
import { io } from 'socket.io-client';

const getSocketUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }
  if (typeof window !== 'undefined' && window.location.hostname) {
    const host = window.location.hostname;
    const isLocalIP = /^(\d{1,3}\.){3}\d{1,3}$/.test(host);
    if (isLocalIP) {
      return `http://${host}:5000`;
    }
  }
  return 'http://localhost:5000';
};

let socket = null;

export const getSocket = () => {
  if (!socket) {
    const token = localStorage.getItem('omnisync_token');
    const socketUrl = getSocketUrl();

    socket = io(socketUrl, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling'],
      auth: (cb) => {
        const currentToken = localStorage.getItem('omnisync_token');
        cb({ token: currentToken });
      },
    });

    socket.on('connect', () => {
      console.log(`[Socket.io] Connected successfully: [${socket.id}]`);
    });

    socket.on('disconnect', (reason) => {
      console.log(`[Socket.io] Disconnected: ${reason}`);
    });

    socket.on('connect_error', (error) => {
      console.warn(`[Socket.io] Connection error:`, error.message);
    });
  }

  return socket;
};

export const connectSocket = () => {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
  }
  return s;
};

export const disconnectSocket = () => {
  if (socket && socket.connected) {
    socket.disconnect();
  }
};

export default {
  getSocket,
  connectSocket,
  disconnectSocket,
};
