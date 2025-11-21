const express = require("express");
const { addToCart, removeFromCart, getCart, clearCart } = require("../controllers/cartController.js");

const router = express.Router();

router.post("/add", addToCart);
router.post("/remove", removeFromCart);
router.delete("/clear/:userId", clearCart);
router.get("/:userId", getCart);

module.exports = router;
