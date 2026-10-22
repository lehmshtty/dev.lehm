<?php
session_start();
include '../conn/conn.php';

// Already logged in? Go straight to the portal.
if (isset($_SESSION['user_id'])) {
    header("Location: ../public/index.php");
    exit();
}

$error = "";
$notice = "";
if (isset($_GET['registered']))      $notice = "Account created! You can log in now.";
elseif (isset($_GET['loggedout']))   $notice = "You have been logged out.";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email'] ?? '');
    $raw_password = $_POST['password'] ?? '';

    if ($email !== '' && $raw_password !== '') {
        $stmt = $conn->prepare("SELECT id, name, password FROM users WHERE email = ?");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $row = $stmt->get_result()->fetch_assoc();

        if ($row && password_verify($raw_password, $row['password'])) {
            session_regenerate_id(true);
            $_SESSION['user_id'] = $row['id'];
            $_SESSION['user_name'] = $row['name'];
            header("Location: ../public/index.php?welcome=1");
            exit();
        }
        // Same message for both cases so attackers can't tell which emails exist
        $error = "Invalid email or password.";
    } else {
        $error = "Please fill in all fields.";
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Log in</title>
    <link rel="stylesheet" href="../assets/css/auth.css">
</head>
<body>
<main class="auth">
    <a href="../public/landing-page.php" class="brand">Student Portal</a>
    <h1>Welcome back</h1>
    <p class="sub">Log in to manage your students.</p>

    <?php if ($error): ?><div class="msg error"><?= htmlspecialchars($error) ?></div><?php endif; ?>
    <?php if ($notice): ?><div class="msg success"><?= htmlspecialchars($notice) ?></div><?php endif; ?>

    <form action="login.php" method="POST" data-auth-form>
        <div class="field">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" placeholder="you@example.com"
                   autocomplete="email" required autofocus
                   value="<?= htmlspecialchars($_POST['email'] ?? '') ?>">
        </div>
        <div class="field">
            <label for="password">Password</label>
            <div class="pw">
                <input type="password" id="password" name="password" placeholder="Your password"
                       autocomplete="current-password" required>
                <button type="button" class="pw-toggle" aria-label="Show password">Show</button>
            </div>
        </div>
        <button type="submit" class="submit">Log in</button>
    </form>

    <p class="link-text">New here? <a href="signup.php">Create an account</a></p>
</main>
<div class="status-indicator" id="authStatus" data-logged-in="false"></div>
<script src="../assets/js/auth.js"></script>
</body>
</html>