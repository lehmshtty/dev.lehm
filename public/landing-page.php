<?php
session_start();
$loggedIn = isset($_SESSION['user_id']);
$userName = $_SESSION['user_name'] ?? '';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Student Portal</title>
    <link rel="stylesheet" href="../assets/css/landing.css">
</head>
<body>

<header class="nav">
    <a href="landing-page.php" class="brand">Student Portal</a>
    <nav class="nav-links">
        <?php if ($loggedIn): ?>
            <a href="index.php">Dashboard</a>
            <a href="../auth/logout.php">Log out</a>
        <?php else: ?>
            <a href="../auth/login.php">Log in</a>
        <?php endif; ?>
    </nav>
</header>

<main class="hero">
    <div>
        <h1>Student records, kept simple.</h1>
        <p>Add students, update their courses and find anyone in seconds, all in one place.</p>
        <div class="actions">
            <?php if ($loggedIn): ?>
                <a href="index.php" class="btn btn-primary">Open dashboard</a>
            <?php else: ?>
                <a href="../auth/signup.php" class="btn btn-primary">Create account</a>
                <a href="../auth/login.php" class="btn btn-ghost">Log in</a>
            <?php endif; ?>
        </div>
    </div>

    <div class="preview" aria-label="Sample student list">
        <div class="preview-title">Sample records</div>
        <table>
            <tr><th>ID</th><th>Name</th><th>Course</th></tr>
            <tr><td>1</td><td>Maria Santos</td><td>BS Information Technology</td></tr>
            <tr><td>2</td><td>John Reyes</td><td>BS Computer Science</td></tr>
            <tr><td>3</td><td>Ana Cruz</td><td>BS Nursing</td></tr>
            <tr><td>4</td><td>Luis Garcia</td><td>BS Education</td></tr>
        </table>
    </div>
</main>

<div class="status-indicator" id="authStatus"
     data-logged-in="<?= $loggedIn ? 'true' : 'false' ?>"
     data-user="<?= htmlspecialchars($userName) ?>"
     data-welcome="0"></div>

<?php if ($loggedIn): ?>
    <script src="../assets/js/script.js"></script>
<?php else: ?>
    <script src="../assets/js/auth.js"></script>
<?php endif; ?>
</body>
</html>