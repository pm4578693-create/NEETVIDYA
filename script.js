const $ = s => document.querySelector(s);

/* Mobile menu */
const nav = $('#nav'), menu = $('#menu');
menu.onclick = () => menu.setAttribute('aria-expanded', nav.classList.toggle('open'));
nav.addEventListener('click', e => {
  if (e.target.tagName === 'A') { nav.classList.remove('open'); menu.setAttribute('aria-expanded', false); }
});

/* Practice questions (edit or add your own) */

let subject = 'Physics', order = [], pos = 0, answered = false;
const tabs = [...document.querySelectorAll('.tabs button')];

function shuffle(n) {
  const a = [...Array(n).keys()];
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function start() { order = shuffle(Q[subject].length); pos = 0; render(); }

function render() {
  const d = Q[subject][order[pos]];
  answered = false;
  $('#qno').textContent = `${subject}, question ${pos + 1} of ${order.length}`;
  $('#qtext').textContent = d.q;
  const box = $('#opts');
  box.innerHTML = '';
  d.o.forEach((text, n) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'opt';
    b.innerHTML = `<i>${'ABCD'[n]}</i><span></span>`;
    b.lastChild.textContent = text;
    b.onclick = () => pick(n, b);
    box.append(b);
  });
  $('#fb').hidden = true;
  $('#next').hidden = true;
}

function pick(n, btn) {
  if (answered) return;
  answered = true;
  const d = Q[subject][order[pos]], all = [...document.querySelectorAll('.opt')];
  all.forEach(b => b.disabled = true);
  btn.classList.add('sel');
  all[d.a].classList.add('ok');
  if (n !== d.a) btn.classList.add('no');
  const fb = $('#fb'), s = document.createElement('strong');
  s.textContent = n === d.a ? 'Correct. ' : `Not quite. The answer is ${'ABCD'[d.a]}. `;
  fb.replaceChildren(s, d.e);
  fb.hidden = false;
  $('#next').hidden = false;
}

tabs.forEach(t => t.onclick = () => {
  subject = t.textContent;
  tabs.forEach(x => x.setAttribute('aria-pressed', x === t));
  start();
});
$('#next').onclick = () => {
  pos++;
  if (pos >= order.length) { order = shuffle(order.length); pos = 0; }
  render();
  $('#opts button').focus();
};
start();

/* Study planner */
const pf = $('#plan'), out = $('#planout');
pf.elements.date.min = new Date(Date.now() + 864e5).toISOString().slice(0, 10);
function plan() {
  const h = +pf.elements.hours.value;
  $('#hv').textContent = h;
  if (!pf.elements.date.value) { out.innerHTML = '<p>Choose your exam date to see your plan.</p>'; return; }
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const days = Math.ceil((new Date(pf.elements.date.value) - today) / 864e5);
  if (days < 1) { out.innerHTML = '<p>Pick a date after today.</p>'; return; }
  const total = days * h;
  out.innerHTML = `<p><strong>${days}</strong> days left, about <strong>${total}</strong> study hours.</p>` +
    [['Biology', .5], ['Physics', .25], ['Chemistry', .25]].map(([n, p]) =>
      `<div class="row"><span>${n}</span><span class="bar"><b style="width:${p * 100}%"></b></span><span>${Math.round(total * p)} h</span></div>`).join('') +
    '<small>Split follows the marks: Biology 360, Physics 180, Chemistry 180.</small>';
}
pf.addEventListener('input', plan);
plan();

/* Contact form: connect to your backend or a form service where marked */
$('#contactform').addEventListener('submit', async e => {
  e.preventDefault();
  const f = e.target, sent = $('#sent');
  if (!f.checkValidity()) { f.reportValidity(); return; }
  sent.textContent = 'Sending...';
  try {
    const res = await fetch('https://formspree.io/f/xwlvkpel', {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: new FormData(f)
    });
    if (!res.ok) throw new Error();
    sent.textContent = `Thanks, ${f.elements.fullname.value.trim()}. We have your message and will get back to you soon.`;
    f.reset();
  } catch {
    sent.textContent = 'Could not send your message. Please try again.';
  }
});

/* Animated background that changes with the quiz subject */
(() => {
  const c = $('#bg'), ctx = c.getContext('2d');
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const THEMES = {
    Physics:   { rgb: '37,99,235', mode: 'net' },      // blue: fast dots joined by lines
    Chemistry: { rgb: '217,119,6', mode: 'bubbles' },  // amber: rising bubbles
    Biology:   { rgb: '27,122,75', mode: 'cells' }     // green: drifting cells
  };
  const LINK = 140;
  let theme = THEMES[subject], w, h, items = [], raf, mouse = { x: -999, y: -999 };

  function make() {
    const m = theme.mode, area = w * h;
    const n = m === 'net' ? Math.min(90, Math.round(area / 16000))
            : m === 'bubbles' ? Math.min(45, Math.round(area / 30000))
            : Math.min(24, Math.round(area / 60000));
    items = Array.from({ length: n }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - .5) * (m === 'net' ? .7 : .3),
      vy: m === 'bubbles' ? -(Math.random() * .6 + .2) : (Math.random() - .5) * (m === 'net' ? .7 : .3),
      r: m === 'net' ? Math.random() * 1.8 + 1 : m === 'bubbles' ? Math.random() * 14 + 4 : Math.random() * 30 + 20,
      p: Math.random() * 6.283
    }));
  }

  function size() {
    const r = devicePixelRatio || 1;
    w = innerWidth; h = innerHeight;
    c.width = w * r; c.height = h * r;
    ctx.setTransform(r, 0, 0, r, 0, 0);
    make();
  }

  function step(d, m) {
    d.p += .02;
    if (m === 'net') {
      d.x += d.vx; d.y += d.vy;
      if (d.x < 0 || d.x > w) d.vx *= -1;
      if (d.y < 0 || d.y > h) d.vy *= -1;
      const dx = mouse.x - d.x, dy = mouse.y - d.y, dist = Math.hypot(dx, dy);
      if (dist > 1 && dist < 160) { d.x += dx / dist * .4; d.y += dy / dist * .4; }
    } else if (m === 'bubbles') {
      d.y += d.vy; d.x += Math.sin(d.p) * .4;
      if (d.y < -d.r) { d.y = h + d.r; d.x = Math.random() * w; }
    } else {
      d.x += d.vx + Math.sin(d.p) * .15; d.y += d.vy + Math.cos(d.p) * .15;
      if (d.x < -d.r) d.x = w + d.r; else if (d.x > w + d.r) d.x = -d.r;
      if (d.y < -d.r) d.y = h + d.r; else if (d.y > h + d.r) d.y = -d.r;
    }
  }

  function frame() {
    ctx.clearRect(0, 0, w, h);
    const m = theme.mode, rgb = theme.rgb;
    ctx.lineWidth = 1.5;
    for (const d of items) {
      step(d, m);
      ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, 6.283);
      if (m === 'net') {
        ctx.fillStyle = `rgba(${rgb},.55)`; ctx.fill();
      } else {
        ctx.fillStyle = `rgba(${rgb},${m === 'cells' ? .1 : .08})`;
        ctx.strokeStyle = `rgba(${rgb},.35)`;
        ctx.fill(); ctx.stroke();
        ctx.beginPath();
        if (m === 'cells') {
          ctx.arc(d.x + d.r * .2, d.y - d.r * .1, d.r * .35, 0, 6.283);   // nucleus
          ctx.fillStyle = `rgba(${rgb},.25)`;
        } else {
          ctx.arc(d.x - d.r * .35, d.y - d.r * .35, d.r * .2, 0, 6.283);  // shine
          ctx.fillStyle = 'rgba(255,255,255,.6)';
        }
        ctx.fill();
      }
    }
    if (m === 'net') {
      ctx.lineWidth = 1;
      for (let i = 0; i < items.length; i++) {
        for (let j = i + 1; j < items.length; j++) {
          const a = items[i], b = items[j], dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < LINK) {
            ctx.strokeStyle = `rgba(${rgb},${(1 - dist / LINK) * .25})`;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
    }
    if (!still) raf = requestAnimationFrame(frame);
  }

  function setTheme(name) {
    theme = THEMES[name];
    c.style.transition = 'none'; c.style.opacity = 0;
    make();
    void c.offsetWidth;                       // restart the fade
    c.style.transition = 'opacity .6s'; c.style.opacity = 1;
    if (still) frame();
  }

  document.querySelectorAll('.tabs button').forEach(t =>
    t.addEventListener('click', () => setTheme(t.textContent)));
  addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  document.documentElement.addEventListener('mouseleave', () => { mouse.x = mouse.y = -999; });
  addEventListener('resize', () => { size(); if (still) frame(); });
  document.addEventListener('visibilitychange', () => {
    cancelAnimationFrame(raf);
    if (!document.hidden && !still) frame();
  });
  size(); frame();
})();