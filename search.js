document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const sortSelect = document.getElementById('sortSelect');
    const searchButton = document.getElementById('searchButton');
    const productsContainer = document.getElementById('productsContainer');
    const resultsCount = document.getElementById('resultsCount');
    const prevPageButton = document.getElementById('prevPageButton');
    const nextPageButton = document.getElementById('nextPageButton');
    const currentPageSpan = document.getElementById('currentPageSpan');
    
    const brandFilter = document.getElementById('brandFilter');
    const priceMinFilter = document.getElementById('priceMinFilter');
    const priceMaxFilter = document.getElementById('priceMaxFilter');
    const unitPriceMinFilter = document.getElementById('unitPriceMinFilter');
    const unitPriceMaxFilter = document.getElementById('unitPriceMaxFilter');
    const applyFiltersButton = document.getElementById('applyFiltersButton');
    const resetFiltersButton = document.getElementById('resetFiltersButton');

    let currentPage = 1;
    let currentQuery = '';
    let currentSort = '';
    let totalPages = 0;
    let totalItems = 0;
    let allProducts = [];
    let availableBrands = new Set();
    
    favoritesManager.loadFavorites();
    
    const paginationContainer = document.querySelector('.pagination-container');
    if (paginationContainer) {
        paginationContainer.style.display = 'none';
    }
    
    function updateBrandOptions(products) {
        brandFilter.innerHTML = '<option value="">Tüm Markalar</option>';
        
        availableBrands.clear();
        
        products.forEach(product => {
            if (product.brand && !availableBrands.has(product.brand)) {
                availableBrands.add(product.brand);
            }
        });
        
        [...availableBrands].sort().forEach(brand => {
            const option = document.createElement('option');
            option.value = brand;
            option.textContent = brand;
            brandFilter.appendChild(option);
        });
    }

    function applyFilters() {
        if (!allProducts.length) return;
        
        const selectedBrand = brandFilter.value;
        const minPrice = priceMinFilter.value ? parseFloat(priceMinFilter.value) : 0;
        const maxPrice = priceMaxFilter.value ? parseFloat(priceMaxFilter.value) : Infinity;
        const minUnitPrice = unitPriceMinFilter.value ? parseFloat(unitPriceMinFilter.value) : 0;
        const maxUnitPrice = unitPriceMaxFilter.value ? parseFloat(unitPriceMaxFilter.value) : Infinity;
        
        const filteredProducts = allProducts.filter(product => {
            if (selectedBrand && product.brand !== selectedBrand) return false;
            
            const price = typeof product.price === 'number' ? product.price : 0;
            if (price < minPrice || price > maxPrice) return false;
            
            const unitPrice = calculateUnitPrice(product);
            if (unitPrice < minUnitPrice || unitPrice > maxUnitPrice) return false;
            
            return true;
        });
        
        let sortedProducts = [...filteredProducts];
        
        if (currentSort === 'price-asc') {
            sortedProducts.sort((a, b) => {
                const priceA = typeof a.price === 'number' ? a.price : Infinity;
                const priceB = typeof b.price === 'number' ? b.price : Infinity;
                return priceA - priceB;
            });
        } else if (currentSort === 'specUnit-asc') {
            sortedProducts.sort((a, b) => {
                const unitPriceA = calculateUnitPrice(a);
                const unitPriceB = calculateUnitPrice(b);
                
                if (unitPriceA <= 0 && unitPriceB <= 0) return 0;
                if (unitPriceA <= 0) return 1;
                if (unitPriceB <= 0) return -1;
                
                return unitPriceA - unitPriceB;
            });
        }
        
        renderProducts(sortedProducts, productsContainer);
        resultsCount.textContent = `Toplam ${sortedProducts.length}/${allProducts.length} ürün gösteriliyor.`;
    }

    function resetFilters() {
        brandFilter.value = '';
        priceMinFilter.value = '';
        priceMaxFilter.value = '';
        unitPriceMinFilter.value = '';
        unitPriceMaxFilter.value = '';
        
        renderProducts(allProducts, productsContainer);
        resultsCount.textContent = `Toplam ${allProducts.length} ürün bulundu.`;
    }

    async function fetchProducts() {
        const queryInput = searchInput.value.trim();
        const sortInput = sortSelect.value;

        if (!queryInput && !currentQuery) {
            productsContainer.innerHTML = '<p>Lütfen bir arama terimi girin.</p>';
            resultsCount.textContent = '';
            updatePaginationControls(null);
            return;
        }
        
        const queryToUse = queryInput || currentQuery;
        const sortToUse = sortInput !== undefined ? sortInput : currentSort;

        const normalizedQuery = normalizeTurkishChars(queryToUse);
        
        currentQuery = normalizedQuery; 
        currentSort = sortToUse;

        let apiUrl = `/api.php?q=${encodeURIComponent(normalizedQuery)}&page=${currentPage}`;
        
        if (currentSort === 'price-asc') {
            apiUrl += `&sort=${currentSort}`;
        }
        
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            if (data.success) {
                allProducts = data.products;
                
                updateBrandOptions(data.products);
                
                if (currentSort === 'specUnit-asc') {
                    allProducts.sort((a, b) => {
                        const unitPriceA = calculateUnitPrice(a);
                        const unitPriceB = calculateUnitPrice(b);
                        
                        if (unitPriceA <= 0 && unitPriceB <= 0) return 0;
                        if (unitPriceA <= 0) return 1;
                        if (unitPriceB <= 0) return -1;
                        
                        return unitPriceA - unitPriceB;
                    });
                }
                
                renderProducts(allProducts, productsContainer);
                
                totalPages = data.pagination?.total_pages || 1;
                totalItems = data.total || 0;
                
                if (totalPages > 1) {
                    resultsCount.textContent = `Toplam ${totalItems} ürün bulundu (${totalPages} sayfa).`;
                } else {
                    resultsCount.textContent = `Toplam ${totalItems} ürün bulundu.`;
                }
                
                updatePaginationControls(data.pagination, data.total);
            } else {
                productsContainer.innerHTML = `<p>Hata: ${data.message || 'Ürünler getirilemedi.'}</p>`;
                resultsCount.textContent = '';
                updatePaginationControls(null);
            }
        } catch (error) {
            console.error('Fetch error:', error);
            productsContainer.innerHTML = '<p>Arama sırasında bir hata oluştu. Lütfen API\'nizin çalıştığından emin olun.</p>';
            resultsCount.textContent = '';
            updatePaginationControls(null);
        }
    }

    function renderProducts(products, targetContainer) {
        if (!products || products.length === 0) {
            targetContainer.innerHTML = '<p>Aramanızla eşleşen ürün bulunamadı.</p>';
            return;
        }

        targetContainer.innerHTML = products.map(product => {
            const productId = product.id || `${product.name}-${product.merchant_name || ''}`.replace(/\s/g, '_').toLowerCase();
            const favoritedClass = favoritesManager.isFavorited(productId) ? 'favorited' : '';
            const absoluteProductImage = getAbsoluteUrl(product.image);
            const absoluteMerchantLogo = getAbsoluteUrl(product.merchant_logo);
            const absoluteProductLink = createProductUrl(product);
            const unitPriceDisplay = formatUnitPrice(product);
            const quantityDisplay = formatQuantityDisplay(product);

            const fetchDetailsBtn = product.url && product.url.startsWith('/product.php?path=') ? 
                `<button class="product-link fetch-details-button" data-product-url="${product.url}">Detayları Göster</button>` : '';

            return `
                <div class="product-card" data-product-id="${productId}">
                    ${absoluteProductImage ? `<img src="${absoluteProductImage}" alt="${product.name}" class="product-image">` : '<div style="width:100px; height:100px; background:#eee; text-align:center; line-height:100px; font-size:0.8em; border-radius:4px;">Resim Yok</div>'}
                    <div class="product-info">
                        <h3>${product.name}</h3>
                        <p><strong>Marka:</strong> ${product.brand || 'N/A'}</p>
                        <p class="product-price"><strong>Fiyat:</strong> ${typeof product.price === 'number' ? `${product.price.toFixed(2)} TL` : 'N/A'}</p>
                        <p><strong>Birim Fiyat:</strong> ${unitPriceDisplay}</p>
                        <p><strong>Miktar:</strong> ${quantityDisplay}</p>
                        ${absoluteMerchantLogo ? `<img src="${absoluteMerchantLogo}" alt="${product.brand || 'Satıcı'} Logosu" class="merchant-logo">` : ''}

                        <!-- Ürün açıklaması ve özellikleri için kapsayıcı -->
                        <div class="product-details-container" id="details-${productId}" style="display: none;">
                            <div class="loading-indicator">Yükleniyor...</div>
                        </div>

                        <div class="product-buttons">
                            ${absoluteProductLink ? `<a href="${absoluteProductLink}" target="_blank" class="product-link">Ürüne Git</a>` : ''}
                            ${fetchDetailsBtn}
                        </div>
                    </div>
                    <button class="favorite-button ${favoritedClass}" data-product-id="${productId}" data-product-data='${JSON.stringify(product)}'>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24px" height="24px">
                            <path d="M12 21.35l-1.84-1.84C5.46 14.42 2 11.12 2 7.25 2 4.58 4.01 2.5 6.75 2.5c1.74 0 3.41.81 4.5 2.09C12.84 3.31 14.51 2.5 16.25 2.5 18.99 2.5 21 4.58 21 7.25c0 3.87-3.46 7.17-8.16 12.26L12 21.35z"/>
                        </svg>
                    </button>
                </div>
            `;
        }).join('');

        targetContainer.querySelectorAll('.favorite-button').forEach(button => {
            button.addEventListener('click', async (event) => {
                const productId = event.currentTarget.dataset.productId;
                const productDataStr = event.currentTarget.dataset.productData;
                
                let productToToggle;
                try {
                    if (productDataStr) {
                        productToToggle = JSON.parse(productDataStr);
                    } else {
                        productToToggle = products.find(p => p.id === productId);
                    }
                } catch (error) {
                    console.error('Ürün verisi ayrıştırma hatası:', error);
                    productToToggle = products.find(p => p.id === productId);
                }
                
                if (productToToggle) {
                    await favoritesManager.toggleFavorite(productToToggle);
                } else {
                    console.error('Ürün bulunamadı:', productId);
                }
            });
        });

        targetContainer.querySelectorAll('.fetch-details-button').forEach(button => {
            button.addEventListener('click', async (event) => {
                const productUrl = event.currentTarget.dataset.productUrl;
                const productId = event.currentTarget.closest('.product-card').dataset.productId;
                const detailsContainer = document.getElementById(`details-${productId}`);
                
                if (detailsContainer.style.display === 'block') {
                    detailsContainer.style.display = 'none';
                    button.textContent = 'Detayları Göster';
                    return;
                }
                
                button.disabled = true;
                button.textContent = 'Yükleniyor...';
                detailsContainer.style.display = 'block';
                
                try {
                    const response = await fetch(productUrl);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    
                    const data = await response.json();
                    
                    if (data.success && data.product) {
                        let detailsHTML = '';
                        
                        if (data.product.description) {
                            detailsHTML += `<div class="product-description">
                                <h4>Açıklama</h4>
                                <p>${data.product.description}</p>
                            </div>`;
                        }
                        
                        if (data.product.specs && data.product.specs.length > 0) {
                            detailsHTML += `<div class="product-specs">
                                <h4>Özellikler</h4>
                                <ul>
                                    ${data.product.specs.map(group => `
                                        <li>
                                            <strong>${group.group}:</strong>
                                            <ul>
                                                ${group.items.map(item => `
                                                    <li>${item.name}: ${item.value}</li>
                                                `).join('')}
                                            </ul>
                                        </li>
                                    `).join('')}
                                </ul>
                            </div>`;
                        }
                        
                        if (!detailsHTML) {
                            detailsHTML = '<p>Bu ürün için detaylı bilgi bulunmuyor.</p>';
                        }
                        
                        detailsContainer.innerHTML = detailsHTML;
                        
                        button.textContent = 'Detayları Gizle';
                        button.disabled = false;
                    } else {
                        detailsContainer.innerHTML = '<p>Ürün detayları getirilemedi. Lütfen tekrar deneyin.</p>';
                        button.textContent = 'Detayları Göster';
                        button.disabled = false;
                    }
                    
                } catch (error) {
                    console.error('Ürün detayları getirme hatası:', error);
                    detailsContainer.innerHTML = '<p>Ürün detayları yüklenirken bir hata oluştu.</p>';
                    button.textContent = 'Detayları Göster';
                    button.disabled = false;
                }
            });
        });
    }

    function updatePaginationControls(pagination, totalProducts) {
        const paginationContainer = document.querySelector('.pagination-container');
        
        if (!pagination) {
            prevPageButton.disabled = true;
            nextPageButton.disabled = true;
            currentPageSpan.textContent = 'Sayfa: -';
            if (paginationContainer) {
                paginationContainer.style.display = 'none';
            }
            return;
        }

        if (paginationContainer) {
            paginationContainer.style.display = 'flex';
        } else{
            paginationContainer.style.display = 'none';
        }

        const { current_page, total_pages } = pagination;

        currentPage = current_page || 1;
        totalPages = total_pages || 1;
        
        currentPageSpan.textContent = `Sayfa: ${currentPage} / ${totalPages}`;

        prevPageButton.disabled = currentPage <= 1;
        nextPageButton.disabled = currentPage >= totalPages;
    }

    searchButton.addEventListener('click', () => {
        currentPage = 1;
        fetchProducts();
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            currentPage = 1;
            fetchProducts();
        }
    });

    sortSelect.addEventListener('change', () => {
        currentPage = 1;
        fetchProducts();
    });

    prevPageButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            fetchProducts();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    nextPageButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            fetchProducts();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    applyFiltersButton.addEventListener('click', applyFilters);
    resetFiltersButton.addEventListener('click', resetFilters);

    const urlParams = new URLSearchParams(window.location.search);
    const queryParam = urlParams.get('q');
    
    if (queryParam) {
        searchInput.value = queryParam;
        fetchProducts();
    }
}); 