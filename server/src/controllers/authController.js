const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { isAllowedCollegeEmail } = require('../utils/college');

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id || user.id,
      role: user.role,
    },
    process.env.JWT_SECRET || 'supersecret_campusswap_jwt_development_key_change_in_production',
    {
      expiresIn: '7d',
    }
  );
};

// @desc    Register a new student user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, college } = req.body;

    const normalizedEmail = email.toLowerCase();
    if (!isAllowedCollegeEmail(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: `Please register using your college email address. Allowed domains: ${String(process.env.COLLEGE_EMAIL_DOMAINS || '').split(',').map((d) => d.trim()).filter(Boolean).join(', ') || 'not configured'}`,
      });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

    const passwordHash = await User.hashPassword(password);

    const user = await User.create({
      name,
      email: normalizedEmail,
      passwordHash,
      college,
    });

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = email.toLowerCase();

    if (!isAllowedCollegeEmail(normalizedEmail)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended by campus moderators',
      });
    }

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current authenticated user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get public profile for any user by ID
// @route   GET /api/auth/users/:id
// @access  Public
const getPublicProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('name college ratingAvg ratingCount createdAt');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  getPublicProfile,
  generateToken,
};
