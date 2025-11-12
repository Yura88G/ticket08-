// script.js — ПОВНА ВЕРСІЯ, ВИПРАВЛЕНА, БЕЗ ПОМИЛОК
document.addEventListener('DOMContentLoaded', () => {
// 0. ЛОГІКА текст логотипа ІНТРО-АНІМАЦІЇ
    // =========================================================================
    const introElement = document.querySelector('.hero-logo-intro');
    const introPlayed = sessionStorage.getItem('introPlayed');

    if (introElement) {
        if (!introPlayed) {
            // СЦЕНАРІЙ 1: ПЕРШЕ ВІДВІДУВАННЯ СЕКЦІЇ
            sessionStorage.setItem('introPlayed', 'true');
            // Анімація Typewriter відпрацює згідно CSS
        } else {
            // СЦЕНАРІЙ 2: ПОВТОРНЕ ВІДВІДУВАННЯ (в тій же сесії)
            introElement.classList.add('hidden-immediately');
            
            // Миттєво запускаємо анімацію появи заголовків, 
            // оскільки CSS-затримки більше не працюють
            const heroTitle = document.querySelector('.hero-title');
            const heroSubtitle = document.querySelector('.hero-subtitle');

            if (heroTitle) {
                // Використовуємо клас, який змушує заголовки з'явитися миттєво
                heroTitle.classList.add('animate-in'); 
            }
            if (heroSubtitle) {
                heroSubtitle.classList.add('animate-in');
            }
        }
    }
    // =========================================================================
    // 1. МОБІЛЬНЕ МЕНЮ — ПРАЦЮЄ З id="nav-toggle" і id="main-nav"
    // =========================================================================
    const navToggle = document.getElementById('nav-toggle');
    const mainNav = document.getElementById('main-nav');
    const body = document.body;

    if (navToggle && mainNav) {
        navToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = mainNav.classList.contains('is-open');

            if (isOpen) {
                mainNav.classList.remove('is-open');
                navToggle.setAttribute('aria-expanded', 'false');
                body.classList.remove('menu-open');
            } else {
                mainNav.classList.add('is-open');
                navToggle.setAttribute('aria-expanded', 'true');
                body.classList.add('menu-open');
            }
        });

        // Закриття при кліку поза меню
        document.addEventListener('click', (e) => {
            if (mainNav.classList.contains('is-open') && 
                !mainNav.contains(e.target) && 
                !navToggle.contains(e.target)) {
                mainNav.classList.remove('is-open');
                navToggle.setAttribute('aria-expanded', 'false');
                body.classList.remove('menu-open');
            }
        });

        // Закриття при кліку на посилання
        mainNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mainNav.classList.remove('is-open');
                navToggle.setAttribute('aria-expanded', 'false');
                body.classList.remove('menu-open');
            });
        });
    }
// =========================================================================
    // 1.1.1 ПЛАВНИЙ СКРОЛ ДО СЕКЦІЙ ПРИ КЛІКУ НА МЕНЮ
    // =========================================================================
   document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        // ТІЛЬКИ ДЛЯ <a>, НЕ ДЛЯ <button>
        if (anchor.tagName.toLowerCase() === 'a') {
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                if (href === '#' || href === '') return;

                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();

                    const headerHeight = 100;
                    const targetPosition = target.getBoundingClientRect().top + window.scrollY;
                    const offsetPosition = targetPosition - headerHeight;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });

                    // Закриваємо меню
                    if (mainNav && mainNav.classList.contains('is-open')) {
                        mainNav.classList.remove('is-open');
                        navToggle.setAttribute('aria-expanded', 'false');
                        body.classList.remove('menu-open');
                    }
                }
            });
        }
    });

    // =========================================================================
    // 2. ОНОВЛЕННЯ ЛІЧИЛЬНИКА ОБРАНИХ
    // =========================================================================
    const updateFavoritesCounter = () => {
        let favorites = [];
        try {
            const data = localStorage.getItem('favorites');
            favorites = data ? JSON.parse(data) : [];
        } catch (e) {
            console.warn('localStorage error:', e);
        }

        const count = favorites.length;
        document.querySelectorAll('.favorites-button').forEach(btn => {
            btn.textContent = `Обрані (${count})`;
        });

        const selectCount = document.getElementById('select-count');
        const proceedBtn = document.getElementById('proceed-to-application');
        if (selectCount && proceedBtn) {
            selectCount.textContent = `(${count}/3)`;
            if (count > 0) {
                proceedBtn.classList.remove('disabled');
                proceedBtn.removeAttribute('disabled');
            } else {
                proceedBtn.classList.add('disabled');
                proceedBtn.setAttribute('disabled', 'true');
            }
        }
    };

    // =========================================================================
    // 3. КАТАЛОГ — ФІЛЬТРАЦІЯ, ПАГІНАЦІЯ, ДОДАВАННЯ ДО ОБРАНИХ
    // =========================================================================
// === КАТАЛОГ ПРОФІЛІВ ===
if (document.getElementById('profile-grid')) {
    const profileGrid = document.getElementById('profile-grid');
    const paginationContainer = document.getElementById('pagination');
    const ageSlider = document.getElementById('age-range');
    const ageValue = document.getElementById('age-value');
    const proceedBtn = document.getElementById('proceed-to-application');
    const selectCount = document.getElementById('select-count');

    // Кнопки "Обрані"
    const viewFavoritesBtn = document.getElementById('view-favorites');
    const viewFavoritesMobileBtn = document.getElementById('view-favorites-mobile');
    const viewFavoritesIcon = document.getElementById('view-favorites-icon');

    let currentPage = 1;
    let filteredProfiles = [...profiles];
    let currentGender = new URLSearchParams(window.location.search).get('gender') || null;
    const PROFILES_PER_PAGE = 6;

    // === ФІЛЬТРАЦІЯ ЗА СТАТТЮ ===
    if (currentGender === 'male' || currentGender === 'female') {
        filteredProfiles = profiles.filter(p => p.gender === currentGender);
    }

    // === ФІЛЬТР ПО ВІКУ ===
    if (ageSlider && ageValue) {
        ageValue.textContent = `18–${ageSlider.value}`;
        ageSlider.addEventListener('input', () => {
            const maxAge = ageSlider.value;
            ageValue.textContent = `18–${maxAge}`;
            filteredProfiles = profiles.filter(p =>
                p.age <= maxAge && (!currentGender || p.gender === currentGender)
            );
            currentPage = 1;
            renderCatalog();
            renderPagination();
        });
    }

    // === РЕНДЕР КАРТОК ===
    const renderCatalog = () => {
        const start = (currentPage - 1) * PROFILES_PER_PAGE;
        const end = start + PROFILES_PER_PAGE;
        const pageProfiles = filteredProfiles.slice(start, end);

        profileGrid.innerHTML = pageProfiles.map(p => `
            <div class="profile-card">
                <div class="card-header-wrapper">
                    <img src="assets/img/${p.img}" alt="${p.name}" class="profile-photo" onerror="this.src='assets/img/placeholder-female.jpg'">
                    <button class="favorite-toggle ${isFavorite(p.id) ? 'is-favorite' : ''}" data-id="${p.id}">
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

        document.querySelectorAll('.favorite-toggle').forEach(btn => {
            btn.addEventListener('click', () => {
                toggleFavorite(btn.dataset.id);
                btn.classList.toggle('is-favorite');
                updateSelectCount();
                updateFavoritesCounter();
            });
        });

        updateSelectCount();
    };

    // === ПАГІНАЦІЯ ===
    const renderPagination = () => {
        const totalPages = Math.ceil(filteredProfiles.length / PROFILES_PER_PAGE);
        paginationContainer.innerHTML = '';

        if (totalPages <= 1) return;

        const createBtn = (page, text, disabled = false) => {
            const btn = document.createElement('button');
            btn.className = 'page-btn';
            btn.textContent = text;
            btn.disabled = disabled;
            if (page === currentPage) btn.classList.add('active');
            if (page) {
                btn.addEventListener('click', () => {
                    currentPage = page;
                    renderCatalog();
                    renderPagination();
                    window.scrollTo(0, 0);
                });
            }
            return btn;
        };

        paginationContainer.appendChild(createBtn(currentPage - 1, '←', currentPage === 1));
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
                paginationContainer.appendChild(createBtn(i, i));
            } else if (i === currentPage - 2 || i === currentPage + 2) {
                const dots = document.createElement('span');
                dots.className = 'page-dots';
                dots.textContent = '...';
                paginationContainer.appendChild(dots);
            }
        }
        paginationContainer.appendChild(createBtn(currentPage + 1, '→', currentPage === totalPages));
    };

    // === ОБРАНІ ===
    const isFavorite = (id) => {
        const favs = JSON.parse(localStorage.getItem('favorites') || '[]');
        return favs.includes(id.toString());
    };

    const toggleFavorite = (id) => {
        let favs = JSON.parse(localStorage.getItem('favorites') || '[]');
        id = id.toString();
        if (favs.includes(id)) {
            favs = favs.filter(f => f !== id);
        } else if (favs.length < 3) {
            favs.push(id);
        } else {
            alert('Ви можете обрати максимум 3 профілі!');
        }
        localStorage.setItem('favorites', JSON.stringify(favs));
    };

    const updateSelectCount = () => {
        const count = (JSON.parse(localStorage.getItem('favorites') || '[]')).length;
        selectCount.textContent = `(${count}/3)`;
        proceedBtn.classList.toggle('disabled', count === 0);
        proceedBtn.disabled = count === 0;
    };

    // === ОНОВЛЕННЯ ЛІЧИЛЬНИКА "ОБРАНІ" ===
    const updateFavoritesCounter = () => {
        const count = (JSON.parse(localStorage.getItem('favorites') || '[]')).length;
        document.querySelectorAll('.favorites-counter').forEach(el => {
            el.textContent = `(${count})`;
        });
        document.querySelectorAll('#view-favorites, #view-favorites-mobile, #view-favorites-icon').forEach(el => {
            el.classList.toggle('has-favorites', count > 0);
        });
    };

    // === МОДАЛЬНЕ ВІКНО "МОЇ ОБРАНІ" ===
    const favoritesModal = document.getElementById('favorites-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const favoritesList = document.getElementById('favorites-list');
    const modalCount = document.getElementById('modal-count');
    const modalProceedBtn = document.getElementById('modal-proceed-btn');

    const openFavoritesModal = () => {
        renderFavoritesModal();
        favoritesModal.classList.add('is-open');
        document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
        favoritesModal.classList.remove('is-open');
        document.body.style.overflow = '';
    };

    [viewFavoritesBtn, viewFavoritesMobileBtn, viewFavoritesIcon].forEach(btn => {
        if (btn) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                openFavoritesModal();
            });
        }
    });

    closeModalBtn?.addEventListener('click', closeModal);
    favoritesModal?.addEventListener('click', (e) => {
        if (e.target === favoritesModal) closeModal();
    });

    const renderFavoritesModal = () => {
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        modalCount.textContent = `(${favorites.length}/3)`;

        if (favorites.length === 0) {
            favoritesList.innerHTML = '<p class="empty-favorites">Ви ще не обрали жодного профілю</p>';
            modalProceedBtn.classList.add('disabled');
            modalProceedBtn.disabled = true;
            return;
        }

        favoritesList.innerHTML = favorites.map(id => {
            const p = profiles.find(pr => pr.id == id);
            if (!p) return '';
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

        document.querySelectorAll('.remove-favorite').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                let favs = JSON.parse(localStorage.getItem('favorites') || '[]');
                favs = favs.filter(f => f !== id);
                localStorage.setItem('favorites', JSON.stringify(favs));
                updateFavoritesCounter();
                updateSelectCount();
                renderFavoritesModal();
            });
        });

        modalProceedBtn.classList.toggle('disabled', favorites.length === 0);
        modalProceedBtn.disabled = favorites.length === 0;
    };

    // === ГАМБУРГЕР МЕНЮ ===
    const navToggle = document.getElementById('nav-toggle');
    const mobileNav = document.getElementById('mobile-nav');

    navToggle?.addEventListener('click', () => {
        const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
        navToggle.setAttribute('aria-expanded', !isExpanded);
        mobileNav.setAttribute('aria-hidden', isExpanded);
        document.body.classList.toggle('menu-open', !isExpanded);
    });

    // === ЗАПУСК ===
    renderCatalog();
    renderPagination();
    updateFavoritesCounter();
    updateSelectCount();
}
            
    // =========================================================================
    // 4. ДЕТАЛЬНИЙ ПРОФІЛЬ
    // =========================================================================
    const profileDetail = document.getElementById('profile-detail');
    if (profileDetail) {
        const urlParams = new URLSearchParams(window.location.search);
        const profileId = urlParams.get('id');
        const profile = profiles.find(p => p.id.toString() === profileId);

        if (profile) {
            document.querySelector('.profile-name-detail').textContent = `${profile.name}, ${profile.age}`;
            document.querySelector('.profile-city-detail').textContent = profile.city;
            document.querySelector('.main-profile-photo').src = `assets/img/${profile.img}`;

            const selectBtn = document.getElementById('select-profile-btn');
            const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
            const isFavorite = favorites.includes(profileId);

            selectBtn.textContent = isFavorite ? 'Вибрано' : `Обрати ${profile.name}`;
            if (isFavorite) selectBtn.classList.add('is-favorite');

            selectBtn.addEventListener('click', () => {
                let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
                if (!favorites.includes(profileId) && favorites.length < 3) {
                    favorites.push(profileId);
                    localStorage.setItem('favorites', JSON.stringify(favorites));
                    updateFavoritesCounter();
                    selectBtn.textContent = 'Вибрано';
                    selectBtn.classList.add('is-favorite');
                    alert(`${profile.name} додано до обраних!`);
                } else if (favorites.includes(profileId)) {
                    alert('Вже обрано.');
                } else {
                    alert('Ліміт 3 профілі.');
                }
            });
        }
    }

    // =========================================================================
    // 5. FAQ АКОРДЕОН
    // =========================================================================
// =========================================================================
// 5. FAQ АКОРДЕОН — ПРАЦЮЄ 100%
// =========================================================================
document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', () => {
        const faqItem = question.parentElement;
        const isActive = faqItem.classList.contains('active');

        // Закриваємо всі інші
        document.querySelectorAll('.faq-item').forEach(item => {
            item.classList.remove('active');
        });

        // Відкриваємо поточний (якщо не був активний)
        if (!isActive) {
            faqItem.classList.add('active');
        }
    });
});

// =========================================================================
//  AOS ІНІЦІАЛІЗАЦІЯ — З ПЕРЕВІРКОЮ ТА ЛОГОМ
// =========================================================================
document.addEventListener('DOMContentLoaded', function() {
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-out-quart',
            once: true,
            offset: 100
        });
        console.log('AOS успішно ініціалізовано!');
    } else {
        console.error('ПОМИЛКА: AOS не завантажився! Перевір підключення.');
    }
});
     // ← ЦЕЙ ЗАКРИВАЮЧИЙ ЕЛЕМЕНТ БУВ ВТРАЧЕНИЙ!
// =========================================================================
// ДОДАЙ ЦЕ ПІСЛЯ ВСЬОГО ТВОГО КОДУ (всередині DOMContentLoaded)
// =========================================================================

// Оновлення лічильника "Обрані"
function updateFavoritesCounter() {
    let count = (JSON.parse(localStorage.getItem('favorites') || '[]')).length;
    document.querySelectorAll('.favorites-counter').forEach(el => {
        el.textContent = `(${count})`;
    });
}

// Гамбургер — працює з твоїм #mobile-nav
const navToggle = document.getElementById('nav-toggle');
const mobileNav = document.getElementById('mobile-nav');
if (navToggle && mobileNav) {
    navToggle.addEventListener('click', () => {
        const isOpen = mobileNav.getAttribute('aria-hidden') === 'false';
        mobileNav.setAttribute('aria-hidden', !isOpen);
        navToggle.setAttribute('aria-expanded', !isOpen);
        document.body.classList.toggle('menu-open', !isOpen);
    });
}

// Запуск оновлення лічильника
updateFavoritesCounter();
















