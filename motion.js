/* Native scroll drives every frame. No wheel interception, snapping or timed slideshow. */
(() => {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const slides = [...document.querySelectorAll('.screenshot-slide')];
  if (preference.matches) return;
  const clampMotion=(v,a,b)=>Math.max(a,Math.min(b,v));
  const ordinary=[...document.querySelectorAll('main > section:not(.screenshot-slide):not(.hero), .legal')];
  let sectionFrame=false;
  function renderSections(){
    sectionFrame=false;
    const reduced=preference.matches;
    ordinary.forEach(section=>{
      const rect=section.getBoundingClientRect();
      const entering=clampMotion((innerHeight*.82-rect.top)/(innerHeight*.58),0,1);
      [...section.children].forEach((child,i)=>{
        if(reduced){child.style.transform='';child.style.opacity='';return;}
        const phase=clampMotion(entering*1.22-i*.045,0,1);
        child.style.transform=`translate3d(0,${(1-phase)*100}px,0) scale(${.93+.07*phase})`;
        child.style.opacity=String(.35+.65*phase);
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
    slides.forEach((slide,i) => {
      const delta = i-cursor;
      slide.style.opacity = 1;
      slide.style.clipPath = 'none';
      slide.style.pointerEvents = i === active ? 'auto' : 'none';
      if(innerHeight<=700) slide.removeAttribute('aria-hidden');
      else slide.setAttribute('aria-hidden',String(i !== active));
      const phone = slide.querySelector('.detail-phone');
      const copy = slide.querySelector(':scope > div');
      const travel = .5-progress;
      const screenOpacity=slides.length===1?1:clamp(1-Math.abs(delta),0,1);
      phone.style.opacity=screenOpacity;
      copy.style.opacity=i===active?1:0;
      const caption=phone.querySelector('figcaption');
      if(caption)caption.style.visibility=i===active?'visible':'hidden';
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
