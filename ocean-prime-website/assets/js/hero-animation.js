/**
 * Кастомная анимация для Hero-секции.
 * Эта анимация заменяет стандартную анимацию Webflow, которая не срабатывала
 * из-за конфликтов на странице.
 */
document.addEventListener('DOMContentLoaded', () => {
  const heroContainer = document.querySelector('.section--hero .container[data-w-id]');
  const heroImage = document.querySelector('.section--hero .image-8[data-w-id]');
  
  if (!heroContainer && !servicesHeroContainer) {
    return;
  }

  // Функция для безопасного удаления инлайновых стилей, которые мешают анимации
  const clearInlineStyles = (element) => {
    if (element) {
      element.removeAttribute('style');
    }
  };

  // Функция для запуска анимации
  const triggerHeroAnimation = () => {
    // Сначала очищаем инлайновые стили, чтобы CSS-переходы могли сработать
    clearInlineStyles(heroContainer);
    clearInlineStyles(heroImage);

    // Добавляем класс, который инициирует анимацию
    if (heroContainer) {
      heroContainer.classList.add('is-visible');
    }
  };

  // Запускаем анимацию с небольшой задержкой после загрузки страницы,
  // чтобы все элементы успели отрисоваться.
  // 500ms — это стандартная задержка для подобных "on load" анимаций в Webflow.
  setTimeout(triggerHeroAnimation, 500);
});