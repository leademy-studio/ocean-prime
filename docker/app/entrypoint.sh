#!/bin/bash
set -e

# Установка зависимостей
if [ -f composer.json ]; then
    echo "Installing PHP dependencies..."
    composer install --no-interaction --prefer-dist --optimize-autoloader
fi

# Миграции October CMS
if [ -f artisan ]; then
    echo "Running October CMS migrations..."
    php artisan october:up
fi

# Настройка прав на storage и cache
if [ -d storage ]; then
    chmod -R 775 storage
    chown -R www-data:www-data storage
fi
if [ -d bootstrap/cache ]; then
    chmod -R 775 bootstrap/cache
    chown -R www-data:www-data bootstrap/cache
fi

exec "$@"
