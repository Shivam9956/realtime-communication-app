import React from 'react';
import { Video, Github, Shield, Cpu, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="footer">
      <div className="container-xl">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="nav-logo" style={{ marginBottom: '0.5rem' }}>
              <div className="nav-logo-icon">
                <Video size={18} />
              </div>
              <span>OmniSync</span>
            </div>
            <p>
              Next-generation real-time video conferencing, interactive whiteboard collaboration, and ultra-low latency signaling built for modern teams.
            </p>
          </div>

          <div>
            <h4 className="footer-heading">Platform</h4>
            <ul className="footer-links">
              <li><Link to="/" className="footer-link">Overview</Link></li>
              <li><a href="#features" className="footer-link">Live Calling & Mesh</a></li>
              <li><a href="#features" className="footer-link">Shared Whiteboard</a></li>
              <li><a href="#features" className="footer-link">Encrypted File Sharing</a></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-heading">Architecture</h4>
            <ul className="footer-links">
              <li><span className="footer-link">WebRTC P2P Protocol</span></li>
              <li><span className="footer-link">Socket.io WSS Signaling</span></li>
              <li><span className="footer-link">Express + Node.js REST</span></li>
              <li><span className="footer-link">MongoDB Atlas Document Store</span></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-heading">Engineering & Security</h4>
            <ul className="footer-links">
              <li><span className="footer-link"><Shield size={14} style={{ display: 'inline', marginRight: 4 }} /> E2E Encryption Ready</span></li>
              <li><span className="footer-link"><Cpu size={14} style={{ display: 'inline', marginRight: 4 }} /> STUN/TURN Resilient</span></li>
              <li><span className="footer-link"><Activity size={14} style={{ display: 'inline', marginRight: 4 }} /> 99.9% Uptime SLA</span></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div>
            &copy; {new Date().getFullYear()} OmniSync Collaboration Engine. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Phase 1 Foundation & Architecture Setup</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
