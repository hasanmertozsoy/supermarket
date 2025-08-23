const express = require('express');
const mongoose = require('mongoose');
const UserFavorite = require('../models/UserFavorite');
const router = express.Router();

// Favori ürünleri getir - userId ile
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        // ObjectId kontrolü
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: 'Geçersiz kullanıcı ID'
            });
        }
        
        // Favorileri bul
        const userFavorites = await UserFavorite.findOne({ userId });
        
        if (!userFavorites) {
            return res.status(200).json({
                success: true,
                favorites: []
            });
        }
        
        return res.status(200).json({
            success: true,
            favorites: userFavorites.favorites || []
        });
    } catch (error) {
        console.error('Favori getirme hatası:', error);
        return res.status(500).json({
            success: false,
            message: 'Sunucu hatası'
        });
    }
});

// Favori ürünleri kaydet/güncelle - userId ile
router.post('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { favorites } = req.body;
        
        // ObjectId kontrolü
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: 'Geçersiz kullanıcı ID'
            });
        }
        
        // Favorileri güncelle
        const result = await UserFavorite.findOneAndUpdate(
            { userId },
            { 
                $set: { 
                    favorites,
                    updatedAt: new Date()
                } 
            },
            { upsert: true, new: true }
        );
        
        return res.status(200).json({
            success: true,
            message: 'Favoriler başarıyla kaydedildi'
        });
    } catch (error) {
        console.error('Favori kaydetme hatası:', error);
        return res.status(500).json({
            success: false,
            message: 'Sunucu hatası'
        });
    }
});

module.exports = router; 