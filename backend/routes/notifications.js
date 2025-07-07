const express = require("express");
const router = express.Router();
const User = require("../models/User");

// ✅ Get all notifications for a user
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .populate("notifications.fromUser", "name email profilePic")
      .populate("notifications.post", "content image");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const sortedNotifications = [...user.notifications].sort(
      (a, b) => b.createdAt - a.createdAt
    );

    res.status(200).json({ notifications: sortedNotifications });
  } catch (err) {
    console.error("❌ Fetch Notifications Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Mark all notifications as read
router.put("/:userId/mark-all-read", async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.notifications.forEach((notif) => {
      notif.read = true;
    });

    await user.save();

    res.status(200).json({ message: "All notifications marked as read" });
  } catch (err) {
    console.error("❌ Mark Read Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
