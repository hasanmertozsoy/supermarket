FROM php:8.1-apache

RUN apt-get update && apt-get install -y \
    libcurl4-openssl-dev \
    zip \
    unzip \
    git

# PHP eklentilerini etkinleştir
RUN docker-php-ext-install curl

# Apache modüllerini etkinleştir
RUN a2enmod rewrite

# Apache'yi yapılandır
ENV APACHE_DOCUMENT_ROOT /var/www/html
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Çalışma dizinini ayarla
WORKDIR /var/www/html

# Dosyaları kopyala
COPY . /var/www/html/

# Cache dizini oluştur ve izinleri ayarla
RUN mkdir -p /var/www/html/cache && \
    chmod -R 777 /var/www/html/cache

EXPOSE 80

CMD ["apache2-foreground"] 