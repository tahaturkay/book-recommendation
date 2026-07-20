const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const libraryController = require("../controllers/libraryController");

router.get("/library", verifyToken, (req, res) => {
    res.json({message: "You can view your library", user: req.user})
});

router.get("/added", verifyToken, libraryController.getMyLibrary);

module.exports = router;