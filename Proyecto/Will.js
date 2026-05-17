/* ============================================================
   Will.js  —  WillFlow | William Velasquez
   ============================================================ */

/* ─── 1. NAVBAR ─────────────────────────────────────────────── */
var navbar    = document.getElementById('navbar');
var hamburger = document.getElementById('hamburger');
var navLinks  = document.getElementById('navLinks');

window.addEventListener('scroll', function () {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

hamburger.addEventListener('click', function () {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
});

navLinks.querySelectorAll('a').forEach(function (link) {
  link.addEventListener('click', function () {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
  });
});

/* ─── 2. SCROLL REVEAL ─────────────────────────────────────── */
function initReveal() {
  var targets = document.querySelectorAll(
    '.svc-card, .testi-card, .horario-item, ' +
    '.sobre-text, .sobre-visual, .section-head'
  );
  targets.forEach(function (el, i) {
    el.classList.add('reveal');
    el.style.transitionDelay = (i % 4) * 0.1 + 's';
  });
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal, .reveal-left, .reveal-right')
    .forEach(function (el) { observer.observe(el); });
}

/* ─── 3. UTILIDADES ─────────────────────────────────────────── */
function mostrarToast(msg, esError) {
  var toast = document.getElementById('toast');
  var txt   = document.getElementById('toastMsg');
  txt.textContent = msg;
  toast.style.borderLeftColor = esError ? '#e74c3c' : '#F26419';
  toast.classList.add('show');
  setTimeout(function () { toast.classList.remove('show'); }, esError ? 4000 : 5000);
}

/* ─── 4. NAV ACTIVO ─────────────────────────────────────────── */
var sections = document.querySelectorAll('section[id]');
var navItems = document.querySelectorAll('.nav-links a');
window.addEventListener('scroll', function () {
  var scrollY = window.scrollY + 100;
  sections.forEach(function (sec) {
    if (scrollY >= sec.offsetTop && scrollY < sec.offsetTop + sec.offsetHeight) {
      navItems.forEach(function (a) {
        a.style.color = (a.getAttribute('href') === '#' + sec.id) ? 'var(--orange)' : '';
      });
    }
  });
});

/* ─── INIT ──────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function () { initReveal(); });

/* ═══════════════════════════════════════════════════════════════
   5. GALERIA — CARRUSEL
═══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function () {
  var track    = document.getElementById('galeriaTrack');
  var outer    = document.getElementById('galeriaOuter');
  var btnPrev  = document.getElementById('galPrev');
  var btnNext  = document.getElementById('galNext');
  var dotsWrap = document.getElementById('galDots');
  var elCur    = document.getElementById('galCurrent');
  var elTot    = document.getElementById('galTotal');
  if (!track) return;
  var items = track.querySelectorAll('.gal-item');
  var total = items.length;
  var idx = 0, timer = null;

  function perView() { var w = window.innerWidth; return w <= 600 ? 1 : w <= 900 ? 2 : 3; }
  function paso() { return total < 2 ? (items[0] ? items[0].offsetWidth : 0) : items[1].offsetLeft - items[0].offsetLeft; }
  function maxIdx() { return Math.max(0, total - perView()); }

  function goTo(n) {
    idx = Math.max(0, Math.min(n, maxIdx()));
    track.style.transform = 'translateX(-' + (idx * paso()) + 'px)';
    var max = maxIdx();
    btnPrev.disabled = (idx === 0);
    btnNext.disabled = (idx >= max);
    if (elCur) elCur.textContent = idx + 1;
    if (elTot) elTot.textContent = max + 1;
    dotsWrap.querySelectorAll('.gal-dot').forEach(function (d, i) {
      d.classList.toggle('active', i === idx);
    });
  }

  function buildDots() {
    dotsWrap.innerHTML = '';
    for (var i = 0; i < maxIdx() + 1; i++) {
      (function (ii) {
        var d = document.createElement('button');
        d.className = 'gal-dot' + (ii === 0 ? ' active' : '');
        d.setAttribute('aria-label', 'Slide ' + (ii + 1));
        d.addEventListener('click', function () { clearInterval(timer); goTo(ii); iniciarAuto(); });
        dotsWrap.appendChild(d);
      }(i));
    }
  }

  function iniciarAuto() {
    clearInterval(timer);
    timer = setInterval(function () { goTo(idx >= maxIdx() ? 0 : idx + 1); }, 4500);
  }

  btnPrev.addEventListener('click', function () { clearInterval(timer); goTo(idx - 1); iniciarAuto(); });
  btnNext.addEventListener('click', function () { clearInterval(timer); goTo(idx + 1); iniciarAuto(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft')  { clearInterval(timer); goTo(idx - 1); iniciarAuto(); }
    if (e.key === 'ArrowRight') { clearInterval(timer); goTo(idx + 1); iniciarAuto(); }
  });

  var drag = false, sx = 0, dx = 0;
  function dStart(x) { drag = true; sx = x; dx = 0; track.style.transition = 'none'; clearInterval(timer); }
  function dMove(x)  { if (!drag) return; dx = x - sx; track.style.transform = 'translateX(-' + (idx * paso() - dx) + 'px)'; }
  function dEnd() {
    if (!drag) return; drag = false; track.style.transition = '';
    var u = paso() * 0.25;
    if (dx < -u) goTo(idx + 1); else if (dx > u) goTo(idx - 1); else goTo(idx);
    iniciarAuto();
  }
  outer.addEventListener('mousedown',  function (e) { dStart(e.clientX); });
  window.addEventListener('mousemove', function (e) { dMove(e.clientX); });
  window.addEventListener('mouseup',   dEnd);
  outer.addEventListener('touchstart', function (e) { dStart(e.touches[0].clientX); }, { passive: true });
  outer.addEventListener('touchmove',  function (e) { dMove(e.touches[0].clientX); },  { passive: true });
  outer.addEventListener('touchend',   dEnd);

  var rTimer;
  window.addEventListener('resize', function () {
    clearTimeout(rTimer);
    rTimer = setTimeout(function () {
      if (idx > maxIdx()) idx = maxIdx();
      buildDots();
      track.style.transition = 'none';
      track.style.transform = 'translateX(-' + (idx * paso()) + 'px)';
      setTimeout(function () { track.style.transition = ''; }, 50);
      goTo(idx);
    }, 150);
  });

  buildDots(); goTo(0); iniciarAuto();
});

/* ─── 6. VIDEO ──────────────────────────────────────────────── */
function reproducirVideo(btn) {
  var video = btn.parentElement.querySelector('video');
  if (!video) return;
  video.controls = true; video.play(); btn.style.display = 'none';
}

/* ═══════════════════════════════════════════════════════════════
   7. MODO OSCURO
═══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function () {
  var btn  = document.getElementById('darkToggle');
  var html = document.documentElement;
  if (!btn) return;
  function prefereDark() {
    var g = localStorage.getItem('willflow-theme');
    return g ? g === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  function aplicarTema(dark) {
    if (dark) {
      html.setAttribute('data-theme', 'dark');
      btn.querySelector('.toggle-icon').textContent = '☀️';
      btn.querySelector('.toggle-txt').textContent  = 'Claro';
    } else {
      html.removeAttribute('data-theme');
      btn.querySelector('.toggle-icon').textContent = '🌙';
      btn.querySelector('.toggle-txt').textContent  = 'Oscuro';
    }
  }
  btn.addEventListener('click', function () {
    var esDark = html.getAttribute('data-theme') === 'dark';
    localStorage.setItem('willflow-theme', esDark ? 'light' : 'dark');
    aplicarTema(!esDark);
  });
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
    if (!localStorage.getItem('willflow-theme')) aplicarTema(e.matches);
  });
  aplicarTema(prefereDark());
});

/* ═══════════════════════════════════════════════════════════════
   8. PRELOADER
═══════════════════════════════════════════════════════════════ */
(function () {
  var preloader = document.getElementById('preloader');
  if (!preloader) return;

  document.body.classList.add('loading');

  function ocultarPreloader() {
    preloader.classList.add('pre-oculto');
    document.body.classList.remove('loading');
  }

  window.addEventListener('load', function () {
    setTimeout(ocultarPreloader, 2000);
  });

  setTimeout(ocultarPreloader, 4000);
}());

/* ═══════════════════════════════════════════════════════════════
   9. CARRUSEL SERVICIOS — 5 cards, 3 visibles
═══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function () {
  var track = document.getElementById('servicesTrack');
  if (!track) return;

  var cards = track.querySelectorAll('.svc-card');
  var total = cards.length;
  var idx   = 0;
  var PER_VIEW = 3;

  function calcPaso() {
    if (total < 2) return cards[0].offsetWidth;
    return cards[1].offsetLeft - cards[0].offsetLeft;
  }

  function maxIdx() {
    var w = window.innerWidth;
    var pv = w <= 600 ? 1 : w <= 900 ? 2 : PER_VIEW;
    return Math.max(0, total - pv);
  }

  function goTo(n) {
    idx = Math.max(0, Math.min(n, maxIdx()));
    track.style.transition = 'transform .45s cubic-bezier(.4,0,.2,1)';
    track.style.transform  = 'translateX(-' + (idx * calcPaso()) + 'px)';
  }

  var drag = false, sx = 0, dx = 0;
  track.addEventListener('mousedown',  function (e) { drag = true; sx = e.clientX; dx = 0; track.style.transition = 'none'; });
  window.addEventListener('mousemove', function (e) { if (!drag) return; dx = e.clientX - sx; track.style.transform = 'translateX(-' + (idx * calcPaso() - dx) + 'px)'; });
  window.addEventListener('mouseup',   function () {
    if (!drag) return; drag = false;
    if (dx < -60) goTo(idx + 1); else if (dx > 60) goTo(idx - 1); else goTo(idx);
  });
  track.addEventListener('touchstart', function (e) { drag = true; sx = e.touches[0].clientX; dx = 0; track.style.transition = 'none'; }, { passive: true });
  track.addEventListener('touchmove',  function (e) { if (!drag) return; dx = e.touches[0].clientX - sx; track.style.transform = 'translateX(-' + (idx * calcPaso() - dx) + 'px)'; }, { passive: true });
  track.addEventListener('touchend',   function () {
    if (!drag) return; drag = false;
    if (dx < -60) goTo(idx + 1); else if (dx > 60) goTo(idx - 1); else goTo(idx);
  });

  window.addEventListener('resize', function () {
    setTimeout(function () {
      if (idx > maxIdx()) idx = maxIdx();
      track.style.transition = 'none';
      track.style.transform  = 'translateX(-' + (idx * calcPaso()) + 'px)';
    }, 150);
  });

  setTimeout(function () { goTo(0); }, 50);
});