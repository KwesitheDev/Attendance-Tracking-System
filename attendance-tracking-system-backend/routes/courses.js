const express = require('express');
const Course = require('../models/Course');
const auth = require('../middleware/auth');
const User = require('../models/User');
const { checkRole } = require('../middleware/role');
const router = express.Router();

// Create course (admin only)
router.post('/', auth, checkRole(['admin']), async (req, res) => {
  try {
    const { title, code } = req.body;
    const existingCourse = await Course.findOne({ code });
    if (existingCourse) {
      return res.status(400).json({ error: 'Course code already exists' });
    }
    const course = new Course({ title, code });
    await course.save();
    res.status(201).json({ message: 'Course created', course });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Search courses (students, lecturers)
router.get('/search', auth, checkRole(['student', 'lecturer']), async (req, res) => {
  try {
    const { query } = req.query; // e.g., ?query=CS101
    const courses = await Course.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { code: { $regex: query, $options: 'i' } },
      ],
    }).select('title code');
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Assign lecturer to course (admin only)
router.post('/assign', auth, checkRole(['admin']), async (req, res) => {
  try {
    const { courseId, lecturerId } = req.body;
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    const lecturer = await User.findById(lecturerId);
    if (!lecturer || lecturer.role !== 'lecturer') {
      return res.status(400).json({ error: 'Invalid lecturer' });
    }
    course.lecturerId = lecturerId;
    await course.save();
    res.json({ message: 'Lecturer assigned', course });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;