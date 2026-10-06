const nav = document.getElementById('nav'), menu = document.getElementById('menu');
menu.onclick = () => menu.setAttribute('aria-expanded', nav.classList.toggle('open'));
nav.addEventListener('click', e => {
  if (e.target.tagName === 'A') { nav.classList.remove('open'); menu.setAttribute('aria-expanded', false); }
});
document.getElementById('yr').textContent = new Date().getFullYear();