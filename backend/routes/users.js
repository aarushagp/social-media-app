const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Post = require("../models/Post");

// ✅ Follow or Unfollow a User
router.post("/:id/follow", async (req, res) => {
  const targetUserId = req.params.id;
  const { currentUserId } = req.body;

  if (currentUserId === targetUserId) {
    return res.status(400).json({ message: "You can't follow yourself" });
  }

  try {
    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser || !currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const isFollowing = targetUser.followers.includes(currentUserId);

    if (isFollowing) {
      targetUser.followers.pull(currentUserId);
      currentUser.following.pull(targetUserId);
      await targetUser.save();
      await currentUser.save();
      return res.status(200).json({ message: "User unfollowed" });
    } else {
      targetUser.followers.push(currentUserId);
      currentUser.following.push(targetUserId);
      await targetUser.save();
      await currentUser.save();
      return res.status(200).json({ message: "User followed" });
    }
  } catch (err) {
    console.error("❌ Follow Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Get followers
router.get("/:id/followers", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("followers", "name email");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ followers: user.followers });
  } catch (err) {
    console.error("❌ Followers Fetch Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Get following
router.get("/:id/following", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("following", "name email");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ following: user.following });
  } catch (err) {
    console.error("❌ Following Fetch Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ User Profile Info
router.get("/:id/profile", async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const postCount = await Post.countDocuments({ user: userId });

    res.status(200).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        profilePic: user.profilePic,
        followers: user.followers.length,
        following: user.following.length,
        postCount
      }
    });
  } catch (err) {
    console.error("❌ Profile Fetch Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// 🔍 Search users
router.get("/search", async (req, res) => {
  const query = req.query.q;

  if (!query || query.trim() === "") {
    return res.status(400).json({ message: "Search query is required" });
  }

  try {
    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } }
      ]
    }).select("name email profilePic");

    res.status(200).json({ users });
  } catch (err) {
    console.error("❌ User Search Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Notifications - Get all
router.get("/:id/notifications", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("notifications.fromUser", "name");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const notifications = user.notifications.reverse(); // latest first
    res.status(200).json({ notifications });
  } catch (err) {
    console.error("❌ Notification Fetch Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Notifications - Mark all as read
router.put("/:id/notifications/mark-all-read", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.notifications.forEach((n) => {
      n.read = true;
    });

    await user.save();
    res.status(200).json({ message: "All notifications marked as read" });
  } catch (err) {
    console.error("❌ Notification Mark Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
