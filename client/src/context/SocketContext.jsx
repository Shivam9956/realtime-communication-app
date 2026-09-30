import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getSocket, connectSocket, disconnectSocket } from '../services/socket';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [socketId, setSocketId] = useState(null);
  const { token, user } = useAuth();

  useEffect(() => {
    const s = getSocket();
    setSocket(s);

    const onConnect = () => {
      setIsConnected(true);
      setSocketId(s.id);
    };

    const onDisconnect = () => {
      setIsConnected(false);
      setSocketId(null);
    };

    s.on('connect', onConnect);
    s.on('disconnect', onDisconnect);

    // Connect socket when user is active or token is set
    s.connect();

    return () => {
      s.off('connect', onConnect);
      s.off('disconnect', onDisconnect);
    };
  }, [token]);

  /**
   * Helper: Join real-time meeting room
   */
  const joinMeetingRoom = useCallback((meetingId) => {
    if (!socket || !meetingId) return;
    socket.emit('join-meeting', {
      meetingId,
      user: user
        ? {
            id: user.id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
          }
        : undefined,
    });
  }, [socket, user]);

  /**
   * Helper: Leave real-time meeting room
   */
  const leaveMeetingRoom = useCallback((meetingId) => {
    if (!socket || !meetingId) return;
    socket.emit('leave-meeting', { meetingId });
  }, [socket]);

  /**
   * Helper: Broadcast user mic/cam/screen state
   */
  const broadcastMediaState = useCallback((meetingId, state) => {
    if (!socket || !meetingId) return;
    socket.emit('participant-state-update', {
      meetingId,
      ...state,
    });
  }, [socket]);

  const value = {
    socket,
    isConnected,
    socketId,
    joinMeetingRoom,
    leaveMeetingRoom,
    broadcastMediaState,
    connect: connectSocket,
    disconnect: disconnectSocket,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export default SocketContext;
