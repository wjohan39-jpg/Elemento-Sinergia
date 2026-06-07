# Elemento Sinergia

Sitio web oficial de **William Velásquez**, instructor de bienestar físico con más de 15 años de experiencia en Medellín, Colombia. Ofrece clases de Rumba, Yoga, Pilates MAT, Masoterapia y Stretching.

🌐 **Sitio en producción:** [cerulean-blini-775496.netlify.app](https://cerulean-blini-775496.netlify.app)

---

## Tecnologías

- **HTML5 / CSS3 / JavaScript** — sin frameworks, código puro
- **Firebase Firestore** — base de datos para reservas y agenda de clases
- **PWA** — instalable como app (Service Worker + Web App Manifest)
- **Netlify** — despliegue continuo desde GitHub

---

## Estructura del proyecto

```
ElementoSinergia/
├── Proyecto/                   # Archivos del sitio
│   ├── index.html              # Página principal
│   ├── blog-rumba.html         # Blog: Rumba & Baile
│   ├── blog-yoga.html          # Blog: Yoga
│   ├── blog-pilates.html       # Blog: Pilates MAT
│   ├── blog-masoterapia.html   # Blog: Masoterapia
│   ├── blog-stretching.html    # Blog: Stretching
│   ├── Admin.html              # Panel de administración
│   ├── Willstyle.css           # Estilos globales (minificado)
│   ├── Will.js                 # Lógica principal (minificado)
│   ├── firebase-config.js      # Configuración Firebase
│   ├── firebase-public.js      # Firebase para el público
│   ├── sw.js                   # Service Worker (PWA)
│   ├── manifest.json           # Manifest PWA
│   └── Multimedia/             # Imágenes en formato WebP
├── netlify.toml                # Configuración de despliegue
└── README.md
```

---

## Funcionalidades

- Presentación de los 5 servicios con tarjetas animadas
- Blogs individuales por disciplina
- Sistema de reserva de clases con Firebase
- Modo oscuro
- Galería de imágenes
- Sección de testimonios
- Instalable como PWA en móvil y escritorio

---

## Rendimiento (Lighthouse)

| Métrica | Desktop | Mobile |
|---|---|---|
| Performance | 86 | 41 |
| Accessibility | 91 | 91 |
| Best Practices | 100 | 100 |
| SEO | 100 | 100 |

---

## Cómo correr localmente

1. Clona el repositorio
2. Abre la carpeta `Proyecto/` con un servidor local (ej. VS Code Live Server)
3. Accede a `http://127.0.0.1:5500/Proyecto/index.html`

> Firebase ya está configurado — las funciones de reservas funcionan sin configuración adicional.

---

## Despliegue

El sitio se despliega automáticamente en Netlify al hacer push a la rama `main`. La configuración en `netlify.toml` especifica `Proyecto/` como directorio de publicación.

```bash
git push origin main   # dispara el deploy automático
```

---

## Autor

**Wesly Johan** — desarrollador  
**William Velásquez** — instructor y propietario del negocio
