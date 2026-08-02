const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const aiController = require("../controllers/aiController");

router.get("/ai-recomm", verifyToken, aiController.getAIRecommendations);

module.exports = router;