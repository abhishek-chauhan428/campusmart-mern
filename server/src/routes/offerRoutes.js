const express = require('express');
const { protect } = require('../middleware/auth');
const { validateObjectId } = require('../middleware/validate');

const {
  createOffer,
  getReceivedOffers,
  getSentOffers,
  acceptOffer,
  rejectOffer,
  withdrawOffer,
} = require('../controllers/offerController');

const router = express.Router();

router.get('/received', protect, getReceivedOffers);
router.get('/sent', protect, getSentOffers);

router.patch(
  '/:id/accept',
  protect,
  validateObjectId('id'),
  acceptOffer
);

router.patch(
  '/:id/reject',
  protect,
  validateObjectId('id'),
  rejectOffer
);

router.patch(
  '/:id/withdraw',
  protect,
  validateObjectId('id'),
  withdrawOffer
);

module.exports = router;
