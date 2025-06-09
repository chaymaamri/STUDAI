// models/class.js
const mongoose = require("mongoose");

const ClassSchema = new mongoose.Schema({
  level: { type: String, required: true },
  specialty: { type: String, required: true },
  universityName: { type: String, required: true }, // Pour lier la classe à une université
});

module.exports = mongoose.model("Class", ClassSchema);