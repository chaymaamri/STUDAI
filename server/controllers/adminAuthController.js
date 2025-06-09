const db = require("../config/db"); // ou le chemin de ton module de connexion
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.adminLogin = async (req, res) => {
  const { email, mdp } = req.body;
  const query = "SELECT * FROM users WHERE email = ?";

  db.query(query, [email], async (err, results) => {
    if (err || results.length === 0) {
      return res.status(401).send("Email or password incorrect");
    }

    const user = results[0];
     // Vérifie si le compte est rejeté
    if (user.status === "rejected") {
      return res.status(403).send("Your account has been rejected. Please contact the administrator.");
    }

    if (!user.is_active) {
      return res.status(403).send("Your account is not activated. Check your email.");
    }

    // Vérifie le rôle admin
    if (user.role !== "admin") {
      return res.status(403).send("Access refused: you are not an admin");
    }

    const isPasswordValid = await bcrypt.compare(mdp, user.password);
    if (!isPasswordValid) {
      return res.status(401).send("Email or password incorrect");
    }

    // Génération du token JWT
    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token, user: { id: user.id, nomPrenom: user.nomPrenom, role: user.role } });
  });
};
