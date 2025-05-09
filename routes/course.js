

const express = require('express');
const multer = require('multer');
const path = require('path');
const { authenticate, authorize } = require('../middleware/auth');
const Course = require('../models/course');
const JoinedCourse = require('../models/JoinedCourse');
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

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
  const Notification = require('../models/Notification');

  await Notification.create({
    message: `Un nouveau cours a été ajouté par ${professeur}`
  });
  
  // Émettre une notification via WebSocket à tous les étudiants
  req.io.emit('nouveau-cours', {
    message: `Un nouveau cours a été ajouté par ${professeur}`,
    nomCours,
  });

  res.json({ message: 'Cours ajouté avec succès' });
});

router.get('/', authenticate, authorize(['enseignant','etudiant']), async (req, res) => {
  const courses = await Course.find();
  res.json(courses);
});


router.post('/join/:id', authenticate,authorize(['etudiant']), async (req, res) => {
  const courseId = req.params.id;
  const userId = req.user.userId;

  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Cours non trouvé' });
    }

    const joinedCourse = new JoinedCourse({
      user: userId,
      course: courseId,
    });

    await joinedCourse.save();

    // ❌ SUPPRIMÉ : pas de WebSocket, pas de notification
    // req.io.emit('notification', {
    //   message: `L'étudiant ${req.user.username} a rejoint le cours ${course.nomCours}`
    // });

    res.status(200).json({ message: 'Cours rejoint avec succès' });
  } catch (error) {
    console.error('Erreur lors de la jointure du cours :', error);
    res.status(500).json({ message: 'Erreur lors de la jointure du cours' });
  }
});
router.get('/joined-courses', async (req, res) => {
  try {
    const joinedCourses = await JoinedCourse.find()
      .populate('userId', 'username')     
      .populate('courseId', 'nomCours matiere')

    res.status(200).json(joinedCourses);
  } catch (error) {
    console.error('Erreur lors de la récupération des cours rejoints :', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});
router.get('/my-courses', authenticate, authorize(['enseignant']), async (req, res) => {
  try {
    const professeurUsername = req.user.username; // on récupère le username
    const myCourses = await Course.find({ professeur: professeurUsername }); // on filtre par username
    res.status(200).json(myCourses);
  } catch (error) {
    console.error('Erreur lors de la récupération des cours :', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});



router.delete('/:id', authenticate, authorize(['enseignant']), async (req, res) => {
  try {
    const courseId = req.params.id;
    const deleted = await Course.findByIdAndDelete(courseId);
    if (!deleted) {
      return res.status(404).json({ message: 'Cours non trouvé' });
    }
    res.status(200).json({ message: 'Cours supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du cours :', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});
router.get('/notifications', authenticate, authorize(['etudiant', 'enseignant']), async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ timestamp: -1 });
    res.json(notifications);
  } catch (error) {
    console.error('Erreur lors de la récupération des notifications:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router; 