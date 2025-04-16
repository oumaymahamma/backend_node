

const express = require('express');
const multer = require('multer');
const path = require('path');
const { authenticate, authorize } = require('../middleware/auth');
const Course = require('../models/Course');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Ajouter un cours
router.post('/add', authenticate, authorize(['enseignant']), upload.single('pdf'), async (req, res) => {
  const { nomCours, matiere } = req.body;
  const professeur = req.user.username;

  const course = new Course({
    nomCours,
    matiere,
    pdfPath: req.file.filename,
    professeur
  });

  await course.save();
  res.json({ message: 'Cours ajouté avec succès' });
});

// Liste des cours
router.get('/', authenticate, authorize(['enseignant']), async (req, res) => {
  const courses = await Course.find();
  res.json(courses);
});

module.exports = router; 