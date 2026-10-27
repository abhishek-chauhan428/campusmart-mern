import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, X, Undo2, RefreshCw, ArrowRight } from 'lucide-react';
import api from '../api/axios';
import StateMessage from '../components/StateMessage';
import { formatPrice, getErrorMessage } from '../constants/listing';

const statusLabel = {
  pending: 'Pending',
  accepted: 'Accepted',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
};

const statusClass = {
  pending: 'badge badge-blue',
  accepted: 'badge badge-green',
  rejected: 'badge badge-red',
  withdrawn: 'badge',
};

const OfferCard = ({
  offer,
  received,
  onAccept,
  onReject,
  onWithdraw,
  busyId,
}) => {
  const listing = offer.listing;
  const person = received ? offer.buyer : offer.seller;
  const busy = busyId === offer.id;

  return (
    <div className="card" style={{ padding: '1rem 1.1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ minWidth: 0 }}>
          <Link
            to={`/listings/${listing?.id || listing?._id}`}
            style={{ fontWeight: '700', color: 'var(--text-main)', textDecoration: 'none' }}
          >
            {listing?.title || 'Listing'}
          </Link>

          <p style={{ marginTop: '0.3rem', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
            {received ? 'From' : 'Seller'}: {person?.name || 'Unknown user'}
          </p>
        </div>

        <span className={statusClass[offer.status] || 'badge'}>
          {statusLabel[offer.status] || offer.status}
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          marginTop: '1rem',
          paddingTop: '0.85rem',
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        <div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Offer</p>
          <p style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--brand-primary)' }}>
            {formatPrice(offer.amount)}
          </p>
        </div>

        {listing?.price != null && (
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Listed</p>
            <p style={{ fontWeight: '700' }}>{formatPrice(listing.price)}</p>
          </div>
        )}
      </div>

      {offer.message && (
        <div
          style={{
            marginTop: '0.85rem',
            padding: '0.75rem',
            background: '#f8fafc',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-secondary)',
            fontSize: '0.875rem',
          }}
        >
          “{offer.message}”
        </div>
      )}

      {offer.status === 'pending' && (
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginTop: '1rem' }}>
          {received ? (
            <>
              <button
                className="btn btn-primary"
                onClick={() => onAccept(offer.id)}
                disabled={busy}
              >
                <Check size={15} />
                {busy ? 'Processing...' : 'Accept'}
              </button>

              <button
                className="btn btn-outline"
                onClick={() => onReject(offer.id)}
                disabled={busy}
              >
                <X size={15} />
                Reject
              </button>
            </>
          ) : (
            <button
              className="btn btn-outline"
              onClick={() => onWithdraw(offer.id)}
              disabled={busy}
            >
              <Undo2 size={15} />
              {busy ? 'Withdrawing...' : 'Withdraw'}
            </button>
          )}
        </div>
      )}

      {offer.status === 'accepted' && (
        <div style={{ marginTop: '1rem' }}>
          <Link
            to="/deals"
            className="btn btn-outline"
            style={{ display: 'inline-flex' }}
          >
            View deal
            <ArrowRight size={15} />
          </Link>
        </div>
      )}
    </div>
  );
};

const Offers = () => {
  const [tab, setTab] = useState('received');
  const [received, setReceived] = useState([]);
  const [sent, setSent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const loadOffers = async () => {
    setLoading(true);
    setActionError('');

    try {
      const [receivedRes, sentRes] = await Promise.all([
        api.get('/offers/received'),
        api.get('/offers/sent'),
      ]);

      setReceived((receivedRes.data.offers || []).filter((offer) => offer.status !== 'withdrawn'));
      setSent((sentRes.data.offers || []).filter((offer) => offer.status !== 'withdrawn'));
    } catch (err) {
      setActionError(getErrorMessage(err, 'Could not load offers.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOffers();
  }, []);

  const runAction = async (id, action, successMessage) => {
    setBusyId(id);
    setActionError('');

    try {
      await api.patch(`/offers/${id}/${action}`);
      await loadOffers();
      if (successMessage) {
        window.alert(successMessage);
      }
    } catch (err) {
      setActionError(getErrorMessage(err, 'Could not update the offer.'));
    } finally {
      setBusyId(null);
    }
  };

  const offers = tab === 'received' ? received : sent;

  return (
    <div className="container" style={{ padding: '2rem 1.5rem 4rem', maxWidth: '900px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: '800' }}>
          Offers
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
          Manage offers you've received and sent.
        </p>
      </div>

      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: '1.25rem',
        }}
      >
        <button
          className={tab === 'received' ? 'btn btn-primary' : 'btn btn-outline'}
          onClick={() => setTab('received')}
        >
          Received ({received.length})
        </button>

        <button
          className={tab === 'sent' ? 'btn btn-primary' : 'btn btn-outline'}
          onClick={() => setTab('sent')}
        >
          Sent ({sent.length})
        </button>
      </div>

      {actionError && (
        <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
          {actionError}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div className="skeleton" style={{ height: '180px' }} />
          <div className="skeleton" style={{ height: '180px' }} />
        </div>
      ) : offers.length === 0 ? (
        <StateMessage
          variant="empty"
          title={tab === 'received' ? 'No offers received' : 'No offers sent'}
          message={
            tab === 'received'
              ? 'Offers from other students will appear here.'
              : 'Make an offer on an active listing to see it here.'
          }
        />
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {offers.map((offer) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              received={tab === 'received'}
              busyId={busyId}
              onAccept={(id) => runAction(id, 'accept', 'Offer accepted.')}
              onReject={(id) => runAction(id, 'reject')}
              onWithdraw={(id) => runAction(id, 'withdraw')}
            />
          ))}
        </div>
      )}

      {!loading && (
        <button
          className="btn btn-outline"
          onClick={loadOffers}
          style={{ marginTop: '1.25rem' }}
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      )}
    </div>
  );
};

export default Offers;
