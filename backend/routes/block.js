const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Block a user
router.post('/:userId/block/:targetId', async (req, res) => {
  try {
    const { userId, targetId } = req.params;

    if (userId === targetId) return res.status(400).json({ message: "You can't block yourself." });

    const user = await User.findById(userId);
    if (!user.blockedUsers.includes(targetId)) {
      user.blockedUsers.push(targetId);
      await user.save();
    }

    res.status(200).json({ message: "User blocked successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Unblock a user
router.post('/:userId/unblock/:targetId', async (req, res) => {
  try {
    const { userId, targetId } = req.params;

    const user = await User.findById(userId);
    user.blockedUsers = user.blockedUsers.filter(id => id.toString() !== targetId);
    await user.save();

    res.status(200).json({ message: "User unblocked successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all blocked users
router.get('/:userId/blocked', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate('blockedUsers', 'name profilePic');
    res.status(200).json(user.blockedUsers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
