(function initPageFromNavEarly() {
    if (!document.referrer) return;
    try {
        if (new URL(document.referrer).origin === location.origin) {
            document.documentElement.classList.add('page-from-nav');
        }
    } catch (_) {}
})();

document.addEventListener('DOMContentLoaded', () => {
    const splashActive = initSiteSplash();
    const coldFade = initPageEnter();
    if (!splashActive) {
        if (coldFade) {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => document.body.classList.add('loaded'));
            });
        } else {
            document.body.classList.add('loaded');
        }
    }
    requestAnimationFrame(() => {
        window.dispatchEvent(new CustomEvent('fonseca:layoutready'));
    });
    initDarkMode();
    initMobileMenu();
    initNavbarScroll();
    initSmoothScroll();
    initClientsCarousel();
    initMotionCarousel();
    initVideoPlayControls();
    initScrollReveal();
    initEditorialScroll();
    revealHeroOnLoad();
    initTypewriter();
    initHeroAsciiTerrain();
    initHeroCopyEmail();
    initWorkProjectCarousels();
    initWorkCardLinkPreview();
    initProjectModals();
    initTestimonialReadMore();
    updateYear();
    initCaseStudyNav();
    initNavMotion();
    initCaseStudyMotion();
    initCaseStudyMagazine();
    initPageTransitions();
    initThemeCompare();
    initCaseImageLightbox();
    initLinkPrefetch();
    initLazyBelowFoldMedia();
    initLazyWorkCardVideos();
    initFonsecaLLM();
});

// =====================================================
// FAST NAV — prefetch internal pages on hover
// =====================================================
function initLinkPrefetch() {
    const origin = location.origin;
    document.querySelectorAll('a[href]').forEach((anchor) => {
        const href = anchor.getAttribute('href');
        if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
        if (/^https?:\/\//i.test(href) && !href.startsWith(origin)) return;
        anchor.addEventListener('mouseenter', () => {
            const url = new URL(href, origin);
            if (url.origin !== origin) return;
            if (document.querySelector(`link[rel="prefetch"][href="${url.pathname}"]`)) return;
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = url.pathname + url.search;
            document.head.appendChild(link);
        }, { once: true, passive: true });
    });
}

// =====================================================
// PERFORMANCE — lazy-load below-fold case media
// =====================================================
function initLazyBelowFoldMedia() {
    document.querySelectorAll('.case-section-gallery img, .project-case-content img:not(.cover-img)').forEach((img) => {
        if (!img.hasAttribute('loading')) img.loading = 'lazy';
        if (!img.hasAttribute('decoding')) img.decoding = 'async';
    });
    document.querySelectorAll('.case-section-gallery video, .project-case-content .case-section-body video').forEach((video) => {
        if (!video.hasAttribute('preload')) video.preload = 'none';
        const rate = parseFloat(video.dataset.playbackRate);
        if (!Number.isNaN(rate) && rate > 0) video.playbackRate = rate;
    });

    const reduceMotion = prefersReducedMotion();
    document.querySelectorAll('video[autoplay]').forEach((video) => {
        if (reduceMotion) {
            video.removeAttribute('autoplay');
            video.pause();
            return;
        }
        const rate = parseFloat(video.dataset.playbackRate);
        if (!Number.isNaN(rate) && rate > 0) video.playbackRate = rate;
        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    if (!Number.isNaN(rate) && rate > 0) video.playbackRate = rate;
                    video.play().catch(() => {});
                } else video.pause();
            });
        }, { threshold: 0.2, rootMargin: '80px 0px' });
        io.observe(video);
    });
}

// =====================================================
// PERFORMANCE — defer work-card video downloads until visible
// =====================================================
function initLazyWorkCardVideos() {
    const videos = [...document.querySelectorAll('.work-card video')];
    if (!videos.length) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function ensureSrc(video) {
        const src = video.dataset.src;
        if (!src || video.getAttribute('src')) return;
        video.src = src;
        video.removeAttribute('data-src');
    }

    function shouldPlay(video) {
        if (reduceMotion) return false;
        const slide = video.closest('.project-card__slide');
        return !slide || slide.classList.contains('active');
    }

    function playVideo(video) {
        if (!shouldPlay(video)) return;
        ensureSrc(video);
        video.play().catch(() => {});
    }

    function pauseVideo(video) {
        video.pause();
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            const video = entry.target;
            if (entry.isIntersecting) playVideo(video);
            else pauseVideo(video);
        });
    }, { rootMargin: '120px 0px', threshold: 0.1 });

    videos.forEach((video) => {
        video.autoplay = false;
        if (!video.hasAttribute('preload')) video.preload = 'none';
        if (video.getAttribute('src') && !video.dataset.src) {
            video.dataset.src = video.getAttribute('src');
            video.removeAttribute('src');
        }
        observer.observe(video);
    });
}

/** Coalesce high-frequency events (scroll/resize) to one callback per animation frame */
function rafThrottle(fn) {
    let scheduled = false;
    return (...args) => {
        if (scheduled) return;
        scheduled = true;
        requestAnimationFrame(() => {
            scheduled = false;
            fn(...args);
        });
    };
}

// =====================================================
// PAGE ENTER + TRANSITIONS
// =====================================================
function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function isSameOriginReferrer() {
    if (!document.referrer) return false;
    try {
        return new URL(document.referrer).origin === location.origin;
    } catch (_) {
        return false;
    }
}

function supportsNavViewTransitions() {
    return typeof CSS !== 'undefined' && CSS.supports('selector(::view-transition-old(root))');
}

function isHomepage() {
    return document.body.classList.contains('home-page');
}

function isHomePath(pathname) {
    const path = (pathname || '/').replace(/\/$/, '') || '/';
    const base = path.split('/').pop() || '';
    return path === '/' || base === 'index.html';
}

const FONSECA_HOME_SPLASH_KEY = 'fonseca:home-splash';

function markHomeSplashForNextLoad() {
    try {
        sessionStorage.setItem(FONSECA_HOME_SPLASH_KEY, '1');
    } catch (_) {}
}

function getHomeSplashMode() {
    if (prefersReducedMotion()) return null;
    if (!isHomepage()) return null;

    const navType = performance.getEntriesByType('navigation')[0]?.type;
    if (navType === 'back_forward') return null;

    try {
        if (sessionStorage.getItem(FONSECA_HOME_SPLASH_KEY) === '1') {
            sessionStorage.removeItem(FONSECA_HOME_SPLASH_KEY);
            return 'nav';
        }
    } catch (_) {}

    if (!isSameOriginReferrer() && !document.documentElement.classList.contains('page-from-nav')) {
        return 'cold';
    }

    return null;
}

function shouldUseColdIntro() {
    if (prefersReducedMotion()) return false;
    if (isSameOriginReferrer()) return false;
    if (document.documentElement.classList.contains('page-from-nav')) return false;
    const navType = performance.getEntriesByType('navigation')[0]?.type;
    if (navType && navType !== 'navigate') return false;
    return true;
}

function initPageEnter() {
    if (!shouldUseColdIntro()) return false;
    if (document.getElementById('site-splash') && isHomepage()) return false;
    document.body.classList.add('page-init-fade');
    return true;
}

function initSiteSplash() {
    const splash = document.getElementById('site-splash');
    if (!splash || !isHomepage()) {
        splash?.remove();
        return false;
    }

    const splashMode = getHomeSplashMode();
    if (!splashMode) {
        splash.remove();
        return false;
    }

    document.body.classList.add('page-init-fade', 'has-splash');

    const MIN_MS = splashMode === 'nav' ? 480 : 720;
    const MAX_MS = splashMode === 'nav' ? 1400 : 2000;
    const started = performance.now();

    function dismissSplash() {
        const remaining = Math.max(0, MIN_MS - (performance.now() - started));

        window.setTimeout(() => {
            splash.classList.add('site-splash--hide');
            document.body.classList.add('loaded');
            window.dispatchEvent(new CustomEvent('fonseca:layoutready'));

            const removeSplash = () => splash.remove();
            splash.addEventListener('transitionend', removeSplash, { once: true });
            window.setTimeout(removeSplash, 520);
        }, remaining);
    }

    const readiness = Promise.all([
        document.fonts && document.fonts.ready ? document.fonts.ready.catch(() => {}) : Promise.resolve(),
        new Promise((resolve) => {
            if (document.readyState === 'complete') resolve();
            else window.addEventListener('load', resolve, { once: true });
        }),
    ]);

    Promise.race([
        readiness,
        new Promise((resolve) => window.setTimeout(resolve, MAX_MS)),
    ]).then(dismissSplash);

    window.addEventListener('pageshow', (event) => {
        if (!event.persisted) return;
        splash.remove();
        document.body.classList.add('loaded');
        document.body.classList.remove('has-splash', 'page-init-fade');
    }, { once: true });

    return true;
}

function initPageTransitions() {
    if (prefersReducedMotion()) return;

    document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href]');
        if (!link || link.target === '_blank' || e.defaultPrevented) return;
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

        const href = link.getAttribute('href');
        if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;

        let url;
        try {
            url = new URL(href, location.origin);
        } catch (_) {
            return;
        }
        if (url.origin !== location.origin) return;
        if (url.pathname === location.pathname && url.hash) return;
        if (/\.(pdf|zip|png|jpe?g|webp|mov|mp4)$/i.test(url.pathname)) return;

        if (isHomePath(url.pathname)) {
            markHomeSplashForNextLoad();
        }

        if (supportsNavViewTransitions()) return;

        e.preventDefault();
        document.body.classList.add('page-leaving');
        window.setTimeout(() => {
            window.location.href = url.href;
        }, 260);
    }, { capture: true });
}

// =====================================================
// SCROLL REVEAL
// =====================================================
function initScrollReveal() {
    const els = document.querySelectorAll('[data-anim]');
    if (!els.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -56px 0px' });

    els.forEach(el => observer.observe(el));
}

function initEditorialScroll() {
    const isProjectCase = Boolean(document.querySelector('.project-case-content'));
    const blocks = [
        '.about-contact',
        '.about-photos',
        '.fun-magazine-chapter',
        '.hh3d-piece'
    ];
    if (!isProjectCase) {
        blocks.push('.related-projects', '.case-section', '.case-brief', '.case-callout');
    }

    const els = document.querySelectorAll(blocks.join(','));
    if (!els.length) return;

    els.forEach((el, i) => {
        el.classList.add('editorial-scroll');
        el.style.setProperty('--editorial-i', String(i % 6));
    });

    if (prefersReducedMotion()) {
        els.forEach((el) => el.classList.add('in-view'));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.14, rootMargin: '0px 0px -48px 0px' });

    els.forEach((el) => observer.observe(el));
}

function revealHeroOnLoad() {
    const hero = document.querySelector('.hero--intro');
    if (!hero) return;

    const items = hero.querySelectorAll('[data-anim]');
    if (!items.length) return;

    if (prefersReducedMotion()) {
        items.forEach((el) => el.classList.add('in-view'));
        return;
    }

    items.forEach((el, i) => {
        el.style.setProperty('--hero-reveal-i', String(i));
        requestAnimationFrame(() => {
            requestAnimationFrame(() => el.classList.add('in-view'));
        });
    });
}

function initTypewriter() {
    const writers = [...document.querySelectorAll('[data-typewriter]')];
    if (!writers.length) return;

    if (prefersReducedMotion()) {
        writers.forEach((el) => {
            el.textContent = el.dataset.typewriter || '';
        });
        return;
    }

    const charDelay = 68;
    const lineGap = 220;
    let cursor = 320;

    writers.forEach((el) => {
        const text = el.dataset.typewriter || '';
        el.textContent = '';

        text.split('').forEach((char, charIndex) => {
            window.setTimeout(() => {
                el.textContent += char;
            }, cursor + charIndex * charDelay);
        });

        cursor += text.length * charDelay + lineGap;
    });
}

// =====================================================
// TESTIMONIALS — clamp long quotes + read more / read less
// =====================================================
function initTestimonialReadMore() {
    const root = document.querySelector('.section-testimonials');
    if (!root) return;

    const cards = Array.from(root.querySelectorAll('.testimonial-card'));

    function syncCarouselPause() {
        const anyExpanded = cards.some((card) => card.classList.contains('testimonial-card--expanded'));
        root.classList.toggle('clients-carousel--paused', anyExpanded);
    }

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
        btn?.addEventListener('click', (e) => {
            e.stopPropagation();
            const expanding = !card.classList.contains('testimonial-card--expanded');
            card.classList.toggle('testimonial-card--expanded', expanding);
            const p = card.querySelector('.testimonial-card__text');
            if (p) p.classList.toggle('testimonial-card__text--clamped', !expanding);
            btn.setAttribute('aria-expanded', expanding ? 'true' : 'false');
            btn.textContent = expanding ? 'Read less' : 'Read more';
            syncCarouselPause();
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
// CLIENTS — entrance + velocity-based marquee
// =====================================================
function initClientsCarousel() {
    const section = document.querySelector('.section-testimonials');
    if (!section) return;

    const track = section.querySelector('.testimonials-track');
    if (!track) return;

    const syncDuration = () => {
        const halfWidth = track.scrollWidth / 2;
        if (halfWidth <= 0) return;
        const pxPerSecond = window.matchMedia('(max-width: 768px)').matches ? 36 : 44;
        track.style.setProperty('--clients-marquee-duration', `${halfWidth / pxPerSecond}s`);
    };

    const activate = () => {
        if (section.classList.contains('clients-carousel--ready')) return;
        syncDuration();
        section.classList.add('clients-carousel--ready');
        section.querySelectorAll('.section-head [data-anim]').forEach((el) => {
            el.classList.add('in-view');
        });
    };

    if (prefersReducedMotion()) {
        section.classList.add('clients-carousel--ready', 'clients-carousel--static');
        section.querySelectorAll('.section-head [data-anim]').forEach((el) => {
            el.classList.add('in-view');
        });
        return;
    }

    syncDuration();

    let resizeT;
    window.addEventListener('resize', () => {
        clearTimeout(resizeT);
        resizeT = window.setTimeout(syncDuration, 150);
    });
    window.addEventListener('fonseca:layoutready', syncDuration);
    if (document.fonts?.ready) {
        document.fonts.ready.then(syncDuration);
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                activate();
                observer.disconnect();
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -48px 0px' });

    observer.observe(section);

    if (section.getBoundingClientRect().top < window.innerHeight * 0.85) {
        requestAnimationFrame(activate);
    }
}

// =====================================================
// CASE-STUDY MEDIA — centered expand button + lightbox
// =====================================================
function initCaseImageLightbox() {
    const run = () => setupCaseImageLightbox();
    if (typeof requestIdleCallback === 'function') {
        requestIdleCallback(run, { timeout: 1500 });
    } else {
        setTimeout(run, 120);
    }
}

function setupCaseImageLightbox() {
    const mediaEls = Array.from(document.querySelectorAll('.case-gallery-img'));
    if (!mediaEls.length) return;

    const lb = document.createElement('div');
    lb.className = 'case-lightbox';
    lb.setAttribute('aria-hidden', 'true');
    lb.innerHTML =
        '<div class="case-lightbox__backdrop"></div>' +
        '<button type="button" class="case-lightbox__close" aria-label="Close">' +
        '<svg width="22" height="22" viewBox="0 0 20 20" fill="none"><path d="M15 5L5 15M5 5l10 10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></button>' +
        '<img class="case-lightbox__img" src="" alt="" hidden>' +
        '<video class="case-lightbox__video" playsinline loop muted controls hidden></video>';
    document.body.appendChild(lb);

    const lbImg = lb.querySelector('.case-lightbox__img');
    const lbVideo = lb.querySelector('.case-lightbox__video');
    let lastFocus = null;

    function open(el, trigger) {
        lastFocus = trigger || null;
        const isVideo = el.tagName === 'VIDEO';
        const src = el.currentSrc || el.getAttribute('src') || '';

        if (isVideo) {
            lbImg.hidden = true;
            lbImg.removeAttribute('src');
            lbVideo.hidden = false;
            lbVideo.src = src;
            lbVideo.loop = el.loop;
            lbVideo.muted = el.muted;
            lbVideo.controls = true;
            lbVideo.play().catch(() => {});
        } else {
            lbVideo.hidden = true;
            lbVideo.pause();
            lbVideo.removeAttribute('src');
            lbVideo.load();
            lbImg.hidden = false;
            lbImg.src = src;
            lbImg.alt = el.alt || '';
        }

        lb.classList.add('open');
        lb.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function close() {
        lb.classList.remove('open');
        lb.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        lbImg.removeAttribute('src');
        lbImg.hidden = true;
        lbVideo.pause();
        lbVideo.removeAttribute('src');
        lbVideo.load();
        lbVideo.hidden = true;
        if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
    }

    lb.querySelector('.case-lightbox__backdrop').addEventListener('click', close);
    lb.querySelector('.case-lightbox__close').addEventListener('click', close);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lb.classList.contains('open')) close();
    });

    const expandIcon =
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none">' +
        '<path d="M9 4H4v5M15 4h5v5M15 20h5v-5M9 20H4v-5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';

    mediaEls.forEach((el) => {
        const isVideo = el.tagName === 'VIDEO';
        const special = el.closest('.case-gallery-tight-pair, .case-gallery-duo, .theme-compare');

        el.style.cursor = 'zoom-in';
        el.addEventListener('click', () => open(el, el));

        if (special) return;

        const wrap = document.createElement('span');
        wrap.className = 'case-img-zoom';
        el.parentNode.insertBefore(wrap, el);
        wrap.appendChild(el);

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'case-img-zoom__btn';
        const mediaLabel = isVideo ? 'video' : 'image';
        btn.setAttribute('aria-label', 'Expand ' + mediaLabel + (el.alt ? ': ' + el.alt : ''));
        btn.innerHTML = expandIcon;
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            open(el, btn);
        });
        wrap.appendChild(btn);
    });
}

// =====================================================
// HERO — Kanagawa wave image → ASCII with wave motion
// =====================================================
function initHeroAsciiTerrain() {
    document.querySelectorAll('.hero-ascii-terrain').forEach((canvas) => {
        initSingleHeroAscii(canvas);
    });
}

function initSingleHeroAscii(canvas) {
    const img = canvas.closest('section, .about-hero')?.querySelector('.hero-ascii-src')
        || document.getElementById('heroAsciiSrc');
    if (!canvas) return;
    const fullBleed = canvas.classList.contains('about-ascii-bg');
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const sampleCanvas = document.createElement('canvas');
    const sctx = sampleCanvas.getContext('2d', { willReadFrequently: true });

    const chars = ' .·:;+*%#@'.split('');
    let w = 0; let h = 0; let step = 6; let cols = 0; let rows = 0; let time = 0; let animId = 0;
    let lumGrid = null;
    let animActive = false;
    let heroInView = true;
    let kickDebounceT = 0;
    let lastFrameTs = 0;

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
        const fit = canvas.dataset.asciiFit;
        const zoom = Math.max(0.4, Math.min(1, parseFloat(canvas.dataset.asciiZoom || '1') || 1));

        sampleCanvas.width = cols;
        sampleCanvas.height = rows;

        if (fit === 'contain') {
            sctx.fillStyle = '#000000';
            sctx.fillRect(0, 0, cols, rows);
            const scale = Math.min(cols / iw, rows / ih) * zoom;
            const dw = iw * scale;
            const dh = ih * scale;
            const dx = (cols - dw) * 0.5;
            const dy = (rows - dh) * 0.5;
            try {
                sctx.drawImage(img, 0, 0, iw, ih, dx, dy, dw, dh);
            } catch (e) {
                buildFallbackLumGrid();
                return;
            }
        } else {
            let sx; let sy; let sw; let sh;
            if (ir > cr) { sh = ih; sw = sh * cr; sx = (iw - sw) / 2; sy = 0; }
            else { sw = iw; sh = sw / cr; sx = 0; sy = fullBleed ? (ih - sh) / 2 : 0; }

            if (zoom < 1) {
                const cx = sx + sw * 0.5;
                const cy = sy + sh * 0.5;
                const scale = 1 / zoom;
                sw = Math.min(iw, sw * scale);
                sh = Math.min(ih, sh * scale);
                sx = Math.max(0, Math.min(iw - sw, cx - sw * 0.5));
                sy = Math.max(0, Math.min(ih - sh, cy - sh * 0.5));
            }

            sctx.fillStyle = '#e8e0d0';
            sctx.fillRect(0, 0, cols, rows);
            try {
                sctx.drawImage(img, sx, sy, sw, sh, 0, 0, cols, rows);
            } catch (e) {
                buildFallbackLumGrid();
                return;
            }
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
        if (fullBleed) {
            /* Contained backdrop (About hero) — size to the hero container, full width */
            const host = canvas.parentElement;
            const r = host ? host.getBoundingClientRect() : { width: 0, height: 0 };
            w = Math.floor(r.width);
            h = Math.floor(r.height);
            if (w < 8 || h < 8) return false;
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            canvas.style.width = `${w}px`;
            canvas.style.height = `${h}px`;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            step = Math.max(6, Math.min(9, Math.floor(w / 130)));
            cols = Math.ceil(w / step);
            rows = Math.ceil(h / step);
            rebuildLumGrid();
            if (!lumGrid) buildFallbackLumGrid();
            return true;
        }
        const parent = canvas.parentElement;
        const rect = parent ? parent.getBoundingClientRect() : { width: 0, height: 0 };
        if (rect.width < 8 || rect.height < 8) {
            return false;
        }
        w = Math.floor(rect.width * 0.46);
        h = Math.floor(rect.height);
        if (w < 8 || h < 8) return false;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
        canvas.style.top = '0';
        canvas.style.bottom = 'auto';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const stepOverride = parseInt(canvas.dataset.asciiStep, 10);
        step = stepOverride > 0
            ? stepOverride
            : Math.max(5, Math.min(7, Math.floor(w / 95)));
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
                const fadeR = Math.pow(Math.min(1, (1 - nx) / 0.06), 1.1);
                const fadeT = 0.4 + 0.6 * Math.pow(Math.min(1, ny / 0.28), 0.85);
                const fadeB = Math.pow(Math.min(1, (1 - ny) / 0.08), 1.2);
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

    function stopLoop() {
        animActive = false;
        cancelAnimationFrame(animId);
        animId = 0;
    }

    function loop(ts) {
        if (!animActive || document.hidden || !heroInView) {
            stopLoop();
            return;
        }
        time += 0.012;
        /* ~30fps cap: fewer fillText passes per second on large canvases */
        if (!reduceMotion && lastFrameTs && ts - lastFrameTs < 33) {
            animId = requestAnimationFrame(loop);
            return;
        }
        lastFrameTs = ts;
        draw();
        animId = requestAnimationFrame(loop);
    }

    function startLoop() {
        if (reduceMotion) {
            time = 0;
            draw();
            return;
        }
        if (document.hidden || !heroInView) return;
        stopLoop();
        animActive = true;
        lastFrameTs = 0;
        animId = requestAnimationFrame(loop);
    }

    function kickNow() {
        clearTimeout(kickDebounceT);
        stopLoop();
        if (!resize()) {
            requestAnimationFrame(kickNow);
            return;
        }
        if (reduceMotion) {
            time = 0;
            draw();
            return;
        }
        startLoop();
    }

    function debouncedKick() {
        clearTimeout(kickDebounceT);
        kickDebounceT = setTimeout(kickNow, 72);
    }

    function boot() {
        requestAnimationFrame(() => {
            requestAnimationFrame(debouncedKick);
        });
    }

    if (img && (!img.complete || !img.naturalWidth)) {
        img.addEventListener('load', boot, { once: true });
        img.addEventListener('error', boot, { once: true });
    } else {
        boot();
    }

    let layoutKickT;
    window.addEventListener('fonseca:layoutready', () => {
        clearTimeout(layoutKickT);
        layoutKickT = setTimeout(debouncedKick, 40);
    });

    window.addEventListener('pageshow', (ev) => {
        if (ev.persisted) debouncedKick();
    });

    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(debouncedKick);
    }

    const heroSection = canvas.closest('.hero--intro, .about-hero, .project-hero-case, .fun-page-intro, .editorial-hero');
    if (heroSection && typeof IntersectionObserver !== 'undefined') {
        const io = new IntersectionObserver((entries) => {
            const vis = entries.some((e) => e.isIntersecting && e.intersectionRatio > 0);
            heroInView = vis;
            if (!vis) stopLoop();
            else debouncedKick();
        }, { root: null, rootMargin: '80px 0px 80px 0px', threshold: [0, 0.02, 0.1] });
        io.observe(heroSection);
    }

    let roT;
    if (heroSection && typeof ResizeObserver !== 'undefined') {
        const ro = new ResizeObserver(() => {
            clearTimeout(roT);
            roT = setTimeout(() => {
                stopLoop();
                if (resize() && heroInView && !document.hidden) startLoop();
            }, 120);
        });
        ro.observe(heroSection);
    }

    let resizeT;
    window.addEventListener('resize', () => {
        clearTimeout(resizeT);
        resizeT = setTimeout(debouncedKick, 140);
    });

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopLoop();
        } else if (heroInView) {
            debouncedKick();
        }
    });
}

// =====================================================
// HERO — copy email shortcut
// =====================================================
const HERO_EMAIL = 'fonsecaa.design@gmail.com';

function initHeroCopyEmail() {
    const triggers = [...document.querySelectorAll('[data-copy-email]')];
    if (!triggers.length) return;

    function showEmailCopiedToast() {
        let toast = document.getElementById('emailCopyToast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'emailCopyToast';
            toast.className = 'email-copy-toast';
            toast.setAttribute('role', 'status');
            toast.setAttribute('aria-live', 'polite');
            toast.innerHTML =
                '<span class="email-copy-toast__label">Email copied</span>' +
                `<span class="email-copy-toast__email">${HERO_EMAIL}</span>`;
            document.body.appendChild(toast);
        }
        toast.classList.add('is-visible');
        clearTimeout(showEmailCopiedToast._hideT);
        showEmailCopiedToast._hideT = setTimeout(() => {
            toast.classList.remove('is-visible');
        }, 2800);
    }

    function markCopied(trigger) {
        trigger.classList.add('is-copied');
        const action = trigger.querySelector('.hero-intro__email-action');
        const prev = action?.textContent?.trim() || 'Copy';
        if (action) action.textContent = 'Copied';
        clearTimeout(markCopied._resetT);
        markCopied._resetT = setTimeout(() => {
            trigger.classList.remove('is-copied');
            if (action) action.textContent = prev;
        }, 2200);
    }

    function copyHeroEmail(trigger) {
        const onSuccess = () => {
            showEmailCopiedToast();
            if (trigger) markCopied(trigger);
        };
        if (!navigator.clipboard?.writeText) {
            onSuccess();
            return;
        }
        navigator.clipboard.writeText(HERO_EMAIL)
            .then(onSuccess)
            .catch(() => {});
    }

    triggers.forEach((trigger) => {
        if (!trigger.hasAttribute('aria-label')) {
            trigger.setAttribute('aria-label', 'Copy email address');
        }
        if (trigger.tagName === 'A' && !trigger.getAttribute('role')) {
            trigger.setAttribute('role', 'button');
        }
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            copyHeroEmail(trigger);
        });
    });

    document.addEventListener('keydown', (e) => {
        if (e.defaultPrevented) return;
        const t = e.target;
        if (t.closest?.('.proj-modal')) return;
        const tag = t?.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || t?.isContentEditable) return;
        if (e.key !== 'c' && e.key !== 'C') return;
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        e.preventDefault();
        copyHeroEmail(triggers[0]);
    });
}

// =====================================================
// WORK CARD COVER CAROUSELS
// =====================================================
function initWorkProjectCarousels() {
    document.querySelectorAll('[data-project-carousel]').forEach((root) => {
        /* Work cards use link rows to control the preview — no auto-rotate there */
        if (root.closest('.work-card')) return;

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
// HOME — Hedgehog 3D motion carousel
// =====================================================
function initMotionCarousel() {
    const root = document.querySelector('[data-motion-carousel]');
    if (!root) return;

    const slides = [...root.querySelectorAll('[data-motion-slide]')];
    const dots = [...root.querySelectorAll('[data-motion-dot]')];
    const prev = root.querySelector('[data-motion-prev]');
    const next = root.querySelector('[data-motion-next]');
    if (!slides.length) return;

    let current = 0;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function ensureVideo(slide) {
        const video = slide.querySelector('video');
        if (!video) return null;
        const src = video.dataset.src;
        if (src && !video.getAttribute('src')) {
            video.src = src;
            video.removeAttribute('data-src');
        }
        return video;
    }

    function syncPlayback() {
        slides.forEach((slide, i) => {
            const video = slide.querySelector('video');
            if (!video) return;
            if (i === current) {
                ensureVideo(slide);
                if (!reduceMotion) video.play().catch(() => {});
            } else {
                video.pause();
                video.currentTime = 0;
            }
        });
    }

    function goTo(idx) {
        const n = slides.length;
        const nextIdx = ((idx % n) + n) % n;
        slides[current].classList.remove('active');
        slides[current].setAttribute('aria-hidden', 'true');
        dots[current]?.classList.remove('active');
        dots[current]?.setAttribute('aria-selected', 'false');
        current = nextIdx;
        slides[current].classList.add('active');
        slides[current].setAttribute('aria-hidden', 'false');
        dots[current]?.classList.add('active');
        dots[current]?.setAttribute('aria-selected', 'true');
        syncPlayback();
    }

    slides.forEach((slide) => {
        const video = slide.querySelector('video');
        if (!video) return;
        video.removeAttribute('loop');
        video.addEventListener('ended', () => {
            if (slide !== slides[current]) return;
            goTo(current + 1);
        });
    });

    prev?.addEventListener('click', () => goTo(current - 1));
    next?.addEventListener('click', () => goTo(current + 1));
    dots.forEach((dot) => {
        dot.addEventListener('click', () => goTo(parseInt(dot.dataset.idx, 10)));
    });

    root.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(current - 1); }
        else if (e.key === 'ArrowRight') { e.preventDefault(); goTo(current + 1); }
    });

    const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) syncPlayback();
            else slides.forEach((slide) => slide.querySelector('video')?.pause());
        });
    }, { threshold: 0.25, rootMargin: '40px 0px' });
    io.observe(root);

    goTo(0);
}

// =====================================================
// VIDEO — inline play / pause controls
// =====================================================
const VIDEO_PLAY_SVG = '<svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M7 5.5v9l8-4.5-8-4.5z" fill="currentColor"/></svg>';
const VIDEO_PAUSE_SVG = '<svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M7 5h2v10H7V5zm4 0h2v10h-2V5z" fill="currentColor"/></svg>';

function initVideoPlayControls() {
    const selector = [
        'video.case-gallery-img',
        '.hh3d-video',
        '.motion-carousel__media video',
        '.fun-magazine-card__video',
        '.project-cover-image video',
        'video.project-card__slide',
        '.work-card video',
    ].join(', ');

    document.querySelectorAll(selector).forEach((video) => {
        if (video.dataset.playControls === '1') return;
        if (video.closest('.case-lightbox')) return;
        if (video.closest('[data-motion-carousel]')) return;
        if (document.body.classList.contains('home-page')) return;
        video.dataset.playControls = '1';

        const host = video.parentElement;
        if (!host) return;
        if (getComputedStyle(host).position === 'static') host.style.position = 'relative';

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'video-play-toggle';
        btn.setAttribute('aria-label', video.paused ? 'Play video' : 'Pause video');
        btn.innerHTML = video.paused ? VIDEO_PLAY_SVG : VIDEO_PAUSE_SVG;

        const syncBtn = () => {
            const paused = video.paused;
            btn.setAttribute('aria-label', paused ? 'Play video' : 'Pause video');
            btn.setAttribute('aria-pressed', paused ? 'false' : 'true');
            btn.classList.toggle('is-paused', paused);
            btn.innerHTML = paused ? VIDEO_PLAY_SVG : VIDEO_PAUSE_SVG;
        };

        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (video.paused) video.play().catch(() => {});
            else video.pause();
            syncBtn();
        });

        video.addEventListener('play', syncBtn);
        video.addEventListener('pause', syncBtn);

        host.appendChild(btn);
        syncBtn();
    });
}

// =====================================================
// WORK CARD — first click selects + updates preview; second click navigates
// =====================================================
function initWorkCardLinkPreview() {
    document.querySelectorAll('.work-card').forEach((card) => {
        const links = [...card.querySelectorAll('.work-card__link-row')];
        const carousel = card.querySelector('[data-project-carousel]');
        const slides = carousel ? [...carousel.querySelectorAll('.project-card__slide')] : [];
        const dots = carousel ? [...carousel.querySelectorAll('.project-card__carousel-dot')] : [];
        const thumbLink = card.querySelector('.work-card__thumb-link');
        const expand = card.querySelector('.work-card__expand');
        if (!slides.length) return;

        const multiLink = links.length > 1;
        let currentSlide = 0;

        function syncSlideMedia(activeIdx) {
            slides.forEach((slide, i) => {
                const video = slide.tagName === 'VIDEO' ? slide : slide.querySelector('video');
                if (!video) return;
                if (i === activeIdx) {
                    if (video.dataset.src && !video.getAttribute('src')) {
                        video.src = video.dataset.src;
                        video.removeAttribute('data-src');
                    }
                    video.play().catch(() => {});
                } else {
                    video.pause();
                    video.currentTime = 0;
                }
            });
        }

        function goToSlide(idx) {
            const next = Math.max(0, Math.min(idx, slides.length - 1));
            slides[currentSlide]?.classList.remove('active');
            dots[currentSlide]?.classList.remove('active');
            dots[currentSlide]?.setAttribute('aria-selected', 'false');
            currentSlide = next;
            slides[currentSlide]?.classList.add('active');
            dots[currentSlide]?.classList.add('active');
            dots[currentSlide]?.setAttribute('aria-selected', 'true');
            syncSlideMedia(currentSlide);
        }

        function syncNavHref(link) {
            if (!link) return;
            const label = link.querySelector('strong')?.textContent?.trim();
            if (thumbLink) {
                thumbLink.href = link.href;
                if (label) thumbLink.setAttribute('aria-label', `Open ${label}`);
            }
            if (expand) {
                expand.href = link.href;
                if (label) expand.setAttribute('aria-label', `Open ${label}`);
            }
            const mediaLabel = card.querySelector('.work-card__media-label strong');
            const mediaSub = card.querySelector('.work-card__media-label span');
            if (mediaLabel && label) mediaLabel.textContent = label;
            if (mediaSub) {
                const client = card.querySelector('.work-card__client')?.textContent?.trim();
                const cardName = card.querySelector('.work-card__name')?.textContent?.trim();
                if (client) mediaSub.textContent = client;
                else if (cardName) mediaSub.textContent = cardName;
            }
        }

        function setActiveLink(link) {
            if (!multiLink) return;
            links.forEach((row) => {
                row.classList.remove('is-active');
                row.removeAttribute('aria-current');
            });
            if (!link) return;
            link.classList.add('is-active');
            link.setAttribute('aria-current', 'true');
            goToSlide(parseInt(link.dataset.slideIdx || '0', 10));
            syncNavHref(link);
        }

        function findLinkForHref(href) {
            if (!href) return null;
            return links.find((row) => row.getAttribute('href') === href) || null;
        }

        function handleTwoStepNav(e, anchor) {
            if (!multiLink) return;
            const href = anchor.getAttribute('href');
            const matchingLink = findLinkForHref(href);
            if (matchingLink?.classList.contains('is-active')) return;
            e.preventDefault();
            if (matchingLink) setActiveLink(matchingLink);
        }

        links.forEach((link) => {
            link.addEventListener('click', (e) => {
                if (!multiLink || link.classList.contains('is-active')) return;
                e.preventDefault();
                setActiveLink(link);
            });
        });

        if (thumbLink) thumbLink.addEventListener('click', (e) => handleTwoStepNav(e, thumbLink));
        if (expand) expand.addEventListener('click', (e) => handleTwoStepNav(e, expand));

        dots.forEach((dot) => {
            dot.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const idx = parseInt(dot.dataset.idx || '0', 10);
                const matchingLink = links.find((row) => parseInt(row.dataset.slideIdx || '0', 10) === idx);
                if (matchingLink) setActiveLink(matchingLink);
            });
        });

        syncSlideMedia(currentSlide);
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
            type: 'Web3 / Product / Landing',
            overview: '<strong>Hedgehog</strong> is a Web3 prediction market spanning product UX and a conversion-focused waitlist landing. 15,000+ users joined the product waitlist at 37.5% conversion from a 40K+ organic community across X (14.6K) and Telegram (14K), with $0 paid traffic.',
            bullets: [
                'Waitlist landing: 15,000+ product sign-ups at 37.5% conversion from a 40K+ organic community (X, Telegram, Discord, Web3 networks). Industry benchmark: 2 to 8%. Zero paid acquisition.',
                'Product usability: task completion improved from 61% to 88% across iterations. Time to first action dropped from 8s to under 2s.',
                '3D motion assets produced in Blender for organic social distribution across X and Telegram.'
            ],
            images: [
                'Hedgehog product/1920x1200.png',
                '1920x1200/Cover Hedgehog Hero cover.png'
            ],
            links: [
                { label: 'View product', href: 'project-hedgehog-product.html', primary: true },
                { label: 'Landing page', href: 'project-hedgehog.html' },
                { label: '3D motion', href: 'hedgehog-3d.html' }
            ]
        },
        transparent: {
            title: 'Transparent.space',
            company: 'Transparent Space',
            year: '2025-2026',
            type: 'Web3 / Product / Brand',
            overview: '<strong>Transparent.space</strong> is an institutional-grade platform for verifiable Market Maker performance analysis. Designed end-to-end, from discovery and UX architecture to a complete design system, to turn complex on-chain data into clear, actionable decisions for liquidity providers.',
            bullets: [
                'Designed a data-intensive analytics dashboard for institutional traders, reducing time-to-insight by ~30% by structuring complex on-chain metrics into layered, scannable interfaces.',
                'Built a 120+ component design system ensuring visual consistency and reducing design-to-dev handoff time by ~35%.',
                'Implemented the product website using CursorAI, integrating animations and motion to reinforce the brands positioning around transparency and precision.'
            ],
            images: [
                'Transparent.space Products/Dashboard.png',
                '1920x1200/Cover transparent Hero cover-1.png',
                'Transparent UI/1.png',
                'Transparent UI/3.png',
                'Transparent UI/5.png'
            ],
            links: [
                { label: 'View product', href: 'project-transparent-space.html', primary: true },
                { label: 'Brand system', href: 'project-transparent-space-brand.html' }
            ]
        },
        picnic: {
            title: 'Picnic',
            company: 'Picnic',
            year: '2025',
            type: 'Brand / Campaign',
            overview: '<strong>Picnic</strong> is a social-driven fintech brand with a strong community focus. The project delivered a cohesive visual identity and scalable design system across social media, launch events, and growth touchpoints.',
            bullets: [
                'Defined a complete brand system: color, typography, iconography, and component tokens, establishing a scalable visual language across all product surfaces.',
                'Created campaign-ready assets for product launches, seasonal moments, and community engagement.',
                'Established brand guidelines ensuring consistency across all future touchpoints, delivered within a 12-week go-to-market timeline.'
            ],
            images: [
                '1920x1200/Cover Picnic Hero cover.png',
                'Picnic/1.png',
                'Picnic/5.png',
                'Picnic/7.png',
                'Picnic/9.png'
            ],
            links: [
                { label: 'View brand', href: 'project-picnic.html', primary: true }
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
            /* Let real links inside the card (e.g. "View project") navigate to their pages */
            if (e.target.closest('a[href]')) return;
            e.preventDefault();
            e.stopPropagation();
            open(btn.dataset.openModal);
        });
    });
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

    const onScroll = rafThrottle(() => {
        const y = window.pageYOffset;
        navbar.classList.toggle('scrolled', y > 100);
        navbar.style.transform = (y > lastScroll && y > 500) ? 'translateY(-100%)' : 'translateY(0)';
        lastScroll = y;
    });

    window.addEventListener('scroll', onScroll, { passive: true });
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
// PROJECT PAGE NAV
// =====================================================
function initCaseStudyNav() {
    const sideNav = document.getElementById('caseSideNav');
    const caseContent = document.querySelector('.project-case-content');
    const sections = document.querySelectorAll('.case-section');
    const scan = document.getElementById('case-scan');
    const heroNav = document.getElementById('projectCaseNav');
    if (!caseContent || !sections.length) return;

    const heroNavLinks = heroNav ? heroNav.querySelectorAll('.case-nav-link') : [];
    const sideNavLinks = sideNav ? sideNav.querySelectorAll('.case-side-nav-link:not(.case-side-nav-link--summary)') : [];
    const summaryLink = sideNav?.querySelector('.case-side-nav-link--summary');

    function sectionTop(el) {
        return el.getBoundingClientRect().top + window.scrollY;
    }

    function getActiveNavId() {
        const marker = window.scrollY + Math.min(window.innerHeight * 0.35, 280);

        if (scan && sections.length) {
            const firstSectionTop = sectionTop(sections[0]);
            if (marker < firstSectionTop - 80) return 'case-scan';
        }

        let current = sections[0].id;
        sections.forEach((section) => {
            if (marker >= sectionTop(section) - 140) current = section.id;
        });
        return current;
    }

    function setLinkState(links, activeId) {
        links.forEach((link) => {
            const href = link.getAttribute('href') || '';
            const isActive = href === '#' + activeId;
            link.classList.toggle('active', isActive);
            if (isActive) link.setAttribute('aria-current', 'true');
            else link.removeAttribute('aria-current');
        });
    }

    const update = rafThrottle(() => {
        const cur = getActiveNavId();
        setLinkState(heroNavLinks, cur);
        setLinkState(sideNavLinks, cur);
        if (summaryLink) {
            const isSummary = cur === 'case-scan';
            summaryLink.classList.toggle('active', isSummary);
            if (isSummary) summaryLink.setAttribute('aria-current', 'true');
            else summaryLink.removeAttribute('aria-current');
        }
        if (sideNav) {
            const top = caseContent.getBoundingClientRect().top + window.scrollY - 150;
            const bottom = top + caseContent.offsetHeight - 300;
            const y = window.scrollY;
            const show = y >= top && y <= bottom;
            sideNav.classList.toggle('visible', show);
            sideNav.classList.toggle('case-side-nav--revealed', show);
        }
    });

    sideNav?.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener('click', (e) => {
            const hash = link.getAttribute('href');
            if (!hash || hash === '#') return;
            const target = document.querySelector(hash);
            if (!target) return;
            e.preventDefault();
            const offset = 96;
            const top = target.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({
                top,
                behavior: prefersReducedMotion() ? 'auto' : 'smooth',
            });
        });
    });

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('load', update);
    window.addEventListener('resize', update);
}

// =====================================================
// NAV — animated icons + entrance (all pages)
// =====================================================
const CASE_SECTION_ICON_HTML = {
    overview: '<g class="motion-icon__layers"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></g>',
    context: '<g class="motion-icon__alert"><circle cx="12" cy="12" r="10"/><line class="motion-icon__alert-dot" x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></g>',
    approach: '<g class="motion-icon__user"><circle cx="12" cy="7" r="4"/><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/></g>',
    decisions: '<g class="motion-icon__key"><circle cx="7.5" cy="15.5" r="5.5"/><path d="M21 2l-9.6 9.6"/><path class="motion-icon__key-bit" d="M15.5 7.5l3 3L22 7l-3-3"/></g>',
    reflection: '<g class="motion-icon__books"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></g>',
    system: '<g class="motion-icon__pen"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></g>',
    'my-role': '<g class="motion-icon__user"><circle cx="12" cy="7" r="4"/><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/></g>',
    problem: '<g class="motion-icon__alert"><circle cx="12" cy="12" r="10"/><line class="motion-icon__alert-dot" x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></g>',
    why: '<g class="motion-icon__audience"><circle class="motion-icon__audience-a" cx="9" cy="8" r="3"/><circle class="motion-icon__audience-b" cx="16" cy="9" r="2.5"/><path d="M4 20c0-3 2.5-5 5-5s5 2 5 5"/><path d="M13 20c0-2.2 1.6-4 3.5-4.2"/></g>',
    scenario: '<g class="motion-icon__book"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></g>',
    solution: '<g class="motion-icon__bulb"><path d="M9 18h6"/><path d="M10 22h4"/><path class="motion-icon__bulb-glass" d="M12 2a7 7 0 017 7c0 2.8-1.6 4.3-3 5.8-.8.8-1.2 1.6-1.3 2.2H9.3c-.1-.6-.5-1.4-1.3-2.2C6.6 13.3 5 11.8 5 9a7 7 0 017-7z"/></g>',
    'key-decisions': '<g class="motion-icon__key"><circle cx="7.5" cy="15.5" r="5.5"/><path d="M21 2l-9.6 9.6"/><path class="motion-icon__key-bit" d="M15.5 7.5l3 3L22 7l-3-3"/></g>',
    research: '<g class="motion-icon__search"><circle cx="11" cy="11" r="8"/><line class="motion-icon__search-handle" x1="21" y1="21" x2="16.65" y2="16.65"/></g>',
    design: '<g class="motion-icon__pen"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></g>',
    validation: '<g class="motion-icon__validate"><circle cx="12" cy="12" r="10"/><polyline class="motion-icon__check-mark" points="8 12 11 15 16 9"/></g>',
    results: '<g class="motion-icon__chart"><line class="motion-icon__bar motion-icon__bar--3" x1="18" y1="20" x2="18" y2="10"/><line class="motion-icon__bar motion-icon__bar--2" x1="12" y1="20" x2="12" y2="4"/><line class="motion-icon__bar motion-icon__bar--1" x1="6" y1="20" x2="6" y2="14"/></g>',
    impact: '<g class="motion-icon__trend"><polyline class="motion-icon__trend-line" points="3 17 9 11 13 15 21 5"/><polyline class="motion-icon__trend-arrow" points="15 5 21 5 21 11"/></g>',
    lessons: '<g class="motion-icon__books"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></g>',
    'next-steps': '<g class="motion-icon__arrow"><line x1="5" y1="12" x2="19" y2="12"/><polyline class="motion-icon__arrow-head" points="12 5 19 12 12 19"/></g>',
    next: '<g class="motion-icon__arrow"><line x1="5" y1="12" x2="19" y2="12"/><polyline class="motion-icon__arrow-head" points="12 5 19 12 12 19"/></g>',
    summary: '<g class="motion-icon__compass"><circle cx="12" cy="12" r="10"/><polygon class="motion-icon__compass-needle" points="12 6 14 14 12 12 10 14"/></g>',
};

const HEADER_NAV_ICON_RULES = [
    { key: 'work', match: (a) => /#work|index\.html$/.test(a.getAttribute('href') || '') || a.getAttribute('href') === '#work', html: '<g class="motion-icon__briefcase"><rect x="2" y="7" width="20" height="14" rx="2"/><path class="motion-icon__briefcase-lid" d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></g>' },
    { key: 'creative', match: (a) => (a.getAttribute('href') || '').includes('fun.html'), html: '<g class="motion-icon__sparkles"><path class="motion-icon__spark-main" d="M12 3l1.4 4.3L17.5 9l-3.6 1.2L12 14.5 10.1 10.2 6.5 9l4.1-1.7z"/><path class="motion-icon__spark-mini" d="M5 19l.8 1.6L7.4 20l-.9 1.6.9 1.6-1.6-.6-.9 1.6"/></g>' },
    { key: 'about', match: (a) => (a.getAttribute('href') || '').includes('about.html'), html: '<g class="motion-icon__profile"><circle class="motion-icon__profile-head" cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/></g>' },
    { key: 'resume', match: (a) => (a.getAttribute('href') || '').includes('.pdf'), html: '<g class="motion-icon__doc"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line class="motion-icon__doc-line motion-icon__doc-line--1" x1="16" y1="13" x2="8" y2="13"/><line class="motion-icon__doc-line motion-icon__doc-line--2" x1="16" y1="17" x2="8" y2="17"/></g>' },
];

function createMotionIcon(iconKey, svgInner) {
    const span = document.createElement('span');
    span.className = `nav-motion-icon nav-motion-icon--${iconKey}`;
    span.setAttribute('aria-hidden', 'true');
    span.innerHTML = `<svg class="motion-icon__svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${svgInner}</svg>`;
    return span;
}

function wrapLinkLabel(link, iconKey, svgInner, linkClass) {
    if (link.querySelector('.nav-motion-icon')) return;
    const labelText = link.textContent.trim();
    link.textContent = '';
    link.classList.add(linkClass);
    const label = document.createElement('span');
    label.className = linkClass.includes('case-side-nav') ? 'case-side-nav-label' : 'nav-motion-label';
    label.textContent = labelText;
    link.append(createMotionIcon(iconKey, svgInner), label);
}

function prependNavIcon(link, iconKey, svgInner, linkClass) {
    if (link.querySelector('.nav-motion-icon')) return;
    link.classList.add(linkClass);
    link.insertBefore(createMotionIcon(iconKey, svgInner), link.firstChild);
}

function initNavMotion() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    navbar.classList.add('navbar--nav-motion');

    navbar.querySelectorAll('.nav-center .nav-link, .mobile-menu-links .mobile-link:not(.mobile-cta)').forEach((link, i) => {
        const rule = HEADER_NAV_ICON_RULES.find((r) => r.match(link));
        if (!rule) return;
        prependNavIcon(link, rule.key, rule.html, 'nav-link--motion');
        link.style.setProperty('--nav-motion-i', String(i));
    });

    if (!reduceMotion) {
        requestAnimationFrame(() => navbar.classList.add('navbar--entered'));
    }
}

function initCaseStudyMotion() {
    const caseContent = document.querySelector('.project-case-content');
    if (!caseContent) return;

    const reduceMotion = prefersReducedMotion();
    document.body.classList.add('project-case-page');

    const sideNav = document.getElementById('caseSideNav');
    const summaryEl = sideNav?.querySelector('.case-side-nav__summary');
    if (summaryEl && !summaryEl.querySelector('.nav-motion-icon')) {
        summaryEl.classList.add('case-side-nav__summary--motion');
        if (summaryEl.tagName === 'A') summaryEl.classList.add('case-side-nav-link--motion');
        const summaryLabel = summaryEl.textContent.trim();
        summaryEl.textContent = '';
        const summaryText = document.createElement('span');
        summaryText.className = 'case-side-nav__summary-text';
        summaryText.textContent = summaryLabel;
        summaryEl.append(createMotionIcon('summary', CASE_SECTION_ICON_HTML.summary), summaryText);
    }

    sideNav?.querySelectorAll('.case-side-nav-link').forEach((link, i) => {
        const id = (link.getAttribute('href') || '').replace('#', '');
        const iconKey = CASE_SECTION_ICON_HTML[id] ? id : 'overview';
        const html = CASE_SECTION_ICON_HTML[iconKey];
        wrapLinkLabel(link, iconKey, html, 'case-side-nav-link--motion');
        link.style.setProperty('--nav-motion-i', String(i));
    });

    const motionTargets = [];

    const heroItems = document.querySelectorAll('.project-hero-case .container > *');
    heroItems.forEach((el, i) => {
        el.classList.add('case-motion', 'case-motion--hero');
        el.style.setProperty('--case-motion-i', String(i));
        motionTargets.push(el);
    });

    document.querySelectorAll('.project-case-meta--after-cover .case-meta-item').forEach((el, i) => {
        el.classList.add('case-motion', 'case-motion--meta');
        el.style.setProperty('--case-motion-i', String(i));
        motionTargets.push(el);
    });

    caseContent.querySelectorAll('.case-scan__line').forEach((el, i) => {
        el.classList.add('case-motion', 'case-motion--scan-line');
        el.style.setProperty('--case-motion-i', String(i));
        motionTargets.push(el);
    });

    caseContent.querySelectorAll('.case-section').forEach((section, i) => {
        section.classList.add('case-motion', 'case-motion--section');
        section.style.setProperty('--case-motion-i', String(i % 6));
        motionTargets.push(section);
    });

    if (reduceMotion) {
        motionTargets.forEach((el) => el.classList.add('in-view'));
        return;
    }

    requestAnimationFrame(() => {
        heroItems.forEach((el) => el.classList.add('in-view'));
    });

    const motionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('in-view');
            motionObserver.unobserve(entry.target);
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    motionTargets.forEach((el) => {
        if (!el.classList.contains('case-motion--hero')) {
            motionObserver.observe(el);
        }
    });
}

// =====================================================
// CASE STUDY — magazine layout variants
// =====================================================
function initCaseStudyMagazine() {
    document.querySelectorAll('.case-gallery-tight-pair').forEach((pair) => {
        pair.closest('.case-section-gallery')?.classList.add('case-section-gallery--linear');
    });
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
    const docEl = document.documentElement;
    const onScroll = rafThrottle(() => {
        const denom = docEl.scrollHeight - docEl.clientHeight;
        const pct = denom <= 0 ? 0 : (docEl.scrollTop / denom) * 100;
        bar.style.width = `${pct}%`;
    });
    window.addEventListener('scroll', onScroll, { passive: true });
})();

// =====================================================
// PAGE LOAD
// =====================================================
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// =====================================================
// FONSECA LLM — portfolio knowledge + search
// =====================================================
const FLLM_MAIN_WORK_IDS = new Set(['hedgehog-product', 'hedgehog-waitlist', 'transparent-space', 'unimed']);

const FLLM_PROJECTS = [
    {
        id: 'hedgehog-product',
        title: 'Hedgehog · Prediction Market',
        client: 'Hedgehog',
        url: 'project-hedgehog-product.html',
        category: ['Web3', 'Product'],
        impactScore: 95,
        summary: 'Turning prediction curiosity into participation: replaced orderbooks with pooled UP/DOWN rounds and five-minute cycles. Closed beta with 100 waitlist users; everyone understood mechanics by round two.',
        metrics: ['~10s → under 2–4s time to first action', '100% of beta users understood mechanics by round two', '120+ components · ~35% faster handoff', 'Desktop and mobile designed from day one'],
        keywords: ['hedgehog', 'prediction', 'market', 'web3', 'defi', 'orderbook', 'pool', 'product', 'trading', 'on-chain', 'impact', 'metric', 'participation'],
    },
    {
        id: 'hedgehog-waitlist',
        title: 'Hedgehog · Waitlist & Landing',
        client: 'Hedgehog',
        url: 'project-hedgehog.html',
        category: ['Web3', 'Growth'],
        impactScore: 88,
        summary: 'Credibility before the product existed: institutional waitlist landing with a three-layer funnel (understand → trust → act) and a live community engine on X, Telegram, and Discord.',
        metrics: ['15,000+ waitlist sign-ups · 37.5% conversion vs. 2–8% benchmark', '40K+ organic community: X 14.6K · Telegram 14K · Discord', 'Zero paid traffic; same audience later fed the product beta'],
        keywords: ['hedgehog', 'waitlist', 'landing', 'conversion', 'growth', 'web3', 'trust', 'signup', 'institutional'],
    },
    {
        id: 'transparent-space',
        title: 'Transparent.space · Market Maker Dashboard',
        client: 'Transparent.space',
        url: 'project-transparent-space.html',
        category: ['Web3', 'Enterprise'],
        impactScore: 85,
        summary: 'From twenty minutes of cross-checking to thirty seconds of certainty: unified B2B dashboard with binary SLA, liquidity over time, sidebar filters, and neutral Market Maker comparison. Validated with Worldchain and Kraken.',
        metrics: ['61% → 88% task completion across 4 operators, multiple rounds', '~20 min → under 30s to check a data point (client-reported)', '120+ components · ~35% faster handoff · ~6 months zero to delivery', 'Worldchain and Kraken as production clients'],
        keywords: ['transparent', 'dashboard', 'market maker', 'b2b', 'web3', 'liquidity', 'sla', 'institutional', 'worldchain', 'kraken', 'penalty'],
    },
    {
        id: 'unimed',
        title: 'Unimed Seguros · Telemedicine App',
        client: 'Unimed Seguros',
        url: 'project-unimed-seguros.html',
        category: ['Healthcare', 'Mobile'],
        impactScore: 80,
        summary: 'In healthcare, the barrier is trust, not usability: four-pillar telemedicine app for 40K+ beneficiaries with dedicated onboarding for 60+ users and 24/7 in-app support during COVID.',
        metrics: ['40K+ primary beneficiaries · ~50K consultations/month', '<30% no-show rate during pandemic lockdowns', '80%+ in-app chat retention resolving doubts without drop-off', 'Trust-first scheduling and consultation flows'],
        keywords: ['unimed', 'insurance', 'healthcare', 'telemedicine', 'mobile', 'scheduling', 'covid', 'trust', 'onboarding', 'beneficiaries'],
    },
    {
        id: 'picnic',
        title: 'Picnic · Brand',
        client: 'Picnic',
        url: 'project-picnic.html',
        category: ['Fintech', 'Brand'],
        impactScore: 45,
        summary: 'Built a Key Visual system with templates and guidelines so Picnic could ship consistent brand across social, in-app, and campaigns.',
        metrics: ['Templates cut social production time', 'Cohesive identity for launch', 'Team could run channels autonomously'],
        keywords: ['picnic', 'brand', 'identity', 'fintech', 'visual', 'social', 'templates'],
    },
    {
        id: 'transparent-brand',
        title: 'Transparent.space · Brand',
        client: 'Transparent.space',
        url: 'project-transparent-space-brand.html',
        category: ['Web3', 'Brand'],
        impactScore: 50,
        summary: 'Created a blueprint-inspired visual identity so institutional Web3 users could trust the product in the first 3 seconds.',
        metrics: ['Cohesive system across product, website, and marketing', 'Precision type and grids as trust signals', 'Foundation ready to scale with new modules'],
        keywords: ['transparent', 'brand', 'identity', 'web3', 'institutional', 'blueprint'],
    },
    {
        id: 'aura',
        title: 'AURA · Brand',
        client: 'AURA',
        url: 'project-aura.html',
        category: ['Luxury', 'Brand'],
        impactScore: 38,
        summary: 'Luxury jewelry identity using dark palette, high-contrast type, and restraint instead of ornate tradition.',
        metrics: ['Distinct positioning vs traditional jewelry tropes', 'Flexible system for future product lines', 'Premium through negative space'],
        keywords: ['aura', 'luxury', 'jewelry', 'brand', 'identity'],
    },
    {
        id: 'nora',
        title: 'NØRA · Brand',
        client: 'NØRA',
        url: 'project-nora.html',
        category: ['Food', 'Brand'],
        impactScore: 36,
        summary: 'Craft-centric bakery identity with earth tones and custom type, built for digital, print, and physical touchpoints.',
        metrics: ['Increased landing engagement', 'Scalable system across channels', 'Strong visual reception in a competitive local market'],
        keywords: ['nora', 'bakery', 'brand', 'food', 'craft', 'identity'],
    },
];

function normalizeFllmText(value) {
    return String(value || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s%+./-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function tokenizeFllmQuery(query) {
    const stop = new Set(['the', 'and', 'for', 'with', 'that', 'this', 'from', 'have', 'has', 'had', 'what', 'which', 'does', 'did', 'about', 'matheus', 'fonseca', 'project', 'projects', 'work', 'his', 'he', 'she', 'they', 'are', 'was', 'were', 'can', 'how']);
    return normalizeFllmText(query)
        .split(' ')
        .filter((token) => token.length > 2 && !stop.has(token));
}

function scoreFllmProject(project, tokens) {
    const haystack = normalizeFllmText([
        project.title,
        project.client,
        project.summary,
        ...(project.metrics || []),
        ...(project.keywords || []),
        ...(project.category || []),
    ].join(' '));

    let score = 0;
    tokens.forEach((token) => {
        if (haystack.includes(token)) score += token.length > 5 ? 4 : 2;
    });
    return score;
}

function filterFllmProjects(predicate) {
    return FLLM_PROJECTS.filter(predicate).sort((a, b) => b.impactScore - a.impactScore);
}

function fllmProjectLinks(projects, limit = 3) {
    return projects.slice(0, limit).map((project) => ({
        label: `View ${project.title} →`,
        url: project.url,
    }));
}

function answerFllmSearch(query, faqs) {
    const raw = query.trim();
    if (!raw) return null;

    const norm = normalizeFllmText(raw);
    const tokens = tokenizeFllmQuery(raw);

    const impactIntent = /\b(biggest|largest|highest|most|strongest|best|greatest|top)\b/.test(norm)
        && /\b(impact|result|metric|outcome|improvement|success|performance|numbers)\b/.test(norm);
    const listIntent = /\b(list|show|all|selected)\b/.test(norm) && /\b(project|work|case|portfolio)\b/.test(norm);
    const web3Intent = /\b(web3|defi|crypto|blockchain|on-chain|prediction|market maker)\b/.test(norm);
    const healthcareIntent = /\b(health|healthcare|telehealth|telemedicine|insurance|medical|hospital)\b/.test(norm);
    const brandIntent = /\b(brand|identity|visual|logo|key visual)\b/.test(norm);
    const contactIntent = /\b(contact|email|hire|available|availability|freelance|work together|reach)\b/.test(norm);
    const approachIntent = /\b(approach|strategy|process|method|how does he|how do you)\b/.test(norm);

    if (impactIntent) {
        const ranked = filterFllmProjects(() => true);
        const top = ranked[0];
        const second = ranked[1];
        return {
            title: 'Highest measurable impact',
            paragraphs: [
                `Based on documented case study metrics, ${top.title} shows the strongest product impact: ${top.metrics.slice(0, 2).join('; ')}.`,
                second ? `Also strong: ${second.title}, ${second.metrics[0]}.` : '',
            ].filter(Boolean),
            links: fllmProjectLinks(ranked, 3),
        };
    }

    if (listIntent) {
        const ranked = filterFllmProjects((p) => FLLM_MAIN_WORK_IDS.has(p.id));
        return {
            title: 'Selected work',
            paragraphs: [
                'Featured work spans prediction markets, B2B dashboards, telemedicine, and brand systems.',
                ranked.map((p) => `${p.title}: ${p.metrics[0]}.`).join(' '),
            ],
            links: fllmProjectLinks(ranked, 4),
        };
    }

    if (web3Intent) {
        const matches = filterFllmProjects((p) => FLLM_MAIN_WORK_IDS.has(p.id) && (p.category.includes('Web3') || normalizeFllmText(p.keywords.join(' ')).includes('web3')));
        return {
            title: 'Web3 & DeFi work',
            paragraphs: matches.map((p) => `${p.title}, ${p.summary}`),
            links: fllmProjectLinks(matches, 3),
        };
    }

    if (healthcareIntent) {
        const matches = filterFllmProjects((p) => FLLM_MAIN_WORK_IDS.has(p.id) && p.category.includes('Healthcare'));
        return {
            title: 'Healthcare projects',
            paragraphs: matches.map((p) => `${p.title}: ${p.metrics[0]}. ${p.summary}`),
            links: fllmProjectLinks(matches, 2),
        };
    }

    if (brandIntent) {
        const matches = filterFllmProjects((p) => p.category.includes('Brand'));
        return {
            title: 'Brand & identity work',
            paragraphs: matches.map((p) => `${p.title}, ${p.summary}`),
            links: fllmProjectLinks(matches, 4),
        };
    }

    if (contactIntent) {
        return {
            title: 'Availability & contact',
            paragraphs: [
                'Yes, Matheus is open to selected product design, brand, and interface projects, remote worldwide.',
                'Best next step: email fonsecaa.design@gmail.com with context, timeline, and what you want to build.',
            ],
            links: [{ label: 'Copy email from homepage →', url: 'index.html#home' }],
        };
    }

    if (approachIntent) {
        const faq = faqs.find((item) => normalizeFllmText(item.question).includes('approach'));
        if (faq) {
            return {
                title: faq.question,
                paragraphs: faq.answer,
                links: [{ label: 'See Hedgehog product case →', url: 'project-hedgehog-product.html' }],
            };
        }
    }

    const scored = FLLM_PROJECTS
        .map((project) => ({ project, score: scoreFllmProject(project, tokens) }))
        .filter((entry) => entry.score > 0)
        .sort((a, b) => b.score - a.score || b.project.impactScore - a.project.impactScore);

    if (scored.length) {
        const best = scored[0].project;
        const related = scored.slice(1, 3).map((entry) => entry.project);
        return {
            title: best.title,
            paragraphs: [
                best.summary,
                `Key results: ${best.metrics.join('; ')}.`,
                related.length ? `Related: ${related.map((p) => p.title).join(', ')}.` : '',
            ].filter(Boolean),
            links: fllmProjectLinks([best, ...related], 3),
        };
    }

    const faqMatch = faqs.find((item) => {
        const haystack = normalizeFllmText([item.question, ...(item.answer || [])].join(' '));
        return tokens.some((token) => haystack.includes(token));
    });

    if (faqMatch) {
        return {
            title: faqMatch.question,
            paragraphs: faqMatch.answer,
            links: fllmProjectLinks(filterFllmProjects((p) => FLLM_MAIN_WORK_IDS.has(p.id)), 2),
        };
    }

    return {
        title: 'Try a more specific question',
        paragraphs: [
            'I can answer from Matheus\'s case studies: impact metrics, industries, and project summaries.',
            'Examples: "Which project had the biggest impact?", "Web3 projects", or "Healthcare work".',
        ],
        links: fllmProjectLinks(filterFllmProjects((p) => FLLM_MAIN_WORK_IDS.has(p.id)), 4),
    };
}

function renderFllmSearchResult(container, result) {
    container.replaceChildren();
    if (!result) {
        container.hidden = true;
        return;
    }

    container.hidden = false;
    const wrap = document.createElement('article');
    wrap.className = 'fllm-search-result';

    const title = document.createElement('h3');
    title.className = 'fllm-search-result__title';
    title.textContent = result.title;
    wrap.appendChild(title);

    result.paragraphs.forEach((text) => {
        const paragraph = document.createElement('p');
        paragraph.className = 'fllm-search-result__text';
        paragraph.textContent = text;
        wrap.appendChild(paragraph);
    });

    if (result.links?.length) {
        const links = document.createElement('div');
        links.className = 'fllm-search-result__links';
        result.links.forEach(({ label, url }) => {
            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.className = 'fllm-search-link';
            anchor.textContent = label;
            links.appendChild(anchor);
        });
        wrap.appendChild(links);
    }

    container.appendChild(wrap);
}

function fllmLocalFallback(userText = '', quote = '') {
    const t = (userText || '').toLowerCase();
    const has = (...words) => words.some((w) => t.includes(w));

    if (quote && !userText.trim()) {
        return 'Happy to talk about that line. What would you like to know? You can also email fonsecaa.design@gmail.com.';
    }
    if (has('hello', 'hi ', 'hey', 'oi', 'olá', 'ola')) {
        return "Hey! I'm Matheus, a senior product designer. Ask me about my projects, process, or availability.";
    }
    if (has('available', 'hire', 'hiring', 'freelance', 'work with', 'contact', 'reach', 'email', 'rate', 'budget', 'project in mind')) {
        return "Yes, I'm open to select projects and available for remote work worldwide. Best to email fonsecaa.design@gmail.com or connect on LinkedIn (/in/maths-fonseca).";
    }
    if (has('hedgehog', 'prediction', 'orderbook', 'waitlist')) {
        return 'At Hedgehog I redesigned how people predict on-chain, moving from orderbooks to pooled UP/DOWN rounds. In a closed beta with 100 waitlist users, 100% understood the mechanics by round two and time to first action dropped from ~10s to under 2–4s. I also designed the waitlist landing that turned 40K+ organic followers into 15,000+ sign-ups at 37.5% conversion with zero paid spend.';
    }
    if (has('transparent', 'market maker', 'liquidity', 'b2b', 'dashboard')) {
        return "At Transparent.space I'm Founding Product Designer. I built a B2B dashboard from zero that cuts cross-checking from ~20 minutes to under 30 seconds per data point, with task completion climbing from 61% to 88%, validated with Worldchain and Kraken.";
    }
    if (has('unimed', 'healthcare', 'health', 'insurance', 'telemedicine')) {
        return 'At Unimed Seguros I led a trust-first telemedicine app for 40K+ beneficiaries during COVID. The result was ~50K consultations per month with under 30% no-show and 80%+ in-app chat retention.';
    }
    if (has('petrobras')) {
        return "Petrobras Saúde isn't in my current featured portfolio, but I'm happy to discuss healthcare work. My featured case is Unimed Seguros: trust-first telemedicine for 40K+ beneficiaries with strong retention and no-show metrics during COVID.";
    }
    if (has('web3', 'defi', 'crypto', 'blockchain', 'on-chain', 'onchain')) {
        return "Web3/DeFi is a big part of my work: Hedgehog and Transparent.space, plus hackathon wins at ETHSamba 2023, Blockchain Rio 2024 (Ripio), and 2025 (BASE). I'm good at translating dense, technical systems into something people can actually use.";
    }
    if (has('approach', 'process', 'philosophy', 'unique', 'different', 'how do you', 'balance', 'strategy')) {
        return "I don't just design interfaces, I structure products. I benchmark the category, fix the mental model first, then turn complexity into something clear and usable from discovery to hand-off.";
    }
    if (has('project', 'work', 'portfolio', 'case', 'experience', 'done')) {
        return 'Featured work: Hedgehog prediction market (product + waitlist), Transparent.space (B2B market-maker dashboard), and Unimed Seguros (trust-first telemedicine). Creative Side includes Picnic, AURA, and NØRA. Want detail on any one of them?';
    }
    if (has('skill', 'tool', 'figma', 'stack', 'design system')) {
        return 'My toolkit: Figma, Photoshop, Illustrator, prototyping, user research, design systems, and website design.';
    }
    if (has('who are you', 'about you', 'yourself', 'bio', 'background')) {
        return "I'm Matheus Fonseca, a UX/UI and Product Designer in Rio de Janeiro with roots in art direction and 5+ years building digital products.";
    }
    return "I'm Matheus' assistant. I can talk about his featured projects (Hedgehog, Transparent.space, Unimed Seguros), his process, skills, or availability. For anything specific, email fonsecaa.design@gmail.com.";
}

// =====================================================
// FONSECA LLM — FAQ panel + portfolio search + live chat
// =====================================================
const FONSECA_LOGO_MARK = '<svg class="fonseca-logo-mark" viewBox="0 0 275 275" fill="none" aria-hidden="true"><path d="M137.5 0L146.445 115.904L234.727 40.2728L159.096 128.555L275 137.5L159.096 146.445L234.727 234.727L146.445 159.096L137.5 275L128.555 159.096L40.2728 234.727L115.904 146.445L0 137.5L115.904 128.555L40.2728 40.2728L128.555 115.904L137.5 0Z" fill="currentColor"/></svg>';

function initFonsecaLLM() {
    if (document.querySelector('.fllm-panel')) return;

    const MIN_SELECTION_LENGTH = 3;
    const MAX_SELECTION_LENGTH = 500;
    const TOOLTIP_OFFSET = 54;
    const FAQS = [
        {
            question: 'How does Matheus approach product design?',
            answer: [
                'He benchmarks the category and makes the problem explicit before opening Figma, then fixes the mental model before polishing UI.',
                'Recent examples: pooled UP/DOWN rounds instead of orderbooks at Hedgehog, institutional trust before conversion on the waitlist, and trust-first telemedicine flows at Unimed.'
            ],
        },
        {
            question: 'What selected work should I review?',
            answer: [
                'Hedgehog prediction market (product + waitlist), Transparent.space (B2B market maker dashboard), and Unimed Seguros (telemedicine app).',
                'Each case follows the same structure: problem, research, solution, validation, impact, and next steps with real metrics.'
            ],
        },
        {
            question: 'What are his strongest results?',
            answer: [
                'Hedgehog product: 100% of beta users understood mechanics by round two; time to first action dropped from ~10s to under 2–4s.',
                'Hedgehog waitlist: 15,000+ sign-ups at 37.5% conversion with zero paid traffic. Transparent.space: 61% → 88% task completion; ~20 min → under 30s per data check. Unimed: ~50K consultations/month with <30% no-show.'
            ],
        },
        {
            question: 'Is he available for new work?',
            answer: [
                'Yes, for selected product design, brand, and interface projects.',
                'The best next step is emailing fonsecaa.design@gmail.com with the context, timeline, and what you want to build.'
            ],
        },
    ];

    const overlay = document.createElement('div');
    overlay.className = 'fllm-overlay';
    overlay.setAttribute('aria-hidden', 'true');

    const panel = document.createElement('aside');
    panel.className = 'fllm-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-hidden', 'true');
    panel.setAttribute('aria-label', 'FonsecaLLM panel');
    panel.innerHTML = `
        <div class="fllm-panel__head">
            <span class="fllm-panel__brand">FonsecaLLM</span>
            <span class="fllm-panel__info" aria-hidden="true">i</span>
            <div class="fllm-panel__actions">
                <button type="button" class="fllm-panel__icon-btn" data-fllm-reset aria-label="Reset panel">
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M5.2 6.2A6.2 6.2 0 1 1 4 10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M5.2 6.2H2.4V3.4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
                <button type="button" class="fllm-panel__icon-btn" data-fllm-close aria-label="Close panel">
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M15 5L5 15M5 5l10 10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
                </button>
            </div>
        </div>
        <div class="fllm-panel__content">
            <div class="fllm-panel__intro">
                <div class="fllm-panel__spark" aria-hidden="true">${FONSECA_LOGO_MARK}</div>
                <h2 class="fllm-panel__title">Hey, ask away.</h2>
            </div>
            <div class="fllm-faq" data-fllm-faq></div>
            <div class="fllm-selected-quote" data-fllm-quote hidden>
                <div class="fllm-selected-quote__head">
                    <span>Selected text</span>
                    <button type="button" data-fllm-clear-quote aria-label="Clear selected text">&times;</button>
                </div>
                <p data-fllm-quote-text></p>
            </div>
            <div class="fllm-panel__chat-zone" data-fllm-chat-zone>
                <div class="fllm-chat" data-fllm-chat aria-live="polite"></div>
            </div>
        </div>
        <div class="fllm-panel__foot">
            <form class="fllm-composer" data-fllm-composer>
                <textarea class="fllm-input" data-fllm-input rows="1" placeholder="Which project had the biggest impact?" aria-label="Ask Fonseca"></textarea>
                <button type="submit" class="fllm-send" data-fllm-send aria-label="Send message">
                    <svg width="17" height="17" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M10 16V4M10 4L5 9M10 4l5 5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
            </form>
            <p class="fllm-disclaimer">AI assistant · may be imperfect. For anything important, email fonsecaa.design@gmail.com</p>
        </div>`;

    const quoteBtn = document.createElement('button');
    quoteBtn.type = 'button';
    quoteBtn.className = 'fllm-quote-btn';
    quoteBtn.setAttribute('aria-label', 'Ask Fonseca about selected text');
    quoteBtn.innerHTML = `
        <span class="fllm-quote-btn__spark" aria-hidden="true">${FONSECA_LOGO_MARK}</span>
        <span>Ask Fonseca</span>`;

    const launcher = document.createElement('button');
    launcher.type = 'button';
    launcher.className = 'fllm-launcher';
    launcher.setAttribute('aria-label', 'Ask Fonseca');
    launcher.setAttribute('aria-haspopup', 'dialog');
    launcher.innerHTML = FONSECA_LOGO_MARK;
    launcher.querySelector('svg')?.classList.add('fllm-launcher__icon');

    document.body.appendChild(overlay);
    document.body.appendChild(panel);
    document.body.appendChild(quoteBtn);
    document.body.appendChild(launcher);

    const title = panel.querySelector('.fllm-panel__title');
    const hint = document.createElement('p');
    hint.className = 'fllm-panel__hint';
    hint.textContent = 'Ask about projects, process, or availability. Highlight text on the page to ask about a quote.';
    title.insertAdjacentElement('afterend', hint);

    const faqWrap = panel.querySelector('[data-fllm-faq]');
    const chatZone = panel.querySelector('[data-fllm-chat-zone]');
    const chatWrap = panel.querySelector('[data-fllm-chat]');
    const chatForm = panel.querySelector('[data-fllm-composer]');
    const chatInput = panel.querySelector('[data-fllm-input]');
    const sendBtn = panel.querySelector('[data-fllm-send]');
    const closeBtn = panel.querySelector('[data-fllm-close]');
    const resetBtn = panel.querySelector('[data-fllm-reset]');
    const quoteCard = panel.querySelector('[data-fllm-quote]');
    const quoteText = panel.querySelector('[data-fllm-quote-text]');
    const clearQuoteBtn = panel.querySelector('[data-fllm-clear-quote]');

    const GREETING = "Hey — I'm Matheus. Ask about my work, process, or availability.";
    const messages = [];
    let isSending = false;
    let greeted = false;
    let selectedQuote = '';
    let selectionTimer = null;
    let selectionHideTimer = null;
    let lastQuoteShownAt = 0;
    let lastFocused = null;

    function createParagraph(text) {
        const paragraph = document.createElement('p');
        paragraph.textContent = text;
        return paragraph;
    }

    function truncateText(text, maxLength) {
        const trimmedText = text.trim();
        if (trimmedText.length <= maxLength) return trimmedText;
        return trimmedText.slice(0, maxLength - 3).trim() + '...';
    }

    function setQuote(text) {
        selectedQuote = truncateText(text || '', MAX_SELECTION_LENGTH);
        quoteCard.hidden = !selectedQuote;
        quoteText.textContent = selectedQuote;
        if (chatInput) {
            chatInput.placeholder = selectedQuote ? 'Ask about this quote…' : 'Which project had the biggest impact?';
        }
    }

    function isWeakSearchResult(result) {
        return !result || result.title === 'Try a more specific question';
    }

    function searchResultToPlainText(result) {
        const parts = [result.title, ...(result.paragraphs || [])].filter(Boolean);
        if (result.links?.length) {
            parts.push('Links: ' + result.links.map((link) => link.label).join(', '));
        }
        return parts.join('\n\n');
    }

    function addSearchBubble(result) {
        const el = document.createElement('div');
        el.className = 'fllm-msg fllm-msg--bot fllm-msg--rich';

        const titleEl = document.createElement('strong');
        titleEl.className = 'fllm-msg__title';
        titleEl.textContent = result.title;
        el.appendChild(titleEl);

        result.paragraphs.forEach((text) => {
            const paragraph = document.createElement('p');
            paragraph.className = 'fllm-msg__text';
            paragraph.textContent = text;
            el.appendChild(paragraph);
        });

        if (result.links?.length) {
            const links = document.createElement('div');
            links.className = 'fllm-msg__links';
            result.links.forEach(({ label, url }) => {
                const anchor = document.createElement('a');
                anchor.href = url;
                anchor.className = 'fllm-search-link';
                anchor.textContent = label;
                links.appendChild(anchor);
            });
            el.appendChild(links);
        }

        chatWrap.appendChild(el);
        scrollChatToBottom();
        return el;
    }

    function removeTypingIndicator(typing) {
        typing?.remove();
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function formatChatReply(text) {
        let safe = escapeHtml(text);
        safe = safe.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
        safe = safe.replace(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, '<a href="mailto:$1">$1</a>');
        return safe;
    }

    function scrollChatToBottom() {
        const zone = chatZone || panel.querySelector('.fllm-panel__content');
        if (!zone) return;
        requestAnimationFrame(() => {
            zone.scrollTop = zone.scrollHeight;
        });
    }

    function addBubble(role, text) {
        const el = document.createElement('div');
        el.className = 'fllm-msg ' + (role === 'user' ? 'fllm-msg--user' : 'fllm-msg--bot');
        el.innerHTML = role === 'user' ? escapeHtml(text) : formatChatReply(text);
        chatWrap.appendChild(el);
        scrollChatToBottom();
        return el;
    }

    function showTyping() {
        const el = document.createElement('div');
        el.className = 'fllm-typing';
        el.setAttribute('role', 'status');
        el.setAttribute('aria-label', 'Fonseca is typing');
        el.innerHTML = '<span></span><span></span><span></span>';
        chatWrap.appendChild(el);
        scrollChatToBottom();
        return el;
    }

    function setLoadingState(active) {
        isSending = active;
        if (sendBtn) {
            sendBtn.disabled = active;
            sendBtn.classList.toggle('is-loading', active);
            sendBtn.setAttribute('aria-busy', String(active));
        }
        panel.classList.toggle('fllm-panel--loading', active);
    }

    async function fetchChatReply(history, quote) {
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: history, quote }),
        });
        if (!res.ok) throw new Error('bad status ' + res.status);
        const data = await res.json();
        if (!data || !data.reply) throw new Error('no reply');
        return data.reply;
    }

    async function sendMessage() {
        const text = chatInput?.value?.trim() || '';
        if ((!text && !selectedQuote) || isSending) return;

        const quoteForThisTurn = selectedQuote;
        const displayText = text || 'Tell me about this.';
        addBubble('user', quoteForThisTurn ? `“${quoteForThisTurn}”\n\n${displayText}` : displayText);

        messages.push({ role: 'user', content: text || 'Tell me more about this.' });
        chatInput.value = '';
        chatInput.style.height = 'auto';
        clearQuote();
        closeAllFaqs();

        if (!quoteForThisTurn && text) {
            const localResult = answerFllmSearch(text, FAQS);
            if (!isWeakSearchResult(localResult)) {
                addSearchBubble(localResult);
                messages.push({ role: 'assistant', content: searchResultToPlainText(localResult) });
                chatInput.focus();
                return;
            }
        }

        setLoadingState(true);
        const typing = showTyping();
        let typingRemoved = false;

        try {
            let reply;
            try {
                reply = await fetchChatReply(messages, quoteForThisTurn);
            } catch (err) {
                const localResult = text ? answerFllmSearch(text, FAQS) : null;
                if (localResult && !isWeakSearchResult(localResult)) {
                    removeTypingIndicator(typing);
                    typingRemoved = true;
                    addSearchBubble(localResult);
                    messages.push({ role: 'assistant', content: searchResultToPlainText(localResult) });
                    return;
                }
                reply = fllmLocalFallback(text, quoteForThisTurn);
            }

            removeTypingIndicator(typing);
            typingRemoved = true;
            addBubble('bot', reply);
            messages.push({ role: 'assistant', content: reply });
        } finally {
            if (!typingRemoved) removeTypingIndicator(typing);
            setLoadingState(false);
            chatInput.focus();
            scrollChatToBottom();
        }
    }

    function clearQuote() {
        selectedQuote = '';
        quoteCard.hidden = true;
        quoteText.textContent = '';
        if (chatInput) {
            chatInput.placeholder = 'Which project had the biggest impact?';
        }
    }

    function setFaqExpanded(item, expanded) {
        const button = item.querySelector('.fllm-faq__question');
        const answer = item.querySelector('.fllm-faq__answer');
        item.classList.toggle('is-open', expanded);
        button.setAttribute('aria-expanded', String(expanded));
        answer.hidden = !expanded;
    }

    function closeAllFaqs() {
        faqWrap.querySelectorAll('.fllm-faq__item').forEach((item) => {
            setFaqExpanded(item, false);
        });
    }

    FAQS.forEach((faq, index) => {
        const item = document.createElement('div');
        const answerId = `fllm-answer-${index}`;
        item.className = 'fllm-faq__item';

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'fllm-faq__question';
        button.setAttribute('aria-expanded', 'false');
        button.setAttribute('aria-controls', answerId);
        button.innerHTML = `
            <span class="fllm-faq__arrow" aria-hidden="true">&#8618;</span>
            <span class="fllm-faq__label"></span>
            <span class="fllm-faq__chevron" aria-hidden="true"></span>`;
        button.querySelector('.fllm-faq__label').textContent = faq.question;

        const answer = document.createElement('div');
        answer.className = 'fllm-faq__answer';
        answer.id = answerId;
        answer.hidden = true;
        faq.answer.forEach((text) => answer.appendChild(createParagraph(text)));

        button.addEventListener('click', () => {
            const isExpanded = button.getAttribute('aria-expanded') === 'true';
            closeAllFaqs();
            if (!isExpanded) setFaqExpanded(item, true);
        });

        item.appendChild(button);
        item.appendChild(answer);
        faqWrap.appendChild(item);
    });

    function openPanel(quote) {
        lastFocused = document.activeElement;
        if (quote) setQuote(quote);
        document.body.classList.add('fllm-open');
        overlay.setAttribute('aria-hidden', 'false');
        panel.setAttribute('aria-hidden', 'false');
        if (!greeted) {
            greeted = true;
            window.setTimeout(() => {
                addBubble('bot', GREETING);
                scrollChatToBottom();
            }, 150);
        }
        window.setTimeout(() => {
            if (chatInput) chatInput.focus();
        }, 260);
    }

    function closePanel() {
        document.body.classList.remove('fllm-open');
        overlay.setAttribute('aria-hidden', 'true');
        panel.setAttribute('aria-hidden', 'true');
        if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
    }

    function resetPanel() {
        clearQuote();
        closeAllFaqs();
        messages.length = 0;
        greeted = false;
        if (chatWrap) chatWrap.replaceChildren();
        if (chatInput) {
            chatInput.value = '';
            chatInput.style.height = 'auto';
            chatInput.placeholder = 'Which project had the biggest impact?';
        }
        setLoadingState(false);
    }

    function getElementFromNode(node) {
        if (!node) return null;
        if (node.nodeType === Node.ELEMENT_NODE) return node;
        return node.parentElement;
    }

    function isSelectionInsideAssistant(selection) {
        const anchorEl = getElementFromNode(selection.anchorNode);
        const focusEl = getElementFromNode(selection.focusNode);
        const selectedElements = [anchorEl, focusEl].filter(Boolean);
        return selectedElements.some((el) => {
            if (panel.contains(el) || quoteBtn.contains(el) || launcher.contains(el)) return true;
            return false;
        });
    }

    function getSelectionRect(selection) {
        try {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            if (rect.width || rect.height) return rect;
            const rects = range.getClientRects();
            if (rects.length) return rects[0];
        } catch (err) {
            return null;
        }
        return null;
    }

    function getPointerPoint(event) {
        if (!event) return null;
        if (event.changedTouches && event.changedTouches.length) {
            return {
                x: event.changedTouches[0].clientX,
                y: event.changedTouches[0].clientY,
            };
        }
        if (typeof event.clientX !== 'number') return null;
        return { x: event.clientX, y: event.clientY };
    }

    function hideQuoteBtn() {
        clearTimeout(selectionHideTimer);
        quoteBtn.classList.remove('is-visible');
        delete quoteBtn.dataset.quote;
    }

    function positionQuoteBtn(event, rect) {
        const point = getPointerPoint(event);
        const centerX = point ? point.x : rect.left + rect.width / 2;
        const centerY = point ? point.y : rect.top;
        const buttonWidth = quoteBtn.offsetWidth || 128;
        const viewportWidth = document.documentElement.clientWidth;
        const maxLeft = viewportWidth - buttonWidth - 12;
        let left = centerX - buttonWidth / 2;
        let top = centerY - TOOLTIP_OFFSET;

        left = Math.max(12, Math.min(left, maxLeft));
        if (top < 12) top = rect.bottom + 12;

        quoteBtn.style.left = left + 'px';
        quoteBtn.style.top = top + 'px';
    }

    function showQuoteBtn(event) {
        if (document.body.classList.contains('fllm-open')) return;

        const selection = window.getSelection();
        if (!selection || selection.isCollapsed) {
            hideQuoteBtn();
            return;
        }

        const text = selection.toString().trim();
        const invalidLength = text.length < MIN_SELECTION_LENGTH || text.length > MAX_SELECTION_LENGTH;
        if (invalidLength || isSelectionInsideAssistant(selection)) {
            hideQuoteBtn();
            return;
        }

        const rect = getSelectionRect(selection);
        if (!rect) {
            hideQuoteBtn();
            return;
        }

        quoteBtn.dataset.quote = text;
        positionQuoteBtn(event, rect);
        quoteBtn.classList.add('is-visible');
        lastQuoteShownAt = Date.now();
        clearTimeout(selectionHideTimer);
    }

    function scheduleQuoteBtn(event) {
        clearTimeout(selectionTimer);
        clearTimeout(selectionHideTimer);
        selectionTimer = window.setTimeout(() => showQuoteBtn(event), 20);
    }

    function scheduleHideQuoteBtn() {
        clearTimeout(selectionHideTimer);
        selectionHideTimer = window.setTimeout(() => {
            if (document.body.classList.contains('fllm-open')) return;

            const selection = window.getSelection();
            const liveText = selection?.toString()?.trim() || '';
            if (liveText.length >= MIN_SELECTION_LENGTH) return;

            // Keep the pill clickable briefly after the browser clears the highlight.
            if (quoteBtn.classList.contains('is-visible') && quoteBtn.dataset.quote) {
                if (Date.now() - lastQuoteShownAt < 500) return;
            }

            hideQuoteBtn();
        }, 100);
    }

    closeBtn.addEventListener('click', closePanel);
    resetBtn.addEventListener('click', resetPanel);
    clearQuoteBtn.addEventListener('click', clearQuote);
    overlay.addEventListener('click', closePanel);
    chatForm?.addEventListener('submit', (event) => {
        event.preventDefault();
        sendMessage();
    });

    chatInput?.addEventListener('input', () => {
        chatInput.style.height = 'auto';
        chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
    });

    chatInput?.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && document.body.classList.contains('fllm-open')) closePanel();
        if (event.key === 'Escape') hideQuoteBtn();
        if (event.shiftKey && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
            scheduleQuoteBtn(event);
        }
    });
    document.addEventListener('mouseup', scheduleQuoteBtn);
    document.addEventListener('pointerup', scheduleQuoteBtn);
    document.addEventListener('touchend', scheduleQuoteBtn);
    document.addEventListener('selectionchange', () => {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed) {
            scheduleHideQuoteBtn();
            return;
        }
        scheduleQuoteBtn(null);
    });
    document.addEventListener('click', (event) => {
        if (quoteBtn.contains(event.target)) return;
        if (launcher.contains(event.target)) return;
        if (panel.contains(event.target)) return;
        if (document.body.classList.contains('fllm-open')) return;
        if (!quoteBtn.classList.contains('is-visible')) return;
        scheduleHideQuoteBtn();
    });
    window.addEventListener('scroll', () => scheduleHideQuoteBtn(), { passive: true });
    window.addEventListener('resize', () => scheduleHideQuoteBtn());

    quoteBtn.addEventListener('mousedown', (event) => event.preventDefault());
    quoteBtn.addEventListener('click', () => {
        const quote = quoteBtn.dataset.quote || '';
        hideQuoteBtn();
        const selection = window.getSelection();
        if (selection) selection.removeAllRanges();
        openPanel(quote);
    });

    launcher.addEventListener('click', () => {
        hideQuoteBtn();
        clearQuote();
        openPanel();
    });
}
