const Deal = require('../models/Deal');
const Listing = require('../models/Listing');

const fail = (res, status, message) =>
  res.status(status).json({ success: false, message });

const populateDeal = (query) =>
  query
    .populate('buyer', 'name college ratingAvg ratingCount avatar')
    .populate('seller', 'name college ratingAvg ratingCount avatar')
    .populate('listing', 'title price images status');

const getMyDeals = async (req, res, next) => {
  try {
    const deals = await populateDeal(
      Deal.find({
        $or: [{ buyer: req.user._id }, { seller: req.user._id }],
      }).sort({ createdAt: -1 })
    );

    res.status(200).json({ success: true, deals });
  } catch (error) {
    next(error);
  }
};

const getDealById = async (req, res, next) => {
  try {
    const deal = await populateDeal(Deal.findById(req.params.id));

    if (!deal) return fail(res, 404, 'Deal not found');

    const isParticipant =
      deal.buyer._id.toString() === req.user._id.toString() ||
      deal.seller._id.toString() === req.user._id.toString();

    if (!isParticipant) {
      return fail(res, 403, 'You are not a participant in this deal');
    }

    res.status(200).json({ success: true, deal });
  } catch (error) {
    next(error);
  }
};

const confirmDeal = async (req, res, next) => {
  try {
    const deal = await Deal.findById(req.params.id);

    if (!deal) return fail(res, 404, 'Deal not found');

    const userId = req.user._id.toString();
    const isBuyer = deal.buyer.toString() === userId;
    const isSeller = deal.seller.toString() === userId;

    if (!isBuyer && !isSeller) {
      return fail(res, 403, 'You are not a participant in this deal');
    }

    if (deal.status !== 'awaiting_handover') {
      return fail(res, 409, `A ${deal.status} deal cannot be confirmed`);
    }

    const { handoverNote } = req.body || {};

    if (handoverNote !== undefined) {
      if (typeof handoverNote !== 'string' || handoverNote.length > 500) {
        return fail(res, 400, 'Handover note must be at most 500 characters');
      }
      deal.handoverNote = handoverNote.trim();
    }

    if (isBuyer) deal.buyerConfirmed = true;
    if (isSeller) deal.sellerConfirmed = true;

    if (deal.buyerConfirmed && deal.sellerConfirmed) {
      deal.status = 'completed';

      const updatedListing = await Listing.findOneAndUpdate(
        {
          _id: deal.listing,
          status: 'reserved',
          acceptedOffer: deal.offer,
        },
        {
          $set: { status: 'sold' },
        },
        { new: true }
      );

      if (!updatedListing) {
        return fail(res, 409, 'The listing is no longer in the expected reserved state');
      }
    }

    await deal.save();

    const populated = await populateDeal(Deal.findById(deal._id));

    res.status(200).json({
      success: true,
      message:
        deal.status === 'completed'
          ? 'Deal completed'
          : 'Deal confirmation recorded',
      deal: populated,
    });
  } catch (error) {
    next(error);
  }
};

const cancelDeal = async (req, res, next) => {
  try {
    const deal = await Deal.findById(req.params.id);

    if (!deal) return fail(res, 404, 'Deal not found');

    const userId = req.user._id.toString();

    if (
      deal.buyer.toString() !== userId &&
      deal.seller.toString() !== userId
    ) {
      return fail(res, 403, 'You are not a participant in this deal');
    }

    if (deal.status !== 'awaiting_handover') {
      return fail(res, 409, `A ${deal.status} deal cannot be cancelled`);
    }

    deal.status = 'cancelled';
    await deal.save();

    await Listing.findOneAndUpdate(
      {
        _id: deal.listing,
        status: 'reserved',
        acceptedOffer: deal.offer,
      },
      {
        $set: {
          status: 'active',
          acceptedOffer: null,
        },
      }
    );

    const populated = await populateDeal(Deal.findById(deal._id));

    res.status(200).json({
      success: true,
      message: 'Deal cancelled and listing released',
      deal: populated,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyDeals,
  getDealById,
  confirmDeal,
  cancelDeal,
};
