const express = require('express');
// const jwt = require('jsonwebtoken');
const User = require('../models/user');
const router = express.Router();

// Kullanıcı kaydı
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Email kontrolü
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Bu e-posta adresi zaten kullanılıyor'
      });
    }
    
    // Yeni kullanıcı oluştur
    const user = new User({ name, email, password });
    await user.save();
    
    // Güvenlik için şifreyi çıkar
    const userResponse = user.toObject();
    delete userResponse.password;
    
    return res.status(201).json({
      success: true,
      user: userResponse
    });
  } catch (error) {
    console.error('Kullanıcı kaydı hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// Kullanıcı girişi
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Kullanıcıyı bul
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }
    
    // Şifre kontrolü
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz şifre'
      });
    }
    
    // Güvenlik için şifreyi çıkar
    const userResponse = user.toObject();
    delete userResponse.password;
    
    return res.status(200).json({
      success: true,
      user: userResponse
    });
  } catch (error) {
    console.error('Giriş hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

module.exports = router; 