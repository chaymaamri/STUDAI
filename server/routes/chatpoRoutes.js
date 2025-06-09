const express = require("express");
const router = express.Router();
const db = require("../config/db");
const pool = db.promise();

router.post("/chatpo/interaction", async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }

  try {
    // 1. Enregistrer l'interaction
    await pool.query(
      "INSERT INTO chat_interactions (user_id, created_at) VALUES (?, NOW())",
      [userId]
    );

    // 2. Ajouter 5 points
    await pool.query("UPDATE users SET points = points + 5 WHERE id = ?", [userId]);

    // 3. Récupérer ou créer le défi
    const challengeName = "Positive Vibes Champion";
    const [challengeRows] = await pool.query(
      `SELECT id, progress, target, completed
       FROM challenges
       WHERE user_id = ? AND name = ?`,
      [userId, challengeName]
    );

    // 3.a debug
    const debug = { challengeRows };

    let challengeId, progress, target, completed;
    if (challengeRows.length === 0) {
      // crée si manquant
      target = 5;
      progress = 0;
      completed = 0;
      const [create] = await pool.query(
        `INSERT INTO challenges
           (user_id, name, progress, target, completed, created_at)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [userId, challengeName, progress, target, completed]
      );
      challengeId = create.insertId;
      debug.createdChallenge = true;
    } else {
      ({ id: challengeId, progress, target, completed } = challengeRows[0]);
      debug.createdChallenge = false;
    }

    // 3.b) récupérer 2 dernières interactions
    const [ints] = await pool.query(
      `SELECT created_at
       FROM chat_interactions
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 2`,
      [userId]
    );
    debug.intsLength = ints.length;
    let daysDiff = null;
    let prevInteraction = null;

    if (ints.length === 1) {
      progress = 1;
    } else {
      prevInteraction = ints[1].created_at;
      const now = new Date();
      const prev = new Date(prevInteraction);
      daysDiff = Math.floor((now - prev) / (1000 * 60 * 60 * 24));

      if (daysDiff === 1)         progress += 1;
      else if (daysDiff > 1)      progress = 1;
      // else daysDiff===0 → on garde progress
    }
    debug.prevInteraction = prevInteraction;
    debug.daysDiff = daysDiff;

    // 3.c) mise à jour du défi
    const newCompleted = completed || progress >= target ? 1 : 0;
    await pool.query(
      `UPDATE challenges
       SET progress = ?, completed = ?
       WHERE id = ?`,
      [progress, newCompleted, challengeId]
    );

    // 4. Total interactions
    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS count
       FROM chat_interactions
       WHERE user_id = ?`,
      [userId]
    );
    const interactionCount = countRows[0].count;

    // 5. Badge
    let badgeMsg = "";
    if (interactionCount >= 10) {
      const [[{ id: badgeId }]] = await pool.query(
        `SELECT id FROM badges WHERE name = 'Always motivated' LIMIT 1`
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
        badgeMsg = " and earned the 'Always motivated' badge 🎖️"; // Ajout du message du badge
      }
      
      // Réponse unique avec le message du badge inclus
      return res.json({
        success: true,
        message: `Interaction recorded, challenge "${challengeName}" updated!${badgeMsg}`, // Le message inclut le badge
        challenge: {
          name: challengeName,
          progress,
          target,
          completed: Boolean(newCompleted),
        },
        totalInteractions: interactionCount,
        debug,
      });
    }

  } catch (err) {
    console.error("Error in /chatpo/interaction:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
