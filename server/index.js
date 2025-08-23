const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Route dosyaları
const authRoutes = require('./routes/auth');
const favoritesRoutes = require('./routes/favorites');

// Express uygulaması
const app = express();
const PORT = process.env.PORT || 3000;

// CORS ayarları - PHP sunucusu için erişime izin ver
app.use(cors({
    origin: ['http://localhost:8000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB bağlantısı
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/supermarket_db', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB bağlantısı başarılı'))
.catch(err => console.error('MongoDB bağlantı hatası:', err));

// API rotaları
app.use('/api/auth', authRoutes);
app.use('/api/favorites', favoritesRoutes);

// Sunucuyu başlat
app.listen(PORT, () => {
    console.log(`MongoDB API sunucusu http://localhost:${PORT} adresinde çalışıyor`);
    console.log(`PHP sunucunuz http://localhost:8000 adresinde çalışıyor olmalı`);
}); 