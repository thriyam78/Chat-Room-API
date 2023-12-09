const express = require("express");
const { getAllMessage } = require("../controllers/messageController");
const { checkAuth } = require("../middleware/checkAuth");
const router = express.Router();

router.get("/history/:userId", checkAuth, getAllMessage);

module.exports = router;
