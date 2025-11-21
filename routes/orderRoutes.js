const express = require("express")
const router = express.Router()
const { createOrder, getOrders, updateOrderStatus, getOrdersByUserId } = require("../controllers/ordersController");
const verifyAdmin = require("../middleware/verifyAdmin");

router.post("/", createOrder);       // Create new order
router.get("/", verifyAdmin, getOrders);          // Get all orders (admin)
router.get("/user/:id", getOrdersByUserId);          // Get all orders by Id 
router.put("/:id", verifyAdmin, updateOrderStatus);

module.exports = router;