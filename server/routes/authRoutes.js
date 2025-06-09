const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/signup", authController.register);
router.post("/signin", authController.login);
router.get("/activate/:token", authController.activateAccount); // 🔥 Cette route doit exister !

module.exports = router;
