// firebase-public.js — horarios, reservas y formulario de contacto
import { db } from './firebase-config.js';
import {
  doc, getDoc, collection, addDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/* ── Constantes ─────────────────────────────────────────────── */
const HORAS   = ['06:00','07:00','08:00','09:00','10:00','11:00',
                 '12:00','13:00','14:00','15:00','16:00','17:00',
                 '18:00','19:00','20:00'];
const DIAS    = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
const DIAS_L  = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
const MESES   = ['enero','febrero','marzo','abril','mayo','junio',
                 'julio','agosto','septiembre','octubre','noviembre','diciembre'];
const MESES_S = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
const SERVICIOS = [
  { id: 'Rumba',       label: 'Rumba & Baile', emo: '🕺' },
  { id: 'Yoga',        label: 'Yoga',           emo: '🧘' },
  { id: 'Pilates',     label: 'Pilates MAT',    emo: '💪' },
  { id: 'Masoterapia', label: 'Masoterapia',    emo: '🤲' },
  { id: 'Stretching',  label: 'Stretching',     emo: '🤸' }
];

/* ── Toast (independiente de Will.js) ───────────────────────── */
function toast(msg, esError = false) {
  const el  = document.getElementById('toast');
  const txt = document.getElementById('toastMsg');
  if (!el || !txt) return;
  txt.textContent = msg;
  el.style.borderLeftColor = esError ? '#e74c3c' : '#F26419';
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), esError ? 4000 : 3000);
}

/* ── Utilidades de fecha ────────────────────────────────────── */
function getWeekDates(offset) {
  const today  = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - today.getDay() + 1 + offset * 7);
  monday.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function dateKey(d, hora) {
  const y   = d.getFullYear();
  const m   = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}_${hora}`;
}

function isPast(d, hora) {
  const slotDate = new Date(d);
  slotDate.setHours(parseInt(hora), 0, 0, 0);
  return slotDate < new Date();
}

function isToday(d) {
  const t = new Date();
  return d.getDate() === t.getDate()
      && d.getMonth() === t.getMonth()
      && d.getFullYear() === t.getFullYear();
}

/* ── WhatsApp URL con encoding correcto ─────────────────────── */
function buildWaUrl(nombre, direccion, d, hora, servicio, modalidad) {
  const fecha = `${DIAS_L[d.getDay()]} ${d.getDate()} de ${MESES[d.getMonth()]}`;
  const msg   = `Hola William! Quiero reservar la clase de ${servicio} el ${fecha} a las ${hora}.\nNombre: ${nombre}\nDirección: ${direccion}\nModalidad: ${modalidad}`;
  return 'https://wa.me/573103660562?text=' + encodeURIComponent(msg);
}

/* ── Estado del popup ───────────────────────────────────────── */
let popupEstado = { d: null, hora: null, modalidad: null, servicio: null, fecha: null };

function cerrarPopupSvc() {
  document.getElementById('svcPopupOverlay').classList.remove('popup-visible');
  popupEstado = { d: null, hora: null, modalidad: null, servicio: null, fecha: null };
}

function volverPaso1Svc() {
  document.getElementById('popupPaso1').classList.remove('hidden');
  document.getElementById('popupPaso2').classList.add('hidden');
  document.getElementById('popupError').classList.add('hidden');
}

function abrirPopupSvc(d, hora, modalidad) {
  const fecha  = `${DIAS_L[d.getDay()]} ${d.getDate()} de ${MESES[d.getMonth()]}`;
  const modTxt = modalidad === 'Online' ? '💻 Online'
               : modalidad === 'Ambas'  ? '📍💻 Presencial y Online'
               : '📍 Presencial';

  document.getElementById('svcPopupInfo').textContent  = `${hora} · ${fecha} · ${modTxt}`;
  document.getElementById('popupNombre').value    = '';
  document.getElementById('popupDireccion').value = '';
  document.getElementById('popupPaso1').classList.remove('hidden');
  document.getElementById('popupPaso2').classList.add('hidden');
  document.getElementById('popupError').classList.add('hidden');

  const btns = document.getElementById('svcBtns');
  btns.innerHTML = '';
  SERVICIOS.forEach(svc => {
    const btn = document.createElement('button');
    btn.className = 'svc-btn';
    btn.type = 'button';
    btn.innerHTML = `<span class="svc-btn-emo">${svc.emo}</span><span>${svc.label}</span>`;
    btn.addEventListener('click', () => {
      popupEstado = {
        d, hora,
        modalidad: modalidad === 'Ambas' ? 'Presencial y Online' : modalidad,
        servicio:  svc.id,
        fecha
      };
      document.getElementById('popupPaso1').classList.add('hidden');
      document.getElementById('popupPaso2').classList.remove('hidden');
    });
    btns.appendChild(btn);
  });

  document.getElementById('svcPopupOverlay').classList.add('popup-visible');
}

/* ── Confirmar reserva ──────────────────────────────────────── */
document.getElementById('popupConfirmar').addEventListener('click', async () => {
  const nombre    = document.getElementById('popupNombre').value.trim();
  const direccion = document.getElementById('popupDireccion').value.trim();
  const errEl     = document.getElementById('popupError');

  if (!nombre || !direccion) { errEl.classList.remove('hidden'); return; }
  errEl.classList.add('hidden');

  const { d, hora, servicio, modalidad, fecha } = popupEstado;

  window.open(buildWaUrl(nombre, direccion, d, hora, servicio, modalidad), '_blank', 'noopener');
  cerrarPopupSvc();

  try {
    await addDoc(collection(db, 'reservas'), {
      servicio, hora, fecha,
      fechaISO:  d.toISOString().split('T')[0],
      modalidad, nombre, direccion,
      slotKey:   dateKey(d, hora),
      estado:    'pendiente',
      creadoEn:  serverTimestamp()
    });
  } catch (e) {
    console.warn('Error guardando reserva:', e);
  }
});

/* ── Botones del popup ──────────────────────────────────────── */
document.getElementById('popupVolver').addEventListener('click', volverPaso1Svc);
document.getElementById('popupCancelar').addEventListener('click', cerrarPopupSvc);
document.getElementById('svcPopupOverlay').addEventListener('click', function (e) {
  if (e.target === this) cerrarPopupSvc();
});

/* ── Calendario público ─────────────────────────────────────── */
let weekOffset = 0;

async function renderPublicCal() {
  const cal = document.getElementById('horCal');
  if (!cal) return;
  cal.innerHTML = '<div class="hor-loading"><div class="hor-spinner"></div><br>Cargando horarios...</div>';

  const days = getWeekDates(weekOffset);
  const [d0, d6] = [days[0], days[6]];
  document.getElementById('horWeekLabel').textContent =
    `${d0.getDate()} ${MESES_S[d0.getMonth()]} - ${d6.getDate()} ${MESES_S[d6.getMonth()]} ${d6.getFullYear()}`;

  const allKeys = days.flatMap(d => HORAS.map(h => dateKey(d, h)));
  const cache   = {};
  await Promise.all(allKeys.map(async key => {
    try {
      const snap = await getDoc(doc(db, 'horarios', key));
      if (snap.exists()) cache[key] = snap.data();
    } catch (_) {}
  }));

  cal.innerHTML = '';
  cal.appendChild(document.createElement('div')); // esquina vacía del grid

  days.forEach(d => {
    const head = document.createElement('div');
    head.className = 'hor-day-head' + (isToday(d) ? ' hor-today' : '');
    head.innerHTML = `<span class="hor-dow">${DIAS[d.getDay()]}</span><div class="hor-dom">${d.getDate()}</div>`;
    cal.appendChild(head);
  });

  HORAS.forEach(hora => {
    if (days.every(d => isPast(d, hora))) return;

    const lbl = document.createElement('div');
    lbl.className  = 'hor-hour-lbl';
    lbl.textContent = hora;
    cal.appendChild(lbl);

    days.forEach(d => {
      const key  = dateKey(d, hora);
      const data = cache[key];
      const past = isPast(d, hora);
      const slot = document.createElement('div');
      slot.className = 'hor-slot'
        + (data && !past ? ' hor-avail' : '')
        + (past ? ' hor-past' : '');

      if (data && !past) {
        const modIcon = data.modalidad === 'Online' ? '💻'
                      : data.modalidad === 'Ambas'  ? '📍💻'
                      : '📍';
        slot.innerHTML = `<span class="hor-slot-icon">✅</span><span class="hor-slot-svc">Disponible</span><span class="hor-slot-mod">${modIcon}</span>`;
        slot.title = `Disponible · ${hora} · ${data.modalidad}`;
        slot.addEventListener('click', () => abrirPopupSvc(d, hora, data.modalidad));
      } else {
        slot.innerHTML = '<span class="hor-slot-icon">·</span>';
      }
      cal.appendChild(slot);
    });
  });
}

document.getElementById('horPrev').addEventListener('click',  () => { weekOffset--; renderPublicCal(); });
document.getElementById('horNext').addEventListener('click',  () => { weekOffset++; renderPublicCal(); });
document.getElementById('horToday').addEventListener('click', () => { weekOffset = 0; renderPublicCal(); });

renderPublicCal();

/* ── Formulario de contacto ─────────────────────────────────── */
const formContacto = document.getElementById('formContacto');
if (formContacto) {
  formContacto.addEventListener('submit', async function (e) {
    e.preventDefault();
    const nombre   = document.getElementById('cNombre').value.trim();
    const email    = document.getElementById('cEmail').value.trim();
    const servicio = document.getElementById('cServicio').value;
    const mensaje  = document.getElementById('cMensaje').value.trim();
    const errEl    = document.getElementById('contactoError');

    if (!nombre || !email || !mensaje) {
      errEl.classList.remove('hidden');
      return;
    }
    errEl.classList.add('hidden');

    const btn = this.querySelector('button[type="submit"]');
    const txt = btn.querySelector('span');
    btn.disabled   = true;
    txt.textContent = 'Enviando...';

    try {
      await addDoc(collection(db, 'mensajes'), {
        nombre, email, servicio, mensaje,
        estado:   'nuevo',
        creadoEn: serverTimestamp()
      });
      toast('¡Mensaje enviado! William te contactará pronto.');
      formContacto.reset();
    } catch (err) {
      console.error('Error al enviar mensaje:', err);
      toast('Error al enviar. Intenta contactarnos por WhatsApp.', true);
    } finally {
      btn.disabled   = false;
      txt.textContent = 'Enviar mensaje';
    }
  });
}
