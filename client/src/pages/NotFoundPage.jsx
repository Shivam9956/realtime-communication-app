import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, LayoutDashboard } from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

export const NotFoundPage = () => {
  return (
    <div className="container-lg fade-in" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
      <Card glow style={{ padding: '4rem 2rem', maxWidth: '520px', margin: '0 auto' }}>
        <div style={{ width: 64, height: 64, margin: '0 auto 1.5rem', background: 'rgba(244, 63, 94, 0.12)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--rose)' }}>
          <Compass size={32} />
        </div>
        <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem', color: '#ffffff' }}>404</h1>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem' }}>Page Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.95rem' }}>
          The page or meeting room you're looking for does not exist or may have been moved.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/">
            <Button variant="secondary" icon={Home}>
              Return Home
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="primary" icon={LayoutDashboard}>
              Dashboard
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default NotFoundPage;
