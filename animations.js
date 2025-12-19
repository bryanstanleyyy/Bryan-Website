// Animated Background Particles
class ParticleBackground {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.particleCount = 80;
        this.theme = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
        this.init();
    }

    init() {
        this.canvas.id = 'particle-canvas';
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.zIndex = '-1';
        this.canvas.style.pointerEvents = 'none';
        document.body.insertBefore(this.canvas, document.body.firstChild);

        this.resize();
        this.createParticles();
        this.animate();

        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createParticles() {
        this.particles = [];
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 3 + 1,
                speedX: Math.random() * 0.5 - 0.25,
                speedY: Math.random() * 0.5 - 0.25,
                opacity: Math.random() * 0.5 + 0.2
            });
        }
    }

    getParticleColor(opacity) {
        if (this.theme === 'light') {
            return `rgba(45, 122, 62, ${opacity})`; // Rich green for warm cream theme
        }
        return `rgba(76, 175, 80, ${opacity})`; // Original green for dark mode
    }

    updateTheme(theme) {
        this.theme = theme;
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles.forEach(particle => {
            particle.x += particle.speedX;
            particle.y += particle.speedY;

            if (particle.x < 0 || particle.x > this.canvas.width) particle.speedX *= -1;
            if (particle.y < 0 || particle.y > this.canvas.height) particle.speedY *= -1;

            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = this.getParticleColor(particle.opacity);
            this.ctx.fill();

            // Draw connections
            this.particles.forEach(otherParticle => {
                const dx = particle.x - otherParticle.x;
                const dy = particle.y - otherParticle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 120) {
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = this.getParticleColor(0.1 * (1 - distance / 120));
                    this.ctx.lineWidth = 0.5;
                    this.ctx.moveTo(particle.x, particle.y);
                    this.ctx.lineTo(otherParticle.x, otherParticle.y);
                    this.ctx.stroke();
                }
            });
        });

        requestAnimationFrame(() => this.animate());
    }
}

// Typewriter Effect
class TypeWriter {
    constructor(element, texts, speed = 100) {
        this.element = element;
        this.texts = texts;
        this.speed = speed;
        this.textIndex = 0;
        this.charIndex = 0;
        this.isDeleting = false;
        this.type();
    }

    type() {
        const currentText = this.texts[this.textIndex];

        if (this.isDeleting) {
            this.element.textContent = currentText.substring(0, this.charIndex - 1);
            this.charIndex--;
        } else {
            this.element.textContent = currentText.substring(0, this.charIndex + 1);
            this.charIndex++;
        }

        let typeSpeed = this.speed;

        if (this.isDeleting) {
            typeSpeed /= 2;
        }

        if (!this.isDeleting && this.charIndex === currentText.length) {
            typeSpeed = 2000;
            this.isDeleting = true;
        } else if (this.isDeleting && this.charIndex === 0) {
            this.isDeleting = false;
            this.textIndex = (this.textIndex + 1) % this.texts.length;
            typeSpeed = 500;
        }

        setTimeout(() => this.type(), typeSpeed);
    }
}

// Scroll Animations
class ScrollAnimations {
    constructor() {
        this.elements = document.querySelectorAll('.animate-on-scroll');
        this.init();
    }

    init() {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animated');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.1 }
        );

        this.elements.forEach(element => observer.observe(element));
    }
}

// Mobile Menu Toggle
class MobileMenu {
    constructor() {
        this.menuBtn = document.querySelector('.mobile-menu-btn');
        this.nav = document.querySelector('nav ul');
        this.themeToggle = document.querySelector('.theme-toggle-btn');

        if (this.menuBtn) {
            this.menuBtn.addEventListener('click', () => this.toggle());
        }
    }

    toggle() {
        this.nav.classList.toggle('active');
        this.menuBtn.classList.toggle('active');

        // Hide theme toggle button when mobile menu is open
        if (this.themeToggle) {
            if (this.nav.classList.contains('active')) {
                this.themeToggle.style.display = 'none';
            } else {
                this.themeToggle.style.display = 'flex';
            }
        }
    }
}

// Back to Top Button
class BackToTop {
    constructor() {
        this.button = document.getElementById('back-to-top');
        if (this.button) {
            this.init();
        }
    }

    init() {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                this.button.classList.add('visible');
            } else {
                this.button.classList.remove('visible');
            }
        });

        this.button.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// Parallax Effect
class ParallaxEffect {
    constructor() {
        this.elements = document.querySelectorAll('.parallax');
        this.init();
    }

    init() {
        window.addEventListener('scroll', () => {
            this.elements.forEach(element => {
                const speed = element.dataset.speed || 0.5;
                const yPos = -(window.pageYOffset * speed);
                element.style.transform = `translateY(${yPos}px)`;
            });
        });
    }
}

// Animated Counter
class AnimatedCounter {
    constructor() {
        this.counters = document.querySelectorAll('.stat-number');
        this.init();
    }

    init() {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                        this.animateCounter(entry.target);
                        entry.target.classList.add('counted');
                    }
                });
            },
            { threshold: 0.5 }
        );

        this.counters.forEach(counter => observer.observe(counter));
    }

    animateCounter(element) {
        const target = parseInt(element.textContent);
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;

        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                element.textContent = element.textContent.includes('+') ? target + '+' : target;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current) + (element.textContent.includes('+') ? '+' : '');
            }
        }, 16);
    }
}

// Cursor Trail Effect
class CursorTrail {
    constructor() {
        this.trail = [];
        this.maxTrail = 20;
        this.init();
    }

    init() {
        document.addEventListener('mousemove', (e) => {
            this.createDot(e.clientX, e.clientY);
        });
    }

    createDot(x, y) {
        const dot = document.createElement('div');
        dot.className = 'cursor-dot';
        dot.style.left = x + 'px';
        dot.style.top = y + 'px';
        document.body.appendChild(dot);

        this.trail.push(dot);

        if (this.trail.length > this.maxTrail) {
            const oldDot = this.trail.shift();
            oldDot.remove();
        }

        setTimeout(() => {
            dot.style.opacity = '0';
            setTimeout(() => dot.remove(), 300);
        }, 100);
    }
}

// Loading Animation
class LoadingAnimation {
    constructor() {
        this.loader = document.getElementById('page-loader');
        if (this.loader) {
            this.init();
        }
    }

    init() {
        window.addEventListener('load', () => {
            setTimeout(() => {
                this.loader.classList.add('fade-out');
                setTimeout(() => {
                    this.loader.style.display = 'none';
                }, 500);
            }, 500);
        });
    }
}

// Floating Elements
class FloatingElements {
    constructor() {
        this.createFloatingShapes();
    }

    createFloatingShapes() {
        const shapes = ['circle', 'square', 'triangle'];
        const container = document.createElement('div');
        container.className = 'floating-shapes';
        document.body.appendChild(container);

        for (let i = 0; i < 6; i++) {
            const shape = document.createElement('div');
            shape.className = `floating-shape ${shapes[Math.floor(Math.random() * shapes.length)]}`;
            shape.style.left = Math.random() * 100 + '%';
            shape.style.top = Math.random() * 100 + '%';
            shape.style.animationDelay = Math.random() * 5 + 's';
            shape.style.animationDuration = (Math.random() * 10 + 10) + 's';
            container.appendChild(shape);
        }
    }
}

// Card Tilt Effect
class CardTilt {
    constructor() {
        this.cards = document.querySelectorAll('.profile-card, .education-card, .experience-card, .project-card, .cert-card, .skill-category');
        this.init();
    }

    init() {
        this.cards.forEach(card => {
            card.addEventListener('mousemove', (e) => this.tilt(e, card));
            card.addEventListener('mouseleave', () => this.reset(card));
        });
    }

    tilt(e, card) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = (y - centerY) / 50;
        const rotateY = (centerX - x) / 50;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.005, 1.005, 1.005)`;
    }

    reset(card) {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
    }
}

// Theme Manager
class ThemeManager {
    constructor() {
        this.themeToggleBtn = document.getElementById('theme-toggle');
        this.currentTheme = this.getStoredTheme() || this.getSystemPreference();
        this.init();
    }

    init() {
        this.applyTheme(this.currentTheme);

        if (this.themeToggleBtn) {
            this.themeToggleBtn.addEventListener('click', () => this.toggleTheme());
        }

        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!this.getStoredTheme()) {
                this.applyTheme(e.matches ? 'dark' : 'light');
            }
        });
    }

    getSystemPreference() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    getStoredTheme() {
        return localStorage.getItem('theme');
    }

    applyTheme(theme) {
        this.currentTheme = theme;

        if (theme === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }

        if (window.particleBackground) {
            window.particleBackground.updateTheme(theme);
        }

        localStorage.setItem('theme', theme);
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme(newTheme);
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize theme manager FIRST
    new ThemeManager();

    // Initialize particle background and make globally accessible
    const particleBackground = new ParticleBackground();
    window.particleBackground = particleBackground;

    // Initialize typewriter effect on welcome message
    const welcomeElement = document.querySelector('.welcome-message');
    if (welcomeElement && (window.location.pathname === '/Bryan-Website/' || window.location.pathname === '/Bryan-Website/index.html' || window.location.pathname.endsWith('/Bryan-Website') || window.location.pathname === '/')) {
        const originalText = welcomeElement.textContent;
        welcomeElement.style.minHeight = '80px';
        new TypeWriter(welcomeElement, [originalText, 'Software Engineer', 'AI Enthusiast', 'Full Stack Developer', 'Tech Lover', 'Problem Solver', originalText]);
    }

    // Initialize scroll animations
    new ScrollAnimations();

    // Initialize mobile menu
    new MobileMenu();

    // Initialize back to top button
    new BackToTop();

    // Initialize parallax effect
    new ParallaxEffect();

    // Initialize animated counters
    new AnimatedCounter();

    // Initialize cursor trail (optional - can be disabled)
    // new CursorTrail();

    // Initialize loading animation
    new LoadingAnimation();

    // Initialize floating elements
    new FloatingElements();

    // Initialize card tilt effect
    new CardTilt();
});
