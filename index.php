<?php
// =====================================================
// BukuKas Universal — Main Entry Point
// Redirects to login if not authenticated, else loads app
// =====================================================
require_once __DIR__ . '/config/app.php';

if (empty($_SESSION['user_id'])) {
    header('Location: login.php');
    exit;
}

// User is logged in — load the SPA
// Check if admin tries to go to /admin/
$db   = getDB();
$stmt = $db->prepare('SELECT role, is_active FROM users WHERE id = ?');
$stmt->execute([$_SESSION['user_id']]);
$user = $stmt->fetch();

if (!$user || !$user['is_active']) {
    session_destroy();
    header('Location: login.php?err=session');
    exit;
}

// Serve the SPA (app.php)
include __DIR__ . '/app.php';
