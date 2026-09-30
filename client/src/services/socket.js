/**
 * Socket.io client service for OmniSync
 * Manages WebSocket connection, authentication handshake, reconnects, and event subscription
 */
import { io } from 'socket.io-client';

const getSocketUrl = () => {
  if (typeof window !== 'undefined' && window.location.hostname && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return `${window.location.protocol}//${window.location.hostname}:5000`;
  }
  return import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
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
