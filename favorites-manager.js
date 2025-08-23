class FavoritesManager {
    constructor() {
        this.favoriteProducts = [];
        this.currentUser = null;
    }

    async loadFavorites() {
        
        this.currentUser = checkUserStatus();
        
        if (this.currentUser && this.currentUser._id) {
            try {
                const response = await fetch(`${API_URL}/favorites/${this.currentUser._id}`);
                const result = await response.json();
                
                if (result.success) {
                    console.log("MongoDB'den favoriler yüklendi:", result.favorites);
                    this.favoriteProducts = result.favorites || [];
                    return this.favoriteProducts;
                } else {
                    console.error("MongoDB'den favorileri yükleme hatası:", result.message);
                }
            } catch (error) {
                console.error("MongoDB bağlantı hatası:", error);
            }
        } else {
            console.log("Kullanıcı girişi yapılmamış, favoriler yüklenemiyor.");
        }
        
        this.favoriteProducts = [];
        return this.favoriteProducts;
    }

    async saveFavorites() {
        
        if (!this.currentUser) {
            this.currentUser = checkUserStatus();
        }
        
        if (this.currentUser && this.currentUser._id) {
            try {
                
                const response = await fetch(`${API_URL}/favorites/${this.currentUser._id}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ favorites: this.favoriteProducts })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    console.log("Favoriler MongoDB'ye kaydedildi:", this.favoriteProducts);
                    return true;
                } else {
                    console.error("MongoDB'ye favori kaydetme hatası:", result.message);
                }
            } catch (error) {
                console.error("MongoDB bağlantı hatası:", error);
            }
        } else {
            console.log("Kullanıcı girişi yapılmamış, favoriler kaydedilemiyor.");
            alert("Favorilerinizi kaydetmek için lütfen giriş yapın.");
            window.location.href = "auth.html";
        }
        
        return false;
    }

    isFavorited(productId) {
        return this.favoriteProducts.some(p => p.id === productId);
    }

    async toggleFavorite(product) {
        
        if (!this.currentUser) {
            this.currentUser = checkUserStatus();
        }
        
        if (!this.currentUser || !this.currentUser._id) {
            alert("Favorilere eklemek için lütfen giriş yapın.");
            window.location.href = "auth.html";
            return;
        }
        
        const existingIndex = this.favoriteProducts.findIndex(p => p.id === product.id);
        
        if (existingIndex > -1) {
            this.favoriteProducts.splice(existingIndex, 1);
            console.log('Favorilerden kaldırıldı:', product.name);
        } else {
            this.favoriteProducts.push(product);
            console.log('Favorilere eklendi:', product.name);
        }
        
        await this.saveFavorites();
        
        this.updateFavoriteButtonsState(product.id, existingIndex === -1);
        
        return existingIndex === -1;
    }

    updateAllFavoriteButtons() {
        const allButtons = document.querySelectorAll('.favorite-button');
        allButtons.forEach(btn => {
            const productId = btn.dataset.productId;
            const isFav = this.isFavorited(productId);
            
            if (isFav) {
                btn.classList.add('favorited');
            } else {
                btn.classList.remove('favorited');
            }
        });
    }

    updateFavoriteButtonsState(productId, isFavorited) {
        const favButtons = document.querySelectorAll(`.favorite-button[data-product-id="${productId}"]`);
        favButtons.forEach(btn => {
            if (isFavorited) {
                btn.classList.add('favorited');
            } else {
                btn.classList.remove('favorited');
            }
        });
    }

    async clearAllFavorites() {
        if (confirm('Tüm favori ürünlerinizi silmek istediğinize emin misiniz?')) {
            this.favoriteProducts = [];
            await this.saveFavorites();
            return true;
        }
        return false;
    }

    getFavorites() {
        return this.favoriteProducts;
    }
}

const favoritesManager = new FavoritesManager(); 