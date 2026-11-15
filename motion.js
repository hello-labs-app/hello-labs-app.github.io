/* Native scroll drives every frame. No wheel interception, snapping or timed slideshow. */
(() => {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const slides = [...document.querySelectorAll('.screenshot-slide')];
  if (!slides.length || preference.matches) return;
  const track = document.createElement('div');
  track.className = 'scroll-story';
  const stage = document.createElement('div');
  stage.className = 'scroll-stage';
  slides[0].before(track);
  track.append(stage);
  slides.forEach(slide => { stage.append(slide); slide.classList.add('story-panel'); });
  const meter = document.createElement('div');
  meter.className = 'story-meter'; meter.setAttribute('aria-hidden', 'true');
  meter.innerHTML = '<span></span><small></small>';
  stage.append(meter);
  let queued = false;
  const clamp = (x,a,b) => Math.max(a,Math.min(b,x));
  function render() {
    queued = false;
    const reduced = preference.matches;
    track.classList.toggle('motion-disabled', reduced);
    if (reduced) {
      track.style.removeProperty('height');
      slides.forEach(slide => {slide.removeAttribute('aria-hidden'); slide.style.cssText=''; slide.querySelector('.detail-phone').style.cssText=''; slide.querySelector(':scope > div').style.cssText='';});
      return;
    }
    const height = innerHeight;
    track.style.height = `${(slides.length * 1.35 + 1) * height}px`;
    const progress = clamp(-track.getBoundingClientRect().top / (track.offsetHeight-height),0,1);
    const cursor = slides.length === 1 ? progress : progress * (slides.length - 1);
    const active = Math.round(cursor);
    slides.forEach((slide,i) => {
      const delta = i-cursor;
      const opacity = slides.length === 1 ? 1 : clamp((.5-Math.abs(delta))*5,0,1);
      slide.style.opacity = opacity;
      slide.style.pointerEvents = i === active ? 'auto' : 'none';
      slide.setAttribute('aria-hidden',String(i !== active));
      const phone = slide.querySelector('.detail-phone');
      const copy = slide.querySelector(':scope > div');
      const travel = slides.length === 1 ? .5-progress : delta;
      phone.style.transform = `perspective(1100px) translate3d(${travel*65}px,${travel*34}px,0) rotateY(${travel*-24}deg) rotateZ(${travel*5}deg) scale(${1-Math.min(Math.abs(travel)*.075,.12)})`;
      copy.style.transform = `translate3d(0,${travel*55}px,0)`;
    });
    meter.querySelector('span').style.transform = `scaleX(${progress})`;
    meter.querySelector('small').textContent = `${String(active+1).padStart(2,'0')} / ${String(slides.length).padStart(2,'0')} · SCROLL TO EXPLORE`;
  }
  function schedule(){ if(!queued){queued=true;requestAnimationFrame(render);} }
  addEventListener('scroll',schedule,{passive:true});
  addEventListener('resize',schedule,{passive:true});
  addEventListener('pageshow',schedule);
  preference.addEventListener('change',schedule);
  render();
})();
