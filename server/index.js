const express = require('express');
const multer = require('multer');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.json());

app.post('/api/upload', upload.single('pdf'), async (req, res) => {
  try {
    const dataBuffer = fs.readFileSync(req.file.path);
    const data = await pdfParse(dataBuffer);
    // Parse the PDF data to extract the schedule
    const schedule = parseSchedule(data.text);
    // Save the schedule to a database or in-memory storage
    saveSchedule(schedule);
    res.status(200).send('File uploaded and schedule extracted');
  } catch (error) {
    res.status(500).send('Error processing file');
  }
});

app.get('/api/schedule', (req, res) => {
  // Retrieve the schedule from the database or in-memory storage
  const schedule = getSchedule();
  res.json(schedule);
});

let savedSchedule = [];

function parseSchedule(text) {
  // Implement your PDF parsing logic here
  // For example, you can split the text by lines and extract relevant information
  return [];
}

function saveSchedule(schedule) {
  savedSchedule = schedule;
}

function getSchedule() {
  return savedSchedule;
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});