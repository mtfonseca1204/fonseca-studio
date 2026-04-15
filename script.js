document.addEventListener('DOMContentLoaded', () => {
    initPreloader();
    initDarkMode();
    initMobileMenu();
    initNavbarScroll();
    initSmoothScroll();
    initScrollReveal();
    initHeroAsciiTerrain();
    initHeroCopyEmail();
    initWorkProjectCarousels();
    initProjectModals();
    initTestimonialReadMore();
    updateYear();
    initCaseStudyNav();
    initThemeCompare();
});

// =====================================================
// SCROLL REVEAL
// =====================================================
function initScrollReveal() {
    const els = document.querySelectorAll('[data-anim]');
    if (!els.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('in-view');
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    els.forEach(el => observer.observe(el));
}

// =====================================================
// TESTIMONIALS — clamp long quotes + read more / read less
// =====================================================
function initTestimonialReadMore() {
    const root = document.querySelector('.section-testimonials');
    if (!root) return;

    const cards = Array.from(root.querySelectorAll('.testimonial-card'));

    function measureCard(card) {
        const p = card.querySelector('.testimonial-card__text');
        const btn = card.querySelector('.testimonial-card__read-more');
        if (!p || !btn) return;
        if (card.classList.contains('testimonial-card--expanded')) return;

        p.classList.remove('testimonial-card__text--clamped');
        btn.hidden = true;
        btn.textContent = 'Read more';
        btn.setAttribute('aria-expanded', 'false');

        p.classList.add('testimonial-card__text--clamped');
        const overflow = p.scrollHeight > p.clientHeight + 2;
        if (overflow) {
            btn.hidden = false;
        } else {
            p.classList.remove('testimonial-card__text--clamped');
        }
    }

    cards.forEach((card) => {
        const btn = card.querySelector('.testimonial-card__read-more');
        btn?.addEventListener('click', () => {
            const expanding = !card.classList.contains('testimonial-card--expanded');
            card.classList.toggle('testimonial-card--expanded', expanding);
            const p = card.querySelector('.testimonial-card__text');
            if (p) p.classList.toggle('testimonial-card__text--clamped', !expanding);
            btn.setAttribute('aria-expanded', expanding ? 'true' : 'false');
            btn.textContent = expanding ? 'Read less' : 'Read more';
        });
    });

    function runMeasure() {
        cards.forEach(measureCard);
    }

    requestAnimationFrame(() => {
        requestAnimationFrame(runMeasure);
    });
    if (document.fonts?.ready) {
        document.fonts.ready.then(runMeasure);
    }

    let resizeT;
    window.addEventListener('resize', () => {
        clearTimeout(resizeT);
        resizeT = setTimeout(() => cards.forEach(measureCard), 150);
    });
}

// =====================================================
// HERO — Kanagawa wave image → ASCII with wave motion
// =====================================================
function initHeroAsciiTerrain() {
    const canvas = document.getElementById('heroAsciiTerrain');
    const img = document.getElementById('heroAsciiSrc');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const sampleCanvas = document.createElement('canvas');
    const sctx = sampleCanvas.getContext('2d', { willReadFrequently: true });

    const chars = ' .·:;+*%#@'.split('');
    let w = 0; let h = 0; let step = 6; let cols = 0; let rows = 0; let time = 0; let animId;
    let lumGrid = null;

    function buildFallbackLumGrid() {
        if (!cols || !rows || cols < 2 || rows < 2) return;
        lumGrid = new Float32Array(cols * rows);
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const nx = c / (cols - 1 || 1);
                const ny = r / (rows - 1 || 1);
                let v = 0;
                const crestY = 0.08 + nx * 0.72 + Math.sin(nx * 3.2) * 0.04;
                const thick = 0.22;
                if (ny > crestY && ny < crestY + thick) {
                    const t = (ny - crestY) / thick;
                    v = 0.25 + 0.55 * (1 - Math.pow(Math.abs(t - 0.35), 1.4));
                }
                const curl = Math.hypot(nx - 0.42, ny - 0.14);
                if (curl < 0.12) v = Math.max(v, 0.5 - curl * 2.5);
                lumGrid[r * cols + c] = Math.min(1, v);
            }
        }
    }

    function rebuildLumGrid() {
        if (!img?.naturalWidth || !sctx || cols < 2 || rows < 2) {
            lumGrid = null;
            return;
        }
        const iw = img.naturalWidth;
        const ih = img.naturalHeight;
        const ir = iw / ih;
        const cr = cols / rows;
        let sx; let sy; let sw; let sh;
        if (ir > cr) { sh = ih; sw = sh * cr; sx = (iw - sw) / 2; sy = 0; }
        else { sw = iw; sh = sw / cr; sx = 0; sy = (ih - sh) / 2; }

        sampleCanvas.width = cols;
        sampleCanvas.height = rows;
        sctx.fillStyle = '#e8e0d0';
        sctx.fillRect(0, 0, cols, rows);
        try {
            sctx.drawImage(img, sx, sy, sw, sh, 0, 0, cols, rows);
        } catch (e) {
            buildFallbackLumGrid();
            return;
        }
        let data;
        try {
            data = sctx.getImageData(0, 0, cols, rows).data;
        } catch (e) {
            buildFallbackLumGrid();
            return;
        }

        lumGrid = new Float32Array(cols * rows);
        let minL = 1; let maxL = 0;
        const raw = new Float32Array(cols * rows);
        for (let i = 0; i < cols * rows; i++) {
            const o = i * 4;
            const lum = (data[o] * 0.299 + data[o + 1] * 0.587 + data[o + 2] * 0.114) / 255;
            raw[i] = 1 - lum;
            if (raw[i] < minL) minL = raw[i];
            if (raw[i] > maxL) maxL = raw[i];
        }
        const range = maxL - minL || 1;
        let peak = 0;
        for (let i = 0; i < cols * rows; i++) {
            lumGrid[i] = Math.min(1, Math.pow((raw[i] - minL) / range, 0.45) * 1.5);
            if (lumGrid[i] > peak) peak = lumGrid[i];
        }
        if (peak < 0.04) {
            buildFallbackLumGrid();
        }
    }

    function resize() {
        const parent = canvas.parentElement;
        const rect = parent ? parent.getBoundingClientRect() : { width: 0, height: 0 };
        if (rect.width < 8 || rect.height < 8) {
            return false;
        }
        w = Math.floor(rect.width * 0.56);
        h = Math.floor(rect.height);
        if (w < 8 || h < 8) return false;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        step = Math.max(5, Math.min(7, Math.floor(w / 95)));
        cols = Math.ceil(w / step);
        rows = Math.ceil(h / step);
        rebuildLumGrid();
        if (!lumGrid) buildFallbackLumGrid();
        return true;
    }

    function draw() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        ctx.clearRect(0, 0, w, h);
        if (!lumGrid) return;

        ctx.font = `${step}px 'JetBrains Mono', monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const t = reduceMotion ? 0 : time;
        const baseR = isDark ? 255 : 28;
        const baseG = isDark ? 255 : 28;
        const baseB = isDark ? 255 : 30;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const idx = r * cols + c;
                let val = lumGrid[idx];
                if (val < 0.02) continue;

                const nx = c / (cols - 1 || 1);
                const ny = r / (rows - 1 || 1);

                const wave = Math.sin(nx * 6 - t * 0.9 + ny * 2) * 0.03
                           + Math.sin(nx * 12 + t * 1.4) * Math.cos(ny * 8 - t * 0.6) * 0.02;
                val = Math.max(0, Math.min(1, val + wave));

                const fadeL = Math.pow(Math.min(1, nx / 0.08), 1.5);
                const fadeR = Math.pow(Math.min(1, (1 - nx) / 0.04), 1.2);
                const fadeT = Math.pow(Math.min(1, ny / 0.12), 1.8);
                const fadeB = Math.pow(Math.min(1, (1 - ny) / 0.06), 1.4);
                val *= fadeL * fadeR * fadeT * fadeB;
                if (val < 0.02) continue;

                const ci = Math.min(chars.length - 1, Math.floor(val * chars.length));
                if (ci === 0) continue;

                const px = c * step + step * 0.5;
                const py = r * step + step * 0.5;
                const alpha = isDark
                    ? Math.min(0.95, val * 0.9 + 0.1)
                    : Math.min(0.92, val * 0.85 + 0.08);
                ctx.fillStyle = `rgba(${baseR},${baseG},${baseB},${alpha})`;
                ctx.fillText(chars[ci], px, py);
            }
        }
    }

    function loop() {
        time += 0.012;
        draw();
        animId = requestAnimationFrame(loop);
    }

    function kick() {
        cancelAnimationFrame(animId);
        if (!resize()) {
            requestAnimationFrame(kick);
            return;
        }
        loop();
    }

    function boot() {
        requestAnimationFrame(() => {
            requestAnimationFrame(kick);
        });
    }

    if (img && (!img.complete || !img.naturalWidth)) {
        img.addEventListener('load', boot, { once: true });
        img.addEventListener('error', boot, { once: true });
    } else {
        boot();
    }
    window.addEventListener('load', kick, { once: true });

    let layoutKickT;
    window.addEventListener('fonseca:layoutready', () => {
        clearTimeout(layoutKickT);
        layoutKickT = setTimeout(() => {
            cancelAnimationFrame(animId);
            kick();
        }, 40);
    });

    window.addEventListener('pageshow', (ev) => {
        if (ev.persisted) kick();
    });

    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => {
            cancelAnimationFrame(animId);
            kick();
        });
    }

    const heroSection = canvas.closest('.hero--intro');
    let roT;
    if (heroSection && typeof ResizeObserver !== 'undefined') {
        const ro = new ResizeObserver(() => {
            clearTimeout(roT);
            roT = setTimeout(() => {
                cancelAnimationFrame(animId);
                if (resize()) loop();
            }, 100);
        });
        ro.observe(heroSection);
    }

    let resizeT;
    window.addEventListener('resize', () => {
        clearTimeout(resizeT);
        resizeT = setTimeout(() => {
            cancelAnimationFrame(animId);
            if (resize()) loop();
        }, 120);
    });

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) cancelAnimationFrame(animId);
        else if (resize()) loop();
    });
}

// =====================================================
// HERO — copy email shortcut
// =====================================================
const HERO_EMAIL = 'fonsecaa.design@gmail.com';

function initHeroCopyEmail() {
    document.addEventListener('keydown', (e) => {
        if (e.defaultPrevented) return;
        const t = e.target;
        if (t.closest?.('.proj-modal')) return;
        const tag = t?.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || t?.isContentEditable) return;
        if (e.key !== 'c' && e.key !== 'C') return;
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        e.preventDefault();
        navigator.clipboard?.writeText(HERO_EMAIL).catch(() => {});
    });
}

// =====================================================
// WORK CARD COVER CAROUSELS
// =====================================================
function initWorkProjectCarousels() {
    document.querySelectorAll('[data-project-carousel]').forEach((root) => {
        const slides = root.querySelectorAll('.project-card__slide');
        const dots = root.querySelectorAll('.project-card__carousel-dot');
        if (slides.length < 2) return;

        let current = 0;
        let timer;
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        function goTo(idx) {
            const n = slides.length;
            const next = ((idx % n) + n) % n;
            slides[current].classList.remove('active');
            dots[current]?.classList.remove('active');
            current = next;
            slides[current].classList.add('active');
            dots[current]?.classList.add('active');
        }

        function startAuto() {
            clearInterval(timer);
            if (reduceMotion) return;
            timer = setInterval(() => goTo(current + 1), 4500);
        }

        dots.forEach((dot) => {
            dot.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                clearInterval(timer);
                goTo(parseInt(dot.dataset.idx, 10));
                startAuto();
            });
        });

        root.addEventListener('mouseenter', () => clearInterval(timer));
        root.addEventListener('mouseleave', startAuto);
        startAuto();
    });
}

// =====================================================
// PROJECT MODALS — Radilson-style split panel
// =====================================================
function initProjectModals() {
    const modalEl = document.getElementById('projModal');
    if (!modalEl) return;

    const backdrop = modalEl.querySelector('.proj-modal__backdrop');
    const closeBtn = modalEl.querySelector('.proj-modal__close');
    const titleEl = modalEl.querySelector('.proj-modal__title');
    const imgEl = modalEl.querySelector('.proj-modal__img');
    const dotsWrap = modalEl.querySelector('.proj-modal__dots');
    const linksWrap = modalEl.querySelector('.proj-modal__links');
    const prevBtn = modalEl.querySelector('.proj-modal__arrow--prev');
    const nextBtn = modalEl.querySelector('.proj-modal__arrow--next');

    const companyEl = document.getElementById('pmCompany');
    const yearEl = document.getElementById('pmYear');
    const typeEl = document.getElementById('pmType');
    const overviewEl = document.getElementById('pmOverview');
    const bulletsEl = document.getElementById('pmBullets');

    const projects = {
        hedgehog: {
            title: 'Hedgehog Protocol',
            company: 'Hedgehog Protocol',
            year: '2024-2026',
            type: 'Web3 Product',
            overview: '<strong>Hedgehog</strong> is a prediction market platform built on Solana. The project covered the full product lifecycle, from market research and competitive analysis through UI/UX design to a polished landing page and 3D motion study.',
            bullets: [
                'Designed the complete product experience from zero, including market creation flows, portfolio views, and real-time betting interfaces.',
                'Crafted a high-conversion landing page that clearly communicates the value proposition to both crypto-native and mainstream users.',
                'Produced 3D motion assets in Blender to elevate the brand presence across marketing touchpoints.'
            ],
            images: [
                'Hedgehog product/1920x1200.png',
                '1920x1200/Cover Hedgehog Hero cover.png'
            ],
            links: [
                { label: 'Product case study', href: 'project-hedgehog-product.html', primary: true },
                { label: 'Landing page', href: 'project-hedgehog.html' },
                { label: '3D motion', href: 'hedgehog-3d.html' }
            ]
        },
        transparent: {
            title: 'Transparent.space',
            company: 'Transparent Space',
            year: '2025-2026',
            type: 'Web3 / Brand',
            overview: '<strong>Transparent.space</strong> leverages institutional-grade on-chain data to power market-making dashboards. The project combined deep product thinking with a cohesive brand system.',
            bullets: [
                'Designed a real-time analytics dashboard for institutional traders, balancing information density with clarity.',
                'Crafted a brand identity system that retained the original essence while introducing a fresh, compelling design.',
                'Implemented the website with CursorAI with animations and engaging content to bring the design to life.'
            ],
            images: [
                '1920x1200/Cover transparent Hero cover.png',
                '1920x1200/Cover transparent Hero cover-1.png',
                'Transparent UI/1.png',
                'Transparent UI/3.png',
                'Transparent UI/5.png'
            ],
            links: [
                { label: 'Product case study', href: 'project-transparent-space.html', primary: true },
                { label: 'Brand system', href: 'project-transparent-space-brand.html' }
            ]
        },
        picnic: {
            title: 'Picnic',
            company: 'Picnic',
            year: '2025',
            type: 'Brand / Campaign',
            overview: '<strong>Picnic</strong> is a social-driven brand with a strong community focus. The project delivered a cohesive visual identity system across social media, launch events, and growth touchpoints.',
            bullets: [
                'Developed a visual identity system that scales across social, print, and digital media.',
                'Created campaign-ready assets for product launches, seasonal moments, and community engagement.',
                'Established brand guidelines ensuring consistency across all future touchpoints.'
            ],
            images: [
                '1920x1200/Cover Picnic Hero cover.png',
                'Picnic/1.png',
                'Picnic/5.png',
                'Picnic/7.png',
                'Picnic/9.png'
            ],
            links: [
                { label: 'Brand case study', href: 'project-picnic.html', primary: true }
            ]
        }
    };

    let current = 0;
    let currentImages = [];

    function buildDots() {
        dotsWrap.innerHTML = '';
        currentImages.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.className = 'proj-modal__dot' + (i === current ? ' active' : '');
            dot.addEventListener('click', () => showSlide(i));
            dotsWrap.appendChild(dot);
        });
    }

    function open(key) {
        const proj = projects[key];
        if (!proj) return;

        currentImages = proj.images;
        current = 0;

        titleEl.textContent = proj.title;
        if (companyEl) companyEl.textContent = proj.company;
        if (yearEl) yearEl.textContent = proj.year;
        if (typeEl) typeEl.textContent = proj.type;
        if (overviewEl) overviewEl.innerHTML = proj.overview;
        if (bulletsEl) {
            bulletsEl.innerHTML = '';
            proj.bullets.forEach(b => {
                const li = document.createElement('li');
                li.textContent = b;
                bulletsEl.appendChild(li);
            });
        }

        showSlide(0);
        buildDots();

        linksWrap.innerHTML = '';
        proj.links.forEach(link => {
            const a = document.createElement('a');
            a.href = link.href;
            a.className = 'proj-modal__link' + (link.primary ? ' proj-modal__link--primary' : '');
            a.textContent = link.label;
            linksWrap.appendChild(a);
        });

        modalEl.classList.add('active');
        modalEl.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function close() {
        modalEl.classList.remove('active');
        modalEl.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    function showSlide(idx) {
        current = ((idx % currentImages.length) + currentImages.length) % currentImages.length;
        imgEl.src = currentImages[current];
        imgEl.alt = titleEl.textContent + ' — image ' + (current + 1);
        const dots = dotsWrap.querySelectorAll('.proj-modal__dot');
        dots.forEach((d, i) => d.classList.toggle('active', i === current));
    }

    prevBtn.addEventListener('click', () => showSlide(current - 1));
    nextBtn.addEventListener('click', () => showSlide(current + 1));
    closeBtn.addEventListener('click', close);
    backdrop.addEventListener('click', close);

    document.addEventListener('keydown', (e) => {
        if (!modalEl.classList.contains('active')) return;
        if (e.key === 'Escape') close();
        if (e.key === 'ArrowLeft') showSlide(current - 1);
        if (e.key === 'ArrowRight') showSlide(current + 1);
    });

    document.querySelectorAll('[data-open-modal]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            open(btn.dataset.openModal);
        });
    });
}

// =====================================================
// PRELOADER
// =====================================================
function initPreloader() {
    const preloader = document.getElementById('preloader');
    if (!preloader) return;

    function isPageReload() {
        try {
            const nav = performance.getEntriesByType('navigation')[0];
            if (nav && nav.type === 'reload') return true;
        } catch (e) { /* ignore */ }
        return typeof performance.navigation !== 'undefined' && performance.navigation.type === 1;
    }

    const hasSeenPreloader = sessionStorage.getItem('preloaderShown') === 'true';
    const isReload = isPageReload();

    function notifyLayoutReady() {
        requestAnimationFrame(() => {
            window.dispatchEvent(new CustomEvent('fonseca:layoutready'));
        });
    }

    if (hasSeenPreloader && !isReload) {
        preloader.style.display = 'none';
        preloader.classList.add('complete');
        document.body.classList.remove('loading');
        document.body.classList.add('loaded');
        notifyLayoutReady();
        return;
    }

    sessionStorage.setItem('preloaderShown', 'true');
    document.body.classList.add('loading');

    setTimeout(() => {
        preloader.classList.add('complete');
        document.body.classList.remove('loading');
        document.body.classList.add('loaded');
        setTimeout(() => {
            preloader.style.display = 'none';
            notifyLayoutReady();
        }, 500);
    }, 1800);
}

// =====================================================
// DARK MODE
// =====================================================
function initDarkMode() {
    const toggle = document.getElementById('darkModeToggle');
    const currentTheme = localStorage.getItem('theme') || 'light';

    if (currentTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    }

    if (toggle) {
        toggle.addEventListener('click', () => {
            const theme = document.documentElement.getAttribute('data-theme');
            const newTheme = theme === 'dark' ? 'light' : 'dark';
            document.body.classList.add('theme-transition');
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            setTimeout(() => document.body.classList.remove('theme-transition'), 300);
        });
    }
}

// =====================================================
// MOBILE MENU
// =====================================================
function initMobileMenu() {
    const btn = document.querySelector('.mobile-menu-toggle');
    const menu = document.querySelector('.mobile-menu');
    if (!btn || !menu) return;

    btn.addEventListener('click', () => {
        btn.classList.toggle('active');
        menu.classList.toggle('active');
        document.body.classList.toggle('menu-open');
    });

    document.querySelectorAll('.mobile-menu a').forEach(link => {
        link.addEventListener('click', () => {
            btn.classList.remove('active');
            menu.classList.remove('active');
            document.body.classList.remove('menu-open');
        });
    });
}

// =====================================================
// NAVBAR SCROLL
// =====================================================
function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const y = window.pageYOffset;
        navbar.classList.toggle('scrolled', y > 100);
        navbar.style.transform = (y > lastScroll && y > 500) ? 'translateY(-100%)' : 'translateY(0)';
        lastScroll = y;
    });
}

// =====================================================
// SMOOTH SCROLL
// =====================================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            const target = document.querySelector(href);
            if (!target) return;
            e.preventDefault();
            const nav = document.querySelector('.navbar');
            const navH = nav ? nav.getBoundingClientRect().height : 80;
            const top = target.getBoundingClientRect().top + window.scrollY - navH - 12;
            window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
        });
    });
}

// =====================================================
// UPDATE YEAR
// =====================================================
function updateYear() {
    const el = document.getElementById('current-year');
    if (el) el.textContent = new Date().getFullYear();
}

// =====================================================
// CASE STUDY NAV
// =====================================================
function initCaseStudyNav() {
    const sideNav = document.getElementById('caseSideNav');
    const caseContent = document.querySelector('.project-case-content');
    const sections = document.querySelectorAll('.case-section');
    const heroNav = document.getElementById('projectCaseNav');
    if (!caseContent || !sections.length) return;

    const heroNavLinks = heroNav ? heroNav.querySelectorAll('.case-nav-link') : [];
    const sideNavLinks = sideNav ? sideNav.querySelectorAll('.case-side-nav-link') : [];

    function getCurrentSection() {
        let current = '';
        const scrollY = window.scrollY + 200;
        sections.forEach(s => { if (scrollY >= s.offsetTop) current = s.id; });
        if (!current && sections.length) current = sections[0].id;
        return current;
    }

    function update() {
        const cur = getCurrentSection();
        [heroNavLinks, sideNavLinks].forEach(links => {
            links.forEach(l => {
                l.classList.toggle('active', l.getAttribute('href') === '#' + cur);
            });
        });
        if (sideNav) {
            const top = caseContent.offsetTop - 150;
            const bottom = caseContent.offsetTop + caseContent.offsetHeight - 300;
            const y = window.scrollY;
            sideNav.classList.toggle('visible', y >= top && y <= bottom);
        }
    }

    window.addEventListener('scroll', update);
    window.addEventListener('load', update);
}

// =====================================================
// THEME COMPARE
// =====================================================
function initThemeCompare() {
    document.querySelectorAll('[data-theme-compare]').forEach((root) => {
        const viewport = root.querySelector('.theme-compare-viewport');
        const clip = root.querySelector('.theme-compare-clip');
        const baseImg = root.querySelector('.theme-compare-base');
        const lightImg = root.querySelector('.theme-compare-top');
        const handle = root.querySelector('.theme-compare-handle');
        if (!viewport || !clip || !baseImg || !lightImg || !handle) return;

        let pos = 0.5, dragging = false, activePointerId = null;

        function syncLightSize() {
            const w = baseImg.offsetWidth, h = baseImg.offsetHeight;
            if (!w || !h) return;
            lightImg.style.width = `${w}px`;
            lightImg.style.height = `${h}px`;
            lightImg.style.objectFit = 'contain';
            lightImg.style.objectPosition = 'top left';
        }

        const ro = new ResizeObserver(() => syncLightSize());
        ro.observe(viewport);
        if (!baseImg.complete) baseImg.addEventListener('load', syncLightSize, { once: true });
        syncLightSize();

        function setPos(p) {
            pos = Math.max(0, Math.min(1, p));
            clip.style.width = `${pos * 100}%`;
            handle.style.left = `${pos * 100}%`;
            handle.setAttribute('aria-valuenow', String(Math.round(pos * 100)));
        }

        setPos(0.5);

        function toPos(clientX) {
            const rect = viewport.getBoundingClientRect();
            return rect.width <= 0 ? pos : (clientX - rect.left) / rect.width;
        }

        viewport.addEventListener('pointerdown', (e) => {
            if (e.button !== 0) return;
            dragging = true; activePointerId = e.pointerId;
            viewport.setPointerCapture(e.pointerId);
            setPos(toPos(e.clientX));
        });
        viewport.addEventListener('pointermove', (e) => { if (dragging && e.pointerId === activePointerId) setPos(toPos(e.clientX)); });
        viewport.addEventListener('pointerup', (e) => { if (e.pointerId === activePointerId) { dragging = false; activePointerId = null; try { viewport.releasePointerCapture(e.pointerId); } catch(_){} } });
        viewport.addEventListener('pointercancel', (e) => { if (e.pointerId === activePointerId) { dragging = false; activePointerId = null; } });

        handle.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') { e.preventDefault(); setPos(pos - 0.05); }
            else if (e.key === 'ArrowRight') { e.preventDefault(); setPos(pos + 0.05); }
            else if (e.key === 'Home') { e.preventDefault(); setPos(0); }
            else if (e.key === 'End') { e.preventDefault(); setPos(1); }
        });
    });
}

// =====================================================
// LEGACY STUBS
// =====================================================
function initHeroClock() {}
function initHeroGrid() {
    const canvas = document.getElementById('heroGrid');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const spacing = 40, dotRadius = 1;
    let dots = [], mouseX = -1000, mouseY = -1000, animationId, time = 0;

    function resize() {
        canvas.width = window.innerWidth; canvas.height = window.innerHeight;
        const cols = Math.ceil(canvas.width / spacing) + 1;
        const rows = Math.ceil(canvas.height / spacing) + 1;
        dots = [];
        for (let i = 0; i <= cols; i++) for (let j = 0; j <= rows; j++)
            dots.push({ x: i * spacing, y: j * spacing, hoverOpacity: 0, pulseOffset: Math.random() * Math.PI * 2, pulseSpeed: 0.4 + Math.random() * 0.5 });
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const color = isDark ? '255,255,255' : '0,0,0';
        dots.forEach(dot => {
            const breathe = (Math.sin(time * dot.pulseSpeed + dot.pulseOffset) + 1) / 2;
            const finalOpacity = (isDark ? 0.1 : 0.06) + breathe * (isDark ? 0.08 : 0.05) + dot.hoverOpacity * (isDark ? 0.5 : 0.35);
            ctx.beginPath(); ctx.arc(dot.x, dot.y, dotRadius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${color}, ${finalOpacity})`; ctx.fill();
        });
        const gradient = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) * 0.55);
        const bg = isDark ? '10,10,10' : '255,255,255';
        gradient.addColorStop(0, `rgba(${bg}, 0)`); gradient.addColorStop(0.6, `rgba(${bg}, 0)`); gradient.addColorStop(1, `rgba(${bg}, 1)`);
        ctx.fillStyle = gradient; ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    function update() {
        time += 0.02;
        dots.forEach(dot => {
            const dx = mouseX - dot.x, dy = mouseY - dot.y, dist = Math.sqrt(dx * dx + dy * dy);
            let target = dist < 100 ? Math.pow(1 - dist / 100, 2) : 0;
            dot.hoverOpacity += (target - dot.hoverOpacity) * 0.1;
            if (target === 0) dot.hoverOpacity *= 0.95;
        });
    }

    function animate() { update(); draw(); animationId = requestAnimationFrame(animate); }

    const hero = document.querySelector('.hero');
    if (hero) {
        hero.addEventListener('mousemove', (e) => { const r = hero.getBoundingClientRect(); mouseX = e.clientX - r.left; mouseY = e.clientY - r.top; });
        hero.addEventListener('mouseleave', () => { mouseX = -1000; mouseY = -1000; });
    }
    window.addEventListener('resize', resize); resize(); animate();
    document.addEventListener('visibilitychange', () => { if (document.hidden) cancelAnimationFrame(animationId); else animate(); });
}

// =====================================================
// SCROLL PROGRESS
// =====================================================
(function() {
    const bar = document.createElement('div');
    bar.classList.add('scroll-progress');
    document.body.appendChild(bar);
    window.addEventListener('scroll', () => {
        const pct = (document.documentElement.scrollTop / (document.documentElement.scrollHeight - document.documentElement.clientHeight)) * 100;
        bar.style.width = `${pct}%`;
    });
})();

// =====================================================
// PAGE LOAD
// =====================================================
window.addEventListener('load', () => {
    if (!document.getElementById('preloader')) {
        document.body.classList.add('loaded');
    }
});
