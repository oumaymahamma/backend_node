const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  const { username, email, password, role } = req.body;
  try {
    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    });
    if (existingUser) {
      return res.status(400).json({ message: 'Nom d’utilisateur ou email déjà utilisé' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword, role });
    await user.save();
    res.json({ message: 'Utilisateur créé' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({
      $or: [{ username }, { email: username }]
    });
    if (!user) return res.status(400).json({ message: 'Utilisateur introuvable' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Mot de passe incorrect' });
    const token = jwt.sign(
      {
        id: user._id,
        username: user.username, // ✅ ajoute ceci
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    res.json({ token, role: user.role });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });

    res.json({
      username: user.username,
      email: user.email,
      role: user.role
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.put('/update', authenticate, async (req, res) => {
  const { username, email, password, role } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });

    if (username) user.username = username;
    if (email) user.email = email;
    if (role) user.role = role;
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    await user.save();
    res.json({ message: 'Utilisateur mis à jour avec succès' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});


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

router.get('/etudiant', authenticate, authorize(['etudiant']), (req, res) => {
  res.json({ message: 'Bienvenue étudiant' });
});

router.get('/enseignant', authenticate, authorize(['enseignant']), (req, res) => {
  res.json({ message: 'Bienvenue enseignant' });
});

module.exports = router;
