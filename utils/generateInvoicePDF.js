const PDFDocument = require("pdfkit");

const generateInvoicePDF = (order, res) => {
    const doc = new PDFDocument({ margin: 50 });

    // ── Pipe to response ──────────────────────────────────
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
        "Content-Disposition",
        `attachment; filename=invoice-${order._id.toString().slice(-6).toUpperCase()}.pdf`
    );
    doc.pipe(res);

    // ── Colors ────────────────────────────────────────────
    const brandColor = "#C97A4A";
    const darkColor = "#2c1810";
    const grayColor = "#888888";

    // ── Header ────────────────────────────────────────────
    doc.rect(0, 0, doc.page.width, 80).fill(brandColor);
    doc.fillColor("#ffffff")
        .fontSize(24)
        .font("Helvetica-Bold")
        .text("Tee Trends", 50, 25);
    doc.fontSize(10)
        .font("Helvetica")
        .text("Your Style, Delivered.", 50, 53);

    // ── Invoice title ─────────────────────────────────────
    doc.moveDown(2);
    doc.fillColor(darkColor)
        .fontSize(18)
        .font("Helvetica-Bold")
        .text("INVOICE", 50, 100);

    // ── Order info ────────────────────────────────────────
    const orderDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
        day: "numeric", month: "long", year: "numeric"
    });

    doc.fontSize(10).font("Helvetica").fillColor(grayColor);
    doc.text(`Order ID   : #${order._id.toString().slice(-6).toUpperCase()}`, 50, 130);
    doc.text(`Date       : ${orderDate}`, 50, 148);
    doc.text(`Payment    : ${order.paymentStatus === "Paid" ? "Paid via Razorpay" : "Cash on Delivery"}`, 50, 166);
    doc.text(`Status     : ${order.status || "Processing"}`, 50, 184);

    // ── Divider ───────────────────────────────────────────
    doc.moveTo(50, 205).lineTo(545, 205).strokeColor("#f0e6dc").lineWidth(1).stroke();

    // ── Bill to ───────────────────────────────────────────
    doc.fillColor(darkColor).fontSize(11).font("Helvetica-Bold").text("Bill To", 50, 220);
    doc.fontSize(10).font("Helvetica").fillColor(grayColor);
    doc.text(order.name, 50, 238);
    doc.text(order.email, 50, 254);
    doc.text(order.phone, 50, 270);
    doc.text(order.address, 50, 286, { width: 250 });

    // ── Items table header ────────────────────────────────
    const tableTop = 340;
    doc.rect(50, tableTop, 495, 24).fill("#f9f0e8");

    doc.fillColor(grayColor).fontSize(9).font("Helvetica-Bold");
    doc.text("ITEM", 60, tableTop + 8);
    doc.text("SIZE", 300, tableTop + 8);
    doc.text("QTY", 370, tableTop + 8);
    doc.text("PRICE", 420, tableTop + 8);
    doc.text("TOTAL", 480, tableTop + 8);

    // ── Items ─────────────────────────────────────────────
    let y = tableTop + 34;
    order.cart.forEach((item, index) => {
        // alternate row bg
        if (index % 2 === 0) {
            doc.rect(50, y - 6, 495, 24).fill("#fffaf6");
        }

        doc.fillColor(darkColor).fontSize(9).font("Helvetica");
        doc.text(item.name, 60, y, { width: 230 });
        doc.text(item.size || "-", 300, y);
        doc.text(`x${item.qty}`, 370, y);
        doc.text(`Rs.${item.price || item.basePrice}`, 420, y);
        doc.text(`Rs.${(item.price || item.basePrice) * item.qty}`, 480, y);

        y += 26;
    });

    // ── Divider ───────────────────────────────────────────
    doc.moveTo(50, y + 6).lineTo(545, y + 6).strokeColor("#f0e6dc").lineWidth(1).stroke();

    // ── Totals ────────────────────────────────────────────
    const shipping = order.totalAmount - order.cart.reduce(
        (sum, item) => sum + (item.price || item.basePrice) * item.qty, 0
    );

    y += 20;
    doc.fillColor(grayColor).fontSize(10).font("Helvetica");
    doc.text("Subtotal:", 380, y);
    doc.fillColor(darkColor).text(`Rs.${order.totalAmount - (shipping > 0 ? shipping : 0)}`, 480, y);

    y += 18;
    doc.fillColor(grayColor).text("Shipping:", 380, y);
    doc.fillColor(darkColor).text(shipping > 0 ? `Rs.${shipping}` : "Free", 480, y);

    y += 18;
    doc.rect(370, y - 4, 175, 26).fill(brandColor);
    doc.fillColor("#ffffff").fontSize(11).font("Helvetica-Bold");
    doc.text("TOTAL:", 380, y + 4);
    doc.text(`Rs.${order.totalAmount}`, 460, y + 4);

    // ── Footer ────────────────────────────────────────────
    doc.fillColor(grayColor)
        .fontSize(9)
        .font("Helvetica")
        .text(
            "Thank you for shopping with Tee Trends! For any queries contact us at support@teetrends.com",
            50, 720,
            { align: "center", width: 495 }
        );

    doc.end();
};

module.exports = generateInvoicePDF;