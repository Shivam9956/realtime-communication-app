import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Video,
  PlusCircle,
  LogIn,
  Calendar,
  Clock,
  Users,
  Copy,
  Check,
  ExternalLink,
  Shield,
  Activity,
  Trash2,
  User as UserIcon,
  RefreshCw,
  Sparkles,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';

export const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State
  const [meetings, setMeetings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Modals
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [meetingCodeInput, setMeetingCodeInput] = useState('');
  const [joinError, setJoinError] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [meetingTitleInput, setMeetingTitleInput] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Fetch meeting history on mount
  const fetchMeetings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.meetings.getHistory();
      setMeetings(response?.meetings || []);
    } catch (err) {
      console.error('Failed to load meetings history:', err);
      setError('Could not load meeting history. Please check connection.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  // Instant or Modal meeting creation
  const handleStartInstantMeeting = async (title) => {
    setIsCreating(true);
    try {
      const meetingTitle = title || `${user?.name || 'OmniSync'}'s Instant Room`;
      const response = await api.meetings.create({ title: meetingTitle });
      
      if (response?.meeting?.meetingId) {
        navigate(`/room/${response.meeting.meetingId}`);
      }
    } catch (err) {
      alert(err.message || 'Failed to create meeting room.');
    } finally {
      setIsCreating(false);
      setIsCreateModalOpen(false);
    }
  };

  const handleJoinSubmit = async (e) => {
    e.preventDefault();
    const cleanCode = meetingCodeInput.trim().toLowerCase();
    if (!cleanCode) return;

    setJoinError('');
    setIsJoining(true);
    try {
      // Verify meeting exists before navigating
      const checkRes = await api.meetings.getById(cleanCode);
      if (checkRes?.meeting) {
        setIsJoinModalOpen(false);
        navigate(`/room/${cleanCode}`);
      }
    } catch (err) {
      setJoinError(err.message || 'Meeting room not found or has expired.');
    } finally {
      setIsJoining(false);
    }
  };

  const handleCopyLink = (meetingId, e) => {
    if (e) e.stopPropagation();
    const fullUrl = `${window.location.origin}/room/${meetingId}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(meetingId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Recent';
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="container-xl dashboard-container fade-in">
      {/* Dashboard Top Header */}
      <div className="dashboard-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                border: '2px solid var(--primary-light)',
                boxShadow: '0 0 15px var(--primary-glow)',
              }}
            />
          ) : (
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: 'rgba(99, 102, 241, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary-light)',
              }}
            >
              <UserIcon size={30} />
            </div>
          )}
          <div className="dashboard-welcome">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h1 style={{ fontSize: '1.85rem' }}>Welcome, {user?.name || 'Engineer'}</h1>
              <Badge variant="primary">Verified Session</Badge>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {user?.email} • Real-time Collaboration Workspace
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button
            variant="secondary"
            icon={LogIn}
            onClick={() => {
              setMeetingCodeInput('');
              setJoinError('');
              setIsJoinModalOpen(true);
            }}
          >
            Join with Code
          </Button>
          <Button
            variant="primary"
            icon={Video}
            isLoading={isCreating}
            onClick={() => setIsCreateModalOpen(true)}
          >
            New Meeting
          </Button>
        </div>
      </div>

      {/* Action Tiles Grid */}
      <div className="dashboard-actions-grid">
        <div
          className="action-tile"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <div
            className="action-tile-icon"
            style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary-light)' }}
          >
            <PlusCircle size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.35rem' }}>Start Instant Meeting</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Create an authenticated room with unique meeting ID, ready for video, whiteboard, chat & files.
            </p>
          </div>
          <Badge variant="primary" style={{ alignSelf: 'flex-start' }}>MongoDB Backed</Badge>
        </div>

        <div
          className="action-tile"
          onClick={() => {
            setMeetingCodeInput('');
            setJoinError('');
            setIsJoinModalOpen(true);
          }}
        >
          <div
            className="action-tile-icon"
            style={{ background: 'rgba(6, 182, 212, 0.15)', color: 'var(--cyan)' }}
          >
            <LogIn size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.35rem' }}>Join Existing Room</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Enter a meeting ID or invite code to connect with your teammates.
            </p>
          </div>
          <Badge variant="cyan" style={{ alignSelf: 'flex-start' }}>Protected Access</Badge>
        </div>

        <div className="action-tile" style={{ cursor: 'default' }}>
          <div
            className="action-tile-icon"
            style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}
          >
            <Calendar size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.35rem' }}>Active Sessions</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Track active participants, room status, and re-join past collaboration sessions anytime.
            </p>
          </div>
          <Badge variant="success" style={{ alignSelf: 'flex-start' }}>Live Sync</Badge>
        </div>
      </div>

      {/* Recent Meetings Section */}
      <section className="meetings-list-section">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem' }}>Recent Collaboration Sessions</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Re-enter active meetings or share invite links with participants.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            icon={RefreshCw}
            onClick={fetchMeetings}
            isLoading={isLoading}
          >
            Refresh
          </Button>
        </div>

        {error && (
          <div className="auth-banner-error" style={{ marginBottom: '1.5rem' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {isLoading ? (
          <Card style={{ padding: '3rem 2rem', textAlign: 'center' }}>
            <Loader2 size={32} className="spin" style={{ margin: '0 auto 1rem', color: 'var(--primary-light)' }} />
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Loading meetings history...</p>
          </Card>
        ) : meetings.length === 0 ? (
          <Card style={{ padding: '3rem 2rem', textAlign: 'center' }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'rgba(99, 102, 241, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                color: 'var(--primary-light)',
              }}
            >
              <Video size={28} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Meeting Sessions Yet</h3>
            <p style={{ color: 'var(--text-secondary)', maxWidth: 460, margin: '0 auto 1.5rem', fontSize: '0.9rem' }}>
              You haven't hosted or joined any meeting rooms yet. Start your first collaboration session now!
            </p>
            <Button
              variant="primary"
              icon={PlusCircle}
              onClick={() => setIsCreateModalOpen(true)}
            >
              Create First Meeting
            </Button>
          </Card>
        ) : (
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="meetings-table">
                <thead>
                  <tr>
                    <th>Meeting Session</th>
                    <th>Meeting ID</th>
                    <th>Date & Time</th>
                    <th>Participants</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {meetings.map((meeting) => (
                    <tr key={meeting.id || meeting.meetingId}>
                      <td>
                        <div style={{ fontWeight: 600, color: '#ffffff' }}>{meeting.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {meeting.isHost ? 'Hosted by you' : `Hosted by ${meeting.host?.name || 'Team Member'}`}
                        </div>
                      </td>
                      <td>
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            color: 'var(--primary-light)',
                            fontSize: '0.85rem',
                            background: 'rgba(99, 102, 241, 0.1)',
                            padding: '0.2rem 0.5rem',
                            borderRadius: 4,
                          }}
                        >
                          {meeting.meetingId}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Clock size={14} color="var(--text-muted)" />
                          <span>{formatDate(meeting.createdAt || meeting.startedAt)}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}>
                          <Users size={14} />
                          <span>{meeting.participantsCount || 1} participant{meeting.participantsCount === 1 ? '' : 's'}</span>
                        </div>
                      </td>
                      <td>
                        <Badge variant={meeting.status === 'active' ? 'success' : 'primary'}>
                          {meeting.status === 'active' ? 'Active' : 'Ended'}
                        </Badge>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={copiedId === meeting.meetingId ? Check : Copy}
                            onClick={(e) => handleCopyLink(meeting.meetingId, e)}
                            title="Copy meeting link"
                          >
                            {copiedId === meeting.meetingId ? 'Copied' : 'Copy'}
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            icon={ExternalLink}
                            onClick={() => navigate(`/room/${meeting.meetingId}`)}
                          >
                            Join
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </section>

      {/* Create Meeting Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Meeting"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              isLoading={isCreating}
              onClick={() => handleStartInstantMeeting(meetingTitleInput)}
            >
              Launch Room
            </Button>
          </>
        }
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleStartInstantMeeting(meetingTitleInput);
          }}
        >
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
            Give your collaboration session a title or launch an instant room.
          </p>
          <Input
            label="Meeting Title (Optional)"
            placeholder="e.g. Design Architecture Review or Daily Sync"
            value={meetingTitleInput}
            onChange={(e) => setMeetingTitleInput(e.target.value)}
            autoFocus
          />
        </form>
      </Modal>

      {/* Join Meeting Modal */}
      <Modal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        title="Join a Meeting"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsJoinModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              isLoading={isJoining}
              disabled={!meetingCodeInput.trim() || isJoining}
              onClick={handleJoinSubmit}
            >
              Join Room
            </Button>
          </>
        }
      >
        <form onSubmit={handleJoinSubmit}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
            Enter the unique meeting ID or code provided by the meeting host.
          </p>
          {joinError && (
            <div className="auth-banner-error" style={{ marginBottom: '1rem' }}>
              <AlertCircle size={16} />
              <span>{joinError}</span>
            </div>
          )}
          <Input
            label="Meeting ID or Code"
            placeholder="e.g. meet-3947-1a38 or custom code"
            value={meetingCodeInput}
            onChange={(e) => setMeetingCodeInput(e.target.value)}
            required
            autoFocus
          />
        </form>
      </Modal>
    </div>
  );
};

export default DashboardPage;
