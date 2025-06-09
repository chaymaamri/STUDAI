const express = require("express");
const db = require("../config/db"); // Connexion MySQL
const router = express.Router();

// 🔹 Route pour récupérer les infos utilisateur
router.get("/user/:id", (req, res) => {
    const userId = parseInt(req.params.id, 10);

    if (isNaN(userId)) {
        return res.status(400).json({ message: "ID utilisateur invalide." });
    }

    db.query("SELECT id, nomPrenom, points, niveau,role FROM users WHERE id = ?", [userId], (err, results) => {
        if (err) {
            console.error("❌ Erreur SQL :", err);
            return res.status(500).json({ message: "Erreur serveur." });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "Utilisateur introuvable." });
        }
        res.json(results[0]);
    });
});


module.exports = router;
