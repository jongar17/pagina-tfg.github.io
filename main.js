/* ============================================================
   BETA. — main.js
   Funcionalidades JavaScript del medio digital
   
   ÍNDICE:
   1. Modo oscuro (toggle + persistencia en localStorage)
   2. Barra de progreso de lectura (solo en artículos)
   3. Animaciones al hacer scroll (Intersection Observer)
   4. Menú móvil (hamburguesa)
   5. Tiempo de lectura estimado
   6. Efecto "sticky" inteligente en la cabecera
   7. Fecha dinámica en la barra superior
============================================================ */


/* ============================================================
   1. MODO OSCURO
   Toggle entre tema claro y oscuro con persistencia
============================================================ */

function iniciarModoOscuro() {
  // Crear el botón de toggle y añadirlo a la barra superior
  const barraSuperior = document.querySelector('.barra-superior');
  if (!barraSuperior) return;

  const boton = document.createElement('button');
  boton.id = 'toggle-modo';
  boton.setAttribute('aria-label', 'Cambiar entre modo claro y oscuro');
  boton.innerHTML = '◐';
  boton.style.cssText = `
    background: none;
    border: 1px solid rgba(255,255,255,0.2);
    color: inherit;
    font-size: 0.85rem;
    cursor: pointer;
    padding: 0.15rem 0.5rem;
    border-radius: 2px;
    transition: border-color 0.2s;
    font-family: inherit;
    line-height: 1;
  `;

  barraSuperior.appendChild(boton);

  // Aplicar tema guardado al cargar
  const temaGuardado = localStorage.getItem('beta-tema');
  if (temaGuardado === 'oscuro') {
    document.documentElement.setAttribute('data-tema', 'oscuro');
    boton.innerHTML = '○';
  }

  boton.addEventListener('click', () => {
    const esOscuro = document.documentElement.getAttribute('data-tema') === 'oscuro';
    if (esOscuro) {
      document.documentElement.removeAttribute('data-tema');
      localStorage.setItem('beta-tema', 'claro');
      boton.innerHTML = '◐';
    } else {
      document.documentElement.setAttribute('data-tema', 'oscuro');
      localStorage.setItem('beta-tema', 'oscuro');
      boton.innerHTML = '○';
    }
  });
}


/* ============================================================
   2. BARRA DE PROGRESO DE LECTURA
   Solo aparece en páginas de artículo/reportaje
============================================================ */

function iniciarProgressBar() {
  const articulo = document.querySelector('.cuerpo-articulo, .contenedor-reportaje');
  if (!articulo) return;

  // Crear la barra
  const barra = document.createElement('div');
  barra.id = 'progress-bar';
  barra.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 0%;
    height: 3px;
    background-color: var(--acento);
    z-index: 9999;
    transition: width 0.1s linear;
    pointer-events: none;
  `;
  document.body.appendChild(barra);

  // Actualizar en cada scroll
  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progreso = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    barra.style.width = Math.min(progreso, 100) + '%';
  }, { passive: true });
}


/* ============================================================
   3. ANIMACIONES AL HACER SCROLL
   Detecta elementos con clase .animar y los revela al entrar en pantalla
============================================================ */

function iniciarAnimacionesScroll() {
  // Elementos que ya deben estar visibles al cargar (above the fold)
  const elementosInmediatos = document.querySelectorAll('.animar-1, .animar-2');
  elementosInmediatos.forEach(el => el.style.animationPlayState = 'running');

  // El resto se activan al hacer scroll
  const elementos = document.querySelectorAll('.animar:not(.animar-1):not(.animar-2)');

  if (!elementos.length) return;

  // Resetear para que no se vean hasta que el observer los active
  elementos.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(16px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target); // Solo una vez
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  elementos.forEach(el => observer.observe(el));
}


/* ============================================================
   4. MENÚ MÓVIL
   Botón hamburguesa para pantallas pequeñas.
============================================================ */

function iniciarMenuMovil() {
  const nav = document.querySelector('.nav-principal');
  const ul = nav ? nav.querySelector('ul') : null;
  if (!nav || !ul) return;

  // Inyectar estilos del menú en <head>
  const estilos = document.createElement('style');
  estilos.textContent = `
    #menu-movil {
      display: none;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.9rem 1.2rem;
      flex-direction: column;
      gap: 5px;
      margin-left: auto;
      flex-shrink: 0;
    }
    #menu-movil span {
      display: block;
      width: 22px;
      height: 2px;
      background-color: var(--gris-claro, #ccc);
      transition: transform 0.25s ease, opacity 0.25s ease;
      pointer-events: none;
    }
    @media (max-width: 700px) {
      #menu-movil { display: flex; }
      .nav-principal ul { display: none; flex-direction: column; padding: 0; }
      .nav-principal ul.nav-abierta { display: flex; }
      .nav-principal li a {
        padding: 0.75rem 1rem;
        border-bottom: 1px solid rgba(255,255,255,0.07);
      }
    }
  `;
  document.head.appendChild(estilos);

  // Crear botón
  const btn = document.createElement('button');
  btn.id = 'menu-movil';
  btn.setAttribute('aria-label', 'Abrir menú');
  btn.setAttribute('aria-expanded', 'false');
  btn.innerHTML = '<span></span><span></span><span></span>';
  nav.insertBefore(btn, ul);

  const spans = btn.querySelectorAll('span');

  function abrir() {
    ul.classList.add('nav-abierta');
    btn.setAttribute('aria-expanded', 'true');
    btn.setAttribute('aria-label', 'Cerrar menú');
    spans[0].style.transform = 'translateY(7px) rotate(45deg)';
    spans[1].style.opacity = '0';
    spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
  }

  function cerrar() {
    ul.classList.remove('nav-abierta');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Abrir menú');
    spans[0].style.transform = '';
    spans[1].style.opacity = '';
    spans[2].style.transform = '';
  }

  function estaAbierto() {
    return ul.classList.contains('nav-abierta');
  }

  // Clic en el botón: toggle
  btn.addEventListener('click', (e) => {
    e.stopPropagation(); // evitar que llegue al document
    estaAbierto() ? cerrar() : abrir();
  });

  // Clic en un enlace del menú: cerrar
  ul.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => cerrar());
  });

  // Clic fuera del nav: cerrar
  document.addEventListener('click', (e) => {
    if (estaAbierto() && !nav.contains(e.target)) {
      cerrar();
    }
  });

  // Resize a pantalla grande: cerrar y limpiar
  window.matchMedia('(max-width: 700px)').addEventListener('change', (e) => {
    if (!e.matches) cerrar();
  });
}


/* ============================================================
   5. TIEMPO DE LECTURA ESTIMADO
   Calcula y muestra el tiempo estimado de lectura en artículos
============================================================ */

function calcularTiempoLectura() {
  const cuerpo = document.querySelector('.cuerpo-articulo');
  const meta = document.querySelector('.meta-articulo');
  if (!cuerpo || !meta) return;

  const palabras = cuerpo.innerText.trim().split(/\s+/).length;
  const minutos = Math.max(1, Math.round(palabras / 200)); // ~200 palabras/min

  const span = document.createElement('span');
  span.textContent = `${minutos} min de lectura`;
  meta.appendChild(span);
}


/* ============================================================
   6. CABECERA STICKY INTELIGENTE
   La cabecera se oculta al bajar y reaparece al subir
============================================================ */

function iniciarCabeceraSticky() {
  const cabecera = document.querySelector('.cabecera-principal');
  if (!cabecera) return;

  let ultimoScroll = 0;
  let visible = true;

  cabecera.style.cssText += `
    position: sticky;
    top: 0;
    z-index: 100;
    background-color: var(--fondo);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  `;

  window.addEventListener('scroll', () => {
    const scrollActual = window.scrollY;

    // Solo activar después de haber bajado un poco
    if (scrollActual < 80) {
      cabecera.style.transform = 'translateY(0)';
      cabecera.style.boxShadow = 'none';
      visible = true;
      ultimoScroll = scrollActual;
      return;
    }

    if (scrollActual > ultimoScroll && visible) {
      // Bajando: ocultar
      cabecera.style.transform = 'translateY(-100%)';
      visible = false;
    } else if (scrollActual < ultimoScroll && !visible) {
      // Subiendo: mostrar con sombra
      cabecera.style.transform = 'translateY(0)';
      cabecera.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)';
      visible = true;
    }

    ultimoScroll = scrollActual;
  }, { passive: true });
}


/* ============================================================
   7. FECHA DINÁMICA EN LA BARRA SUPERIOR
   Actualiza la fecha al día real en que se carga la página
============================================================ */

function actualizarFecha() {
  const fechaEl = document.querySelector('.barra-superior .fecha');
  if (!fechaEl) return;

  const ahora = new Date();
  const opciones = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };

  // Capitalizar primera letra
  const fechaFormateada = ahora.toLocaleDateString('es-ES', opciones);
  fechaEl.textContent = fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1);
}


/* ============================================================
   INICIALIZACIÓN — Arrancar todo cuando el DOM esté listo
============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  actualizarFecha();
  iniciarModoOscuro();
  iniciarProgressBar();
  iniciarAnimacionesScroll();
  iniciarMenuMovil();
  calcularTiempoLectura();
  iniciarCabeceraSticky();
});