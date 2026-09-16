// Keep section links and anchor spacing aligned with the responsive top bar.
const header = document.querySelector('.site-header');
const sections = [...document.querySelectorAll('main.log > section[id]')];
const navLinks = document.querySelectorAll('.nav-link');
let headerHeight = 0;
let scheduled = false;

function updateNavigation() {
  scheduled = false;
  header.classList.toggle('scrolled', window.scrollY > 24);
  const marker = headerHeight + 48;
  let current = sections[0]?.id;
  for (const section of sections) {
    if (section.getBoundingClientRect().top <= marker) current = section.id;
  }
  if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
    current = sections.at(-1)?.id;
  }
  navLinks.forEach((link) => {
    const active = link.dataset.section === current;
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}
function measureHeader() {
  headerHeight = Math.ceil(header.getBoundingClientRect().height);
  document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
  updateNavigation();
}
window.addEventListener('scroll', () => {
  if (!scheduled) {
    scheduled = true;
    requestAnimationFrame(updateNavigation);
  }
}, { passive: true });
window.addEventListener('resize', measureHeader);
window.addEventListener('load', measureHeader);
if ('ResizeObserver' in window) new ResizeObserver(measureHeader).observe(header);
measureHeader();

// Animate visible content once, without hiding content before JS is available.
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const entranceAnimations = new Map();
if ('IntersectionObserver' in window && 'animate' in Element.prototype) {
  const revealObserver = new IntersectionObserver((entries) => {
    let order = 0;
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      revealObserver.unobserve(entry.target);
      if (reducedMotion.matches || entry.target.contains(document.activeElement)) return;
      const animation = entry.target.animate([
        { opacity: 0, transform: 'translateY(16px)' },
        { opacity: 1, transform: 'translateY(0)' },
      ], {
        duration: 600,
        delay: Math.min(order++, 3) * 70,
        easing: 'cubic-bezier(0.2, 0.7, 0.3, 1)',
        fill: 'backwards',
      });
      entranceAnimations.set(entry.target, animation);
      animation.onfinish = animation.oncancel = () => entranceAnimations.delete(entry.target);
    });
  }, { threshold: 0, rootMargin: '0px 0px -24px 0px' });

  document.querySelectorAll(
    '.hero-entry > .identity, .panel > h2, .panel > .kicker, .panel > .lede, ' +
    '.log-entry, .skill-group, .training-profiles, .contact-grid, .download-section, .footer-note'
  ).forEach((element) => revealObserver.observe(element));
}

// Keyboard navigation and changes to the motion preference take effect immediately.
document.addEventListener('focusin', (event) => {
  entranceAnimations.forEach((animation, element) => {
    if (element.contains(event.target)) animation.cancel();
  });
});
reducedMotion.addEventListener('change', () => {
  if (reducedMotion.matches) entranceAnimations.forEach((animation) => animation.cancel());
});
