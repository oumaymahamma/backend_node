require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/course');
const quizRoutes = require('./routes/quiz');

const app = express();
app.use(cors());
app.use(express.json());

// Créer le serveur HTTP et initialiser Socket.io
// Créer le serveur HTTP d'abord
const server = http.createServer(app);

// Ensuite, initialiser socket.io
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware pour attacher io à chaque requête
app.use((req, res, next) => {
  req.io = io;  // Attacher l'instance io à la requête
  next(); // Passer à la suite
});

// Utiliser les routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/quiz', quizRoutes);

// Serveur statique pour les fichiers téléchargés
app.use('/uploads', express.static('uploads'));

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    // Démarrer le serveur avec Socket.io
    server.listen(process.env.PORT, () => {
      console.log(`Serveur démarré sur le port ${process.env.PORT}`);
    });
  })
  .catch(err => console.log('Erreur de connexion à MongoDB:', err));

// Gérer les connexions Socket.io
io.on('connection', (socket) => {
  console.log('✅ Client connecté');
  

  socket.on('disconnect', () => {
    console.log('Un utilisateur est déconnecté');
  });
});
