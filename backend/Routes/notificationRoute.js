const express = require("express");
const router = express.Router();
const Notification = require("../Model/Notification");

router.get("/:firebaseUid", async (req, res) => {
    const { firebaseUid } = req.params;
    try {
        const notifications = await Notification.find({ userId: firebaseUid }).sort({ createdAt: -1 });
        res.status(200).json(notifications);
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
