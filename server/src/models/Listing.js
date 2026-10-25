const mongoose = require('mongoose');
const { CATEGORIES, CONDITIONS, LISTING_STATUSES, MAX_IMAGES } = require('../constants/listing');

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true }, // Cloudinary id, needed to delete the image later
  },
  { _id: false }
);

const listingSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Seller is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: { values: CATEGORIES, message: 'Invalid category' },
    },
    condition: {
      type: String,
      required: [true, 'Condition is required'],
      enum: { values: CONDITIONS, message: 'Invalid condition' },
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [1, 'Price must be at least 1'],
      max: [10000000, 'Price is too large'],
    },
    images: {
      type: [imageSchema],
      validate: {
        validator: (arr) => arr.length >= 1 && arr.length <= MAX_IMAGES,
        message: `A listing needs between 1 and ${MAX_IMAGES} images`,
      },
    },
    status: {
      type: String,
      enum: LISTING_STATUSES,
      default: 'active',
    },
    // Set when the seller accepts an offer (Phase 4)
    acceptedOffer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Offer',
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Full-text search on title + description (title weighs more)
listingSchema.index({ title: 'text', description: 'text' }, { weights: { title: 5, description: 1 } });
// Browse page: active listings, newest first
listingSchema.index({ status: 1, createdAt: -1 });
listingSchema.index({ status: 1, category: 1, price: 1 });
listingSchema.index({ status: 1, price: 1 });

module.exports = mongoose.model('Listing', listingSchema);
