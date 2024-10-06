////////// SCROLL TO SECTION BEHAVIOR \\\\\\\\\\
const nav = document.querySelector("nav");
const navLinks = document.querySelectorAll(".nav-link");

navLinks.forEach(link => {
  link.addEventListener("click", function (event) {
    // Prevent default anchor behavior.
    event.preventDefault();

    const sectionId = link.getAttribute("data-section-id");
    const section = document.getElementById(sectionId);

    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    } else {
      // Log error if section is not found.
      console.error(`Section with ID "${sectionId}" not found.`);
    }
  });
});


////////// PAGE REFRESH BEHAVIOR \\\\\\\\\\
const homeLink = document.querySelector(".navbar-brand");
homeLink.addEventListener("click", function () {
  location.reload();
});


////////// THEME TOGGLE BEHAVIOR \\\\\\\\\\
const htmlPage = document.getElementById("html-page");
// const nav = document.querySelector("nav");
const themeToggleButton = document.getElementById("theme-toggle-button");
const themeIcon = themeToggleButton.querySelector("i");
// Get the current theme from localStorage or default to light.
let currentTheme = localStorage.getItem("theme") || "light";

htmlPage.setAttribute("data-bs-theme", currentTheme);

// Update the theme icon based on the current theme.
function updateThemeIcon() {
  if (currentTheme === "light") {
    themeIcon.classList.remove("bi-sun-fill");
    themeIcon.classList.add("bi-moon-stars-fill");
  } else {
    themeIcon.classList.remove("bi-moon-stars-fill");
    themeIcon.classList.add("bi-sun-fill");
    nav.classList.add("dark-mode")
  }
}

// Update icon on initial load.
updateThemeIcon();

themeToggleButton.addEventListener("click", function () {
  // Toggle between light and dark themes.
  if (currentTheme === "light") {
    currentTheme = "dark";
    nav.classList.add("dark-mode")
  } else {
    currentTheme = "light";
    nav.classList.remove("dark-mode")
  }

  // Update theme attribute and store current theme in localStorage.
  htmlPage.setAttribute("data-bs-theme", currentTheme);
  localStorage.setItem("theme", currentTheme);

  // Update icon after theme change.
  updateThemeIcon();
});
