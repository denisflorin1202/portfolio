// Highlights the sidebar nav link matching the section currently in view.
const sections = document.querySelectorAll('main.log > section[id]');
const navLinks = document.querySelectorAll('.nav-link');

const setActive = (id) => {
  navLinks.forEach((link) => {
    link.classList.toggle('active', link.dataset.section === id);
  });
};

if ('IntersectionObserver' in window && sections.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActive(entry.target.id);
        }
      });
    },
    { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
  );

  sections.forEach((section) => observer.observe(section));
} else if (navLinks.length) {
  navLinks[0].classList.add('active');
}

// ---------- Scroll reveal ----------
// Elements fade and slide in once, the first time they enter the viewport.
// The "js" class is added only when JS runs, so the page stays fully visible without it.
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if ('IntersectionObserver' in window && !reduceMotion) {
  document.documentElement.classList.add('js');

  const targets = document.querySelectorAll(
    '.panel > h2, .hero-entry > *, .log-entry, .cert, .skill-group, .contact-grid, .footer-note'
  );

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
  );

  targets.forEach((el, i) => {
    el.classList.add('reveal');
    // Small stagger for siblings that appear together (hero lines, skill groups).
    el.style.setProperty('--d', `${(i % 4) * 70}ms`);
    revealObserver.observe(el);
  });

  // Staggered fade-in for the skill tags inside a group once it is revealed.
  document.querySelectorAll('.skill-group .tags span').forEach((tag, i) => {
    tag.style.setProperty('--t', `${(i % 8) * 45}ms`);
  });
}

// ---------- Scroll progress bar ----------
const bar = document.createElement('div');
bar.className = 'scroll-progress';
bar.setAttribute('aria-hidden', 'true');
document.body.appendChild(bar);

let ticking = false;
const updateProgress = () => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
  bar.style.transform = `scaleX(${ratio})`;
  ticking = false;
};

window.addEventListener(
  'scroll',
  () => {
    if (!ticking) {
      window.requestAnimationFrame(updateProgress);
      ticking = true;
    }
  },
  { passive: true }
);
updateProgress();
