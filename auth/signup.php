<?php
session_start();
include '../conn/conn.php';

/**
 * Password rules (keep in sync with assets/js/auth.js):
 *  - starts with an uppercase letter
 *  - 8 to 72 characters
 *  - has a lowercase letter, a number and a special character
 *  - no spaces
 * Returns a list of the rules that were NOT met.
 */
function password_problems(string $pw): array {
    $problems = [];
    if (!preg_match('/^[A-Z]/', $pw))            $problems[] = "start with an uppercase letter";
    if (strlen($pw) < 8)                          $problems[] = "be at least 8 characters";
    if (strlen($pw) > 72)                         $problems[] = "be 72 characters or fewer";
    if (!preg_match('/[a-z]/', $pw))              $problems[] = "include a lowercase letter";
    if (!preg_match('/[0-9]/', $pw))              $problems[] = "include a number";
    if (!preg_match('/[^A-Za-z0-9\s]/', $pw))     $problems[] = "include a special character (like ! @ # $ %)";
    if (preg_match('/\s/', $pw))                  $problems[] = "not contain spaces";
    return $problems;
}

if (isset($_SESSION['user_id'])) {
    header("Location: ../public/index.php");
    exit();
}

$error = "";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $raw_password = $_POST['password'] ?? '';

    if ($name === '' || $email === '' || $raw_password === '') {
        $error = "Please fill in all fields.";
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error = "Invalid email format.";
    } elseif ($problems = password_problems($raw_password)) {
        $error = "Your password must " . implode(", ", $problems) . ".";
    } else {
        $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $stmt->store_result();

        if ($stmt->num_rows > 0) {
            $error = "An account with this email already exists.";
        } else {
            $hashed_password = password_hash($raw_password, PASSWORD_DEFAULT);
            $insert = $conn->prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)");
            $insert->bind_param("sss", $name, $email, $hashed_password);

            if ($insert->execute()) {
                header("Location: login.php?registered=1");
                exit();
            }
            $error = "Could not create account. Please try again.";
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Sign Up - Student Portal</title>
    <link rel="stylesheet" href="../assets/css/auth.css">
</head>
<body>
<main class="auth">
    <a href="../public/landing-page.php" class="brand">Student Portal</a>
    <h1>Create your account</h1>
    <p class="sub">It only takes a few seconds.</p>

    <?php if ($error): ?><div class="msg error"><?= htmlspecialchars($error) ?></div><?php endif; ?>

    <!-- action must be signup.php (it used to post to login.php) -->
    <form action="signup.php" method="POST" data-auth-form>
        <div class="field">
            <label for="name">Full name</label>
            <input type="text" id="name" name="name" placeholder="Maria Santos"
                   autocomplete="name" required autofocus
                   value="<?= htmlspecialchars($_POST['name'] ?? '') ?>">
        </div>
        <div class="field">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" placeholder="you@example.com"
                   autocomplete="email" required
                   value="<?= htmlspecialchars($_POST['email'] ?? '') ?>">
        </div>
        <div class="field">
            <label for="password">Password</label>
            <div class="pw">
                <input type="password" id="password" name="password" placeholder="Create a password"
                       autocomplete="new-password" required minlength="8" maxlength="72">
                <button type="button" class="pw-toggle" aria-label="Show password">Show</button>
            </div>
            <ul class="rules" id="pwRules">
                <li data-rule="upper">Starts with an uppercase letter</li>
                <li data-rule="length">At least 8 characters</li>
                <li data-rule="lower">Has a lowercase letter</li>
                <li data-rule="number">Has a number</li>
                <li data-rule="special">Has a special character</li>
                <li data-rule="space">No spaces</li>
            </ul>
        </div>
        <button type="submit" class="submit">Create account</button>
    </form>

    <p class="link-text">Already have an account? <a href="login.php">Log in</a></p>
</main>
<div class="status-indicator" id="authStatus" data-logged-in="false"></div>
<script src="../assets/js/auth.js"></script>
</body>
</html>