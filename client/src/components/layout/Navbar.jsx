import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Video, User, LogOut, LayoutDashboard, LogIn, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';
import HealthIndicator from '../common/HealthIndicator';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="container-xl nav-container">
        {/* Brand Logo */}
        <Link to="/" className="nav-logo">
          <div className="nav-logo-icon">
            <Video size={20} />
          </div>
          <span>OmniSync</span>
        </Link>

        {/* Navigation Links */}
        <nav className="nav-links">
          <Link
            to="/"
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            Overview
          </Link>
          <a href="#features" className="nav-link">
            Features
          </a>
          <a href="#architecture" className="nav-link">
            Architecture
          </a>
          <a href="#diagnostics" className="nav-link">
            Diagnostics
          </a>
        </nav>

        {/* Right side actions & health indicator */}
        <div className="nav-actions">
          <HealthIndicator />

          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link
                to="/dashboard"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.35rem 0.65rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user?.name || 'User'}
                    style={{ width: 22, height: 22, borderRadius: '50%' }}
                  />
                ) : (
                  <User size={16} color="var(--primary-light)" />
                )}
                <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                  {user?.name?.split(' ')[0] || 'User'}
                </span>
              </Link>
              <Link to="/dashboard">
                <Button variant="secondary" size="sm" icon={LayoutDashboard}>
                  Dashboard
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                icon={LogOut}
                onClick={handleLogout}
                title="Sign out"
              />
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link to="/login">
                <Button variant="ghost" size="sm" icon={LogIn}>
                  Sign in
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm" icon={Sparkles}>
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
