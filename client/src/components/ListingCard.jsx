import React from 'react';
import { Link } from 'react-router-dom';
import { ImageOff } from 'lucide-react';
import { formatPrice, STATUS_BADGES } from '../constants/listing';

const ListingCard = ({ listing, showStatus = false, footer = null }) => {
  const cover = listing.images?.[0]?.url;
  const status = STATUS_BADGES[listing.status];

  return (
    <div className="product-card">
      <Link to={`/listings/${listing.id}`} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div className="product-image-container">
          {cover ? (
            <img src={cover} alt={listing.title} className="product-image" loading="lazy" />
          ) : (
            <ImageOff size={32} color="var(--text-muted)" />
          )}
        </div>

        <div style={{ padding: '1.125rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
            {showStatus && status ? (
              <span className={status.className}>{status.label}</span>
            ) : (
              <span className="badge badge-blue">{listing.condition}</span>
            )}
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {listing.seller?.college || listing.category}
            </span>
          </div>

          <h3
            style={{
              fontSize: '0.9375rem',
              fontWeight: '700',
              lineHeight: 1.35,
              minHeight: '2.6rem',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {listing.title}
          </h3>

          <div style={{ marginTop: 'auto', paddingTop: '0.5rem', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: '800' }}>{formatPrice(listing.price)}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{listing.category}</span>
          </div>
        </div>
      </Link>

      {footer && <div style={{ padding: '0 1.125rem 1.125rem' }}>{footer}</div>}
    </div>
  );
};

export const ListingCardSkeleton = () => (
  <div className="product-card" aria-hidden="true">
    <div className="product-image-container skeleton" />
    <div style={{ padding: '1.125rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div className="skeleton" style={{ height: '1rem', width: '40%' }} />
      <div className="skeleton" style={{ height: '1rem', width: '90%' }} />
      <div className="skeleton" style={{ height: '1.25rem', width: '30%' }} />
    </div>
  </div>
);

export default ListingCard;
