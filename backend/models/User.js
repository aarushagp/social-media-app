const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  profilePic: {
    type: String,
    default: "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
  },
  bio: {
    type: String,
    default: ""
  },
  followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],
  following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],
  notifications: [
    {
      type: {
        type: String, // 'like' | 'comment' | 'follow'
        required: true
      },
      fromUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
      },
      post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post"
      },
      message: String,
      createdAt: {
        type: Date,
        default: Date.now
      },
      read: {
        type: Boolean,
        default: false
      }
    }
  ],

  // <-- Added savedPosts here
  savedPosts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post"
    }
  ],  
   
  blockedUsers: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
],


  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("User", userSchema);
