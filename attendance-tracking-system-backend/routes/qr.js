const express = require('express');
const { v4: uuidv4 } = require('uuid');
const Course = require('../models/Course');
const auth = require('../middleware/auth');
const { checkRole } = require('../middleware/role');
const router = express.Router();

// In-memory QR code storage (for MVP, replace with Redis in production)
const qrCodes = new Map();

// Generate QR code (lecturers)
router.post('/generate', auth, checkRole(['lecturer']), async (req, res) => {
  try {
    const { courseId } = req.body;
    const course = await Course.findById(courseId);
    if (!course || course.lecturerId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to generate QR for this course' });
    }

    const sessionId = uuidv4();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    const qrData = { courseId, sessionId, expiresAt };
    const code = JSON.stringify(qrData);
    qrCodes.set(code, qrData);

    res.json({ message: 'QR code generated', code });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Validate QR code (students)
router.post('/validate', auth, checkRole(['student']), async (req, res) => {
  try {
    const { code } = req.body;
    const qrData = qrCodes.get(code);
    if (!qrData) {
      return res.status(400).json({ error: 'Invalid or expired QR code' });
    }

    if (new Date() > new Date(qrData.expiresAt)) {
      qrCodes.delete(code);
      return res.status(400).json({ error: 'QR code expired' });
    }

    const course = await Course.findById(qrData.courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json({ message: 'QR code valid', courseId: qrData.courseId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;