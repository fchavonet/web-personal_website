////////// SCROLL TO SECTION BEHAVIOR \\\\\\\\\\
const nav = document.querySelector("nav");
const navLinks = document.querySelectorAll(".nav-link");

navLinks.forEach(link => {
  link.addEventListener("click", function (event) {
    // Prevent the default button behavior.
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


////////// MOVE TO TOP BUTTON BEHAVIOR \\\\\\\\\\
const moveToTopButton = document.getElementById("move-to-top-button");

window.addEventListener("scroll", function () {
  // Get the current scroll position.
  const scrollPosition = window.scrollY || document.documentElement.scrollTop;

  // Show the button if the user has scrolled more than 250 pixels.
  if (scrollPosition > 250) {
    moveToTopButton.classList.add("show");
  } else {
    moveToTopButton.classList.remove("show");
  }
});

moveToTopButton.addEventListener("click", function (event) {
  // Prevent the default button behavior.
  event.preventDefault();

  window.scrollTo({ top: 0, behavior: "smooth" });
});


////////// PAGE REFRESH BEHAVIOR \\\\\\\\\\
const homeLink = document.querySelector(".navbar-brand");
homeLink.addEventListener("click", function () {
  location.reload();
});


////////// THEME TOGGLE BEHAVIOR \\\\\\\\\\
const htmlPage = document.getElementById("html-page");
// const nav = document.querySelector("nav");
const footer = document.querySelector("footer");

const containersBackground = document.querySelectorAll(".container-background");

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
    nav.classList.add("dark-mode");
    footer.classList.add("dark-mode");

    containersBackground.forEach(function (container) {
      container.classList.add("dark-mode");
    });
  }
}

// Update icon on initial load.
updateThemeIcon();

themeToggleButton.addEventListener("click", function () {
  // Toggle between light and dark themes.
  if (currentTheme === "light") {
    currentTheme = "dark";
    nav.classList.add("dark-mode");
    footer.classList.add("dark-mode");

    containersBackground.forEach(function (container) {
      container.classList.add("dark-mode");
    });
  } else {
    currentTheme = "light";
    nav.classList.remove("dark-mode");
    footer.classList.remove("dark-mode");

    containersBackground.forEach(function (container) {
      container.classList.remove("dark-mode");
    });
  }

  // Update theme attribute and store current theme in localStorage.
  htmlPage.setAttribute("data-bs-theme", currentTheme);
  localStorage.setItem("theme", currentTheme);

  // Update icon after theme change.
  updateThemeIcon();
});


////////// SKILLS CAROUSEL BEHAVIOR \\\\\\\\\\
window.onload = function () {
  // Selects the container of the skills carousel icons.
  const skillsCarouselIconsContainer = document.getElementById("skills-carousel-icons-container");

  // Clones the icons container and appends it for continuous scrolling.
  const iconsContainerClone = skillsCarouselIconsContainer.cloneNode(true);
  skillsCarouselIconsContainer.parentNode.appendChild(iconsContainerClone);

  // Gets the total width of the skills carousel icons container
  const iconsContainerWidth = skillsCarouselIconsContainer.scrollWidth;

  let currentPosition = 0;
  let scrolling = true;

  function scrollCarousel() {
    if (scrolling) {
      currentPosition -= 1;
    }

    // Resets position if the container is fully scrolled.
    if (Math.abs(currentPosition) >= iconsContainerWidth) {
      currentPosition = 0;
    }

    skillsCarouselIconsContainer.style.transform = "translateX(" + currentPosition + "px)";
    iconsContainerClone.style.transform = "translateX(" + (currentPosition + iconsContainerWidth) + "px)";

    // Continues the animation on the next frame.
    requestAnimationFrame(scrollCarousel);
  }

  scrollCarousel();

  // Stop carousel scrolling on mouse over.
  function stopScrolling() {
    scrolling = false;
  }
  skillsCarouselIconsContainer.addEventListener("mouseover", stopScrolling);
  iconsContainerClone.addEventListener("mouseover", stopScrolling);

  // Restart carousel scrolling on mouse out.
  function startScrolling() {
    scrolling = true;
  }
  skillsCarouselIconsContainer.addEventListener("mouseout", startScrolling);
  iconsContainerClone.addEventListener("mouseout", startScrolling);
};

////////// BACKGROUND PARTICLES BEHAVIOR \\\\\\\\\\
particlesJS.load("particles-js", "./particles.json");
