const Listing = require('../models/Listing');
const User = require('../models/User');
const { getEmailDomain, isAllowedCollegeEmail } = require('../utils/college');
const { uploadImages, deleteImages } = require('../services/imageService');
const { MAX_IMAGES } = require('../constants/listing');

const SELLER_FIELDS = 'name email college ratingAvg ratingCount createdAt';

const fail = (res, status, message) => res.status(status).json({ success: false, message });

const SORTS = {
  newest: { createdAt: -1, _id: -1 },
  price_asc: { price: 1, _id: -1 },
  price_desc: { price: -1, _id: -1 },
};

// @desc    Browse active listings (search, filters, sort, pagination)
// @route   GET /api/listings
// @access  Public
const getListings = async (req, res, next) => {
  try {
    const { search, category, condition, minPrice, maxPrice, page, limit } = req.validatedQuery;
    let { sort } = req.validatedQuery;

    // The marketplace is isolated by college email domain.
    const studentDomain = getEmailDomain(req.user.email);

    if (!studentDomain) {
      return fail(res, 403, 'Your account does not have a valid college email domain');
    }

    const collegeUsers = await User.find({
      email: { $regex: `@${studentDomain.replace(/[.*+?^${}()|[\\]\\]/g, '\\\\$&')}$`, $options: 'i' },
    }).select('_id');

    const collegeUserIds = collegeUsers.map((user) => user._id);

    // The browse page only ever shows active listings from this college.
    const filter = {
      status: 'active',
      seller: { $in: collegeUserIds },
    };
    if (search) filter.$text = { $search: search };
    if (category) filter.category = category;
    if (condition) filter.condition = condition;
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = minPrice;
      if (maxPrice !== undefined) filter.price.$lte = maxPrice;
    }

    // Default to relevance when searching, newest otherwise
    if (!sort) sort = search ? 'relevance' : 'newest';
    if (sort === 'relevance' && !search) sort = 'newest';

    const projection = search ? { score: { $meta: 'textScore' } } : {};
    const sortSpec = sort === 'relevance' ? { score: { $meta: 'textScore' } } : SORTS[sort];

    const [listings, total] = await Promise.all([
      Listing.find(filter, projection)
        .sort(sortSpec)
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('seller', SELLER_FIELDS),
      Listing.countDocuments(filter),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / limit));
    res.status(200).json({
      success: true,
      listings,
      pagination: { page, limit, total, totalPages, hasMore: page < totalPages },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    All listings of the logged-in user (any status)
// @route   GET /api/listings/mine
// @access  Private
const getMyListings = async (req, res, next) => {
  try {
    const listings = await Listing.find({ seller: req.user._id })
      .sort({ createdAt: -1 })
      .populate('seller', SELLER_FIELDS);
    res.status(200).json({ success: true, listings });
  } catch (error) {
    next(error);
  }
};

// @desc    Single listing with seller info
// @route   GET /api/listings/:id
// @access  Public
const getListingById = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id).populate('seller', SELLER_FIELDS);

    if (!listing) return fail(res, 404, 'Listing not found');

    const viewerDomain = getEmailDomain(req.user.email);
    const sellerDomain = getEmailDomain(listing.seller?.email || '');

    if (!viewerDomain || !sellerDomain || viewerDomain !== sellerDomain) {
      return fail(res, 404, 'Listing not found');
    }

    res.status(200).json({ success: true, listing });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a listing with 1-5 images
// @route   POST /api/listings
// @access  Private
const createListing = async (req, res, next) => {
  try {
    if (!isAllowedCollegeEmail(req.user.email)) {
      return fail(res, 403, 'Only students with an allowed college email can create listings');
    }

    const files = req.files || [];
    if (files.length === 0) return fail(res, 400, 'Please upload at least one image');

    const images = await uploadImages(files);

    let listing;
    try {
      listing = await Listing.create({ ...req.body, seller: req.user._id, images });
    } catch (dbError) {
      // DB write failed, so don't leave orphaned images in Cloudinary
      await deleteImages(images.map((img) => img.publicId));
      throw dbError;
    }

    await listing.populate('seller', SELLER_FIELDS);
    res.status(201).json({ success: true, message: 'Listing created', listing });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a listing (owner only, only while active)
// @route   PUT /api/listings/:id
// @access  Private
const updateListing = async (req, res, next) => {
  let uploaded = [];
  try {
    if (!isAllowedCollegeEmail(req.user.email)) {
      return fail(res, 403, 'Only students with an allowed college email can update listings');
    }

    const listing = await Listing.findById(req.params.id);
    if (!listing) return fail(res, 404, 'Listing not found');
    if (listing.seller.toString() !== req.user._id.toString()) {
      return fail(res, 403, 'You can only edit your own listings');
    }
    if (listing.status !== 'active') {
      return fail(res, 409, `A ${listing.status} listing can no longer be edited`);
    }

    const { removeImages = [], ...fields } = req.body;
    const files = req.files || [];
    const removeSet = new Set(removeImages);

    const unknown = [...removeSet].filter((id) => !listing.images.some((img) => img.publicId === id));
    if (unknown.length) return fail(res, 400, 'One or more images to remove do not belong to this listing');

    const kept = listing.images
      .filter((img) => !removeSet.has(img.publicId))
      .map((img) => ({ url: img.url, publicId: img.publicId }));

    const totalImages = kept.length + files.length;
    if (totalImages < 1) return fail(res, 400, 'A listing needs at least one image');
    if (totalImages > MAX_IMAGES) return fail(res, 400, `A listing can have at most ${MAX_IMAGES} images`);

    if (Object.keys(fields).length === 0 && files.length === 0 && removeSet.size === 0) {
      return fail(res, 400, 'No changes were provided');
    }

    uploaded = await uploadImages(files);

    // Ownership + status are part of the filter, so a listing that was reserved
    // a moment ago cannot be overwritten by a stale edit.
    const updated = await Listing.findOneAndUpdate(
      { _id: listing._id, seller: req.user._id, status: 'active' },
      { $set: { ...fields, images: [...kept, ...uploaded] } },
      { new: true, runValidators: true }
    ).populate('seller', SELLER_FIELDS);

    if (!updated) {
      await deleteImages(uploaded.map((img) => img.publicId));
      return fail(res, 409, 'This listing was just reserved or sold and can no longer be edited');
    }

    deleteImages([...removeSet]); // fire-and-forget cleanup, never throws
    res.status(200).json({ success: true, message: 'Listing updated', listing: updated });
  } catch (error) {
    await deleteImages(uploaded.map((img) => img.publicId));
    next(error);
  }
};

// @desc    Delete a listing (owner only, only while active)
// @route   DELETE /api/listings/:id
// @access  Private
const deleteListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return fail(res, 404, 'Listing not found');
    if (listing.seller.toString() !== req.user._id.toString()) {
      return fail(res, 403, 'You can only delete your own listings');
    }
    if (listing.status !== 'active') {
      return fail(res, 409, `A ${listing.status} listing can no longer be deleted`);
    }

    const deleted = await Listing.findOneAndDelete({ _id: listing._id, seller: req.user._id, status: 'active' });
    if (!deleted) {
      return fail(res, 409, 'This listing was just reserved or sold and can no longer be deleted');
    }

    deleteImages(deleted.images.map((img) => img.publicId)); // fire-and-forget cleanup
    res.status(200).json({ success: true, message: 'Listing deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getListings,
  getMyListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
};
