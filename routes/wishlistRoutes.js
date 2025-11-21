const express = require("express");
const {
    addToWishlist,
    removeFromWishlist,
    getWishlist,
} = require("../controllers/wishlistController.js");

const router = express.Router();

router.post("/:userId/:productId", addToWishlist);
router.delete("/:userId/:productId", removeFromWishlist);
router.get("/:userId", getWishlist);

module.exports = router;