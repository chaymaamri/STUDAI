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
