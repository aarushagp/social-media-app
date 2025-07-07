// ✅ Declare user globally once
if (typeof user === "undefined") {
  var user = JSON.parse(localStorage.getItem("user"));
}

// ✅ Redirect to login if not authenticated
const publicPages = ["login.html", "signup.html"];
const currentPage = window.location.pathname.split("/").pop();

if (!user && !publicPages.includes(currentPage)) {
  alert("Please log in first.");
  window.location.href = "login.html";
}
