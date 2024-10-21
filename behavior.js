////////// SCROLL TO SECTIONS BEHAVIOR \\\\\\\\\\
const navbarToggler = document.getElementById("navbar-toggler");
const navbarMenu = document.getElementById("navbar-menu");
const navLinks = document.querySelectorAll(".nav-link");

navLinks.forEach(function (link) {
  link.addEventListener("click", function (event) {
    // Prevent the default button behavior.
    event.preventDefault();

    const sectionId = link.getAttribute("data-section-id");
    const section = document.getElementById(sectionId);

    if (section) {
      section.scrollIntoView({ behavior: "smooth" });

      if (window.innerWidth < 992) {
        navbarMenu.classList.remove("show");
        navbarToggler.classList.add("collapsed");
      }
    } else {
      // Log error if section ID is not found.
      console.error("Section with ID " + sectionId + " not found.");
    }
  });
});


////////// ACTIVE LINK ON SCROLL BEHAVIOR \\\\\\\\\\
document.addEventListener("DOMContentLoaded", function () {
  const sections = document.querySelectorAll("section");
  // const navLinks = document.querySelectorAll(".nav-link");

  // Listen for the scroll event on the window.
  window.addEventListener("scroll", function () {
    let currentSection = "about";

    // Loop through each section to check which is currently in view.
    sections.forEach(function (section) {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;

      // Check if the section is within the current scroll position.
      if (window.scrollY >= sectionTop - sectionHeight / 3) {
        // Get the ID of the visible section.
        currentSection = section.getAttribute("id");
      }
    });

    // Update "active" class on nav links.
    navLinks.forEach(function (link) {
      // Remove "active" class from all links.
      link.classList.remove("active");
      if (link.getAttribute("data-section-id") === currentSection) {
        // Add "active" class to the matching link.
        link.classList.add("active");
      }
    });
  });
});


////////// MOVE TO TOP BEHAVIOR \\\\\\\\\\
const navbarBrand = document.querySelector(".navbar-brand");
const moveToTopButton = document.getElementById("move-to-top-button");

window.addEventListener("scroll", function () {
  // Get the current scroll position.
  const scrollPosition = window.scrollY || document.documentElement.scrollTop;

  // Unhide the button if the user has scrolled more than 250 pixels.
  if (scrollPosition > 250) {
    moveToTopButton.classList.add("unhide");
  } else {
    moveToTopButton.classList.remove("unhide");
  }
});

navbarBrand.addEventListener("click", function (event) {
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

const themeToggler = document.getElementById("theme-toggler");
const themeIcon = themeToggler.querySelector("i");

const bgTertiary = document.querySelectorAll(".bg-tertiary");

// Get the current theme from localStorage or default to light.
let currentTheme = localStorage.getItem("theme") || "light";

// Update theme icon based on current theme.
function updateThemeIcon() {
  if (currentTheme === "light") {
    themeIcon.classList.remove("bi-sun-fill");
    themeIcon.classList.add("bi-moon-stars-fill");
  } else {
    themeIcon.classList.remove("bi-moon-stars-fill");
    themeIcon.classList.add("bi-sun-fill");
  }
}

// Update theme and localStorage.
function updateTheme() {
  htmlPage.setAttribute("data-bs-theme", currentTheme);

  // Add or remove dark-mode class
  if (currentTheme === "dark") {
    bgTertiary.forEach(element => {
      element.classList.add("dark-mode");
    });
  } else {
    bgTertiary.forEach(element => {
      element.classList.remove("dark-mode");
    });
  }

  localStorage.setItem("theme", currentTheme);
  updateThemeIcon();
}

// Toggle theme on button click
themeToggler.addEventListener("click", function () {
  if (currentTheme === "light") {
    currentTheme = "dark";
  } else {
    currentTheme = "light";
  }
  updateTheme();
});

// Apply theme on page load.
updateTheme();


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


////////// AUTO SECTION PADDING BEHAVIOR \\\\\\\\\\
window.addEventListener("DOMContentLoaded", function () {
	const navHeight = this.document.querySelector("nav").offsetHeight;
	const sections = this.document.querySelectorAll("section");

	//
	sections.forEach(function (section) {
		section.style.paddingTop = navHeight + "px";
	});
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


////////// CONTACT FORM BEHAVIOR \\\\\\\\\\
document.addEventListener("DOMContentLoaded", function () {
	// Initialize EmailJS with public user ID.
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

	// Function to validate the email format.
	function isValidEmail(email) {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	}

	// Function to check if the form is completely filled out.
	function checkFormCompletion() {
		const isNameFilled = name.value.trim() !== "";
		const isEmailFilled = email.value.trim() !== "";
		const isMessageFilled = message.value.trim() !== "";
		const isEmailValid = isValidEmail(email.value);

		// Add or remove "invalid" class based on email validity.
		if (!isEmailValid && isEmailFilled) {
			email.classList.add("invalid");
		} else {
			email.classList.remove("invalid");
		}

		// Enable or disable send button.
		if (isNameFilled && isEmailFilled && isEmailValid && isMessageFilled) {
			sendButton.disabled = false;
		} else {
			sendButton.disabled = true;
		}
	}

	// Update char count and check form.
	contactForm.addEventListener("input", function () {
		messageCharCount.textContent = message.value.length + "/500";
		checkFormCompletion();
	});

	// Handles the form submission process.
	contactForm.addEventListener("submit", function (event) {
		// Prevent the default button behavior.
		event.preventDefault();
		sendButton.textContent = "Sending...";

		emailjs.sendForm("service_37gv0v7", "template_lxmfrhn", this).then(function () {
			alert("Your message has been sent!");
			contactForm.reset();
			sendButton.textContent = "Send Message";
			sendButton.disabled = true;

			// Reset message character count.
			messageCharCount.textContent = "0/500";
			// Remove "invalid" class from email input.
			email.classList.remove("invalid");
		}, function (error) {
			alert("An error occurred, please try again.");
			sendButton.textContent = "Send Message";
		});
	});
});


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


////////// BACKGROUND PARTICLES BEHAVIOR \\\\\\\\\\
particlesJS.load("particles-js", "./resources/particles/particles.json");
