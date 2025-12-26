## Gereksinimler

- Docker
- Docker Compose

## Kurulum

1. Projeyi klonlayın veya indirin:

```bash
git clone <repo-url>
cd Supermarket
```

2. Docker Compose ile uygulamayı başlatın:

```bash
docker-compose up -d
```

3. Uygulamaya erişim:

- PHP Web Uygulaması: `http://localhost:8000`
- Node.js API: `http://localhost:3000`

## Servisler

Uygulama üç temel servisten oluşur:

1. **PHP Web Sunucusu (Apache)**: Kullanıcı arayüzü ve web sayfaları
2. **Node.js API Sunucusu**: Kullanıcı kimlik doğrulama ve favoriler için backend API'si
3. **MongoDB**: Veritabanı sunucusu

## Konteynerları Yönetme

```bash
# Tüm konteynerları başlatma
docker-compose up -d

# Konteynerlerin durumunu kontrol etme
docker-compose ps

# Konteynerlerin loglarını görüntüleme
docker-compose logs

# Belirli bir konteynerın loglarını takip etme
docker-compose logs -f php  # veya nodejs, mongo

# Konteynerları durdurma
docker-compose stop

# Konteynerları silme (verilerin kalması için)
docker-compose down

# Konteynerları silme ve veri hacimlerini kaldırma
docker-compose down -v
```

## Sorun Giderme

- MongoDB bağlantı hatası alıyorsanız, konteynerların düzgün çalıştığından emin olun:
  ```bash
  docker-compose ps
  ```

- Veritabanı bağlantı sorunları için MongoDB konteynerinin loglarını kontrol edin:
  ```bash
  docker-compose logs mongo
  ```

- PHP veya Node.js uygulamasının loglarını incelemek için:
  ```bash
  docker-compose logs php
  docker-compose logs nodejs
  ``` 
