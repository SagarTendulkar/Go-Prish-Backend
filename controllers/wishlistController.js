const Wishlist = require("../models/Wishlist.js");

// Add product to wishlist
const addToWishlist = async (req, res) => {
    const { userId, productId } = req.params;

    try {
        let wishlist = await Wishlist.findOne({ userId });

        if (!wishlist) {
            wishlist = new Wishlist({ userId, products: [productId] });
        } else if (!wishlist.products.includes(productId)) {
            wishlist.products.push(productId);
        }

        await wishlist.save();
        res.status(200).json({ success: true, wishlist });
    } catch (error) {
        res.status(500).json({ message: "Error adding to wishlist", error });
    }
};

// Remove product from wishlist
const removeFromWishlist = async (req, res) => {
    const { userId, productId } = req.params;

    try {
        const wishlist = await Wishlist.findOne({ userId });

        if (wishlist) {
            wishlist.products = wishlist.products.filter(
                (id) => id.toString() !== productId
            );
            await wishlist.save();
        }

        res.status(200).json({ success: true, wishlist });
    } catch (error) {
        res.status(500).json({ message: "Error removing from wishlist", error });
    }
};

// Get all wishlist products for a user
const getWishlist = async (req, res) => {
    const { userId } = req.params;

    try {
        const wishlist = await Wishlist.findOne({ userId }).populate("products");

        if (!wishlist) return res.status(200).json({ products: [] });

        res.status(200).json({ success: true, products: wishlist.products });
    } catch (error) {
        res.status(500).json({ message: "Error fetching wishlist", error });
    }
};

module.exports = { addToWishlist, removeFromWishlist, getWishlist }
