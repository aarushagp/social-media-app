const API_BASE = "http://localhost:5000/api";
const postContainer = document.getElementById("postContainer");
const postForm = document.getElementById("createPostForm");
const postContent = document.getElementById("postContent");
const postImage = document.getElementById("postImage");

// ✅ 'user' is already declared in main.js – don't redeclare it again here

if (!user || !user._id) {
  postContainer.innerHTML = `<p>Please <a href="login.html?redirect=index.html">login</a> to see your feed.</p>`;
  postForm.style.display = "none";
} else {
  loadFeed();
}

async function loadFeed() {
  try {
    const res = await fetch(`${API_BASE}/posts/feed/${user._id}`);
    const data = await res.json();

    if (!data.posts || data.posts.length === 0) {
      postContainer.innerHTML = "<p>No posts yet.</p>";
      return;
    }

    postContainer.innerHTML = "";
    data.posts.forEach(post => {
      const div = document.createElement("div");
      div.className = "post";
      div.innerHTML = `
        <h3>${post.user.name}</h3>
        <p>${post.content}</p>
        ${post.image ? `<img src="${post.image}" alt="Post Image">` : ""}
        <small>👍 ${post.likes.length} Likes</small>
      `;
      postContainer.appendChild(div);
    });
  } catch (err) {
    console.error("❌ Error loading feed:", err);
    postContainer.innerHTML = "<p>Failed to load posts.</p>";
  }
}

postForm.addEventListener("submit", async function (e) {
  e.preventDefault();
  const content = postContent.value.trim();
  const image = postImage.value.trim();

  if (!content) return alert("Post content cannot be empty.");

  try {
    const res = await fetch(`${API_BASE}/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user._id,
        content,
        image
      })
    });

    const data = await res.json();
    if (res.ok) {
      alert("✅ Post created!");
      postContent.value = "";
      postImage.value = "";
      loadFeed();
    } else {
      alert(data.message || "Failed to create post");
    }
  } catch (err) {
    console.error("❌ Error creating post:", err);
    alert("Something went wrong");
  }
});

function logout() {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  window.location.href = "login.html";
}
