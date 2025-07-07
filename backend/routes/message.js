const router = require("express").Router();
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

// 🟢 1. Start a new conversation
router.post("/conversations", async (req, res) => {
  const newConversation = new Conversation({
    members: [req.body.senderId, req.body.receiverId],
  });

  try {
    const saved = await newConversation.save();
    res.status(200).json(saved);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 🟢 2. Get all conversations of a user
router.get("/conversations/:userId", async (req, res) => {
  try {
    const conversations = await Conversation.find({
      members: { $in: [req.params.userId] },
    });
    res.status(200).json(conversations);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 🟢 3. Send a new message
router.post("/messages", async (req, res) => {
  const newMessage = new Message(req.body);

  try {
    const saved = await newMessage.save();
    res.status(200).json(saved);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 🟢 4. Get all messages in a conversation
router.get("/messages/:conversationId", async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
