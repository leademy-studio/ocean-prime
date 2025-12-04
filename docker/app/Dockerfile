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
    libcurl4-openssl-dev \
    && rm -rf /var/lib/apt/lists/*

# Удаляем стандартный конфиг Nginx, чтобы избежать конфликтов
RUN rm /etc/nginx/sites-enabled/default

# Запускаем Nginx от имени root, чтобы избежать проблем с правами доступа
RUN sed -i 's/user www-data;/user root;/' /etc/nginx/nginx.conf

# --- Настройка PHP ---
# Устанавливаем расширения, необходимые для October CMS / Laravel
RUN docker-php-ext-install pdo_mysql zip gd fileinfo curl mbstring bcmath

# --- Установка Composer ---
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# --- Копирование исходного кода ---
COPY ./src /var/www/html/

# Устанавливаем права доступа на скопированные файлы прямо во время сборки
RUN chown -R www-data:www-data /var/www/html && \
    find /var/www/html -type d -exec chmod 755 {} \; && \
    find /var/www/html -type f -exec chmod 644 {} \;

# --- Копирование скрипта запуска ---
# Копируем entrypoint.sh внутрь контейнера
COPY docker/app/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# --- Запуск ---
# Указываем, что при старте контейнера должен выполняться наш скрипт через shell
CMD ["/entrypoint.sh"]
