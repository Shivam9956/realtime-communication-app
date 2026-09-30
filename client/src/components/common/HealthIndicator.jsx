import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { Activity } from 'lucide-react';

export const HealthIndicator = ({ showDetails = false }) => {
  const [health, setHealth] = useState(null);
  const [status, setStatus] = useState('loading'); // 'online' | 'offline' | 'loading'
  const { isConnected: socketConnected } = useSocket();

  const fetchHealth = async () => {
    try {
      const data = await api.getHealth();
      setHealth(data);
      setStatus(data?.status === 'ok' ? 'online' : 'online');
    } catch (err) {
      console.warn('Backend health check error:', err.message);
      setStatus('offline');
      setHealth(null);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="health-pill" title={status === 'online' ? 'Backend services operational' : 'Backend unavailable'}>
      <span className={`status-dot ${status}`} />
      <span style={{ fontWeight: 500 }}>
        {status === 'online' ? 'Backend Live' : status === 'offline' ? 'Offline' : 'Connecting...'}
      </span>
      {socketConnected && (
        <span style={{ fontSize: '0.75rem', color: 'var(--cyan)', borderLeft: '1px solid var(--border-medium)', paddingLeft: '0.5rem' }}>
          WS Ready
        </span>
      )}
    </div>
  );
};

export default HealthIndicator;
