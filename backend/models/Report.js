const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  reportedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  reportedPost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post"
  },
  reason: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Report", reportSchema);
