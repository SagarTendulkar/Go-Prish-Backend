const jwt = require("jsonwebtoken");
const User = require("../models/user.js");

const JWT_SECRET = process.env.JWT_SECRET;

const verifyAdmin = async (req, res, next) => {
    try {
        // ✅ 1️⃣ Extract token
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        // ✅ 2️⃣ Verify token
        const decoded = jwt.verify(token, JWT_SECRET);

        // ✅ 3️⃣ Find user
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // ✅ 4️⃣ Check if admin
        if (!user.isAdmin) {
            return res.status(403).json({ message: "Access denied. Admin only." });
        }

        // ✅ 5️⃣ Attach user info and continue
        req.user = user;
        next();
    } catch (error) {
        res.status(500).json({ message: "Invalid or expired token", error });
    }
};

module.exports = verifyAdmin;
