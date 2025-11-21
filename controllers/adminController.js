// controllers/adminController.js
const Order = require("../models/orderModal");
const Product = require("../models/product");
const Category = require("../models/category");

// 📊 Admin dashboard stats
const getAdminStats = async (req, res) => {
    try {
        const [ordersByStatus, salesByMonth, topCategories] = await Promise.all([
            // 1️⃣ Orders grouped by status
            Order.aggregate([
                { $group: { _id: "$status", count: { $sum: 1 } } },
            ]),

            // 2️⃣ Monthly sales for current year
            Order.aggregate([
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                        totalSales: { $sum: "$totalAmount" },
                    },
                },
                { $sort: { _id: 1 } },
            ]),

            // 3️⃣ Top categories by product count
            Product.aggregate([
                {
                    $group: {
                        _id: "$category",
                        count: { $sum: 1 },
                    },
                },
                {
                    $lookup: {
                        from: "categories",
                        localField: "_id",
                        foreignField: "_id",
                        as: "category",
                    },
                },
                { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
                {
                    $project: {
                        count: 1,
                        categoryName: { $ifNull: ["$category.name", "Unknown Category"] },
                    },
                },
                { $sort: { count: -1 } },
                { $limit: 6 },
            ])
        ]);

        res.json({
            ordersByStatus,
            salesByMonth,
            topCategories,
        });
    } catch (err) {
        console.error("❌ Error fetching admin stats:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

module.exports = { getAdminStats };
