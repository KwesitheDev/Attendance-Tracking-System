const express = require('express');
const Attendance = require('../models/Attendance');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const auth = require('../middleware/auth');
const { checkRole } = require('../middleware/role');
const router = express.Router();

// Scan QR to mark attendance (students)
router.post('/scan', auth, checkRole(['student']), async (req, res) => {
  try {
    const { courseId } = req.body; // In real app, QR code contains courseId
    const studentId = req.user.id;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    if (!course.studentIds.includes(studentId)) {
      return res.status(403).json({ error: 'Not enrolled in this course' });
    }

    const today = new Date().setHours(0, 0, 0, 0);
    const existingAttendance = await Attendance.findOne({
      courseId,
      studentId,
      date: { $gte: today, $lte: new Date(today).setHours(23, 59, 59, 999) },
    });
    if (existingAttendance) {
      return res.status(400).json({ error: 'Attendance already marked today' });
    }

    const attendance = new Attendance({ courseId, studentId });
    await attendance.save();
    res.status(201).json({ message: 'Attendance marked', attendance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// View course attendance (lecturers)
router.get('/:courseId', auth, checkRole(['lecturer']), async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId);
    if (!course || course.lecturerId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to view this course' });
    }

    const attendance = await Attendance.find({ courseId })
      .populate('studentId', 'name indexNumber')
      .sort({ date: -1 });
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Request enrollment (students)
router.post('/request', auth, checkRole(['student']), async (req, res) => {
  try {
    const { courseId } = req.body;
    const studentId = req.user.id;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const existingEnrollment = await Enrollment.findOne({ courseId, studentId });
    if (existingEnrollment) {
      return res.status(400).json({ error: 'Enrollment request already exists' });
    }

    const enrollment = new Enrollment({ courseId, studentId });
    await enrollment.save();
    res.status(201).json({ message: 'Enrollment requested', enrollment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Approve/reject enrollment (lecturers)
router.post('/approve', auth, checkRole(['lecturer']), async (req, res) => {
  try {
    const { enrollmentId, status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const enrollment = await Enrollment.findById(enrollmentId);
    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    // Check if lecturer is assigned to the course
    const course = await Course.findById(enrollment.courseId);
    if (!course || course.lecturerId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to manage this course' });
    }

    enrollment.status = status;
    await enrollment.save();

    if (status === 'approved') {
      course.studentIds.push(enrollment.studentId);
      await course.save();
    }

    res.json({ message: `Enrollment ${status}`, enrollment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;