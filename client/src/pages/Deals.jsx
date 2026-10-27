import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import api from '../api/axios';
import StateMessage from '../components/StateMessage';
import { formatPrice, getErrorMessage } from '../constants/listing';
import { useAuth } from '../context/AuthContext';

const statusClass = {
  awaiting_handover: 'badge badge-blue',
  completed: 'badge badge-green',
  cancelled: 'badge badge-red',
};

const statusLabel = {
  awaiting_handover: 'Awaiting handover',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const Deals = () => {
  const { user } = useAuth();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [notes, setNotes] = useState({});

  const loadDeals = async () => {
    setLoading(true);
    setActionError('');

    try {
      const res = await api.get('/deals');
      setDeals(res.data.deals || []);
    } catch (err) {
      setActionError(getErrorMessage(err, 'Could not load deals.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeals();
  }, []);

  const confirmDeal = async (deal) => {
    setBusyId(deal.id);
    setActionError('');

    try {
      await api.patch(`/deals/${deal.id}/confirm`, {
        handoverNote: notes[deal.id] || '',
      });
      await loadDeals();
    } catch (err) {
      setActionError(getErrorMessage(err, 'Could not confirm the handover.'));
    } finally {
      setBusyId(null);
    }
  };

  const cancelDeal = async (deal) => {
    if (!window.confirm('Cancel this deal and release the listing?')) return;

    setBusyId(deal.id);
    setActionError('');

    try {
      await api.patch(`/deals/${deal.id}/cancel`);
      await loadDeals();
    } catch (err) {
      setActionError(getErrorMessage(err, 'Could not cancel the deal.'));
    } finally {
      setBusyId(null);
    }
  };

  const isBuyer = (deal) => deal.buyer?.id === user?.id;

  return (
    <div className="container" style={{ padding: '2rem 1.5rem 4rem', maxWidth: '950px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: '800' }}>
          Deals
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
          Complete handovers safely with mutual confirmation.
        </p>
      </div>

      {actionError && (
        <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
          {actionError}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div className="skeleton" style={{ height: '230px' }} />
          <div className="skeleton" style={{ height: '230px' }} />
        </div>
      ) : deals.length === 0 ? (
        <StateMessage
          variant="empty"
          title="No deals yet"
          message="Accepted offers will create deals that appear here."
        />
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {deals.map((deal) => {
            const participant = isBuyer(deal) ? deal.seller : deal.buyer;
            const buyerConfirmed = deal.buyerConfirmed;
            const sellerConfirmed = deal.sellerConfirmed;
            const currentUserConfirmed = isBuyer(deal)
              ? buyerConfirmed
              : sellerConfirmed;

            return (
              <div key={deal.id} className="card" style={{ padding: '1.25rem' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <div>
                    <Link
                      to={`/listings/${deal.listing?.id || deal.listing?._id}`}
                      style={{
                        fontSize: '1.05rem',
                        fontWeight: '800',
                        color: 'var(--text-main)',
                        textDecoration: 'none',
                      }}
                    >
                      {deal.listing?.title || 'Listing'}
                    </Link>

                    <p
                      style={{
                        marginTop: '0.3rem',
                        fontSize: '0.8125rem',
                        color: 'var(--text-muted)',
                      }}
                    >
                      {isBuyer(deal) ? 'Seller' : 'Buyer'}: {participant?.name || 'Unknown'}
                    </p>
                  </div>

                  <span className={statusClass[deal.status] || 'badge'}>
                    {statusLabel[deal.status] || deal.status}
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: '2rem',
                    flexWrap: 'wrap',
                    marginTop: '1rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid var(--border-subtle)',
                  }}
                >
                  <div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Agreed price
                    </p>
                    <p style={{ fontWeight: '800', color: 'var(--brand-primary)' }}>
                      {formatPrice(deal.amount)}
                    </p>
                  </div>

                  <div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Buyer
                    </p>
                    <p style={{ fontWeight: '700' }}>
                      {buyerConfirmed ? 'Confirmed' : 'Waiting'}
                    </p>
                  </div>

                  <div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Seller
                    </p>
                    <p style={{ fontWeight: '700' }}>
                      {sellerConfirmed ? 'Confirmed' : 'Waiting'}
                    </p>
                  </div>
                </div>

                {deal.handoverNote && (
                  <div
                    style={{
                      marginTop: '1rem',
                      padding: '0.75rem',
                      background: '#f8fafc',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.875rem',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <strong>Handover note:</strong> {deal.handoverNote}
                  </div>
                )}

                {deal.status === 'awaiting_handover' && (
                  <div
                    style={{
                      marginTop: '1rem',
                      paddingTop: '1rem',
                      borderTop: '1px solid var(--border-subtle)',
                    }}
                  >
                    {!currentUserConfirmed && (
                      <>
                        <label
                          htmlFor={`note-${deal.id}`}
                          style={{
                            display: 'block',
                            fontSize: '0.8125rem',
                            fontWeight: '600',
                            marginBottom: '0.35rem',
                          }}
                        >
                          Handover note
                        </label>

                        <textarea
                          id={`note-${deal.id}`}
                          value={notes[deal.id] || ''}
                          onChange={(e) =>
                            setNotes((current) => ({
                              ...current,
                              [deal.id]: e.target.value,
                            }))
                          }
                          maxLength={500}
                          rows={3}
                          placeholder="Where and when did you hand over the item?"
                          style={{
                            width: '100%',
                            resize: 'vertical',
                            padding: '0.7rem',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: 'var(--radius-sm)',
                            fontFamily: 'inherit',
                          }}
                        />
                      </>
                    )}

                    <div
                      style={{
                        display: 'flex',
                        gap: '0.6rem',
                        flexWrap: 'wrap',
                        marginTop: '0.75rem',
                      }}
                    >
                      <button
                        className="btn btn-primary"
                        onClick={() => confirmDeal(deal)}
                        disabled={busyId === deal.id || currentUserConfirmed}
                      >
                        <CheckCircle2 size={15} />
                        {currentUserConfirmed
                          ? 'You confirmed'
                          : busyId === deal.id
                            ? 'Confirming...'
                            : 'Confirm handover'}
                      </button>

                      <button
                        className="btn btn-outline"
                        onClick={() => cancelDeal(deal)}
                        disabled={busyId === deal.id}
                      >
                        <XCircle size={15} />
                        Cancel deal
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!loading && (
        <button
          className="btn btn-outline"
          onClick={loadDeals}
          style={{ marginTop: '1.25rem' }}
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      )}
    </div>
  );
};

export default Deals;
