const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const verifyToken = require("../middlewares/verifyToken");

// eğer buna post isteği gelirse authController'dan register fonksiyonu çalışacak
router.post("/register", authController.register);

router.post("/login", authController.login);

router.get("/library", verifyToken, (req, res) => {
    res.json({message: "You can view your library", user: req.user})
});

module.exports = router;