document.addEventListener('DOMContentLoaded', () => {
    const favoritesContainer = document.getElementById('favoritesContainer');
    const clearFavoritesButton = document.getElementById('clearFavoritesButton');
    
    if (clearFavoritesButton) {
        clearFavoritesButton.addEventListener('click', async () => {
            const cleared = await favoritesManager.clearAllFavorites();
            if (cleared) {
                renderFavorites();
            }
        });
    }

    loadAndRenderFavorites();
    
    async function loadAndRenderFavorites() {
        const currentUser = checkUserStatus();
        
        if (!currentUser) {
            favoritesContainer.innerHTML = `
                <div class="auth-notice">
                    <p>Favorilerinizi görmek için <a href="auth.html">giriş yapın</a>.</p>
                </div>
            `;
            return;
        }
        
        await favoritesManager.loadFavorites();
        renderFavorites();
    }

    function renderFavorites() {
        const favoriteProducts = favoritesManager.getFavorites();
        
        if (!favoriteProducts || favoriteProducts.length === 0) {
            favoritesContainer.innerHTML = '<p>Henüz favori ürününüz bulunmamaktadır.</p>';
            return;
        }

        favoritesContainer.innerHTML = favoriteProducts.map(product => {
            const productId = product.id;
            const absoluteProductImage = getAbsoluteUrl(product.image);
            const absoluteMerchantLogo = getAbsoluteUrl(product.merchant_logo);
            const absoluteProductLink = createProductUrl(product);
            const unitPriceDisplay = formatUnitPrice(product);
            const quantityDisplay = formatQuantityDisplay(product);

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

                        ${product.description ? `<div class="product-description"><strong>Açıklama:</strong> <p>${product.description}</p></div>` : ''}

                        ${absoluteProductLink ? `<p style="margin-top:10px;"><a href="${absoluteProductLink}" target="_blank" class="product-link">Ürüne Git</a></p>` : ''}
                    </div>
                    <button class="favorite-button favorited" data-product-id="${productId}">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24px" height="24px">
                            <path d="M12 21.35l-1.84-1.84C5.46 14.42 2 11.12 2 7.25 2 4.58 4.01 2.5 6.75 2.5c1.74 0 3.41.81 4.5 2.09C12.84 3.31 14.51 2.5 16.25 2.5 18.99 2.5 21 4.58 21 7.25c0 3.87-3.46 7.17-8.16 12.26L12 21.35z"/>
                        </svg>
                    </button>
                </div>
            `;
        }).join('');

        favoritesContainer.querySelectorAll('.favorite-button').forEach(button => {
            button.addEventListener('click', async (event) => {
                const productId = event.currentTarget.dataset.productId;
                const productToToggle = favoritesManager.getFavorites().find(p => p.id === productId);
                
                if (productToToggle) {
                    await favoritesManager.toggleFavorite(productToToggle);
                    renderFavorites();
                }
            });
        });
    }
});