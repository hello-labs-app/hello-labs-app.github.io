/* Anime.js entrance and interaction choreography, progressively enhanced. */
(() => {
  const api = window.anime;
  if (!api?.animate) return;
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const running = new Set();
  const originals = new Map();
  function remember(element) {
    if (!originals.has(element)) originals.set(element, element.getAttribute('style'));
  }
  function play(elements, options) {
    const targets = Array.isArray(elements) ? elements : [elements];
    targets.forEach(remember);
    const animation = api.animate(targets, {
      ...options,
      onComplete: self => running.delete(self)
    });
    running.add(animation);
    return animation;
  }
  const hero = document.querySelector('.hero');
  if (!preference.matches && hero) {
    const copy = [...hero.querySelector('.hero-copy').children];
    play(copy, {
      opacity: [0, 1], translateY: [28, 0],
      delay: api.stagger(95, {start: 80}), duration: 850, ease: 'outCubic'
    });
    const phone = hero.querySelector('.phone');
    if (phone) play(phone, {
      opacity: [0, 1], translateY: [55, 0], rotate: [-6, 8],
      scale: [.92, 1], delay: 220, duration: 1250, ease: 'outQuart'
    });
    const note = hero.querySelector('.release-note');
    if (note) play(note, {
      opacity: [0, 1], translateY: [20, 0],
      delay: 650, duration: 750, ease: 'outCubic'
    });
  }
  // One transform owner per target; cancel interrupted hover transitions.
  const interactive = new Map();
  document.querySelectorAll('.button, .project-card').forEach(element => {
    function move(active) {
      if (preference.matches) return;
      interactive.get(element)?.cancel();
      const animation = play(element, {
        translateY: active ? -5 : 0, duration: 300, ease: 'outCubic'
      });
      interactive.set(element, animation);
    }
    element.addEventListener('pointerenter', event => {
      if (event.pointerType !== 'touch') move(true);
    });
    element.addEventListener('pointerleave', () => move(element.matches(':focus-visible')));
    element.addEventListener('focus', () => move(true));
    element.addEventListener('blur', () => move(element.matches(':hover')));
  });
  preference.addEventListener('change', () => {
    if (!preference.matches) return;
    running.forEach(animation => animation.cancel());
    running.clear();
    originals.forEach((style, element) => {
      if (style === null) element.removeAttribute('style');
      else element.setAttribute('style', style);
    });
  });
})();

/* Native scroll drives every frame. No wheel interception, snapping or timed slideshow. */
(() => {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const slides = [...document.querySelectorAll('.screenshot-slide')];
  if (preference.matches) return;
  const clampMotion=(v,a,b)=>Math.max(a,Math.min(b,v));
  const ordinary=[...document.querySelectorAll('main > section:not(.screenshot-slide):not(.hero), .legal')];
  // Pinned, self-hosted Anime.js: paused animations scrub with native scroll.
  // Keep the old interpolation as a graceful fallback if the vendor file fails.
  const animate = window.anime?.animate;
  const sectionAnimations = new Map();
  ordinary.forEach(section => [...section.children].forEach(child => {
    if (animate) sectionAnimations.set(child, animate(child, {
      translateY: [110, 0], scale: [.94, 1], opacity: [.2, 1],
      duration: 1000, ease: 'inOutSine', autoplay: false
    }));
  }));
  let sectionFrame=false;
  function renderSections(){
    sectionFrame=false;
    const reduced=preference.matches;
    ordinary.forEach(section=>{
      const rect=section.getBoundingClientRect();
      const entering=clampMotion((innerHeight*.95-rect.top)/(innerHeight*.65),0,1);
      [...section.children].forEach((child,i)=>{
        if(reduced){child.style.transform='';child.style.opacity='';return;}
        const phase=clampMotion(entering*1.12-i*.055,0,1);
        const animation=sectionAnimations.get(child);
        if(animation) animation.seek(phase*1000, true);
        else {
          child.style.transform=`translate3d(0,${(1-phase)*72}px,0) scale(${.96+.04*phase})`;
          child.style.opacity=String(.35+.65*phase);
        }
      });
    });

  }
  const queueSections=()=>{if(!sectionFrame){sectionFrame=true;requestAnimationFrame(renderSections);}};
  addEventListener('scroll',queueSections,{passive:true});
  addEventListener('resize',queueSections,{passive:true});
  preference.addEventListener('change',queueSections);
  renderSections();
  if (!slides.length) return;
  const track = document.createElement('div');
  track.className = 'scroll-story';
  const stage = document.createElement('div');
  stage.className = 'scroll-stage';
  slides[0].before(track);
  track.append(stage);
  slides.forEach(slide => { stage.append(slide); slide.classList.add('story-panel'); });
  const camera={travel:.5};
  const cameraAnimation=animate ? animate(camera, {
    travel: [.5,-.5], duration:1000, ease:'inOutSine', autoplay:false
  }) : null;
  let queued = false;
  const clamp = (x,a,b) => Math.max(a,Math.min(b,x));
  function render() {
    queued = false;
    const reduced = preference.matches;
    track.classList.toggle('motion-disabled', reduced);
    if (reduced) {
      track.style.removeProperty('height');
      slides.forEach(slide => {slide.removeAttribute('aria-hidden'); slide.style.cssText=''; slide.querySelector('.detail-phone').style.cssText=''; slide.querySelector(':scope > div').style.cssText='';const caption=slide.querySelector('figcaption');if(caption)caption.style.visibility='';});
      return;
    }
    const height = innerHeight;
    track.style.height = `${(slides.length * 1.35 + 1) * height}px`;
    const progress = clamp(-track.getBoundingClientRect().top / (track.offsetHeight-height),0,1);
    const cursor = slides.length === 1 ? progress : progress * (slides.length - 1);
    const active = Math.round(cursor);
    if(cameraAnimation) cameraAnimation.seek(progress*1000, true);
    slides.forEach((slide,i) => {
      const delta = i-cursor;
      slide.style.opacity = 1;
      slide.style.clipPath = 'none';
      slide.style.pointerEvents = i === active ? 'auto' : 'none';
      if(innerHeight<=700) slide.removeAttribute('aria-hidden');
      else slide.setAttribute('aria-hidden',String(i !== active));
      const phone = slide.querySelector('.detail-phone');
      const copy = slide.querySelector(':scope > div');
      const travel = cameraAnimation ? camera.travel : .5-progress;
      const screenCursor=Math.floor(cursor)+clamp(((cursor%1)-.38)/.24,0,1);
      const screenOpacity=slides.length===1?1:clamp(1-Math.abs(i-screenCursor),0,1);
      phone.style.opacity=screenOpacity;
      copy.style.opacity=i===active?1:0;
      const caption=phone.querySelector('figcaption');
      if(caption)caption.style.visibility=i===active?'visible':'hidden';
      phone.style.transform = `perspective(1100px) translate3d(${travel*100}px,${travel*70}px,0) rotateY(${travel*-38}deg) rotateZ(${travel*7}deg) scale(${1-Math.min(Math.abs(travel)*.075,.12)})`;
      copy.style.transform = `translate3d(0,${travel*75}px,0)`;
    });
  }
  function schedule(){ if(!queued){queued=true;requestAnimationFrame(render);} }
  addEventListener('scroll',schedule,{passive:true});
  addEventListener('resize',schedule,{passive:true});
  addEventListener('pageshow',schedule);
  preference.addEventListener('change',schedule);
  render();
})();
