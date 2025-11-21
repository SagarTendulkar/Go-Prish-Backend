const Product = require("../models/product");

const addReview = async (req, res) => {
    const { id } = req.params; // product id
    const { userId, name, rating, comment } = req.body;

    try {
        const product = await Product.findById(id);
        if (!product) return res.status(404).json({ message: "Product not found" });

        // prevent duplicate reviews by same user
        const alreadyReviewed = product.reviews.find(
            (rev) => rev.userId.toString() === userId
        );
        if (alreadyReviewed)
            return res.status(400).json({ message: "You already reviewed this product" });

        const review = { userId, name, rating: Number(rating), comment, createdAt: new Date() };
        product.reviews.push(review);

        // update average rating
        product.averageRating =
            product.reviews.reduce((acc, r) => acc + r.rating, 0) /
            product.reviews.length;

        await product.save();
        res.status(201).json({ message: "Review added successfully", review });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getReviews = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });

        // ✅ Sort reviews by newest first (based on createdAt)
        const sortedReviews = product.reviews.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        res.json(sortedReviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { addReview, getReviews };
