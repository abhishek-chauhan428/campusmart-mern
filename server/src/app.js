const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security HTTP headers
app.use(helmet());

// CORS configuration
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((url) => url.trim().replace(/\/$/, ''))
  .filter(Boolean);

const defaultLocalOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://localhost:5555',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin) {
        return callback(null, true);
      }

      const cleanOrigin = origin.replace(/\/$/, '');

      // Allow if explicitly configured, standard localhost, or any Vercel deployment/preview
      if (
        allowedOrigins.includes(cleanOrigin) ||
        defaultLocalOrigins.includes(cleanOrigin) ||
        cleanOrigin.endsWith('.vercel.app')
      ) {
        return callback(null, true);
      }

      return callback(new Error(`CORS not allowed from origin: ${origin}`));
    },
    credentials: true,
  })
);

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    message: 'CampusSwap API is operating normally',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API Routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const listingRoutes = require('./routes/listingRoutes');
app.use('/api/listings', listingRoutes);

const offerRoutes = require('./routes/offerRoutes');
app.use('/api/offers', offerRoutes);

const dealRoutes = require('./routes/dealRoutes');
app.use('/api/deals', dealRoutes);

// Lightweight badge summary for the Navbar (no chat, pivot decision)
const { protect } = require('./middleware/auth');
const Offer = require('./models/Offer');
const Deal = require('./models/Deal');

app.get('/api/me/summary', protect, async (req, res, next) => {
  try {
    const userId = req.user._id;
    const [pendingOffersReceived, activeDeals] = await Promise.all([
      Offer.countDocuments({ seller: userId, status: 'pending' }),
      Deal.countDocuments({
        $or: [{ buyer: userId }, { seller: userId }],
        status: 'awaiting_handover',
      }),
    ]);
    res.status(200).json({ success: true, pendingOffersReceived, activeDeals });
  } catch (err) {
    next(err);
  }
});


// 404 handler for unmatched routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl} - Route not found`,
  });
});

// Centralized error handler
app.use(errorHandler);

module.exports = app;
