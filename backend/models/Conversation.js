const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema({
  members: {
    type: [mongoose.Schema.Types.ObjectId], // array of user IDs
    ref: "User",
    required: true
  }
}, { timestamps: true }); // adds createdAt, updatedAt

module.exports = mongoose.model("Conversation", ConversationSchema);
