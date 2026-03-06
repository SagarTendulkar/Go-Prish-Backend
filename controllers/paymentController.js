const crypto = require("crypto");
const Order = require("../models/orderModal"); // your order model
const Cart = require("../models/cart")
const Product = require("../models/product")

exports.verifyPaymentAndCreateOrder = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            orderData,
        } = req.body;

        if (req.user.email === "demo@goprish.com") {
            return res.status(200).json({
                success: true,
                demo: true,
                message: "Demo mode: Order placement disabled."
            });
        }

        // STEP 1: generate expected signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest("hex");

        // STEP 2: compare signatures
        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Payment verification failed",
            });
        }

        // STEP 3: payment verified → create order
        const newOrder = new Order({
            ...orderData,
            paymentId: razorpay_payment_id,
            paymentStatus: "Paid",
            orderStatus: "Placed",
        });

        // Check and Update stock
        for (const item of orderData.cart) {
            const product = await Product.findById(item.productId)
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Product not found: ${item.name}`,
                });
            }

            let stockAvailable = false;

            product.variants.forEach((variant) => {
                if (variant.colorCode === item.color) {
                    variant.sizes.forEach((sizeObj) => {
                        if (sizeObj.size === item.size) {

                            if (sizeObj.countInStock >= item.qty) {
                                sizeObj.countInStock -= item.qty;
                                stockAvailable = true;
                            }
                        }
                    });
                }
            });

            if (!stockAvailable) {
                return res.status(400).json({
                    success: false,
                    message: `${item.name} (${item.size}) is out of stock`,
                });
            }
            await product.save();
        }

        await newOrder.save();

        // clear user cart 
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
        console.error("VERIFY ERROR:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
