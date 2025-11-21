const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
    userId: {
        type: String, // can replace later with ObjectId
        required: true,
    },
    products: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true,
            },
            name: String,
            thumbnailImage: String,
            basePrice: Number,
            qty: { type: Number, default: 1 },
            size: { type: String, required: true },
            color: { type: String, required: true },
        },
    ],
});

const Cart = mongoose.model("Cart", cartSchema);
module.exports = Cart;
