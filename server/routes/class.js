// routes/classes.js
const express = require("express");
const Class = require("../models/classe");
const router = express.Router();

// Ajouter une classe
router.post("/", async (req, res) => {
  try {
    const newClass = new Class(req.body);
    const savedClass = await newClass.save();
    res.status(201).json(savedClass);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Récupérer toutes les classes
router.get("/", async (req, res) => {
  try {
    const classes = await Class.find();
    res.status(200).json(classes);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;