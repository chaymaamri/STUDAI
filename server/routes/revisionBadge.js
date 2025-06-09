const express = require("express");
const router = express.Router();
const db = require("../config/db"); // connexion mysql2

// On switch sur la version promise de mysql2
const pool = db.promise();

// POST /revision-suggestions/follow
router.post("/revision-suggestions/follow", async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }

  try {
    // 1. Enregistrer l'événement de suivi
    await pool.query(
      "INSERT INTO revision_suggestions (user_id, followed_at) VALUES (?, NOW())",
      [userId]
    );

    // 2. Compter les suivis cette semaine
    const [weeklyRows] = await pool.query(
      `SELECT COUNT(*) AS weeklyCount
       FROM revision_suggestions
       WHERE user_id = ? AND WEEK(followed_at, 1) = WEEK(NOW(), 1)`,
      [userId]
    );
    const weeklyCount = weeklyRows[0].weeklyCount;

    // 3. Mettre à jour ou créer le défi "Top Reviser"
    const challengeName = "Top Reviser";
    // Lecture
    const [challengeRows] = await pool.query(
      `SELECT id, progress, target, completed
       FROM challenges
       WHERE user_id = ? AND name = ?`,
      [userId, challengeName]
    );

    let progress, target, completed, challengeId;
    if (challengeRows.length === 0) {
      // Création du défi si absent
      target = 3;
      progress = 1;
      completed = progress >= target;
      const [createResult] = await pool.query(
        `INSERT INTO challenges (user_id, name, progress, target, completed, created_at)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [userId, challengeName, progress, target, completed ? 1 : 0]
      );
      challengeId = createResult.insertId;
    } else {
      // Mise à jour
      ({ id: challengeId, progress, target, completed } = challengeRows[0]);
      if (!completed) {
        progress++;
        completed = progress >= target;
        await pool.query(
          `UPDATE challenges
           SET progress = ?, completed = ?
           WHERE id = ?`,
          [progress, completed ? 1 : 0, challengeId]
        );
        
      }
    }

    // 4. Compter le total de suggestions suivies
    const [totalRows] = await pool.query(
      `SELECT COUNT(*) AS totalCount
       FROM revision_suggestions
       WHERE user_id = ?`,
      [userId]
    );
    const totalCount = totalRows[0].totalCount;

    // 5. Vérifier et attribuer le badge "Pro of Revision"
    let badgeAwarded = false;
    if (totalCount >= 5) {
      const [[{ id: badgeId }]] = await pool.query(
        `SELECT id FROM badges WHERE name = 'Pro of Revision' LIMIT 1`
      );
      const [[{ count: hasBadge }]] = await pool.query(
        `SELECT COUNT(*) AS count
         FROM user_badges
         WHERE user_id = ? AND badge_id = ?`,
        [userId, badgeId]
      );
      if (hasBadge === 0) {
        await pool.query(
          `INSERT INTO user_badges (user_id, badge_id, obtained_at)
           VALUES (?, ?, NOW())`,
          [userId, badgeId]
        );
        badgeAwarded = true;
      }
    }

    // 6. Réponse finale
    return res.json({
      success: true,
      message: badgeAwarded
        ? "Well done! You've earned the 'Pro of Revision' badge 🎉"
        : "Revision followed successfully. Keep going to earn badges!",
      weeklyCount,
      challenge: { name: challengeName, progress, target, completed },
      totalFollowed: totalCount,
      badgeAwarded,
    });
  } catch (err) {
    console.error("Error in /revision-suggestions/follow:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
