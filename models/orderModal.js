const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // optional if you have a User model
        required: true,
    },
    name: String,
    email: String,
    phone: String,
    address: String,
    cart: [
        {
            productId: mongoose.Schema.Types.ObjectId,
            name: String,
            color: String,
            size: String,
            price: Number,
            qty: Number,
            image: String,
        },
    ],
    totalAmount: Number,
    status: {
        type: String,
        default: "Pending",
    },
},
    { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema)
module.exports = Order;