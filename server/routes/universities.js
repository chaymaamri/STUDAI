const express = require("express");
const University = require ("../models/university")
const router = express.Router();

// Ajouter une université
router.post("/", async (req, res) => {
  try {
    const newUniversity = new University(req.body);
    const savedUniversity = await newUniversity.save();
    res.status(201).json(savedUniversity);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Récupérer toutes les universités
router.get("/", async (req, res) => {
  try {
    const universities = await University.find();
    res.status(200).json(universities);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
