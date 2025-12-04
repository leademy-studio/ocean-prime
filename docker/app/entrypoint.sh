#!/bin/sh

# Выходим, если любая команда завершилась с ошибкой
set -e

# --- Настройка прав доступа ---
# Веб-сервер (nginx/php-fpm) работает от пользователя www-data.
# Даем ему права на запись в директорию /var/www/html,
# чтобы установщик October CMS мог создавать файлы.
chown -R www-data:www-data /var/www/html
echo "==> Set ownership for /var/www/html"

# --- Запуск основных сервисов ---

# 1. Запускаем PHP-FPM в фоновом режиме
php-fpm &

# 2. Запускаем Nginx на переднем плане.
# Это основной процесс, который будет удерживать контейнер в рабочем состоянии.
echo "==> Starting Nginx..."
exec nginx -g 'daemon off;'
