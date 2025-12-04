#!/bin/sh

# Выходим, если любая команда завершилась с ошибкой
set -e

# --- Первоначальная настройка приложения ---
# Эти команды выполнятся только один раз или при необходимости

# 1. Установка PHP-зависимостей
if [ -f composer.json ]; then
    echo "==> Installing Composer dependencies..."
    composer install --no-interaction --prefer-dist --optimize-autoloader
fi

# 2. Выполнение миграций базы данных
if [ -f artisan ]; then
    echo "==> Running October CMS migrations..."
    php artisan october:up
fi

# --- Запуск основных сервисов ---

# 1. Запускаем PHP-FPM в фоновом режиме
php-fpm &

# 2. Запускаем Nginx на переднем плане.
# Это основной процесс, который будет удерживать контейнер в рабочем состоянии.
echo "==> Starting Nginx..."
exec nginx -g 'daemon off;'
