const db = require("../config/db");
exports.getTopUsers = async (req, res) => {
    try {
        const [users] = await db.promise().execute(
            "SELECT id, nomPrenom, points,role FROM users ORDER BY points DESC LIMIT 10"
        );

        res.json(users);

    } catch (error) {
        res.status(500).json({ message: "Error during the user ranking." });
    }
};
 