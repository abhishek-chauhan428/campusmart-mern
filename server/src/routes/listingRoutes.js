const express = require('express');
const { protect } = require('../middleware/auth');
const { uploadListingImages } = require('../middleware/upload');
const {
  validate,
  validateQuery,
  validateObjectId,
  createListingSchema,
  updateListingSchema,
  listingQuerySchema,
} = require('../middleware/validate');
const {
  createOffer,
} = require('../controllers/offerController');
const {
  getListings,
  getMyListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
} = require('../controllers/listingController');

const router = express.Router();

// Public browse (active listings only)
router.get('/', validateQuery(listingQuerySchema), getListings);

// NOTE: '/mine' must be declared before '/:id'
router.get('/mine', protect, getMyListings);

// multer runs first so req.body is populated before zod validates it
router.post('/', protect, uploadListingImages, validate(createListingSchema), createListing);
router.post(
  '/:id/offers',
  protect,
  validateObjectId('id'),
  createOffer
);
router.get('/:id', validateObjectId('id'), getListingById);
router.put('/:id', protect, validateObjectId('id'), uploadListingImages, validate(updateListingSchema), updateListing);
router.delete('/:id', protect, validateObjectId('id'), deleteListing);

module.exports = router;
