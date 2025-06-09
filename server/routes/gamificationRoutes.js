const express = require("express");
const router = express.Router();
const db = require("../config/db");
// Route pour récupérer les défis (challenges) d'un utilisateur
router.get("/user/:id/challenges", (req, res) => {
    const userId = req.params.id;
    const query = `
        SELECT * 
        FROM challenges 
        WHERE user_id = ?`;  // Adapte le nom de ta table et de tes colonnes

    db.execute(query, [userId], (err, results) => {
        if (err) {
            console.error("❌ Recovery Error challenges :", err);
            return res.status(500).json({ error: "Recovery Error challenges" });
        }

        if (results.length === 0) {
            console.log(`ℹ️ No challenge found for this user ${userId}`);
            return res.status(404).json({ message: "No challenge found for this user" });
        }

        res.json(results);
    });
});


// 🏆 Route pour récupérer les badges d'un utilisateur
router.get("/user/:id/badges", (req, res) => {
    const userId = req.params.id;

    const query = `
        SELECT badges.id, badges.name, badges.description, badges.icon 
        FROM user_badges 
        JOIN badges ON user_badges.badge_id = badges.id 
        WHERE user_badges.user_id = ?`;

    db.execute(query, [userId], (err, results) => {
        if (err) {
            console.error("❌ Badges recovery error :", err);
            return res.status(500).json({ error: "Badges recovery error" });
        }

        if (results.length === 0) {
            console.log(`ℹ️ No badge found for the user ${userId}`);
            return res.status(404).json({ message: "No badge found for the user" });
        }

        res.json(results);
    });
});
// Route pour gérer l'import d'un emploi du temps et récompenser l'utilisateur
router.post("/user/:id/schedule-upload", (req, res) => {
    const userId = req.params.id;
  
    // Vérifie si un emploi du temps existe déjà pour cet utilisateur
    const checkScheduleQuery = "SELECT COUNT(*) as count FROM schedules WHERE user_id = ?";
    db.execute(checkScheduleQuery, [userId], (err, results) => {
      if (err) {
        console.error("❌ Error when verifying the schedule :", err);
        return res.status(500).json({ error: "Error when verifying the schedule" });
      }
  
      if (results[0].count > 0) {
        // Si un emploi du temps existe déjà, ne pas réattribuer de points ni de badge
        return res.json({ newSchedule: false, message: "Schedule already imported" });
      } else {
        // Insère le nouvel emploi du temps pour l'utilisateur
        const insertScheduleQuery = "INSERT INTO schedules (user_id, created_at) VALUES (?, NOW())";
        db.execute(insertScheduleQuery, [userId], (err, scheduleResult) => {
          if (err) {
            console.error("❌Error during the insertion of the schedule", err);
            return res.status(500).json({ error: "Error during the insertion of the schedule" });
          }
  
          // Met à jour les points de l'utilisateur (+15 points)
          const updateUserPointsQuery = "UPDATE users SET points = points + 15 WHERE id = ?";
          db.execute(updateUserPointsQuery, [userId], (err, updateResult) => {
            if (err) {
              console.error("❌ EError when updating points:", err);
              return res.status(500).json({ error: "Error when updating points" });
            }
  
            // Récupère l'ID du badge "Organisé(e)"
            const badgeQuery = "SELECT id FROM badges WHERE name = 'Organized' LIMIT 1";
            db.execute(badgeQuery, [], (err, badgeResults)  => {
              if (err) {
                console.error("❌ Error when recovering the badge :", err);
                return res.status(500).json({ error: "Error when recovering the badge" });
              }
              if (badgeResults.length === 0) {
                console.error("❌ Badge 'Organized' not found");
                return res.status(500).json({ error: "Badge 'Organized' not found" });
              }
  
              const badgeId = badgeResults[0].id;
              // Vérifie si l'utilisateur a déjà ce badge
              const checkBadgeQuery = "SELECT COUNT(*) as count FROM user_badges WHERE user_id = ? AND badge_id = ?";
              db.execute(checkBadgeQuery, [userId, badgeId], (err, badgeCheckResults) => {
                if (err) {
                  console.error("❌ Error when checking the badge :", err);
                  return res.status(500).json({ error: "Error when checking the badge" });
                }
  
                if (badgeCheckResults[0].count === 0) {
                  // Assigne le badge "Organisé(e)" à l'utilisateur
                  const insertBadgeQuery = "INSERT INTO user_badges (user_id, badge_id, obtained_at) VALUES (?, ?, NOW())";
                  db.execute(insertBadgeQuery, [userId, badgeId], (err, insertBadgeResult) => {
                    if (err) {
                      console.error("❌ Error when allocating the badge :", err);
                      return res.status(500).json({ error: "Error when allocating the badge" });
                    }
                    return res.json({
                      newSchedule: true,
                      message: "Imported schedule, 15 points added and 'Organized' badge awarded."
                    });
                  });
                } else {
                  // Le badge est déjà attribué, on renvoie quand même le succès
                  return res.json({
                    newSchedule: true,
                    message: "Schedule imported and 15 points added."
                  });
                }
              });
            });
          });
        });
      }
    });
  });

 
module.exports = router;
