// Import mongoose
const mongoose = require("mongoose");

// 🧩 Size schema (for S, M, L, XL, etc.)
const sizeSchema = new mongoose.Schema({
    size: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    mrp: {
        type: Number,
        required: true,
    },
    discount: {
        type: Number,
        default: 0, // Automatically calculated in controller
    },
    countInStock: {
        type: Number,
        default: 0,
    },
});

// 🎨 Variant schema (for colors)
const variantSchema = new mongoose.Schema({
    color: {
        type: String,
    },
    colorCode: {
        type: String,
        required: true,
    },
    images: [
        {
            type: String, // Each image URL for that color
        },
    ],
    sizes: [sizeSchema], // Sizes under each color
});

// 📋 Feature schema (for key details)
const keyFeatureSchema = new mongoose.Schema({
    label: {
        type: String,
        required: true,
    },
    value: {
        type: String,
        required: true,
    },
});

const reviewSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
    createdAt: { type: Date, default: Date.now },
});

// 🧱 Main Product schema
const productSchema = new mongoose.Schema(
    {
        // 🔹 Basic Details
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true,
        },


        // 💰 Pricing
        mrp: {
            type: Number,
            required: true,
        },
        basePrice: {
            type: Number,
            required: true,
        },
        discount: {
            type: Number,
            default: 0, // Calculated in controller
        },

        // 🖼️ General Product Images (main gallery)
        thumbnailImage: {
            type: String,
            required: true,
        },

        // 🎨 Variants (Color, Size, Stock)
        variants: [variantSchema],

        // 🧾 Key Features (Material, Fit, Care, etc.)
        keyFeatures: [keyFeatureSchema],

        // 📖 Detailed Description
        productDescription: {
            type: String,
        },
        reviews: [reviewSchema],
        averageRating: { type: Number, default: 0 },
        isFeatured: { type: Boolean, default: false },
    },
    {
        timestamps: true, // Automatically add createdAt, updatedAt
    }
);

// 🏷️ Model
const Product = mongoose.model("Product", productSchema);

module.exports = Product;
