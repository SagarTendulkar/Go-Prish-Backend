const crypto = require("crypto");
const Order = require("../models/orderModal");
const Cart = require("../models/cart");
const Product = require("../models/product");

exports.verifyPaymentAndCreateOrder = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            orderData,
        } = req.body;

        // ✅ VALIDATION
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Missing payment details",
            });
        }

        if (!orderData || !orderData.cart || !orderData.cart.length) {
            return res.status(400).json({
                success: false,
                message: "Invalid order data",
            });
        }

        // 🔐 SIGNATURE VERIFY
        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Payment verification failed",
            });
        }

        // 📦 CREATE ORDER
        const newOrder = new Order({
            ...orderData,
            paymentId: razorpay_payment_id,
            paymentStatus: "Paid",
            orderStatus: "Placed",
        });

        // 🛒 STOCK UPDATE
        for (const item of orderData.cart) {
            const product = await Product.findById(item.productId);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Product not found: ${item.name}`,
                });
            }

            let stockAvailable = false;

            for (const variant of product.variants) {
                if (variant.colorCode === item.color) {
                    for (const sizeObj of variant.sizes) {
                        if (sizeObj.size === item.size) {
                            if (sizeObj.countInStock >= item.qty) {
                                sizeObj.countInStock -= item.qty;
                                stockAvailable = true;
                            }
                        }
                    }
                }
            }

            if (!stockAvailable) {
                return res.status(400).json({
                    success: false,
                    message: `${item.name} (${item.size}) is out of stock`,
                });
            }

            await product.save({ validateBeforeSave: false });
        }

        // 💾 SAVE ORDER
        await newOrder.save();

        // 🧹 CLEAR CART
        await Cart.findOneAndUpdate(
            { userId: orderData.userId },
            { $set: { products: [] } }
        );

        return res.status(200).json({
            success: true,
            message: "Payment verified and order created",
            order: newOrder,
        });

    } catch (error) {
        console.error("🔥 VERIFY ERROR:", error.message);
        console.error(error.stack);

        return res.status(500).json({
            success: false,
            message: error.message || "Server error",
        });
    }
};