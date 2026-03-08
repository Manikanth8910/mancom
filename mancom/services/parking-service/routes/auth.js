// Import required modules
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { APP_CONFIG } = require('../config');
const { prisma } = require('@mancom/database');
const verifyGoogleToken = require('../middleware/verifyGoogleToken');
const emailService = require('../services/emailService');
const {
  generateToken,
  setAuthCookie,
  clearAuthCookie,
  authenticateToken
} = require('../middleware/auth');

// Create Express router instance
const router = express.Router();


// User registration endpoint
router.post('/register', [
  // Validation rules for request body
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phoneNumber').optional().isLength({ min: 10 }).withMessage('Please provide a valid phone number'),
  body('user_type').optional().isIn(['regular', 'staff']).withMessage('User type must be regular or staff'),

  // Dynamic validation based on APP_MODE
  ...APP_CONFIG.REQUIRED_FIELDS.map(field =>
    body(field).notEmpty().withMessage(`${field.replace(/_/g, ' ')} is required`)
  ),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const {
      username, email, password, phoneNumber, user_type, role = 'user',
      member_id, department, flat_number, block_number
    } = req.body;

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { name: username }] }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email or username' });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Map role
    const roleMap = {
      'user': 'resident',
      'admin': 'admin',
      'security': 'security',
      'superadmin': 'superadmin'
    };
    const targetRole = roleMap[role] || 'resident';

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: username,
        role: targetRole,
        phone: phoneNumber,
        // Assuming we have fields in User for these or they are ignored
        memberId: member_id,
        department: department,
        flatNumber: flat_number,
        blockNumber: block_number,
        userType: user_type,
        // ticket_id, event_pass_type, access_level are not directly mapped to User model
      }
    });

    const token = generateToken({
      id: newUser.id,
      username: newUser.name,
      role: newUser.role,
      email: newUser.email
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: { id: newUser.id, username: newUser.name, email: newUser.email, role: newUser.role },
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User login endpoint
router.post('/login', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || !user.password) return res.status(401).json({ error: 'Invalid credentials' });

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) return res.status(401).json({ error: 'Invalid credentials' });

    const token = generateToken({
      id: user.id,
      username: user.name,
      role: user.role,
      email: user.email
    });

    setAuthCookie(res, token);

    res.json({
      message: 'Login successful',
      user: { id: user.id, username: user.name, email: user.email, role: user.role },
      token,
      cookieSet: true
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User logout endpoint
router.post('/logout', (req, res) => {
  // Clear the auth cookie
  clearAuthCookie(res);

  res.json({ message: 'Logged out successfully' });
});

// User signup endpoint
router.post('/signup', [
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phoneNumber').isLength({ min: 10 }).withMessage('Please provide a valid phone number'),
  body('memberId').notEmpty().withMessage('Member ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, phoneNumber, memberId } = req.body;

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { name: username },
          { phone: phoneNumber },
          { memberId: memberId }
        ]
      }
    });

    if (existingUser) {
      if (existingUser.name === username) return res.status(400).json({ error: 'Username already taken' });
      if (existingUser.email === email) return res.status(400).json({ error: 'User already exists with this email' });
      if (memberId && existingUser.memberId === memberId) return res.status(400).json({ error: 'ID/Roll Number already registered' });
      return res.status(400).json({ error: 'Phone number is already registered' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    await prisma.user.create({
      data: {
        name: username,
        email: email,
        password: hashedPassword,
        phone: phoneNumber,
        memberId: memberId,
        role: 'resident'
      }
    });

    // Send welcome email
    try {
      await emailService.sendWelcomeEmail(email, username);
    } catch (err) {
      console.warn('Welcome email failed:', err.message);
    }

    res.status(201).json({
      message: 'User registered successfully. Please check your email for confirmation.'
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user profile endpoint
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    // Sanitize user object (remove password)
    const { password, ...safeUser } = user;
    res.json({ user: safeUser });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile endpoint
router.put('/profile', authenticateToken, [
  body('username').optional().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('phoneNumber').optional().isLength({ min: 10 }).withMessage('Please provide a valid phone number'),
  body('memberId').optional().isLength({ min: 1 }).withMessage('Member ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { username, phoneNumber, memberId, profilePicture, department } = req.body;

    if (username) {
      const existingUser = await prisma.user.findFirst({
        where: { name: username, NOT: { id: req.user.id } }
      });
      if (existingUser) return res.status(400).json({ error: 'Username already taken' });
    }

    if (phoneNumber) {
      const existingPhone = await prisma.user.findFirst({
        where: { phone: phoneNumber, NOT: { id: req.user.id } }
      });
      if (existingPhone) return res.status(400).json({ error: 'Phone number already registered' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        name: username,
        phone: phoneNumber,
        memberId: memberId,
        profileImage: profilePicture,
        department: department
      }
    });

    const { password, ...safeUser } = updatedUser;
    res.json({
      message: 'Profile updated successfully',
      user: safeUser
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Google OAuth login endpoint
router.post('/google-login', verifyGoogleToken, async (req, res) => {
  try {
    const { googleId, email, name, picture, emailVerified } = req.googleUser;

    if (!emailVerified) {
      return res.status(400).json({ error: 'Email not verified with Google' });
    }

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email }
    });

    if (user) {
      // Update Google profile if needed (assume we might want to store googleId in the future, 
      // but for now we match by email as it is primary key for uniqueness)
      user = await prisma.user.update({
        where: { id: user.id },
        data: { profileImage: picture }
      });
    } else {
      // Return 202 Accepted for new users so they can complete profile
      return res.status(202).json({
        requiresSignup: true,
        email: email,
        name: name,
        picture: picture
      });
    }

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      username: user.name,
      role: user.role,
      email: user.email
    });

    // Set HTTP-only cookie for security
    setAuthCookie(res, token);

    const { password, ...safeUser } = user;
    res.json({
      message: 'Google login successful',
      user: safeUser,
      token,
      cookieSet: true
    });

  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

// Google OAuth Registration endpoint
router.post('/google-register', verifyGoogleToken, [
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('memberId').isLength({ min: 1 }).withMessage('Member ID is required'),
  body('phoneNumber').isLength({ min: 10 }).withMessage('Please provide a valid phone number'),
  body('department').notEmpty().withMessage('Department is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, picture, emailVerified } = req.googleUser;
    const { username, memberId, phoneNumber, department } = req.body;

    if (!emailVerified) return res.status(400).json({ error: 'Google email not verified' });

    // Robust check for existing user
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { name: username },
          { phone: phoneNumber },
          { memberId: memberId }
        ]
      }
    });

    if (existingUser) {
      if (existingUser.name === username) return res.status(400).json({ error: 'Username already taken' });
      if (existingUser.email === email) return res.status(400).json({ error: 'User already exists with this email' });
      if (memberId && existingUser.memberId === memberId) return res.status(400).json({ error: 'ID/Roll Number already registered' });
      return res.status(400).json({ error: 'Phone number is already registered' });
    }

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name: username,
        email: email,
        password: 'GOOGLE_OAUTH_USER_NO_PASSWORD',
        phone: phoneNumber,
        memberId: memberId,
        department: department,
        role: 'resident',
        profileImage: picture
      }
    });

    // Generate JWT token
    const token = generateToken({
      id: newUser.id,
      username: newUser.name,
      role: newUser.role,
      email: newUser.email
    });

    // Set HTTP-only cookie
    setAuthCookie(res, token);

    const { password, ...safeUser } = newUser;
    res.status(201).json({
      message: 'Registration successful',
      user: safeUser,
      token,
      cookieSet: true
    });

  } catch (error) {
    console.error('Google register error:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});



// Export the router for use in main application
module.exports = router;
