const mongoose = require('mongoose');

// Favori Ürün Şeması
const userFavoriteSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    favorites: {
        type: Array,
        default: []
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const UserFavorite = mongoose.model('UserFavorite', userFavoriteSchema);

module.exports = UserFavorite; 