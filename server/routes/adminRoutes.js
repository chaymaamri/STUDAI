const express = require("express");
const multer = require("multer");
const db = require("../server");
const path = require("path"); 

const router = express.Router();
const upload = multer({ dest: "uploads/" });
// Importer la fonction adminLogin depuis ton contrôleur
const { adminLogin } = require("../controllers/adminAuthController");
// Ajoute la route de connexion admin
router.post("/signin", adminLogin);
// Récupérer les fichiers approuvés pour les utilisateurs
router.get("/files", (req, res) => {
  const query = "SELECT id, name,file_path, status FROM files";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error Recovering Files:", err);
      return res.status(500).json({ error: "Error Recovering Files." });
    }
    res.json(results);
  });
});
// GET /api/files
// router.get("/files", (req, res) => {
//   const { userId } = req.query;
//   // On veut : "accepted" pour tout le monde, "pending" seulement pour l'auteur
//   let query = "";
//   let values = [];

//   if (userId) {
//     // Si on a un userId, on renvoie tous les "accepted" + les "pending" de l'auteur
//     query = `
//       SELECT f.*, u.nomPrenom, u.etablissement 
//       FROM files f
//       LEFT JOIN users u ON f.user_id = u.id
//       WHERE f.status = 'accepted' 
//          OR (f.status = 'pending' AND f.user_id = ?)
//     `;
//     values.push(userId);
//   } else {
//     // Sinon, on ne renvoie que les "accepted"
//     query = `
//       SELECT f.*, u.nomPrenom, u.etablissement 
//       FROM files f
//       LEFT JOIN users u ON f.user_id = u.id
//       WHERE f.status = 'accepted'
//     `;
//   }

//   db.query(query, values, (err, results) => {
//     if (err) {
//       console.error("Erreur lors de la récupération des fichiers :", err);
//       return res.status(500).json({ error: "Erreur lors de la récupération des fichiers." });
//     }
//     res.json(results);
//   });
// });


// Récupérer tous les fichiers pour l'administration (sans filtrer par statut)
router.get("/admin/files", (req, res) => {
  const query = "SELECT id, name,file_path ,status FROM files";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error recovering files for administration:", err);
      return res.status(500).json({ error: "Error recovering files for administration." });
    }
    res.json(results);
  });
});
// Route de téléchargement pour l'admin
router.get("/files/:id/download", (req, res) => {
  const { id } = req.params;
  const sql = "SELECT file_path, name FROM files WHERE id = ? LIMIT 1";
  db.query(sql, [id], (err, rows) => {
    if (err || rows.length === 0) {
      console.error("Admin download error:", err);
      return res.status(404).send("File not found");
    }
    let { file_path, name } = rows[0];
    // on retire tout slash initial s’il y en a
    file_path = file_path.replace(/^[/\\]+/, "");
    const fullPath = path.join(__dirname, "..", file_path);
    console.log("Download from", fullPath);
    res.download(fullPath, name, downloadErr => {
    // Tell the browser it’s a PDF and should open inline
res.setHeader("Content-Type", "application/pdf");
res.setHeader(
  "Content-Disposition",
  `inline; filename="${name}"`
);

res.sendFile(fullPath, err => {
  if (err) {
    console.error("Error streaming PDF inline:", err);
    res.status(err.status || 500).send("Failed to stream PDF");
  }
});

    });
  });
});
// GET /admin/files/:id/pdf
// router.get("/admin/files/:id/pdf", (req, res) => {
//   const { id } = req.params;
//   const sql = "SELECT file_path, name FROM files WHERE id = ? LIMIT 1";

//   db.query(sql, [id], (err, rows) => {
//     if (err || rows.length === 0) {
//       console.error("Admin PDF preview error:", err);
//       return res.status(404).send("File not found");
//     }

//     let { file_path, name } = rows[0];
//     // Nettoyer le chemin du fichier
//     file_path = file_path.replace(/^[/\\]+/, "");
//     const fullPath = path.join(__dirname, "..", file_path);

//     // Vérifier si le fichier existe
//     if (!fs.existsSync(fullPath)) {
//       console.error("File does not exist:", fullPath);
//       return res.status(404).send("File not found");
//     }

//     // Configurer les headers pour afficher le PDF en ligne
//     res.setHeader("Content-Type", "application/pdf");
//     res.setHeader("Content-Disposition", `inline; filename="${name}"`);

//     // Envoyer le fichier
//     res.sendFile(fullPath, (sendErr) => {
//       if (sendErr) {
//         console.error("Error sending PDF:", sendErr);
//         res.status(sendErr.status || 500).send("Failed to stream PDF");
//       }
//     });
//   });
// });

router.get("/admin/files/:id/pdf", (req, res) => {
  const { id } = req.params;
  console.log("Fetching file for ID:", id); // Log l'ID du fichier

  const sql = "SELECT file_path, name FROM files WHERE id = ? LIMIT 1";
  db.query(sql, [id], (err, rows) => {
    if (err || rows.length === 0) {
      console.error("Admin PDF preview error:", err || "File not found in DB");
      return res.status(404).send("File not found");
    }

    let { file_path } = rows[0];
    console.log("File path from DB:", file_path); // Log le chemin du fichier

    // Remplacez les backslashes par des slashes
    console.log("Normalized file path:", file_path); // Log le chemin normalisé

    // Normaliser le chemin pour remplacer les backslashes par des slashes
    file_path = file_path.replace(/\\/g, "/");
    console.log("Normalized file path after replacement:", file_path); // Log le chemin après normalisation

    const fullPath = path.join(__dirname, "..", file_path);
    if (!fs.existsSync(fullPath)) {
      console.error("File does not exist on disk:", fullPath);
      return res.status(404).send("File not found");
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${path.basename(file_path)}"`);
    res.sendFile(fullPath, (sendErr) => {
      if (sendErr) {
        console.error("Error sending PDF:", sendErr);
        res.status(sendErr.status || 500).send("Failed to stream PDF");
      }
    });
  });
});
// Approuver un document (changement de statut à 'accepted')
router.put("/documents/approve/:id", (req, res) => {
  const fileId = req.params.id;
  
  // Récupérer l'utilisateur associé au fichier
  const getUserQuery = "SELECT user_id,file_path FROM files WHERE id = ?";
  db.query(getUserQuery, [fileId], (err, fileResults) => {
    if (err) {
      console.error("Error retrieving file:", err);
      return res.status(500).json({ error: "Error retrieving file" });
    }
    if (fileResults.length === 0) {
      return res.status(404).json({ error: "File not found" });
    }
    
    const userId = fileResults[0].user_id;
    
    // Mettre à jour le statut du document uniquement s'il est "pending"
    const updateStatusQuery = "UPDATE files SET status = 'accepted' WHERE id = ? AND status = 'pending'";
    db.query(updateStatusQuery, [fileId], (err, result) => {
      if (err) {
        console.error("Error approving the document :", err);
        return res.status(500).json({ error: "Error approving the document" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Document not found or already validated" });
      }
      console.log("Document successfully approved!");
    
      // Mise à jour des points : ajouter 30 points pour ce document validé
      const updatePointsQuery = "UPDATE users SET points = points + 30 WHERE id = ?";
      db.query(updatePointsQuery, [userId], (err, updateResult) => {
        if (err) {
          console.error("Error updating points :", err);
          return res.status(500).json({ error: "Error updating points" });
        }
        console.log("30 points added to the user", userId);
        res.json({ message: "30 points added to the user!" });
      });
    });
  });
});



// Supprimer un document
router.delete("/documents/:id", (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM files WHERE id = ?";
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("Error deleting document :", err);
      return res.status(500).json({ error: "Error deleting document." });
    }
    res.json({ message: "Document Successfully Deleted !" });
  });
});

// Récupérer tous les utilisateurs
router.get("/users", (req, res) => {
  const query = `
    SELECT id, nomPrenom, email, status, etablissement, hobbies, is_active, points, niveau 
    FROM users
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error retrieving users :", err);
      return res.status(500).json({ error: "Error retrieving users." });
    }
    res.json(results);
  });
});

// Approuver un utilisateur
router.put("/users/approve/:id", (req, res) => {
  const { id } = req.params;
  const query = "UPDATE users SET status = 'approved' WHERE id = ?";
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("Error approving user:", err);
      return res.status(500).json({ error: "Error approving user." });
    }
    res.json({ message: "User Approved Successfully !" });
  });
});

// Rejeter un utilisateur
router.put("/users/reject/:id", (req, res) => {
  const { id } = req.params;
  const query = "UPDATE users SET status = 'rejected' WHERE id = ?";
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("Error rejecting user :", err);
      return res.status(500).json({ error: "Error rejecting user." });
    }
    res.json({ message: "User Successfully Rejected!" });
  });
});

// Supprimer un utilisateur
router.delete("/users/:id", async (req, res) => {
  const userId = req.params.id;
    
  try {
    // Commencer une transaction
    await db.promise().beginTransaction();

    // Supprimer les enregistrements liés dans la table "courses"
    await db.promise().execute("DELETE FROM courses WHERE user_id = ?", [userId]);
    // Si tu as d'autres tables liées, ajoute ici d'autres requêtes DELETE
    await db.promise().execute("DELETE FROM files WHERE user_id = ?", [userId]);
    await db.promise().execute("DELETE FROM schedules WHERE user_id = ?", [userId]);
    await db.promise().execute("DELETE FROM todo_lists WHERE user_id = ?", [userId]);
    await db.promise().execute("DELETE FROM user_badges WHERE user_id = ?", [userId]);
    await db.promise().execute("DELETE FROM chat_interactions WHERE user_id = ?", [userId])
    await db.promise().execute("DELETE FROM revision_suggestions WHERE user_id = ?", [userId]);

    // Supprimer l'utilisateur
    await db.promise().execute("DELETE FROM users WHERE id = ?", [userId]);

    // Valider la transaction
    await db.promise().commit();

    res.json({ message: 'Account and related records successfully deleted' });
  } catch (error) {
    // En cas d'erreur, annuler la transaction
    await db.promise().rollback();
    console.error(error);
    res.status(500).json({ message: 'Server error deleting account' });
  }
  
});




// Récupérer les statistiques
router.get("/statistics", (req, res) => {
  const queryUsers = "SELECT COUNT(*) AS userCount FROM users";
  const queryDocs = "SELECT COUNT(*) AS docCount FROM files";
  const queryDeleted = "SELECT COUNT(*) AS ScheduleCount FROM schedules ";
  const queryTasks = "SELECT COUNT(*) AS taskCount FROM todo_lists WHERE completed= '1'";

  db.query(queryUsers, (err, userResults) => {
    if (err) {
      console.error("Error retrieving users:", err);
      return res.status(500).json({ error: "Error retrieving users." });
    }

    db.query(queryDocs, (err, docResults) => {
      if (err) {
        console.error("Error retrieving documents :", err);
        return res.status(500).json({ error: "Error retrieving documents." });
      }

      db.query(queryDeleted, (err, deletedResults) => {
        if (err) {
          console.error("Error Recovering Deleted Content :", err);
          return res.status(500).json({ error: "Error Recovering Deleted Content." });
        }
        db.query(queryTasks, (err, taskResults) => {
          if (err) {
            console.error("Error retrieving tasks :", err);
            return res.status(500).json({ error: "Error retrieving tasks." });
          }

        res.json({
          userCount: userResults[0].userCount,
          docCount: docResults[0].docCount,
          ScheduleCount: deletedResults[0].ScheduleCount,
          taskCount: taskResults[0].taskCount,
        });
      });
    });
  });
});
}
);

module.exports = router;
