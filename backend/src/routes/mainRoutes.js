const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const bookController = require("../controllers/bookController");

router.get("/main-books", verifyToken, bookController.getBooks);

module.exports = router;