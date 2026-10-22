// Logged-in indicator + small UX helpers for the student portal
document.addEventListener("DOMContentLoaded", () => {
    const badge = document.getElementById("authStatus");

    if (badge && badge.dataset.loggedIn === "true") {
        badge.innerHTML = '<span class="dot"></span> Logged in as <strong></strong>';
        badge.querySelector("strong").textContent = badge.dataset.user; // textContent = XSS-safe
        badge.classList.add("online");

        // Pulse briefly right after a fresh login, then clean the URL
        if (badge.dataset.welcome === "1") {
            badge.classList.add("flash");
            setTimeout(() => badge.classList.remove("flash"), 3000);
            history.replaceState(null, "", location.pathname);
        }
    }

    // Confirm before deleting
    document.querySelectorAll("form[data-confirm]").forEach(form => {
        form.addEventListener("submit", e => {
            if (!confirm(form.dataset.confirm)) e.preventDefault();
        });
    });
});