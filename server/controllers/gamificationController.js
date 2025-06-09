const db = require("../config/db");

// 🟢 Ajouter des points
exports.addPoints = async (req, res) => {
    const { userId, points } = req.body;

    if (!userId || !points) {
        return res.status(400).json({ error: "Invalid Data" });
    }

    try {
        await db.execute("UPDATE users SET points = points + ? WHERE id = ?", [points, userId]);
        res.json({ message: "Points ajoutés avec succès !" });

        // Vérifier si un badge est débloqué
        checkAndAssignBadges(userId);
    } catch (error) {
        console.error("Erreur ajout points :", error);
        res.status(500).json({ error: "Error server" });
    }
};

// 🟢 Vérifier et attribuer les badges
// async function checkAndAssignBadges(userId) {
//     try {
//         const [user] = await db.execute("SELECT points FROM users WHERE id = ?", [userId]);
//         if (user.length === 0) return;

//         const userPoints = user[0].points;

//         // Récupérer les badges à débloquer
//         const [availableBadges] = await db.execute(
//             "SELECT id FROM badges WHERE points_required <= ? AND id NOT IN (SELECT badge_id FROM user_badges WHERE user_id = ?)",
//             [userPoints, userId]
//         );

//         for (const badge of availableBadges) {
//             await db.execute("INSERT INTO user_badges (user_id, badge_id) VALUES (?, ?)", [userId, badge.id]);
//         }
//     } catch (error) {
//         console.error("Erreur vérification des badges :", error);
//     }
// }


// 🏆 Fonction pour attribuer un badge à un utilisateur
// 🏆 Fonction pour attribuer un badge à un utilisateur
exports.assignBadge = async (userId, badgeName) => {
    try {
        // 🔎 Vérifier si le badge existe
        const [badge] = await db.promise().execute(
            "SELECT id FROM badges WHERE name = ?",
            [badgeName]
        );

        if (badge.length === 0) {
            console.log(`⚠️ Badge "${badgeName}" non trouvé dans la BDD.`);
            return;
        }

        const badgeId = badge[0].id;

        // 🔎 Vérifier si l'utilisateur a déjà ce badge
        const [existingBadge] = await db.promise().execute(
            "SELECT * FROM user_badges WHERE user_id = ? AND badge_id = ?",
            [userId, badgeId]
        );

        if (existingBadge.length > 0) {
            console.log(`ℹ️ The user ${userId} already has the badge "${badgeName}".`);
            return;
        }

        // 🏅 Attribuer le badge à l'utilisateur
        await db.promise().execute(
            "INSERT INTO user_badges (user_id, badge_id) VALUES (?, ?)",
            [userId, badgeId]
        );

        console.log(`✅ Badge "${badgeName}" assigned to the user ${userId}.`);

    } catch (error) {
        console.error("❌ Erreur lors de l'attribution du badge :", error);
    }
};
exports.updateChallenge = async (req, res) => {
    const { userId, challenge: challengeName } = req.body;
    try {
      const [challenge] = await db.promise().execute(
        "SELECT id, progress, target FROM challenges WHERE user_id = ? AND name = ? AND completed = FALSE",
        [userId, challengeName]
      );
      if (challenge.length === 0) return res.json({ message: "Aucun défi trouvé" });
      
      const { id, progress, target } = challenge[0];
      if (progress + 1 >= target) {
        // Défi terminé
        await db.promise().execute(
          "UPDATE challenges SET progress = ?, completed = TRUE WHERE id = ?",
          [target, id]
        );
        // Optionnel : retour d'un badge si le défi est terminé
        res.json({ message: `Challenge"${challengeName}" finished`, badge: "Your badge" });
      } else {
        // Mise à jour de la progression
        await db.promise().execute(
          "UPDATE challenges SET progress = progress + 1 WHERE id = ?",
          [id]
        );
        res.json({ message: `Progress of the challenge "${challengeName}" updated` });
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du défi :", error);
      res.status(500).json({ error: "Error server" });
    }
  };
  