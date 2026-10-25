import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShoppingBag,
  Heart,
  ShoppingCart,
  User,
  LogOut,
  PlusCircle,
  Menu,
  X,
  Shield,
  MessageSquare,
  ArrowLeftRight,
  CheckCircle2
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    isActive ? 'nav-link active' : 'nav-link';

  return (
    <header className="shop-header">
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '4.5rem' }}>
        
        {/* Brand Logo - Matching reference image */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--brand-primary)',
          }}>
            <ShoppingBag size={26} strokeWidth={2.4} />
          </div>
          <span style={{
            fontSize: '1.45rem',
            fontWeight: '800',
            letterSpacing: '-0.02em',
            color: 'var(--brand-primary)',
            fontFamily: 'var(--font-heading)'
          }}>
            Shop
          </span>
        </Link>

        {/* Center Navigation - Minimal & Clean */}
        <nav style={{ display: 'none', alignItems: 'center', gap: '2rem' }} className="desktop-nav">
          <NavLink to="/" end className={navLinkClass}>
            Home
          </NavLink>
          <NavLink to="/shop" className={navLinkClass}>
            Shop
          </NavLink>

          {isAuthenticated && (
            <>
              <NavLink to="/listings/create" className={navLinkClass}>
                Sell
              </NavLink>
              <NavLink to="/my-offers" className={navLinkClass}>
                Offers
              </NavLink>
              <NavLink to="/inbox" className={navLinkClass}>
                Chat
              </NavLink>
              <NavLink to="/deals" className={navLinkClass}>
                Deals
              </NavLink>
              {isAdmin && (
                <NavLink to="/admin" className={navLinkClass} style={{ color: 'var(--accent-rose)', fontWeight: '700' }}>
                  Admin
                </NavLink>
              )}
            </>
          )}
        </nav>

        {/* Right Icon Actions - Exact reference style */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          
          {/* Wishlist Heart Icon */}
          <button className="btn-icon" title="Wishlist" aria-label="Wishlist">
            <Heart size={21} strokeWidth={2} />
          </button>

          {/* Cart / Deals Shopping Bag Icon with badge */}
          <Link to={isAuthenticated ? "/deals" : "/login"} className="btn-icon" title="Cart & Deals" aria-label="Cart">
            <ShoppingCart size={21} strokeWidth={2} />
            <span className="badge-count">0</span>
          </Link>

          {/* Auth Button or User Profile */}
          {isAuthenticated ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.35rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  background: '#f1f5f9',
                  border: '1px solid var(--border-subtle)',
                  cursor: 'pointer'
                }}
              >
                <div style={{
                  width: '1.75rem',
                  height: '1.75rem',
                  borderRadius: '50%',
                  background: 'var(--brand-primary)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  fontWeight: '700'
                }}>
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-main)' }}>
                  {user?.name?.split(' ')[0]}
                </span>
              </button>

              {/* User Dropdown */}
              {userDropdownOpen && (
                <div className="card" style={{
                  position: 'absolute',
                  right: 0,
                  top: '110%',
                  width: '210px',
                  padding: '0.5rem',
                  zIndex: 100,
                  boxShadow: 'var(--shadow-lg)'
                }}>
                  <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
                    <p style={{ fontWeight: '700', fontSize: '0.875rem' }}>{user?.name}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.college}</p>
                  </div>
                  <Link
                    to="/my-listings"
                    onClick={() => setUserDropdownOpen(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', fontSize: '0.875rem', color: 'var(--text-main)', borderRadius: 'var(--radius-sm)' }}
                  >
                    My Listings
                  </Link>
                  <Link
                    to="/my-offers"
                    onClick={() => setUserDropdownOpen(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', fontSize: '0.875rem', color: 'var(--text-main)', borderRadius: 'var(--radius-sm)' }}
                  >
                    Offers & Counter-offers
                  </Link>
                  <button
                    onClick={handleLogout}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 0.75rem',
                      fontSize: '0.875rem',
                      color: 'var(--accent-rose)',
                      background: 'none',
                      textAlign: 'left',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer'
                    }}
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.875rem' }}>
              Sign In
            </Link>
          )}

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="btn-icon mobile-toggle"
            style={{ display: 'none' }}
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div style={{
          background: '#ffffff',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '1rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          <Link to="/" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--text-main)', fontWeight: '600' }}>
            Home
          </Link>
          <Link to="/shop" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--text-main)', fontWeight: '600' }}>
            Shop
          </Link>
          {isAuthenticated && (
            <>
              <Link to="/listings/create" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--text-main)' }}>
                Sell an Item
              </Link>
              <Link to="/my-offers" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--text-main)' }}>
                Offers
              </Link>
              <Link to="/inbox" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--text-main)' }}>
                Chat
              </Link>
              <Link to="/deals" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--text-main)' }}>
                Deals
              </Link>
            </>
          )}
        </div>
      )}

      {/* Navbar Custom Scoped Styles */}
      <style>{`
        .nav-link {
          font-size: 0.9375rem;
          font-weight: 500;
          color: var(--text-secondary);
          transition: color var(--transition-fast);
          text-decoration: none;
        }
        .nav-link:hover, .nav-link.active {
          color: var(--brand-primary);
          font-weight: 600;
        }
        @media (min-width: 768px) {
          .desktop-nav { display: flex !important; }
          .mobile-toggle { display: none !important; }
        }
        @media (max-width: 767px) {
          .desktop-nav { display: none !important; }
          .mobile-toggle { display: flex !important; }
        }
      `}</style>
    </header>
  );
};

export default Navbar;
