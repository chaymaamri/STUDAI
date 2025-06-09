const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const { assignBadge } = require("./gamificationController");

const OAuth2 = google.auth.OAuth2;
const oauth2Client = new OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);
oauth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

exports.register = async (req, res) => {
  const { nomPrenom, email, mdp, etablissement, hobbies } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(mdp, 10);
    const activationToken = crypto.randomBytes(32).toString("hex");

    const query =
      "INSERT INTO users (nomPrenom, email, password, etablissement, hobbies, activationToken, points) VALUES (?, ?, ?, ?, ?, ?, ?)";
    db.query(
      query,
      [
        nomPrenom,
        email,
        hashedPassword,
        etablissement,
        hobbies,
        activationToken,
        20,
      ],
      async (err, results) => {
        if (err) {
          console.error("❌ Erreur lors de l'inscription :", err);
          if (err.code === "ER_DUP_ENTRY") {
            return res
              .status(409)
              .json({ message: "User already registered with this email" });
          }
          return res.status(500).json({ message: "Error during registration" });
        }

        const userId = results.insertId;

        await assignBadge(userId, "New Beginning");

        const challenges = [
          ["Weekly Planner", 0, 5],
          ["Master Organizer", 0, 21],
          // ["Scholar of the Month", 0, 20],
          ["Top Reviser", 0, 3],
          ["Knowledge Sharer", 0, 3],
          ["Positive Vibes Champion", 0, 5],
        ];

        for (const [name, progress, target] of challenges) {
          await db
            .promise()
            .execute(
              "INSERT INTO challenges (user_id, name, progress, target) VALUES (?, ?, ?, ?)",
              [userId, name, progress, target]
            );
        }

        try {
          const accessToken = await oauth2Client.getAccessToken();
          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              type: "OAuth2",
              user: process.env.EMAIL_USER,
              clientId: process.env.CLIENT_ID,
              clientSecret: process.env.CLIENT_SECRET,
              refreshToken: process.env.REFRESH_TOKEN,
              accessToken: accessToken.token,
            },
          });

          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Activation of your STUDAI account",
            text: `Hello ${nomPrenom},\n\nPlease activate your account by clicking on this link:\nhttp://localhost:5000/api/auth/activate/${activationToken}\n\nThank you!`,
          };

          await transporter.sendMail(mailOptions);
          console.log(`📩 Activation email sent to${email}`);

          return res.status(201).json({
            message:
              "User successfully registered. Check your email to activate your account.",
          });
        } catch (emailError) {
          console.error("❌ Error when sending the email:", emailError);
          return;
        }
      }
    );
  } catch (error) {
    console.error("❌ Error during registration :", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.activateAccount = (req, res) => {
  const { token } = req.params;

  const query =
    "UPDATE users SET is_active = 1, activationToken = NULL WHERE activationToken = ?";
  db.query(query, [token], (err, results) => {
    if (err) {
      console.error("❌ Erreur lors de l'activation :", err);
      return res.status(500).send("Erreur lors de l'activation du compte.");
    }
    if (results.affectedRows === 0) {
      return res.status(400).send("❌ Token d'activation invalide ou expiré.");
    }
    res.send(
      "✅ Your account has been successfully activated! You can now connect."
    );
  });
};

exports.login = async (req, res) => {
  const { email, mdp } = req.body;
  const query = "SELECT * FROM users WHERE email = ?";

  db.query(query, [email], async (err, results) => {
    if (err || results.length === 0) {
      return res.status(401).send("Email or password incorrect");
    }

    const user = results[0];
    console.log("Statut de l'utilisateur :", user.status); // Debug

    if (user.status === "rejected") {
      return res
        .status(403)
        .send(
          "Your account has been rejected. Please contact the administrator."
        );
    }

    if (!user.is_active) {
      return res
        .status(403)
        .send("Your account is not activated. Check your email.");
    }
    // Vérification pour empêcher les comptes admin de se connecter via cette route
    if (user.role === "admin") {
      return res
        .status(403)
        .send("Refused access: please use the Admin interface.");
    }

    const isPasswordValid = await bcrypt.compare(mdp, user.password);
    if (!isPasswordValid) {
      return res.status(401).send("Email or password incorrect");
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ token, user: { id: user.id, nomPrenom: user.nomPrenom } });
  });
};
