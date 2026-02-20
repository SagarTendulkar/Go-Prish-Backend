const express = require("express");
const router = express.Router();
const razorpay = require("../utils/razorpay");
const { verifyPaymentAndCreateOrder } = require("../controllers/paymentController");

router.post("/create-order", async (req, res) => {
    try {
        const { amount } = req.body;

        const options = {
            amount: amount * 100, // rupees to paise
            currency: "INR",
            receipt: "receipt_" + Date.now(),
        };

        const order = await razorpay.orders.create(options);

        res.json(order);
    } catch (err) {
        console.log(err);
        res.status(500).send("Razorpay order failed");
    }
});

router.post("/verify", verifyPaymentAndCreateOrder)

module.exports = router;
