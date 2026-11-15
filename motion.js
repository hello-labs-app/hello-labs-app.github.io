/* Progressive enhancement: content remains visible without JS or motion support. */
(() => {
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (preference.matches || !('IntersectionObserver' in window)) return;
  const sections = [...document.querySelectorAll('main > .section')];
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(({target, isIntersecting}) => {
      if (isIntersecting) {
        target.classList.add('is-visible');
        observer.unobserve(target);
      }
    });
  }, {threshold: 0, rootMargin: '0px 0px -8% 0px'});
  sections.forEach(section => {
    // Never hide a section already on screen, including direct anchor navigation.
    if (section.getBoundingClientRect().top < window.innerHeight) return;
    section.classList.add('scroll-reveal');
    observer.observe(section);
  });
  const revealAll = () => {
    sections.forEach(section => section.classList.add('is-visible'));
    observer.disconnect();
  };
  preference.addEventListener('change', event => { if(event.matches) revealAll(); });
  // Keyboard focus must never land on visually concealed content.
  document.addEventListener('focusin', event => {
    event.target.closest?.('.scroll-reveal')?.classList.add('is-visible');
  });
  window.addEventListener('pageshow', event => {if(event.persisted) revealAll();});
})();
