console.log("📦 posts.js loaded");

const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const User = require("../models/User");

// 🟢 Test route to verify router is loaded
router.get("/test", (req, res) => {
  res.send("✅ Posts route is working!");
});

// ✅ Create a Post
router.post("/", async (req, res) => {
  const { userId, content, image } = req.body;

  if (!userId || !content) {
    return res.status(400).json({ message: "userId and content are required" });
  }

  try {
    const newPost = new Post({
      user: userId,
      content,
      image: image || ""
    });

    const savedPost = await newPost.save();
    res.status(201).json({ message: "Post created", post: savedPost });
  } catch (err) {
    console.error("❌ Post creation error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Like or Unlike a Post
router.post("/:id/like", async (req, res) => {
  const postId = req.params.id;
  const { userId } = req.body;

  try {
    const post = await Post.findById(postId);
    const user = await User.findById(userId);

    if (!post || !user) {
      return res.status(404).json({ message: "Post or User not found" });
    }

    const alreadyLiked = post.likes.includes(userId);

    if (alreadyLiked) {
      post.likes.pull(userId);
    } else {
      post.likes.push(userId);

      // 🔔 Notification on Like
      if (post.user.toString() !== userId) {
        const postOwner = await User.findById(post.user);
        postOwner.notifications.push({
          type: "like",
          fromUser: userId,
          post: post._id,
          message: `${user.name} liked your post.`,
          read: false
        });
        await postOwner.save();
      }
    }

    await post.save();
    res.status(200).json({ message: alreadyLiked ? "Post unliked" : "Post liked" });
  } catch (err) {
    console.error("❌ Like error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Add a Comment to a Post
router.post("/:id/comment", async (req, res) => {
  const postId = req.params.id;
  const { userId, text } = req.body;

  if (!userId || !text) {
    return res.status(400).json({ message: "userId and text are required" });
  }

  try {
    const post = await Post.findById(postId);
    const user = await User.findById(userId);

    if (!post || !user) {
      return res.status(404).json({ message: "Post or User not found" });
    }

    const comment = {
      user: userId,
      text,
      createdAt: new Date()
    };

    post.comments.push(comment);
    await post.save();

    // 🔔 Notification on Comment
    if (post.user.toString() !== userId) {
      const postOwner = await User.findById(post.user);
      postOwner.notifications.push({
        type: "comment",
        fromUser: userId,
        post: post._id,
        message: `${user.name} commented: ${text}`,
        read: false
      });
      await postOwner.save();
    }

    res.status(201).json({ message: "Comment added", comment });
  } catch (err) {
    console.error("❌ Comment error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Get All Posts
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "name email")
      .populate("comments.user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ posts });
  } catch (err) {
    console.error("❌ Fetch Posts Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Delete a Post
router.delete("/:id", async (req, res) => {
  const postId = req.params.id;
  const { userId } = req.body;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.user.toString() !== userId) {
      return res.status(403).json({ message: "You are not allowed to delete this post" });
    }

    await Post.findByIdAndDelete(postId);
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (err) {
    console.error("❌ Delete Post Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Edit a Post
router.put("/:id", async (req, res) => {
  const postId = req.params.id;
  const { userId, content, image } = req.body;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.user.toString() !== userId) {
      return res.status(403).json({ message: "You are not allowed to edit this post" });
    }

    if (content !== undefined) post.content = content;
    if (image !== undefined) post.image = image;

    const updatedPost = await post.save();
    res.status(200).json({ message: "Post updated", post: updatedPost });
  } catch (err) {
    console.error("❌ Edit Post Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Get Posts by a Specific User
router.get("/user/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    const userPosts = await Post.find({ user: userId })
      .populate("user", "name email")
      .populate("comments.user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ posts: userPosts });
  } catch (err) {
    console.error("❌ Fetch User Posts Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Get feed posts (from followed users)
router.get("/feed/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    const currentUser = await User.findById(userId);

    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const followingIds = currentUser.following;

    const posts = await Post.find({
      user: { $in: [...followingIds, userId] }
    })
      .populate("user", "name email")
      .populate("comments.user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ posts });
  } catch (err) {
    console.error("❌ Feed Fetch Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// 🔍 Search posts by content (text-based)
router.get("/search", async (req, res) => {
  const query = req.query.q;

  if (!query) {
    return res.status(400).json({ message: "Search query required" });
  }

  try {
    const posts = await Post.find({ $text: { $search: query } })
      .populate("user", "name email")
      .populate("comments.user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (err) {
    console.error("❌ Post Search Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
