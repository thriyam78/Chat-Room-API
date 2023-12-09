const express = require("express");
const router = express.Router();
const { checkAuth } = require("../middleware/checkAuth");
const {
  Register,
  Login,
  getAllUser,
  updateStatus,
} = require("../controllers/userController");

router.post("/register", Register);
router.post("/login", Login);
router.get("/allUsers", getAllUser);
router.patch("/updateUser/:status", checkAuth, updateStatus);

module.exports = router;
