# dev.lehm - Developer Portfolio & Student Portal

A modern, glassmorphic Developer Portfolio website featuring a live, fully functional **Student Record Management System** built with pure HTML5, CSS3, and JavaScript (ES6+).

---

## 🌟 Key Features

### 1. Developer Portfolio (`index.html`)
- **Hero Section**: Personal branding, developer introduction, and quick statistics.
- **About & Tech Stack**: Interactive skill tags covering Frontend (HTML5, CSS3, ES6+), Backend (PHP, MySQL), and Tooling.
- **Interactive Student System Showcase**: Live embedded application module with full CRUD and search capabilities.
- **Projects Showcase**: Highlighting key software components (Student Portal, Password Policy Engine, Glassmorphism Design System).
- **Visual Gallery**: Responsive photo grid with hover neon glow and high-resolution Lightbox modal viewer.
- **Contact Section**: Glassmorphic form with real-time feedback.
- **Live Status Badge**: Fixed bottom-left indicator displaying current session state.

### 2. Student Record Management System ("The Student Something")
- **Add Student**: Form with field validation and immediate roster update.
- **Edit Student**: Inline pre-fill with dynamic `Save Changess` and `Cancel` controls.
- **Delete Student**: Safe deletion with user confirmation prompt.
- **Real-Time Live Search**: Instant filtering by student name or course as you type.
- **Zero-Config Persistence**: Powered by client-side `LocalStorage` (`assets/js/db.js`), pre-seeded with sample records (Maria Santos, John Reyes, Ana Cruz, Luis Garcia).
- **Restore Sample Records**: Single-click button to reset mock records anytime.

### 3. Authentication & Security Engine
- **Sign Up (`signup.html`)**: Real-time 6-point password strength checklist:
  - Starts with an uppercase letter
  - Minimum 8 characters, maximum 72 characters
  - Contains a lowercase letter
  - Contains a number
  - Contains a special character
  - No spaces
- **Log In (`login.html`)**: Secure credential verification with password show/hide toggle and pre-configured Demo Account auto-fill.
- **Session Management**: Dynamic status badge ("Logged in as Maria Santos" with glowing orange neon dot and pulse effect).

---

## 📁 Project Structure

```text
dev.lehm/
├── index.html                  # Main Developer Portfolio & Live Student App
├── student-portal.html         # Standalone full-page Student Portal dashboard
├── login.html                  # Standalone client-side Login page
├── signup.html                 # Standalone Sign Up page with 6-rule password meter
├── index.php                   # Entry point redirecting to index.html
├── README.md                   # Project documentation
│
├── assets/
│   ├── css/
│   │   ├── style.css           # Core dark glassmorphism & table styles
│   │   ├── portfolio.css       # Portfolio sections, hero, lightbox & cards
│   │   ├── auth.css            # Authentication form styling & password checklist
│   │   └── landing.css         # Legacy landing page stylesheet
│   ├── js/
│   │   ├── db.js               # LocalStorage database & mock API engine
│   │   ├── student-portal.js   # Student CRUD, real-time search & table controller
│   │   ├── auth.js             # Session state, login/signup handlers & password rules
│   │   ├── portfolio.js        # Lightbox modal, contact form & portfolio UI
│   │   └── script.js           # UX helpers & confirmation listeners
│   └── img/
│       ├── 1.jpg, 2.jpg, 3.jpg, 4.jpg
│
├── auth/                       # [Legacy PHP] Original PHP authentication scripts
│   ├── login.php
│   ├── logout.php
│   └── signup.php
├── conn/                       # [Legacy PHP] MySQL database connection
│   └── conn.php
├── database/                   # [Legacy DB] SQL schema definition
│   └── reg.sql
└── public/                     # [Legacy PHP] Original PHP student portal pages
    ├── index.php
    └── landing-page.php
```

---

## 🚀 How to Run

### Option 1: Direct in Browser (No Server Required)
Simply double-click **`index.html`** or drag it into any web browser (Chrome, Edge, Firefox, Safari).

### Option 2: Via XAMPP / Local Web Server
1. Ensure the folder is located at `C:\xampp\htdocs\dev.lehm`.
2. Start Apache in the XAMPP Control Panel.
3. Open your browser and navigate to:
   ```
   http://localhost/dev.lehm/
   ```
