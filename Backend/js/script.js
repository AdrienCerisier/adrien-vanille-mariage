/* =========================================================
   ADRIEN & VANILLE — script.js (Enhanced)
   ========================================================= */

/* ⚙️ À PERSONNALISER ICI ------------------------------------ */
const WEDDING = {
  date: "2027-08-07T15:00:00", // Date + heure (format ISO)
  bride: "Vanille",
  groom: "Adrien",
};
/* ----------------------------------------------------------- */

/* ---------- Nav : fond au défilement + animations ---------- */
const nav = document.getElementById('nav');
if (nav) {
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 30);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* ---------- Menu mobile ---------- */
const hamburger = document.getElementById('hamburger');
const navMobile = document.getElementById('nav-mobile');
if (hamburger && navMobile) {
  hamburger.addEventListener('click', () => {
    const open = hamburger.classList.toggle('open');
    navMobile.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', open);
  });
  navMobile.querySelectorAll('.nav__link').forEach(l =>
    l.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navMobile.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    })
  );
}

/* ---------- Compte à rebours avec animations ---------- */
const cd = document.querySelector('.countdown');
if (cd) {
  const target = new Date(WEDDING.date).getTime();
  const num = id => cd.querySelector('[data-cd="' + id + '"] .countdown__num');
  let timer;
  const tick = () => {
    const diff = target - Date.now();
    if (diff <= 0) {
      cd.innerHTML = '<p style="font-family:var(--font-display);font-style:italic;font-size:2rem;color:var(--coral);animation:pulse 1.5s ease-in-out infinite">C\'est le grand jour ! 🍊</p>';
      clearInterval(timer);
      return;
    }
    const d = Math.floor(diff / 864e5);
    const h = Math.floor(diff % 864e5 / 36e5);
    const m = Math.floor(diff % 36e5 / 6e4);
    const s = Math.floor(diff % 6e4 / 1e3);
    const set = (id, v) => {
      const e = num(id); if (!e) return;
      const s = String(v).padStart(2, '0');
      if (e.textContent !== s) { e.textContent = s; e.classList.remove('pop'); void e.offsetWidth; e.classList.add('pop'); }
    };
    set('d', d); set('h', h); set('m', m); set('s', s);
  };
  tick();
  timer = setInterval(tick, 1000);
}

/* ---------- Révélation au défilement (Intersection Observer) ---------- */
const reveals = document.querySelectorAll('.reveal, .section__title, .section__lead, .quicklink, .divider');
if (reveals.length && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        // Ajouter une animation supplémentaire au scroll
        if (e.target.classList.contains('section__title')) {
          e.target.style.animation = 'titleSlideIn .9s ease-out forwards';
        }
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  reveals.forEach(el => io.observe(el));
} else {
  reveals.forEach(el => el.classList.add('in'));
}

/* ---------- Galerie : lightbox ---------- */
const figures = document.querySelectorAll('.gallery-grid__item img');
const lightbox = document.querySelector('.lightbox');
if (figures.length && lightbox) {
  const lbImg = lightbox.querySelector('img');
  const srcs = [...figures].map(i => i.src);
  let idx = 0;
  const show = i => { idx = (i + srcs.length) % srcs.length; lbImg.src = srcs[idx]; };
  const open = i => { show(i); lightbox.classList.add('open'); document.body.style.overflow = 'hidden'; };
  const close = () => { lightbox.classList.remove('open'); document.body.style.overflow = ''; };
  figures.forEach((img, i) => img.addEventListener('click', () => open(i)));
  lightbox.querySelector('.lb-close').addEventListener('click', close);
  lightbox.querySelector('.lb-next').addEventListener('click', e => { e.stopPropagation(); show(idx + 1); });
  lightbox.querySelector('.lb-prev').addEventListener('click', e => { e.stopPropagation(); show(idx - 1); });
  lightbox.addEventListener('click', e => { if (e.target === lightbox) close(); });
  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') show(idx + 1);
    if (e.key === 'ArrowLeft') show(idx - 1);
  });
}

/* ---------- FAQ accordéon avec animations ---------- */
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const answer = btn.nextElementSibling;
    const isOpen = answer.classList.contains('open');
    document.querySelectorAll('.faq-answer.open').forEach(a => a.classList.remove('open'));
    document.querySelectorAll('.faq-question.open').forEach(b => { b.classList.remove('open'); b.setAttribute('aria-expanded', 'false'); });
    if (!isOpen) {
      answer.classList.add('open');
      btn.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }
  });
});

/* ---------- Formulaire RSVP (API Vercel /api/rsvp) ---------- */
const form = document.querySelector('form[name="rsvp"]');

/* Champs de noms dynamiques selon le nombre d'adultes / enfants */
(function () {
  const adultesSel = document.getElementById('adultes');
  const enfantsSel = document.getElementById('enfants');
  const adultesBlock = document.getElementById('adultes-names');
  const enfantsBlock = document.getElementById('enfants-names');
  if (!adultesSel || !enfantsSel || !adultesBlock || !enfantsBlock) return;

  const sync = (block, count) => {
    // Affiche `count` champs, désactive (et vide) les autres pour ne pas les envoyer
    block.querySelectorAll('input').forEach(inp => {
      const idx = parseInt(inp.dataset.idx, 10);
      const show = idx <= count;
      inp.style.display = show ? '' : 'none';
      inp.disabled = !show;
      if (!show) inp.value = '';
    });
    block.hidden = count <= 0;
  };

  const update = () => {
    sync(adultesBlock, parseInt(adultesSel.value, 10) || 0);
    sync(enfantsBlock, parseInt(enfantsSel.value, 10) || 0);
  };

  adultesSel.addEventListener('change', update);
  enfantsSel.addEventListener('change', update);
  update();
})();

if (form) {
  const msg = document.querySelector('.form-msg');
  const success = document.querySelector('.form-success');
  const submitBtn = document.getElementById('submit-btn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (msg) { msg.className = 'form-msg'; msg.textContent = ''; }
    const fd = new FormData(form);
    const data = {};
    fd.forEach((v, k) => { data[k] = v; });

    if (!data.prenom || !data.nom || !data.email || !data.presence) {
      if (msg) { msg.className = 'form-msg err'; msg.textContent = 'Merci de renseigner vos prénom, nom, e-mail et présence.'; }
      return;
    }

    const original = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Envoi en cours…';
    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Request failed');
      form.style.display = 'none';
      if (success) success.classList.add('show');
      success?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch (err) {
      if (msg) { msg.className = 'form-msg err'; msg.textContent = 'Oups, l\'envoi a échoué. Réessayez ou écrivez-nous directement.'; }
      submitBtn.disabled = false;
      submitBtn.textContent = original;
    }
  });
}

/* ---------- Barre de progression + parallaxe des décors ---------- */
(function () {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Barre de progression de défilement (intégrée en bas de la nav)
  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  const navEl = document.querySelector('.nav');
  (navEl || document.body).appendChild(bar);

  // Décors PNG : parallaxe verticale douce au scroll (vitesse par couche via data-speed)
  const decos = [...document.querySelectorAll('.deco-png')];
  let ticking = false;

  const update = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';

    if (!reduced) {
      decos.forEach(el => {
        const speed = parseFloat(el.dataset.speed || '0.06');
        el.style.setProperty('--py', (y * speed).toFixed(1) + 'px');
      });
    }
    ticking = false;
  };

  update();
  window.addEventListener('scroll', () => {
    if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
  }, { passive: true });

  /* Parallaxe à la souris sur le bandeau d'accueil (subtile, desktop only) */
  const hero = document.querySelector('.hero');
  if (hero && !reduced && window.matchMedia('(pointer:fine)').matches) {
    const heroDecos = hero.querySelectorAll('.deco-png');
    hero.addEventListener('mousemove', (e) => {
      const r = hero.getBoundingClientRect();
      const dx = (e.clientX - r.left) / r.width - 0.5;
      const dy = (e.clientY - r.top) / r.height - 0.5;
      heroDecos.forEach((el, i) => {
        const depth = 6 + (i % 3) * 6;
        el.style.setProperty('--mx', (dx * depth).toFixed(1) + 'px');
        el.style.setProperty('--my', (dy * depth).toFixed(1) + 'px');
      });
    }, { passive: true });
    hero.addEventListener('mouseleave', () => {
      heroDecos.forEach(el => { el.style.setProperty('--mx', '0px'); el.style.setProperty('--my', '0px'); });
    });
  }

  // Keyframes utilitaires injectées
  const style = document.createElement('style');
  style.textContent = `@keyframes pulse{0%,100%{opacity:1}50%{opacity:.7}}`;
  document.head.appendChild(style);
})();
