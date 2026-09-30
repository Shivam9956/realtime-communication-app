import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  MonitorUp,
  MessageSquare,
  PenTool,
  Share2,
  PhoneOff,
  Users,
  Copy,
  Check,
  Volume2,
  X,
  Sparkles,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Radio,
  Maximize2,
} from 'lucide-react';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import Card from '../components/common/Card';
import VideoTile from '../components/meeting/VideoTile';
import ChatPanel from '../components/chat/ChatPanel';
import FileSharingPanel from '../components/files/FileSharingPanel';
import Whiteboard from '../components/whiteboard/Whiteboard';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import useWebRTC from '../hooks/useWebRTC';
import api from '../services/api';

export const MeetingRoomPage = () => {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, isConnected: isSocketConnected, joinMeetingRoom, leaveMeetingRoom, broadcastMediaState } = useSocket();

  // Meeting metadata from API
  const [meeting, setMeeting] = useState(null);
  const [isLoadingMeeting, setIsLoadingMeeting] = useState(true);
  const [meetingError, setMeetingError] = useState(null);

  // Active online peers from Socket.io presence
  const [onlinePeers, setOnlinePeers] = useState([]);

  // Panel state: 'participants' | 'chat' | 'files' | 'whiteboard' | null
  const [activePanel, setActivePanel] = useState(null);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // WebRTC Hook
  const {
    localStream,
    remoteStreams,
    isAudioEnabled,
    isVideoEnabled,
    isScreenSharing,
    mediaError,
    startLocalMedia,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    cleanupMedia,
  } = useWebRTC(meetingId, user);

  // 1. Initialize meeting details & start local camera stream
  useEffect(() => {
    let isMounted = true;

    const initMeeting = async () => {
      setIsLoadingMeeting(true);
      setMeetingError(null);
      try {
        const cleanId = meetingId?.trim().toLowerCase();
        
        // Register join in MongoDB
        const joinResponse = await api.meetings.join(cleanId);
        
        if (isMounted && joinResponse?.meeting) {
          setMeeting(joinResponse.meeting);
        }

        // Initialize local camera and audio
        await startLocalMedia();
      } catch (err) {
        console.error('Failed to load meeting room:', err);
        if (isMounted) {
          setMeetingError(err.message || 'Meeting room not found or access denied.');
        }
      } finally {
        if (isMounted) {
          setIsLoadingMeeting(false);
        }
      }
    };

    initMeeting();

    return () => {
      isMounted = false;
      cleanupMedia();
    };
  }, [meetingId, startLocalMedia, cleanupMedia]);

  // 2. Real-time Socket.io Presence
  useEffect(() => {
    if (!socket || !meetingId || isLoadingMeeting || meetingError) return;

    const cleanId = meetingId.trim().toLowerCase();
    joinMeetingRoom(cleanId);

    const handleParticipantsState = ({ participants }) => {
      setOnlinePeers(participants || []);
    };

    const handleParticipantJoined = ({ participant }) => {
      setOnlinePeers((prev) => {
        const filtered = prev.filter((p) => p.socketId !== participant.socketId);
        return [...filtered, participant];
      });
    };

    const handleParticipantLeft = ({ socketId }) => {
      setOnlinePeers((prev) => prev.filter((p) => p.socketId !== socketId));
    };

    const handleParticipantStateChanged = ({ socketId, isMuted, isVideoOff, isScreenSharing }) => {
      setOnlinePeers((prev) =>
        prev.map((p) => {
          if (p.socketId === socketId) {
            return { ...p, isMuted, isVideoOff, isScreenSharing };
          }
          return p;
        })
      );
    };

    socket.on('participants-state', handleParticipantsState);
    socket.on('participant-joined', handleParticipantJoined);
    socket.on('participant-left', handleParticipantLeft);
    socket.on('participant-state-changed', handleParticipantStateChanged);

    return () => {
      socket.off('participants-state', handleParticipantsState);
      socket.off('participant-joined', handleParticipantJoined);
      socket.off('participant-left', handleParticipantLeft);
      socket.off('participant-state-changed', handleParticipantStateChanged);
      leaveMeetingRoom(cleanId);
    };
  }, [socket, meetingId, isLoadingMeeting, meetingError, joinMeetingRoom, leaveMeetingRoom]);

  // 3. Meeting Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Media Controls Handlers
  const handleMicToggle = () => {
    const nextState = toggleAudio();
    broadcastMediaState(meetingId, {
      isMuted: !nextState,
      isVideoOff: !isVideoEnabled,
      isScreenSharing,
    });
  };

  const handleVideoToggle = () => {
    const nextState = toggleVideo();
    broadcastMediaState(meetingId, {
      isMuted: !isAudioEnabled,
      isVideoOff: !nextState,
      isScreenSharing,
    });
  };

  const handleScreenToggle = async () => {
    const nextState = await toggleScreenShare();
    broadcastMediaState(meetingId, {
      isMuted: !isAudioEnabled,
      isVideoOff: !isVideoEnabled,
      isScreenSharing: nextState,
    });
  };

  const handleCopyMeetingLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleLeaveMeeting = async () => {
    try {
      if (meetingId) {
        leaveMeetingRoom(meetingId);
        cleanupMedia();
        await api.meetings.leave(meetingId).catch(() => {});
      }
    } finally {
      setIsLeaveModalOpen(false);
      navigate('/dashboard');
    }
  };

  const togglePanel = (panelName) => {
    setActivePanel((prev) => (prev === panelName ? null : panelName));
  };

  if (isLoadingMeeting) {
    return (
      <div
        className="meeting-room-layout"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1.25rem',
          background: 'var(--bg-primary)',
        }}
      >
        <Loader2 size={40} className="spin" style={{ color: 'var(--primary-light)' }} />
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.35rem' }}>Initializing Media & Room...</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Meeting ID: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary-light)' }}>{meetingId}</span>
          </p>
        </div>
      </div>
    );
  }

  if (meetingError) {
    return (
      <div
        className="meeting-room-layout"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1.5rem',
          background: 'var(--bg-primary)',
          padding: '2rem',
        }}
      >
        <Card style={{ maxWidth: 480, textAlign: 'center', padding: '2.5rem 2rem' }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'rgba(244, 63, 94, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              color: 'var(--rose)',
            }}
          >
            <AlertCircle size={30} />
          </div>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Meeting Not Found</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.75rem', lineHeight: 1.5 }}>
            {meetingError} Please verify the meeting ID and ensure the room is active.
          </p>
          <Button
            variant="primary"
            icon={ArrowLeft}
            onClick={() => navigate('/dashboard')}
            style={{ width: '100%' }}
          >
            Return to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  const isUserHost =
    meeting?.host?._id?.toString() === user?.id?.toString() ||
    meeting?.host?.toString() === user?.id?.toString();

  const remotePeers = onlinePeers.filter(
    (p) => p.socketId !== socket?.id && p.userId !== user?.id
  );

  return (
    <div className="meeting-room-layout fade-in">
      {/* 1. Top Header Bar */}
      <header className="meeting-topbar">
        <div className="meeting-info">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div className="nav-logo-icon" style={{ width: 28, height: 28 }}>
              <Video size={16} />
            </div>
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
              {meeting?.title || 'OmniSync Session'}
            </span>
          </div>

          <div className="meeting-id-pill">
            <span>ID: {meeting?.meetingId || meetingId}</span>
            <button
              onClick={handleCopyMeetingLink}
              style={{ display: 'flex', alignItems: 'center', color: 'var(--text-secondary)', cursor: 'pointer' }}
              title="Copy meeting invite link"
              aria-label="Copy meeting invite link"
            >
              {copiedLink ? <Check size={14} color="var(--emerald)" /> : <Copy size={14} />}
            </button>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
              background: 'var(--bg-tertiary)',
              padding: '0.3rem 0.6rem',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: 'var(--rose)',
                animation: 'pulseDot 1.5s infinite',
              }}
            />
            <span style={{ fontFamily: 'var(--font-mono)' }}>{formatTime(elapsedSeconds)}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Badge variant={isSocketConnected ? 'success' : 'warning'}>
            <Radio size={12} style={{ marginRight: 4 }} />
            {isSocketConnected ? 'Live P2P Mesh' : 'Reconnecting'}
          </Badge>

          <Button
            variant="ghost"
            size="sm"
            icon={PhoneOff}
            onClick={() => setIsLeaveModalOpen(true)}
            style={{ color: 'var(--rose)' }}
          >
            Leave
          </Button>
        </div>
      </header>

      {/* 2. Main Stage Viewport */}
      <main className="meeting-main-stage">
        <div className="stage-viewport">
          {mediaError && (
            <div className="auth-banner-error" style={{ marginBottom: 0 }}>
              <AlertCircle size={16} />
              <span>{mediaError}</span>
            </div>
          )}

          {/* Video Grid */}
          <div className="video-grid">
            {/* Local Video Tile */}
            <VideoTile
              stream={localStream}
              name={user?.name || 'You'}
              avatar={user?.avatar}
              isLocal={true}
              isHost={isUserHost}
              isMuted={!isAudioEnabled}
              isVideoOff={!isVideoEnabled}
              isScreenSharing={isScreenSharing}
            />

            {/* Remote Peer Video Tiles */}
            {remotePeers.map((peer) => (
              <VideoTile
                key={peer.socketId}
                stream={remoteStreams[peer.socketId]}
                name={peer.name || 'Remote Peer'}
                avatar={peer.avatar}
                isLocal={false}
                isHost={peer.role === 'host'}
                isMuted={peer.isMuted}
                isVideoOff={peer.isVideoOff}
                isScreenSharing={peer.isScreenSharing}
              />
            ))}
          </div>
        </div>

        {/* 3. Collapsible Side Panel */}
        {activePanel && (
          <aside className="meeting-side-panel">
            <div className="panel-header">
              <div className="panel-tabs">
                <button
                  className={`panel-tab ${activePanel === 'participants' ? 'active' : ''}`}
                  onClick={() => setActivePanel('participants')}
                >
                  People ({onlinePeers.length || 1})
                </button>
                <button
                  className={`panel-tab ${activePanel === 'chat' ? 'active' : ''}`}
                  onClick={() => setActivePanel('chat')}
                >
                  Chat
                </button>
                <button
                  className={`panel-tab ${activePanel === 'whiteboard' ? 'active' : ''}`}
                  onClick={() => setActivePanel('whiteboard')}
                >
                  Whiteboard
                </button>
                <button
                  className={`panel-tab ${activePanel === 'files' ? 'active' : ''}`}
                  onClick={() => setActivePanel('files')}
                >
                  Files
                </button>
              </div>

              <button
                className="btn-ghost btn-icon-only"
                onClick={() => setActivePanel(null)}
                aria-label="Close side panel"
              >
                <X size={18} />
              </button>
            </div>

            <div className="panel-content">
              {/* Tab 1: Participants List */}
              {activePanel === 'participants' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div
                    style={{
                      fontSize: '0.8rem',
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>Active In Room</span>
                    <span>{onlinePeers.length || 1} Online</span>
                  </div>

                  {/* Local User */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.65rem 0.75rem',
                      background: 'var(--bg-tertiary)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-highlight)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          style={{ width: 32, height: 32, borderRadius: '50%' }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--primary), var(--violet))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                          }}
                        >
                          {(user?.name || 'You').substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                          {user?.name || 'You'} (You)
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {isUserHost ? 'Host' : 'Participant'} • {user?.email}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.4rem', color: 'var(--text-secondary)' }}>
                      {!isAudioEnabled ? <MicOff size={15} color="var(--rose)" /> : <Mic size={15} color="var(--emerald)" />}
                      {!isVideoEnabled ? <VideoOff size={15} color="var(--rose)" /> : <Video size={15} color="var(--primary-light)" />}
                    </div>
                  </div>

                  {/* Remote Peers */}
                  {remotePeers.map((peer) => (
                    <div
                      key={peer.socketId}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.65rem 0.75rem',
                        background: 'var(--bg-tertiary)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        {peer.avatar ? (
                          <img
                            src={peer.avatar}
                            alt={peer.name}
                            style={{ width: 32, height: 32, borderRadius: '50%' }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, var(--cyan), var(--primary))',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                            }}
                          >
                            {(peer.name || 'P').substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{peer.name || 'Remote Peer'}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {peer.email || 'Participant'} • Connected
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.4rem', color: 'var(--text-secondary)' }}>
                        {peer.isMuted ? <MicOff size={15} color="var(--rose)" /> : <Mic size={15} color="var(--emerald)" />}
                        {peer.isVideoOff ? <VideoOff size={15} color="var(--rose)" /> : <Video size={15} color="var(--primary-light)" />}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 2: Real-time Chat */}
              {activePanel === 'chat' && <ChatPanel meetingId={meetingId} />}

              {/* Tab 3: Collaborative Whiteboard */}
              {activePanel === 'whiteboard' && <Whiteboard meetingId={meetingId} />}

              {/* Tab 4: Shared Files */}
              {activePanel === 'files' && <FileSharingPanel meetingId={meetingId} />}
            </div>
          </aside>
        )}
      </main>

      {/* 4. Bottom Control Dock */}
      <footer className="meeting-controls-dock">
        {/* Mic toggle */}
        <button
          className={`dock-btn ${!isAudioEnabled ? 'muted' : ''}`}
          onClick={handleMicToggle}
          title={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
          aria-label={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
        >
          {isAudioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
        </button>

        {/* Camera toggle */}
        <button
          className={`dock-btn ${!isVideoEnabled ? 'muted' : ''}`}
          onClick={handleVideoToggle}
          title={isVideoEnabled ? 'Turn camera off' : 'Turn camera on'}
          aria-label={isVideoEnabled ? 'Turn camera off' : 'Turn camera on'}
        >
          {isVideoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
        </button>

        {/* Screen share toggle */}
        <button
          className={`dock-btn ${isScreenSharing ? 'active' : ''}`}
          onClick={handleScreenToggle}
          title={isScreenSharing ? 'Stop screen share' : 'Share screen'}
          aria-label={isScreenSharing ? 'Stop screen share' : 'Share screen'}
        >
          <MonitorUp size={20} />
        </button>

        {/* Side panel toggles */}
        <button
          className={`dock-btn ${activePanel === 'participants' ? 'active' : ''}`}
          onClick={() => togglePanel('participants')}
          title="Participants"
          aria-label="Participants"
        >
          <Users size={20} />
        </button>

        <button
          className={`dock-btn ${activePanel === 'chat' ? 'active' : ''}`}
          onClick={() => togglePanel('chat')}
          title="Open Chat"
          aria-label="Open Chat"
        >
          <MessageSquare size={20} />
        </button>

        <button
          className={`dock-btn ${activePanel === 'whiteboard' ? 'active' : ''}`}
          onClick={() => togglePanel('whiteboard')}
          title="Collaborative Whiteboard"
          aria-label="Collaborative Whiteboard"
        >
          <PenTool size={20} />
        </button>

        <button
          className={`dock-btn ${activePanel === 'files' ? 'active' : ''}`}
          onClick={() => togglePanel('files')}
          title="Shared Files"
          aria-label="Shared Files"
        >
          <Share2 size={20} />
        </button>

        {/* Leave button */}
        <button
          className="dock-btn danger"
          onClick={() => setIsLeaveModalOpen(true)}
          aria-label="Leave meeting"
        >
          <PhoneOff size={18} style={{ marginRight: 6 }} />
          Leave
        </button>
      </footer>

      {/* Leave Confirmation Modal */}
      <Modal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        title="Leave Meeting?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsLeaveModalOpen(false)}>
              Stay in Room
            </Button>
            <Button variant="danger" onClick={handleLeaveMeeting}>
              Leave Meeting
            </Button>
          </>
        }
      >
        <p style={{ color: 'var(--text-secondary)' }}>
          Are you sure you want to disconnect from this collaboration session? You can rejoin anytime using the meeting ID: <strong>{meeting?.meetingId}</strong>.
        </p>
      </Modal>
    </div>
  );
};

export default MeetingRoomPage;
