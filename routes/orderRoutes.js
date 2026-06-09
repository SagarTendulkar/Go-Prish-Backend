const express = require("express")
const router = express.Router()
const { createOrder, getOrders, updateOrderStatus, getOrdersByUserId } = require("../controllers/ordersController");
const verifyAdmin = require("../middleware/verifyAdmin");
const { verifyToken } = require("../controllers/authController.js");

router.post("/", verifyToken, createOrder);       // Create new order
router.get("/", verifyAdmin, getOrders);          // Get all orders (admin)
router.get("/user/:id", verifyToken, getOrdersByUserId);          // Get all orders by Id 
router.put("/:id", verifyAdmin, updateOrderStatus);

module.exports = router;