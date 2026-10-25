import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Zap,
  MessageSquare,
  ArrowLeftRight,
  CheckCircle2,
  Lock,
  Layers,
  Sparkles,
  Users
} from 'lucide-react';

const Home = () => {
  const { user, isAuthenticated } = useAuth();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem', paddingBottom: '4rem' }}>
      
      {/* Hero Section */}
      <section style={{
        position: 'relative',
        padding: '5rem 1rem 3rem',
        overflow: 'hidden',
        textAlign: 'center',
        background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(99, 102, 241, 0.22) 0%, transparent 80%)'
      }}>
        <div className="container" style={{ maxWidth: '840px' }}>
          
          {/* Badge */}
          <div className="animate-fade-in" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.9rem',
            borderRadius: 'var(--radius-full)',
            background: 'var(--brand-gradient-subtle)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            marginBottom: '1.5rem',
          }}>
            <Sparkles size={16} color="#818cf8" />
            <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#c7d2fe' }}>
              Built for College Students • MERN + Socket.io + Cloudinary
            </span>
          </div>

          {/* Heading */}
          <h1 className="animate-fade-in" style={{
            fontSize: 'clamp(2.25rem, 5vw, 3.75rem)',
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
            marginBottom: '1.5rem',
          }}>
            The Campus Marketplace Where Every Deal is{' '}
            <span style={{
              background: 'var(--brand-gradient)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Verified & Guaranteed.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="animate-fade-in" style={{
            fontSize: '1.125rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            marginBottom: '2.5rem',
            maxWidth: '680px',
            margin: '0 auto 2.5rem'
          }}>
            Say goodbye to chaotic WhatsApp groups and ghosting. CampusSwap gives students structured offer negotiations, atomic item reservations, real-time private chat, and mutual handover confirmation.
          </p>

          {/* CTAs */}
          <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            {isAuthenticated ? (
              <>
                <Link to="/listings/create" className="btn btn-gradient" style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }}>
                  <span>Sell / Swap an Item</span>
                  <ArrowRight size={18} />
                </Link>
                <Link to="/my-listings" className="btn btn-secondary" style={{ padding: '0.85rem 1.5rem', fontSize: '1rem' }}>
                  <span>View My Dashboard</span>
                </Link>
              </>
            ) : (
              <>
                <Link to="/register" className="btn btn-gradient" style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }}>
                  <span>Get Started Free</span>
                  <ArrowRight size={18} />
                </Link>
                <Link to="/login" className="btn btn-secondary" style={{ padding: '0.85rem 1.5rem', fontSize: '1rem' }}>
                  <span>Sign In with Demo Account</span>
                </Link>
              </>
            )}
          </div>

          {/* Welcome status if logged in */}
          {isAuthenticated && (
            <div className="animate-fade-in" style={{
              marginTop: '2rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: 'var(--radius-full)',
              color: '#6ee7b7',
              fontSize: '0.875rem'
            }}>
              <CheckCircle2 size={16} />
              <span>Signed in as <strong>{user?.name}</strong> ({user?.college}) • Ready to trade</span>
            </div>
          )}
        </div>
      </section>

      {/* 4 Core Workflows Grid */}
      <section className="container">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>
            Engineered Beyond "Basic CRUD"
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
            Four robust workflows powered by server-enforced state machines, atomic reservation, and real-time sockets.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.5rem',
        }}>
          {/* Card 1 */}
          <div className="glass-panel" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{
              width: '3rem',
              height: '3rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShoppingBag size={24} color="#818cf8" />
            </div>
            <h3 style={{ fontSize: '1.25rem' }}>1. Listings & Search</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5 }}>
              Create rich listings with Cloudinary image uploads. Choose cash sale, swap trade, or both. Full-text search and category filtering.
            </p>
            <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#818cf8', fontSize: '0.75rem', fontWeight: '600' }}>
              <span>Phase 2: In Queue</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="glass-panel" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{
              width: '3rem',
              height: '3rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(236, 72, 153, 0.15)',
              border: '1px solid rgba(236, 72, 153, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ArrowLeftRight size={24} color="#f472b6" />
            </div>
            <h3 style={{ fontSize: '1.25rem' }}>2. Structured Offers</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5 }}>
              Make cash, swap item, or cash+swap offers. Sellers accept, reject, or counter. Concurrency-safe acceptance auto-rejects all competing offers.
            </p>
            <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#f472b6', fontSize: '0.75rem', fontWeight: '600' }}>
              <span>Phase 3: State Machine</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="glass-panel" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{
              width: '3rem',
              height: '3rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(14, 165, 233, 0.15)',
              border: '1px solid rgba(14, 165, 233, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <MessageSquare size={24} color="#38bdf8" />
            </div>
            <h3 style={{ fontSize: '1.25rem' }}>3. Real-Time Chat</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5 }}>
              Dedicated private conversation per listing & buyer pair. Socket.io authenticated rooms with participant-only authorization and system deal updates.
            </p>
            <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#38bdf8', fontSize: '0.75rem', fontWeight: '600' }}>
              <span>Phase 4: Sockets & Polling</span>
            </div>
          </div>

          {/* Card 4 */}
          <div className="glass-panel" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{
              width: '3rem',
              height: '3rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CheckCircle2 size={24} color="#34d399" />
            </div>
            <h3 style={{ fontSize: '1.25rem' }}>4. Deal Handover & Trust</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5 }}>
              Atomic reservation locks the listing. Both buyer and seller physically confirm the item handover before deal closes and ratings are updated.
            </p>
            <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#34d399', fontSize: '0.75rem', fontWeight: '600' }}>
              <span>Phase 5: Reviews & Trust</span>
            </div>
          </div>
        </div>
      </section>

      {/* State Machine Architecture Callout */}
      <section className="container">
        <div className="glass-panel" style={{
          padding: '2.5rem',
          background: 'linear-gradient(135deg, rgba(18, 24, 38, 0.95) 0%, rgba(26, 34, 54, 0.95) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.25)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <Layers size={22} color="#818cf8" />
            <span style={{ fontSize: '0.875rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#a5b4fc' }}>
              Backend State Machine Flow
            </span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
            marginTop: '1.5rem'
          }}>
            <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <h4 style={{ fontSize: '0.9375rem', color: '#ffffff', marginBottom: '0.5rem' }}>
                Listing Lifecycle
              </h4>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                active ➔ reserved ➔ sold / swapped
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                If deal is cancelled, status reverts automatically to <code>active</code>.
              </p>
            </div>

            <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <h4 style={{ fontSize: '0.9375rem', color: '#ffffff', marginBottom: '0.5rem' }}>
                Offer Lifecycle
              </h4>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                pending ➔ accepted | rejected | countered | withdrawn
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                Countering marks original as <code>countered</code> and creates new linked pending offer.
              </p>
            </div>

            <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <h4 style={{ fontSize: '0.9375rem', color: '#ffffff', marginBottom: '0.5rem' }}>
                Deal Lifecycle
              </h4>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                awaiting_handover ➔ completed | cancelled
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                Requires both <code>buyerConfirmed</code> and <code>sellerConfirmed</code> to complete.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
