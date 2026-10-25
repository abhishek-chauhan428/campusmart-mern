import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, Sparkles } from 'lucide-react';

const PlaceholderPage = ({ title, phase, description, icon: Icon }) => {
  return (
    <div className="container" style={{ padding: '3.5rem 1.5rem', maxWidth: '640px' }}>
      <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center', borderRadius: 'var(--radius-xl)' }}>
        <div style={{
          width: '3.5rem',
          height: '3.5rem',
          borderRadius: 'var(--radius-full)',
          background: 'var(--brand-primary-light)',
          color: 'var(--brand-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.25rem',
        }}>
          {Icon ? <Icon size={26} strokeWidth={2.2} /> : <Sparkles size={26} strokeWidth={2.2} />}
        </div>

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.2rem 0.6rem',
          borderRadius: 'var(--radius-full)',
          background: '#f1f5f9',
          color: 'var(--text-secondary)',
          fontSize: '0.75rem',
          fontWeight: '600',
          marginBottom: '0.75rem',
        }}>
          <Clock size={12} />
          <span>{phase}</span>
        </div>

        <h1 style={{ fontSize: '1.625rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>{title}</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.5, marginBottom: '2rem' }}>
          {description}
        </p>

        <Link to="/" className="btn btn-secondary" style={{ borderRadius: 'var(--radius-full)' }}>
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </Link>
      </div>
    </div>
  );
};

export default PlaceholderPage;
