import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Package } from 'lucide-react';
import api from '../api/axios';
import { formatPrice, getErrorMessage } from '../constants/listing';
import ListingCard from '../components/ListingCard';

const Profile = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [userRes, listingsRes] = await Promise.all([
          api.get(`/auth/users/${id}`).catch(() => null),
          api.get('/listings', { params: { seller: id, limit: 8 } }).catch(() => ({ data: { listings: [] } })),
        ]);
        setProfile(userRes?.data?.user || null);
        setListings(listingsRes.data.listings || []);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '3rem 1.5rem' }}>
        <div className="skeleton" style={{ height: '120px', borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem' }} />
        <div className="listing-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton" style={{ height: '260px', borderRadius: 'var(--radius-lg)' }} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--accent-rose)', marginBottom: '1rem' }}>{error}</p>
        <Link to="/" className="btn btn-primary">Go home</Link>
      </div>
    );
  }

  const name = profile?.name || 'Campus Seller';
  const college = profile?.college || '';
  const ratingAvg = profile?.ratingAvg || 0;
  const ratingCount = profile?.ratingCount || 0;

  return (
    <div className="container" style={{ padding: '2rem 1.5rem 4rem', maxWidth: '960px' }}>
      {/* Profile header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '1.5rem',
        padding: '1.5rem', marginBottom: '2rem',
        background: '#fff', border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)',
      }}>
        <div style={{
          width: '4rem', height: '4rem', borderRadius: '50%',
          background: 'var(--brand-primary)', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.5rem', fontWeight: '800', flexShrink: 0,
        }}>
          {name.charAt(0).toUpperCase()}
        </div>

        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>{name}</h1>
          {college && <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '0.2rem 0 0' }}>{college}</p>}

          <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.6rem', flexWrap: 'wrap' }}>
            {ratingCount > 0 ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                <Star size={15} fill="#f59e0b" color="#f59e0b" />
                <strong>{ratingAvg.toFixed(1)}</strong>
                <span>({ratingCount} {ratingCount === 1 ? 'deal' : 'deals'})</span>
              </span>
            ) : (
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>New seller</span>
            )}
          </div>
        </div>
      </div>

      {/* Active listings */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <Package size={18} color="var(--brand-primary)" />
        <h2 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0 }}>Active listings</h2>
      </div>

      {listings.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', padding: '1.5rem 0' }}>No active listings.</p>
      ) : (
        <div className="listing-grid">
          {listings.map((item) => (
            <ListingCard key={item.id || item._id} listing={item} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Profile;
