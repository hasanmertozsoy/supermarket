# Süpermarket API

Süpermarket uygulaması için backend API

## Kurulum

1. Node.js ve npm yükleyin
2. MongoDB yükleyin ve çalıştırın
3. Bu dizinde aşağıdaki komutları çalıştırın:

```bash
# Bağımlılıkları yükle
npm install

# .env dosyasını düzenle (eğer gerekirse)
# .env dosyasındaki MONGODB_URI ve JWT_SECRET değerlerini kontrol edin

# Geliştirme modunda sunucuyu başlat
npm run dev

# Veya normal modda başlat
npm start
```

## API Endpoints

### Kimlik Doğrulama

- `POST /api/auth/register`: Yeni kullanıcı kaydı
  - İstek gövdesi: `{ "name": "...", "email": "...", "password": "..." }`
  - Yanıt: `{ "success": true, "user": {...}, "token": "..." }`

- `POST /api/auth/login`: Kullanıcı girişi
  - İstek gövdesi: `{ "email": "...", "password": "..." }`
  - Yanıt: `{ "success": true, "user": {...}, "token": "..." }`

### Favoriler

- `GET /api/favorites`: Kullanıcının favorilerini getir
  - Header: `Authorization: Bearer <token>`
  - Yanıt: `{ "success": true, "favorites": [...] }`

- `POST /api/favorites`: Kullanıcının favorilerini güncelle
  - Header: `Authorization: Bearer <token>`
  - İstek gövdesi: `{ "favorites": [...] }`
  - Yanıt: `{ "success": true, "favorites": [...] }`

## Dikkat Edilmesi Gerekenler

- MongoDB bağlantınızı `.env` dosyasında yapılandırın
- Gerçek bir uygulamada JWT_SECRET anahtarını güvenli ve karmaşık bir değerle değiştirin
- Uygulama CORS desteği ile gelir, gerekirse `server.js` dosyasında yapılandırın 