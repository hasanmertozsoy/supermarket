<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/src/CimriScraper.php';
require_once __DIR__ . '/src/CimriAPI.php';

try {
    // API parametrelerini al
    $query = $_GET['q'] ?? '';
    $sort = $_GET['sort'] ?? '';
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;

    // Parametreleri kontrol et
    if (empty($query)) {
        throw new Exception('Arama sorgusu belirtilmedi.');
    }

    if ($page < 1) {
        throw new Exception('Geçersiz sayfa numarası.');
    }

    // Scraper ve API sınıflarını başlat
    $scraper = new CimriScraper();
    $api = new CimriAPI();

    // Ürünleri getir
    $products = $scraper->getProducts($query, $sort, $page);
    $totalPages = $scraper->getTotalPages();

    // Yanıtı formatla
    $response = $api->formatResponse($products, $page, $totalPages);

    // JSON olarak döndür
    echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

} catch (Exception $e) {
    // Hata durumunda
    $api = new CimriAPI();
    echo json_encode($api->errorResponse($e->getMessage()), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
}
?>
