const express = require("express")
const router = express.Router()
const { createOrder, getOrders, updateOrderStatus, getOrdersByUserId } = require("../controllers/ordersController");
const verifyAdmin = require("../middleware/verifyAdmin");
const { verifyToken } = require("../controllers/authController.js");
const Order = require("../models/orderModal.js");
const generateInvoicePDF = require("../utils/generateInvoicePDF.js");

router.post("/", verifyToken, createOrder);       // Create new order
router.get("/", verifyAdmin, getOrders);          // Get all orders (admin)
router.get("/user/:id", verifyToken, getOrdersByUserId);          // Get all orders by Id 
router.put("/:id", verifyAdmin, updateOrderStatus);

// ✅ Invoice download route
router.get("/:id/invoice", verifyToken, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // ✅ make sure user can only download their own invoice
        if (order.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized" });
        }

        generateInvoicePDF(order, res);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


module.exports = router;