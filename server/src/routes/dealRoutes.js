const express = require('express');
const { protect } = require('../middleware/auth');
const { validateObjectId } = require('../middleware/validate');

const {
  getMyDeals,
  getDealById,
  confirmDeal,
  cancelDeal,
} = require('../controllers/dealController');

const router = express.Router();

router.get('/', protect, getMyDeals);

router.get(
  '/:id',
  protect,
  validateObjectId('id'),
  getDealById
);

router.patch(
  '/:id/confirm',
  protect,
  validateObjectId('id'),
  confirmDeal
);

router.patch(
  '/:id/cancel',
  protect,
  validateObjectId('id'),
  cancelDeal
);

module.exports = router;
