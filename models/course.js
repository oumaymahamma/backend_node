const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  nomCours: String,
  matiere: String,
  pdfPath: String,
  professeur: String
});

module.exports = mongoose.model('Course', courseSchema);