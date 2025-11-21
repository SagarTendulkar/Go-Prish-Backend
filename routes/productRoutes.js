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

router.get("/by-slug/:slug", getProductsBySlug);

// Routes
router.get("/", getProducts);
router.get("/", getProductsBySlug);
router.get("/featured", getFeaturedProducts);
router.post("/", createProduct);
router.get("/:id", getProductById);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);
router.post("/:id/reviews", addReview);
router.get("/:id/reviews", getReviews);

module.exports = router;
