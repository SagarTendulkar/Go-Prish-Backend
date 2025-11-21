const express = require("express");
const { registerUser, loginUser, verifyToken } = require("../controllers/authController")

const router = express.Router()

router.post("/registerUser", registerUser)
router.post("/loginUser", loginUser)
router.post("/verifyToken", verifyToken)

module.exports = router