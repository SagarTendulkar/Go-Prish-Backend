const express = require("express");
const { addToCart, removeFromCart, getCart, clearCart } = require("../controllers/cartController.js");
const { verifyToken } = require("../controllers/authController.js")

const router = express.Router();

router.post("/add", verifyToken, addToCart);
router.post("/remove", verifyToken, removeFromCart);
router.delete("/clear/:userId", verifyToken, clearCart);
router.get("/:userId", verifyToken, getCart);

module.exports = router;
