const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Student registration
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, indexNumber, department } = req.body;

    if (!indexNumber || !department) {
      return res.status(400).json({ error: 'Index number and department required' });
    }
    if (!/^[A-Z]{2}\d{4}-\d{3}$/.test(indexNumber)) {
      return res.status(400).json({ error: 'Invalid index number format (e.g., CS2023-001)' });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { indexNumber }] });
    if (existingUser) {
      return res.status(400).json({ error: 'Email or index number already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      password: hashedPassword,
      name,
      role: 'student',
      indexNumber,
      department,
    });
    await user.save();

    res.status(201).json({ message: 'Student registered' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login (all roles)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });
    res.json({
      token,
      user: { id: user._id, name: user.name, role: user.role, indexNumber: user.indexNumber },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update password (all roles)
router.post('/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password incorrect' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: 'Password updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;