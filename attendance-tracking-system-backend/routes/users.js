const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { checkRole } = require('../middleware/role');
const router = express.Router();

// Admin adds lecturer/admin
router.post('/', auth, checkRole(['admin']), async (req, res) => {
  try {
    const { email, name, role, password } = req.body;

    if (!['lecturer', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password || 'temp123', 10);
    const user = new User({ email, password: hashedPassword, name, role });
    await user.save();

    res.status(201).json({ message: `${role} created` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;