const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  answers: [Number],
  score: Number,
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('QuizResult', resultSchema);
