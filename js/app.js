// Columnas esperadas en el CSV
const COL_DIA          = "Día";
const COL_PLATO        = "Plato del día";
const COL_PRIMEROS     = "Primeros (lista)";
const COL_SEGUNDOS     = "Segundos (lista)";
const COL_POSTRES      = "Postres caseros (lista)";
const COL_PRECIO_PLATO = "Precio plato del día (€)";
const COL_PRECIO_MENU  = "Precio menú (€)";
const COL_TELEFONO     = "Teléfono / reservas";

let MENUS = [];
let PRECIO_PLATO = 0;
let PRECIO_MENU  = 0;
let TELEFONO     = "";
let currentIndex = 0; // 0 = lunes, 4 = viernes, null = fin de semana
const dayNames   = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

function textoALista(texto) {
  if (!texto) return [];
  const s = String(texto);
  let partes = [];
  if (s.includes("\n")) {
    partes = s.split(/\r?\n/);
  } else if (s.includes(";")) {
    partes = s.split(";");
  } else {
    partes = [s];
  }
  return partes.map(p => p.trim()).filter(Boolean);
}

function marcarTabActivo(index) {
  const tabs = document.querySelectorAll(".day-tab");
  tabs.forEach(t => t.classList.remove("active"));
  if (index !== null && MENUS[index]) {
    const activeTab = document.querySelector(`.day-tab[data-index="${index}"]`);
    if (activeTab) activeTab.classList.add("active");
  }
}

function renderMenu(index) {
  const container = document.getElementById("menu-container");
  const indicator = document.getElementById("page-indicator");

  if (!MENUS.length) {
    container.innerHTML = '<div class="menu-card"><div class="error">No se han podido cargar datos del menú.</div></div>';
    indicator.textContent = "";
    return;
  }

  if (index === null || MENUS[index] === undefined) {
    // Vista de fin de semana
    container.innerHTML = `
      <div class="menu-card">
        <div class="menu-header">
          <div class="menu-tag">Fin de semana</div>
        </div>
        <div class="divider"></div>
        <div class="weekend-message">
          <p>Hoy no hay menú del día.</p>
          <p>Puedes consultarnos disponibilidad especial en el teléfono <strong>${TELEFONO}</strong>.</p>
        </div>
        <div class="menu-notice">
          <p>NO ENTRAN DOS SEGUNDOS COMO MENÚ</p>
          <p>LOS PEDIDOS TIENEN QUE ESPERAR SU TURNO</p>
          <p>EL MENÚ ESTÁ PREPARADO A PARTIR DE LAS 12.30h</p>
        </div>
      </div>
    `;
    indicator.textContent = "Hoy: fin de semana · sin menú";
    currentIndex = null;
    marcarTabActivo(null);
    return;
  }

  const menu = MENUS[index];
  const primeros = (menu.primeros || []).map(p => `<li>${p}</li>`).join("");
  const segundos = (menu.segundos || []).map(p => `<li>${p}</li>`).join("");
  const postres  = (menu.postres  || []).map(p => `<li>${p}</li>`).join("");

  container.innerHTML = `
    <div class="menu-card">
      <header class="menu-header">
        <div class="menu-tag">Menú del día</div>
        <div class="day-pill">${menu.dia}</div>
      </header>
      <div class="divider"></div>
      <div class="dish-of-day">
        <h2>Plato del día</h2>
        <p class="dish-name">${menu.plato_dia}</p>
      </div>
      <div class="sections-grid">
        <section class="section">
          <h3>Primeros</h3>
          <ul>${primeros}</ul>
        </section>
        <section class="section">
          <h3>Segundos</h3>
          <ul>${segundos}</ul>
        </section>
        <section class="section">
          <h3>Postres caseros</h3>
          <ul>${postres}</ul>
        </section>
      </div>
      <div class="menu-notice">
        <p>NO ENTRAN DOS SEGUNDOS COMO MENÚ</p>
        <p>LOS PEDIDOS TIENEN QUE ESPERAR SU TURNO</p>
        <p>EL MENÚ ESTÁ PREPARADO A PARTIR DE LAS 12.30h</p>
      </div>
      <footer class="menu-footer">
        <div class="prices">
          <span class="price-tag">Plato del día: ${PRECIO_PLATO.toFixed(2)} €</span>
          <span class="dot">·</span>
          <span class="price-tag">Menú completo: ${PRECIO_MENU.toFixed(2)} €</span>
        </div>
        <div class="contact">
          Reservas: <strong>${TELEFONO}</strong><br>
          Avenida del Plantío 6, Coslada
        </div>
      </footer>
    </div>
  `;

  indicator.textContent = "Hoy: " + (dayNames[index] || "");
  currentIndex = index;
  marcarTabActivo(index);
}

function initByToday() {
  const today = new Date();
  const jsDay = today.getDay(); // 0=domingo, 1=lunes, ..., 6=sábado
  if (jsDay >= 1 && jsDay <= 5) {
    renderMenu(jsDay - 1);
  } else {
    renderMenu(null);
  }
}

function buildFromRows(rows) {
  const valid = rows.filter(r => r[COL_DIA]);
  if (!valid.length) {
    const container = document.getElementById("menu-container");
    container.innerHTML = '<div class="menu-card"><div class="error">No se han encontrado filas válidas en el CSV.</div></div>';
    return;
  }

  MENUS = valid.map(r => ({
    dia:       r[COL_DIA],
    plato_dia: r[COL_PLATO] || "",
    primeros:  textoALista(r[COL_PRIMEROS] || ""),
    segundos:  textoALista(r[COL_SEGUNDOS] || ""),
    postres:   textoALista(r[COL_POSTRES] || "")
  }));

  const first = valid[0];
  const precioPlatoStr = String(first[COL_PRECIO_PLATO] || "0").replace(",", ".");
  const precioMenuStr  = String(first[COL_PRECIO_MENU]  || "0").replace(",", ".");
  PRECIO_PLATO = parseFloat(precioPlatoStr) || 0;
  PRECIO_MENU  = parseFloat(precioMenuStr)  || 0;
  TELEFONO     = first[COL_TELEFONO] || "";

  initByToday();
}

function loadCSV() {
  const container = document.getElementById("menu-container");
  if (!CSV_URL || CSV_URL === "PEGAR_AQUI_URL_CSV_DE_GOOGLE_SHEETS") {
    container.innerHTML = '<div class="menu-card"><div class="error">Configura primero la URL del CSV de Google Sheets en js/config.js.</div></div>';
    return;
  }

  Papa.parse(CSV_URL, {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: function(results) {
      buildFromRows(results.data || []);
    },
    error: function(err) {
      console.error(err);
      container.innerHTML = '<div class="menu-card"><div class="error">Error al cargar el CSV de Google Sheets.</div></div>';
    }
  });
}

// Arrancamos cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", loadCSV);
