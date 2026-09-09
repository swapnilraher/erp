/*!
 * Techstar ERP — Main JavaScript
 * Handles: nav, FAQ, tabs, lightbox, counters, scroll animations, form
 */

'use strict';

/* ====== HEADER / SCROLL ====== */
const header = document.querySelector('.header');
const hamburger = document.querySelector('.hamburger');
const mobileMenu = document.querySelector('.mobile-menu');

if (header) {
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });
}

if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  mobileMenu.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

/* ====== SMOOTH SCROLL FOR ANCHOR LINKS ====== */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height') || '70');
      const top = target.getBoundingClientRect().top + window.scrollY - offset - 16;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

/* ====== FAQ ACCORDION ====== */
document.querySelectorAll('.faq-item').forEach(item => {
  const question = item.querySelector('.faq-question');
  if (!question) return;
  question.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    // Close all
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    // Toggle clicked
    if (!isOpen) item.classList.add('open');
  });
});

/* ====== FEATURE TABS ====== */
document.querySelectorAll('.feature-tabs').forEach(tabsContainer => {
  const btns = tabsContainer.querySelectorAll('.feature-tab-btn');
  const panels = tabsContainer.closest('.feature-tabs-section')
    ? tabsContainer.closest('.feature-tabs-section').querySelectorAll('.feature-tab-panel')
    : document.querySelectorAll('.feature-tab-panel');

  btns.forEach((btn, i) => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      if (panels[i]) panels[i].classList.add('active');
    });
  });
});

/* ====== SCREENSHOT LIGHTBOX ====== */
const lightbox = document.querySelector('.lightbox');
const lightboxContent = document.querySelector('.lightbox-content');
const lightboxTitle = document.querySelector('.lightbox-title');
const lightboxClose = document.querySelector('.lightbox-close');

document.querySelectorAll('.gallery-item[data-label]').forEach(item => {
  item.addEventListener('click', () => {
    if (!lightbox) return;
    if (lightboxTitle) lightboxTitle.textContent = item.dataset.label || '';
    if (lightboxContent) lightboxContent.style.background = item.style.background || 'linear-gradient(135deg,#1E3A8A,#4F46E5)';
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  });
});

if (lightboxClose) {
  lightboxClose.addEventListener('click', closeLightbox);
}
if (lightbox) {
  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) closeLightbox();
  });
}
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeLightbox();
});

function closeLightbox() {
  if (!lightbox) return;
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}

/* ====== SCROLL ANIMATIONS ====== */
const observerOptions = {
  threshold: 0.12,
  rootMargin: '0px 0px -40px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll(
  '.animate-fade-up, .animate-fade, .animate-scale, .animate-slide-left, .animate-slide-right'
).forEach(el => observer.observe(el));

/* ====== NUMBER COUNTERS ====== */
function animateCounter(el) {
  const target = parseFloat(el.dataset.target || '0');
  const suffix = el.dataset.suffix || '';
  const prefix = el.dataset.prefix || '';
  const duration = 2000;
  const start = performance.now();
  const isFloat = !Number.isInteger(target);

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
    const current = target * eased;
    el.textContent = prefix + (isFloat ? current.toFixed(1) : Math.floor(current).toLocaleString('en-IN')) + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.counter-number').forEach(el => counterObserver.observe(el));

/* ====== DEMO FORM ====== */
const demoForm = document.querySelector('#demoForm');
const formContent = document.querySelector('#formContent');
const formSuccess = document.querySelector('#formSuccess');

if (demoForm) {
  demoForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const btn = this.querySelector('[type="submit"]');
    btn.textContent = 'Submitting...';
    btn.disabled = true;

    // Simulate API call
    setTimeout(() => {
      if (formContent) formContent.style.display = 'none';
      if (formSuccess) {
        formSuccess.classList.add('show');
      }
    }, 1500);
  });
}

/* ====== INDUSTRY CARDS HOVER ====== */
document.querySelectorAll('.industry-card').forEach(card => {
  card.addEventListener('mouseenter', function() {
    this.querySelector('.industry-icon').style.transform = 'scale(1.2)';
  });
  card.addEventListener('mouseleave', function() {
    this.querySelector('.industry-icon').style.transform = 'scale(1)';
  });
});

/* ====== VIDEO PLACEHOLDER ====== */
const videoPlaceholder = document.querySelector('.video-placeholder');
if (videoPlaceholder) {
  videoPlaceholder.addEventListener('click', () => {
    // Replace with actual YouTube embed when available
    alert('Demo video coming soon! Book a live demo to see Techstar ERP in action.');
  });
}

/* ====== ACTIVE NAV LINK HIGHLIGHTING ====== */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link[href^="#"]');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(section => {
    if (window.scrollY >= section.offsetTop - 120) {
      current = section.getAttribute('id');
    }
  });
  navLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === '#' + current);
  });
}, { passive: true });

/* ====== BAR CHART ANIMATIONS ====== */
const barObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.mockup-bar, .a-bar').forEach((bar, i) => {
        bar.style.animation = 'none';
        setTimeout(() => {
          bar.style.animation = `bar-grow 0.6s ease ${i * 80}ms forwards`;
        }, 10);
      });
      barObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll('.mockup-bars, .analytics-bars-wrap').forEach(el => barObserver.observe(el));

/* ====== PRICING TOGGLE (Annual/Monthly) ====== */
const pricingToggle = document.querySelector('#pricingToggle');
if (pricingToggle) {
  pricingToggle.addEventListener('change', function() {
    const label = document.querySelector('#pricingToggleLabel');
    if (label) label.textContent = this.checked ? 'Annual Billing' : 'Monthly Billing';
  });
}

/* ====== BACK TO TOP ====== */
const backToTopBtn = document.querySelector('#backToTop');
if (backToTopBtn) {
  window.addEventListener('scroll', () => {
    backToTopBtn.style.opacity = window.scrollY > 500 ? '1' : '0';
    backToTopBtn.style.pointerEvents = window.scrollY > 500 ? 'auto' : 'none';
  }, { passive: true });

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
