/***********************
 * NAVIGATION BEHAVIOR *
 **********************/

// Tailwind "lg" breakpoint in pixels.
const MOBILE_BREAKPOINT = 1024;
// Tailwind "m-5" = 1.25rem = 20 pixels.
const MOBILE_EXTRA_MARGIN = 20;

const profileSection = document.getElementById("profile-section");
const mainElement = document.querySelector("main");
const [navigationMenuDesktop, navigationMenuMobile] = document.querySelectorAll("nav.navigation-menu");
const anchorLinks = document.querySelectorAll("nav.navigation-menu a[href^='#']");

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
	return parseFloat(bodyStyles.paddingTop) || 0;
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

	if (!target) return;

	// Prevent default browser behavior and URL hash change.
	event.preventDefault();

	if (window.innerWidth >= MOBILE_BREAKPOINT) {
		scrollToDesktopSection(target);
	} else {
		scrollToMobileSection(target);
	}
}

// Initialize padding on page load and window resize.
window.addEventListener("load", updateDesktopPadding);
window.addEventListener("resize", updateDesktopPadding);

// Attach click handlers to all anchor links.
anchorLinks.forEach(link => {
	link.addEventListener("click", handleAnchorClick);
});
