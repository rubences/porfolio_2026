/* main.js — Portfolio 2026, Rubén Ces */

(function () {
  'use strict';

  /* ── Mobile navigation toggle ─────────────────────────── */
  const toggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', isOpen);
    });

    // Close menu when a link is clicked
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ── Sticky header shadow on scroll ───────────────────── */
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = () => {
      header.style.boxShadow = window.scrollY > 10
        ? '0 2px 20px rgba(0,0,0,.5)'
        : 'none';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ── Intersection Observer — fade-in on scroll ─────────── */
  const animatables = document.querySelectorAll(
    '.project-card, .stat-card, .skill-group, .research-area-card, .orcid-card'
  );

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    animatables.forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = `opacity .5s ease ${i * 0.06}s, transform .5s ease ${i * 0.06}s`;
      observer.observe(el);
    });

    document.addEventListener('animationend', () => {}, { once: true });
  }

  /* ── Apply visible state via CSS class ─────────────────── */
  const style = document.createElement('style');
  style.textContent = '.is-visible { opacity: 1 !important; transform: none !important; }';
  document.head.appendChild(style);

  /* ── Active nav link on scroll ─────────────────────────── */
  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('.nav__links a[href^="#"]');

  const highlightNav = () => {
    let current = '';
    sections.forEach(section => {
      if (window.scrollY >= section.offsetTop - 120) {
        current = section.id;
      }
    });
    navItems.forEach(a => {
      a.classList.toggle('is-active', a.getAttribute('href') === `#${current}`);
    });
  };

  window.addEventListener('scroll', highlightNav, { passive: true });

  /* ── Add active link style dynamically ─────────────────── */
  const navStyle = document.createElement('style');
  navStyle.textContent = `.nav__links a.is-active { color: var(--color-heading) !important; }`;
  document.head.appendChild(navStyle);

})();
