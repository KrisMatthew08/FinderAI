const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  const { studentId, firstName, lastName, email, password } = req.body;
  
  console.log('📝 Registration attempt:', { studentId, firstName, lastName, email });
  
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { studentId }] });
    if (existingUser) {
      console.log('❌ User already exists');
      return res.status(400).json({ message: 'Email or Student ID already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user
    const user = new User({
      studentId,
      firstName,
      lastName,
      email,
      password: hashedPassword
    });
    
    await user.save();
    console.log('✅ User registered:', email);
    
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('❌ Registration error:', err);
    console.error('Error details:', err.message);
    res.status(500).json({ message: 'Error creating user', error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  console.log('🔐 Login attempt for email:', email);
  
  try {
    // Find user by email
    const user = await User.findOne({ email });
    console.log('User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      console.log('❌ User not found');
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Compare password
    console.log('Comparing passwords...');
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('Password valid:', isValidPassword);
    
    if (!isValidPassword) {
      console.log('❌ Invalid password');
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    console.log('Generating JWT token...');
    console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user._id,
        email: user.email,
        studentId: user.studentId 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    console.log('✅ Login successful for:', email);
    
    res.json({
      token,
      user: {
        id: user._id,
        studentId: user.studentId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('❌ Login error:', err);
    console.error('Error stack:', err.stack);
    res.status(500).json({ message: 'Error logging in' });
  }
});

// Verify token (for protected routes)
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (err) {
    console.error('Token verification error:', err);
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Get all users (Admin only)
router.get('/users', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const adminUser = await User.findById(decoded.id);
    
    // Check if user is admin
    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    // Get all users with item counts
    const Item = require('../models/Item');
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    
    // Add item counts for each user
    const usersWithCounts = await Promise.all(
      users.map(async (user) => {
        const itemCount = await Item.countDocuments({ studentId: user.studentId });
        return {
          ...user.toObject(),
          itemsUploaded: itemCount
        };
      })
    );

    console.log(`✅ Retrieved ${usersWithCounts.length} users for admin`);
    res.json(usersWithCounts);
  } catch (err) {
    console.error('❌ Error fetching users:', err);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

module.exports = router;