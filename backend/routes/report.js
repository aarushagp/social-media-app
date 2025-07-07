const express = require("express");
const router = express.Router();
const Report = require("../models/Report");

// Report a user
router.post("/user", async (req, res) => {
  try {
    const { reportedBy, reportedUser, reason } = req.body;

    if (!reportedBy || !reportedUser || !reason) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const report = new Report({ reportedBy, reportedUser, reason });
    await report.save();

    res.status(201).json({ message: "User reported successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Report a post
router.post("/post", async (req, res) => {
  try {
    const { reportedBy, reportedPost, reason } = req.body;

    if (!reportedBy || !reportedPost || !reason) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const report = new Report({ reportedBy, reportedPost, reason });
    await report.save();

    res.status(201).json({ message: "Post reported successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
