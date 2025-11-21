const Cart = require("../models/cart");
const Product = require("../models/product");

// ➕ Add to Cart 
const addToCart = async (req, res) => {
    const { userId, productId, size, color } = req.body;

    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        let cart = await Cart.findOne({ userId });

        const productToAdd = {
            productId: product._id,
            name: product.name,
            basePrice: product.basePrice,
            thumbnailImage: product.thumbnailImage,
            qty: 1,
            size,
            color,
        };

        // If user has no cart yet, create new one
        if (!cart) {
            cart = new Cart({ userId, products: [productToAdd] });
        } else {
            // Check if same variant (product + size + color) already exists
            const existingItem = cart.products.find(
                (p) =>
                    p.productId.toString() === productId &&
                    p.size === size &&
                    p.color === color
            );

            if (existingItem) {
                existingItem.qty += 1;
            } else {
                cart.products.push(productToAdd);
            }
        }

        await cart.save();
        res.status(200).json(cart);
    } catch (error) {
        console.error("Error in addToCart:", error);
        res.status(500).json({ message: error.message, stack: error.stack });
    }
};



// 🗑 Remove from Cart
const removeFromCart = async (req, res) => {
    const { userId, productId } = req.body;
    try {
        const cart = await Cart.findOne({ userId });
        if (!cart) return res.status(404).json({ message: "Cart not found" });

        cart.products = cart.products.filter(
            (p) => p.productId.toString() !== productId
        );
        await cart.save();
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 🧹 Clear Cart (after successful order)
const clearCart = async (req, res) => {
    const { userId } = req.params;
    try {
        const cart = await Cart.findOne({ userId });
        if (!cart) return res.status(404).json({ message: "Cart not found" });

        cart.products = [];
        await cart.save();

        res.json({ message: "Cart cleared successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 📦 Get Cart Items
const getCart = async (req, res) => {
    const { userId } = req.params;
    try {
        const cart = await Cart.findOne({ userId });
        res.json(cart || { userId, products: [] });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    addToCart,
    removeFromCart,
    clearCart,
    getCart,
};