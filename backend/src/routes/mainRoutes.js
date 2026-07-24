const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const bookController = require("../controllers/bookController");

router.get("/main-books", verifyToken, bookController.getBooks);
router.get("/recommended-books", verifyToken, bookController.getTopRecommendedBooks);
router.get("/categories", verifyToken, bookController.getCategories);

module.exports = router;