import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, Sparkles } from 'lucide-react';

const PlaceholderPage = ({ title, phase, description, icon: Icon }) => {
  return (
    <div className="container" style={{ padding: '3rem 1.5rem', maxWidth: '700px' }}>
      <div className="glass-panel" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
        <div style={{
          width: '4rem',
          height: '4rem',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--brand-gradient-subtle)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
          color: '#818cf8'
        }}>
          {Icon ? <Icon size={32} /> : <Sparkles size={32} />}
        </div>

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.2rem 0.6rem',
          borderRadius: 'var(--radius-full)',
          background: 'rgba(99, 102, 241, 0.1)',
          color: '#a5b4fc',
          fontSize: '0.75rem',
          fontWeight: '600',
          marginBottom: '0.75rem'
        }}>
          <Clock size={12} />
          <span>{phase}</span>
        </div>

        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>{title}</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '2rem' }}>
          {description}
        </p>

        <Link to="/" className="btn btn-secondary">
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </Link>
      </div>
    </div>
  );
};

export default PlaceholderPage;
