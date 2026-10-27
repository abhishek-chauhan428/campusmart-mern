const express = require('express');
const { register, login, getMe, getPublicProfile } = require('../controllers/authController');
const { validate, registerSchema, loginSchema, validateObjectId } = require('../middleware/validate');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/me', protect, getMe);
router.get('/users/:id', validateObjectId('id'), getPublicProfile);

module.exports = router;
