const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const User = require('../models/User'); // Adjust path as necessary
const auth = require('../middleware/auth'); // Import the auth middleware

const router = express.Router();

// --- Validation Schemas ---

const registerSchema = Joi.object({
  name: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// --- Helper Function to Generate JWT ---

const generateToken = (userId) => {
  const payload = {
    user: {
      id: userId,
    },
  };

  // Sign the token using the secret from .env
  // TODO: Add expiration (e.g., '1h' for 1 hour, '7d' for 7 days)
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
};


// --- Routes ---

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', async (req, res) => {
  // 1. Validate request body
  const { error } = registerSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { name, email, password } = req.body;

  try {
    // 2. Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 3. Hash password
    const salt = await bcrypt.genSalt(10); // Generate salt
    const hashedPassword = await bcrypt.hash(password, salt); // Hash password

    // 4. Create and save new user
    user = new User({
      name,
      email,
      password: hashedPassword,
    });
    await user.save();

    // 5. Generate JWT
    const token = generateToken(user.id);

    // 6. Return token
    res.status(201).json({ token }); // 201 Created

  } catch (err) {
    console.error('Registration error:', err.message);
    res.status(500).send('Server error during registration');
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token (Login)
 * @access  Public
 */
router.post('/login', async (req, res) => {
  // 1. Validate request body
  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { email, password } = req.body;

  try {
    // 2. Find user by email (include password for comparison)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' }); // Generic message
    }

    // 3. Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' }); // Generic message
    }

    // 4. Generate JWT
    const token = generateToken(user.id);

    // 5. Return token
    res.json({ token });

  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).send('Server error during login');
  }
});


/**
 * @route   GET /api/auth/me
 * @desc    Get logged-in user's data (using token)
 * @access  Private
 */
router.get('/me', auth, async (req, res) => { // Use the auth middleware
  try {
    // req.user is attached by the auth middleware (contains user id)
    const user = await User.findById(req.user.id).select('-password'); // Exclude password
    if (!user) {
        // This case should ideally not happen if token is valid and user exists
        return res.status(404).json({ message: 'User not found' });
    }
    res.json(user); // Return user data (id, name, email, createdAt, etc.)
  } catch (err) {
    console.error('Get user error:', err.message);
    res.status(500).send('Server Error');
  }
});


module.exports = router;
