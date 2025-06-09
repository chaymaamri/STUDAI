const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../config/db'); // Connexion à la base de données

const saltRounds = 10;
// Route GET pour récupérer les informations de l'utilisateur
router.get('/user/:id', (req, res) => {
  const userId = req.params.id;
  const sql = 'SELECT id, nomPrenom, email, etablissement, hobbies,points,role FROM users WHERE id = ?';
  db.query(sql, [userId], (err, results) => {
    if (err) { 
      console.error(err);
      return res.status(500).json({ message: 'Erreur serveur' });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    res.json(results[0]);
  });
});


// Route PUT pour mettre à jour le nom/prénom
router.put('/user/name', (req, res) => {
  const { id, nomPrenom } = req.body;
  if (!id || !nomPrenom) {
    return res.status(400).json({ message: 'Données manquantes' });
  }
  const sql = 'UPDATE users SET nomPrenom = ? WHERE id = ?';
  db.query(sql, [nomPrenom, id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Erreur serveur' });
    }
    res.json({ message: 'Nom et prénom mis à jour avec succès' });
  });
});

// Route PUT pour mettre à jour le mot de passe (avec bcrypt)
router.put('/user/password', (req, res) => {
  const { id, password } = req.body;
  if (!id || !password) {
    return res.status(400).json({ message: 'Données manquantes' });
  }
  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Erreur lors du hachage du mot de passe' });
    }
    const sql = 'UPDATE users SET password = ? WHERE id = ?';
    db.query(sql, [hash, id], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Erreur serveur' });
      }
      res.json({ message: 'Mot de passe mis à jour avec succès' });
    });
  });
});



  
// Route DELETE pour supprimer le compte utilisateur et les enregistrements liés
router.delete('/user/:id', async (req, res) => {
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
  
      res.json({ message: 'Compte et enregistrements associés supprimés avec succès' });
    } catch (error) {
      // En cas d'erreur, annuler la transaction
      await db.promise().rollback();
      console.error(error);
      res.status(500).json({ message: 'Erreur serveur lors de la suppression du compte' });
    }
  });
  
// Route PUT pour mettre à jour les hobbies
router.put('/user/hobbies', (req, res) => {
  const { id, hobbies } = req.body;
  if (!id || !hobbies) {
    return res.status(400).json({ message: 'Données manquantes' });
  }
  const sql = 'UPDATE users SET hobbies = ? WHERE id = ?';
  db.query(sql, [hobbies, id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Erreur serveur' });
    }
    res.json({ message: 'Hobbies mis à jour avec succès' });
  });
});
module.exports = router; // Exportez uniquement le routeur