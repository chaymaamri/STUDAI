const express = require("express");
const router = express.Router();
const leaderboardController = require("../controllers/leaderboardController");

router.get("/top-users", leaderboardController.getTopUsers);

module.exports = router;
