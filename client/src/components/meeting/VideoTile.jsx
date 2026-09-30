import React, { useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, User as UserIcon, MonitorUp } from 'lucide-react';
import Badge from '../common/Badge';

export const VideoTile = ({
  stream,
  name,
  avatar,
  isLocal = false,
  isHost = false,
  isMuted = false,
  isVideoOff = false,
  isScreenSharing = false,
  isActiveSpeaker = false,
}) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream || null;
    }
  }, [stream]);

  const hasVideoTrack = stream && stream.getVideoTracks().length > 0 && !isVideoOff;

  return (
    <div
      className={`participant-tile ${isActiveSpeaker ? 'active-speaker' : ''} ${isLocal ? 'local-user' : ''}`}
      style={{ position: 'relative', width: '100%', height: '100%', minHeight: 220 }}
    >
      {/* Real Video Track Stream */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal} // Always mute local video playback to prevent echo
        style={{
          width: '100%',
          height: '100%',
          objectFit: isScreenSharing ? 'contain' : 'cover',
          display: hasVideoTrack ? 'block' : 'none',
          transform: isLocal && !isScreenSharing ? 'scaleX(-1)' : 'none', // Mirror local camera feed
        }}
      />

      {/* Avatar Placeholder when video track is off or stream not yet loaded */}
      {!hasVideoTrack && (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0d121f',
          }}
        >
          <div className="avatar-placeholder" style={{ opacity: 0.9 }}>
            {avatar ? (
              <img
                src={avatar}
                alt={name}
                style={{ width: '100%', height: '100%', borderRadius: '50%' }}
              />
            ) : (
              (name || 'User').substring(0, 2).toUpperCase()
            )}
          </div>
          <span style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {isVideoOff ? 'Camera Off' : isLocal ? 'Local Media' : 'Connecting Media...'}
          </span>
        </div>
      )}

      {/* Overlays & Badges */}
      <div className="participant-overlay">
        <div className="participant-name-badge">
          <span>{name} {isLocal && '(You)'}</span>
          {isHost && (
            <Badge variant="primary" style={{ padding: '0.1rem 0.4rem', fontSize: '0.65rem' }}>
              Host
            </Badge>
          )}
          {isScreenSharing && (
            <Badge variant="cyan" style={{ padding: '0.1rem 0.4rem', fontSize: '0.65rem' }}>
              <MonitorUp size={10} style={{ marginRight: 2 }} /> Screen
            </Badge>
          )}
        </div>

        <div className="participant-tile-status">
          {isMuted ? (
            <span
              style={{
                background: 'rgba(244, 63, 94, 0.85)',
                padding: '0.25rem 0.45rem',
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <MicOff size={13} color="#fff" />
            </span>
          ) : (
            <span
              style={{
                background: 'rgba(16, 185, 129, 0.85)',
                padding: '0.25rem 0.45rem',
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Volume2 size={13} color="#fff" />
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoTile;
