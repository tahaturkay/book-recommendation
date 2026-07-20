const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");

router.get("/library", verifyToken, (req, res) => {
    res.json({message: "You can view your library", user: req.user})
});

module.exports = router;