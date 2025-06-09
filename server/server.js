const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
const fs = require("fs");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pdf = require("pdf-parse");
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;
require("dotenv").config(); // Load environment variables from .env file
const rateLimit = require("express-rate-limit");
const crypto = require('crypto');
const path = require("path");

// const dbURI =
//   "mongodb+srv://chaimaamri0:chayma123@cluster0.xievs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const app = express();

// Middleware
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);
app.use(bodyParser.json({ limit: "50mb" })); // Augmenter la limite de taille de la requête
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));


app.set('trust proxy', '127.0.0.1');
// app.use((req, res, next) => {
//   delete req.headers['x-forwarded-for'];
//   next();
// });


const mysql = require("mysql2");

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

module.exports = db;
const pool = db.promise();
// Import des routes
const authRoutes = require("./routes/authRoutes");
const gamificationRoutes = require("./routes/gamificationRoutes");
const userRoutes = require("./routes/userRoutes");
const fileRoutes = require("./routes/fileRoutes"); // Import fileRoutes
const adminRoutes = require("./routes/adminRoutes");
const chatRoutes = require('./routes/chatRoutes');
const chatpoRoutes = require('./routes/chatpoRoutes')
const profileRoutes=require('./routes/profileRoutes')
// Utilisation des routes
const leaderboard=require('./routes/leaderboard')
app.use('/api/leaderboards',leaderboard)

app.use('/api', profileRoutes);

app.use("/api/admin", adminRoutes);
app.use("/api", userRoutes);
app.use('/api', chatRoutes);
app.use('/api', chatpoRoutes);

const revisionBadgeRoutes = require("./routes/revisionBadge");
app.use("/api", revisionBadgeRoutes);


// Utilisation des routes
app.use("/api/auth", authRoutes);
app.use("/api", gamificationRoutes);
// Use the file routes
app.use("/api", fileRoutes);

// Pour rendre le dossier "uploads" accessible en statique
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// OpenAI API configuration
const OpenAI = require("openai");
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Use environment variable for API key
});

const openFun = async () => {
  try {
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "Hello!" }],
      max_tokens: 100,
    });
    console.log(chatCompletion.choices[0].message.content);
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
  }
};

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limite chaque IP à 100 requêtes par fenêtre
  message: "Trop de requêtes. Veuillez réessayer plus tard.",
});
app.use("/api/chat", limiter);

app.post("/api/chat", async (req, res) => {
  const { message } = req.body;

  try {
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content:
          `
You are an academic assistant designed to help students 🎓. 
Your job is to respond only to questions related to education, studies, school or university subjects, orientation, exams, courses, programming, and learning tools 📚💡.

✨ Always try to make your answers friendly and engaging by adding a few relevant emojis where it fits naturally (don't overuse them).

🗣️ You must adapt your language to match the language used by the user (e.g., English, French, Arabic, or Tunisian dialect).

🚫 If the user asks a question that is not related to studies (such as sports, love, entertainment, weather, horoscope, etc.), politely reply with:
"Sorry, I’m designed to answer only education-related questions. 🎓"

👩‍💻 If the user asks who created you (e.g., "who made you", "who created you", "chkoun 3malek", etc.), your answer must always be:
"Chayma Amri et Moslem Abdelli 🛠️✨" — regardless of the language used.` },
        {
          role: "user",
          content: message,
        },
      ],
      max_tokens: 1000,
    });

    const responseMessage = chatCompletion.choices[0].message.content;
    res.json({ message: responseMessage });

  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    res.status(500).send("Error processing chat request");
  }
});

// app.post("/api/chat", async (req, res) => {
//   const { conversationId, message } = req.body;    // 1️⃣ On lit conversationId

//   try {
//     // 🔹 1) Sauvegarde du message USER
//     await pool.query(
//       'INSERT INTO messages (conversation_id, sender, text) VALUES (?, ?, ?)',
//       [conversationId, 'user', message]
//     );

//     // 🔹 2) Appel à OpenAI pour la réponse AI
//     const chatCompletion = await openai.chat.completions.create({
//       model: "gpt-4-turbo",
//       messages: [{ role: "user", content: message }],
//       max_tokens: 1000,
//     });
//     const responseMessage = chatCompletion.choices[0].message.content.trim();

//     // 🔹 3) Sauvegarde du message AI
//     await pool.query(
//       'INSERT INTO messages (conversation_id, sender, text) VALUES (?, ?, ?)',
//       [conversationId, 'ai', responseMessage]
//     );

//     // 🔹 4) On renvoie la réponse sous le champ `message`
//     res.json({ message: responseMessage });
//   } catch (error) {
//     console.error("Error in /api/chat:", error);
//     res.status(500).json({ error: "Error processing chat request" });
//   }
// });
openFun();

const saveScheduleToDatabase = (userId, lines) => {
  return new Promise((resolve, reject) => {
    const query = "INSERT INTO schedules (user_id, schedule, created_at) VALUES (?, ?, NOW())";
    const values = [userId, JSON.stringify(lines)];
    db.query(query, values, (err, result) => {
      if (err) {
        console.error("Erreur lors de la sauvegarde de l'emploi du temps :", err);
        return reject(err);
      }
      console.log("Emploi du temps sauvegardé avec succès !");
      
      // Mise à jour des points : ajouter 15 points pour cet import
      const updateQuery = "UPDATE users SET points = points + 15 WHERE id = ?";
      db.query(updateQuery, [userId], (err, updateResult) => {
        if (err) {
          console.error("Erreur lors de la mise à jour des points :", err);
          return reject(err);
        }
        console.log("Points mis à jour avec succès pour l'utilisateur", userId);

        // Récupérer l'ID du badge "Organisé(e)"
        const badgeQuery = "SELECT id FROM badges WHERE name = 'Organized' LIMIT 1";
        db.query(badgeQuery, [], (err, badgeResults) => {
          if (err) {
            console.error("Erreur lors de la récupération du badge :", err);
            return reject(err);
          }
          if (badgeResults.length === 0) {
            console.error("Badge 'Organized non trouvé");
            return reject(new Error("Badge Organized' non trouvé"));
          }
          const badgeId = badgeResults[0].id;
          // Vérifier si l'utilisateur a déjà ce badge
          const checkBadgeQuery = "SELECT COUNT(*) as count FROM user_badges WHERE user_id = ? AND badge_id = ?";
          db.query(checkBadgeQuery, [userId, badgeId], (err, checkResults) => {
            if (err) {
              console.error("Erreur lors de la vérification du badge :", err);
              return reject(err);
            }
            if (checkResults[0].count === 0) {
              // Assigner le badge "Organisé(e)" à l'utilisateur
              const insertBadgeQuery = "INSERT INTO user_badges (user_id, badge_id, obtained_at) VALUES (?, ?, NOW())";
              db.query(insertBadgeQuery, [userId, badgeId], (err, insertResult) => {
                if (err) {
                  console.error("Erreur lors de l'attribution du badge :", err);
                  return reject(err);
                }
                console.log("Badge 'Organized' attribué à l'utilisateur", userId);
                resolve(result);
              });
            } else {
              // Le badge est déjà attribué
              resolve(result);
            }
          });
        });
      });
    });
  });
};




const getScheduleFromDatabase = (userId, callback) => {
  const query = "SELECT schedule FROM schedules WHERE user_id = ?";
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération de l'emploi du temps :", err);
      callback([]);
    } else {
      callback(results);
    }
  });
};
const filterCoursesByDayWithOpenAI = async (lines, nextDay) => {
  if (!lines || lines.length === 0) {
    console.error("Lines is null or undefined");
    return [];
  }

  const prompt = `Here is a list of lines extracted from a class schedule. Please extract only the relevant course names for the day ${nextDay} and ignore all other information (such as professor names, room numbers, specialization names, etc.). Focus only on the tables within the PDF—any other information is not important:\n\n${lines.join(
  "\n"
)}\n\nCourse names for ${nextDay}:`

  console.log("📌 Prompt envoyé à OpenAI :", prompt);
  try {
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
    });

    const response = chatCompletion.choices[0].message.content;
    const courses = response
      .split("\n")
      .map((course) => course.trim())
      .filter((course) => course.length > 0);

    return [...new Set(courses)]; // Éliminer les doublons
  } catch (error) {
    console.error("Erreur lors de l'appel à l'API OpenAI :", error);
    return [];
  }
};

const generateRevisionSuggestions = async (courses) => {
  const suggestions = [];
  for (const course of courses) {
    const message = `Give me study suggestions for the course ${course}.  
Please format the suggestions without using numbers.`
;
    try {
      const chatCompletion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: message }],
        max_tokens: 1000,
      });
      const suggestionsText = chatCompletion.choices[0].message.content.trim();

      suggestions.push({
        subject: course,
        suggestions: suggestionsText.split('\n'), // Transformez en tableau si nécessaire
      });
    } catch (error) {
      console.error("Erreur lors de l'appel à l'API OpenAI :", error);
    }
  }

  return suggestions;
};

// Route pour télécharger et analyser le PDF
app.post("/api/upload", multer().single("pdf"), async (req, res) => {
  if (!req.file) {
    return res.status(400).send("Aucun fichier téléchargé.");
  }
  try {
    const dataBuffer = req.file.buffer;
    const pdfData = await pdf(dataBuffer);
    const lines = pdfData.text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (!lines || lines.length === 0) {
      return res.status(400).send("Aucune ligne pertinente trouvée dans le fichier PDF.");
    }

    const userId = req.body.userId;
    await saveScheduleToDatabase(userId, lines);
    res.json({ message: "Emploi du temps sauvegardé avec succès !" });
  } catch (error) {
    console.error("Erreur lors de l'analyse du PDF :", error);
    res.status(500).send("Erreur lors de l'analyse du fichier PDF.");
  }
});

app.get("/api/schedule-suggestions/:userId", async (req, res) => {
  const { userId } = req.params;
  const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
  // Utiliser DATE_FORMAT pour être sûr du format
  const selectQuery = "SELECT suggestions FROM suggestions WHERE user_id = ? AND type = 'revision' AND DATE_FORMAT(created_at, '%Y-%m-%d') = ?";
  
  db.query(selectQuery, [userId, today], async (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération des suggestions :", err);
      return res.status(500).json({ error: "Erreur lors de la récupération des suggestions." });
    }
    if (results.length > 0) {
      // Suggestions déjà générées pour aujourd'hui
      const storedSuggestions = JSON.parse(results[0].suggestions);
      return res.json({ suggestions: storedSuggestions });
    } else {
      // Aucune suggestion enregistrée pour aujourd'hui : générer
      getScheduleFromDatabase(userId, async (schedule) => {
        console.log("📌 Schedule récupéré :", schedule);
      
        // Si le schedule est vide, ne rien faire ou retourner une réponse vide
        if (schedule.length === 0) {
          console.log("📌 Aucun schedule trouvé pour cet utilisateur.");
          return res.json({ suggestions: [] }); // Retourne une liste vide
        }
      
        const lines = JSON.parse(schedule[0].schedule);
        console.log("📌 Contenu extrait :", lines);
      
        const daysOfWeek = ['dim', 'lun', 'mar', 'mer', 'jeu', 'ven', 'sam'];
        let currentDay = new Date().getDay();
        let tomorrowIndex = (currentDay + 1) % 7;
        let dayName = daysOfWeek[tomorrowIndex];
        let courses = [];
        let attempts = 0;
      
        while (attempts < 7) {
          // Si samedi, on peut retourner un message par défaut
          if (dayName === 'dim' && attempts === 0) {
            const defaultMsg = [{
              subject: "Info",
              suggestions: ["Saturday: Take a moment to organize your to-do list."]
            }];
            const insertQuery = "INSERT INTO suggestions (user_id, type, suggestions) VALUES (?, 'revision', ?)";
            db.query(insertQuery, [userId, JSON.stringify(defaultMsg)], (err, result) => {
              if (err) console.error("Erreur lors de l'insertion :", err);
            });
            return res.json({ suggestions: defaultMsg });
          }
          courses = await filterCoursesByDayWithOpenAI(lines, dayName);
          console.log(`📌 Cours pour ${dayName} :`, courses);
          if (courses && courses.length > 0) break;
          tomorrowIndex = (tomorrowIndex + 1) % 7;
          dayName = daysOfWeek[tomorrowIndex];
          attempts++;
        }
      
        if (!courses || courses.length === 0) {
          const defaultSuggestion = [{
            subject: "Erreur",
            suggestions: ["Aucun cours trouvé pour les jours à venir."]
          }];
          const insertQuery = "INSERT INTO suggestions (user_id, type, suggestions) VALUES (?, 'revision', ?)";
          db.query(insertQuery, [userId, JSON.stringify(defaultSuggestion)], (err, result) => {
            if (err) console.error("Erreur lors de l'insertion :", err);
          });
          return res.json({ suggestions: defaultSuggestion });
        }
      
        const generatedSuggestions = await generateRevisionSuggestions(courses);
        console.log("📌 Suggestions générées :", generatedSuggestions);
      
        const insertQuery = "INSERT INTO suggestions (user_id, type, suggestions) VALUES (?, 'revision', ?)";
        db.query(insertQuery, [userId, JSON.stringify(generatedSuggestions)], (err, result) => {
          if (err) console.error("Erreur lors de l'insertion :", err);
        });
      
        return res.json({ suggestions: generatedSuggestions });
      });
    }
  });
});



app.get('/api/schedule-exists/:userId', (req, res) => {
  const { userId } = req.params;
  const query = 'SELECT COUNT(*) AS count FROM schedules WHERE user_id = ?';
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Erreur lors de la vérification de l'emploi du temps :", err);
      return res.status(500).json({ error: "Erreur lors de la vérification de l'emploi du temps." });
    }
    const exists = results[0].count > 0;
    res.json({ exists });
  });
});

app.delete('/api/schedule/:userId', (req, res) => {
  const { userId } = req.params;
  const deleteScheduleQuery = 'DELETE FROM schedules WHERE user_id = ?';
  const deleteSuggestionsQuery = 'DELETE FROM suggestions WHERE user_id = ?';

  db.query(deleteScheduleQuery, [userId], (err, result) => {
    if (err) {
      console.error("Erreur lors de la suppression de l'emploi du temps :", err);
      return res.status(500).json({ error: "Erreur lors de la suppression de l'emploi du temps." });
    }

    db.query(deleteSuggestionsQuery, [userId], (err, result) => {
      if (err) {
        console.error("Erreur lors de la suppression des suggestions :", err);
        return res.status(500).json({ error: "Erreur lors de la suppression des suggestions." });
      }

      res.json({ message: "Emploi du temps et suggestions supprimés avec succès !" });
    });
  });
});
// Add task endpoint
app.post('/api/todo/add', (req, res) => {
  const { userId, task } = req.body;
  const insertQuery = 'INSERT INTO todo_lists (user_id, task, due_date) VALUES (?, ?, ?)';
  const values = [userId, task, new Date()];
  const deleteSuggestionsQuery = 'DELETE FROM suggestions WHERE user_id = ?';

  db.query(insertQuery, values, (err, result) => {
    if (err) {
      console.error("Erreur lors de l'ajout de la tâche :", err);
      return res.status(500).send("Erreur lors de l'ajout de la tâche");
    }

    // Suppression des suggestions
    db.query(deleteSuggestionsQuery, [userId], (err, resultSuggestions) => {
      if (err) {
        console.error("Erreur lors de la suppression des suggestions :", err);
        return res.status(500).json({ error: "Erreur lors de la suppression des suggestions." });
      }

      // Vérifier le nombre de tâches ajoutées aujourd'hui
      const countQuery = `
        SELECT COUNT(*) as count 
        FROM todo_lists 
        WHERE user_id = ? AND DATE(due_date) = CURDATE()`;
      db.query(countQuery, [userId], (err, countResults) => {
        if (err) {
          console.error("Erreur lors du comptage des tâches :", err);
          // On continue malgré tout...
        } else {
          const tasksAddedToday = countResults[0].count;
          if (tasksAddedToday <= 10) {
            // Ajoute 5 points pour chaque tâche ajoutée (max 10 par jour)
            const updatePointsQuery = "UPDATE users SET points = points + 5 WHERE id = ?";
            db.query(updatePointsQuery, [userId], (err, updateResult) => {
              if (err) {
                console.error("Erreur lors de la mise à jour des points :", err);
              } else {
                console.log("5 points ajoutés à l'utilisateur", userId);
              }
            });
          }
        }
      });

      res.json({ 
        id: result.insertId, 
        task, 
        due_date: new Date().toLocaleString(), 
        completed: false 
      });
    });
  });
});




app.get('/api/todo_lists/:user_id', (req, res) => {
  const { user_id } = req.params;

  const query = 'SELECT * FROM todo_lists WHERE user_id = ? ORDER BY due_date ASC';
  db.query(query, [user_id], (err, results) => {
      if (err) {
          console.error("❌ Erreur lors de la récupération des tâches :", err);
          return res.status(500).json({ error: "Erreur lors de la récupération des tâches." });
      }
      res.json(results);
  });
});
// Update task endpoint
app.put('/api/todo_lists/update/:taskId', (req, res) => {
  const { taskId } = req.params;
  const { task, completed, previousCompleted } = req.body;

  const updateQuery = 'UPDATE todo_lists SET task = ?, completed = ? WHERE id = ?';
  const deleteSuggestionsQuery = 'DELETE FROM suggestions WHERE user_id = (SELECT user_id FROM todo_lists WHERE id = ?)';

  db.query(updateQuery, [task, completed, taskId], (err, result) => {
    if (err) {
      console.error("Erreur lors de la mise à jour de la tâche :", err);
      return res.status(500).json({ error: "Erreur lors de la mise à jour de la tâche." });
    }

    db.query(deleteSuggestionsQuery, [taskId], (err, result) => {
      if (err) {
        console.error("Erreur lors de la suppression des suggestions :", err);
        return res.status(500).json({ error: "Erreur lors de la suppression des suggestions." });
      }

      // Si la tâche vient d'être complétée, on effectue la mise à jour de la gamification
      if (completed && !previousCompleted) {
        // Récupérer l'ID utilisateur depuis la tâche
        const userQuery = "SELECT user_id FROM todo_lists WHERE id = ?";
        db.query(userQuery, [taskId], (err, userResults) => {
          if (err) {
            console.error("Erreur lors de la récupération de l'utilisateur :", err);
            return res.status(500).json({ error: "Erreur lors de la récupération de l'utilisateur." });
          }

          const userId = userResults[0].user_id;

          // Mise à jour des points (+10)
          const updatePointsQuery = "UPDATE users SET points = points + 10 WHERE id = ?";
          db.query(updatePointsQuery, [userId], (err, updateResult) => {
            if (err) {
              console.error("Erreur lors de la mise à jour des points :", err);
              // On continue même en cas d'erreur sur les points
            }

            // 1. Mise à jour du défi "Super Organisé"
            // On compte le nombre de tâches complétées aujourd'hui
            const today = new Date().toISOString().slice(0, 10);
            const countTodayQuery = `
              SELECT COUNT(*) AS count 
              FROM todo_lists 
              WHERE user_id = ? AND completed = 1 AND DATE(due_date) = ?
            `;
            db.query(countTodayQuery, [userId, today], (err, todayResults) => {
              if (err) {
                console.error("Erreur lors du comptage des tâches d'aujourd'hui :", err);
                // On continue malgré l'erreur
              }
              const todayCount = todayResults[0].count;
              // Si exactement 3 tâches sont complétées aujourd'hui, on incrémente la progression
              if (todayCount === 3) {
                const updateChallengeSO = `
                  UPDATE challenges 
                  SET progress = progress + 1 
                  WHERE user_id = ? AND name = 'Master Organizer'
                `;
                db.query(updateChallengeSO, [userId], (err, result) => {
                  if (err) {
                    console.error("Erreur lors de la mise à jour du défi 'Master Organizer :", err);
                  }
                  // Vérification éventuelle de la complétion du défi (exemple : progress >= target)
                  const checkChallengeSO = `
                    SELECT progress, target 
                    FROM challenges 
                    WHERE user_id = ? AND name = 'Master Organizer'
                  `;
                  db.query(checkChallengeSO, [userId], (err, challengeResults) => {
                    if (err) {
                      console.error("Erreur lors de la vérification du défi 'Master Organizer' :", err);
                    }
                    const { progress, target } = challengeResults[0];
                    if (progress >= target) {
                      const markCompletedSO = `
                        UPDATE challenges 
                        SET completed = 1 
                        WHERE user_id = ? AND name = 'Master Organizer'
                      `;
                      db.query(markCompletedSO, [userId], (err, markRes) => {
                        if (err) {
                          console.error("Erreur lors de la validation du défi 'Master Organizer' :", err);
                        }
                      });
                    }
                  });
                });
              }

              // 2. Mise à jour du défi "Planificateur de la Semaine"
              const now = new Date();
              let dayOfWeek = now.getDay(); // 0 = dimanche
              let diff = dayOfWeek - 1;
              if(diff < 0) diff = 0;
              const lastMonday = new Date(now);
              lastMonday.setDate(now.getDate() - diff);
              const mondayDate = lastMonday.toISOString().slice(0, 10);
              const countWeekQuery = `
                SELECT COUNT(*) AS count 
                FROM todo_lists 
                WHERE user_id = ? AND completed = 1 AND DATE(due_date) >= ?
              `;
              db.query(countWeekQuery, [userId, mondayDate], (err, weekResults) => {
                if (err) {
                  console.error("Erreur lors du comptage des tâches de la semaine :", err);
                }
                const weekCount = weekResults[0].count;
                if (weekCount === 5) {
                  const updateChallengePS = `
                    UPDATE challenges 
                    SET progress = progress + 1 
                    WHERE user_id = ? AND name = 'Weekly Planner'
                  `;
                  db.query(updateChallengePS, [userId], (err, result) => {
                    if (err) {
                      console.error("Erreur lors de la mise à jour du défi 'Weekly Planner' :", err);
                    }
                    // Vérifier la complétion du défi
                    const checkChallengePS = `
                      SELECT progress, target 
                      FROM challenges 
                      WHERE user_id = ? AND name = 'Weekly Planner'
                    `;
                    db.query(checkChallengePS, [userId], (err, challengeResults) => {
                      if (err) {
                        console.error("Erreur lors de la vérification du défi 'Weekly Planner' :", err);
                      }
                      const { progress, target } = challengeResults[0];
                      if (progress >= target) {
                        const markCompletedPS = `
                          UPDATE challenges 
                          SET completed = 1 
                          WHERE user_id = ? AND name = 'Weekly Planner'
                        `;
                        db.query(markCompletedPS, [userId], (err, markRes) => {
                          if (err) {
                            console.error("Erreur lors de la validation du défi 'Weekly Planner' :", err);
                          }
                        });
                      }
                    });
                  });
                }

                // 3. Vérification globale pour le badge "Étudiant Organisé"
                const countCompletedQuery = `
                  SELECT COUNT(*) AS count 
                  FROM todo_lists 
                  WHERE user_id = ? AND completed = 1
                `;
                db.query(countCompletedQuery, [userId], (err, countResults) => {
                  if (err) {
                    console.error("Erreur lors du comptage des tâches complétées :", err);
                    return res.status(500).json({ error: "Erreur lors du comptage des tâches complétées." });
                  }
                  if (countResults[0].count >= 10) {
                    const badgeQuery = "SELECT id FROM badges WHERE name = 'Organized Student' LIMIT 1";
                    db.query(badgeQuery, [], (err, badgeResults) => {
                      if (err) {
                        console.error("Erreur lors de la récupération du badge :", err);
                        return res.status(500).json({ error: "Erreur lors de la récupération du badge." });
                      }
                      if (badgeResults.length > 0) {
                        const badgeId = badgeResults[0].id;
                        const checkBadgeQuery = "SELECT COUNT(*) AS count FROM user_badges WHERE user_id = ? AND badge_id = ?";
                        db.query(checkBadgeQuery, [userId, badgeId], (err, checkResults) => {
                          if (err) {
                            console.error("Erreur lors de la vérification du badge :", err);
                            return res.status(500).json({ error: "Erreur lors de la vérification du badge." });
                          }
                          if (checkResults[0].count === 0) {
                            const insertBadgeQuery = "INSERT INTO user_badges (user_id, badge_id, obtained_at) VALUES (?, ?, NOW())";
                            db.query(insertBadgeQuery, [userId, badgeId], (err, insertResult) => {
                              if (err) {
                                console.error("Erreur lors de l'attribution du badge :", err);
                                return res.status(500).json({ error: "Erreur lors de l'attribution du badge." });
                              }
                              console.log("Badge 'Organized Student' attribué à l'utilisateur", userId);
                              return res.json({ message: "Task updated, challenges updated and badge awarded!", badge: "Organized Student" });
                            });
                          } else {
                            return res.json({ message: "Task updated and challenges updated!" });
                          }
                        });
                      }
                    });
                  } else {
                    return res.json({ message: "Task updated and challenges updated!" });
                  }
                });
              });
            });
          });
        });
      } else {
        return res.json({ message: "Task updated!" });
      }
    });
  });
});


// Add this endpoint to server.js
app.delete('/api/todo_lists/delete/:taskId', (req, res) => {
  const { taskId } = req.params;
  const query = 'DELETE FROM todo_lists WHERE id = ?';
  const deleteSuggestionsQuery = 'DELETE FROM suggestions WHERE user_id = (SELECT user_id FROM todo_lists WHERE id = ?)';

  db.query(query, [taskId], (err, result) => {
    if (err) {
      console.error("❌ Erreur lors de la suppression de la tâche :", err);
      return res.status(500).json({ error: "Erreur lors de la suppression de la tâche." });
    }

    db.query(deleteSuggestionsQuery, [taskId], (err, result) => {
      if (err) {
        console.error("Erreur lors de la suppression des suggestions :", err);
        return res.status(500).json({ error: "Erreur lors de la suppression des suggestions." });
      }

      res.send('Task deleted!');
    });
  });
});
// app.get('/api/todo-suggestions/:userId', async (req, res) => {
//   const { userId } = req.params;
//   db.query('SELECT task FROM todo_lists WHERE user_id = ?', [userId], async (err, results) => {
//       if (err) {
//           console.error("Erreur lors de la récupération des tâches :", err);
//           return res.status(500).json({ error: "Erreur lors de la récupération des tâches." });
//       }

//       if (results.length === 0) {
//           return res.json({ suggestions: [] });
//       }

//       const tasks = results.map(row => row.task).join(', ');
//       try {
//           const chatCompletion = await openai.chat.completions.create({
//               model: "gpt-3.5-turbo",
//               messages: [
//                   { role: "system", content: "Tu es un assistant qui aide à organiser le planning des étudiants." },
//                   { role: "user", content: `Voici mes tâches à venir : ${tasks}. Peux-tu me donner des suggestions d'activités et de révisions ?` }
//               ],
//               max_tokens: 250,
//           });
          
//           // Supposons que la réponse soit une chaîne avec des suggestions séparées par un saut de ligne
//           const suggestionsArray = chatCompletion.choices[0].message.content
//             .split("\n")
//             .filter(s => s.trim() !== "");
          
//           // On transforme chaque suggestion en un objet cohérent
//           const suggestions = suggestionsArray.map(suggestion => ({
//             subject: "Activités & Révisions",
//             suggestions: [suggestion]
//           }));
//           res.json({ suggestions });
//       } catch (error) {
//           console.error('Erreur lors de la génération des suggestions :', error);
//           res.status(500).send('Erreur lors de la génération des suggestions.');
//       }
//   });
// });

// Nouvel endpoint pour les suggestions d'activités basées sur les hobbies
app.get('/api/activity-suggestions/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    // Récupérer les hobbies de l'utilisateur
    db.query('SELECT hobbies FROM users WHERE id = ?', [userId], async (err, userResults) => {
      if (err) {
        console.error("Erreur lors de la récupération des hobbies :", err);
        return res.status(500).json({ error: "Erreur lors de la récupération des hobbies." });
      }

      if (userResults.length === 0) {
        return res.status(404).json({ error: "Utilisateur non trouvé." });
      }

      const hobbies = userResults[0].hobbies;

      // Récupérer les tâches non complétées
      db.query('SELECT task FROM todo_lists WHERE user_id = ? AND completed = 0', [userId], async (err, taskResults) => {
        if (err) {
          console.error("Erreur lors de la récupération des tâches :", err);
          return res.status(500).json({ error: "Erreur lors de la récupération des tâches." });
        }

        const tasks = taskResults.map(row => row.task).join(', ') || "Aucune tâche non complétée";

        const prompt = `You are a positive and energetic coach. Your goal is to help the user plan their day in a motivating way.

Here are their incomplete tasks: ${tasks}.
Here are their hobbies: ${hobbies}.

Your mission:
- Create a list of activities or moments throughout the day, inspired by both the tasks and hobbies.
- Encourage the user with a warm and optimistic tone.
- Use phrases like: "Here’s what you could do today!" or "An amazing day awaits with these activities!"
- Don’t include specific times — keep it vague (e.g., "during your free time", "in the afternoon", etc.)
- Avoid simply repeating the raw task list.

Respond directly with inspiring suggestions, without mentioning that you're an AI.`
;

        try {
          const chatCompletion = await openai.chat.completions.create({
            model: "gpt-4-turbo",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 500,
          });

          const responseText = chatCompletion.choices[0].message.content;
          return res.json({ suggestions: responseText });
        } catch (error) {
          console.error("Erreur lors de la génération des suggestions d'activités :", error);
          return res.status(500).send("Erreur lors de la génération des suggestions d'activités.");
        }
      });
    });
  } catch (error) {
    console.error("Erreur inattendue :", error);
    return res.status(500).json({ error: "Erreur inattendue." });
  }
});


app.post("/api/upload-courses", multer().array("pdfs"), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).send("Aucun fichier téléchargé.");
  }

  const userId = req.body.userId;
  const courses = [];

  try {
    // Traiter chaque fichier (ici de façon séquentielle)
    for (const file of req.files) {
      const dataBuffer = file.buffer;
      const pdfData = await pdf(dataBuffer);
      const lines = pdfData.text
        .split("\n")
        .map(line => line.trim())
        .filter(line => line.length > 0);

        const prompt = 
        `You are an academic assistant.

Here is the raw content of a course (extracted from a PDF file):

${lines.join("\n")}

Your mission is to:
- Identify and extract the main title of the course.
- Write a clear and concise summary in 5 to 10 lines max.
- List the key points as bullet points, with each point being a single sentence.

Important:
- Follow this exact structure in your response:
  1. Title
  2. Summary
  3. Key Points
- Do not create or add any fictional content — stay true to the provided text.
- If an element is missing (e.g., no clear title), suggest a logical title based on the content.

Format your response exactly like this:
Title: [insert title here]

Summary: [insert summary here]

Key Points:
- [key point 1]
- [key point 2]
- [key point 3]
...`
;
        
      const chatCompletion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 500,
      });

      const response = chatCompletion.choices[0].message.content;
      const [title, summary, ...keyPoints] = response
        .split("\n")
        .map(line => line.trim())
        .filter(line => line.length > 0);

      courses.push({ title, summary, keyPoints });

      // Sauvegarder le cours dans la base
      await new Promise((resolve, reject) => {
        const query = "INSERT INTO courses (user_id, title, summary, key_points) VALUES (?, ?, ?, ?)";
        const values = [userId, title, summary, JSON.stringify(keyPoints)];
        db.query(query, values, (err, result) => {
          if (err) {
            console.error("Erreur lors de la sauvegarde du cours :", err);
            reject(err);
          } else {
            resolve(result);
          }
        });
      });

      // Mise à jour des points : +10 points pour chaque cours importé
      await new Promise((resolve, reject) => {
        const updatePointsQuery = "UPDATE users SET points = points + 10 WHERE id = ?";
        db.query(updatePointsQuery, [userId], (err, updateResult) => {
          if (err) {
            console.error("Erreur lors de la mise à jour des points :", err);
            reject(err);
          } else {
            console.log("10 points ajoutés à l'utilisateur", userId);
            resolve(updateResult);
          }
        });
      });
    }
    
    res.json({ message: "Cours téléchargés avec succès !", courses });
  } catch (error) {
    console.error("Erreur lors de l'importation des cours :", error);
    res.status(500).json({ error: "Erreur lors de l'importation des cours." });
  }
});




app.post("/api/courses/summary-view", (req, res) => {
  const { userId, courseId } = req.body;
  // Vous pouvez ajouter ici une logique pour éviter d'ajouter +5 points plusieurs fois pour le même cours (ex. vérifier un enregistrement dans une table dédiée)
  const updatePointsQuery = "UPDATE users SET points = points + 5 WHERE id = ?";
  db.query(updatePointsQuery, [userId], (err, result) => {
    if (err) {
      console.error("Erreur lors de la mise à jour des points pour résumé consulté :", err);
      return res.status(500).json({ error: "Erreur lors de la mise à jour des points." });
    }
    console.log("5 points ajoutés à l'utilisateur", userId, "pour consultation du résumé du cours", courseId);
    res.json({ message: "Résumé consulté, 5 points ajoutés !" });
  });
});

app.get("/api/courses/:userId", (req, res) => {
  const { userId } = req.params;
  const query = "SELECT * FROM courses WHERE user_id = ?";
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération des cours :", err);
      return res.status(500).json({ error: "Erreur lors de la récupération des cours." });
    }
    const formattedResults = results.map(course => ({
      ...course,
      keyPoints: JSON.parse(course.key_points),
    }));
    res.json({ courses: formattedResults });
  });
});
// New endpoint to delete a course
app.delete("/api/courses/:courseId", (req, res) => {
  const { courseId } = req.params;
  const query = "DELETE FROM courses WHERE id = ?";
  db.query(query, [courseId], (err, result) => {
    if (err) {
      console.error("Erreur lors de la suppression du cours :", err);
      return res.status(500).json({ error: "Erreur lors de la suppression du cours." });
    }
    res.json({ message: "Cours supprimé avec succès !" });
  });
});


// Démarrage du serveur
const PORT = 5000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);