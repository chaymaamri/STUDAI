const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  fileType: { type: String, required: true },
  fileContent: { type: String, required: true }, // Stocker le fichier en base64
});

const File = mongoose.model('File', fileSchema);

module.exports = File;
