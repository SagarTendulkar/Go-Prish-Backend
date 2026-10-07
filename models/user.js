const mongoose = require("mongoose")

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: false }, // ✅ false — Google users have no password
        isAdmin: { type: Boolean, default: false },
        authProvider: { type: String, default: "local" }, // ✅ "local" or "google"
        resetPasswordToken: { type: String, default: null },
        resetPasswordExpiry: { type: Date, default: null },
    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema)
module.exports = User;