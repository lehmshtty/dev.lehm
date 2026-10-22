<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    header("Location: ../auth/login.php");
    exit();
}

include '../conn/conn.php';

// ADD
if (isset($_POST['add'])) {
    $stmt = $conn->prepare("INSERT INTO students (name, course) VALUES (?, ?)");
    $stmt->bind_param("ss", $_POST['name'], $_POST['course']);
    $stmt->execute();
    header("Location: index.php");
    exit();
}

// UPDATE
if (isset($_POST['update'])) {
    $id = (int)$_POST['id'];
    $stmt = $conn->prepare("UPDATE students SET name=?, course=? WHERE id=?");
    $stmt->bind_param("ssi", $_POST['name'], $_POST['course'], $id);
    $stmt->execute();
    header("Location: index.php");
    exit();
}

// DELETE (now POST instead of a GET link, so a random URL can't delete records)
if (isset($_POST['delete'])) {
    $id = (int)$_POST['id'];
    $stmt = $conn->prepare("DELETE FROM students WHERE id=?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    header("Location: index.php");
    exit();
}

// EDIT (load row into the form)
$edit = null;
if (isset($_GET['edit'])) {
    $id = (int)$_GET['edit'];
    $stmt = $conn->prepare("SELECT * FROM students WHERE id=?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $edit = $stmt->get_result()->fetch_assoc();
}

// SEARCH
$search = trim($_GET['search'] ?? '');
if ($search !== '') {
    $like = "%$search%";
    $stmt = $conn->prepare("SELECT * FROM students WHERE name LIKE ? OR course LIKE ? ORDER BY id DESC");
    $stmt->bind_param("ss", $like, $like);
    $stmt->execute();
    $result = $stmt->get_result();
} else {
    $result = $conn->query("SELECT * FROM students ORDER BY id DESC");
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Student Portal</title>
    <link rel="stylesheet" href="../assets/css/style.css?v=<?= @filemtime(__DIR__ . '/../assets/css/style.css') ?: time() ?>">
</head>
<body>

<!-- ADDED: navigation bar -->
<nav class="navbar">
    <a href="index.php" class="brand">Student Portal</a>
    <ul>
        <li><a href="../public/landing-page.php">Home</a></li>
        <li><a href="index.php">Students</a></li>
        <li><a href="#gallery">Gallery</a></li>
    </ul>
</nav>

<a href="../auth/logout.php" class="butt">Log out</a>

<main class="page">
    <h1>Hello, <?= htmlspecialchars($_SESSION['user_name']) ?></h1>
    <p class="sub">Manage your students.</p>

    <section class="panel">
        <h2><?= $edit ? 'Edit student' : 'Add a student' ?></h2>
        <form method="POST" action="index.php" class="student-form">
            <input type="hidden" name="id" value="<?= (int)($edit['id'] ?? 0) ?>">
            <input type="text" name="name" placeholder="Name" aria-label="Name"
                   value="<?= htmlspecialchars($edit['name'] ?? '') ?>" required>
            <input type="text" name="course" placeholder="Course" aria-label="Course"
                   value="<?= htmlspecialchars($edit['course'] ?? '') ?>" required>
            <?php if ($edit): ?>
                <button type="submit" name="update">Save changes</button>
                <a href="index.php" class="cancel">Cancel</a>
            <?php else: ?>
                <button type="submit" name="add">Add student</button>
            <?php endif; ?>
        </form>
    </section>

    <section class="panel">
        <form method="GET" action="index.php" class="student-form search">
            <input type="text" name="search" placeholder="Search by name or course"
                   aria-label="Search" value="<?= htmlspecialchars($search) ?>">
            <button type="submit">Search</button>
            <?php if ($search !== ''): ?>
                <a href="index.php" class="cancel">Reset</a>
            <?php endif; ?>
        </form>

        <table>
            <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Course</th>
                <th></th>
            </tr>

            <?php if ($result && $result->num_rows > 0): ?>
                <?php while ($row = $result->fetch_assoc()): ?>
                <tr>
                    <td class="id"><?= (int)$row['id'] ?></td>
                    <td><?= htmlspecialchars($row['name']) ?></td>
                    <td><?= htmlspecialchars($row['course']) ?></td>
                    <td class="actions">
                        <a href="index.php?edit=<?= (int)$row['id'] ?>">Edit</a>
                        <form method="POST" action="index.php" class="inline-form" data-confirm="Delete this student?">
                            <input type="hidden" name="id" value="<?= (int)$row['id'] ?>">
                            <button type="submit" name="delete" class="link-btn">Delete</button>
                        </form>
                    </td>
                </tr>
                <?php endwhile; ?>
            <?php else: ?>
                <tr><td colspan="4" class="empty">
                    <?= $search !== '' ? 'No students match your search.' : 'No students yet. Add your first one above.' ?>
                </td></tr>
            <?php endif; ?>
        </table>
    </section>

    <!-- ADDED: 4 images -->
    <section class="panel" id="gallery">
        <h2>Gallery</h2>
        <div class="gallery">
            <img src="img/1.jpg" alt="Image 1">
            <img src="img/2.jpg" alt="Image 2">
            <img src="img/3.jpg" alt="Image 3">
            <img src="img/4.jpg" alt="Image 4">
        </div>
    </section>
</main>

<!-- Logged-in indicator (bottom-left), filled in by script.js -->
<div class="status-indicator" id="authStatus"
     data-logged-in="true"
     data-user="<?= htmlspecialchars($_SESSION['user_name']) ?>"
     data-welcome="<?= isset($_GET['welcome']) ? '1' : '0' ?>"></div>


<script src="../assets/js/script.js"></script>
</body>
</html>