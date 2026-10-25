import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShoppingBag,
  Tag,
  ArrowLeftRight,
  MessageSquare,
  CheckCircle2,
  Shield,
  LogOut,
  User,
  PlusCircle,
  Menu,
  X,
  Star
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const navLinkStyle = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontSize: '0.875rem',
    fontWeight: isActive ? '600' : '500',
    color: isActive ? '#ffffff' : 'var(--text-secondary)',
    transition: 'color var(--transition-fast)',
    padding: '0.4rem 0.6rem',
    borderRadius: 'var(--radius-sm)',
    background: isActive ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
  });

  return (
    <header className="glass-nav">
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '4.25rem' }}>
        
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '2.5rem',
            height: '2.5rem',
            borderRadius: 'var(--radius-md)',
            background: 'var(--brand-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <ShoppingBag size={20} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.02em', background: 'linear-gradient(to right, #ffffff, #c7d2fe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                CampusSwap
              </span>
              <span className="badge badge-campus" style={{ fontSize: '0.65rem', padding: '0.15rem 0.45rem' }}>
                MERN
              </span>
            </div>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1 }}>Student Marketplace</p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav style={{ display: 'none', alignItems: 'center', gap: '0.5rem' }} className="desktop-nav">
          <NavLink to="/" style={navLinkStyle}>
            Marketplace
          </NavLink>

          {isAuthenticated && (
            <>
              <NavLink to="/listings/create" style={navLinkStyle}>
                <PlusCircle size={16} />
                Sell / Swap
              </NavLink>
              <NavLink to="/my-listings" style={navLinkStyle}>
                <Tag size={16} />
                My Listings
              </NavLink>
              <NavLink to="/my-offers" style={navLinkStyle}>
                <ArrowLeftRight size={16} />
                Offers
              </NavLink>
              <NavLink to="/inbox" style={navLinkStyle}>
                <MessageSquare size={16} />
                Chat
              </NavLink>
              <NavLink to="/deals" style={navLinkStyle}>
                <CheckCircle2 size={16} />
                Deals
              </NavLink>
              {isAdmin && (
                <NavLink to="/admin" style={navLinkStyle}>
                  <Shield size={16} color="#ec4899" />
                  <span style={{ color: '#ec4899' }}>Admin</span>
                </NavLink>
              )}
            </>
          )}
        </nav>

        {/* Auth CTA Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-surface)', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ width: '1.75rem', height: '1.75rem', borderRadius: '50%', background: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.8rem' }}>
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: 'var(--text-main)', lineHeight: 1.1 }}>
                    {user?.name}
                  </span>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                    {user?.college || 'Campus'}
                  </span>
                </div>
                {user?.ratingAvg > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.15rem', marginLeft: '0.3rem', color: 'var(--accent-amber)', fontSize: '0.75rem', fontWeight: '600' }}>
                    <Star size={12} fill="currentColor" />
                    <span>{user.ratingAvg.toFixed(1)}</span>
                  </div>
                )}
              </div>

              <button
                onClick={handleLogout}
                className="btn btn-secondary"
                title="Sign Out"
                style={{ padding: '0.5rem 0.85rem' }}
              >
                <LogOut size={16} />
                <span className="desktop-only">Logout</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Link to="/login" className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>
                Sign In
              </Link>
              <Link to="/register" className="btn btn-gradient" style={{ padding: '0.5rem 1.1rem' }}>
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-toggle"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-main)',
              padding: '0.4rem',
              display: 'none',
              cursor: 'pointer'
            }}
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div style={{
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '1rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          <Link to="/" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--text-main)', padding: '0.5rem 0' }}>
            Marketplace
          </Link>
          {isAuthenticated && (
            <>
              <Link to="/listings/create" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--text-main)', padding: '0.5rem 0' }}>
                Sell / Swap Item
              </Link>
              <Link to="/my-listings" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--text-main)', padding: '0.5rem 0' }}>
                My Listings
              </Link>
              <Link to="/my-offers" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--text-main)', padding: '0.5rem 0' }}>
                My Offers
              </Link>
              <Link to="/inbox" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--text-main)', padding: '0.5rem 0' }}>
                Inbox / Messages
              </Link>
              <Link to="/deals" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--text-main)', padding: '0.5rem 0' }}>
                Active Deals
              </Link>
              {isAdmin && (
                <Link to="/admin" onClick={() => setMobileMenuOpen(false)} style={{ color: '#ec4899', padding: '0.5rem 0' }}>
                  Admin Dashboard
                </Link>
              )}
            </>
          )}
        </div>
      )}

      {/* Responsive CSS for desktop vs mobile */}
      <style>{`
        @media (min-width: 820px) {
          .desktop-nav { display: flex !important; }
          .mobile-toggle { display: none !important; }
          .desktop-only { display: inline !important; }
        }
        @media (max-width: 819px) {
          .desktop-nav { display: none !important; }
          .mobile-toggle { display: block !important; }
          .desktop-only { display: none !important; }
        }
      `}</style>
    </header>
  );
};

export default Navbar;
