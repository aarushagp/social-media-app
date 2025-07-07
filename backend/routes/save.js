const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post'); // ✅ Needed for populating savedPosts

// Save a post
router.post('/:userId/save/:postId', async (req, res) => {
  try {
    const { userId, postId } = req.params;

    const user = await User.findById(userId);
    if (!user.savedPosts.includes(postId)) {
      user.savedPosts.push(postId);
      await user.save();
    }

    res.status(200).json({ message: 'Post saved successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Unsave a post
router.post('/:userId/unsave/:postId', async (req, res) => {
  try {
    const { userId, postId } = req.params;

    const user = await User.findById(userId);
    user.savedPosts = user.savedPosts.filter(id => id.toString() !== postId);
    await user.save();

    res.status(200).json({ message: 'Post unsaved successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Get all saved posts of a user
router.get('/:userId/savedPosts', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).populate({
      path: 'savedPosts',
      populate: {
        path: 'user', // to get post author info
        select: 'name profilePic'
      }
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json(user.savedPosts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
