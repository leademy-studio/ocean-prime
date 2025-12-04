FROM php:8.4-fpm

# --- Установка системных зависимостей и Nginx ---
RUN apt-get update && apt-get install -y \
    nginx \
    # Очистка кэша apt для уменьшения размера образа
    && rm -rf /var/lib/apt/lists/*

# --- Настройка PHP ---
# Здесь можно будет добавить установку расширений PHP, если потребуется

WORKDIR /var/www/html

# --- Копирование скрипта запуска ---
# Копируем entrypoint.sh внутрь контейнера
COPY docker/app/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# --- Запуск ---
# Указываем, что при старте контейнера должен выполняться наш скрипт
ENTRYPOINT ["/entrypoint.sh"]
