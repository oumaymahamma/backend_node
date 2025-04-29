require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
const courseRoutes = require('./routes/course');
app.use('/api/courses', courseRoutes);
const quizRoutes = require('./routes/quiz');
app.use('/api/quiz', quizRoutes);


app.use('/uploads', express.static('uploads'));
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Serveur démarré sur le port ${process.env.PORT}`);
    });
  })
  .catch(err => console.log(err));
