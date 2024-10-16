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


////////// ACTIVE LINK ON SCROLL BEHAVIOR \\\\\\\\\\
document.addEventListener("DOMContentLoaded", function () {
  // Select all sections and navigation links.
  const sections = document.querySelectorAll("section");
  const navLinks = document.querySelectorAll(".navbar-nav .nav-link");

  // Listen for the scroll event on the window.
  window.addEventListener("scroll", function () {
    let current = "";

    // Loop through each section to check which is currently in view.
    sections.forEach(function (section) {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;

      // Check if the section is within the current scroll position.
      if (window.scrollY >= sectionTop - sectionHeight / 3) {
        // Get the ID of the visible section.
        current = section.getAttribute("id");
      }
    });

    // Update "active" class on nav links.
    navLinks.forEach(function (link) {
      // Remove "active" class from all links.
      link.classList.remove("active");
      if (link.getAttribute("data-section-id") === current) {
        // Add "active" class to the matching link.
        link.classList.add("active");
      }
    });
  });
});


////////// MOVE TO TOP BUTTON BEHAVIOR \\\\\\\\\\
const navbarBrand = document.querySelector(".navbar-brand");
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

navbarBrand .addEventListener("click", function (event) {
  // Prevent the default button behavior.
  event.preventDefault();

  window.scrollTo({ top: 0, behavior: "smooth" });
});

moveToTopButton.addEventListener("click", function (event) {
  // Prevent the default button behavior.
  event.preventDefault();

  window.scrollTo({ top: 0, behavior: "smooth" });
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


////////// POPHOVER BEHAVIOR \\\\\\\\\\
function initializePopovers() {
  const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
  const popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
    return new bootstrap.Popover(popoverTriggerEl);
  });
}

document.addEventListener("DOMContentLoaded", function () {
  initializePopovers();
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

  initializePopovers();
};


////////// BACKGROUND PARTICLES BEHAVIOR \\\\\\\\\\
document.addEventListener("DOMContentLoaded", function () {
  //
  emailjs.init("-nvDUA2GW_QoL_8nL");

  // Selects the contact form.
  const contactForm = document.getElementById("contact-form");

  // Selects the name, email, and message input fields.
  const name = document.getElementById("name");
  const email = document.getElementById("email");
  const message = document.getElementById("message");
  const messageCharCount = document.getElementById("message-char-count");

  // Selects the send button.
  const sendButton = document.getElementById("send-button");

  // Update the character count for a given input.
  function updateCharCount(input, charCountElement, maxChars) {
    charCountElement.textContent = `${input.value.length}/${maxChars}`;
  }

  // Update character count for the message input field.
  message.addEventListener("input", function () {
    updateCharCount(message, messageCharCount, 500);
  });

  function checkFormCompletion() {
    // Enables the send button if all fields are filled.
    if (name.value.trim() !== "" && email.value.trim() !== "" && message.value.trim() !== "") {
      sendButton.disabled = false;
    } else {
      sendButton.disabled = true;
    }
  }

  // Listens for input changes to check form completion.
  contactForm.addEventListener("input", checkFormCompletion);

  //
  contactForm.addEventListener("submit", function (event) {
    // Prevent the default button behavior.
    event.preventDefault();

    // Updates the button text to "Sending...".
    sendButton.textContent = "Sending...";

    // Sends the form data via emailJS.
    emailjs.sendForm("service_37gv0v7", "template_lxmfrhn", this).then(function () {
      alert("Your message has been sent!");

      // Resets the form and updates the button text and state.
      contactForm.reset();
      sendButton.textContent = "Send Message";
      sendButton.disabled = true;
    }, function (error) {
      alert("An error occurred, please try again.");
      // Resets the button text to "Send Message" in case of error.
      sendButton.textContent = "Send Message";
    });
  });
});


////////// BACKGROUND PARTICLES BEHAVIOR \\\\\\\\\\
particlesJS.load("particles-js", "./resources/particles/particles.json");


////////// ANIMATE ON SCROLL BEHAVIOR \\\\\\\\\\
AOS.init({
  disable: false,
  offset: 200,
  delay: 0,
  duration: 800,
  easing: "ease",
  once: false,
  mirror: true,
});