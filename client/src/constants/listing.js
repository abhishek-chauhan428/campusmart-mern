export const CATEGORIES = ['Books', 'Electronics', 'Bicycles', 'Hostel', 'Furniture', 'Clothing', 'Sports', 'Other'];
export const CONDITIONS = ['New', 'Like New', 'Good', 'Fair'];

export const MAX_IMAGES = 5;
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
];

export const STATUS_BADGES = {
  active: { label: 'Active', className: 'badge badge-green' },
  reserved: { label: 'Reserved', className: 'badge badge-amber' },
  sold: { label: 'Sold', className: 'badge badge-blue' },
};

export const formatPrice = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

// Pulls a readable message (plus field errors) out of an axios error
export const getErrorMessage = (err, fallback = 'Something went wrong. Please try again.') => {
  if (!err.response) return 'Cannot reach the server. Check your connection and try again.';
  const { message, errors } = err.response.data || {};
  if (Array.isArray(errors) && errors.length) {
    return errors.map((e) => e.message).join(' • ');
  }
  return message || fallback;
};
