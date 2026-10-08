const express = require("express");
const router = express.Router();
const {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getFilteredProducts,
    getProductsBySlug,
    getFeaturedProducts,
} = require("../controllers/productController");
const { addReview, getReviews } = require("../controllers/reviewController");
const { verifyToken } = require("../controllers/authController.js");


router.get("/by-slug/:slug", getProductsBySlug);

// Routes
router.get("/", getProducts);
router.get("/", getProductsBySlug);
router.get("/featured", getFeaturedProducts);
router.post("/", createProduct);
router.get("/:id", getProductById);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);
router.post("/:id/reviews", verifyToken, addReview);
router.get("/:id/reviews", getReviews);

module.exports = router;
