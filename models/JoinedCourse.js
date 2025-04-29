const mongoose = require('mongoose');

const joinedCourseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  joinedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('JoinedCourse', joinedCourseSchema);
