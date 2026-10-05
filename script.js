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