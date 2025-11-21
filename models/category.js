const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        parentCategory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            default: null,
        },
        slug: {
            type: String,
            unique: true,
            lowercase: true,
        },
        image: {
            type: String,
        },
    },
    { timestamps: true }
);

// ✅ Fix: prevent OverwriteModelError
const Category =
    mongoose.models.Category || mongoose.model("Category", categorySchema);

module.exports = Category;
