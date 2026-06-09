const express = require("express");
const {
    addToWishlist,
    removeFromWishlist,
    getWishlist,
} = require("../controllers/wishlistController.js");
const { verifyToken } = require("../controllers/authController.js");

const router = express.Router();

router.post("/:userId/:productId", verifyToken, addToWishlist);
router.delete("/:userId/:productId", verifyToken, removeFromWishlist);
router.get("/:userId", verifyToken, getWishlist);

module.exports = router;