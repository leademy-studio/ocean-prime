FROM php:8.4-fpm

# --- Установка системных зависимостей и Nginx ---
RUN apt-get update && apt-get install -y \
    nginx \
    git \
    curl \
    unzip \
    libzip-dev \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    && rm -rf /var/lib/apt/lists/*

# --- Настройка PHP ---
# Устанавливаем расширения, необходимые для October CMS / Laravel
RUN docker-php-ext-install pdo_mysql zip gd

# --- Установка Composer ---
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# --- Копирование скрипта запуска ---
# Копируем entrypoint.sh внутрь контейнера
COPY docker/app/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# --- Запуск ---
# Указываем, что при старте контейнера должен выполняться наш скрипт через shell
CMD ["/entrypoint.sh"]
