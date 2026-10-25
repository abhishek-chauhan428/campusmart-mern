import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ImagePlus, X, AlertCircle } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import StateMessage from '../components/StateMessage';
import {
  CATEGORIES,
  CONDITIONS,
  MAX_IMAGES,
  MAX_IMAGE_SIZE,
  ALLOWED_IMAGE_TYPES,
  getErrorMessage,
} from '../constants/listing';

const emptyForm = { title: '', description: '', category: '', condition: '', price: '' };

// Used for both "create" (/listings/create) and "edit" (/listings/:id/edit)
const CreateListing = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState(emptyForm);
  const [existingImages, setExistingImages] = useState([]); // already on Cloudinary (edit mode)
  const [removedIds, setRemovedIds] = useState([]); // publicIds the user removed
  const [newFiles, setNewFiles] = useState([]); // File objects chosen in this session
  const [loading, setLoading] = useState(isEdit);
  const [loadError, setLoadError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Load the listing when editing
  useEffect(() => {
    if (!isEdit) return;
    const controller = new AbortController();
    api
      .get(`/listings/${id}`, { signal: controller.signal })
      .then((res) => {
        const l = res.data.listing;
        if (l.seller?.id !== user?.id) {
          setLoadError({ title: 'Not your listing', message: 'You can only edit listings you created.' });
        } else if (l.status !== 'active') {
          setLoadError({ title: 'Listing is locked', message: `A ${l.status} listing can no longer be edited.` });
        } else {
          setForm({ title: l.title, description: l.description, category: l.category, condition: l.condition, price: String(l.price) });
          setExistingImages(l.images);
        }
      })
      .catch((err) => {
        if (err.code === 'ERR_CANCELED') return;
        setLoadError({ title: "Couldn't load listing", message: getErrorMessage(err) });
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [id, isEdit, user?.id]);

  // Object URLs for previews of new files (revoked on change to avoid leaks)
  const previews = useMemo(() => newFiles.map((f) => URL.createObjectURL(f)), [newFiles]);
  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews]);

  const keptExisting = existingImages.filter((img) => !removedIds.includes(img.publicId));
  const totalImages = keptExisting.length + newFiles.length;

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleFiles = (e) => {
    const picked = Array.from(e.target.files || []);
    e.target.value = ''; // allow choosing the same file again
    const problems = [];
    const accepted = [];

    for (const file of picked) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) problems.push(`${file.name}: only JPEG, PNG or WebP allowed`);
      else if (file.size > MAX_IMAGE_SIZE) problems.push(`${file.name}: larger than 5 MB`);
      else if (keptExisting.length + newFiles.length + accepted.length >= MAX_IMAGES) {
        problems.push(`Only ${MAX_IMAGES} images allowed per listing`);
        break;
      } else accepted.push(file);
    }

    setError(problems.join(' • '));
    if (accepted.length) setNewFiles((prev) => [...prev, ...accepted]);
  };

  const removeNewFile = (index) => setNewFiles((prev) => prev.filter((_, i) => i !== index));
  const removeExisting = (publicId) => setRemovedIds((prev) => [...prev, publicId]);

  const validate = () => {
    if (form.title.trim().length < 3) return 'Title must be at least 3 characters';
    if (form.description.trim().length < 10) return 'Description must be at least 10 characters';
    if (!form.category) return 'Please choose a category';
    if (!form.condition) return 'Please choose a condition';
    if (!form.price || Number(form.price) <= 0) return 'Enter a price greater than 0';
    if (totalImages < 1) return 'Add at least one image';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }

    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => data.append(k, typeof v === 'string' ? v.trim() : v));
    newFiles.forEach((f) => data.append('images', f));
    removedIds.forEach((pid) => data.append('removeImages', pid));

    setSubmitting(true);
    setError('');
    try {
      const res = isEdit
        ? await api.put(`/listings/${id}`, data, { timeout: 60000 })
        : await api.post('/listings', data, { timeout: 60000 });
      navigate(`/listings/${res.data.listing.id}`, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, 'Could not save the listing.'));
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        <div className="spinner" style={{ width: '2rem', height: '2rem' }} />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '640px' }}>
        <StateMessage
          variant="error"
          title={loadError.title}
          message={loadError.message}
          action={<Link to="/my-listings" className="btn btn-primary">Back to my listings</Link>}
        />
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '1.5rem 1.5rem 4rem', maxWidth: '760px' }}>
      <Link to={isEdit ? `/listings/${id}` : '/'} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>
        <ArrowLeft size={16} />
        <span>Cancel</span>
      </Link>

      <div className="card" style={{ padding: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{isEdit ? 'Edit listing' : 'List an item'}</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginBottom: '1.5rem' }}>
          {isEdit ? 'Update the details or photos of your listing.' : 'Add clear photos and an honest description so buyers can trust your listing.'}
        </p>

        {error && (
          <div className="alert alert-error" role="alert">
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="title">Title</label>
            <input id="title" name="title" className="form-input" value={form.title} onChange={handleChange} maxLength={100} placeholder="e.g. Calculus textbook, 4th edition" />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="description">Description</label>
            <textarea id="description" name="description" className="form-input" rows={5} value={form.description} onChange={handleChange} maxLength={2000} placeholder="Condition details, age, reason for selling, where you can hand it over..." />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right' }}>{form.description.length}/2000</span>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="category">Category</label>
              <select id="category" name="category" className="form-input" value={form.category} onChange={handleChange}>
                <option value="">Select...</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="condition">Condition</label>
              <select id="condition" name="condition" className="form-input" value={form.condition} onChange={handleChange}>
                <option value="">Select...</option>
                {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="price">Price (₹)</label>
              <input id="price" name="price" type="number" min="1" inputMode="numeric" className="form-input" value={form.price} onChange={handleChange} placeholder="450" />
            </div>
          </div>

          {/* Images */}
          <div className="form-group">
            <label className="form-label">Photos ({totalImages}/{MAX_IMAGES})</label>
            <div className="image-grid">
              {keptExisting.map((img) => (
                <div key={img.publicId} className="image-tile">
                  <img src={img.url} alt="" />
                  <button type="button" onClick={() => removeExisting(img.publicId)} aria-label="Remove image"><X size={14} /></button>
                </div>
              ))}
              {previews.map((src, i) => (
                <div key={src} className="image-tile">
                  <img src={src} alt={`New upload ${i + 1}`} />
                  <button type="button" onClick={() => removeNewFile(i)} aria-label="Remove image"><X size={14} /></button>
                </div>
              ))}
              {totalImages < MAX_IMAGES && (
                <label className="image-tile image-add">
                  <ImagePlus size={24} />
                  <span>Add</span>
                  <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleFiles} hidden />
                </label>
              )}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>JPEG, PNG or WebP, up to 5 MB each. The first photo is the cover.</span>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.8rem' }} disabled={submitting}>
            {submitting ? (isEdit ? 'Saving...' : 'Publishing...') : isEdit ? 'Save changes' : 'Publish listing'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateListing;
