// routes/adminRoutes.js
const express = require("express");
const { getAdminStats } = require("../controllers/adminController");
const router = express.Router();

router.get("/stats", getAdminStats);

module.exports = router;
