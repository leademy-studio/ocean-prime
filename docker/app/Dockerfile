FROM php:8.4-fpm

# Копируем entrypoint.sh внутрь контейнера
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

WORKDIR /var/www/html

# ENTRYPOINT временно убран для ручной установки October CMS
CMD ["bash"]
