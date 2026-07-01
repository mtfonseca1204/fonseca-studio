(function initPageFromNavEarly() {
    if (!document.referrer) return;
    try {
        if (new URL(document.referrer).origin === location.origin) {
            document.documentElement.classList.add('page-from-nav');
        }
    } catch (_) {}
})();

document.addEventListener('DOMContentLoaded', () => {
    const coldFade = initPageEnter();
    if (coldFade) {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => document.body.classList.add('loaded'));
        });
    } else {
        document.body.classList.add('loaded');
    }
    requestAnimationFrame(() => {
        window.dispatchEvent(new CustomEvent('fonseca:layoutready'));
    });
    initDarkMode();
    initMobileMenu();
    initNavbarScroll();
    initSmoothScroll();
    initClientsCarousel();
    initScrollReveal();
    initEditorialScroll();
    revealHeroOnLoad();
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
    // FonsecaLLM is temporarily disabled. To reactivate, uncomment the line below.
    // initFonsecaLLM();
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
    });

    const reduceMotion = prefersReducedMotion();
    document.querySelectorAll('video[autoplay]').forEach((video) => {
        if (reduceMotion) {
            video.removeAttribute('autoplay');
            video.pause();
            return;
        }
        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) video.play().catch(() => {});
                else video.pause();
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

function initPageEnter() {
    if (prefersReducedMotion() || isSameOriginReferrer() || document.documentElement.classList.contains('page-from-nav')) {
        return false;
    }
    const navType = performance.getEntriesByType('navigation')[0]?.type;
    if (navType && navType !== 'navigate') return false;
    document.body.classList.add('page-init-fade');
    return true;
}

function initPageTransitions() {
    if (prefersReducedMotion()) return;

    document.addEventListener('click', (e) => {
        if (supportsNavViewTransitions()) return;

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
        '.about-skills-section',
        '.about-services-section',
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

    const update = rafThrottle(() => {
        const cur = getCurrentSection();
        [heroNavLinks, sideNavLinks].forEach(links => {
            links.forEach(l => {
                const isActive = l.getAttribute('href') === '#' + cur;
                l.classList.toggle('active', isActive);
                if (isActive) l.setAttribute('aria-current', 'true');
                else l.removeAttribute('aria-current');
            });
        });
        if (sideNav) {
            const top = caseContent.offsetTop - 150;
            const bottom = caseContent.offsetTop + caseContent.offsetHeight - 300;
            const y = window.scrollY;
            const show = y >= top && y <= bottom;
            sideNav.classList.toggle('visible', show);
            sideNav.classList.toggle('case-side-nav--revealed', show);
        }
    });

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('load', update);
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
    scenario: '<g class="motion-icon__book"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></g>',
    solution: '<g class="motion-icon__star"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></g>',
    'key-decisions': '<g class="motion-icon__key"><circle cx="7.5" cy="15.5" r="5.5"/><path d="M21 2l-9.6 9.6"/><path class="motion-icon__key-bit" d="M15.5 7.5l3 3L22 7l-3-3"/></g>',
    research: '<g class="motion-icon__search"><circle cx="11" cy="11" r="8"/><line class="motion-icon__search-handle" x1="21" y1="21" x2="16.65" y2="16.65"/></g>',
    design: '<g class="motion-icon__pen"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></g>',
    results: '<g class="motion-icon__chart"><line class="motion-icon__bar motion-icon__bar--3" x1="18" y1="20" x2="18" y2="10"/><line class="motion-icon__bar motion-icon__bar--2" x1="12" y1="20" x2="12" y2="4"/><line class="motion-icon__bar motion-icon__bar--1" x1="6" y1="20" x2="6" y2="14"/></g>',
    lessons: '<g class="motion-icon__books"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></g>',
    'next-steps': '<g class="motion-icon__arrow"><line x1="5" y1="12" x2="19" y2="12"/><polyline class="motion-icon__arrow-head" points="12 5 19 12 12 19"/></g>',
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
    sideNav?.querySelectorAll('.case-side-nav-link').forEach((link, i) => {
        const id = (link.getAttribute('href') || '').replace('#', '');
        const iconKey = CASE_SECTION_ICON_HTML[id] ? id : 'overview';
        const html = CASE_SECTION_ICON_HTML[id] || CASE_SECTION_ICON_HTML.overview;
        wrapLinkLabel(link, iconKey, html, 'case-side-nav-link--motion');
        link.style.setProperty('--nav-motion-i', String(i));
    });

    if (reduceMotion) return;

    const heroItems = document.querySelectorAll('.project-hero-case .container > *');
    heroItems.forEach((el, i) => {
        el.classList.add('case-motion', 'case-motion--hero');
        el.style.setProperty('--case-motion-i', String(i));
    });

    requestAnimationFrame(() => {
        heroItems.forEach((el) => el.classList.add('in-view'));
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
// FONSECA LLM — AI portfolio assistant
// =====================================================
function initFonsecaLLM() {
    if (document.querySelector('.fllm-launcher')) return;

    const SUGGESTIONS = [
        'What makes your design approach unique?',
        'What projects have you worked on?',
        'How do you balance design and strategy?',
        'Are you available for freelance work?',
    ];

    const GREETING = "Hey — I'm Matheus' assistant. Ask me about his work, process, or availability. What would you like to know?";

    // ---- build DOM ----
    const launcher = document.createElement('button');
    launcher.type = 'button';
    launcher.className = 'fllm-launcher';
    launcher.setAttribute('aria-label', 'Open FonsecaLLM, the AI assistant');
    launcher.innerHTML =
        '<span class="fllm-launcher__spark" aria-hidden="true"><span class="fllm-launcher__dot"></span></span>' +
        '<span class="fllm-launcher__label">FonsecaLLM</span>';

    const overlay = document.createElement('div');
    overlay.className = 'fllm-overlay';

    const panel = document.createElement('div');
    panel.className = 'fllm-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-label', 'FonsecaLLM chat');
    panel.innerHTML = `
        <div class="fllm-panel__head">
            <span class="fllm-panel__avatar" aria-hidden="true">F</span>
            <span class="fllm-panel__id">
                <span class="fllm-panel__name">FonsecaLLM</span>
                <span class="fllm-panel__status">Online · usually replies instantly</span>
            </span>
            <button type="button" class="fllm-panel__close" aria-label="Close chat">
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M15 5L5 15M5 5l10 10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
            </button>
        </div>
        <div class="fllm-body" id="fllmBody">
            <p class="fllm-intro__title">Ask me anything.</p>
            <div class="fllm-suggestions" id="fllmSuggestions"></div>
        </div>
        <div class="fllm-foot">
            <div class="fllm-quote-chip" id="fllmQuoteChip">
                <span class="fllm-quote-chip__mark" aria-hidden="true">&ldquo;</span>
                <span class="fllm-quote-chip__text" id="fllmQuoteText"></span>
                <button type="button" class="fllm-quote-chip__remove" id="fllmQuoteRemove" aria-label="Remove quote">&times;</button>
            </div>
            <form class="fllm-composer" id="fllmForm">
                <textarea class="fllm-input" id="fllmInput" rows="1" placeholder="Ask me anything…" aria-label="Message"></textarea>
                <button type="submit" class="fllm-send" id="fllmSend" aria-label="Send message">
                    <svg width="17" height="17" viewBox="0 0 20 20" fill="none"><path d="M10 16V4M10 4L5 9M10 4l5 5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
            </form>
            <p class="fllm-disclaimer">AI assistant · may be imperfect. For anything important, email fonsecaa.design@gmail.com</p>
        </div>`;

    const quoteBtn = document.createElement('button');
    quoteBtn.type = 'button';
    quoteBtn.className = 'fllm-quote-btn';
    quoteBtn.innerHTML = '<span aria-hidden="true">&ldquo;</span> Ask about this';

    document.body.appendChild(launcher);
    document.body.appendChild(overlay);
    document.body.appendChild(panel);
    document.body.appendChild(quoteBtn);

    // ---- refs ----
    const body = panel.querySelector('#fllmBody');
    const suggestionsWrap = panel.querySelector('#fllmSuggestions');
    const form = panel.querySelector('#fllmForm');
    const input = panel.querySelector('#fllmInput');
    const sendBtn = panel.querySelector('#fllmSend');
    const closeBtn = panel.querySelector('.fllm-panel__close');
    const quoteChip = panel.querySelector('#fllmQuoteChip');
    const quoteChipText = panel.querySelector('#fllmQuoteText');
    const quoteChipRemove = panel.querySelector('#fllmQuoteRemove');

    // ---- state ----
    const messages = [];       // {role, content} sent to API
    let pendingQuote = '';     // highlighted quote awaiting a question
    let isSending = false;
    let greeted = false;
    let lastFocused = null;

    // ---- render suggestions ----
    SUGGESTIONS.forEach((q) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'fllm-suggest';
        btn.textContent = q;
        btn.addEventListener('click', () => {
            input.value = q;
            sendMessage();
        });
        suggestionsWrap.appendChild(btn);
    });

    function clearIntro() {
        const intro = body.querySelector('.fllm-intro__title');
        const sugg = body.querySelector('.fllm-suggestions');
        if (intro) intro.remove();
        if (sugg) sugg.remove();
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // linkify emails + urls inside an already-escaped string
    function formatReply(text) {
        let safe = escapeHtml(text);
        safe = safe.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
        safe = safe.replace(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, '<a href="mailto:$1">$1</a>');
        return safe;
    }

    function addBubble(role, text) {
        clearIntro();
        const el = document.createElement('div');
        el.className = 'fllm-msg ' + (role === 'user' ? 'fllm-msg--user' : 'fllm-msg--bot');
        el.innerHTML = role === 'user' ? escapeHtml(text) : formatReply(text);
        body.appendChild(el);
        body.scrollTop = body.scrollHeight;
        return el;
    }

    function showTyping() {
        const el = document.createElement('div');
        el.className = 'fllm-typing';
        el.innerHTML = '<span></span><span></span><span></span>';
        body.appendChild(el);
        body.scrollTop = body.scrollHeight;
        return el;
    }

    // ---- quote chip ----
    function setQuote(text) {
        pendingQuote = (text || '').trim();
        if (pendingQuote) {
            quoteChipText.textContent = pendingQuote;
            quoteChip.classList.add('is-visible');
            input.placeholder = 'Ask about this quote…';
        } else {
            quoteChip.classList.remove('is-visible');
            input.placeholder = 'Ask me anything…';
        }
    }
    quoteChipRemove.addEventListener('click', () => setQuote(''));

    // ---- open / close ----
    function openPanel(prefillQuote) {
        lastFocused = document.activeElement;
        document.body.classList.add('fllm-open');
        if (prefillQuote) setQuote(prefillQuote);
        if (!greeted) {
            greeted = true;
            setTimeout(() => addBubble('bot', GREETING), 150);
        }
        setTimeout(() => input.focus(), 320);
    }

    function closePanel() {
        document.body.classList.remove('fllm-open');
        if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
    }

    launcher.addEventListener('click', () => openPanel());
    closeBtn.addEventListener('click', closePanel);
    overlay.addEventListener('click', closePanel);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && document.body.classList.contains('fllm-open')) closePanel();
    });

    // ---- input autosize ----
    input.addEventListener('input', () => {
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 120) + 'px';
    });
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        sendMessage();
    });

    // ---- send ----
    async function sendMessage() {
        const text = input.value.trim();
        if ((!text && !pendingQuote) || isSending) return;

        const quoteForThisTurn = pendingQuote;
        const displayText = text || 'Tell me about this.';
        addBubble('user', quoteForThisTurn ? `“${quoteForThisTurn}”\n\n${displayText}` : displayText);

        messages.push({ role: 'user', content: text || 'Tell me more about this.' });
        input.value = '';
        input.style.height = 'auto';
        setQuote('');

        isSending = true;
        sendBtn.disabled = true;
        const typing = showTyping();

        let reply;
        try {
            reply = await fetchReply(messages, quoteForThisTurn);
        } catch (err) {
            reply = localFallback(text, quoteForThisTurn);
        }
        typing.remove();
        addBubble('bot', reply);
        messages.push({ role: 'assistant', content: reply });

        isSending = false;
        sendBtn.disabled = false;
        input.focus();
    }

    async function fetchReply(history, quote) {
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

    // client-side fallback when the API isn't reachable (e.g. opened as a local file)
    function localFallback(userText, quote) {
        const t = (userText || '').toLowerCase();
        const has = (...w) => w.some((x) => t.includes(x));
        if (quote && !userText) return "Happy to talk about that line — what would you like to know? You can also email fonsecaa.design@gmail.com.";
        if (has('available', 'hire', 'freelance', 'work with', 'contact', 'email', 'budget', 'rate')) return "Yes — I'm open to select projects and available for remote work worldwide. Best to email fonsecaa.design@gmail.com or connect on LinkedIn (/in/maths-fonseca).";
        if (has('hedgehog', 'prediction', 'orderbook', 'waitlist')) return "At Hedgehog I reworked how people predict on-chain — from orderbooks to pooled UP/DOWN positions — taking task completion from 40% to 88% and time-to-first-action from ~8s to under 2s, and built the landing page that drove 15,000+ waitlist sign-ups with zero paid spend.";
        if (has('transparent', 'market maker', 'liquidity', 'b2b', 'dashboard')) return "At Transparent.space I'm Founding Product Designer — I built a B2B dashboard from zero that makes market-maker performance impossible to hide, lifting task completion from 61% to 88%.";
        if (has('petrobras', 'unimed', 'health', 'insurance', 'telemedicine')) return "In healthcare I redesigned Petrobras Saúde's telemedicine platform for 50,000+ employees and Unimed Seguros' insurance app, both with a focus on clarity under real-world urgency.";
        if (has('approach', 'process', 'unique', 'different', 'balance', 'strategy', 'philosophy')) return "I don't just design interfaces — I structure products. I start from the real problem and the system behind it, then turn complexity into something clear and usable, from discovery to hand-off.";
        if (has('project', 'work', 'portfolio', 'experience')) return "Selected work: Hedgehog (Web3 prediction market), Transparent.space (B2B market-maker dashboard), Petrobras Saúde and Unimed Seguros (healthcare), plus brand work for Picnic and Agent Arena. Want detail on any one?";
        if (has('skill', 'tool', 'figma', 'stack')) return "My toolkit: Figma, Photoshop, Illustrator, prototyping, user research, design systems, website and strategy design — with a strong Web3/DeFi specialization.";
        if (has('hello', 'hi', 'hey', 'oi', 'ola')) return "Hey! I'm Matheus — a product designer across Web3/DeFi, healthcare and enterprise. Ask me about my projects, process, or availability.";
        return "I'm Matheus' assistant — I can talk about his projects, process, skills, or availability. For anything specific, email fonsecaa.design@gmail.com.";
    }

    // =================================================
    // Highlight-to-ask: floating "Ask about this" button
    // =================================================
    let quoteBtnTimer = null;

    function hideQuoteBtn() {
        quoteBtn.classList.remove('is-visible');
    }

    function onSelection() {
        if (document.body.classList.contains('fllm-open')) return;
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed) { hideQuoteBtn(); return; }
        const text = sel.toString().trim();
        if (text.length < 12 || text.length > 600) { hideQuoteBtn(); return; }

        // ignore selections inside the panel/launcher itself
        const anchorNode = sel.anchorNode;
        if (anchorNode && quoteBtn.contains(anchorNode)) return;

        let rect;
        try { rect = sel.getRangeAt(0).getBoundingClientRect(); } catch (e) { return; }
        if (!rect || (!rect.width && !rect.height)) { hideQuoteBtn(); return; }

        const btnW = quoteBtn.offsetWidth || 130;
        let left = window.scrollX + rect.left + rect.width / 2 - btnW / 2;
        left = Math.max(window.scrollX + 8, Math.min(left, window.scrollX + document.documentElement.clientWidth - btnW - 8));
        const top = window.scrollY + rect.top - 46;

        quoteBtn.style.left = left + 'px';
        quoteBtn.style.top = (top < window.scrollY ? window.scrollY + rect.bottom + 10 : top) + 'px';
        quoteBtn.dataset.quote = text;
        quoteBtn.classList.add('is-visible');
    }

    document.addEventListener('mouseup', () => {
        clearTimeout(quoteBtnTimer);
        quoteBtnTimer = setTimeout(onSelection, 10);
    });
    document.addEventListener('selectionchange', () => {
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed) hideQuoteBtn();
    });
    window.addEventListener('scroll', hideQuoteBtn, { passive: true });

    quoteBtn.addEventListener('mousedown', (e) => e.preventDefault()); // keep selection
    quoteBtn.addEventListener('click', () => {
        const q = quoteBtn.dataset.quote || '';
        hideQuoteBtn();
        const sel = window.getSelection();
        if (sel) sel.removeAllRanges();
        openPanel(q);
    });
}
