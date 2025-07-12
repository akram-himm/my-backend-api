const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const { body, validationResult } = require('express-validator');
const { User } = require('../models');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

// Register new user
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('username').optional().trim().isLength({ min: 2 })
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, username } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Create new user
    const user = await User.create({
      email,
      password,
      username
    });

    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      message: 'User created successfully',
      user: user.toJSON(),
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Error creating user' });
  }
});

// Login user
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Validate password
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user.id);

    res.json({
      message: 'Login successful',
      user: user.toJSON(),
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Error during login' });
  }
});

// Logout user (client-side token removal)
router.post('/logout', auth, async (req, res) => {
  try {
    // In a JWT-based system, logout is typically handled client-side
    // by removing the token from storage. This endpoint can be used
    // for logging purposes or token blacklisting if implemented.
    
    res.json({ message: 'Logout successful' });
  } catch (error) {
    res.status(500).json({ error: 'Error during logout' });
  }
});

// Verify token
router.get('/verify', auth, async (req, res) => {
  try {
    res.json({
      valid: true,
      user: req.user.toJSON()
    });
  } catch (error) {
    res.status(500).json({ error: 'Error verifying token' });
  }
});

// Google OAuth routes
router.get('/google', (req, res, next) => {
  // Extract query parameters for forcing account selection
  const prompt = req.query.prompt || 'consent';
  const maxAge = req.query.max_age;
  
  const authOptions = {
    scope: ['profile', 'email'],
    prompt: prompt
  };
  
  if (maxAge !== undefined) {
    authOptions.maxAge = maxAge;
  }
  
  console.log('OAuth options:', authOptions);
  
  passport.authenticate('google', authOptions)(req, res, next);
});

router.get('/google/callback', 
  passport.authenticate('google', { session: false }),
  (req, res) => {
    try {
      // Generate JWT token for the authenticated user
      const token = generateToken(req.user.id);
      
      // Redirect to success page with token
      const frontendUrl = process.env.FRONTEND_URL || 'https://my-backend-api-cng7.onrender.com';
      res.redirect(`${frontendUrl}/oauth-success.html?token=${token}`);
    } catch (error) {
      console.error('OAuth callback error:', error);
      const frontendUrl = process.env.FRONTEND_URL || 'https://my-backend-api-cng7.onrender.com';
      res.redirect(`${frontendUrl}/oauth-error.html?error=Authentication%20failed`);
    }
  }
);

module.exports = router;