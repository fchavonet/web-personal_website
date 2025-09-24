/******************
* LOADER BEHAVIOR *
******************/

window.addEventListener("load", () => {
  const loader = document.getElementById("loader");
  const spinner = loader.querySelector(".spinner");

  setTimeout(() => {
    spinner.style.opacity = "0";
    spinner.style.transform = "scale(0)";

    setTimeout(() => {
      loader.style.opacity = "0";

      setTimeout(() => {
        loader.style.display = "none";
      }, 1000);
    }, 500);
  }, 1500);
});


/**********************
* NAVIGATION BEHAVIOR *
**********************/

// Tailwind "lg" breakpoint in pixels.
const MOBILE_BREAKPOINT = 1024;
// Tailwind "m-5" = 1.25rem = 16 pixels.
const MOBILE_EXTRA_MARGIN = 16;

const profileSection = document.getElementById("profile-section");
const main = document.querySelector("main");
const [navigationMenuDesktop, navigationMenuMobile] = document.querySelectorAll("nav.navigation-menu");
const anchorLinks = document.querySelectorAll("a[href^='#']");

// Apply top and bottom padding to <main> (desktop only).
function updateDesktopPadding() {
  if (window.innerWidth < MOBILE_BREAKPOINT) {
    main.style.paddingTop = "";
    main.style.paddingBottom = "";
    return;
  }

  const profileRect = profileSection.getBoundingClientRect();
  const navigationMenuRect = navigationMenuDesktop.getBoundingClientRect();

  // Top padding equals distance from top of viewport to top of profile section.
  main.style.paddingTop = profileRect.top + "px";

  // Bottom padding equals distance from bottom of navigation menu to bottom of viewport.
  const bottomPadding = window.innerHeight - navigationMenuRect.bottom;
  main.style.paddingBottom = bottomPadding + "px";
}

// Return the computed top padding value of the <body> element.
function getBodyPaddingTop() {
  const bodyStyles = window.getComputedStyle(document.body);
  const value = parseFloat(bodyStyles.paddingTop);

  if (isNaN(value)) {
    return 0;
  }
  return value;
}

// Scroll behavior for desktop view.
function scrollToDesktopSection(target) {
  updateDesktopPadding();

  const targetRect = target.getBoundingClientRect();
  const profileRect = profileSection.getBoundingClientRect();
  const navigationMenuRect = navigationMenuDesktop.getBoundingClientRect();

  let destinationY;

  if (target.id === "contact-section") {
    // Align the bottom of the contact section with the bottom of the navigation menu.
    const delta = targetRect.bottom - navigationMenuRect.bottom;
    destinationY = window.scrollY + delta;
  } else {
    // Align the top of the section with the top of the profile section.
    const delta = targetRect.top - profileRect.top;
    destinationY = window.scrollY + delta;
  }

  window.scrollTo({ top: destinationY, behavior: "smooth" });
}

// Scroll behavior for mobile view.
function scrollToMobileSection(target) {
  if (target.id === "profile-section") {
    // Scroll to the top of the page.
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  const targetRect = target.getBoundingClientRect();
  const navigationMenuRect = navigationMenuMobile.getBoundingClientRect();
  const bodyPaddingTop = getBodyPaddingTop();

  // Offset equals body padding + navigation menu height + extra margin.
  const offset = bodyPaddingTop + navigationMenuRect.height + MOBILE_EXTRA_MARGIN;

  const delta = targetRect.top - offset;
  const destinationY = window.scrollY + delta;

  window.scrollTo({ top: destinationY, behavior: "smooth" });
}

// Handle anchor click and delegate to desktop or mobile behavior.
function handleAnchorClick(event) {
  const linkHref = event.currentTarget.getAttribute("href");
  const targetId = linkHref.slice(1);
  const target = document.getElementById(targetId);

  if (!target) {
    return;
  }

  // Prevent default browser behavior and URL hash change.
  event.preventDefault();

  if (window.innerWidth >= MOBILE_BREAKPOINT) {
    scrollToDesktopSection(target);
  } else {
    scrollToMobileSection(target);
  }
}

// Attach click handlers to all anchor links.
anchorLinks.forEach((link) => {
  link.addEventListener("click", handleAnchorClick);
});

updateDesktopPadding();
window.addEventListener("resize", updateDesktopPadding);


/*****************************
* GITHUB STATISTICS BEHAVIOR *
*****************************/

const GITHUB_USER = "fchavonet";
const CACHE_KEY = "github_stats_cache";
const ETAG_KEY_USER = "github_etag_user";
const ETAG_KEY_REPOS = "github_etag_repos";
const EXPIRATION_KEY = "github_stats_expiration";

// Cache expiration duration: 24 hours.
const CACHE_DURATION = 24 * 60 * 60 * 1000;

// Fetch data with conditional request using ETag.
async function fetchWithEtag(url, etagKey) {
  const headers = { "Accept": "application/vnd.github.v3+json" };
  const savedEtag = localStorage.getItem(etagKey);

  if (savedEtag) {
    headers["If-None-Match"] = savedEtag;
  }

  const response = await fetch(url, { headers: headers });

  if (response.status === 304) {
    // Resource has not changed since last fetch.
    return null;
  }

  if (!response.ok) {
    throw new Error("GitHub API error (" + response.status + ")");
  }

  const newEtag = response.headers.get("ETag");

  if (newEtag) {
    localStorage.setItem(etagKey, newEtag);
  }

  const data = await response.json();
  return data;
}

// Fetch GitHub stats or use cached data.
async function updateGitHubStats() {
  const now = Date.now();
  const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
  const expiration = parseInt(localStorage.getItem(EXPIRATION_KEY) || "0", 10);

  // Use cached stats if still valid.
  if (cached && now < expiration) {
    displayStats(cached);
    populateProjectStars(cached.repos);
    return;
  }

  try {
    // Fetch user and repo data from GitHub.
    const [userData, reposData] = await Promise.all([
      fetchWithEtag("https://api.github.com/users/" + GITHUB_USER, ETAG_KEY_USER),
      fetchWithEtag("https://api.github.com/users/" + GITHUB_USER + "/repos?per_page=100", ETAG_KEY_REPOS)
    ]);

    // If no new data and cache is available, use cache.
    if (userData === null && reposData === null && cached) {
      displayStats(cached);
      populateProjectStars(cached.repos);
      localStorage.setItem(EXPIRATION_KEY, now + CACHE_DURATION);
      return;
    }

    const finalUser = userData || cached.user;
    const finalRepos = reposData || cached.repos;

    // Count total stars across all repositories.
    let totalStars = 0;
    for (let repo of finalRepos) {
      totalStars += repo.stargazers_count;
    }

    // Store relevant stats.
    const stats = {
      user: {
        public_repos: finalUser.public_repos,
        followers: finalUser.followers
      },
      repos: finalRepos,
      stars: totalStars
    };

    // Save to localStorage for 24h.
    localStorage.setItem(CACHE_KEY, JSON.stringify(stats));
    localStorage.setItem(EXPIRATION_KEY, now + CACHE_DURATION);

    // Display data in DOM.
    displayStats(stats);
    populateProjectStars(finalRepos);

  } catch (error) {
    console.error("Error updating GitHub statistics:", error);
    document.getElementById("repo-count").textContent = "...";
    document.getElementById("followers-count").textContent = "...";
    document.getElementById("stars-count").textContent = "...";
  }
}

// Update DOM elements with stats.
function displayStats(stats) {
  document.getElementById("repo-count").textContent = stats.user.public_repos;
  document.getElementById("followers-count").textContent = stats.user.followers;
  document.getElementById("stars-count").textContent = stats.stars;
}

// Fetch and display stars for each GitHub project card.
function populateProjectStars(repos) {
  const links = document.querySelectorAll("a[data-repo]");
  for (let link of links) {
    const repoName = link.dataset.repo;
    let count = "—";
    for (let repo of repos) {
      if (repo.name === repoName) {
        count = repo.stargazers_count;
        break;
      }
    }
    const placeholder = link.querySelector(".stars-placeholder");
    placeholder.textContent = count;
  }
}

updateGitHubStats();


/*********************
* CARROUSEL BEHAVIOR *
*********************/

const carouselContainer = document.getElementById("carousel-container");

const slidesTrack = document.getElementById("slide-track");
const slideItems = slidesTrack.children;

const dotsWrapper = document.getElementById("dots");
const previousButton = document.getElementById("prev-btn");
const nextButton = document.getElementById("next-btn");

// Navigation state.
let currentIndex = 1;
let isTransitionLocked = false;
let slideQueue = [];

// Auto-play settings.
const AUTO_PLAY_DELAY = 5000;
let autoPlayInterval = null;

// Calculate the distance to move between two slides.
function getSlideStep() {
  const firstSlideRect = slideItems[0].getBoundingClientRect();
  const computedStyle = getComputedStyle(slideItems[0]);
  const marginRight = parseFloat(computedStyle.marginRight);

  return firstSlideRect.width + marginRight;
}

// Move the track to the specified slide index.
function goToSlide(targetIndex, shouldAnimate, durationMs) {
  if (shouldAnimate) {
    slidesTrack.style.transition = "transform " + durationMs + "ms ease-in-out";
  } else {
    slidesTrack.style.transition = "none";
  }

  const offset = -getSlideStep() * targetIndex;
  slidesTrack.style.transform = "translateX(" + offset + "px)";
}

// Advance or rewind the carousel by one slide.
function changeSlide(delta) {
  if (isTransitionLocked) {
    slideQueue.push(delta);
    return;
  }

  isTransitionLocked = true;
  currentIndex += delta;

  // Adjust speed based on queued actions
  const baseDuration = 500;
  const queuedCount = slideQueue.length;
  let computedDuration = baseDuration - (queuedCount * 100);

  if (computedDuration < 150) {
    computedDuration = 150;
  }

  goToSlide(currentIndex, true, computedDuration);
}

// Handle end of transition: loop and process queue.
slidesTrack.addEventListener("transitionend", function () {
  const lastRealIndex = slideItems.length - 2;

  if (currentIndex === 0) {
    currentIndex = lastRealIndex;
    goToSlide(currentIndex, false, 0);
  } else if (currentIndex === slideItems.length - 1) {
    currentIndex = 1;
    goToSlide(currentIndex, false, 0);
  }

  updateDots();

  requestAnimationFrame(function () {
    isTransitionLocked = false;

    if (slideQueue.length > 0) {
      const nextDelta = slideQueue.shift();
      requestAnimationFrame(function () {
        changeSlide(nextDelta);
      });
    }
  });
});

// Dynamic creation of navigation dots.
const realSlideCount = slideItems.length - 2;

for (let slideNumber = 1; slideNumber <= realSlideCount; slideNumber++) {
  const dotButton = document.createElement("button");
  dotButton.classList.add(
    "w-2", "h-2", "rounded-full",
    "bg-zinc-500/75", "cursor-pointer",
    "transition-colors", "duration-300", "ease-in-out"
  );

  dotButton.setAttribute("data-index", slideNumber);

  dotButton.setAttribute("aria-label", "Aller à la diapositive " + slideNumber + " sur " + realSlideCount);

  dotButton.addEventListener("click", function () {
    if (!isTransitionLocked) {
      currentIndex = parseInt(this.getAttribute("data-index"), 10);
      goToSlide(currentIndex, true, 500);
      resetAutoPlay();
      updateDots();
    }
  });

  dotsWrapper.appendChild(dotButton);
}

// Update the visual state of navigation dots.
function updateDots() {
  const dotButtons = dotsWrapper.children;

  for (let position = 0; position < dotButtons.length; position++) {
    const dotPosition = position + 1;
    const button = dotButtons[position];

    if (dotPosition === currentIndex) {
      button.classList.add("bg-blue-500");
      button.classList.remove("bg-zinc-500/75");
    } else {
      button.classList.remove("bg-blue-500");
      button.classList.add("bg-zinc-500/75");
    }
  }
}

// Start auto-play if not already running.
function startAutoPlay() {
  if (autoPlayInterval !== null) {
    return;
  }

  autoPlayInterval = setInterval(function () {
    changeSlide(1);
  }, AUTO_PLAY_DELAY);
}

// Stop auto-play if running.
function stopAutoPlay() {
  if (autoPlayInterval !== null) {
    clearInterval(autoPlayInterval);
    autoPlayInterval = null;
  }
}

// Reset auto-play timer by stopping and starting again.
function resetAutoPlay() {
  stopAutoPlay();
  startAutoPlay();
}

// Previous button events.
previousButton.addEventListener("click", function () {
  changeSlide(-1);
});

// Next button events.
nextButton.addEventListener("click", function () {
  changeSlide(1);
});

// Pause auto-play on hover if container exists.
if (carouselContainer) {
  carouselContainer.addEventListener("mouseenter", stopAutoPlay);
  carouselContainer.addEventListener("mouseleave", startAutoPlay);
}

// Initialize carousel position, dots and start auto-play.
goToSlide(currentIndex, false, 0);
startAutoPlay();
updateDots();

// Update carousel position and dots when the window is resized.
window.addEventListener("resize", function () {
  goToSlide(currentIndex, false, 0);
  updateDots();
});

// Pause autoplay on page hide, resume on page show.
document.addEventListener("visibilitychange", function () {
  if (document.hidden) {
    stopAutoPlay();
    slideQueue = [];
    isTransitionLocked = false;
    slidesTrack.style.transition = "none";
  } else {
    goToSlide(currentIndex, false, 0);
    startAutoPlay();
    updateDots();
  }
});


/************************
* CONTACT FORM BEHAVIOR *
************************/

// Initialize EmailJS.
emailjs.init("-nvDUA2GW_QoL_8nL");

const contactForm = document.getElementById("contact-form");
const name = document.getElementById("name");
const email = document.getElementById("email");
const message = document.getElementById("message");
const messageCharCount = document.getElementById("message-char-count");
const sendButton = document.getElementById("send-button");

let isSubmitting = false;

// Check email sending cooldown.
function canSendEmail() {
  const lastSend = localStorage.getItem("lastEmailSent");
  const now = Date.now();
  const cooldown = 3 * 60 * 1000;

  if (lastSend && (now - lastSend) < cooldown) {
    const remaining = Math.ceil((cooldown - (now - lastSend)) / 60000);

    alert("Veuillez attendre " + remaining + " minute(s) avant de renvoyer un message.");

    return false;
  }

  return true;
}

// Detect spam content.
function isSpamContent(text) {
  const spamPatterns = [
    // URLs detection.
    /http[s]?:\/\//gi,
    // www domains.
    /www\./gi,
    // Email addresses.
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/gi,
    // English spam terms.
    /\b(casino|cialis|crypto|lottery|porn|scam|viagra|winner)\b/gi,
    // French spam terms.
    /\b(casino|cialis|crypto|loterie|porn|scam|viagra|winner)\b/gi,
    // Repeated characters (aaaaa).
    /(.)\1{4,}/g
  ];

  return spamPatterns.some(pattern => pattern.test(text));
}

// Complete form validation.
function validateFormData(formData) {
  // Honeypot check.
  if (formData.get("website") || formData.get("fake_email") || formData.get("bot_trap")) {
    console.warn("Bot detected via honeypot!");
    return false;
  }

  const nameValue = formData.get("name").trim();
  const emailValue = formData.get("email").trim();
  const messageValue = formData.get("message").trim();

  // Length validation with alerts.
  if (nameValue.length < 2 || nameValue.length > 50) {
    alert("Le nom doit contenir entre 2 et 50 caractères.");
    return false;
  }
  if (messageValue.length < 10) {
    alert("Le message doit contenir au moins 10 caractères.");
    return false;
  }
  if (messageValue.length > 500) {
    alert("Le message ne peut pas dépasser 500 caractères.");
    return false;
  }

  // Email format validation.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
    alert("Veuillez saisir une adresse email valide.");
    return false;
  }

  // Spam detection.
  if (isSpamContent(nameValue) || isSpamContent(messageValue)) {
    alert("Votre message contient du contenu suspect. Veuillez le modifier.");
    return false;
  }

  // Character validation (at least one letter).
  if (!/[a-zA-ZÀ-ÿ]/.test(nameValue) || !/[a-zA-ZÀ-ÿ]/.test(messageValue)) {
    alert("Le nom et le message doivent contenir au moins une lettre valide.");
    return false;
  }

  return true;
}

// Check form completion and update UI.
function checkFormCompletion() {
  const isNameFilled = name.value.trim() !== "";
  const isEmailFilled = email.value.trim() !== "";
  const isMessageFilled = message.value.trim() !== "";
  const nameLength = name.value.trim().length;
  const messageLength = message.value.trim().length;

  const isNameValid = nameLength >= 2;

  // Email validation.
  const isEmailValid = isEmailFilled && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());

  // Message length validation.
  const isMessageValid = messageLength >= 10;

  // Update name field styling.
  name.classList.remove("focus:ring-blue-500", "focus:shadow-blue-500/30", "focus:ring-red-500", "focus:shadow-red-500/30");
  if (isNameValid) {
    name.classList.add("focus:ring-blue-500", "focus:shadow-blue-500/30");
  } else {
    name.classList.add("focus:ring-red-500", "focus:shadow-red-500/30");
  }

  // Update email field styling.
  email.classList.remove("focus:ring-blue-500", "focus:shadow-blue-500/30", "focus:ring-red-500", "focus:shadow-red-500/30");
  if (isEmailValid) {
    email.classList.add("focus:ring-blue-500", "focus:shadow-blue-500/30");
  } else {
    email.classList.add("focus:ring-red-500", "focus:shadow-red-500/30");
  }

  // Update message field styling.
  message.classList.remove("focus:ring-blue-500", "focus:shadow-blue-500/30", "focus:ring-red-500", "focus:shadow-red-500/30");
  if (isMessageValid) {
    message.classList.add("focus:ring-blue-500", "focus:shadow-blue-500/30");
  } else {
    message.classList.add("focus:ring-red-500", "focus:shadow-red-500/30");
  }

  // Enable/disable submit button.
  const isFormValid = isNameFilled && isEmailFilled && isMessageFilled && isEmailValid && isMessageValid;
  sendButton.disabled = !isFormValid;
}

// Initialize form state.
checkFormCompletion();

// Handle form input.
contactForm.addEventListener("input", function () {
  const messageLength = message.value.length;
  messageCharCount.textContent = messageLength + "/500";
  checkFormCompletion();
});

// Handle form submission.
contactForm.addEventListener("submit", function (event) {
  event.preventDefault();

  if (isSubmitting) {
    return;
  }

  if (!canSendEmail()) {
    return;
  }

  const formData = new FormData(this);

  if (!validateFormData(formData)) {
    return;
  }

  isSubmitting = true;
  sendButton.disabled = true;
  sendButton.textContent = "Envoi en cours...";

  emailjs.sendForm("service_r8qu87w", "template_lxmfrhn", this)
    .then(() => {
      alert("Votre message a été envoyé avec succès !");
      contactForm.reset();
      messageCharCount.textContent = "0/500";
      localStorage.setItem("lastEmailSent", Date.now());
    })
    .catch((error) => {
      alert("Une erreur s'est produite. Veuillez réessayer plus tard.");
    })
    .finally(() => {
      isSubmitting = false;
      sendButton.textContent = "Envoyer";
      sendButton.disabled = false;
      checkFormCompletion();
    });
});

// Prevent spam paste.
message.addEventListener("paste", () => {
  setTimeout(() => {
    if (isSpamContent(message.value)) {
      message.value = "";
      alert("Le contenu collé semble suspect et a été supprimé.");
      messageCharCount.textContent = "0/500";
      checkFormCompletion();
    }
  }, 100);
});

