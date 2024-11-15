const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
    userId: { type: String, required: true }, // Firebase UID as a string
    message: { type: String, required: true },
    status: { type: String, default: "unread" },
    application:Object,
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Notification", NotificationSchema);
