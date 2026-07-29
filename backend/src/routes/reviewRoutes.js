const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const reviewController = require("../controllers/reviewController");

router.post("/add-review/:bookID", verifyToken, reviewController.addReview);
router.get("/get-reviews/:bookID", verifyToken, reviewController.getBookReviews);
router.put("/update-reviews/:reviewID", verifyToken, reviewController.updateReview);
router.delete("/delete-reviews/:reviewID", verifyToken, reviewController.deleteReview);

module.exports = router;