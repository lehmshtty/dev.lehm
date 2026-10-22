/**
 * portfolio.js
 * Interactivity for the portfolio experience:
 * - Gallery Lightbox
 * - Contact Form validation & simulated sending
 * - Smooth scroll navigation
 * - Dynamic stats & dates
 */

document.addEventListener("DOMContentLoaded", () => {
    initPortfolio();
});

function initPortfolio() {
    // Lightbox modal logic for gallery items
    const lightbox = document.getElementById("galleryLightbox");
    const lightboxImg = document.getElementById("lightboxImage");
    const lightboxClose = document.getElementById("lightboxClose");

    document.querySelectorAll(".gallery-item").forEach(item => {
        item.addEventListener("click", () => {
            const img = item.querySelector("img");
            if (img && lightbox && lightboxImg) {
                lightboxImg.src = img.src;
                lightboxImg.alt = img.alt || "Gallery Preview";
                lightbox.classList.add("active");
                document.body.style.overflow = "hidden";
            }
        });
    });

    if (lightboxClose && lightbox) {
        lightboxClose.addEventListener("click", () => {
            lightbox.classList.remove("active");
            document.body.style.overflow = "";
        });

        lightbox.addEventListener("click", (e) => {
            if (e.target === lightbox) {
                lightbox.classList.remove("active");
                document.body.style.overflow = "";
            }
        });
    }

    // Contact form submission
    const contactForm = document.getElementById("portfolioContactForm");
    if (contactForm) {
        contactForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const name = contactForm.querySelector("[name='name']").value;
            const btn = contactForm.querySelector("button[type='submit']");
            const originalText = btn.textContent;

            btn.disabled = true;
            btn.textContent = "Sending message...";

            setTimeout(() => {
                btn.disabled = false;
                btn.textContent = originalText;
                contactForm.reset();
                showPortfolioNotification(`Thank you, ${name}! Your message has been sent successfully.`);
            }, 1000);
        });
    }

    // Dynamic current year
    const yearElem = document.getElementById("currentYear");
    if (yearElem) {
        yearElem.textContent = new Date().getFullYear();
    }
}

function showPortfolioNotification(msg) {
    let notify = document.getElementById("portfolioNotice");
    if (!notify) {
        notify = document.createElement("div");
        notify.id = "portfolioNotice";
        notify.className = "portal-toast";
        document.body.appendChild(notify);
    }
    notify.textContent = msg;
    notify.classList.add("show");
    setTimeout(() => {
        notify.classList.remove("show");
    }, 3800);
}

