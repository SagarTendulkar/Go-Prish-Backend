const sendEmail = require("./sendEmail");

const sendOrderConfirmationEmail = async ({ order, name, email, phone, address, cart, totalAmount, paymentMethod = "Razorpay" }) => {
    console.log("cart", cart);
    const itemsHTML = cart.map((item) => `
        <tr>
            <td style="padding:10px; border-bottom:1px solid #f0e6dc;">
                <p style="margin:0; font-weight:600; color:#2c1810;">${item.name}</p>
                <p style="margin:4px 0 0; font-size:12px; color:#888;">
                    Size: ${item.size} &nbsp;|&nbsp; Color: ${item.colorName}
                </p>
            </td>
            <td style="padding:10px; border-bottom:1px solid #f0e6dc; text-align:center; color:#555;">
                x${item.qty}
            </td>
            <td style="padding:10px; border-bottom:1px solid #f0e6dc; text-align:right; font-weight:600; color:#2c1810;">
                ₹${(item.price || item.basePrice) * item.qty}
            </td>
        </tr>
    `).join("");

    await sendEmail({
        to: email,
        subject: `Order Confirmed! 🎉 #${order._id.toString().slice(-6).toUpperCase()}`,
        html: `
            <div style="font-family:Arial,sans-serif; max-width:560px; margin:auto; background:#fffaf6; border-radius:16px; overflow:hidden; border:1px solid #f0e6dc;">
                <div style="background:#C97A4A; padding:28px 32px; text-align:center;">
                    <h1 style="color:white; margin:0;">Tee Trends</h1>
                    <p style="color:rgba(255,255,255,0.85); margin:6px 0 0;">Your order is confirmed!</p>
                </div>
                <div style="padding:28px 32px;">
                    <p style="color:#2c1810; font-size:16px;">
                        Hi <strong>${name}</strong>, thank you for your order! 🛍
                    </p>
                    <p style="color:#666; font-size:14px;">
                        Order ID: <strong>#${order._id.toString().slice(-6).toUpperCase()}</strong>
                    </p>
                    <p style="color:#666; font-size:14px;">
                        Payment: <strong style="color:green;">✓ ${paymentMethod}</strong>
                    </p>
                    <table style="width:100%; border-collapse:collapse; margin-top:20px;">
                        <thead>
                            <tr style="background:#f9f0e8;">
                                <th style="padding:10px; text-align:left; color:#888; font-size:12px;">ITEM</th>
                                <th style="padding:10px; text-align:center; color:#888; font-size:12px;">QTY</th>
                                <th style="padding:10px; text-align:right; color:#888; font-size:12px;">PRICE</th>
                            </tr>
                        </thead>
                        <tbody>${itemsHTML}</tbody>
                    </table>
                    <div style="margin-top:20px; padding:16px; background:#f9f0e8; border-radius:10px; text-align:right;">
                        <p style="margin:0; font-size:18px; font-weight:bold; color:#C97A4A;">
                            Total: ₹${totalAmount}
                        </p>
                    </div>
                    <div style="margin-top:20px; padding:16px; border:1px solid #f0e6dc; border-radius:10px;">
                        <p style="margin:0 0 6px; font-weight:600; color:#2c1810;">📦 Delivery Address</p>
                        <p style="margin:0; color:#666; font-size:14px;">${address}</p>
                        <p style="margin:4px 0 0; color:#666; font-size:14px;">📞 ${phone}</p>
                    </div>
                    <p style="margin-top:24px; color:#666; font-size:13px; text-align:center;">
                        Thank you for shopping with Tee Trends! 💛
                    </p>
                </div>
                <div style="background:#f9f0e8; padding:16px; text-align:center;">
                    <p style="margin:0; color:#aaa; font-size:12px;">© 2025 Tee Trends</p>
                </div>
            </div>
        `,
    });
};

module.exports = sendOrderConfirmationEmail;