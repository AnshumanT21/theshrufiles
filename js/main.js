// ============ BUTTERFLY CURSOR ============
(function initCursor(){
  const cursor = document.getElementById('butterfly-cursor');
  if(!cursor) return;
  if(window.matchMedia('(pointer: coarse)').matches) return;

  let mouseX = window.innerWidth/2, mouseY = window.innerHeight/2;
  let curX = mouseX, curY = mouseY;
  let angle = 0, prevX = mouseX;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX; mouseY = e.clientY;
  });

  function loop(){
    const dx = mouseX - curX, dy = mouseY - curY;
    curX += dx * 0.16;
    curY += dy * 0.16 - Math.sin(Date.now()/220) * 0.6; // gentle vertical flutter
    const dirX = mouseX - prevX;
    angle += (dirX * 1.2 - angle) * 0.1;
    prevX = mouseX;
    cursor.style.transform = `translate(${curX}px, ${curY}px) rotate(${Math.max(-25, Math.min(25, angle))}deg)`;
    requestAnimationFrame(loop);
  }
  loop();
})();

// ============ SPRINKLE FIELD (ambient floating dots) ============
(function sprinkleField(){
  const field = document.querySelector('.sprinkle-field');
  if(!field) return;
  const colors = ['#F4A6C1', '#F2C14E', '#8FAE6E', '#E2483D'];
  const count = window.innerWidth < 700 ? 10 : 20;
  for(let i=0;i<count;i++){
    const dot = document.createElement('div');
    const size = 4 + Math.random()*5;
    dot.style.cssText = `
      position:absolute;
      left:${Math.random()*100}%;
      top:${Math.random()*100}%;
      width:${size}px; height:${size}px;
      border-radius:50%;
      background:${colors[i % colors.length]};
      opacity:${0.15 + Math.random()*0.2};
      animation: sprinkle-float ${8 + Math.random()*8}s ease-in-out infinite;
      animation-delay: -${Math.random()*8}s;
    `;
    field.appendChild(dot);
  }
  const style = document.createElement('style');
  style.textContent = `@keyframes sprinkle-float{
    0%,100%{ transform: translateY(0) translateX(0); }
    50%{ transform: translateY(-30px) translateX(12px); }
  }`;
  document.head.appendChild(style);
})();

// ============ COUNTDOWN ============
(function countdown(){
  const target = new Date('2026-08-17T00:00:00');
  const els = {
    d: document.getElementById('cd-days'),
    h: document.getElementById('cd-hours'),
    m: document.getElementById('cd-mins'),
    s: document.getElementById('cd-secs'),
  };
  if(!els.d) return;
  function tick(){
    const now = new Date();
    let diff = Math.max(0, target - now);
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    els.d.textContent = String(days).padStart(2,'0');
    els.h.textContent = String(hours).padStart(2,'0');
    els.m.textContent = String(mins).padStart(2,'0');
    els.s.textContent = String(secs).padStart(2,'0');
  }
  tick();
  setInterval(tick, 1000);
})();

// ============ CONFETTI BURST (small, local) ============
function burstConfetti(originX, originY, count = 26){
  const colors = ['#E2483D', '#F2C14E', '#8FAE6E', '#F4A6C1', '#6B4423'];
  for(let i=0;i<count;i++){
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    const startX = originX + (Math.random()-0.5)*160;
    const duration = 1.8 + Math.random()*1.4;
    piece.style.left = startX + 'px';
    piece.style.top = (originY - 20) + 'px';
    piece.style.background = colors[Math.floor(Math.random()*colors.length)];
    piece.style.animationDuration = duration + 's';
    piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), duration*1000 + 100);
  }
}

// ============ GRAND CONFETTI (full-screen, both corners arcing to center then falling) ============
function grandConfettiBurst(){
  const colors = ['#E2483D', '#F2C14E', '#8FAE6E', '#F4A6C1', '#6B4423', '#FFFFFF'];
  const w = window.innerWidth;
  const h = window.innerHeight;
  const g = 1000; // gravity, px/s^2
  const container = document.createElement('div');
  container.style.cssText = 'position:fixed; inset:0; pointer-events:none; z-index:9998; overflow:hidden;';
  document.body.appendChild(container);

  const pieces = [];
  const perSide = 75;

  function makePiece(fromLeft){
    const el = document.createElement('div');
    const size = 6 + Math.random()*7;
    el.style.cssText = `position:absolute; width:${size}px; height:${size*1.6}px; background:${colors[Math.floor(Math.random()*colors.length)]}; border-radius:${Math.random()>0.5?'50%':'2px'}; opacity:1;`;
    container.appendChild(el);

    const startX = fromLeft ? -10 : w + 10;
    const startY = -10 - Math.random()*30;
    const centerX = w/2 + (Math.random()-0.5)*w*0.35;
    const travelTime = 0.85 + Math.random()*0.5;
    const vx = (centerX - startX) / travelTime;
    const midY = h*0.38 + (Math.random()-0.5)*h*0.12;
    const vy0 = (midY - startY - 0.5*g*travelTime*travelTime) / travelTime;
    const rot0 = Math.random()*360;
    const spin = (Math.random()-0.5)*640;

    pieces.push({ el, startX, startY, vx, vy0, rot0, spin, start: performance.now(), maxLife: 3600 + Math.random()*800 });
  }

  for(let i=0;i<perSide;i++){
    setTimeout(() => makePiece(true), i*4);
    setTimeout(() => makePiece(false), i*4);
  }

  function tick(now){
    let alive = false;
    for(let i=pieces.length-1;i>=0;i--){
      const p = pieces[i];
      const t = (now - p.start)/1000;
      if(t > p.maxLife/1000 || (p.startY + p.vy0*t + 0.5*g*t*t) > h + 60){
        p.el.remove();
        pieces.splice(i,1);
        continue;
      }
      alive = true;
      const x = p.startX + p.vx*t;
      const y = p.startY + p.vy0*t + 0.5*g*t*t;
      const rot = p.rot0 + p.spin*t;
      p.el.style.transform = `translate(${x}px, ${y}px) rotate(${rot}deg)`;
    }
    if(alive){
      requestAnimationFrame(tick);
    } else {
      container.remove();
    }
  }
  requestAnimationFrame(tick);
}

// ============ SUCCESS "TING" SOUND ============
function playTing(){
  try{
    const Ctx = window.AudioContext || window.webkitAudioContext;
    const ctx = new Ctx();
    const now = ctx.currentTime;

    function bell(freq, delay, gainAmt, dur){
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + delay);
      gain.gain.setValueAtTime(0, now + delay);
      gain.gain.linearRampToValueAtTime(gainAmt, now + delay + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + delay);
      osc.stop(now + delay + dur + 0.05);
    }
    bell(1046.5, 0, 0.28, 0.9);      // C6
    bell(2093, 0, 0.10, 0.7);        // shimmer overtone
    bell(1568, 0.05, 0.14, 0.8);     // G6 for a bell-chord feel

    setTimeout(() => ctx.close(), 1200);
  }catch(e){ /* audio not available, fail silently */ }
}

// confetti + celebration on load
window.addEventListener('load', () => {
  setTimeout(() => grandConfettiBurst(), 300);
});

// coffee cup easter egg
(function coffeeEgg(){
  const btn = document.getElementById('coffee-btn');
  if(!btn) return;
  btn.addEventListener('click', (e) => {
    const rect = btn.getBoundingClientRect();
    burstConfetti(rect.left + rect.width/2, rect.top);
  });
})();

// ============ FLIP CARDS ============
document.querySelectorAll('[data-flip]').forEach(card => {
  card.addEventListener('click', () => card.classList.toggle('is-flipped'));
});

// ============ TEAM POLL EASTER EGG ============
(function teamPoll(){
  const buttons = document.querySelectorAll('.team-btn');
  const result = document.getElementById('team-result');
  if(!result) return;

  function playBuzzer(){
    try{
      const Ctx = window.AudioContext || window.webkitAudioContext;
      const ctx = new Ctx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(70, ctx.currentTime + 0.45);
      gain.gain.setValueAtTime(0.22, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
      osc.onended = () => ctx.close();
    }catch(e){ /* audio not available, fail silently */ }
  }

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('is-correct', 'is-wrong'));
      result.classList.remove('is-correct', 'is-wrong');
      const rect = btn.getBoundingClientRect();

      if(btn.dataset.team === 'logan'){
        btn.classList.add('is-correct');
        result.classList.add('is-correct');
        result.textContent = "correct. money, yachts, questionable decisions — we see you.";
        playTing();
        grandConfettiBurst();
      } else {
        btn.classList.add('is-wrong');
        result.classList.add('is-wrong');
        result.textContent = "YOU ARE SO WRONG, TRY AGAIN";
        playBuzzer();
      }
    });
  });
})();

// ============ RAIN + PUDDLES (notes section) ============
(function rainAndPuddles(){
  const section = document.getElementById('notes');
  const field = document.getElementById('rain-field');
  if(!section || !field) return;

  function spawnRaindrop(){
    const drop = document.createElement('div');
    drop.className = 'raindrop';
    const x = -5 + Math.random() * 90; // start a bit left so wind carries them rightward across the section
    const fall = section.offsetHeight + 60;
    const wind = 50 + Math.random() * 40; // rightward drift
    const duration = 0.7 + Math.random() * 0.5;
    drop.style.left = x + '%';
    drop.style.setProperty('--fall', fall + 'px');
    drop.style.setProperty('--wind', wind + 'px');
    drop.style.animationDuration = duration + 's';
    field.appendChild(drop);
    setTimeout(() => drop.remove(), duration * 1000 + 100);
  }

  let started = false;
  function start(){
    if(started) return;
    started = true;
    for(let i=0;i<12;i++){ setTimeout(spawnRaindrop, i*40); }
    setInterval(spawnRaindrop, 55);
  }

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if(entry.isIntersecting) start(); });
  }, { threshold: 0.05 });
  obs.observe(section);

  // splash on puddle click
  function spawnSplash(wrap){
    for(let i=0;i<2;i++){
      setTimeout(() => {
        const ring = document.createElement('div');
        ring.className = 'splash-ring';
        wrap.appendChild(ring);
        setTimeout(() => ring.remove(), 650);
      }, i * 90);
    }
    for(let i=0;i<8;i++){
      const drop = document.createElement('div');
      drop.className = 'splash-droplet';
      const angle = Math.random() * Math.PI - Math.PI/2; // upward-ish spread
      const dist = 18 + Math.random() * 26;
      const dx = Math.cos(angle) * dist;
      const dy = -Math.abs(Math.sin(angle) * dist) - 10;
      drop.style.setProperty('--dx', dx + 'px');
      drop.style.setProperty('--dy', dy + 'px');
      wrap.appendChild(drop);
      setTimeout(() => drop.remove(), 600);
    }
  }

  document.querySelectorAll('.puddle-wrap').forEach(wrap => {
    wrap.addEventListener('click', () => spawnSplash(wrap));
  });
})();

// ============ MOON: press to play a song, press again to stop (Spotify IFrame API) ============
(function moonSong(){
  const moonBtn = document.getElementById('moon-btn');
  const embedContainer = document.getElementById('moon-audio-embed');
  if(!moonBtn || !embedContainer) return;

  let controller = null;
  let isPlaying = false;
  let pendingPlay = false;

  window.onSpotifyIframeApiReady = (IFrameAPI) => {
    const options = {
      uri: 'spotify:track:71ThSwPHBegkD1Cj0G2cji', // Floated By — Peter Cat Recording Co.
      width: '300',
      height: '80'
    };
    IFrameAPI.createController(embedContainer, options, (EmbedController) => {
      controller = EmbedController;
      controller.addListener('playback_update', (e) => {
        isPlaying = !e.data.isPaused;
      });
      if(pendingPlay){
        controller.play();
        pendingPlay = false;
      }
    });
  };

  moonBtn.addEventListener('click', () => {
    if(!controller){
      // API script still loading — play as soon as it's ready
      pendingPlay = true;
      return;
    }
    if(isPlaying){
      controller.pause();
    } else {
      controller.play();
    }
  });
})();

// ============ LANTERN RIVER SCENE ============
(function lanternRiver(){
  const scene = document.getElementById('river-scene');
  const field = document.getElementById('lantern-field');
  if(!scene || !field) return;

  function spawnLantern(){
    const lantern = document.createElement('div');
    lantern.className = 'lantern';
    const xPercent = 4 + Math.random() * 92; // spread across the full width
    const drift = (Math.random() - 0.5) * 160; // horizontal drift as it rises
    const duration = 11 + Math.random() * 6;
    lantern.style.left = xPercent + '%';
    lantern.style.setProperty('--drift', drift + 'px');
    lantern.style.animationDuration = duration + 's';
    field.appendChild(lantern);
    setTimeout(() => lantern.remove(), duration * 1000 + 200);
  }

  let started = false;
  function start(){
    if(started) return;
    started = true;
    for(let i=0;i<8;i++){ setTimeout(spawnLantern, i * 450); }
    setInterval(spawnLantern, 750);
  }

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if(entry.isIntersecting) start(); });
  }, { threshold: 0.3 });
  obs.observe(scene);
})();

// ============ VINYL ROW: hover to preview a song ============
(function vinylRow(){
  const items = document.querySelectorAll('.vinyl-item');
  const iframe = document.getElementById('now-playing-iframe');
  const nowPlaying = document.getElementById('now-playing');
  if(!items.length || !iframe) return;

  let current = null;
  items.forEach(item => {
    item.addEventListener('click', () => {
      const trackId = item.dataset.track;
      if(current === trackId) return;
      current = trackId;
      iframe.src = `https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0&autoplay=1`;
      nowPlaying.textContent = `now playing: ${item.dataset.title}`;
    });
  });
})();

(function notesCarousel(){
  const track = document.getElementById('notes-track');
  if(!track) return;
  const cards = Array.from(track.querySelectorAll('.note-card'));
  const dotsWrap = document.getElementById('notes-dots');
  const prevBtn = document.getElementById('notes-prev');
  const nextBtn = document.getElementById('notes-next');
  const spidey2 = document.getElementById('spidey2-sticker');
  let index = 0;

  cards.forEach((_, i) => {
    const dot = document.createElement('span');
    if(i === 0) dot.classList.add('is-active');
    dotsWrap.appendChild(dot);
  });
  const dots = Array.from(dotsWrap.children);

  function updateHeight(){
    // measure the active card's natural height and size the track to match
    track.style.height = cards[index].scrollHeight + 'px';
  }

  function render(){
    cards.forEach((c, i) => c.classList.toggle('is-active', i === index));
    dots.forEach((d, i) => d.classList.toggle('is-active', i === index));
    if(spidey2) spidey2.style.display = (index === 0) ? 'block' : 'none';
    updateHeight();
  }
  prevBtn.addEventListener('click', () => { index = (index - 1 + cards.length) % cards.length; render(); });
  nextBtn.addEventListener('click', () => { index = (index + 1) % cards.length; render(); });
  window.addEventListener('resize', updateHeight);
  render();
})();

// ============ SCROLL REVEAL ============
(function scrollReveal(){
  const targets = document.querySelectorAll('.section-inner, .polaroid');
  targets.forEach(t => t.classList.add('reveal'));
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  targets.forEach(t => obs.observe(t));
})();