<?php
session_start();
session_destroy();
header("Location: ../public/landing-page.php");
exit();
?>