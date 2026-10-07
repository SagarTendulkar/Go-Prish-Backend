const User = require("../models/user.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail.js");

const JWT_SECRET = process.env.JWT_SECRET;

// 📝 Register new user
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser)
            return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hashedPassword });

        // ✅ Create JWT token
        const token = jwt.sign(
            { id: user._id, email: user.email },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(201).json({
            message: "User registered successfully",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
            },
            token,
        });
    } catch (error) {
        res.status(500).json({ message: "Error registering user", error });
    }
};

// 📝 Login user
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid password" });

        const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
            expiresIn: "7d",
        });

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
            },
        });
    } catch (error) {
        res.status(500).json({ message: "Error logging in", error });
    }
};

// ✅ Verify Token Middleware
const verifyToken = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ message: "No token provided" });

        jwt.verify(token, JWT_SECRET, (err, decoded) => {
            if (err) return res.status(403).json({ message: "Invalid token" });
            req.user = decoded;
            next();
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

module.exports = { registerUser, loginUser, verifyToken };

// Forgot Password
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(200).json({
                message: "If this email is registered, a reset link has been sent.",
            });
        }

        if (user.authProvider === "google") {
            return res.status(400).json({
                message: "This account uses Google login. No password to reset.",
            });
        }

        const token = crypto.randomBytes(32).toString("hex");
        user.resetPasswordToken = token;
        user.resetPasswordExpiry = Date.now() + 1000 * 60 * 30; // 30 mins
        await user.save();

        const resetURL = `${process.env.CLIENT_URL}/reset-password/${token}`;

        try {
            await sendEmail({
                to: user.email,
                subject: "Reset Your Tee Trends Password",
                html: `
                <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 24px;">
                    <h2 style="color: #C97A4A;">Tee Trends</h2>
                    <p>Hi ${user.name},</p>
                    <p>You requested a password reset. Click the button below — this link expires in <strong>30 minutes</strong>.</p>
                    <a href="${resetURL}"
                       style="display:inline-block; background:#C97A4A; color:#fff;
                              padding:12px 28px; border-radius:8px; text-decoration:none;
                              font-weight:bold; margin: 20px 0;">
                        Reset Password
                    </a>
                    <p style="color:#999; font-size:12px;">
                        If you didn't request this, you can safely ignore this email.
                    </p>
                </div>
            `,
            });
        } catch (emailError) {
            console.log("❌ Email error details:", emailError.message); // ✅ detailed error
            return res.status(500).json({
                message: "Error sending reset email",
                error: emailError.message,
            });
        }

        res.status(200).json({
            message: "If this email is registered, a reset link has been sent.",
        });
    } catch (error) {
        console.log("❌ General error:", error.message);
        res.status(500).json({ message: "Error sending reset email", error });
    }
};

// 🔑 Reset Password
const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    try {
        // ✅ validate password on backend too
        const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9]).{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                message: "Password must be 8+ chars with at least one uppercase letter and one number",
            });
        }

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpiry: { $gt: Date.now() }, // not expired
        });

        if (!user) {
            return res.status(400).json({
                message: "Reset link is invalid or has expired",
            });
        }

        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = null;
        user.resetPasswordExpiry = null;
        await user.save();

        res.status(200).json({ message: "Password reset successfully. Please login." });
    } catch (error) {
        res.status(500).json({ message: "Error resetting password", error });
    }
};

// 🔒 Change Password (logged in user)
const changePassword = async (req, res) => {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    try {
        // ✅ validate new password
        const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9]).{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            return res.status(400).json({
                message: "Password must be 8+ chars with at least one uppercase letter and one number",
            });
        }

        const user = await User.findById(userId);

        // ✅ block Google users
        if (user.authProvider === "google") {
            return res.status(400).json({
                message: "This account uses Google login. Password cannot be changed here.",
            });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Current password is incorrect" });
        }

        if (currentPassword === newPassword) {
            return res.status(400).json({
                message: "New password must be different from current password",
            });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error changing password", error });
    }
};

module.exports = {
    registerUser,
    loginUser,
    verifyToken,
    forgotPassword,
    resetPassword,
    changePassword,
};