const CATEGORIES = ['Books', 'Electronics', 'Bicycles', 'Hostel', 'Furniture', 'Clothing', 'Sports', 'Other'];
const CONDITIONS = ['New', 'Like New', 'Good', 'Fair'];
const LISTING_STATUSES = ['active', 'reserved', 'sold'];

const MAX_IMAGES = 5;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

module.exports = {
  CATEGORIES,
  CONDITIONS,
  LISTING_STATUSES,
  MAX_IMAGES,
  MAX_IMAGE_SIZE,
  ALLOWED_IMAGE_TYPES,
};
