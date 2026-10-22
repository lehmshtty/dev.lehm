/**
 * db.js - Client-Side Storage & State Management
 * Replaces MySQL database and PHP sessions using browser LocalStorage.
 * Keeps all original student management and auth features fully functional.
 */

const DB = (() => {
    const STORAGE_KEY_STUDENTS = 'dev_students_records';
    const STORAGE_KEY_USERS = 'dev_registered_users';
    const STORAGE_KEY_SESSION = 'dev_current_session';

    // Default Seed Students (matching the original PHP database and landing page)
    const DEFAULT_STUDENTS = [
        { id: 1, name: "Maria Santos", course: "BS Information Technology" },
        { id: 2, name: "John Reyes", course: "BS Computer Science" },
        { id: 3, name: "Ana Cruz", course: "BS Nursing" },
        { id: 4, name: "Luis Garcia", course: "BS Education" }
    ];

    // Default Seed Users for testing
    const DEFAULT_USERS = [
        {
            id: 1,
            name: "Maria Santos",
            email: "maria@example.com",
            password: "Password123!"
        },
        {
            id: 2,
            name: "Dev Lehm",
            email: "lehm@example.com",
            password: "Password2026!"
        }
    ];

    // Initializer
    function init() {
        if (!localStorage.getItem(STORAGE_KEY_STUDENTS)) {
            localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(DEFAULT_STUDENTS));
        }
        if (!localStorage.getItem(STORAGE_KEY_USERS)) {
            localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(DEFAULT_USERS));
        }
        // Auto-login Maria Santos by default if no session exists so the user immediately sees the dashboard active
        if (!localStorage.getItem(STORAGE_KEY_SESSION)) {
            localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify({
                id: 1,
                name: "Maria Santos",
                email: "maria@example.com"
            }));
        }
    }

    init();

    // ================= STUDENT CRUD OPERATIONS ================= //

    function getStudents(query = "") {
        try {
            const raw = localStorage.getItem(STORAGE_KEY_STUDENTS);
            const list = raw ? JSON.parse(raw) : [...DEFAULT_STUDENTS];
            if (!query || query.trim() === "") {
                return list.sort((a, b) => b.id - a.id);
            }
            const clean = query.trim().toLowerCase();
            return list
                .filter(s => s.name.toLowerCase().includes(clean) || s.course.toLowerCase().includes(clean))
                .sort((a, b) => b.id - a.id);
        } catch (e) {
            console.error("Failed to load students", e);
            return [];
        }
    }

    function getStudentById(id) {
        const students = getStudents();
        return students.find(s => s.id === Number(id)) || null;
    }

    function addStudent(name, course) {
        if (!name || !course) throw new Error("Name and Course are required.");
        const students = getStudents();
        const maxId = students.reduce((max, s) => Math.max(max, s.id || 0), 0);
        const newStudent = {
            id: maxId + 1,
            name: name.trim(),
            course: course.trim()
        };
        students.push(newStudent);
        localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));
        triggerStudentEvent();
        return newStudent;
    }

    function updateStudent(id, name, course) {
        if (!name || !course) throw new Error("Name and Course are required.");
        const numId = Number(id);
        const students = getStudents();
        const index = students.findIndex(s => s.id === numId);
        if (index === -1) throw new Error("Student not found.");

        students[index].name = name.trim();
        students[index].course = course.trim();
        localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));
        triggerStudentEvent();
        return students[index];
    }

    function deleteStudent(id) {
        const numId = Number(id);
        let students = getStudents();
        const initialCount = students.length;
        students = students.filter(s => s.id !== numId);
        if (students.length === initialCount) {
            return false;
        }
        localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));
        triggerStudentEvent();
        return true;
    }

    function resetStudentsToDefault() {
        localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(DEFAULT_STUDENTS));
        triggerStudentEvent();
        return DEFAULT_STUDENTS;
    }

    // ================= AUTH & USER MANAGEMENT ================= //

    function getUsers() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY_USERS);
            return raw ? JSON.parse(raw) : [...DEFAULT_USERS];
        } catch {
            return [];
        }
    }

    function getCurrentUser() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY_SESSION);
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    }

    function login(email, password) {
        const users = getUsers();
        const cleanEmail = (email || '').trim().toLowerCase();
        const user = users.find(u => u.email.toLowerCase() === cleanEmail && u.password === password);
        
        if (!user) {
            return { success: false, message: "Invalid email or password." };
        }

        const sessionUser = {
            id: user.id,
            name: user.name,
            email: user.email
        };
        localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(sessionUser));
        triggerAuthEvent();
        return { success: true, user: sessionUser };
    }

    function signup(name, email, password) {
        const cleanName = (name || '').trim();
        const cleanEmail = (email || '').trim().toLowerCase();

        if (!cleanName || !cleanEmail || !password) {
            return { success: false, message: "Please fill in all fields." };
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(cleanEmail)) {
            return { success: false, message: "Invalid email format." };
        }

        // Validate password rules (same rules as original signup.php)
        const problems = validatePassword(password);
        if (problems.length > 0) {
            return { success: false, message: "Password must " + problems.join(", ") + "." };
        }

        const users = getUsers();
        if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
            return { success: false, message: "An account with this email already exists." };
        }

        const maxId = users.reduce((max, u) => Math.max(max, u.id || 0), 0);
        const newUser = {
            id: maxId + 1,
            name: cleanName,
            email: cleanEmail,
            password: password
        };
        users.push(newUser);
        localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));

        return { success: true, message: "Account created successfully! You can now log in." };
    }

    function logout() {
        localStorage.removeItem(STORAGE_KEY_SESSION);
        triggerAuthEvent();
    }

    function validatePassword(pw) {
        const problems = [];
        if (!/^[A-Z]/.test(pw)) problems.push("start with an uppercase letter");
        if (pw.length < 8) problems.push("be at least 8 characters");
        if (pw.length > 72) problems.push("be 72 characters or fewer");
        if (!/[a-z]/.test(pw)) problems.push("include a lowercase letter");
        if (!/[0-9]/.test(pw)) problems.push("include a number");
        if (!/[^A-Za-z0-9\s]/.test(pw)) problems.push("include a special character");
        if (/\s/.test(pw)) problems.push("not contain spaces");
        return problems;
    }

    // ================= EVENT BUS ================= //
    function triggerStudentEvent() {
        window.dispatchEvent(new CustomEvent('db:studentsChanged'));
    }

    function triggerAuthEvent() {
        window.dispatchEvent(new CustomEvent('db:authChanged', { detail: getCurrentUser() }));
    }

    return {
        getStudents,
        getStudentById,
        addStudent,
        updateStudent,
        deleteStudent,
        resetStudentsToDefault,
        getUsers,
        getCurrentUser,
        login,
        signup,
        logout,
        validatePassword
    };
})();

