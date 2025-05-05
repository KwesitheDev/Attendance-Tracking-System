const mongoose = require('mongoose')

const courseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    lecturerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    studentIds :[{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default:[]}]
    
    
})

module.exports = mongoose.model('Course', courseSchema)