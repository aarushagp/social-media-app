const profileInfo = document.getElementById("profileInfo");
const userPosts = document.getElementById("userPosts");
const API = "http://localhost:5000/api";

const urlParams = new URLSearchParams(window.location.search);
const profileUserId = urlParams.get("userId");

async function loadUserProfile() {
  try {
    // Fetch user info
    const res = await fetch(`${API}/users/${profileUserId}`);
    const profileUser = await res.json();

    const isMe = profileUserId === user._id;

    profileInfo.innerHTML = `
      <h2>${profileUser.username}</h2>
      <p>${profileUser.bio || ""}</p>
      <p>Followers: ${profileUser.followers.length}</p>
      <p>Following: ${profileUser.following.length}</p>
      ${isMe
        ? '<button onclick="editProfile()">Edit Profile</button>'
        : `<button onclick="toggleFollow('${profileUserId}')">
             ${profileUser.followers.includes(user._id) ? "Unfollow" : "Follow"}
           </button>`}
    `;

    // Fetch user’s posts
    const postRes = await fetch(`${API}/posts/user/${profileUserId}`);
    const posts = await postRes.json();

    userPosts.innerHTML = posts
      .map(
        (p) => `
        <div class="post">
          <p>${p.content}</p>
          <p>❤️ ${p.likes.length}</p>
          <hr>
        </div>`
      )
      .join("");
  } catch (err) {
    console.error("Profile load failed", err);
  }
}

async function toggleFollow(targetId) {
  try {
    await fetch(`${API}/users/follow/${targetId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user._id }),
    });

    loadUserProfile(); // refresh follow state
  } catch (err) {
    console.error("Follow/unfollow failed", err);
  }
}

function editProfile() {
  alert("Editing profile is not implemented yet!");
  // You can build this later with a form and update API
}

loadUserProfile();
