const mongoose = require('mongoose')

const enrollmentSchema = new mongoose.Schema({
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    },
    requestedAt:{type:Date, default:Date.now}
    
})

module.exports = mongoose.model('Enrollment', enrollmentSchema)