/**********************
* NAVIGATION BEHAVIOR *
**********************/

// Tailwind "lg" breakpoint in pixels.
const MOBILE_BREAKPOINT = 1024;
// Tailwind "m-5" = 1.25rem = 20 pixels.
const MOBILE_EXTRA_MARGIN = 20;

const profileSection = document.getElementById("profile-section");
const mainElement = document.querySelector("main");
const [navigationMenuDesktop, navigationMenuMobile] = document.querySelectorAll("nav.navigation-menu");
const anchorLinks = document.querySelectorAll("a[href^='#']");

// Apply top and bottom padding to <main> (desktop only).
function updateDesktopPadding() {
	if (window.innerWidth < MOBILE_BREAKPOINT) {
		mainElement.style.paddingTop = "";
		mainElement.style.paddingBottom = "";
		return;
	}

	const profileRect = profileSection.getBoundingClientRect();
	const navigationMenuRect = navigationMenuDesktop.getBoundingClientRect();

	// Top padding equals distance from top of viewport to top of profile section.
	mainElement.style.paddingTop = profileRect.top + "px";

	// Bottom padding equals distance from bottom of navigation menu to bottom of viewport.
	const bottomPadding = window.innerHeight - navigationMenuRect.bottom;
	mainElement.style.paddingBottom = bottomPadding + "px";
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

// Initialize padding on page load and window resize.
window.addEventListener("load", function () {
	updateDesktopPadding();
	updateGitHubStats();
});

window.addEventListener("resize", updateDesktopPadding);

// Attach click handlers to all anchor links.
anchorLinks.forEach(function (link) {
	link.addEventListener("click", handleAnchorClick);
});


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