<?php

class CimriAPI {
    private $logoBaseUrl = 'https://cdn.cimri.io/pictures/merchant-logos/';
    private $imageBaseUrl = 'https://cdn.cimri.io/market/';
    private $imageSizes = [
        'sm' => '100x100',
        'md' => '240x240',
        'lg' => '500x500'
    ];

    public function getLogoUrl($merchantId) {
        return '/logo.php?id=' . $merchantId;
    }

    public function getImageUrl($imagePath, $size = 'md') {
        // Resim adını al
        $fileName = basename($imagePath);

        // Dosya adını ve uzantısını ayır
        $pathInfo = pathinfo($fileName);
        $baseName = $pathInfo['filename'];
        $extension = $pathInfo['extension'];

        return '/image.php?file=' . urlencode($baseName) . '.' . $extension . '&size=' . urlencode($size);
    }

    public function formatResponse($products, $currentPage, $totalPages) {
        $formattedProducts = [];
        foreach ($products as $product) {
            $merchantId = isset($product['topOffers'][0]['merchantId']) ? $product['topOffers'][0]['merchantId'] : null;
            $image = isset($product['image']) ? $product['image'] : null;

            // URL'yi parse et ve sadece path kısmını al
            $path = '';
            if (isset($product['url'])) {
                $urlParts = parse_url($product['url']);
                if (isset($urlParts['path'])) {
                    // /market/ kısmını kaldır
                    $path = ltrim($urlParts['path'], '/market/');
                }
            }

            $formattedProduct = [
                'id' => $product['id'],
                'name' => $product['name'],
                'brand' => $product['brand'],
                'price' => $product['price'],
                'unit_price' => $product['unit_price'],
                'quantity' => $product['quantity'],
                'unit' => $product['unit'],
                'merchant_id' => $merchantId,
                'merchant_logo' => $merchantId ? $this->getLogoUrl($merchantId) : null,
                'image' => $image ? $this->getImageUrl($image) : null,
                'url' => !empty($path) ? '/product.php?path=' . urlencode($path) : null
            ];
            $formattedProducts[] = $formattedProduct;
        }

        return [
            'success' => true,
            'timestamp' => date('Y-m-d H:i:s'),
            'pagination' => [
                'current_page' => (int)$currentPage,
                'total_pages' => (int)$totalPages,
                'has_next' => $currentPage < $totalPages,
                'has_previous' => $currentPage > 1
            ],
            'total' => count($formattedProducts),
            'products' => $formattedProducts
        ];
    }

    public function fetchLogo($merchantId) {
        $logoUrl = $this->logoBaseUrl . $merchantId . '.png';
        return $this->fetchImage($logoUrl);
    }

    public function fetchProductImage($fileName, $size = 'md') {
        // Dosya adı ve uzantıyı ayır
        $pathInfo = pathinfo($fileName);
        $baseName = $pathInfo['filename'];
        $extension = $pathInfo['extension'];

        // Boyut kontrolü
        if (!isset($this->imageSizes[$size])) {
            $size = 'md'; // Varsayılan boyut
        }

        $imageUrl = $this->imageBaseUrl . $this->imageSizes[$size] . '/' . $baseName . '.' . $extension;
        return $this->fetchImage($imageUrl);
    }

    private function fetchImage($url) {
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_USERAGENT => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
        curl_close($ch);

        if ($httpCode !== 200) {
            return null;
        }

        return [
            'content' => $response,
            'type' => $contentType
        ];
    }

    public function formatProductResponse($product) {
        return [
            'success' => true,
            'timestamp' => date('Y-m-d H:i:s'),
            'product' => [
                'id' => $product['id'],
                'name' => $product['name'],
                'description' => $product['description'],
                'specs' => $product['specs'],
                'price_history' => $product['priceHistory'],
                'offers' => array_map(function($offer) {
                    return [
                        'merchant_id' => $offer['merchantId'],
                        'merchant_name' => $offer['merchantName'],
                        'merchant_logo' => $this->getLogoUrl($offer['merchantId']),
                        'price' => $offer['price'],
                        'unit_price' => $offer['unitPrice']
                    ];
                }, $product['offers'])
            ]
        ];
    }

    public function errorResponse($message) {
        return [
            'success' => false,
            'timestamp' => date('Y-m-d H:i:s'),
            'error' => $message
        ];
    }
}
