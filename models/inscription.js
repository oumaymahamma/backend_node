// models/inscription.model.js
const mongoose = require("mongoose");

const inscriptionSchema = new mongoose.Schema({
  utilisateurId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  coursId: { type: mongoose.Schema.Types.ObjectId, ref: "Cours", required: true },
  dateInscription: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Inscription", inscriptionSchema);
