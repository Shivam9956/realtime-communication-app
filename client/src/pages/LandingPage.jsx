import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Video,
  MonitorUp,
  MessageSquare,
  PenTool,
  Share2,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Zap,
  Activity,
  CheckCircle2,
  Users,
  Copy,
  Check,
} from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import { api } from '../services/api';
import { useSocket } from '../context/SocketContext';

export const LandingPage = () => {
  const navigate = useNavigate();
  const [meetingCode, setMeetingCode] = useState('');
  const [healthData, setHealthData] = useState(null);
  const [isPinging, setIsPinging] = useState(false);
  const [copied, setCopied] = useState(false);
  const { isConnected: socketConnected } = useSocket();

  useEffect(() => {
    fetchDiagnostics();
  }, []);

  const fetchDiagnostics = async () => {
    setIsPinging(true);
    try {
      const data = await api.getHealth();
      setHealthData(data);
    } catch (err) {
      console.warn('Diagnostics fetch failed:', err);
    } finally {
      setIsPinging(false);
    }
  };

  const handleStartInstantMeeting = () => {
    const randomId = Math.random().toString(36).substring(2, 6) + '-' +
                     Math.random().toString(36).substring(2, 6) + '-' +
                     Math.random().toString(36).substring(2, 6);
    navigate(`/room/${randomId}`);
  };

  const handleJoinMeeting = (e) => {
    e.preventDefault();
    if (meetingCode.trim()) {
      navigate(`/room/${meetingCode.trim().toLowerCase()}`);
    }
  };

  const features = [
    {
      icon: Video,
      title: 'Ultra-HD Video & Audio',
      desc: 'Crystal-clear peer-to-peer WebRTC mesh architecture optimized for low-latency voice and adaptive bitrates.',
      badge: 'WebRTC P2P',
      badgeVariant: 'primary',
    },
    {
      icon: MonitorUp,
      title: 'Seamless Screen Sharing',
      desc: 'Share documents, presentations, and code in full 60 FPS directly without external plugins or third-party extensions.',
      badge: 'DisplayMedia',
      badgeVariant: 'cyan',
    },
    {
      icon: PenTool,
      title: 'Collaborative Whiteboard',
      desc: 'Interactive HTML5 Canvas whiteboard with real-time vector synchronization, smart pens, erasers, and color palette.',
      badge: 'Canvas 2D',
      badgeVariant: 'warning',
    },
    {
      icon: MessageSquare,
      title: 'Real-Time In-Meeting Chat',
      desc: 'Sub-millisecond messaging powered by Socket.io rooms with instant typing indicators and sender attribution.',
      badge: 'Socket.io',
      badgeVariant: 'success',
    },
    {
      icon: Share2,
      title: 'Secure File Sharing',
      desc: 'Direct file distribution with validation, size quotas, sanitized uploads, and scoped access control.',
      badge: 'Multipart Storage',
      badgeVariant: 'primary',
    },
    {
      icon: ShieldCheck,
      title: 'Enterprise Security',
      desc: 'End-to-end token authorization, Helmet security headers, rate limiting, and private STUN/TURN relay integration.',
      badge: 'JWT & Helmet',
      badgeVariant: 'success',
    },
  ];

  return (
    <div className="fade-in">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container-xl">
          <div className="hero-badge-wrap">
            <Sparkles size={16} />
            <span>Phase 1 Architecture Live — Real-Time Engine Active</span>
          </div>

          <h1 className="hero-title">
            Frictionless Video Meetings & <span className="text-gradient">Real-Time Team Collaboration</span>
          </h1>

          <p className="hero-subtitle">
            Experience ultra-low latency peer-to-peer video calling, synchronized interactive whiteboards, instant messaging, and secure file sharing — all in one unified SaaS workspace.
          </p>

          <div className="hero-actions">
            <Button
              variant="primary"
              size="lg"
              icon={Video}
              onClick={handleStartInstantMeeting}
            >
              Start Instant Meeting
            </Button>

            <form onSubmit={handleJoinMeeting} style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Enter meeting code (e.g. abc-xyz)"
                value={meetingCode}
                onChange={(e) => setMeetingCode(e.target.value)}
                style={{ width: '260px', padding: '0.85rem 1rem' }}
              />
              <Button type="submit" variant="secondary" size="lg" disabled={!meetingCode.trim()}>
                Join
              </Button>
            </form>
          </div>

          {/* Hero UI Preview Shell */}
          <div className="hero-preview">
            <div className="hero-preview-inner">
              <div style={{ padding: '0.75rem 1.25rem', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#eab308' }} />
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e' }} />
                  <span style={{ marginLeft: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    omnisync.app/room/eng-sync-2026
                  </span>
                </div>
                <Badge variant="cyan">Interactive UI Shell</Badge>
              </div>

              <div style={{ padding: '2rem', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem', minHeight: '340px' }}>
                {/* Simulated Main Video Tile */}
                <div style={{ background: '#0b0f19', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', border: '1px solid var(--border-subtle)' }}>
                  <div className="avatar-placeholder" style={{ width: 90, height: 90, fontSize: '2.25rem' }}>
                    OS
                  </div>
                  <h4 style={{ marginTop: '1rem', color: 'var(--text-primary)' }}>OmniSync Workspace Demo</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Ready for Multi-User WebRTC P2P mesh</p>
                  
                  <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', display: 'flex', gap: '0.5rem' }}>
                    <Badge variant="success">Camera Ready</Badge>
                    <Badge variant="primary">Mic Active</Badge>
                  </div>
                </div>

                {/* Simulated Collaboration Panel */}
                <div style={{ background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid var(--border-subtle)' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Live Session Details</span>
                      <span className="status-dot online" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Protocol</span>
                        <strong style={{ color: '#fff' }}>WebRTC + WSS</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Database</span>
                        <strong style={{ color: '#34d399' }}>MongoDB Connected</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Signaling Server</span>
                        <strong style={{ color: '#818cf8' }}>Socket.io Node.js</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Encryption</span>
                        <strong style={{ color: '#22d3ee' }}>DTLS / SRTP</strong>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    icon={ArrowRight}
                    onClick={handleStartInstantMeeting}
                    style={{ width: '100%', marginTop: '1rem' }}
                  >
                    Enter Meeting Room
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section" id="features">
        <div className="container-xl">
          <div className="section-header">
            <Badge variant="primary" style={{ marginBottom: '0.75rem' }}>Full Stack Capabilities</Badge>
            <h2 className="section-title">Engineered for Seamless Team Collaboration</h2>
            <p className="section-subtitle">
              Every feature is built with modular separation of concerns between signaling, peer-to-peer transport, and application state.
            </p>
          </div>

          <div className="features-grid">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div key={idx} className="feature-card">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div className="feature-icon-wrapper">
                      <Icon size={24} />
                    </div>
                    <Badge variant={feat.badgeVariant}>{feat.badge}</Badge>
                  </div>
                  <h3 style={{ fontSize: '1.2rem', marginTop: '0.25rem' }}>{feat.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                    {feat.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Diagnostics & Live API Health Inspector */}
      <section className="section" id="diagnostics" style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="container-xl">
          <div className="section-header">
            <Badge variant="success" style={{ marginBottom: '0.75rem' }}>Phase 1 Verification</Badge>
            <h2 className="section-title">Live System Status & Diagnostics</h2>
            <p className="section-subtitle">
              Verify communication between the React client, Express REST API, MongoDB connection, and Socket.io signaling.
            </p>
          </div>

          <div className="diagnostics-card">
            <div className="diagnostics-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Activity size={20} color="var(--emerald)" />
                <span style={{ fontWeight: 600 }}>Backend Service Diagnostics (/api/health)</span>
              </div>
              <Button
                variant="secondary"
                size="sm"
                icon={Zap}
                isLoading={isPinging}
                onClick={fetchDiagnostics}
              >
                Ping Health Check
              </Button>
            </div>

            <div className="diagnostics-grid">
              <div className="diagnostic-item">
                <div className="diagnostic-label">Server Status</div>
                <div className="diagnostic-value" style={{ color: healthData?.services?.server === 'healthy' ? 'var(--emerald)' : 'var(--rose)' }}>
                  {healthData?.services?.server ? healthData.services.server.toUpperCase() : 'CHECKING...'}
                </div>
              </div>

              <div className="diagnostic-item">
                <div className="diagnostic-label">MongoDB State</div>
                <div className="diagnostic-value" style={{ color: healthData?.services?.database === 'connected' ? 'var(--emerald)' : 'var(--amber)' }}>
                  {healthData?.services?.database ? healthData.services.database.toUpperCase() : 'PENDING'}
                </div>
              </div>

              <div className="diagnostic-item">
                <div className="diagnostic-label">WebSocket Connection</div>
                <div className="diagnostic-value" style={{ color: socketConnected ? 'var(--cyan)' : 'var(--amber)' }}>
                  {socketConnected ? 'CONNECTED' : 'DISCONNECTED'}
                </div>
              </div>

              <div className="diagnostic-item">
                <div className="diagnostic-label">Uptime / Platform</div>
                <div className="diagnostic-value" style={{ color: 'var(--text-primary)' }}>
                  {healthData?.uptime ? `${healthData.uptime} (${healthData.system?.platform})` : 'N/A'}
                </div>
              </div>
            </div>

            {healthData && (
              <div style={{ marginTop: '1.25rem', background: '#090d16', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', overflowX: 'auto' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontFamily: 'var(--font-mono)' }}>
                  RAW JSON PAYLOAD FROM GET /api/health:
                </div>
                <pre style={{ color: '#38bdf8', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', margin: 0 }}>
                  {JSON.stringify(healthData, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section" id="architecture" style={{ textAlign: 'center' }}>
        <div className="container-lg">
          <Card glow style={{ padding: '3.5rem 2rem' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
              Ready to collaborate in real-time?
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '580px', margin: '0 auto 2rem', fontSize: '1.05rem' }}>
              Jump straight into a meeting room with zero friction or sign up to manage scheduled rooms and persistent history.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <Button variant="primary" size="lg" icon={Video} onClick={handleStartInstantMeeting}>
                Launch Meeting Room
              </Button>
              <Link to="/register">
                <Button variant="secondary" size="lg">
                  Create Account
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
