const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Route imports
const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/posts");
const userRoutes = require("./routes/users");
const devFix = require("./routes/devFix");
const saveRoutes = require("./routes/save");
const blockRoutes = require("./routes/block");
const reportRoutes = require("./routes/report");
const chatRoutes = require("./routes/message");
// ❌ DO NOT include `notifications.js` if routes are inside users.js
//const notificationRoutes = require("./routes/notifications");
//const devNotifyRoute = require("./routes/devNotify");


// ✅ Register API routes
console.log("🧩 Registering routes...");
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/users", userRoutes); // includes /:id/notifications
app.use("/api/dev", devFix);
app.use("/api/save", saveRoutes);
app.use("/api/block", blockRoutes);
app.use("/api/report", reportRoutes);
app.use("/api/chat", chatRoutes);
// ❌ REMOVE this line
//app.use("/api/notifications", notificationRoutes);
//app.use("/api/dev/notify", devNotifyRoute);

// ✅ Root health check
app.get("/", (req, res) => {
  res.send("🌐 Server is up and running!");
});

// ✅ Connect to MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected successfully");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err);
  });
