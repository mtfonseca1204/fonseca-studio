// =====================================================
// FONSECA STUDIO - Advanced Animations & Interactions
// =====================================================

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    initPreloader();
    initDarkMode();
    initMobileMenu();
    initNavbarScroll();
    initScrollAnimations();
    initParallaxEffects();
    initMagneticButtons();
    initSmoothScroll();
    initImageReveal();
    initCounterAnimation();
    initFormInteractions();
    initCursorEffects();
    initBackgroundEffects();
    initSpotlightCards();
    initCursorTrail();
    initHeroClock();
    initHeroGrid();
    updateYear();
});

// =====================================================
// HERO CLOCK - Removed (not used in current design)
// =====================================================
function initHeroClock() {
    // Clock removed from hero design
}

// =====================================================
// HERO DOT GRID - Clean dots with breathing & hover
// =====================================================
function initHeroGrid() {
    const canvas = document.getElementById('heroGrid');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const spacing = 40;
    const dotRadius = 1;
    let dots = [];
    let mouseX = -1000;
    let mouseY = -1000;
    let animationId;
    let time = 0;
    
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        const cols = Math.ceil(canvas.width / spacing) + 1;
        const rows = Math.ceil(canvas.height / spacing) + 1;
        
        dots = [];
        for (let i = 0; i <= cols; i++) {
            for (let j = 0; j <= rows; j++) {
                dots.push({
                    x: i * spacing,
                    y: j * spacing,
                    hoverOpacity: 0,
                    pulseOffset: Math.random() * Math.PI * 2,
                    pulseSpeed: 0.4 + Math.random() * 0.5
                });
            }
        }
    }
    
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const color = isDark ? '255,255,255' : '0,0,0';
        
        dots.forEach(dot => {
            // Breathing animation
            const breathe = (Math.sin(time * dot.pulseSpeed + dot.pulseOffset) + 1) / 2;
            const breatheOpacity = breathe * (isDark ? 0.08 : 0.05);
            
            // Base + breathe + hover
            const baseOpacity = isDark ? 0.1 : 0.06;
            const hoverOpacity = dot.hoverOpacity * (isDark ? 0.5 : 0.35);
            const finalOpacity = baseOpacity + breatheOpacity + hoverOpacity;
            
            // Draw dot
            ctx.beginPath();
            ctx.arc(dot.x, dot.y, dotRadius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${color}, ${finalOpacity})`;
            ctx.fill();
        });
        
        // Edge fade
        const gradient = ctx.createRadialGradient(
            canvas.width / 2, canvas.height / 2, 0,
            canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) * 0.55
        );
        const bgColor = isDark ? '10,10,10' : '255,255,255';
        gradient.addColorStop(0, `rgba(${bgColor}, 0)`);
        gradient.addColorStop(0.6, `rgba(${bgColor}, 0)`);
        gradient.addColorStop(1, `rgba(${bgColor}, 1)`);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    function update() {
        time += 0.02;
        const radius = 100;
        
        dots.forEach(dot => {
            const dx = mouseX - dot.x;
            const dy = mouseY - dot.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            let target = 0;
            if (dist < radius) {
                target = Math.pow(1 - dist / radius, 2);
            }
            
            dot.hoverOpacity += (target - dot.hoverOpacity) * 0.1;
            
            if (target === 0) {
                dot.hoverOpacity *= 0.95;
            }
        });
    }
    
    function animate() {
        update();
        draw();
        animationId = requestAnimationFrame(animate);
    }
    
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.addEventListener('mousemove', (e) => {
            const rect = hero.getBoundingClientRect();
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;
        });
        
        hero.addEventListener('mouseleave', () => {
            mouseX = -1000;
            mouseY = -1000;
        });
    }
    
    window.addEventListener('resize', resize);
    resize();
    animate();
    
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            cancelAnimationFrame(animationId);
        } else {
            animate();
        }
    });
}

// =====================================================
// PRELOADER - Dennis Snellenberg Style
// =====================================================
function initPreloader() {
    const preloader = document.getElementById('preloader');
    if (!preloader) return;
    
    const words = preloader.querySelectorAll('.preloader-word');
    if (!words.length) return;
    
    // Add loading class to body
    document.body.classList.add('loading');
    
    let currentWord = 0;
    const wordDuration = 350; // Time each word is visible (ms)
    const transitionDelay = 150; // Delay before showing next word (ms)
    
    // Ensure first word is visible
    words[0].classList.add('active');
    
    // Start cycling after first word is shown
    setTimeout(() => {
        const wordCycler = setInterval(() => {
            // Exit current word
            words[currentWord].classList.remove('active');
            words[currentWord].classList.add('exit');
            
            // Move to next word
            currentWord++;
            
            if (currentWord < words.length) {
                // Activate new word with smooth delay
                setTimeout(() => {
                    words[currentWord].classList.add('active');
                }, transitionDelay);
            } else {
                // All words shown - complete preloader
                clearInterval(wordCycler);
                
                // Soft exit
                setTimeout(() => {
                    preloader.classList.add('complete');
                    document.body.classList.remove('loading');
                    document.body.classList.add('loaded');
                    
                    // Remove from DOM after slide animation
                    setTimeout(() => {
                        preloader.style.display = 'none';
                    }, 1000);
                }, 500);
            }
        }, wordDuration + transitionDelay);
    }, 300);
}

// =====================================================
// DARK MODE
// =====================================================
function initDarkMode() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const currentTheme = localStorage.getItem('theme') || 'light';

    if (currentTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    }

    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            const theme = document.documentElement.getAttribute('data-theme');
            const newTheme = theme === 'dark' ? 'light' : 'dark';
            
            // Add transition class for smooth theme change
            document.body.classList.add('theme-transition');
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            
            setTimeout(() => {
                document.body.classList.remove('theme-transition');
            }, 300);
        });
    }
}

// =====================================================
// MOBILE MENU
// =====================================================
function initMobileMenu() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');

    if (mobileMenuToggle && mobileMenu) {
        mobileMenuToggle.addEventListener('click', () => {
            mobileMenuToggle.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });

        // Close menu when clicking a link
        document.querySelectorAll('.mobile-menu a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenuToggle.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.classList.remove('menu-open');
            });
        });
    }
}

// =====================================================
// NAVBAR SCROLL EFFECT
// =====================================================
function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Hide/show navbar on scroll direction
        if (currentScroll > lastScroll && currentScroll > 500) {
            navbar.style.transform = 'translateY(-100%)';
        } else {
            navbar.style.transform = 'translateY(0)';
        }
        
        lastScroll = currentScroll;
    });
}

// =====================================================
// SCROLL ANIMATIONS
// =====================================================
function initScrollAnimations() {
    // Elements to animate
    const animateElements = document.querySelectorAll(`
        .section-intro,
        .section-title,
        .section-description,
        .project-card,
        .project-card-full,
        .service-card,
        .service-item,
        .process-step,
        .testimonial-card,
        .about-content,
        .about-image,
        .contact-info,
        .contact-form-wrapper,
        .content-section,
        .related-card,
        .work-header,
        .filter-bar,
        .services-list-wrapper,
        .services-video-placeholder,
        .footer-content,
        .brands-section
    `);

    // Add animation class
    animateElements.forEach((el) => {
        el.classList.add('animate-on-scroll');
    });

    // Add staggered delays for specific grouped elements
    const staggerGroups = [
        '.process-steps .process-step',
        '.projects-grid .project-card',
        '.services-list .service-item',
        '.related-grid .related-card'
    ];

    staggerGroups.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((el, index) => {
            el.style.transitionDelay = `${index * 0.1}s`;
        });
    });

    // Intersection Observer
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Trigger child animations
                const children = entry.target.querySelectorAll('.animate-child');
                children.forEach((child, i) => {
                    setTimeout(() => {
                        child.classList.add('visible');
                    }, i * 100);
                });
            }
        });
    }, observerOptions);

    animateElements.forEach(el => observer.observe(el));

    // Animate section labels with line
    document.querySelectorAll('.section-label').forEach(label => {
        label.style.opacity = '0';
        label.style.transform = 'translateY(20px)';
        
        const labelObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    entry.target.style.transition = 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
                }
            });
        }, { threshold: 0.5 });

        labelObserver.observe(label);
    });
}

// =====================================================
// PARALLAX EFFECTS
// =====================================================
function initParallaxEffects() {
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;

        // Hero parallax
        const hero = document.querySelector('.hero-content');
        if (hero && scrolled < window.innerHeight) {
            hero.style.transform = `translateY(${scrolled * 0.4}px)`;
            hero.style.opacity = 1 - (scrolled / window.innerHeight) * 0.6;
        }

        // Project hero parallax
        const projectHero = document.querySelector('.project-hero-title');
        if (projectHero && scrolled < window.innerHeight) {
            projectHero.style.transform = `translateY(${scrolled * 0.3}px)`;
        }

        // Custom parallax elements
        parallaxElements.forEach(el => {
            const speed = el.dataset.parallax || 0.5;
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                el.style.transform = `translateY(${scrolled * speed}px)`;
            }
        });
    });
}

// =====================================================
// MAGNETIC BUTTONS
// =====================================================
function initMagneticButtons() {
    const magneticBtns = document.querySelectorAll('.btn-primary, .btn-secondary, .btn-hero, .cta-button, .btn-submit, .magnetic');
    
    magneticBtns.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            // Stronger magnetic effect
            const strength = btn.classList.contains('btn-primary') ? 0.25 : 0.15;
            btn.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
            
            // Also move inner text/icon
            const text = btn.querySelector('.btn-text');
            const icon = btn.querySelector('.btn-icon');
            if (text) text.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
            if (icon) icon.style.transform = `translate(${x * 0.15 + 4}px, ${y * 0.15 - 4}px)`;
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate(0, 0)';
            
            const text = btn.querySelector('.btn-text');
            const icon = btn.querySelector('.btn-icon');
            if (text) text.style.transform = 'translate(0, 0)';
            if (icon) icon.style.transform = 'translate(0, 0)';
        });

        // Click ripple effect
        btn.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            
            const rect = this.getBoundingClientRect();
            ripple.style.left = `${e.clientX - rect.left}px`;
            ripple.style.top = `${e.clientY - rect.top}px`;
            
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
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
            
            e.preventDefault();
            const target = document.querySelector(href);
            
            if (target) {
                const offsetTop = target.offsetTop - 80;
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// =====================================================
// IMAGE REVEAL ON SCROLL
// =====================================================
function initImageReveal() {
    const images = document.querySelectorAll('.project-image, .gallery-item, .about-placeholder, .cover-placeholder');
    
    images.forEach(img => {
        img.classList.add('image-reveal');
    });

    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                imageObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    images.forEach(img => imageObserver.observe(img));
}

// =====================================================
// COUNTER ANIMATION
// =====================================================
function initCounterAnimation() {
    const counters = document.querySelectorAll('.stat-number, .metric-value');
    
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                entry.target.classList.add('counted');
                animateCounter(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => counterObserver.observe(counter));
}

function animateCounter(element) {
    // Check for data-value attribute first
    const dataValue = element.getAttribute('data-value');
    let end, prefix = '', suffix = '';
    
    if (dataValue) {
        end = parseInt(dataValue);
    } else {
        const text = element.textContent;
        const match = text.match(/([+-]?)(\d+)/);
        if (!match) return;
        
        prefix = match[1] || '';
        end = parseInt(match[2]);
        suffix = text.replace(match[0], '');
    }
    
    const duration = 1500;
    let start = 0;
    let startTimestamp = null;
    
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 4); // Ease out quart
        const current = Math.floor(easeProgress * (end - start) + start);
        element.textContent = prefix + current + suffix;
        
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    
    window.requestAnimationFrame(step);
}

// =====================================================
// FORM INTERACTIONS
// =====================================================
function initFormInteractions() {
    const formGroups = document.querySelectorAll('.form-group');
    
    formGroups.forEach(group => {
        const input = group.querySelector('input, textarea, select');
        const label = group.querySelector('label');
        
        if (input && label) {
            // Check initial value (for browser autofill)
            if (input.value) {
                group.classList.add('has-value');
            }
            
            // Focus animation
            input.addEventListener('focus', () => {
                group.classList.add('focused');
            });
            
            input.addEventListener('blur', () => {
                group.classList.remove('focused');
                if (input.value) {
                    group.classList.add('has-value');
                } else {
                    group.classList.remove('has-value');
                }
            });

            // Input animation on typing
            input.addEventListener('input', () => {
                if (input.value) {
                    group.classList.add('has-value');
                } else {
                    group.classList.remove('has-value');
                }
            });
        }
    });

    // Form submission
    const form = document.querySelector('.contact-form');
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitBtn = this.querySelector('.btn-submit');
            const originalContent = submitBtn.innerHTML;
            
            // Validate all fields
            const inputs = this.querySelectorAll('input, select, textarea');
            let isValid = true;
            
            inputs.forEach(input => {
                if (!input.value && input.hasAttribute('required')) {
                    isValid = false;
                    input.parentElement.classList.add('error');
                    input.style.borderColor = '#ef4444';
                    
                    setTimeout(() => {
                        input.style.borderColor = '';
                        input.parentElement.classList.remove('error');
                    }, 2000);
                }
            });
            
            if (!isValid) return;
            
            // Loading state
            submitBtn.innerHTML = '<span class="loading-spinner"></span><span>Sending...</span>';
            submitBtn.disabled = true;
            submitBtn.style.pointerEvents = 'none';
            
            // Submit to Formspree
            try {
                const formData = new FormData(this);
                const response = await fetch(this.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                
                if (response.ok) {
                    // Show success modal
                    const modal = document.getElementById('successModal');
                    if (modal) {
                        modal.classList.add('active');
                        document.body.style.overflow = 'hidden';
                    }
                    
                    // Reset form
                    this.reset();
                    formGroups.forEach(group => group.classList.remove('has-value'));
                    submitBtn.innerHTML = originalContent;
                    submitBtn.disabled = false;
                    submitBtn.style.pointerEvents = '';
                } else {
                    throw new Error('Form submission failed');
                }
            } catch (error) {
                submitBtn.innerHTML = '<span>Error! Try again</span>';
                submitBtn.style.background = '#ef4444';
                
                setTimeout(() => {
                    submitBtn.innerHTML = originalContent;
                    submitBtn.style.background = '';
                    submitBtn.disabled = false;
                    submitBtn.style.pointerEvents = '';
                }, 3000);
            }
        });
    }
}

// =====================================================
// CURSOR EFFECTS
// =====================================================
function initCursorEffects() {
    // Only on desktop
    if (window.innerWidth < 1024) return;

    // Create custom cursor
    const cursor = document.createElement('div');
    cursor.classList.add('custom-cursor');
    document.body.appendChild(cursor);

    const cursorDot = document.createElement('div');
    cursorDot.classList.add('cursor-dot');
    document.body.appendChild(cursorDot);

    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        cursorDot.style.left = `${mouseX}px`;
        cursorDot.style.top = `${mouseY}px`;
    });

    // Smooth cursor following
    function animateCursor() {
        cursorX += (mouseX - cursorX) * 0.15;
        cursorY += (mouseY - cursorY) * 0.15;
        
        cursor.style.left = `${cursorX}px`;
        cursor.style.top = `${cursorY}px`;
        
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Cursor hover states - disabled to keep cursor consistent

    // Hide cursor when leaving window
    document.addEventListener('mouseleave', () => {
        cursor.style.opacity = '0';
        cursorDot.style.opacity = '0';
    });

    document.addEventListener('mouseenter', () => {
        cursor.style.opacity = '1';
        cursorDot.style.opacity = '1';
    });
}

// =====================================================
// UPDATE YEAR
// =====================================================
function updateYear() {
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

// =====================================================
// PAGE LOAD ANIMATION
// =====================================================
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
    
    // Animate hero elements
    const heroElements = document.querySelectorAll('.hero-logo, .hero-tagline, .hero-actions');
    heroElements.forEach((el, i) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, 200 + (i * 150));
    });
});

// =====================================================
// SCROLL PROGRESS INDICATOR
// =====================================================
(function() {
    const progressBar = document.createElement('div');
    progressBar.classList.add('scroll-progress');
    document.body.appendChild(progressBar);

    window.addEventListener('scroll', () => {
        const scrollTop = document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const progress = (scrollTop / scrollHeight) * 100;
        progressBar.style.width = `${progress}%`;
    });
})();

// =====================================================
// TEXT REVEAL ANIMATION (for titles)
// =====================================================
function splitTextToChars(element) {
    const text = element.textContent;
    element.innerHTML = '';
    
    text.split('').forEach((char, i) => {
        const span = document.createElement('span');
        span.classList.add('char');
        span.textContent = char === ' ' ? '\u00A0' : char;
        span.style.transitionDelay = `${i * 0.03}s`;
        element.appendChild(span);
    });
}

// Initialize text split for specific elements
document.querySelectorAll('.split-text').forEach(splitTextToChars);

// =====================================================
// BACKGROUND EFFECTS
// =====================================================
function initBackgroundEffects() {
    // Create background container
    const bgContainer = document.createElement('div');
    bgContainer.classList.add('bg-effects-container');
    bgContainer.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; pointer-events: none; z-index: 0;';
    document.body.prepend(bgContainer);

    // Add Gradient Orbs (subtle ambient light)
    for (let i = 1; i <= 3; i++) {
        const orb = document.createElement('div');
        orb.classList.add('gradient-orb', `orb-${i}`);
        bgContainer.appendChild(orb);
    }

    // Add Floating Particles
    const particlesContainer = document.createElement('div');
    particlesContainer.classList.add('particles-container');
    
    for (let i = 0; i < 15; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.animationDelay = `${Math.random() * 20}s`;
        particle.style.animationDuration = `${15 + Math.random() * 15}s`;
        particle.style.width = `${2 + Math.random() * 3}px`;
        particle.style.height = particle.style.width;
        particlesContainer.appendChild(particle);
    }
    bgContainer.appendChild(particlesContainer);

    // Add Noise Overlay
    const noise = document.createElement('div');
    noise.classList.add('noise-overlay');
    document.body.appendChild(noise);
}

// =====================================================
// SPOTLIGHT CARDS
// =====================================================
function initSpotlightCards() {
    const cards = document.querySelectorAll('.service-card, .project-card, .project-card-full, .testimonial-card, .process-step, .contact-form-wrapper');
    
    cards.forEach(card => {
        card.classList.add('spotlight-card');
        
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            
            card.style.setProperty('--mouse-x', `${x}%`);
            card.style.setProperty('--mouse-y', `${y}%`);
        });
    });
}

// =====================================================
// CURSOR TRAIL
// =====================================================
function initCursorTrail() {
    // Only on desktop
    if (window.innerWidth < 1024 || 'ontouchstart' in window) return;

    const trailCount = 8;
    const trails = [];
    const positions = [];

    for (let i = 0; i < trailCount; i++) {
        const trail = document.createElement('div');
        trail.classList.add('cursor-trail');
        trail.style.opacity = 1 - (i / trailCount);
        trail.style.transform = `scale(${1 - (i / trailCount) * 0.5})`;
        document.body.appendChild(trail);
        trails.push(trail);
        positions.push({ x: 0, y: 0 });
    }

    let mouseX = 0, mouseY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animateTrails() {
        positions[0].x += (mouseX - positions[0].x) * 0.3;
        positions[0].y += (mouseY - positions[0].y) * 0.3;

        for (let i = 1; i < trailCount; i++) {
            positions[i].x += (positions[i - 1].x - positions[i].x) * 0.3;
            positions[i].y += (positions[i - 1].y - positions[i].y) * 0.3;
        }

        trails.forEach((trail, i) => {
            trail.style.left = `${positions[i].x}px`;
            trail.style.top = `${positions[i].y}px`;
        });

        requestAnimationFrame(animateTrails);
    }
    animateTrails();

    // Hide trails when mouse leaves
    document.addEventListener('mouseleave', () => {
        trails.forEach(trail => trail.style.opacity = '0');
    });

    document.addEventListener('mouseenter', () => {
        trails.forEach((trail, i) => {
            trail.style.opacity = 1 - (i / trailCount);
        });
    });
}

// =====================================================
// SUCCESS MODAL
// =====================================================
function closeSuccessModal() {
    const modal = document.getElementById('successModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Close modal on backdrop click
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('successModal');
    if (modal) {
        const backdrop = modal.querySelector('.modal-backdrop');
        backdrop.addEventListener('click', closeSuccessModal);
        
        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeSuccessModal();
            }
        });
    }
});
