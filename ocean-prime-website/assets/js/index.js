// Этот файл предназначен для ваших кастомных скриптов.
// Анимации Webflow определены и управляются из файла assets/js/webflow.js
// и запускаются с помощью атрибутов `data-w-id` в вашем HTML.

/* ============================================================================
  Вспомогалки
============================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const on = (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts);

  /* ==========================================================================
    1) Автоинициализация фонового видео
  ========================================================================== */
  const initBackgroundVideos = () => {
    const videos = qsa('.background-video video, .background-video-3 video, .background-video-4 video, .w-background-video video');
    videos.forEach(v => {
      try {
        v.muted = true;
        v.playsInline = true;
        v.setAttribute('playsinline', 'true');
        v.setAttribute('muted', 'true');
        v.autoplay = true;
        v.loop = true;
        const playPromise = v.play();
        if (playPromise && typeof playPromise.then === 'function') {
          playPromise.catch(() => {
            // Автоплей заблокирован — пробуем снова при взаимодействии
            const resume = () => {
              v.play().finally(() => document.removeEventListener('click', resume));
            };
            document.addEventListener('click', resume, { once: true, passive: true });
          });
        }
      } catch (e) {
        // no-op
      }
    });
  };

  /* ==========================================================================
    2) Мобильное меню (бургер) + w-nav overlay
  ========================================================================== */
  const initMobileNav = () => {
    const header = qs('.website-header.w-nav');
    if (!header) return;

    const btn  = qs('.spark-simple-menu-button.w-nav-button', header);
    const menu = qs('.spark-nav-with-mega-dropdowns.w-nav-menu', header);
    if (!btn || !menu) return;

    // На случай если overlay нужен для затемнения — оставим, но не перемещаем меню внутрь
    let overlay =
      qs(`#${btn.getAttribute('aria-controls')}`) ||
      qs('.w-nav-overlay', header) ||
      qs('.w-nav-overlay');

    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'w-nav-overlay';
      header.appendChild(overlay);
    } else if (overlay.parentElement !== header) {
      header.appendChild(overlay);
    }

    if (!overlay.id) overlay.id = 'w-nav-overlay-0';
    btn.setAttribute('aria-controls', overlay.id);

    const pruneDuplicateOverlays = () => {
      qsa('.w-nav-overlay').forEach((el) => {
        if (el !== overlay) el.remove();
      });
    };

    const updateOverlaySize = () => {
      const headerRect = header.getBoundingClientRect();
      const available = Math.max(window.innerHeight - headerRect.height, 0);
      overlay.style.height = `${available}px`;
    };

    const handleViewportChange = () => {
      if (btn.classList.contains('w--open')) updateOverlaySize();
    };

    const open = () => {
      pruneDuplicateOverlays();
      btn.classList.add('w--open', 'is-open');
      btn.setAttribute('aria-expanded', 'true');
      menu.classList.add('is-open', 'w--nav-menu-open');
      menu.setAttribute('data-nav-menu-open', 'true');
      header.setAttribute('data-nav-menu-open', 'true');
      overlay.classList.add('is-open');
      overlay.setAttribute('data-nav-menu-open', 'true');
      overlay.style.display = 'block';
      updateOverlaySize();
      window.addEventListener('resize', handleViewportChange);
      window.addEventListener('orientationchange', handleViewportChange);
      document.body.style.overflow = 'hidden';
    };

    const close = () => {
      btn.classList.remove('w--open', 'is-open');
      btn.setAttribute('aria-expanded', 'false');
      menu.classList.remove('is-open', 'w--nav-menu-open');
      menu.removeAttribute('data-nav-menu-open');
      header.removeAttribute('data-nav-menu-open');
      overlay.classList.remove('is-open');
      overlay.removeAttribute('data-nav-menu-open');
      overlay.style.display = 'none';
      overlay.style.height = '';
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('orientationchange', handleViewportChange);
      document.body.style.overflow = '';
    };

    const toggle = () => (btn.classList.contains('w--open') ? close() : open());
    on(btn, 'click', (e) => { e.preventDefault(); e.stopPropagation(); toggle(); });

    on(overlay, 'click', (e) => {
      if (!menu.contains(e.target)) close();
    });

    qsa('a', menu).forEach(a => on(a, 'click', close));
    // ESC
    on(document, 'keydown', (e) => { if (e.key === 'Escape') close(); });

    // Авто‑закрытие при ширине >1200px
    const mql = window.matchMedia('(max-width: 1200px)');
    const onChange = () => { if (!mql.matches) close(); };
    mql.addEventListener('change', onChange);
    onChange();
  };

  /* ==========================================================================
    2.1) Выпадающее меню "Управление" по клику
  ========================================================================== */
  const initMegaDropdown = () => {
    const dropdowns = qsa('.mega-dropdown');
    if (!dropdowns.length) return;

    const setDropdownState = (dropdown, isOpen) => {
      dropdown.classList.toggle('is-open', isOpen);
      const toggle = qs('.mega-dropdown__toggle', dropdown);
      const list = qs('.mega-dropdown__list', dropdown);
      if (toggle) {
        toggle.classList.toggle('w--open', isOpen);
        toggle.setAttribute('aria-expanded', String(isOpen));
      }
      if (list) {
        list.classList.toggle('w--open', isOpen);
        list.setAttribute('aria-hidden', String(!isOpen));
      }
    };

    const closeAll = () => {
      dropdowns.forEach(dropdown => setDropdownState(dropdown, false));
    };

    dropdowns.forEach(dropdown => {
      const toggle = qs('.mega-dropdown__toggle', dropdown);
      const list = qs('.mega-dropdown__list', dropdown);
      if (!toggle || !list) return;

      setDropdownState(dropdown, false);

      const toggleDropdown = (event) => {
        event.preventDefault();
        event.stopPropagation();
        const willOpen = !dropdown.classList.contains('is-open');
        closeAll();
        setDropdownState(dropdown, willOpen);
      };

      on(toggle, 'click', toggleDropdown);
      on(toggle, 'keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          toggleDropdown(event);
        } else if (event.key === 'Escape') {
          setDropdownState(dropdown, false);
        }
      });

      on(list, 'click', (event) => event.stopPropagation());
    });

    on(document, 'click', closeAll);
    on(document, 'keydown', (event) => {
      if (event.key === 'Escape') {
        closeAll();
      }
    });
  };

  /* ==========================================================================
    3) Модальное окно
  ========================================================================== */
  const initModal = () => {
    const modal = qs('.pop-up__wrap');
    if (!modal) return;
    const content = qs('.pop-up__content-wrap', modal);
    const overlay = qs('.overlay---brix', modal);
    const closeBtn = qs('.close-popup---brix', modal);

    const show = () => {
      modal.style.display = 'flex';
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    };
    const hide = () => {
      modal.style.display = 'none';
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };

    // Триггеры открытия:
    // - кнопки с текстом "Заказать консультацию" или "Связаться с менеджером"
    // - элементы с классом .open-modal или атрибутом [data-open-modal]
    const openers = qsa('a.btn, .open-modal, [data-open-modal], .combine-button-icon');
    openers.forEach(el => {
      on(el, 'click', (e) => {
        const text = (el.textContent || '').toLowerCase();
        const shouldOpen =
          el.classList.contains('open-modal') ||
          el.hasAttribute('data-open-modal') ||
          /заказать консультацию|связаться с менеджером/.test(text);

        if (shouldOpen || el.getAttribute('href') === '#') {
          e.preventDefault();
          show();
        }
      });
    });

    on(closeBtn, 'click', hide);
    on(overlay, 'click', hide);
    on(modal, 'click', (e) => {
      if (!content.contains(e.target)) hide();
    });
    on(document, 'keydown', (e) => {
      if (e.key === 'Escape') hide();
    });

    // Старт — скрыто (на случай отсутствия CSS)
    if (!modal.style.display) modal.style.display = 'none';
  };

  /* ==========================================================================
    4) Универсальная обработка форм (имитация AJAX)
  ========================================================================== */
  const initForms = () => {
    const forms = qsa('form.form-8, form.form-5, form.service-item__form, form[name="email-form"], form[name="email-form-2"], form[name="email-form-3"]');
    forms.forEach(form => {
      on(form, 'submit', async (e) => {
        e.preventDefault();

        // Валидация чекбокса согласия, если есть
        const consent = form.querySelector('input[type="checkbox"][required]');
        if (consent && !consent.checked) {
          showFail(form, 'Пожалуйста, подтвердите согласие на обработку персональных данных.');
          return;
        }

        const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
        const prevText = submitBtn ? submitBtn.value || submitBtn.textContent : '';
        setLoading(submitBtn, true);

        try {
          const payload = serializeForm(form);
          // Тут можно интегрировать реальный endpoint отправки (fetch)
          // Пример:
          // await fetch('/api/lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });

          // Имитация сети
          await new Promise(res => setTimeout(res, 800));
          showSuccess(form);
        } catch (err) {
          showFail(form, 'Произошла ошибка, попробуйте еще раз.');
        } finally {
          setLoading(submitBtn, false, prevText);
        }
      });
    });

    function serializeForm(form) {
      const fd = new FormData(form);
      const obj = {};
      fd.forEach((v, k) => {
        if (obj[k] !== undefined) {
          if (Array.isArray(obj[k])) obj[k].push(v);
          else obj[k] = [obj[k], v];
        } else {
          obj[k] = v;
        }
      });
      return obj;
    }

    function setLoading(btn, isLoading, originalText) {
      if (!btn) return;
      if (btn.tagName === 'INPUT') {
        if (isLoading) {
          btn.setAttribute('disabled', 'true');
          btn.value = btn.getAttribute('data-wait') || 'Загрузка...';
        } else {
          btn.removeAttribute('disabled');
          if (originalText) btn.value = originalText;
        }
      } else {
        if (isLoading) {
          btn.setAttribute('disabled', 'true');
          btn.dataset.original = btn.textContent;
          btn.textContent = 'Загрузка...';
        } else {
          btn.removeAttribute('disabled');
          btn.textContent = btn.dataset.original || btn.textContent;
        }
      }
    }

    function showSuccess(form) {
      const wrapper = form.parentElement;
      const done = wrapper && wrapper.querySelector('.w-form-done');
      const fail = wrapper && wrapper.querySelector('.w-form-fail');

      form.style.display = 'none';
      if (fail) fail.style.display = 'none';
      if (done) done.style.display = 'block';
    }

    function showFail(form, msg) {
      const wrapper = form.parentElement;
      const done = wrapper && wrapper.querySelector('.w-form-done');
      const fail = wrapper && wrapper.querySelector('.w-form-fail');

      if (done) done.style.display = 'none';
      if (fail) {
        fail.style.display = 'block';
        const t = fail.querySelector('div');
        if (t && msg) t.textContent = msg;
      }
    }
  };

  /* ==========================================================================
    5) Восстановление класса services-text для анимаций списка услуг
  ========================================================================== */
  const ensureServicesTextClass = () => {
    const serviceItemParagraphs = qsa('.service-item .paragraph');
    serviceItemParagraphs.forEach(p => p.classList.add('services-text'));
  };

  /* ==========================================================================
    6) Индивидуальный hover для карточек услуг
       (исключаем массовое изменение цвета при наведении)
  ========================================================================== */
  const initServiceItemsHover = () => {
    const items = qsa('.div-block-28.services-dyn-items .service-item');
    if (!items.length) return;

    items.forEach(item => {
      item.addEventListener('mouseenter', () => {
        // Удаляем класс у всех (если хотите чтобы оставался только на реальном hover)
        items.forEach(i => i.classList.remove('is-hovered'));
        item.classList.add('is-hovered');
      });
      item.addEventListener('mouseleave', () => {
        item.classList.remove('is-hovered');
      });
    });
  };

  /* ==========================================================================
    7) Плавное размытие фона hero-секции при скролле
  ========================================================================== */
  const initHeroBlurOnScroll = () => {
    // Универсальные селекторы для hero-секции на любой странице
    const heroSection = qs('.section--hero, .services-hero');
    if (!heroSection) return;

    const heroBg = qs('.background-video, .services-hero__background', heroSection);
    const heroTitle = qs('.h1-hero, .h1-main', heroSection);
    const heroParagraph = qs('.paragraph--hero, .paragraph', heroSection);

    if (!heroBg) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScrollBlur = 600; // Дистанция скролла, на которой достигается максимальное размытие
      const maxBlur = 3;   // Максимальное значение размытия в пикселях
      const maxScrollScale = 600; // Дистанция скролла для зума
      const startScale = 1;
      const maxScale = 1.1; // Максимальное значение зума
      const maxScrollContent = 600; // Дистанция скролла для анимации контента
      const maxTranslateX = 100; // Максимальное смещение контента в пикселях

      // Рассчитываем значение размытия, ограничивая его сверху значением maxBlur
      const blurValue = Math.min(maxBlur, (scrollY / maxScrollBlur) * maxBlur);

      // Рассчитываем значение зума, ограничивая его сверху значением maxScale
      const scaleValue = Math.min(maxScale, startScale + (scrollY / maxScrollScale) * (maxScale - startScale));

      // Рассчитываем прогресс анимации для контента
      const contentScrollProgress = Math.min(1, scrollY / maxScrollContent);
      const opacityValue = 1 - contentScrollProgress;
      const translateXValue = contentScrollProgress * maxTranslateX;

      // Используем requestAnimationFrame для плавной анимации без нагрузки на CPU
      window.requestAnimationFrame(() => {
        heroBg.style.filter = `blur(${blurValue}px)`;
        heroBg.style.transform = `scale(${scaleValue})`;

        // Возвращаем анимацию для контента
        if (heroTitle) heroTitle.style.transform = `translateX(-${translateXValue}px)`;
        if (heroParagraph) heroParagraph.style.transform = `translateX(${translateXValue}px)`;
        if (heroTitle || heroParagraph) (heroTitle.parentElement || heroParagraph.parentElement).style.opacity = opacityValue;
      });
    };

    // Добавляем слушатель события скролла
    on(window, 'scroll', handleScroll, { passive: true });
    // Вызываем функцию при загрузке на случай, если страница уже проскроллена
    handleScroll();
  };

  /* ==========================================================================
    5.1) Отключение дублирующих Webflow-интеракций на карточках услуг
         (одинаковый data-w-id приводил к групповому изменению фона)
  ========================================================================== */
  const neutralizeServiceItemWebflow = () => {
    const items = qsa('.div-block-28.services-dyn-items .service-item');
    items.forEach(item => {
      // Удаляем data-w-id, чтобы Webflow IX2 не применял свою анимацию
      item.removeAttribute('data-w-id');
      // Также на всякий случай сбрасываем инлайновые стили, которые могла добавить анимация
      item.style.backgroundColor = '';
      item.style.color = '';

      // Находим фоновое изображение и также очищаем его инлайновые стили
      const bgImage = item.querySelector('.image-28');
      if (bgImage) {
        // Удаляем атрибут style, чтобы сбросить opacity, filter и transform
        bgImage.removeAttribute('style');
      }
    });
  };

  /* ==========================================================================
    5.2) Отключение Webflow-интеракции на выпадающем меню
         (предотвращает конфликт, из-за которого меню не открывалось)
  ========================================================================== */
  const neutralizeDropdownWebflow = () => {
    const dropdown = qs('.spark-mega-dropdown[data-w-id="e763bc71-25b4-9d48-9140-c63239a13828"]');
    if (dropdown) {
      const list = qs('.spark-mega-dropdown-list', dropdown);
      // Удаляем data-w-id, чтобы Webflow IX2 не применял начальное состояние (opacity: 0)
      dropdown.removeAttribute('data-w-id');
      // Также на всякий случай сбрасываем инлайновую прозрачность, если она уже была применена
      if (list && list.style.opacity) {
        list.style.opacity = '';
      }
    }
  };

  // Инициализация
  initBackgroundVideos();
  initMobileNav();
  neutralizeDropdownWebflow();
  initMegaDropdown();
  initModal();
  initForms();
  ensureServicesTextClass();
  neutralizeServiceItemWebflow();
  initServiceItemsHover();
  initHeroBlurOnScroll();
});
