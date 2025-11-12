// =========================================================================
// script-clean.js
// СЕКЦІЯ 5.1: ІНІЦІАЛІЗАЦІЯ ТА ОСНОВНІ КОНСТАНТИ
// =========================================================================

// 1. КОНСОЛІДАЦІЯ СЕЛЕКТОРІВ ТА ЗМІННИХ
const DOMSelectors = {
    // Header
    navToggle: '#nav-toggle', 
    mainNav: '#main-nav',     // Ваш старий ID для мобільного меню
    body: 'body',
    headerHeight: 100,        // Висота шапки для плавного скролу

    // Intro & Hero
    introElement: '.hero-logo-intro',
    heroTitle: '.hero-title',
    heroSubtitle: '.hero-subtitle',

    // Favorites
    favoritesBtn: '.favorites-button',
    selectCount: '#select-count',
    proceedBtn: '#proceed-to-application',
};

// =========================================================================
// 2. ФУНКЦІЯ КОНТРОЛЮ INTRO-АНІМАЦІЇ
// =========================================================================

/**
 * Керує відображенням інтро-анімації.
 * При повторному відвідуванні миттєво приховує інтро та відображає заголовки.
 */
function handleIntroAnimation() {
    const introElement = document.querySelector(DOMSelectors.introElement);
    const introPlayed = sessionStorage.getItem('introPlayed');

    if (!introElement) return;

    if (!introPlayed) {
        // СЦЕНАРІЙ 1: ПЕРШЕ ВІДВІДУВАННЯ
        sessionStorage.setItem('introPlayed', 'true');
        // Анімація Typewriter відпрацює згідно CSS
    } else {
        // СЦЕНАРІЙ 2: ПОВТОРНЕ ВІДВІДУВАННЯ (в тій же сесії)
        introElement.classList.add('hidden-immediately');
        
        // Миттєво показуємо основні заголовки
        const heroTitle = document.querySelector(DOMSelectors.heroTitle);
        const heroSubtitle = document.querySelector(DOMSelectors.heroSubtitle);
        
        // ВИКОРИСТАННЯ КЛАСУ ДЛЯ МИТТЄВОЇ ПОЯВИ:
        // (Переконайтеся, що ваш CSS має стилі для .animate-in або використовуйте .fade-in.visible)
        if (heroTitle) heroTitle.classList.add('animate-in'); 
        if (heroSubtitle) heroSubtitle.classList.add('animate-in');
    }
}

// =========================================================================
// 3. ФУНКЦІЯ КЕРУВАННЯ МОБІЛЬНИМ МЕНЮ
// =========================================================================

/**
 * Ініціалізує логіку відкриття/закриття мобільного меню.
 */
function initializeMobileMenu() {
    const navToggle = document.querySelector(DOMSelectors.navToggle);
    const mainNav = document.querySelector(DOMSelectors.mainNav);
    const body = document.querySelector(DOMSelectors.body);

    if (!navToggle || !mainNav) return;

    const closeMenu = () => {
        // ВИПРАВЛЕНО: Використовуємо атрибут 'aria-expanded' для контролю видимості
        mainNav.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-expanded', 'false');
        body.classList.remove('menu-open');
    };

    const openMenu = () => {
        mainNav.setAttribute('aria-expanded', 'true');
        navToggle.setAttribute('aria-expanded', 'true');
        body.classList.add('menu-open');
    };

    // Обробник для кнопки-гамбургера
    navToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
        isOpen ? closeMenu() : openMenu();
    });

    // Обробник для закриття при кліку поза меню
    document.addEventListener('click', (e) => {
        const isMenuOpen = navToggle.getAttribute('aria-expanded') === 'true';
        if (isMenuOpen && !mainNav.contains(e.target) && !navToggle.contains(e.target)) {
            closeMenu();
        }
    });

    // Обробник для закриття при кліку на посилання
    mainNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeMenu);
    });
}

// =========================================================================
// 4. ФУНКЦІЯ ПЛАВНОГО СКРОЛУ
// =========================================================================

/**
 * Ініціалізує плавну прокрутку до секцій.
 */
function initializeSmoothScroll() {
    const headerHeight = DOMSelectors.headerHeight;

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        if (anchor.tagName.toLowerCase() === 'a') {
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                if (href === '#' || href === '') return;

                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();

                    const targetPosition = target.getBoundingClientRect().top + window.scrollY;
                    const offsetPosition = targetPosition - headerHeight;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });

                    // Після скролу закриваємо мобільне меню (якщо воно відкрите)
                    const navToggle = document.querySelector(DOMSelectors.navToggle);
                    const isMenuOpen = navToggle?.getAttribute('aria-expanded') === 'true';
                    
                    if (isMenuOpen) {
                        const mainNav = document.querySelector(DOMSelectors.mainNav);
                        const body = document.querySelector(DOMSelectors.body);
                        mainNav.setAttribute('aria-expanded', 'false');
                        navToggle.setAttribute('aria-expanded', 'false');
                        body.classList.remove('menu-open');
                    }
                }
            });
        }
    });
}

// =========================================================================
// 5. ФУНКЦІЯ ОНОВЛЕННЯ ЛІЧИЛЬНИКА ОБРАНИХ
// =========================================================================

/**
 * Оновлює текстові лічильники "Обрані" по всій сторінці.
 */
export const updateFavoritesCounter = () => {
    let favorites = [];
    try {
        const data = localStorage.getItem('favorites');
        favorites = data ? JSON.parse(data) : [];
    } catch (e) {
        console.error('Помилка читання localStorage для обраних:', e);
        // Якщо помилка, повертаємо порожній масив, щоб уникнути збою
        favorites = []; 
    }

    const count = favorites.length;
    
    // Оновлення текстових кнопок/лічильників
    document.querySelectorAll(DOMSelectors.favoritesBtn).forEach(btn => {
        btn.textContent = `Обрані (${count})`;
    });

    // Оновлення лічильника в модальному вікні/формі
    const selectCount = document.querySelector(DOMSelectors.selectCount);
    const proceedBtn = document.querySelector(DOMSelectors.proceedBtn);
    
    if (selectCount && proceedBtn) {
        selectCount.textContent = `(${count}/3)`;
        
        if (count > 0) {
            proceedBtn.classList.remove('disabled');
            // Використовуємо .removeAttribute(disabled) замість 'true'/'false'
            proceedBtn.removeAttribute('disabled'); 
        } else {
            proceedBtn.classList.add('disabled');
            proceedBtn.setAttribute('disabled', '');
        }
    }
    
    // повертаємо кількість для інших функцій
    return count; 
};

// =========================================================================
// ЗАПУСК КОДУ
// =========================================================================
document.addEventListener('DOMContentLoaded', () => {
    handleIntroAnimation();
    initializeMobileMenu();
    initializeSmoothScroll();
    updateFavoritesCounter(); 
});
  
