const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: String,
  role: { type: String, enum: ['student', 'lecturer', 'admin'], default: 'student' },
  indexNumber: { type: String, unique: true, sparse: true },
  department: String,
  privileges: { type: [String], default: [] },
});

module.exports = mongoose.model('User', userSchema);