import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Pencil, Trash2 } from 'lucide-react';
import api from '../api/axios';
import ListingCard, { ListingCardSkeleton } from '../components/ListingCard';
import StateMessage from '../components/StateMessage';
import { getErrorMessage } from '../constants/listing';

const TABS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'reserved', label: 'Reserved' },
  { value: 'sold', label: 'Sold' },
];

const MyListings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('all');
  const [busyId, setBusyId] = useState(null);
  const [actionError, setActionError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    api
      .get('/listings/mine', { signal: controller.signal })
      .then((res) => setListings(res.data.listings))
      .catch((err) => {
        if (err.code === 'ERR_CANCELED') return;
        setError(getErrorMessage(err, 'Could not load your listings.'));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [reloadKey]);

  const handleDelete = async (listing) => {
    if (!window.confirm(`Delete "${listing.title}"? This cannot be undone.`)) return;
    setBusyId(listing.id);
    setActionError('');
    try {
      await api.delete(`/listings/${listing.id}`);
      setListings((prev) => prev.filter((l) => l.id !== listing.id));
    } catch (err) {
      setActionError(getErrorMessage(err, 'Could not delete the listing.'));
      // status may have changed (e.g. reserved meanwhile), so refresh
      setReloadKey((k) => k + 1);
    } finally {
      setBusyId(null);
    }
  };

  const visible = tab === 'all' ? listings : listings.filter((l) => l.status === tab);
  const count = (v) => (v === 'all' ? listings.length : listings.filter((l) => l.status === v).length);

  return (
    <div className="container" style={{ padding: '1.5rem 1.5rem 4rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        <h1 style={{ fontSize: '1.625rem', fontWeight: '800' }}>My listings</h1>
        <Link to="/listings/create" className="btn btn-primary">
          <PlusCircle size={16} />
          <span>New listing</span>
        </Link>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
        {TABS.map((t) => (
          <button key={t.value} className={`chip ${tab === t.value ? 'chip-active' : ''}`} onClick={() => setTab(t.value)}>
            {t.label} ({count(t.value)})
          </button>
        ))}
      </div>

      {actionError && (
        <div className="alert alert-error" role="alert"><span>{actionError}</span></div>
      )}

      {error ? (
        <StateMessage
          variant="error"
          title="Couldn't load your listings"
          message={error}
          action={<button className="btn btn-primary" onClick={() => setReloadKey((k) => k + 1)}>Try again</button>}
        />
      ) : loading ? (
        <div className="listing-grid">
          {Array.from({ length: 4 }).map((_, i) => <ListingCardSkeleton key={i} />)}
        </div>
      ) : visible.length === 0 ? (
        <StateMessage
          title={tab === 'all' ? "You haven't listed anything yet" : `No ${tab} listings`}
          message={tab === 'all' ? 'Sell books, cycles, electronics and hostel essentials to people on your campus.' : 'Listings will show up here as their status changes.'}
          action={tab === 'all' ? <Link to="/listings/create" className="btn btn-primary">List your first item</Link> : null}
        />
      ) : (
        <div className="listing-grid">
          {visible.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              showStatus
              footer={
                listing.status === 'active' ? (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Link to={`/listings/${listing.id}/edit`} className="btn btn-outline" style={{ flex: 1, padding: '0.45rem' }}>
                      <Pencil size={14} />
                      <span>Edit</span>
                    </Link>
                    <button className="btn btn-outline" style={{ flex: 1, padding: '0.45rem', color: 'var(--accent-rose)' }} onClick={() => handleDelete(listing)} disabled={busyId === listing.id}>
                      <Trash2 size={14} />
                      <span>{busyId === listing.id ? 'Deleting...' : 'Delete'}</span>
                    </button>
                  </div>
                ) : (
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Locked while {listing.status}</p>
                )
              }
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyListings;
