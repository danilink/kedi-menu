// js/cookies.js
const COOKIE_KEY = "cookieConsent"; // "accepted" | "denied"

function createCookieBanner() {
  if (document.getElementById("cookie-banner")) return;

  const banner = document.createElement("div");
  banner.id = "cookie-banner";
  banner.className = "cookie-banner";
  banner.innerHTML = `
    <div class="cookie-banner-inner">
      <div class="cookie-banner-text">
        Usamos cookies. Técnicas para el funcionamiento básico del sitio y para recordar su
        elección sobre las propias cookies. Puede aceptar, rechazar o consultar la
        <a href="cookies.html" target="_blank" rel="noopener">política de cookies</a>.
      </div>
      <div class="cookie-banner-buttons">
        <button type="button" class="cookie-btn cookie-btn-primary" id="cookie-accept">
          <i class="fa-solid fa-check"></i>
          <span>Aceptar</span>
        </button>
        <button type="button" class="cookie-btn cookie-btn-secondary" id="cookie-deny">
          <i class="fa-solid fa-xmark"></i>
          <span>Denegar</span>
        </button>
        <button type="button" class="cookie-btn cookie-btn-ghost" id="cookie-more">
          <i class="fa-solid fa-file-lines"></i>
          <span>Ver documento</span>
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(banner);

  document.getElementById("cookie-accept").addEventListener("click", () => {
    localStorage.setItem(COOKIE_KEY, "accepted");
    hideCookieBanner();
    // aquí podrías inicializar cookies no esenciales (analytics, etc.) si algún día las añades
  });

  document.getElementById("cookie-deny").addEventListener("click", () => {
    localStorage.setItem(COOKIE_KEY, "denied");
    hideCookieBanner();
    // asegúrate de no cargar cookies no esenciales si el usuario las deniega
  });

  document.getElementById("cookie-more").addEventListener("click", () => {
    window.open("cookies.html", "_blank", "noopener");
  });
}

function hideCookieBanner() {
  const banner = document.getElementById("cookie-banner");
  if (banner) banner.remove();
}

document.addEventListener("DOMContentLoaded", () => {
  const choice = localStorage.getItem(COOKIE_KEY);
  if (choice === "accepted" || choice === "denied") {
    // Ya decidió: no mostramos banner
    return;
  }
  createCookieBanner();
});
