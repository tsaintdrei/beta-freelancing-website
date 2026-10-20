/* ===== 1. SKILLS: build the list, pop in when scrolled to ===== */
// To add or remove a skill, just edit this list.
const SKILLS = ["Short-form editing","Fast-paced editing","Color grading","Gaming","Clipping & highlights","Sound design","Captions & subtitles","Motion graphics","Masking & tracking","Documentation","Storytelling","Transitions","Cinematic looks","Audio cleanup","Thumbnails","Content strategy"];

const list = document.getElementById('sk');
SKILLS.forEach((text, i) => {
  const li = document.createElement('li');
  li.innerHTML = '<b>' + String(i + 1).padStart(2, '0') + '</b>' + text;
  li.style.transitionDelay = (i * 70) + 'ms';   // each item pops 70ms after the previous
  list.appendChild(li);
});

const skillsSection = document.getElementById('skills');
// IntersectionObserver = "tell me when this element enters/leaves the screen"
new IntersectionObserver(entries => {
  entries.forEach(e => skillsSection.classList.toggle('in', e.isIntersecting));
}, { threshold: .35 }).observe(skillsSection);


/* ===== 2. Fake timeline bars on the project cards ===== */
document.querySelectorAll('.tl').forEach(tl => {
  for (let i = 0; i < 28; i++) {
    const bar = document.createElement('s');
    bar.style.height = (20 + Math.random() * 80) + '%';
    tl.appendChild(bar);
  }
});

/* ===== 3. PROJECTS: slide in on entry, stay while visible, fade on exit ===== */
const cards = [...document.querySelectorAll('.card')];
let timers = [];
let shown = false;

function showProjects() {
  if (shown) return;               // already open, don't restart
  shown = true;
  cards.forEach((c, i) => timers.push(setTimeout(() => {
    c.classList.add('show');       // opening animation, left to right
    const v = c.querySelector('video');
    if (v) { v.currentTime = 0; v.play().catch(() => {}); }
  }, 300 + i * 1000)));
}

function hideProjects() {
  shown = false;
  timers.forEach(clearTimeout);
  timers = [];
  cards.forEach(c => {
    c.classList.remove('show');    // fade out
    const v = c.querySelector('video');
    if (v) v.pause();
  });
}

// watch the whole Work section, so the cards only fade when you leave it
new IntersectionObserver(entries => {
  entries[0].isIntersecting ? showProjects() : hideProjects();
}, { threshold: 0.1 }).observe(document.getElementById('work'));

/* ===== 4. PICTURE WHEEL: spins in, settles to neutral ===== */
const wheel = document.getElementById('wheel');
new IntersectionObserver(e => {
  if (e[0].isIntersecting) {
    wheel.classList.remove('spin');
    void wheel.offsetWidth;            // restarts the animation
    wheel.classList.add('spin');
  } else {
    wheel.classList.remove('spin');
  }
}, { threshold: .4 }).observe(wheel);
/* ===== 5. SCROLLING ROWS: each icon appears once, spread to fit the screen ===== */
document.querySelectorAll('.mq').forEach(row => {
  const track = row.querySelector('.track');
  const originals = [...track.children];
  const n = originals.length;
  const dir = +row.dataset.dir;   // 1 = moves left, -1 = moves right (set in the HTML)
  let W = 0, hover = false, resumeAt = 0, dragging = false, lastX = 0;

  function build() {
    // your icons + ONE hidden copy that only exists so the loop can wrap around
    track.innerHTML = '';
    originals.forEach(c => track.appendChild(c));
    originals.forEach(c => track.appendChild(c.cloneNode(true)));

    // spread the icons so one set is at least as wide as the screen
    const itemW = originals[0].offsetWidth;
    const cw = row.clientWidth;
    const gap = Math.max(40, Math.ceil((cw + 2 - n * itemW) / Math.max(1, n - 1)));
    track.style.gap = gap + 'px';

    W = n * (itemW + gap);        // width of one full set
    row.scrollLeft = dir < 0 ? W : 1;
  }
  build();

  let t;
  addEventListener('resize', () => { clearTimeout(t); t = setTimeout(build, 200); });

  // jump back by one set when you pass it (invisible loop)
  row.addEventListener('scroll', () => {
    if (!W) return;
    if (row.scrollLeft >= W + 1) row.scrollLeft -= W;
    else if (row.scrollLeft <= 0) row.scrollLeft += W;
  });

  // the auto-motion: nudge 1px every frame unless the user is interacting
  (function loop() {
    if (W && !hover && !dragging && performance.now() > resumeAt) row.scrollLeft += dir;
    requestAnimationFrame(loop);
  })();

  // pause on hover (mouse)
  row.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') hover = true; });
  row.addEventListener('pointerleave', () => hover = false);

  // trackpad / mouse wheel: resume 1 second after you stop
  row.addEventListener('wheel', () => resumeAt = performance.now() + 1000, { passive: true });

  // touch: pause while swiping, resume 1 second after letting go
  row.addEventListener('touchstart', () => hover = true, { passive: true });
  row.addEventListener('touchend', () => { resumeAt = performance.now() + 1000; hover = false; }, { passive: true });

  // mouse drag
  row.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse') { dragging = true; lastX = e.clientX; row.setPointerCapture(e.pointerId); }
  });
  row.addEventListener('pointermove', e => {
    if (dragging) { row.scrollLeft -= e.clientX - lastX; lastX = e.clientX; }
  });
  ['pointerup', 'pointercancel'].forEach(ev => row.addEventListener(ev, () => dragging = false));
});