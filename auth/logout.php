<?php
session_start();
$_SESSION = [];
session_destroy();
header("Location: ../auth/login.php?loggedout=1");
exit();