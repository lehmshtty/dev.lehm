/**
 * auth.js
 * Manages user authentication, session state, password validation, and status badges.
 * Replaces PHP session handling with browser-side DB management.
 */

document.addEventListener("DOMContentLoaded", () => {
    initAuthUI();
});

function initAuthUI() {
    updateStatusBadge();

    // Listen for cross-component auth changes
    window.addEventListener("db:authChanged", () => {
        updateStatusBadge();
    });

    // Password show/hide toggle buttons
    document.querySelectorAll(".pw").forEach(wrap => {
        const input = wrap.querySelector("input");
        const btn = wrap.querySelector(".pw-toggle");
        if (!input || !btn) return;
        btn.addEventListener("click", () => {
            const show = input.type === "password";
            input.type = show ? "text" : "password";
            btn.textContent = show ? "Hide" : "Show";
            btn.setAttribute("aria-label", show ? "Hide password" : "Show password");
        });
    });

    // Live Password Rules (Sign Up)
    const rulesList = document.getElementById("pwRules");
    const pwInput = document.getElementById("password");
    if (rulesList && pwInput) {
        const tests = {
            upper:   v => /^[A-Z]/.test(v),
            length:  v => v.length >= 8 && v.length <= 72,
            lower:   v => /[a-z]/.test(v),
            number:  v => /[0-9]/.test(v),
            special: v => /[^A-Za-z0-9\s]/.test(v),
            space:   v => v.length > 0 && !/\s/.test(v)
        };

        const checkRules = () => {
            let allPassed = true;
            rulesList.querySelectorAll("li").forEach(li => {
                const rule = li.dataset.rule;
                const passed = tests[rule] ? tests[rule](pwInput.value) : false;
                li.classList.toggle("ok", passed);
                if (!passed) allPassed = false;
            });
            pwInput.setCustomValidity(allPassed ? "" : "Password doesn't meet all requirements.");
        };

        pwInput.addEventListener("input", checkRules);
        checkRules();
    }

    // Login Form Handler (page or modal)
    const loginForm = document.getElementById("loginForm") || document.querySelector("form[data-action='login']");
    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const email = loginForm.querySelector("input[type='email']").value;
            const password = loginForm.querySelector("input[name='password']").value;
            const errorBox = document.getElementById("loginError") || loginForm.querySelector(".msg.error");

            const res = DB.login(email, password);
            if (res.success) {
                if (errorBox) errorBox.style.display = "none";
                // If on standalone login page, redirect to portfolio or student portal
                const urlParams = new URLSearchParams(window.location.search);
                const returnUrl = urlParams.get("redirect") || "index.html";
                window.location.href = returnUrl;
            } else {
                if (errorBox) {
                    errorBox.textContent = res.message;
                    errorBox.style.display = "block";
                } else {
                    alert(res.message);
                }
            }
        });
    }

    // Signup Form Handler (page or modal)
    const signupForm = document.getElementById("signupForm") || document.querySelector("form[data-action='signup']");
    if (signupForm) {
        signupForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const nameInput = signupForm.querySelector("input[name='name']");
            const emailInput = signupForm.querySelector("input[type='email']");
            const passwordInput = signupForm.querySelector("input[name='password']");
            const errorBox = document.getElementById("signupError") || signupForm.querySelector(".msg.error");
            const successBox = document.getElementById("signupSuccess") || signupForm.querySelector(".msg.success");

            const res = DB.signup(nameInput.value, emailInput.value, passwordInput.value);
            if (res.success) {
                if (errorBox) errorBox.style.display = "none";
                if (successBox) {
                    successBox.textContent = res.message;
                    successBox.style.display = "block";
                }
                setTimeout(() => {
                    window.location.href = "login.html?registered=1";
                }, 1200);
            } else {
                if (errorBox) {
                    errorBox.textContent = res.message;
                    errorBox.style.display = "block";
                } else {
                    alert(res.message);
                }
            }
        });
    }

    // Logout Buttons
    document.querySelectorAll("[data-logout-btn]").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            if (confirm("Are you sure you want to log out?")) {
                DB.logout();
                window.location.href = "login.html?loggedout=1";
            }
        });
    });
}

function updateStatusBadge() {
    const badge = document.getElementById("authStatus");
    if (!badge) return;

    const user = DB.getCurrentUser();
    if (user) {
        badge.innerHTML = `<span class="dot"></span> Logged in as <strong>${escapeAuthHtml(user.name)}</strong> <a href="#" data-action="quick-logout" style="margin-left:8px; color:#ff8533; font-size:11px; text-decoration:underline;">(Logout)</a>`;
        badge.className = "status-indicator online";
        
        const logoutLink = badge.querySelector("[data-action='quick-logout']");
        if (logoutLink) {
            logoutLink.onclick = (e) => {
                e.preventDefault();
                DB.logout();
                updateStatusBadge();
            };
        }
    } else {
        badge.innerHTML = `<span class="dot offline-dot"></span> Guest Mode <a href="login.html" style="margin-left:8px; color:var(--accent); font-size:11px; text-decoration:underline;">Log in</a>`;
        badge.className = "status-indicator offline";
    }
}

function escapeAuthHtml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
