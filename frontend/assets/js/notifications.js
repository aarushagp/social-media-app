const API_BASE = "http://localhost:5000/api";
const notificationsList = document.getElementById("notificationsList");
const markReadBtn = document.getElementById("markReadBtn");

let user = null;
try {
  user = JSON.parse(localStorage.getItem("user"));
} catch (e) {
  console.warn("⚠️ Failed to parse user from localStorage");
}

// 🔹 Redirect or show message if user is not logged in
if (!user || !user._id) {
  notificationsList.innerHTML = `
    <p>User not logged in. <a href="login.html?redirect=notifications.html">Login here</a></p>
  `;
  markReadBtn.style.display = "none";
} else {
  // 🔹 Load Notifications
  async function loadNotifications() {
    try {
      const res = await fetch(`${API_BASE}/notifications/${user._id}`);
      const data = await res.json();

      if (!data.notifications || data.notifications.length === 0) {
        notificationsList.innerHTML = "<p>No notifications yet.</p>";
        return;
      }

      notificationsList.innerHTML = "";
      data.notifications.forEach((notif) => {
        const div = document.createElement("div");
        div.className = "notification";

        div.innerHTML = `
          <p>
            <strong>${notif.fromUser?.name || "Someone"}</strong>
            ${notif.type === "like" ? "liked" : "commented"} on your post:
            "${notif.post?.content || "a post"}"
          </p>
          <small>${notif.read ? "✅ Read" : "🆕 Unread"}</small>
        `;

        notificationsList.appendChild(div);
      });
    } catch (err) {
      console.error("❌ Failed to load notifications:", err);
      notificationsList.innerHTML = "<p>Failed to load notifications.</p>";
    }
  }

  // 🔹 Mark All As Read
  async function markAllAsRead() {
    try {
      const res = await fetch(`${API_BASE}/notifications/${user._id}/mark-all-read`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" }
      });

      if (res.ok) {
        alert("✅ All notifications marked as read");
        loadNotifications();
      } else {
        alert("⚠️ Failed to mark notifications as read");
      }
    } catch (err) {
      console.error("❌ Error marking notifications as read:", err);
    }
  }

  // 🔹 Bind event and load
  markReadBtn.addEventListener("click", markAllAsRead);
  loadNotifications();
}
