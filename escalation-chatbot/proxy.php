<?php

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Upstream-Url');
header('Access-Control-Max-Age: 86400');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$upstream = $_SERVER['HTTP_X_UPSTREAM_URL'] ?? '';
if (!$upstream || !preg_match('#^https?://#i', $upstream)) {
    http_response_code(400);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Missing or invalid X-Upstream-Url header']);
    exit;
}

$body = file_get_contents('php://input');
$auth = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
$contentType = $_SERVER['CONTENT_TYPE'] ?? 'application/json';

$ch = curl_init($upstream);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HEADER => false,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_TIMEOUT => 120,
    CURLOPT_CONNECTTIMEOUT => 15,
    CURLOPT_SSL_VERIFYPEER => false,
    CURLOPT_SSL_VERIFYHOST => 0,
    CURLOPT_CUSTOMREQUEST => $_SERVER['REQUEST_METHOD'],
    CURLOPT_POSTFIELDS => $body,
    CURLOPT_HTTPHEADER => array_filter([
        'Content-Type: ' . $contentType,
        $auth ? 'Authorization: ' . $auth : null,
        'Accept: application/json'
    ])
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlErr = curl_error($ch);
curl_close($ch);

if ($response === false) {
    http_response_code(502);
    header('Content-Type: application/json');
    echo json_encode([
        'error' => 'Upstream connection failed',
        'detail' => $curlErr,
        'upstream' => $upstream
    ]);
    exit;
}

http_response_code($httpCode ?: 200);
header('Content-Type: application/json');
echo $response;
