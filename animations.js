'use strict';

// ============================================
// THEME MANAGER
// ============================================
class ThemeManager {
  constructor() {
    this.btn = document.getElementById('theme-toggle');
    this.init();
  }

  init() {
    const saved = localStorage.getItem('theme');
    const system = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const theme = saved || system;
    this.apply(theme);

    this.btn?.addEventListener('click', () => this.toggle());

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) this.apply(e.matches ? 'dark' : 'light');
    });
  }

  apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    if (window.heroCanvas) window.heroCanvas.updateTheme(theme);
  }

  toggle() {
    const current = document.documentElement.getAttribute('data-theme');
    this.apply(current === 'light' ? 'dark' : 'light');
  }
}

// ============================================
// LOADING ANIMATION
// ============================================
class LoadingAnimation {
  constructor() {
    this.loader = document.getElementById('page-loader');
    if (document.readyState === 'complete') {
      this.hide();
    } else {
      window.addEventListener('load', () => this.hide());
    }
  }

  hide() {
    if (!this.loader) return;
    this.loader.style.opacity = '0';
    setTimeout(() => {
      this.loader.style.display = 'none';
    }, 600);
  }
}

// ============================================
// SCROLL PROGRESS
// ============================================
class ScrollProgress {
  constructor() {
    this.bar = document.getElementById('scroll-progress');
    window.addEventListener('scroll', () => this.update(), { passive: true });
  }

  update() {
    if (!this.bar) return;
    const scrolled = window.scrollY;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    this.bar.style.width = total > 0 ? `${(scrolled / total) * 100}%` : '0%';
  }
}

// ============================================
// NAV CONTROLLER
// ============================================
class NavController {
  constructor() {
    this.nav = document.getElementById('navbar');
    this.links = document.querySelectorAll('.nav-links a, .mobile-nav-links a');
    this.sections = document.querySelectorAll('section[id]');
    this.init();
  }

  init() {
    this.links.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const href = link.getAttribute('href');
        const target = document.querySelector(href);
        if (target) {
          const offset = document.getElementById('navbar')?.offsetHeight || 70;
          const top = target.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top, behavior: 'smooth' });
          document.body.classList.remove('menu-open');
          const menuBtn = document.querySelector('.mobile-menu-btn');
          if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
        }
      });
    });

    window.addEventListener('scroll', () => {
      this.updateCompact();
      this.updateActive();
    }, { passive: true });

    this.updateCompact();
    this.updateActive();
  }

  updateCompact() {
    if (!this.nav) return;
    this.nav.classList.toggle('scrolled', window.scrollY > 50);
  }

  updateActive() {
    const offset = (document.getElementById('navbar')?.offsetHeight || 70) + 20;
    const fromTop = window.scrollY + offset;
    let activeId = null;

    this.sections.forEach(section => {
      if (section.offsetTop <= fromTop) activeId = section.id;
    });

    this.links.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${activeId}`);
    });
  }
}

// ============================================
// HERO CANVAS
// ============================================
class HeroCanvas {
  constructor() {
    this.canvas = document.getElementById('hero-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.theme = document.documentElement.getAttribute('data-theme') || 'dark';
    this.init();
    window.heroCanvas = this;
  }

  init() {
    this.resize();
    this.animate();
    window.addEventListener('resize', () => this.resize(), { passive: true });
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.createParticles();
  }

  createParticles() {
    this.particles = [];
    const density = window.innerWidth < 768 ? 14000 : 8000;
    const count = Math.min(Math.floor((this.canvas.width * this.canvas.height) / density), 150);
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.6 + 0.2,
      });
    }
  }

  getColor() {
    return this.theme === 'light' ? '0, 180, 100' : '0, 255, 136';
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const color = this.getColor();
    const connectDist = 160;

    this.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(${color}, ${p.opacity})`;
      this.ctx.fill();
    });

    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < connectDist) {
          this.ctx.beginPath();
          this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
          this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
          this.ctx.strokeStyle = `rgba(${color}, ${0.22 * (1 - dist / connectDist)})`;
          this.ctx.lineWidth = 1;
          this.ctx.stroke();
        }
      }
    }

    requestAnimationFrame(() => this.animate());
  }

  updateTheme(theme) {
    this.theme = theme;
  }
}

// ============================================
// TYPEWRITER
// ============================================
class TypeWriter {
  constructor() {
    this.el = document.getElementById('typewriter');
    if (!this.el) return;
    this.strings = [
      'Software Engineer',
      'AI Enthusiast',
      'Full Stack Developer',
      'Tech Lover',
      'Problem Solver',
    ];
    this.index = 0;
    this.charIndex = 0;
    this.deleting = false;
    this.type();
  }

  type() {
    const current = this.strings[this.index];
    if (this.deleting) {
      this.el.textContent = current.slice(0, this.charIndex - 1);
      this.charIndex--;
    } else {
      this.el.textContent = current.slice(0, this.charIndex + 1);
      this.charIndex++;
    }

    let speed = this.deleting ? 50 : 100;

    if (!this.deleting && this.charIndex === current.length) {
      speed = 2000;
      this.deleting = true;
    } else if (this.deleting && this.charIndex === 0) {
      this.deleting = false;
      this.index = (this.index + 1) % this.strings.length;
      speed = 300;
    }

    setTimeout(() => this.type(), speed);
  }
}

// ============================================
// GLITCH EFFECT
// ============================================
class GlitchEffect {
  constructor() {
    this.el = document.querySelector('.glitch');
    if (!this.el) return;
    this.scheduleGlitch();
  }

  scheduleGlitch() {
    const delay = 3000 + Math.random() * 4000;
    setTimeout(() => {
      this.el.classList.add('glitching');
      setTimeout(() => {
        this.el.classList.remove('glitching');
        this.scheduleGlitch();
      }, 400);
    }, delay);
  }
}

// ============================================
// REVEAL ANIMATIONS
// ============================================
class RevealAnimations {
  constructor() {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');
            this.observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll('.reveal-hidden').forEach(el => this.observer.observe(el));
  }
}

// ============================================
// ANIMATED COUNTER
// ============================================
class AnimatedCounter {
  constructor() {
    const els = document.querySelectorAll('.stat-number[data-target]');
    if (!els.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.animate(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    els.forEach(el => observer.observe(el));
  }

  animate(el) {
    const target = parseInt(el.getAttribute('data-target'), 10);
    const duration = 2000;
    const startTime = performance.now();

    const update = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target);
      if (progress < 1) requestAnimationFrame(update);
    };

    requestAnimationFrame(update);
  }
}

// ============================================
// TIMELINE ANIMATOR
// ============================================
class TimelineAnimator {
  constructor() {
    const items = document.querySelectorAll('.timeline-item');
    if (!items.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
    );

    items.forEach((item, i) => {
      item.classList.add('reveal-hidden');
      item.style.transitionDelay = `${i * 80}ms`;
      observer.observe(item);
    });
  }
}

// ============================================
// TERMINAL SKILLS
// ============================================
class TerminalSkills {
  constructor() {
    const terminal = document.querySelector('.terminal');
    if (!terminal) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            terminal.classList.add('terminal-active');
            observer.unobserve(terminal);
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(terminal);
  }
}

// ============================================
// CARD TILT
// ============================================
class CardTilt {
  constructor() {
    if ('ontouchstart' in window) return;

    const cards = document.querySelectorAll('.project-card, .cert-card, .spec-card');

    cards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        card.style.transition = 'box-shadow 0.3s ease, border-color 0.3s ease';
      });

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -6;
        const rotateY = ((x - centerX) / centerX) * 6;
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease, border-color 0.3s ease';
        card.style.transform = '';
      });
    });
  }
}

// ============================================
// MOBILE MENU
// ============================================
class MobileMenu {
  constructor() {
    this.btn = document.querySelector('.mobile-menu-btn');
    this.closeBtn = document.querySelector('.mobile-menu-close');
    this.links = document.querySelectorAll('.mobile-nav-links a');
    this.init();
  }

  init() {
    this.btn?.addEventListener('click', () => this.toggle());
    this.closeBtn?.addEventListener('click', () => this.close());
    this.links.forEach(link => link.addEventListener('click', () => this.close()));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.close();
    });
  }

  toggle() {
    const open = document.body.classList.toggle('menu-open');
    this.btn?.setAttribute('aria-expanded', String(open));
  }

  close() {
    document.body.classList.remove('menu-open');
    this.btn?.setAttribute('aria-expanded', 'false');
  }
}

// ============================================
// CURSOR TRAIL
// ============================================
class CursorTrail {
  constructor() {
    if ('ontouchstart' in window) return;
    document.addEventListener('mousemove', (e) => this.createDot(e.clientX, e.clientY));
  }

  createDot(x, y) {
    const dot = document.createElement('div');
    dot.className = 'cursor-dot';
    dot.style.left = x + 'px';
    dot.style.top = y + 'px';
    document.body.appendChild(dot);
    setTimeout(() => dot.remove(), 600);
  }
}

// ============================================
// BACK TO TOP
// ============================================
class BackToTop {
  constructor() {
    this.btn = document.getElementById('back-to-top');
    window.addEventListener('scroll', () => {
      if (!this.btn) return;
      this.btn.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });

    this.btn?.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

// ============================================
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  new ThemeManager();
  new LoadingAnimation();
  new ScrollProgress();
  new NavController();
  new HeroCanvas();
  new TypeWriter();
  new GlitchEffect();
  new RevealAnimations();
  new AnimatedCounter();
  new TimelineAnimator();
  new TerminalSkills();
  new CardTilt();
  new MobileMenu();
  new CursorTrail();
  new BackToTop();
});
