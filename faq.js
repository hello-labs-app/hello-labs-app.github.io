/* Native <details> remains fully usable without JavaScript or animation support. */
(() => {
  if (!Element.prototype.animate) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const controls = [];
  document.querySelectorAll('.faq details').forEach(details => {
    const summary = details.querySelector('summary');
    let animation = null;
    let desired = details.open;
    const finish = () => {
      if (!animation) return;
      const previous = animation;
      animation = null;
      if (previous) previous.cancel();
      details.open = desired;
      details.style.removeProperty('height');
      details.style.removeProperty('overflow');
    };
    controls.push(finish);
    summary.addEventListener('click', event => {
      if (reduced.matches) { if (animation) finish(); return; }
      event.preventDefault();
      const from = details.getBoundingClientRect().height;
      desired = animation ? !desired : !details.open;
      if (animation) { animation.cancel(); animation = null; }
      details.style.removeProperty('height');
      details.open = desired;
      const to = details.getBoundingClientRect().height;
      // Keep content mounted during collapse; native closed state follows animation.
      details.open = true;
      details.style.overflow = 'hidden';
      animation = details.animate(
        [{height: `${from}px`}, {height: `${to}px`}],
        {duration: 320, easing: 'cubic-bezier(.22,.72,.25,1)', fill: 'both'}
      );
      animation.onfinish = finish;
    });
  });
  reduced.addEventListener('change', () => controls.forEach(finish => finish()));
  addEventListener('resize', () => controls.forEach(finish => finish()), {passive:true});
})();
