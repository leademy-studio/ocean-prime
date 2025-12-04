# Используем официальный образ PHP 8.1 с FPM на базе легковесного Alpine Linux
FROM php:8.2-fpm-alpine

# Устанавливаем рабочую директорию внутри контейнера
WORKDIR /var/www/html

# Устанавливаем системные зависимости, необходимые для расширений PHP
RUN apk update && apk add --no-cache \
    libzip-dev \
    libjpeg-turbo-dev \
    libwebp-dev \
    libpng-dev \
    libavif-dev \
    freetype-dev \
    icu-dev \
    oniguruma-dev \
    libxml2-dev \
    && rm -rf /var/cache/apk/*

# Устанавливаем расширения PHP, необходимые для October CMS
RUN docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp --with-avif \
    && docker-php-ext-install \
    pdo_mysql \
    zip \
    gd \
    intl \
    opcache \
    bcmath \
    exif \
    mbstring \
    xml

# Устанавливаем Composer (менеджер зависимостей для PHP)
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Копируем и настраиваем entrypoint скрипт, который будет запускаться при старте контейнера
COPY ./docker/app/entrypoint.sh /usr/local/bin/docker-php-entrypoint
RUN chmod +x /usr/local/bin/docker-php-entrypoint

# Копируем кастомные настройки PHP (например, memory_limit)
COPY ./php/php.ini /usr/local/etc/php/conf.d/custom.ini

# Настройка PHP-FPM для работы в контейнере
RUN echo "listen = 0.0.0.0:9000" >> /usr/local/etc/php-fpm.d/zz-docker.conf

ENTRYPOINT ["docker-php-entrypoint"]

# Открываем порт, который слушает PHP-FPM
EXPOSE 9000