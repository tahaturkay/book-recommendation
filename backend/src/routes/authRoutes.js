const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// eğer buna post isteği gelirse authController'dan register fonksiyonu çalışacak
router.post("/register", authController.register);

router.post("/login", authController.login);

module.exports = router;