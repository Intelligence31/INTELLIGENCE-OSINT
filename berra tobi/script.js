/* =========================================================
KOVIRAE BEAUTY
Main JavaScript
Designed by Intelligence TM
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

/* =====================================================
01. PAGE LOADER
===================================================== */

const loader = document.querySelector(".page-loader");

window.addEventListener("load", () => {
setTimeout(() => {
if (loader) {
loader.classList.add("loaded");
}
}, 500);
});


/* =====================================================
02. HEADER SCROLL EFFECT
===================================================== */

const header = document.querySelector(".site-header");

const handleHeaderScroll = () => {
if (!header) return;

if (window.scrollY > 30) {
header.classList.add("scrolled");
} else {
header.classList.remove("scrolled");
}
};

window.addEventListener("scroll", handleHeaderScroll, {
passive: true
});

handleHeaderScroll();


/* =====================================================
03. MOBILE MENU
===================================================== */

const menuToggle = document.querySelector(".mobile-menu-toggle");
const mobileNav = document.querySelector(".mobile-nav");
const mobileLinks = document.querySelectorAll(".mobile-nav-link");

const closeMobileMenu = () => {
if (!menuToggle || !mobileNav) return;

menuToggle.classList.remove("active");
mobileNav.classList.remove("open");
document.body.classList.remove("menu-open");

menuToggle.setAttribute("aria-expanded", "false");
};

const openMobileMenu = () => {
if (!menuToggle || !mobileNav) return;

menuToggle.classList.add("active");
mobileNav.classList.add("open");
document.body.classList.add("menu-open");

menuToggle.setAttribute("aria-expanded", "true");
};

if (menuToggle && mobileNav) {

menuToggle.addEventListener("click", () => {

const isOpen = mobileNav.classList.contains("open");

if (isOpen) {
closeMobileMenu();
} else {
openMobileMenu();
}

});

}


/* =====================================================
04. CLOSE MENU WHEN NAV LINK IS CLICKED
===================================================== */

mobileLinks.forEach(link => {

link.addEventListener("click", () => {
closeMobileMenu();
});

});


/* =====================================================
05. CLOSE MENU WHEN CLICKING OUTSIDE
===================================================== */

document.addEventListener("click", (event) => {

if (!mobileNav || !menuToggle) return;

const clickedInsideMenu =
mobileNav.contains(event.target);

const clickedToggle =
menuToggle.contains(event.target);

if (
mobileNav.classList.contains("open") &&
!clickedInsideMenu &&
!clickedToggle
) {
closeMobileMenu();
}

});


/* =====================================================
06. CLOSE MENU WITH ESCAPE KEY
===================================================== */

document.addEventListener("keydown", (event) => {

if (event.key === "Escape") {
closeMobileMenu();
}

});


/* =====================================================
07. ACTIVE NAVIGATION LINK
===================================================== */

const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll(
".nav-link, .mobile-nav-link"
);

const updateActiveNavigation = () => {

let currentSection = "";

sections.forEach(section => {

const sectionTop =
section.offsetTop - 150;

const sectionHeight =
section.offsetHeight;

if (
window.scrollY >= sectionTop &&
window.scrollY < sectionTop + sectionHeight
) {
currentSection = section.getAttribute("id");
}

});

navLinks.forEach(link => {

link.classList.remove("active");

const href = link.getAttribute("href");

if (href === `#${currentSection}`) {
link.classList.add("active");
}

});

};

window.addEventListener(
"scroll",
updateActiveNavigation,
{ passive: true }
);

updateActiveNavigation();


/* =====================================================
08. SMOOTH SCROLL
===================================================== */

const allAnchorLinks = document.querySelectorAll(
'a[href^="#"]'
);

allAnchorLinks.forEach(link => {

link.addEventListener("click", function (event) {

const targetId =
this.getAttribute("href");

if (
!targetId ||
targetId === "#"
) {
return;
}

const target =
document.querySelector(targetId);

if (!target) return;

event.preventDefault();

const headerHeight =
header ? header.offsetHeight : 0;

const targetPosition =
target.getBoundingClientRect().top +
window.scrollY -
headerHeight;

window.scrollTo({
top: targetPosition,
behavior: "smooth"
});

});

});


/* =====================================================
09. SCROLL REVEAL
===================================================== */

const revealElements =
document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {

const revealObserver =
new IntersectionObserver(
(entries, observer) => {

entries.forEach(entry => {

if (entry.isIntersecting) {

entry.target.classList.add(
"visible"
);

observer.unobserve(
entry.target
);

}

});

},
{
threshold: 0.12,
rootMargin: "0px 0px -50px 0px"
}
);

revealElements.forEach(element => {
revealObserver.observe(element);
});

} else {

revealElements.forEach(element => {
element.classList.add("visible");
});

}


/* =====================================================
10. BACK TO TOP BUTTON
===================================================== */

const backToTop =
document.querySelector(".back-to-top");

const handleBackToTop = () => {

if (!backToTop) return;

if (window.scrollY > 600) {

backToTop.classList.add("visible");

} else {

backToTop.classList.remove("visible");

}

};

window.addEventListener(
"scroll",
handleBackToTop,
{ passive: true }
);

handleBackToTop();

if (backToTop) {

backToTop.addEventListener("click", () => {

window.scrollTo({
top: 0,
behavior: "smooth"
});

});

}


/* =====================================================
11. PRODUCT LINKS
===================================================== */

const productLinks =
document.querySelectorAll(".product-link");

productLinks.forEach(link => {

link.addEventListener("click", () => {

const productCard =
link.closest(".product-card");

if (!productCard) return;

const productName =
productCard.querySelector("h3");

if (productName) {

console.log(
`Kovirae Beauty product selected: ${productName.textContent.trim()}`
);

}

});

});


/* =====================================================
12. CONTACT FORM
NETLIFY FORM SUPPORT
===================================================== */

const contactForm =
document.querySelector(".contact-form");

if (contactForm) {

contactForm.addEventListener(
"submit",
() => {

const submitButton =
contactForm.querySelector(
".form-submit"
);

if (!submitButton) return;

const originalText =
submitButton.innerHTML;

submitButton.innerHTML = `
<span>Sending...</span>
<span>...</span>
`;

submitButton.style.pointerEvents =
"none";

/*
* Netlify handles the actual submission.
* We only change the button appearance
* while the request is being processed.
*/

setTimeout(() => {

submitButton.innerHTML =
originalText;

submitButton.style.pointerEvents =
"";

}, 5000);

}
);

}


/* =====================================================
13. FORM INPUT EFFECT
===================================================== */

const formInputs =
document.querySelectorAll(
".contact-form input, .contact-form textarea, .contact-form select"
);

formInputs.forEach(input => {

input.addEventListener("focus", () => {

const group =
input.closest(".form-group");

if (group) {
group.classList.add("focused");
}

});

input.addEventListener("blur", () => {

const group =
input.closest(".form-group");

if (group) {
group.classList.remove("focused");
}

});

});


/* =====================================================
14. PREVENT DOUBLE FORM SUBMISSION
===================================================== */

let formSubmitted = false;

if (contactForm) {

contactForm.addEventListener(
"submit",
event => {

if (formSubmitted) {

event.preventDefault();
return;

}

formSubmitted = true;

}
);

}


/* =====================================================
15. WINDOW RESIZE
===================================================== */

window.addEventListener("resize", () => {

/*
* If the user rotates their phone or
* expands the browser back to desktop,
* close the mobile menu.
*/

if (window.innerWidth > 900) {
closeMobileMenu();
}

updateActiveNavigation();

});


/* =====================================================
16. IMAGE ERROR HANDLING
===================================================== */

const images =
document.querySelectorAll("img");

images.forEach(image => {

image.addEventListener(
"error",
() => {

image.classList.add(
"image-error"
);

console.warn(
"Kovirae Beauty image could not be loaded:",
image.src
);

}
);

});


/* =====================================================
17. WHATSAPP ORDER LINKS
===================================================== */

const whatsappLinks =
document.querySelectorAll(
'[data-whatsapp]'
);

whatsappLinks.forEach(link => {

link.addEventListener("click", () => {

const product =
link.dataset.whatsapp;

if (!product) return;

const message =
`Hello Kovirae Beauty, I am interested in ${product}. Please send me more details.`;

const whatsappURL =
`https://wa.me/2349159238866?text=${encodeURIComponent(message)}`;

link.href = whatsappURL;

});

});


/* =====================================================
18. CONSOLE BRANDING
===================================================== */

console.log(
"%cKOVIRAE BEAUTY",
"font-size: 22px; font-weight: bold;"
);

console.log(
"%cWebsite designed by Intelligence TM",
"font-size: 13px;"
);

});
