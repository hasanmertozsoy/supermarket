<?php

require_once __DIR__ . '/src/CimriAPI.php';

// CORS başlıklarını ekle
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

// Merchant ID'yi al
$merchantId = isset($_GET['id']) ? $_GET['id'] : null;

if (!$merchantId) {
    header('HTTP/1.1 400 Bad Request');
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Merchant ID gerekli']);
    exit;
}

$api = new CimriAPI();
$logo = $api->fetchLogo($merchantId);

if (!$logo) {
    header('HTTP/1.1 404 Not Found');
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Logo bulunamadı']);
    exit;
}

// Resim başlıklarını ayarla
header('Content-Type: ' . $logo['type']);
header('Cache-Control: public, max-age=86400'); // 24 saat önbelleğe al

// Resmi döndür
echo $logo['content'];
