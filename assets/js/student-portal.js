/**
 * student-portal.js
 * Handles student management UI interactions (Add, Edit, Delete, Search, Reset)
 * Synchronizes with DB (LocalStorage)
 */

document.addEventListener("DOMContentLoaded", () => {
    initStudentPortal();
});

function initStudentPortal() {
    const tableBody = document.getElementById("studentTableBody") || document.querySelector("table tbody") || document.querySelector("table");
    const form = document.getElementById("studentForm");
    const searchForm = document.getElementById("searchForm");
    const searchInput = document.getElementById("searchInput");
    const resetSearchBtn = document.getElementById("resetSearchBtn");
    const countBadge = document.getElementById("studentCount");
    const formTitle = document.getElementById("formTitle");
    const submitBtn = document.getElementById("formSubmitBtn");
    const cancelBtn = document.getElementById("formCancelBtn");
    const idInput = document.getElementById("studentId");
    const nameInput = document.getElementById("studentName");
    const courseInput = document.getElementById("studentCourse");
    const toast = document.getElementById("portalToast");

    let currentSearch = "";

    function showToast(message, type = "success") {
        if (!toast) return;
        toast.textContent = message;
        toast.className = `portal-toast show ${type}`;
        setTimeout(() => {
            toast.className = "portal-toast";
        }, 3200);
    }

    // Render Student Table Rows
    function renderTable() {
        if (!tableBody) return;
        const students = DB.getStudents(currentSearch);

        if (countBadge) {
            countBadge.textContent = `${students.length} record${students.length === 1 ? '' : 's'}`;
        }

        // If the table has a header row, we should preserve it or render rows into tbody
        let target = tableBody;
        let hasHeaderInTarget = false;

        if (tableBody.tagName === 'TABLE') {
            let tbody = tableBody.querySelector("tbody");
            if (!tbody) {
                // If table doesn't have tbody, check header
                const header = tableBody.querySelector("tr");
                const rows = Array.from(tableBody.querySelectorAll("tr"));
                // Remove all rows except the first header row
                for (let i = 1; i < rows.length; i++) {
                    rows[i].remove();
                }
                hasHeaderInTarget = true;
            } else {
                target = tbody;
                target.innerHTML = "";
            }
        } else {
            target.innerHTML = "";
        }

        if (students.length === 0) {
            const emptyTr = document.createElement("tr");
            emptyTr.className = "empty-row";
            emptyTr.innerHTML = `
                <td colspan="4" class="empty">
                    ${currentSearch ? `No students match "${escapeHtml(currentSearch)}".` : 'No students found. Add your first student above!'}
                </td>
            `;
            target.appendChild(emptyTr);
            return;
        }

        students.forEach(student => {
            const tr = document.createElement("tr");
            tr.dataset.id = student.id;
            tr.innerHTML = `
                <td class="id">#${student.id}</td>
                <td class="student-name"><strong>${escapeHtml(student.name)}</strong></td>
                <td class="student-course"><span class="course-badge">${escapeHtml(student.course)}</span></td>
                <td class="actions">
                    <button type="button" class="action-btn edit-btn" data-edit-id="${student.id}" title="Edit this student">Edit</button>
                    <button type="button" class="action-btn delete-btn" data-delete-id="${student.id}" title="Delete this student">Delete</button>
                </td>
            `;
            target.appendChild(tr);
        });

        attachActionListeners();
    }

    function attachActionListeners() {
        document.querySelectorAll("[data-edit-id]").forEach(btn => {
            btn.onclick = () => {
                const id = btn.getAttribute("data-edit-id");
                startEdit(id);
            };
        });

        document.querySelectorAll("[data-delete-id]").forEach(btn => {
            btn.onclick = () => {
                const id = btn.getAttribute("data-delete-id");
                const student = DB.getStudentById(id);
                const studentName = student ? student.name : `Student #${id}`;
                if (confirm(`Are you sure you want to delete ${studentName}?`)) {
                    DB.deleteStudent(id);
                    showToast(`Deleted ${studentName} successfully.`, "info");
                    // If we were editing this student, cancel edit mode
                    if (idInput && idInput.value == id) {
                        resetForm();
                    }
                }
            };
        });
    }

    function startEdit(id) {
        const student = DB.getStudentById(id);
        if (!student) return;

        if (idInput) idInput.value = student.id;
        if (nameInput) {
            nameInput.value = student.name;
            nameInput.focus();
        }
        if (courseInput) courseInput.value = student.course;

        if (formTitle) formTitle.textContent = `Edit Student: ${student.name}`;
        if (submitBtn) submitBtn.textContent = "Save Changes";
        if (cancelBtn) cancelBtn.style.display = "inline-flex";

        // Smooth scroll to the form
        if (form) {
            form.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }

    function resetForm() {
        if (form) form.reset();
        if (idInput) idInput.value = "";
        if (formTitle) formTitle.textContent = "Add a Student";
        if (submitBtn) submitBtn.textContent = "Add Student";
        if (cancelBtn) cancelBtn.style.display = "none";
    }

    // Form Submit (Add or Update)
    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            const id = idInput ? idInput.value : "";
            const name = nameInput ? nameInput.value.trim() : "";
            const course = courseInput ? courseInput.value.trim() : "";

            if (!name || !course) {
                alert("Please fill in both name and course.");
                return;
            }

            try {
                if (id) {
                    // Update
                    DB.updateStudent(id, name, course);
                    showToast(`Updated "${name}" successfully!`, "success");
                } else {
                    // Add
                    DB.addStudent(name, course);
                    showToast(`Added "${name}" to student list!`, "success");
                }
                resetForm();
            } catch (err) {
                alert(err.message || "Operation failed.");
            }
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener("click", (e) => {
            e.preventDefault();
            resetForm();
        });
    }

    // Search handler
    if (searchInput) {
        searchInput.addEventListener("input", () => {
            currentSearch = searchInput.value;
            renderTable();
            if (resetSearchBtn) {
                resetSearchBtn.style.display = currentSearch ? "inline-flex" : "none";
            }
        });
    }

    if (searchForm) {
        searchForm.addEventListener("submit", (e) => {
            e.preventDefault();
            if (searchInput) currentSearch = searchInput.value;
            renderTable();
            if (resetSearchBtn) {
                resetSearchBtn.style.display = currentSearch ? "inline-flex" : "none";
            }
        });
    }

    if (resetSearchBtn) {
        resetSearchBtn.addEventListener("click", (e) => {
            e.preventDefault();
            if (searchInput) searchInput.value = "";
            currentSearch = "";
            resetSearchBtn.style.display = "none";
            renderTable();
        });
    }

    // Reset to initial demo records button
    const seedResetBtn = document.getElementById("seedResetBtn");
    if (seedResetBtn) {
        seedResetBtn.addEventListener("click", () => {
            if (confirm("Reset student list to default sample records?")) {
                DB.resetStudentsToDefault();
                showToast("Sample student records restored!", "info");
            }
        });
    }

    // Listen to changes in DB
    window.addEventListener("db:studentsChanged", () => {
        renderTable();
    });

    // Helper: Escape HTML
    function escapeHtml(str) {
        if (!str) return "";
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Initial table render
    renderTable();
}

