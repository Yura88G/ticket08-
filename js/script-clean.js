// =========================================================================
// script-clean.js
// СЕКЦІЯ 5.1: ІНІЦІАЛІЗАЦІЯ ТА ОСНОВНІ КОНСТАНТИ
// =========================================================================
// =========================================================================
// script-clean.js
// СЕКЦІЯ 5.1: ІНІЦІАЛІЗАЦІЯ ТА ОСНОВНІ КОНСТАНТИ
// =========================================================================

// !!! ІМПОРТ КРИТИЧНИХ ДАНИХ !!!
import { profiles } from './profiles-clean.js';
// ... решта DOMSelectors ...

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
  // =========================================================================
// script-clean.js (Продовження)
// =========================================================================

// ... (DOMSelectors, handleIntroAnimation, initializeMobileMenu, initializeSmoothScroll, updateFavoritesCounter) ...

// =========================================================================
// 6. ДОДАТКОВІ СЕЛЕКТОРИ ДЛЯ КАТАЛОГУ ТА МОДАЛЬНИХ ВІКОН
// =========================================================================

Object.assign(DOMSelectors, {
    // Catalog Grid
    profileGrid: '#profile-grid',
    paginationContainer: '#pagination',
    
    // Filters & Sliders
    ageSlider: '#age-range',
    ageValue: '#age-value',
    
    // Favorites Buttons
    viewFavoritesBtn: '#view-favorites',
    viewFavoritesMobileBtn: '#view-favorites-mobile',
    viewFavoritesIcon: '#view-favorites-icon',
    
    // Favorites Modal
    favoritesModal: '#favorites-modal',
    closeModalBtn: '#close-modal',
    favoritesList: '#favorites-list',
    modalCount: '#modal-count',
    modalProceedBtn: '#modal-proceed-btn',
    
    // Global CTA
    selectCount: '#select-count',
    proceedBtn: '#proceed-to-application',
});


// =========================================================================
// 7. МОДУЛЬ: КЕРУВАННЯ ОБРАНИМИ (LOCAL STORAGE)
// =========================================================================

/**
 * Модуль для взаємодії з localStorage та управління списком обраних.
 */
const FavoritesController = (() => {
    const MAX_PROFILES = 3;
    const STORAGE_KEY = 'favorites';

    const getFavorites = () => {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data).filter(Boolean) : [];
        } catch (e) {
            console.error('Помилка читання localStorage:', e);
            return [];
        }
    };

    const isFavorite = (id) => getFavorites().includes(id.toString());

    const toggleFavorite = (id) => {
        id = id.toString();
        let favs = getFavorites();

        if (favs.includes(id)) {
            // Видалення
            favs = favs.filter(f => f !== id);
        } else if (favs.length < MAX_PROFILES) {
            // Додавання
            favs.push(id);
        } else {
            // Ліміт
            alert(`Ви можете обрати максимум ${MAX_PROFILES} профілі!`);
            return false; // Не оновлюємо
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(favs));
        return true; // Оновлення відбулося
    };

    return {
        isFavorite,
        toggleFavorite,
        getFavorites,
        MAX_PROFILES
    };
})();


// =========================================================================
// 8. МОДУЛЬ: КЕРУВАННЯ МОДАЛЬНИМ ВІКНОМ "ОБРАНІ"
// =========================================================================

/**
 * Керує відкриттям, закриттям та рендерингом модального вікна обраних.
 */
function initializeFavoritesModal(profiles) {
    const favoritesModal = document.querySelector(DOMSelectors.favoritesModal);
    const closeModalBtn = document.querySelector(DOMSelectors.closeModalBtn);
    const favoritesList = document.querySelector(DOMSelectors.favoritesList);
    const modalCount = document.querySelector(DOMSelectors.modalCount);
    const modalProceedBtn = document.querySelector(DOMSelectors.modalProceedBtn);

    if (!favoritesModal) return;

    const renderFavoritesModal = () => {
        const favorites = FavoritesController.getFavorites();
        modalCount.textContent = `(${favorites.length}/${FavoritesController.MAX_PROFILES})`;

        if (favorites.length === 0) {
            favoritesList.innerHTML = '<p class="empty-favorites">Ви ще не обрали жодного профілю</p>';
            modalProceedBtn.classList.add('disabled');
            modalProceedBtn.disabled = true;
            return;
        }

        favoritesList.innerHTML = favorites.map(id => {
            // Звертаємося до глобального масиву profiles (поки що)
            const p = profiles.find(pr => pr.id == id);
            if (!p) return '';
            
            // Заміна одинарних лапок на зворотні
            return `
                <div class="favorite-item">
                    <img src="assets/img/${p.img}" alt="${p.name}" onerror="this.src='assets/img/placeholder-female.jpg'">
                    <div class="favorite-item-info">
                        <div class="favorite-item-name">${p.name}, ${p.age}</div>
                        <div class="favorite-item-city">${p.city}</div>
                    </div>
                    <button class="remove-favorite" data-id="${p.id}" title="Видалити">×</button>
                </div>
            `;
        }).join('');

        // Обробник видалення
        document.querySelectorAll('.remove-favorite').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                FavoritesController.toggleFavorite(id); // Видаляємо
                
                // Оновлюємо все
                updateFavoritesCounter(); 
                renderFavoritesModal();
                CatalogRenderer.updateSelectCount(); 
            });
        });

        modalProceedBtn.classList.toggle('disabled', favorites.length === 0);
        modalProceedBtn.disabled = favorites.length === 0;
    };

    const openModal = (e) => {
        e.preventDefault();
        renderFavoritesModal();
        favoritesModal.classList.add('is-open');
        document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
        favoritesModal.classList.remove('is-open');
        document.body.style.overflow = '';
    };

    // Обробники кліків на кнопках "Обрані"
    [DOMSelectors.viewFavoritesBtn, DOMSelectors.viewFavoritesMobileBtn, DOMSelectors.viewFavoritesIcon]
        .forEach(selector => {
            const btn = document.querySelector(selector);
            if (btn) btn.addEventListener('click', openModal);
        });

    closeModalBtn?.addEventListener('click', closeModal);
    favoritesModal.addEventListener('click', (e) => {
        if (e.target === favoritesModal) closeModal();
    });
}


// =========================================================================
// 9. МОДУЛЬ: КАТАЛОГ (ФІЛЬТРАЦІЯ, РЕНДЕРИНГ, ПАГІНАЦІЯ)
// =========================================================================

/**
 * Керує всією логікою каталогу: фільтрація, рендеринг, пагінація.
 */
const CatalogRenderer = (() => {
    if (!document.querySelector(DOMSelectors.profileGrid)) return {}; // Вихід, якщо ми не на сторінці каталогу

    const profileGrid = document.querySelector(DOMSelectors.profileGrid);
    const paginationContainer = document.querySelector(DOMSelectors.paginationContainer);
    const ageSlider = document.querySelector(DOMSelectors.ageSlider);
    const ageValue = document.querySelector(DOMSelectors.ageValue);
    const proceedBtn = document.querySelector(DOMSelectors.proceedBtn);
    const selectCountEl = document.querySelector(DOMSelectors.selectCount);

    let currentPage = 1;
    let filteredProfiles = [];
    const PROFILES_PER_PAGE = 6;
    
    // Парсинг початкового гендеру з URL
    let currentGender = new URLSearchParams(window.location.search).get('gender') || null;

    /**
     * Застосовує поточні фільтри до масиву profiles.
     */
    const applyFilters = (profiles) => {
        // 1. Фільтр за статтю
        let profilesToFilter = [...profiles];
        if (currentGender === 'male' || currentGender === 'female') {
            profilesToFilter = profilesToFilter.filter(p => p.gender === currentGender);
        }

        // 2. Фільтр по віку
        const maxAge = ageSlider?.value ? parseInt(ageSlider.value) : 100;
        
        filteredProfiles = profilesToFilter.filter(p => p.age <= maxAge);
        currentPage = 1; // Завжди скидаємо на першу сторінку при зміні фільтра
    };

    /**
     * Рендерить картки профілів.
     */
    const renderCatalog = () => {
        const start = (currentPage - 1) * PROFILES_PER_PAGE;
        const end = start + PROFILES_PER_PAGE;
        const pageProfiles = filteredProfiles.slice(start, end);

        profileGrid.innerHTML = pageProfiles.map(p => `
            <div class="profile-card">
                <div class="card-header-wrapper">
                    <img src="assets/img/${p.img}" alt="${p.name}" class="profile-photo" onerror="this.src='assets/img/placeholder-female.jpg'">
                    <button class="favorite-toggle ${FavoritesController.isFavorite(p.id) ? 'is-favorite' : ''}" data-id="${p.id}">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                    </button>
                </div>
                <div class="card-content">
                    <h3 class="profile-name">${p.name}, ${p.age}</h3>
                    <p class="profile-city">${p.city}</p>
                    <p class="profile-description">${p.description}</p>
                    <a href="profile.html?id=${p.id}" class="view-profile-btn">Переглянути</a>
                </div>
            </div>
        `).join('');

        // Додаємо обробники для кнопок "Обране"
        document.querySelectorAll('.favorite-toggle').forEach(btn => {
            btn.addEventListener('click', () => {
                const updated = FavoritesController.toggleFavorite(btn.dataset.id);
                if (updated) {
                    btn.classList.toggle('is-favorite');
                    updateSelectCount();
                    updateFavoritesCounter(); // Глобальне оновлення
                }
            });
        });

        updateSelectCount(); // Потрібно для початкового стану
    };

    /**
     * Рендерить пагінацію.
     */
    const renderPagination = () => {
        const totalPages = Math.ceil(filteredProfiles.length / PROFILES_PER_PAGE);
        paginationContainer.innerHTML = '';

        if (totalPages <= 1) return;

        const createBtn = (page, text, disabled = false, isDots = false) => {
            const el = document.createElement(isDots ? 'span' : 'button');
            el.className = isDots ? 'page-dots' : 'page-btn';
            el.textContent = text;
            
            if (!isDots) {
                el.disabled = disabled;
                if (page === currentPage) el.classList.add('active');
                if (page) {
                    el.addEventListener('click', () => {
                        currentPage = page;
                        renderCatalog();
                        renderPagination();
                        window.scrollTo({ top: 0, behavior: 'smooth' }); // Плавний скрол нагору
                    });
                }
            }
            return el;
        };

        // Кнопка "Назад"
        paginationContainer.appendChild(createBtn(currentPage - 1, '←', currentPage === 1));

        // Основні кнопки сторінок
        for (let i = 1; i <= totalPages; i++) {
            // Показуємо першу, останню, поточну та сусідні сторінки
            if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
                paginationContainer.appendChild(createBtn(i, i));
            } else if (i === currentPage - 2 || i === currentPage + 2) {
                // Три крапки
                paginationContainer.appendChild(createBtn(null, '...', true, true));
            }
        }
        
        // Кнопка "Вперед"
        paginationContainer.appendChild(createBtn(currentPage + 1, '→', currentPage === totalPages));
    };

    /**
     * Оновлює лічильник обраних біля кнопки "Перейти до заявки".
     */
    const updateSelectCount = () => {
        const count = FavoritesController.getFavorites().length;
        if (selectCountEl) {
            selectCountEl.textContent = `(${count}/${FavoritesController.MAX_PROFILES})`;
        }
        if (proceedBtn) {
            proceedBtn.classList.toggle('disabled', count === 0);
            proceedBtn.disabled = count === 0;
        }
    };

    // Обробники фільтрів
    const initializeFilterListeners = (profiles) => {
        if (ageSlider && ageValue) {
            // Ініціалізація початкового значення
            ageValue.textContent = `18–${ageSlider.value}`;

            // Обробник зміни віку
            ageSlider.addEventListener('input', () => {
                const maxAge = ageSlider.value;
                ageValue.textContent = `18–${maxAge}`;
                applyFilters(profiles);
                renderCatalog();
                renderPagination();
            });
        }
    };

    // Публічний інтерфейс модуля
    return {
        // Запускає каталог (викликається один раз)
        init: (profiles) => {
            applyFilters(profiles);
            renderCatalog();
            renderPagination();
            initializeFilterListeners(profiles);
        },
        updateSelectCount // Експортуємо для зовнішніх функцій (наприклад, модальне вікно)
    };
})();


// =========================================================================
// 10. ЗАГАЛЬНА ІНІЦІАЛІЗАЦІЯ (ПІСЛЯ DOMContentLoaded)
// =========================================================================

/**
 * Головна функція запуску всіх модулів.
 */
function initializeApp(profiles) {
    handleIntroAnimation();
    initializeMobileMenu();
    initializeSmoothScroll();
    
    // Запускаємо каталог, якщо ми на сторінці профілів
    if (document.querySelector(DOMSelectors.profileGrid)) {
        CatalogRenderer.init(profiles);
        initializeFavoritesModal(profiles); 
    }

    // Оновлюємо лічильник після завантаження
    updateFavoritesCounter();
}

// ... (Очікуємо на profiles.js для фінального запуску) ...

// document.addEventListener('DOMContentLoaded', () => {
//     initializeApp(profiles); // ЦЕ БУДЕ ВИКЛИКАНО ПІСЛЯ ЗАВАНТАЖЕННЯ PROFILES.JS
// });
// =========================================================================
// script-clean.js (Продовження)
// =========================================================================

// ... (FavoritesController, initializeFavoritesModal, CatalogRenderer) ...


// =========================================================================
// 11. МОДУЛЬ: FAQ АКОРДЕОН
// =========================================================================

/**
 * Ініціалізує логіку FAQ-акордеону (відкриття/закриття).
 */
function initializeFAQ() {
    document.querySelectorAll('.faq-question').forEach(question => {
        question.addEventListener('click', () => {
            const faqItem = question.parentElement;
            const isActive = faqItem.classList.contains('active');

            // Закриваємо всі інші елементи
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
            });

            // Відкриваємо поточний (якщо він не був активний)
            if (!isActive) {
                faqItem.classList.add('active');
            }
        });
    });
}


// =========================================================================
// 12. МОДУЛЬ: AOS ІНІЦІАЛІЗАЦІЯ
// =========================================================================

/**
 * Ініціалізує бібліотеку AOS, якщо вона підключена.
 */
function initializeAOS() {
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-out-quart',
            once: true,
            offset: 100
        });
        console.log('AOS успішно ініціалізовано!');
    } else {
        console.error('ПОМИЛКА: AOS не завантажився! Перевірте підключення бібліотеки AOS.');
        // Ви можете додати запасну логіку (наприклад, видалити клас 'fade-in' з усіх елементів),
        // якщо бібліотека не завантажилася, щоб контент був видимий.
    }
}


// =========================================================================
// 13. ГОЛОВНА ФУНКЦІЯ ЗАПУСКУ (ОНОВЛЕНА)
// =========================================================================

/**
 * Головна функція запуску всіх модулів.
 * @param {Array<Object>} profiles - Масив даних профілів (повинен бути імпортований з profiles.js).
 */
function initializeApp(profiles) {
    // Основна логіка (Секція 5.1)
    handleIntroAnimation();
    initializeMobileMenu();
    initializeSmoothScroll();
    
    // Анімації та FAQ (Секція 5.3)
    initializeAOS();
    initializeFAQ();
    
    // Логіка Каталогу (Секція 5.2)
    const isCatalogPage = document.querySelector(DOMSelectors.profileGrid);
    if (isCatalogPage) {
        // УВАГА: Тут потрібен глобальний масив profiles!
        // Передаємо profiles в ініціалізатор.
        CatalogRenderer.init(profiles);
        initializeFavoritesModal(profiles); 
    }

    // Завжди оновлюємо лічильник після ініціалізації всіх обробників
    updateFavoritesCounter();
}

// =========================================================================
// ЗАПУСК КОДУ
// =========================================================================
// ЗАПУСК КОДУ (ФІНАЛЬНА ВЕРСІЯ)
// =========================================================================

document.addEventListener('DOMContentLoaded', () => {
    // ЗАПУСКАЄМО ГОЛОВНУ ФУНКЦІЮ З МАСИВОМ ДАНИХ
    initializeApp(profiles);
});

// Експорт оновленого лічильника для зовнішніх модулів
export { updateFavoritesCounter };
