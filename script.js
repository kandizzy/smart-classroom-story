// Minimal: fade chapters in as they enter the viewport.
// Bauhaus says "no decoration." But subtle entry helps long pages feel composed.

(function () {
  const sections = document.querySelectorAll('.chapter, .phase-card');
  if (!('IntersectionObserver' in window) || sections.length === 0) return;

  sections.forEach(s => {
    s.style.opacity = '0';
    s.style.transform = 'translateY(12px)';
    s.style.transition = 'opacity 600ms ease-out, transform 600ms ease-out';
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -10% 0px' });

  sections.forEach(s => io.observe(s));
})();
