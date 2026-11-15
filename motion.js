/* Native scroll drives every frame. No wheel interception, snapping or timed slideshow. */
(() => {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const slides = [...document.querySelectorAll('.screenshot-slide')];
  if (preference.matches) return;
  // All ordinary sections respond continuously to their viewport position.
  const ordinary = [...document.querySelectorAll('main > section:not(.screenshot-slide), main > .hero, .legal')];
  let sectionFrame = false;
  function renderSections(){
    sectionFrame=false;
    ordinary.forEach(section=>{
      if(preference.matches){section.style.transform='';section.style.opacity='';const phone=section.querySelector('.hero-art .phone');if(phone)phone.style.transform='';return;}
      const rect=section.getBoundingClientRect();
      const distance=Math.max(-1,Math.min(1,(rect.top+rect.height/2-innerHeight/2)/(innerHeight*.9)));
      section.style.transform=`translate3d(0,${distance*38}px,0)`;
      section.style.opacity=String(1-Math.abs(distance)*.08);
      const heroPhone=section.querySelector('.hero-art .phone');
      if(heroPhone) heroPhone.style.transform=`perspective(1000px) translateY(${distance*-35}px) rotateY(${distance*12}deg) rotateZ(${8+distance*5}deg)`;
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
  }
  function schedule(){ if(!queued){queued=true;requestAnimationFrame(render);} }
  addEventListener('scroll',schedule,{passive:true});
  addEventListener('resize',schedule,{passive:true});
  addEventListener('pageshow',schedule);
  preference.addEventListener('change',schedule);
  render();
})();
