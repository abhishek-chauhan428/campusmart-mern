import React, { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Search, X, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../api/axios';
import ListingCard, { ListingCardSkeleton } from './ListingCard';
import StateMessage from './StateMessage';
import { CATEGORIES, CONDITIONS, SORT_OPTIONS, getErrorMessage } from '../constants/listing';

const PAGE_SIZE = 12;

// Search bar + filters + grid + pagination. All filter state lives in the URL
// (?search=&category=&page=...), so results survive refresh and can be shared.
const ListingBrowser = () => {
  const [params, setParams] = useSearchParams();
  const search = params.get('search') || '';
  const category = params.get('category') || '';
  const condition = params.get('condition') || '';
  const minPrice = params.get('minPrice') || '';
  const maxPrice = params.get('maxPrice') || '';
  const sort = params.get('sort') || '';
  const page = Math.max(1, parseInt(params.get('page'), 10) || 1);

  // Text inputs keep a local draft and are pushed to the URL after a short pause
  const [draft, setDraft] = useState({ search, minPrice, maxPrice });
  const [listings, setListings] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  const updateParams = useCallback(
    (changes, { keepPage = false } = {}) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
          if (!keepPage) next.delete('page');
          return next;
        },
        { replace: true }
      );
    },
    [setParams]
  );

  // Keep the draft in sync when the URL changes elsewhere (e.g. "Clear filters")
  useEffect(() => {
    setDraft({ search, minPrice, maxPrice });
  }, [search, minPrice, maxPrice]);

  // Debounce the text inputs
  useEffect(() => {
    if (draft.search === search && draft.minPrice === minPrice && draft.maxPrice === maxPrice) return;
    const t = setTimeout(() => {
      updateParams({ search: draft.search, minPrice: draft.minPrice, maxPrice: draft.maxPrice });
    }, 450);
    return () => clearTimeout(t);
  }, [draft, search, minPrice, maxPrice, updateParams]);

  // Fetch whenever the URL filters change
  useEffect(() => {
    const controller = new AbortController();
    const query = { page, limit: PAGE_SIZE };
    if (search) query.search = search;
    if (category) query.category = category;
    if (condition) query.condition = condition;
    if (minPrice) query.minPrice = minPrice;
    if (maxPrice) query.maxPrice = maxPrice;
    if (sort) query.sort = sort;

    setLoading(true);
    setError('');
    api
      .get('/listings', { params: query, signal: controller.signal })
      .then((res) => {
        setListings(res.data.listings);
        setPagination(res.data.pagination);
      })
      .catch((err) => {
        if (err.code === 'ERR_CANCELED') return;
        setError(getErrorMessage(err, 'Could not load listings.'));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [search, category, condition, minPrice, maxPrice, sort, page, reloadKey]);

  const hasFilters = search || category || condition || minPrice || maxPrice;
  const clearFilters = () => setParams({}, { replace: true });
  const goToPage = (p) => {
    updateParams({ page: p > 1 ? String(p) : '' }, { keepPage: true });
    window.scrollTo({ top: document.getElementById('browse')?.offsetTop - 80 || 0, behavior: 'smooth' });
  };

  return (
    <section className="container" id="browse">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', gap: '1rem', flexWrap: 'wrap' }}>
        <h2 style={{ fontSize: '1.625rem', fontWeight: '800', letterSpacing: '-0.02em' }}>Browse listings</h2>
        <Link to="/listings/create" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--brand-primary)', fontWeight: '600' }}>
          <span>Sell something</span>
          <ArrowRight size={16} />
        </Link>
      </div>

      {/* Search bar */}
      <div style={{ position: 'relative', marginBottom: '1rem' }}>
        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          className="form-input"
          style={{ paddingLeft: '2.75rem' }}
          type="search"
          placeholder="Search books, cycles, electronics..."
          value={draft.search}
          onChange={(e) => setDraft((d) => ({ ...d, search: e.target.value }))}
          aria-label="Search listings"
        />
      </div>

      {/* Category chips */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
        <button className={`chip ${!category ? 'chip-active' : ''}`} onClick={() => updateParams({ category: '' })}>
          All
        </button>
        {CATEGORIES.map((cat) => (
          <button key={cat} className={`chip ${category === cat ? 'chip-active' : ''}`} onClick={() => updateParams({ category: cat })}>
            {cat}
          </button>
        ))}
      </div>

      {/* Secondary filters */}
      <div className="filter-row">
        <select className="form-input" value={condition} onChange={(e) => updateParams({ condition: e.target.value })} aria-label="Condition">
          <option value="">Any condition</option>
          {CONDITIONS.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <input
          className="form-input"
          type="number"
          min="0"
          inputMode="numeric"
          placeholder="Min ₹"
          value={draft.minPrice}
          onChange={(e) => setDraft((d) => ({ ...d, minPrice: e.target.value }))}
          aria-label="Minimum price"
        />
        <input
          className="form-input"
          type="number"
          min="0"
          inputMode="numeric"
          placeholder="Max ₹"
          value={draft.maxPrice}
          onChange={(e) => setDraft((d) => ({ ...d, maxPrice: e.target.value }))}
          aria-label="Maximum price"
        />
        <select className="form-input" value={sort} onChange={(e) => updateParams({ sort: e.target.value })} aria-label="Sort by">
          <option value="">{search ? 'Most relevant' : 'Newest first'}</option>
          {SORT_OPTIONS.filter((o) => o.value !== 'newest' || search).map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        {hasFilters && (
          <button className="btn btn-outline" onClick={clearFilters}>
            <X size={14} />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Results */}
      {error ? (
        <StateMessage
          variant="error"
          title="Couldn't load listings"
          message={error}
          action={<button className="btn btn-primary" onClick={() => setReloadKey((k) => k + 1)}>Try again</button>}
        />
      ) : loading ? (
        <div className="listing-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <ListingCardSkeleton key={i} />
          ))}
        </div>
      ) : listings.length === 0 ? (
        <StateMessage
          title={hasFilters ? 'No listings match your filters' : 'No listings yet'}
          message={hasFilters ? 'Try a different search or remove some filters.' : 'Be the first to list something on campus.'}
          action={
            hasFilters ? (
              <button className="btn btn-outline" onClick={clearFilters}>Clear filters</button>
            ) : (
              <Link to="/listings/create" className="btn btn-primary">List an item</Link>
            )
          }
        />
      ) : (
        <>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-light)', marginBottom: '0.75rem' }}>
            {pagination.total} {pagination.total === 1 ? 'listing' : 'listings'}
          </p>
          <div className="listing-grid">
            {listings.map((item) => (
              <ListingCard key={item.id} listing={item} />
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2rem' }}>
              <button className="btn btn-outline" disabled={page <= 1} onClick={() => goToPage(page - 1)}>
                <ChevronLeft size={16} />
                <span>Previous</span>
              </button>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button className="btn btn-outline" disabled={!pagination.hasMore} onClick={() => goToPage(page + 1)}>
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default ListingBrowser;
