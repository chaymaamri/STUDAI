const mongoose = require("mongoose");

const UniversitySchema = new mongoose.Schema({
  rectorat: { type: String, required: true },
  university: { type: String, required: true },
  image: { type: String }, // Stockage URL de l'image
});

module.exports = mongoose.model("University", UniversitySchema);
