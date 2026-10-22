<?php
$conn = new mysqli("localhost", "root", "", "reg");

// Check connection
if ($conn->connect_error) {
    die("Database Connection Failed: " . $conn->connect_error);
}
$conn->set_charset("utf8mb4");