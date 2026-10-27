const Listing = require('../models/Listing');
const Offer = require('../models/Offer');
const Deal = require('../models/Deal');

const fail = (res, status, message) =>
  res.status(status).json({ success: false, message });

const getOfferWithRelations = (query) =>
  query
    .populate('buyer', 'name college ratingAvg ratingCount avatar')
    .populate('seller', 'name college ratingAvg ratingCount avatar')
    .populate('listing', 'title price images status');

const createOffer = async (req, res, next) => {
  try {
    const { id: listingId } = req.params;
    const { amount, message = '' } = req.body;

    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({
        message: 'Offer amount must be greater than 0',
      });
    }

    if (typeof message !== 'string' || message.length > 500) {
      return res.status(400).json({
        message: 'Message must be 500 characters or less',
      });
    }

    const listing = await Listing.findById(listingId);

    if (!listing) {
      return res.status(404).json({
        message: 'Listing not found',
      });
    }

    if (listing.status !== 'active') {
      return res.status(409).json({
        message: 'Offers are only allowed on active listings',
      });
    }

    if (listing.seller.toString() === req.user._id.toString()) {
      return res.status(400).json({
        message: 'You cannot make an offer on your own listing',
      });
    }

    // Explicit application-level duplicate check.
    // The database partial unique index is still kept as a second layer.
    const existingOffer = await Offer.findOne({
      listing: listing._id,
      buyer: req.user._id,
      status: 'pending',
    });

    if (existingOffer) {
      return res.status(409).json({
        message: 'You already have a pending offer on this listing',
      });
    }

    try {
      const offer = await Offer.create({
        listing: listing._id,
        buyer: req.user._id,
        seller: listing.seller,
        amount: Number(amount),
        message: message.trim(),
      });

      return res.status(201).json({
        message: 'Offer created successfully',
        offer,
      });
    } catch (error) {
      // Handles a race where two requests pass the check simultaneously.
      if (error.code === 11000) {
        return res.status(409).json({
          message: 'You already have a pending offer on this listing',
        });
      }

      throw error;
    }
  } catch (error) {
    next(error);
  }
};
const getReceivedOffers = async (req, res, next) => {
  try {
    const offers = await getOfferWithRelations(
      Offer.find({ seller: req.user._id }).sort({ createdAt: -1 })
    );

    res.status(200).json({ success: true, offers });
  } catch (error) {
    next(error);
  }
};

const getSentOffers = async (req, res, next) => {
  try {
    const offers = await getOfferWithRelations(
      Offer.find({ buyer: req.user._id }).sort({ createdAt: -1 })
    );

    res.status(200).json({ success: true, offers });
  } catch (error) {
    next(error);
  }
};

const acceptOffer = async (req, res, next) => {
  try {
    const offer = await Offer.findById(req.params.id);

    if (!offer) return fail(res, 404, 'Offer not found');

    if (offer.seller.toString() !== req.user._id.toString()) {
      return fail(res, 403, 'Only the seller can accept this offer');
    }

    if (offer.status !== 'pending') {
      return fail(res, 409, `This offer is already ${offer.status}`);
    }

    // This is the critical atomic reservation:
    // exactly one concurrent accept can change active -> reserved.
    const listing = await Listing.findOneAndUpdate(
      {
        _id: offer.listing,
        seller: req.user._id,
        status: 'active',
      },
      {
        $set: {
          status: 'reserved',
          acceptedOffer: offer._id,
        },
      },
      {
        new: true,
      }
    );

    if (!listing) {
      return fail(res, 409, 'This listing has already been reserved or sold');
    }

    const accepted = await Offer.findOneAndUpdate(
      {
        _id: offer._id,
        status: 'pending',
      },
      {
        $set: { status: 'accepted' },
      },
      {
        new: true,
      }
    );

    if (!accepted) {
      // Defensive recovery if the offer changed between the checks.
      await Listing.findOneAndUpdate(
        {
          _id: listing._id,
          status: 'reserved',
          acceptedOffer: offer._id,
        },
        {
          $set: { status: 'active', acceptedOffer: null },
        }
      );

      return fail(res, 409, 'This offer is no longer pending');
    }

    // All other pending offers lose the race once this offer wins.
    await Offer.updateMany(
      {
        listing: listing._id,
        _id: { $ne: accepted._id },
        status: 'pending',
      },
      {
        $set: { status: 'rejected' },
      }
    );

    const deal = await Deal.create({
      listing: listing._id,
      offer: accepted._id,
      buyer: accepted.buyer,
      seller: accepted.seller,
      amount: accepted.amount,
    });

    await getOfferWithRelations(Offer.findById(accepted._id));

    const populatedDeal = await Deal.findById(deal._id)
      .populate('buyer', 'name college ratingAvg ratingCount avatar')
      .populate('seller', 'name college ratingAvg ratingCount avatar')
      .populate('listing', 'title price images status');

    res.status(200).json({
      success: true,
      message: 'Offer accepted and deal created',
      offer: accepted,
      deal: populatedDeal,
    });
  } catch (error) {
    next(error);
  }
};

const rejectOffer = async (req, res, next) => {
  try {
    const offer = await Offer.findById(req.params.id);

    if (!offer) return fail(res, 404, 'Offer not found');

    if (offer.seller.toString() !== req.user._id.toString()) {
      return fail(res, 403, 'Only the seller can reject this offer');
    }

    const rejected = await Offer.findOneAndUpdate(
      {
        _id: offer._id,
        status: 'pending',
      },
      {
        $set: { status: 'rejected' },
      },
      { new: true }
    );

    if (!rejected) {
      return fail(res, 409, `This offer is already ${offer.status}`);
    }

    res.status(200).json({
      success: true,
      message: 'Offer rejected',
      offer: rejected,
    });
  } catch (error) {
    next(error);
  }
};

const withdrawOffer = async (req, res, next) => {
  try {
    const offer = await Offer.findById(req.params.id);

    if (!offer) return fail(res, 404, 'Offer not found');

    if (offer.buyer.toString() !== req.user._id.toString()) {
      return fail(res, 403, 'Only the buyer can withdraw this offer');
    }

    const withdrawn = await Offer.findOneAndUpdate(
      {
        _id: offer._id,
        status: 'pending',
      },
      {
        $set: { status: 'withdrawn' },
      },
      { new: true }
    );

    if (!withdrawn) {
      return fail(res, 409, `This offer is already ${offer.status}`);
    }

    res.status(200).json({
      success: true,
      message: 'Offer withdrawn',
      offer: withdrawn,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOffer,
  getReceivedOffers,
  getSentOffers,
  acceptOffer,
  rejectOffer,
  withdrawOffer,
};
