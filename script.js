const $ = s => document.querySelector(s);

/* Mobile menu */
const nav = $('#nav'), menu = $('#menu');
menu.onclick = () => menu.setAttribute('aria-expanded', nav.classList.toggle('open'));
nav.addEventListener('click', e => {
  if (e.target.tagName === 'A') { nav.classList.remove('open'); menu.setAttribute('aria-expanded', false); }
});

/* Practice questions (edit or add your own) */
const Q = {
  Physics: [
    { q: 'A body of mass 2 kg moves at 3 m/s. What is its kinetic energy?', o: ['3 J', '6 J', '9 J', '18 J'], a: 2, e: 'KE = ½mv² = ½ × 2 × 3² = 9 J.' },
    { q: 'What is the SI unit of magnetic flux?', o: ['Tesla', 'Weber', 'Henry', 'Gauss'], a: 1, e: 'Flux = B × A, measured in weber (Wb). Tesla is the unit of magnetic field strength.' }
  ],
  Chemistry: [
    { q: 'What is the hybridisation of each carbon atom in ethene (C₂H₄)?', o: ['sp', 'sp²', 'sp³', 'sp³d'], a: 1, e: 'Each carbon forms three sigma bonds and one pi bond, so it is sp² hybridised.' },
    { q: 'Which of these elements has the highest electronegativity?', o: ['Chlorine', 'Fluorine', 'Oxygen', 'Nitrogen'], a: 1, e: 'Fluorine is the most electronegative element, at 3.98 on the Pauling scale.' }
  ],
  Biology: [
    { q: 'Which enzyme joins Okazaki fragments during DNA replication?', o: ['DNA polymerase III', 'DNA ligase', 'Helicase', 'Primase'], a: 1, e: 'DNA ligase seals the nicks between Okazaki fragments on the lagging strand.' },
    { q: 'Which part of the human brain controls balance and posture?', o: ['Cerebrum', 'Cerebellum', 'Medulla oblongata', 'Hypothalamus'], a: 1, e: 'The cerebellum coordinates balance, posture and smooth movement.' }
  ]
};
let subject = 'Physics', idx = 0, answered = false;
const tabs = [...document.querySelectorAll('.tabs button')];

function render() {
  const d = Q[subject][idx];
  answered = false;
  $('#qno').textContent = `${subject}, question ${idx + 1} of ${Q[subject].length}`;
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
  const d = Q[subject][idx], all = [...document.querySelectorAll('.opt')];
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
  subject = t.textContent; idx = 0;
  tabs.forEach(x => x.setAttribute('aria-pressed', x === t));
  render();
});
$('#next').onclick = () => { idx = (idx + 1) % Q[subject].length; render(); $('#opts button').focus(); };
render();

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