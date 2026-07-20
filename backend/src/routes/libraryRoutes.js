const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const libraryController = require("../controllers/libraryController");

router.get("/display", verifyToken, libraryController.getMyLibrary);

router.post("/add", verifyToken, libraryController.addToMyLibrary);

module.exports = router;