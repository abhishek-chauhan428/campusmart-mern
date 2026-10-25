import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash2, Star, MapPin, Info, ImageOff } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import StateMessage from '../components/StateMessage';
import { formatPrice, getErrorMessage, STATUS_BADGES } from '../constants/listing';

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // { status, message }
  const [activeImage, setActiveImage] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    api
      .get(`/listings/${id}`, { signal: controller.signal })
      .then((res) => {
        setListing(res.data.listing);
        setActiveImage(0);
      })
      .catch((err) => {
        if (err.code === 'ERR_CANCELED') return;
        setError({ status: err.response?.status, message: getErrorMessage(err, 'Could not load this listing.') });
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [id, reloadKey]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this listing? This cannot be undone.')) return;
    setDeleting(true);
    setActionError('');
    try {
      await api.delete(`/listings/${id}`);
      navigate('/my-listings', { replace: true });
    } catch (err) {
      setActionError(getErrorMessage(err, 'Could not delete the listing.'));
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        <div className="detail-layout">
          <div className="skeleton" style={{ aspectRatio: '1 / 1', borderRadius: 'var(--radius-lg)' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="skeleton" style={{ height: '2rem', width: '70%' }} />
            <div className="skeleton" style={{ height: '2rem', width: '30%' }} />
            <div className="skeleton" style={{ height: '8rem' }} />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    const notFound = error.status === 404 || error.status === 400;
    return (
      <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '640px' }}>
        <StateMessage
          variant={notFound ? 'empty' : 'error'}
          title={notFound ? 'Listing not found' : "Couldn't load listing"}
          message={notFound ? 'It may have been removed by the seller.' : error.message}
          action={
            notFound ? (
              <Link to="/" className="btn btn-primary">Back to marketplace</Link>
            ) : (
              <button className="btn btn-primary" onClick={() => setReloadKey((k) => k + 1)}>Try again</button>
            )
          }
        />
      </div>
    );
  }

  const isOwner = isAuthenticated && user?.id === listing.seller?.id;
  const status = STATUS_BADGES[listing.status];
  const seller = listing.seller;
  const images = listing.images || [];

  return (
    <div className="container" style={{ padding: '1.5rem 1.5rem 4rem' }}>
      <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>
        <ArrowLeft size={16} />
        <span>Back to listings</span>
      </Link>

      <div className="detail-layout">
        {/* Gallery */}
        <div>
          <div className="product-image-container" style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
            {images[activeImage] ? (
              <img src={images[activeImage].url} alt={listing.title} className="product-image" style={{ objectFit: 'contain', background: '#fff' }} />
            ) : (
              <ImageOff size={40} color="var(--text-muted)" />
            )}
          </div>
          {images.length > 1 && (
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
              {images.map((img, i) => (
                <button
                  key={img.publicId}
                  onClick={() => setActiveImage(i)}
                  aria-label={`Show image ${i + 1}`}
                  className={`thumb ${i === activeImage ? 'thumb-active' : ''}`}
                >
                  <img src={img.url} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {status && <span className={status.className}>{status.label}</span>}
            <span className="badge badge-blue">{listing.condition}</span>
            <span className="badge badge-blue">{listing.category}</span>
          </div>

          <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: '800', letterSpacing: '-0.02em' }}>{listing.title}</h1>
          <p style={{ fontSize: '1.875rem', fontWeight: '800', color: 'var(--brand-primary)' }}>{formatPrice(listing.price)}</p>

          {listing.status !== 'active' && (
            <div className="alert" style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', marginBottom: 0 }}>
              <Info size={18} style={{ flexShrink: 0 }} />
              <span>
                {listing.status === 'reserved'
                  ? 'This item has been reserved for a buyer.'
                  : 'This item has been sold.'}
              </span>
            </div>
          )}

          <div>
            <h3 style={{ fontSize: '0.9375rem', marginBottom: '0.35rem' }}>Description</h3>
            <p style={{ color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{listing.description}</p>
          </div>

          {/* Seller card */}
          <div className="card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <div style={{ width: '2.75rem', height: '2.75rem', borderRadius: '50%', background: 'var(--brand-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '1.1rem', flexShrink: 0 }}>
              {seller?.name?.charAt(0).toUpperCase() || '?'}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontWeight: '700' }}>{isOwner ? `${seller?.name} (you)` : seller?.name || 'Unknown seller'}</p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <MapPin size={12} />
                <span>{seller?.college}</span>
              </p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.15rem' }}>
                <Star size={13} fill={seller?.ratingCount ? 'var(--accent-amber)' : 'none'} color="var(--accent-amber)" />
                {seller?.ratingCount ? (
                  <span>{seller.ratingAvg.toFixed(1)} ({seller.ratingCount} {seller.ratingCount === 1 ? 'rating' : 'ratings'})</span>
                ) : (
                  <span>No ratings yet</span>
                )}
              </p>
            </div>
          </div>

          {actionError && (
            <div className="alert alert-error" role="alert" style={{ marginBottom: 0 }}>
              <span>{actionError}</span>
            </div>
          )}

          {/* Owner actions */}
          {isOwner && (
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {listing.status === 'active' ? (
                <>
                  <Link to={`/listings/${listing.id}/edit`} className="btn btn-outline">
                    <Pencil size={15} />
                    <span>Edit</span>
                  </Link>
                  <button className="btn btn-outline" style={{ color: 'var(--accent-rose)' }} onClick={handleDelete} disabled={deleting}>
                    <Trash2 size={15} />
                    <span>{deleting ? 'Deleting...' : 'Delete'}</span>
                  </button>
                </>
              ) : (
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-light)' }}>
                  Reserved and sold listings can't be edited or deleted.
                </p>
              )}
            </div>
          )}

          {/* Phase 3 goes here: "Chat with seller" button for logged-in non-owners (hidden for the seller) */}
        </div>
      </div>
    </div>
  );
};

export default ListingDetail;
