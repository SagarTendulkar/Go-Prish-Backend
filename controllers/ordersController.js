// controllers/orderController.js
const Product = require("../models/product")
const Order = require("../models/orderModal");
const Category = require("../models/category");

const createOrder = async (req, res) => {
    const { userId, name, email, phone, address, cart, totalAmount } = req.body;

    try {
        // 1️⃣ Create and save order
        const order = new Order({ userId, name, email, phone, address, cart, totalAmount });
        const savedOrder = await order.save();

        // 2️⃣ Update product stock
        for (const item of cart) {
            const product = await Product.findById(item.productId);
            if (!product) continue;


            product.variants.forEach((variant) => {
                if (variant.colorCode === item.color) { // 👈 make sure to match by colorCode
                    variant.sizes.forEach((sizeObj) => {
                        if (sizeObj.size === item.size) {
                            sizeObj.countInStock = Math.max(0, sizeObj.countInStock - item.qty);
                        }
                    });
                }
            });

            await product.save();
        }

        res.status(201).json({
            message: "Order placed successfully & stock updated",
            order: savedOrder,
        });
    } catch (error) {
        console.error("❌ Error creating order:", error);
        res.status(500).json({ message: error.message });
    }
};



const getOrdersByUserId = async (req, res) => {
    const { id } = req.params;
    try {
        const orders = await Order.find({ userId: id }).sort({ createdAt: -1 });
        if (!orders.length)
            return res.status(404).json({ message: "No orders found for this user" });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getOrders = async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 }); // newest first
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 🟢 Update Order Status

const updateOrderStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const order = await Order.findByIdAndUpdate(
            id,
            { status },
            { new: true } // return updated doc
        );

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin Dashboard
const getAdminStats = async (req, res) => {
    try {
        // 1️⃣ Orders by status
        const ordersByStatus = await Order.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } },
        ]);

        // 2️⃣ Monthly sales (last 6 months)
        const salesByMonth = await Order.aggregate([
            {
                $group: {
                    _id: { $substr: ["$createdAt", 0, 7] }, // YYYY-MM
                    totalSales: { $sum: "$totalAmount" },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        // 3️⃣ Top categories (by product count)
        const topCategories = await Product.aggregate([
            { $group: { _id: "$category", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
        ]);

        // Populate category names
        const populatedCategories = await Category.populate(topCategories, {
            path: "_id",
            select: "name",
        });

        res.json({
            ordersByStatus,
            salesByMonth,
            topCategories: populatedCategories,
        });
    } catch (err) {
        console.error("❌ Error fetching admin stats:", err);
        res.status(500).json({ message: "Error fetching admin stats" });
    }
};

module.exports = {
    createOrder,
    getOrders,
    getOrdersByUserId,
    updateOrderStatus,
    getAdminStats,
};
