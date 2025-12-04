module.exports = function(eleventyConfig) {
  // Кастомный фильтр для сортировки массива объектов по ключу
  eleventyConfig.addFilter("sortBy", (arr, key) => {
    if (!Array.isArray(arr)) {
      return arr;
    }
    return arr.slice().sort((a, b) => {
      if (a[key] < b[key]) return -1;
      if (a[key] > b[key]) return 1;
      return 0;
    });
  });

  // Добавляем "пустой" фильтр `slug`, чтобы исправить "тихую" ошибку в шаблонах (например, в footer.html),
  // которая ломает механизм пагинации на других страницах.
  // Этот фильтр ничего не делает со строкой, так как в `service.Slug` уже готовый URL.
  // Его наличие просто предотвращает сбой шаблонизатора.
  eleventyConfig.addFilter("slug", (input) => {
    return input;
  });

  // Копирует директорию assets в папку с итоговой сборкой (_site).
  // Это позволит сайту получить доступ к вашим стилям, скриптам, изображениям и видео.
  eleventyConfig.addPassthroughCopy("assets");

  // Универсальный шорткод для отладки. Выводит данные в консоль в процессе сборки.
  // Использование: {% debug myVariable %} или {% debug "my message" %}
  eleventyConfig.addShortcode("debug", function(...args) {
    console.log("[DEBUG]", ...args);
    return ""; // Шорткод не должен ничего выводить в HTML
  });

  return {
    // Эти настройки уже являются стандартными для Eleventy, но для ясности их можно оставить.
    dir: {
      input: ".",
      includes: "_includes",
      data: "_data",
      output: "_site"
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk"
  };
};