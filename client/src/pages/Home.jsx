import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowRight, ShieldCheck, Sparkles, Filter } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const sampleListings = [
  {
    id: '1',
    title: 'Calculus & Analytical Geometry (4th Edition)',
    price: 450,
    originalPrice: 900,
    type: 'sell',
    category: 'Books',
    condition: 'Like New',
    college: 'DTU Campus',
    image: '/listing-calculus.jpg',
  },
  {
    id: '2',
    title: 'Wireless Noise-Cancelling Studio Headphones',
    price: 1850,
    originalPrice: 3500,
    type: 'both',
    category: 'Electronics',
    condition: 'Excellent',
    college: 'Hostel Block B',
    image: '/listing-headphones.jpg',
  },
  {
    id: '3',
    title: 'Commuter 21-Speed City Bicycle',
    price: 3200,
    originalPrice: 6500,
    type: 'swap',
    category: 'Bicycles',
    condition: 'Good',
    college: 'Main Campus',
    image: '/listing-bicycle.jpg',
  },
  {
    id: '4',
    title: 'LED Architect Multi-Angle Desk Lamp',
    price: 590,
    originalPrice: 1200,
    type: 'sell',
    category: 'Hostel',
    condition: 'Like New',
    college: 'Hostel Block C',
    image: '/listing-lamp.jpg',
  },
];

const categories = ['All', 'Books', 'Electronics', 'Bicycles', 'Hostel'];

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [wishlist, setWishlist] = useState({});

  const toggleWishlist = (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlist((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredListings =
    selectedCategory === 'All'
      ? sampleListings
      : sampleListings.filter((item) => item.category === selectedCategory);

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
                DIRECT CHAT • FORMAL OFFERS
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

      {/* "Suggested for you" Section - Matching reference layout */}
      <section className="container">
        
        {/* Section Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem'
        }}>
          <h2 style={{
            fontSize: '1.625rem',
            fontWeight: '800',
            color: 'var(--text-main)',
            letterSpacing: '-0.02em',
          }}>
            Suggested for you
          </h2>

          <Link
            to="/shop"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              color: 'var(--brand-primary)',
              fontWeight: '600',
              fontSize: '0.9375rem',
              transition: 'opacity var(--transition-fast)'
            }}
          >
            <span>Discover More</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Minimal Category Chips */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          overflowX: 'auto',
          paddingBottom: '0.5rem',
          marginBottom: '1.5rem'
        }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`chip ${selectedCategory === cat ? 'chip-active' : ''}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 4-Item Product Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '1.5rem',
        }}>
          {filteredListings.map((item) => (
            <div key={item.id} className="product-card">
              
              {/* Image & Wishlist Button */}
              <div className="product-image-container">
                <img src={item.image} alt={item.title} className="product-image" />
                
                <button
                  onClick={(e) => toggleWishlist(item.id, e)}
                  className="product-wishlist-btn"
                  title="Add to Wishlist"
                  aria-label="Wishlist"
                >
                  <Heart
                    size={16}
                    fill={wishlist[item.id] ? 'var(--accent-rose)' : 'none'}
                    color={wishlist[item.id] ? 'var(--accent-rose)' : 'currentColor'}
                  />
                </button>
              </div>

              {/* Card Body */}
              <div style={{ padding: '1.125rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="badge badge-blue">
                    {item.condition}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {item.college}
                  </span>
                </div>

                <h3 style={{
                  fontSize: '0.9375rem',
                  fontWeight: '700',
                  color: 'var(--text-main)',
                  lineHeight: 1.35,
                  minHeight: '2.6rem',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {item.title}
                </h3>

                <div style={{ marginTop: 'auto', paddingTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)' }}>
                      ₹{item.price}
                    </span>
                    {item.originalPrice && (
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                        ₹{item.originalPrice}
                      </span>
                    )}
                  </div>

                  <Link
                    to={isAuthenticated ? `/my-offers` : `/login`}
                    className="btn btn-secondary"
                    style={{
                      padding: '0.35rem 0.75rem',
                      fontSize: '0.8125rem',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    {item.type === 'swap' ? 'Swap' : 'Offer'}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default Home;
