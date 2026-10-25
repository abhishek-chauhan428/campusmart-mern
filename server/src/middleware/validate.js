const { z } = require('zod');
const { CATEGORIES, CONDITIONS } = require('../constants/listing');

const registerSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters'),
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .toLowerCase()
    .email('Please enter a valid email address'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(6, 'Password must be at least 6 characters long')
    .max(100, 'Password cannot exceed 100 characters'),
  college: z
    .string({ required_error: 'College / Campus is required' })
    .trim()
    .min(2, 'College name must be at least 2 characters')
    .max(100, 'College name cannot exceed 100 characters'),
});

const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .toLowerCase()
    .email('Please enter a valid email address'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password is required'),
});


// ---------- Listings ----------
// Listing bodies arrive as multipart/form-data, so every value is a string -> coerce price.
const listingFields = {
  title: z
    .string({ required_error: 'Title is required' })
    .trim()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title cannot exceed 100 characters'),
  description: z
    .string({ required_error: 'Description is required' })
    .trim()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description cannot exceed 2000 characters'),
  category: z.enum(CATEGORIES, {
    errorMap: () => ({ message: 'Please choose a valid category' }),
  }),
  condition: z.enum(CONDITIONS, {
    errorMap: () => ({ message: 'Please choose a valid condition' }),
  }),
  price: z.coerce
    .number({ invalid_type_error: 'Price must be a number' })
    .positive('Price must be greater than 0')
    .max(10000000, 'Price is too large'),
};

const createListingSchema = z.object(listingFields);

// For edits every field is optional; removeImages lists Cloudinary publicIds to drop.
const updateListingSchema = z.object(listingFields).partial().extend({
  removeImages: z.preprocess(
    (v) => (v === undefined ? [] : Array.isArray(v) ? v : [v]),
    z.array(z.string())
  ),
});

const listingQuerySchema = z
  .object({
    search: z.string().trim().max(100, 'Search text is too long').optional(),
    category: z.enum(CATEGORIES, { errorMap: () => ({ message: 'Invalid category filter' }) }).optional(),
    condition: z.enum(CONDITIONS, { errorMap: () => ({ message: 'Invalid condition filter' }) }).optional(),
    minPrice: z.coerce.number().min(0, 'Minimum price cannot be negative').optional(),
    maxPrice: z.coerce.number().min(0, 'Maximum price cannot be negative').optional(),
    sort: z.enum(['newest', 'price_asc', 'price_desc', 'relevance']).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(12),
  })
  .refine((q) => q.minPrice === undefined || q.maxPrice === undefined || q.minPrice <= q.maxPrice, {
    message: 'Minimum price cannot exceed maximum price',
    path: ['minPrice'],
  });

// Validates req.query and stores the cleaned result on req.validatedQuery
const validateQuery = (schema) => (req, res, next) => {
  try {
    // ignore empty params such as "?category=&search="
    const cleaned = Object.fromEntries(Object.entries(req.query).filter(([, v]) => v !== ''));
    req.validatedQuery = schema.parse(cleaned);
    next();
  } catch (error) {
    next(error);
  }
};

// Rejects malformed ObjectIds with a 400 instead of letting Mongoose throw a CastError
const validateObjectId =
  (param = 'id') =>
  (req, res, next) => {
    if (!/^[a-f\d]{24}$/i.test(req.params[param] || '')) {
      return res.status(400).json({ success: false, message: 'Invalid ID format' });
    }
    next();
  };

const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  validate,
  validateQuery,
  validateObjectId,
  registerSchema,
  loginSchema,
  createListingSchema,
  updateListingSchema,
  listingQuerySchema,
};
