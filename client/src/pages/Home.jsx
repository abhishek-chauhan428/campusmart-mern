import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ListingBrowser from '../components/ListingBrowser';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', padding: '1.5rem 0 4rem' }}>
      
      {/* Hero Banner - Exact visual inspiration from reference image */}
      <section className="container">
        <div style={{
          position: 'relative',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          background: 'linear-gradient(90deg, #93c5fd 0%, #bfdbfe 35%, #dbeafe 100%)',
          minHeight: '380px',
          display: 'flex',
          alignItems: 'center',
          boxShadow: '0 8px 30px rgba(147, 197, 253, 0.35)',
        }}>
          {/* Background Subtle Geometric Accents */}
          <div style={{
            position: 'absolute',
            top: '-20%',
            left: '10%',
            width: '260px',
            height: '260px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.15)',
            pointerEvents: 'none',
          }}></div>
          <div style={{
            position: 'absolute',
            bottom: '-10%',
            left: '40%',
            width: '180px',
            height: '180px',
            borderRadius: 'var(--radius-lg)',
            transform: 'rotate(45deg)',
            background: 'rgba(255, 255, 255, 0.1)',
            pointerEvents: 'none',
          }}></div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            width: '100%',
            alignItems: 'center',
            position: 'relative',
            zIndex: 2,
          }}>
            {/* Left Banner Text Content */}
            <div style={{ padding: '3rem 2.5rem', maxWidth: '520px' }}>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: '700',
                letterSpacing: '0.2em',
                color: '#ffffff',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: '0.75rem',
                textShadow: '0 1px 2px rgba(0,0,0,0.1)'
              }}>
                CAMPUS MARKETPLACE
              </span>

              <h1 style={{
                fontSize: 'clamp(2rem, 3.8vw, 3.25rem)',
                fontWeight: '800',
                lineHeight: 1.1,
                color: '#ffffff',
                textTransform: 'uppercase',
                letterSpacing: '-0.02em',
                marginBottom: '0.5rem',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                BUY & SELL ON CAMPUS
              </h1>

              <div style={{
                fontSize: 'clamp(1.15rem, 2vw, 1.5rem)',
                fontWeight: '800',
                color: '#ffffff',
                marginBottom: '0.35rem',
                textShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                STRUCTURED & FORMAL OFFERS
              </div>

              <p style={{
                fontSize: '0.8125rem',
                fontWeight: '600',
                color: 'rgba(255, 255, 255, 0.9)',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                marginBottom: '1.75rem'
              }}>
                ATOMIC RESERVATION & VERIFIED HANDOVERS
              </p>

              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <Link
                  to={isAuthenticated ? "/listings/create" : "/login"}
                  className="btn"
                  style={{
                    background: '#ffffff',
                    color: 'var(--brand-primary)',
                    fontWeight: '700',
                    padding: '0.75rem 1.75rem',
                    borderRadius: 'var(--radius-full)',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                    fontSize: '0.9375rem'
                  }}
                >
                  <span>Sell an Item</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            {/* Right Banner Image */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'flex-end',
              height: '100%',
              minHeight: '340px',
              overflow: 'hidden'
            }}>
              <img
                src="/hero-banner.jpg"
                alt="Student Shopping Sale"
                style={{
                  maxWidth: '100%',
                  height: '380px',
                  objectFit: 'cover',
                  objectPosition: 'center right',
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Browse: search, filters, grid, pagination */}
      <ListingBrowser />

    </div>
  );
};

export default Home;
