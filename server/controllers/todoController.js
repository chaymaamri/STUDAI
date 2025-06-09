const db = require("../config/db");
exports.addTask = async (req, res) => {
    const { userId, task } = req.body;

    try {
        await db.promise().execute("INSERT INTO tasks (user_id, task) VALUES (?, ?)", [userId, task]);
        await addPoints(userId, 5);
        await updateChallenge(userId, "Weekly Planner");
        await updateChallenge(userId, "Master Organizer");

        res.json({ message: "Successfully added task." });

    } catch (error) {
        res.status(500).json({ message: "Error when adding the task" });
    }
};
