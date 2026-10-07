const express = require("express");
const { registerUser, loginUser, verifyToken, forgotPassword, resetPassword, changePassword } = require("../controllers/authController")

const router = express.Router()

router.post("/registerUser", registerUser)
router.post("/loginUser", loginUser)
router.post("/forgot-password", forgotPassword)
router.post("/reset-password/:token", resetPassword)
router.post("/change-password", verifyToken, changePassword)

module.exports = router