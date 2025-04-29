const express = require('express');
const mongoose = require('mongoose');
const Quiz = require('../models/Quiz');
const QuizResult = require('../models/QuizResult');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// 👨‍🏫 Créer un quiz (enseignant)
router.post('/create', authenticate, authorize(['enseignant']), async (req, res) => {
  try {
    const { title, questions } = req.body;
    const createdBy = req.user.username;

    const quiz = new Quiz({ title, questions, createdBy });
    await quiz.save();

    res.status(201).json({ message: 'Quiz créé avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// ✅ Voir tous les quiz (étudiant et enseignant)
router.get('/', authenticate, authorize(['etudiant', 'enseignant']), async (req, res) => {
  try {
    const quizzes = await Quiz.find();
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// 👨‍🎓 Répondre à un quiz (étudiant)
router.post('/answer/:quizId', authenticate, authorize(['etudiant']), async (req, res) => {
  try {
    const { quizId } = req.params;
    const { answers } = req.body;
    const userId = req.user.userId;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz introuvable' });
    }

    let score = 0;
    quiz.questions.forEach((q, i) => {
      if (q.correctAnswer === answers[i]) score++;
    });

    const result = new QuizResult({ quizId, userId, answers, score });
    await result.save();

    res.json({ message: 'Réponses enregistrées', score });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// 👨‍🎓 Voir ses résultats (étudiant)
router.get('/results', authenticate, authorize(['etudiant']), async (req, res) => {
  try {
    const userId = req.user.userId;
    const results = await QuizResult.find({ userId }).populate('quizId', 'title');
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

module.exports = router;
