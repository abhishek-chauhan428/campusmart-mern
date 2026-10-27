import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Star,
  MapPin,
  Info,
  ImageOff,
  HandCoins,
  X,
} from 'lucide-react';

import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const formatPrice = (value) => {
  const amount = Number(value || 0);
  return `₹${amount.toLocaleString('en-IN')}`;
};

const getErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.message ||
  'Something went wrong. Please try again.';

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [myOffer, setMyOffer] = useState(null);
  const [offerLoading, setOfferLoading] = useState(false);
  const [offerError, setOfferError] = useState('');

  const listingId = listing?.id || listing?._id;
  const ownerId =
    listing?.seller?.id ||
    listing?.seller?._id ||
    listing?.owner?.id ||
    listing?.owner?._id ||
    listing?.user?.id ||
    listing?.user?._id;

  const currentUserId = user?.id || user?._id;

  const isOwner =
    Boolean(ownerId) &&
    Boolean(currentUserId) &&
    String(ownerId) === String(currentUserId);

  useEffect(() => {
    const loadListing = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await api.get(`/listings/${id}`);
        setListing(response.data.listing || response.data);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    loadListing();
  }, [id, reloadKey]);

  useEffect(() => {
    const loadMyOffer = async () => {
      if (!isAuthenticated || isOwner || !listingId) {
        setMyOffer(null);
        return;
      }

      try {
        const response = await api.get('/offers/sent');
        const offers = response.data.offers || [];

        const mine = offers.find((offer) => {
          const offerListingId =
            offer.listing?.id ||
            offer.listing?._id ||
            offer.listing;

          return String(offerListingId) === String(listingId);
        });

        setMyOffer(mine || null);
      } catch {
        setMyOffer(null);
      }
    };

    loadMyOffer();
  }, [isAuthenticated, isOwner, listingId, reloadKey]);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this listing?',
    );

    if (!confirmed) return;

    try {
      await api.delete(`/listings/${id}`);
      navigate('/my-listings');
    } catch (err) {
      window.alert(getErrorMessage(err));
    }
  };

  const handleMakeOffer = async (event) => {
    event.preventDefault();

    const amount = Number(offerAmount);

    if (!amount || amount <= 0) {
      setOfferError('Please enter a valid offer amount.');
      return;
    }

    try {
      setOfferLoading(true);
      setOfferError('');

      const response = await api.post(`/listings/${id}/offers`, {
        amount,
        message: offerMessage.trim(),
      });

      setMyOffer(response.data.offer || null);
      setOfferModalOpen(false);
      setOfferAmount('');
      setOfferMessage('');
      setReloadKey((value) => value + 1);
    } catch (err) {
      setOfferError(getErrorMessage(err));
    } finally {
      setOfferLoading(false);
    }
  };

  const handleWithdrawOffer = async () => {
    if (!myOffer) return;

    try {
      setOfferLoading(true);
      setOfferError('');

      await api.patch(`/offers/${myOffer.id || myOffer._id}/withdraw`);
      window.dispatchEvent(new Event('app:refresh-summary'));
      setMyOffer(null);
      setReloadKey((value) => value + 1);
    } catch (err) {
      setOfferError(getErrorMessage(err));
    } finally {
      setOfferLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="state-message">
          <p>Loading listing...</p>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="page-container">
        <div className="state-message error">
          <p>{error || 'Listing not found.'}</p>
          <Link to="/" className="btn btn-primary">
            Back to listings
          </Link>
        </div>
      </div>
    );
  }

  const seller =
    listing.seller || listing.owner || listing.user || {};

  const sellerName =
    seller.name ||
    seller.username ||
    seller.fullName ||
    'Campus seller';

  const title = listing.title || listing.name || 'Untitled listing';

  const description =
    listing.description || 'No description provided.';

  const price = listing.price || listing.amount || 0;

  const image =
    listing.images?.[0]?.url ||
    listing.images?.[0] ||
    listing.image ||
    listing.imageUrl ||
    null;

  const category = listing.category || 'Other';

  const location =
    listing.location ||
    listing.city ||
    listing.pickupLocation ||
    'Campus';

  const status = String(listing.status || 'active').toLowerCase();

  const isAvailable =
    status === 'active' ||
    status === 'available';

  const isReserved = status === 'reserved';
  const isSold = status === 'sold';

  const canMakeOffer =
    isAuthenticated &&
    !isOwner &&
    isAvailable;

  const offerStatus = myOffer?.status;

  return (
    <div className="page-container">
      <button
        type="button"
        className="back-button"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={18} />
        Back
      </button>

      <div className="listing-detail">
        <div className="listing-detail-image">
          {image ? (
            <img src={image} alt={title} />
          ) : (
            <div className="listing-image-placeholder">
              <ImageOff size={48} />
              <span>No image available</span>
            </div>
          )}
        </div>

        <div className="listing-detail-content">
          <div className="listing-detail-header">
            <div>
              <span className="listing-category">{category}</span>
              <h1>{title}</h1>
            </div>

            <span className={`status-badge status-${status}`}>
              {status}
            </span>
          </div>

          <div className="listing-price">
            {formatPrice(price)}
          </div>

          <div className="listing-meta">
            <span>
              <MapPin size={17} />
              {location}
            </span>

            <span>
              <Star size={17} />
              {sellerName}
            </span>
          </div>

          <div className="listing-description">
            <h2>Description</h2>
            <p>{description}</p>
          </div>

          <div className="listing-seller">
            <Info size={18} />
            <div>
              <strong>Seller</strong>
              <span>{sellerName}</span>
            </div>
          </div>

          {isOwner && (
            <div className="listing-actions">
              <Link
                to={`/listings/${id}/edit`}
                className="btn btn-secondary"
              >
                <Pencil size={17} />
                Edit listing
              </Link>

              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDelete}
              >
                <Trash2 size={17} />
                Delete listing
              </button>
            </div>
          )}

          {!isAuthenticated && isAvailable && (
            <div className="offer-login-card">
              <p>Want to make an offer?</p>
              <Link to="/login" className="btn btn-primary">
                Log in to make an offer
              </Link>
            </div>
          )}

          {canMakeOffer && (
            <div className="offer-section">
              {offerStatus === 'pending' && (
                <div className="offer-card">
                  <div>
                    <span className="offer-label">Your offer</span>
                    <strong>
                      {formatPrice(myOffer.amount)}
                    </strong>
                    <span className="status-badge status-pending">
                      Pending
                    </span>
                  </div>

                  {myOffer.message && (
                    <p>{myOffer.message}</p>
                  )}

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleWithdrawOffer}
                    disabled={offerLoading}
                  >
                    {offerLoading
                      ? 'Withdrawing...'
                      : 'Withdraw offer'}
                  </button>
                </div>
              )}

              {offerStatus === 'accepted' && (
                <div className="offer-card">
                  <div>
                    <span className="offer-label">
                      Offer accepted
                    </span>
                    <strong>
                      {formatPrice(myOffer.amount)}
                    </strong>
                  </div>

                  <p>
                    The seller accepted your offer. Continue to
                    your deal to complete the handover.
                  </p>

                  <Link
                    to="/deals"
                    className="btn btn-primary"
                  >
                    View deal
                  </Link>
                </div>
              )}

              {(offerStatus === 'rejected' ||
                offerStatus === 'withdrawn') && (
                <div className="offer-card">
                  <div>
                    <span className="offer-label">
                      Previous offer
                    </span>
                    <strong>
                      {formatPrice(myOffer.amount)}
                    </strong>
                    <span
                      className={`status-badge status-${offerStatus}`}
                    >
                      {offerStatus}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      setOfferError('');
                      setOfferModalOpen(true);
                    }}
                  >
                    Make a new offer
                  </button>
                </div>
              )}

              {!myOffer && (
                <button
                  type="button"
                  className="btn btn-primary offer-button"
                  onClick={() => {
                    setOfferError('');
                    setOfferModalOpen(true);
                  }}
                >
                  <HandCoins size={18} />
                  Make an Offer
                </button>
              )}

              {offerError && (
                <div className="form-error">
                  {offerError}
                </div>
              )}
            </div>
          )}

          {isReserved && (
            <div className="offer-login-card">
              <p>This listing is currently reserved.</p>
            </div>
          )}

          {isSold && (
            <div className="offer-login-card">
              <p>This listing has already been sold.</p>
            </div>
          )}
        </div>
      </div>

      {offerModalOpen && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setOfferModalOpen(false);
            }
          }}
        >
          <div className="modal-card">
            <div className="modal-header">
              <div>
                <h2>Make an Offer</h2>
                <p>{title}</p>
              </div>

              <button
                type="button"
                className="icon-button"
                onClick={() => setOfferModalOpen(false)}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleMakeOffer}>
              <label htmlFor="offerAmount">
                Offer amount
              </label>

              <input
                id="offerAmount"
                type="number"
                min="1"
                step="1"
                value={offerAmount}
                onChange={(event) =>
                  setOfferAmount(event.target.value)
                }
                placeholder="Enter your offer"
                required
              />

              <label htmlFor="offerMessage">
                Message
              </label>

              <textarea
                id="offerMessage"
                rows="4"
                maxLength="500"
                value={offerMessage}
                onChange={(event) =>
                  setOfferMessage(event.target.value)
                }
                placeholder="Add a message to the seller (optional)"
              />

              {offerError && (
                <div className="form-error">
                  {offerError}
                </div>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setOfferModalOpen(false)}
                  disabled={offerLoading}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={offerLoading}
                >
                  {offerLoading
                    ? 'Submitting...'
                    : 'Submit Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListingDetail;
