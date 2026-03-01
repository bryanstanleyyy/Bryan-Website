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
    document.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
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
    this.startTime = Date.now();
    if (document.readyState === 'complete') {
      this.scheduleHide();
    } else {
      window.addEventListener('load', () => this.scheduleHide());
    }
  }

  scheduleHide() {
    // Enforce minimum display time so boot sequence plays (last line at 1.0s + 0.4s = 1.4s)
    const elapsed = Date.now() - this.startTime;
    const remaining = Math.max(0, 1500 - elapsed);
    setTimeout(() => this.hide(), remaining);
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
// MATRIX CANVAS — CyberGrid (Rain + Perspective Grid)
// ============================================
class MatrixCanvas {
  constructor() {
    this.canvas = document.getElementById('matrix-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.theme = document.documentElement.getAttribute('data-theme') || 'dark';
    this.isMobile = false;
    this.fontSize = 14;
    this.mouse = { x: 0.5, y: 0.5 };
    this.mouseLerp = { x: 0.5, y: 0.5 };
    this.columns = [];
    this.gridOffset = 0;
    this.gridPulseTimer = 120;
    this.activePulse = null;

    document.addEventListener('themechange', (e) => this.updateTheme(e.detail.theme));
    window.matrixCanvas = this;

    this.init();
  }

  init() {
    this.resize();
    this.animate();
    window.addEventListener('resize', () => this.resize(), { passive: true });
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX / window.innerWidth;
      this.mouse.y = e.clientY / window.innerHeight;
    }, { passive: true });
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.isMobile = window.innerWidth < 768;
    this.fontSize = this.isMobile ? 12 : 14;
    this.initColumns();
  }

  initColumns() {
    this.columns = [];
    const charset = '0123456789ABCDEF<>{}[]|/\\;:~@#$%^&*';
    const colSpacing = this.fontSize * 1.6;
    const count = Math.min(Math.floor(this.canvas.width / colSpacing), this.isMobile ? 24 : 52);
    const step = this.canvas.width / count;
    for (let i = 0; i < count; i++) {
      const len = 8 + Math.floor(Math.random() * 13);
      this.columns.push({
        x: step * i + step / 2,
        y: Math.random() * -this.canvas.height,
        speed: 0.4 + Math.random() * 1.8,
        len,
        chars: Array.from({ length: len }, () => charset[Math.floor(Math.random() * charset.length)]),
        mutateIn: Math.floor(Math.random() * 25),
        charset,
      });
    }
  }

  getAccentRGB() { return this.theme === 'light' ? '0, 100, 50' : '0, 255, 136'; }
  getBgRGB() { return this.theme === 'light' ? '242, 242, 247' : '5, 5, 8'; }
  getFadeAlpha() { return this.theme === 'light' ? 0.22 : 0.15; }

  drawRain() {
    const ctx = this.ctx;
    const color = this.getAccentRGB();
    const boldFont = `bold ${this.fontSize}px 'JetBrains Mono', monospace`;
    const normFont = `${this.fontSize}px 'JetBrains Mono', monospace`;
    ctx.textAlign = 'center';
    this.columns.forEach(col => {
      col.y += col.speed;
      col.mutateIn--;
      if (col.mutateIn <= 0) {
        col.chars[Math.floor(Math.random() * col.len)] =
          col.charset[Math.floor(Math.random() * col.charset.length)];
        col.mutateIn = 5 + Math.floor(Math.random() * 20);
      }
      if (col.y - col.len * this.fontSize > this.canvas.height) {
        col.y = -(Math.random() * this.canvas.height * 0.3 + this.fontSize);
        col.speed = 0.4 + Math.random() * 1.8;
      }
      for (let i = 0; i < col.len; i++) {
        const fy = col.y - i * this.fontSize;
        if (fy < -this.fontSize || fy > this.canvas.height + this.fontSize) continue;
        if (i === 0) {
          ctx.font = boldFont;
          ctx.fillStyle = `rgba(${color}, 0.82)`;
        } else {
          if (i === 1) ctx.font = normFont;
          ctx.fillStyle = `rgba(${color}, ${Math.max(0, 0.55 * (1 - i / col.len))})`;
        }
        ctx.fillText(col.chars[i % col.len], col.x, fy);
      }
    });
  }

  drawGrid() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const color = this.getAccentRGB();
    const vpX = w * 0.5 + (this.mouseLerp.x - 0.5) * 24;
    const vpY = h * 0.40 + (this.mouseLerp.y - 0.5) * 16;
    const numFans = 16;
    const numCross = 14;
    ctx.lineWidth = 0.6;
    for (let i = 0; i <= numFans; i++) {
      const bx = (w / numFans) * i;
      ctx.beginPath();
      ctx.moveTo(vpX, vpY);
      ctx.lineTo(bx, h);
      ctx.strokeStyle = `rgba(${color}, 0.06)`;
      ctx.stroke();
    }
    const offset = this.gridOffset % 1;
    for (let i = 0; i < numCross; i++) {
      const t = Math.pow((i + offset) / numCross, 2.4);
      const y = vpY + (h - vpY) * t;
      if (y <= vpY || y > h + 2) continue;
      const progress = (y - vpY) / (h - vpY);
      const xl = vpX + (0 - vpX) * progress;
      const xr = vpX + (w - vpX) * progress;
      let alpha = 0.06;
      if (this.activePulse !== null) {
        const diff = Math.abs(this.activePulse - i);
        if (diff < 1.5) alpha = 0.06 + 0.22 * (1 - diff / 1.5);
      }
      ctx.beginPath();
      ctx.moveTo(xl, y);
      ctx.lineTo(xr, y);
      ctx.strokeStyle = `rgba(${color}, ${alpha})`;
      ctx.lineWidth = alpha > 0.1 ? 0.9 : 0.5;
      ctx.stroke();
    }
    this.gridOffset += 0.008;
    if (this.activePulse !== null) {
      this.activePulse += 0.2;
      if (this.activePulse > numCross) this.activePulse = null;
    }
    this.gridPulseTimer--;
    if (this.gridPulseTimer <= 0 && Math.random() < 0.03) {
      this.activePulse = 0;
      this.gridPulseTimer = 180 + Math.floor(Math.random() * 120);
    }
  }

  animate() {
    const ctx = this.ctx;
    this.mouseLerp.x += (this.mouse.x - this.mouseLerp.x) * 0.04;
    this.mouseLerp.y += (this.mouse.y - this.mouseLerp.y) * 0.04;
    ctx.fillStyle = `rgba(${this.getBgRGB()}, ${this.getFadeAlpha()})`;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    if (!this.isMobile) this.drawGrid();
    this.drawRain();
    requestAnimationFrame(() => this.animate());
  }

  updateTheme(theme) { this.theme = theme; }
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
    this.elements = document.querySelectorAll('.glitch');
    if (!this.elements.length) return;
    this.heroEl = document.querySelector('.hero-name');
    this.setupIntersectionTriggers();
    this.scheduleGlitch(this.heroEl, 400);
  }

  setupIntersectionTriggers() {
    // Section headings glitch once when scrolled into view, then repeat periodically
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.target !== this.heroEl) {
          this.triggerGlitch(entry.target, 400);
          observer.unobserve(entry.target);
          this.scheduleGlitch(entry.target, 400);
        }
      });
    }, { threshold: 0.4 });

    this.elements.forEach(el => {
      if (el !== this.heroEl) observer.observe(el);
    });
  }

  scheduleGlitch(el, duration) {
    if (!el) return;
    const delay = 3000 + Math.random() * 4000;
    setTimeout(() => {
      this.triggerGlitch(el, duration);
      this.scheduleGlitch(el, duration);
    }, delay);
  }

  triggerGlitch(el, duration) {
    el.classList.add('glitching');
    setTimeout(() => el.classList.remove('glitching'), duration);
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
// MAGNETIC CURSOR
// ============================================
class MagneticCursor {
  constructor() {
    this.outer = document.getElementById('cursor-outer');
    this.dot = document.getElementById('cursor-dot');

    // Skip entirely on touch devices
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      document.body.classList.add('touch-device');
      return;
    }

    this.mouseX = window.innerWidth / 2;
    this.mouseY = window.innerHeight / 2;
    this.outerX = this.mouseX;
    this.outerY = this.mouseY;
    this.magnetX = 0;
    this.magnetY = 0;
    this.isVisible = false;
    this.lastTs = 0;
    // Cache magnetic elements once — avoids querySelectorAll on every mousemove
    this.magnetEls = [...document.querySelectorAll('.magnetic')];

    this.init();
  }

  init() {
    document.addEventListener('mousemove', (e) => {
      // Reveal cursors on first mouse movement
      if (!this.isVisible) {
        this.isVisible = true;
        if (this.outer) this.outer.style.opacity = '1';
        if (this.dot) this.dot.style.opacity = '1';
      }
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
      this.checkMagnetic(e);
    });

    // Hover state via event delegation
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest('a, button, .project-card, .cert-card, .spec-card, .contact-card')) {
        document.body.classList.add('cursor-hover');
      }
    });

    document.addEventListener('mouseout', (e) => {
      if (e.target.closest('a, button, .project-card, .cert-card, .spec-card, .contact-card')) {
        document.body.classList.remove('cursor-hover');
        this.magnetX = 0;
        this.magnetY = 0;
      }
    });

    document.addEventListener('mousedown', () => document.body.classList.add('cursor-clicking'));
    document.addEventListener('mouseup', () => document.body.classList.remove('cursor-clicking'));

    // Fallback: if touch fires after construction, restore cursor
    document.addEventListener('touchstart', () => {
      document.body.classList.add('touch-device');
    }, { once: true });

    requestAnimationFrame((ts) => this.animate(ts));
  }

  checkMagnetic(e) {
    let closestDist = Infinity;
    let targetMagX = 0;
    let targetMagY = 0;

    this.magnetEls.forEach(el => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dist = Math.hypot(e.clientX - cx, e.clientY - cy);

      if (dist < 100 && dist < closestDist) {
        closestDist = dist;
        const strength = 1 - dist / 100;
        targetMagX = (cx - e.clientX) * strength * 0.15;
        targetMagY = (cy - e.clientY) * strength * 0.15;
      }
    });

    // Lerp magnetic offset for smooth attraction
    this.magnetX += (targetMagX - this.magnetX) * 0.25;
    this.magnetY += (targetMagY - this.magnetY) * 0.25;
  }

  animate(timestamp) {
    const delta = Math.min(timestamp - this.lastTs, 50); // clamp to avoid jump on tab focus
    this.lastTs = timestamp;

    // Frame-rate independent lerp (equivalent to 0.08 factor at 60fps)
    const lerp = 1 - Math.pow(0.92, delta / 16.67);

    const dotX = this.mouseX + this.magnetX;
    const dotY = this.mouseY + this.magnetY;

    this.outerX += (dotX - this.outerX) * lerp;
    this.outerY += (dotY - this.outerY) * lerp;

    if (this.dot) {
      this.dot.style.left = dotX + 'px';
      this.dot.style.top = dotY + 'px';
    }
    if (this.outer) {
      this.outer.style.left = this.outerX + 'px';
      this.outer.style.top = this.outerY + 'px';
    }

    requestAnimationFrame((ts) => this.animate(ts));
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
  new MatrixCanvas();
  new TypeWriter();
  new GlitchEffect();
  new RevealAnimations();
  new AnimatedCounter();
  new TimelineAnimator();
  new TerminalSkills();
  new CardTilt();
  new MobileMenu();
  new MagneticCursor();
  new BackToTop();
});
