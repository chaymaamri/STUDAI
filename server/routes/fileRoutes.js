const express = require("express");
const multer = require("multer");
const path = require("path");
const mysql = require("mysql2");



const router = express.Router();
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "aitudiant",
});

db.connect((err) => {
  if (err) {
    console.error("❌ Erreur de connexion à MySQL :", err);
  } else {
    console.log("✅ Connexion à MySQL réussie !");
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

router.post("/files", upload.single("file"), async (req, res) => {
  const { userId, name, description, specialite } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).send("Aucun fichier téléchargé.");
  }

  console.log("Received data:", { userId, name, description, specialite, file });
  const filePath = file.path;
  const fileType = file.mimetype;

  const insertQuery = `
    INSERT INTO files (user_id, name, description, file_path, file_type, specialite, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, 'pending', NOW())
  `; 
  const values = [userId, name, description, filePath, fileType, specialite];

  db.query(insertQuery, values, (err, result) => {
    if (err) {
      console.error("Erreur lors de l'ajout du fichier :", err);
      return res.status(500).json({ error: "Erreur lors de l'ajout du fichier." });
    }
    
    console.log("Fichier ajouté avec succès !");
    
    // --- Gamification pour le partage de documents ---
    // 1. Attribution du badge "Committed Sharer" si l'utilisateur a au moins 5 documents validés
    const countDocsQuery = `
      SELECT COUNT(*) as count
      FROM files
      WHERE user_id = ? AND status = 'accepted'
    `;
    db.query(countDocsQuery, [userId], (err, countResults) => {
      if (err) {
        console.error("Erreur lors du comptage des documents :", err);
      } else {
        const totalDocs = countResults[0].count;
        console.log("Nombre de documents validés :", totalDocs);
        if (totalDocs >= 5) {
          const badgeQuery = "SELECT id FROM badges WHERE name = 'Committed Sharer' LIMIT 1";
          db.query(badgeQuery, [], (err, badgeResults) => {
            if (err) {
              console.error("Erreur lors de la récupération du badge :", err);
            } else if (badgeResults.length === 0) {
              console.error("Badge 'Committed Sharer' non trouvé");
            } else {
              const badgeId = badgeResults[0].id;
              const checkBadgeQuery = "SELECT COUNT(*) as count FROM user_badges WHERE user_id = ? AND badge_id = ?";
              db.query(checkBadgeQuery, [userId, badgeId], (err, checkResults) => {
                if (err) {
                  console.error("Erreur lors de la vérification du badge :", err);
                } else if (checkResults[0].count === 0) {
                  const insertBadgeQuery = "INSERT INTO user_badges (user_id, badge_id, obtained_at) VALUES (?, ?, NOW())";
                  db.query(insertBadgeQuery, [userId, badgeId], (err, insertResult) => {
                    if (err) {
                      console.error("Erreur lors de l'attribution du badge :", err);
                    } else {
                      console.log("Badge 'Committed Sharer' attribué à l'utilisateur", userId);
                    }
                  });
                }
              });
            }
          });
        }
      }
    });


    // 2. Défi "Knowledge Sharer" : vérifier si l'utilisateur a partagé au moins 3 documents validés dans la semaine
    // Vérifier le nombre de documents partagés cette semaine
    const weeklyCountQuery = `
    SELECT COUNT(*) AS weeklyCount
    FROM files
    WHERE user_id = ? AND WEEK(created_at, 1) = WEEK(NOW(), 1)
  `;
  
  db.query(weeklyCountQuery, [userId], (err, result) => {
    if (err) {
      console.error("Erreur lors de la vérification des documents partagés :", err);
      return res.status(500).json({ error: "Erreur serveur" });
    }
  
    let weeklyCount = result[0].weeklyCount;
  
    // Bloquer le compteur à 3 maximum
    if (weeklyCount > 3) {
      weeklyCount = 3;
    }
  
    const challengeName = "Knowledge Sharer";
  
    // Sélectionner le challenge
    const selectChallengeQuery = `
      SELECT progress, target, completed
      FROM challenges
      WHERE user_id = ? AND name = ?
    `;
  
    db.query(selectChallengeQuery, [userId, challengeName], (err, rows) => {
      if (err) {
        console.error("Erreur lors de la récupération du défi 'Knowledge Sharer' :", err);
        return res.status(500).json({ error: "Erreur serveur" });
      }
  
      if (rows.length > 0) {
        const { progress, target, completed } = rows[0];
  
        // Mettre à jour le challenge uniquement si non complété et progress < 3
        if (!completed && progress < 3) {
          const updateChallengeQuery = `
            UPDATE challenges
            SET progress = progress + 1
            WHERE user_id = ? AND name = ?
          `;
  
          db.query(updateChallengeQuery, [userId, challengeName], (err) => {
            if (err) {
              console.error("Erreur lors de la mise à jour du défi 'Knowledge Sharer' :", err);
            } else {
              if (progress + 1 >= target) {
                // Marquer comme terminé
                const markCompletedQuery = `
                  UPDATE challenges
                  SET completed = 1
                  WHERE user_id = ? AND name = ?
                `;
                db.query(markCompletedQuery, [userId, challengeName], (err) => {
                  if (err) {
                    console.error("Erreur lors de la validation du défi 'Knowledge Sharer' :", err);
                  } else {
                    console.log(`Défi "${challengeName}" complété pour l'utilisateur ${userId}`);
                  }
                });
              }
            }
          });
        }
      }
    });
  
    // ✅ Réponse personnalisée selon le cas
    if (weeklyCount >= 3) {
      res.json({
        message: "Fichier ajouté avec succès.",
        info: "Félicitations, tu as atteint la limite d'échange cette semaine 🎉 ! Reviens lundi prochain pour continuer.",
        weeklyCount: 3 // Toujours 3/3 maximum
      });
    } else {
      res.json({
        message: "Fichier ajouté avec succès et gamification appliquée !",
        weeklyCount: weeklyCount // Affiche le nombre actuel
      });
    }
  });
});
})
  



// Endpoint to fetch files

// fileRoutes.js
router.get("/files", (req, res) => {
  const { userId } = req.query;
  let query = "";
  let values = [];

  if (userId) {
    // Si on a un userId, on renvoie "accepted" pour tout le monde
    // + "pending" si c'est le même user
    query = `
      SELECT f.*, u.nomPrenom, u.etablissement
      FROM files f
      JOIN users u ON f.user_id = u.id
      WHERE f.status = 'accepted'
         OR (f.status = 'pending' AND f.user_id = ?)
    `;
    values.push(userId);
  } else {
    // Si pas d'userId => on ne renvoie que les "accepted"
    query = `
      SELECT f.*, u.nomPrenom, u.etablissement
      FROM files f
      JOIN users u ON f.user_id = u.id
      WHERE f.status = 'accepted'
    `;
  }

  db.query(query, values, (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération des fichiers :", err);
      return res.status(500).json({ error: "Erreur lors de la récupération des fichiers." });
    }
    res.json(results);
  });
});
router.delete("/files/:id", (req, res) => {
  const fileId = req.params.id;
  const query = "DELETE FROM files WHERE id = ?";

  db.query(query, [fileId], (err, result) => {
    if (err) {
      console.error("Erreur lors de la suppression du fichier :", err);
      return res.status(500).json({ error: "Erreur lors de la suppression du fichier." });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Fichier non trouvé." });
    }
    res.json({ message: "Fichier supprimé avec succès !" });
  });
});
  



module.exports = router;