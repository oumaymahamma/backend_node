const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ message: 'Utilisateur existe déjà' });

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashed, role });
    await user.save();
    res.json({ message: 'Utilisateur créé' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'Utilisateur introuvable' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Mot de passe incorrect' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, role: user.role });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});
//Afficher les informations de l'utilisateur connecté
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });
    res.json({
      username: user.username,
      role: user.role
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Mettre à jour les informations de l'utilisateur
router.put('/update', authenticate, async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }
    if (username) user.username = username;
    if (role) user.role = role;

    await user.save();
    res.json({ message: 'Utilisateur mis à jour avec succès' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Supprimer l'utilisateur
router.delete('/delete', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });

    await user.remove();
    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});
// Test route protégée
router.get('/etudiant', authenticate, authorize(['etudiant']), (req, res) => {
  res.json({ message: 'Bienvenue étudiant' });
});

router.get('/enseignant', authenticate, authorize(['enseignant']), (req, res) => {
  res.json({ message: 'Bienvenue enseignant' });
});

module.exports = router;