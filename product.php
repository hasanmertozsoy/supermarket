<?php
require_once __DIR__ . '/src/CimriAPI.php';
require_once __DIR__ . '/src/CimriScraper.php';

// CORS başlıklarını ekle
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

try {
    // URL'den path parametresini al
    $path = isset($_GET['path']) ? $_GET['path'] : '';

    if (empty($path)) {
        throw new Exception('Ürün yolu belirtilmedi.');
    }

    $scraper = new CimriScraper();
    $product = $scraper->getProductDetails($path);

    $api = new CimriAPI();
    echo json_encode($api->formatProductResponse($product));
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
}
