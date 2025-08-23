<?php

require_once __DIR__ . '/src/CimriAPI.php';

// CORS başlıklarını ekle
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

// Parametreleri al
$fileName = isset($_GET['file']) ? $_GET['file'] : null;
$size = isset($_GET['size']) ? $_GET['size'] : 'md';

if (!$fileName) {
    header('HTTP/1.1 400 Bad Request');
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Dosya adı gerekli']);
    exit;
}

$api = new CimriAPI();
$image = $api->fetchProductImage($fileName, $size);

if (!$image) {
    header('HTTP/1.1 404 Not Found');
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Resim bulunamadı']);
    exit;
}

// Resim başlıklarını ayarla
header('Content-Type: ' . $image['type']);
header('Cache-Control: public, max-age=86400'); // 24 saat önbelleğe al

// Resmi döndür
echo $image['content'];
