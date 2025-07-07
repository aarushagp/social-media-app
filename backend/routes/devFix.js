const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Post = require("../models/Post");

// 🛠 Fix users without a name
router.get("/fix-users", async (req, res) => {
  try {
    const result = await User.updateMany(
      { name: { $exists: false } },
      { $set: { name: "Unnamed User" } }
    );
    res.json({ message: "Fixed users", result });
  } catch (err) {
    console.error("❌ Fix error:", err.message);
    res.status(500).json({ message: "Fix failed" });
  }
});

// 🛠 Manually add a notification (for testing)
router.post("/add-notification", async (req, res) => {
  const { toUserId, fromUserId, postId, type, message } = req.body;

  try {
    const toUser = await User.findById(toUserId);
    if (!toUser) return res.status(404).json({ message: "Target user not found" });

    const fromUser = await User.findById(fromUserId);
    if (!fromUser) return res.status(404).json({ message: "Sender user not found" });

    let post = null;
    if (postId) {
      post = await Post.findById(postId);
      if (!post) return res.status(404).json({ message: "Post not found" });
    }

    // Add the notification
    toUser.notifications.push({
      type: type || "like",
      fromUser: fromUserId,
      post: post?._id || undefined,
      message: message || `${fromUser.name} interacted with your post`
    });

    await toUser.save();

    res.status(201).json({ message: "✅ Notification added manually" });
  } catch (err) {
    console.error("❌ Notification insert error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
