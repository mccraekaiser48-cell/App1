// OASIS_OS Web — boot the Rust desktop (compiled to WebAssembly) into the page.
//
// The OS owns its canvas: we only load the module, size the canvas to the
// viewport, pump frames, and expose the shell's own API through the toolbar.

import init, { OasisWasm } from "./pkg/oasis_backend_wasm.js";

const $ = (id) => document.getElementById(id);

const canvas = $("oasis");
const viewport = $("viewport");
const bootOverlay = $("boot");
const bootMsg = $("boot-msg");
const errorOverlay = $("error");
const errorMsg = $("error-msg");
const skinSelect = $("skin");
const help = $("help");
const helpBtn = $("help-btn");
const statusText = $("status-text");
const toastEl = $("toast");
const fsBtn = $("fs-btn");

const SKIN_KEY = "oasis.skin";
const skins = new Set(Array.from(skinSelect.options, (option) => option.value));

let oasis = null;
let rafId = 0;
let lastTime = 0;
let toastTimer = 0;

/* ------------------------------------------------------------------ */
/* Canvas fitting                                                      */
/* ------------------------------------------------------------------ */

// Letterbox the skin's native buffer inside the viewport. Whole-number
// scaling where possible keeps the retro skins crisp; fractional scaling is
// rounded down to whole device pixels so the canvas never overflows.
function fitCanvas() {
  const bufferWidth = canvas.width;
  const bufferHeight = canvas.height;
  if (!bufferWidth || !bufferHeight) return;

  const availableWidth = viewport.clientWidth;
  const availableHeight = viewport.clientHeight;
  if (!availableWidth || !availableHeight) return;

  const dpr = window.devicePixelRatio || 1;
  const raw = Math.min(availableWidth / bufferWidth, availableHeight / bufferHeight);
  const scale = raw >= 2 ? Math.floor(raw) : raw;

  canvas.style.width = `${Math.floor(bufferWidth * scale * dpr) / dpr}px`;
  canvas.style.height = `${Math.floor(bufferHeight * scale * dpr) / dpr}px`;
}

function watchViewport() {
  if (typeof ResizeObserver === "function") {
    new ResizeObserver(fitCanvas).observe(viewport);
  }
  window.addEventListener("resize", fitCanvas);
  window.addEventListener("orientationchange", () => setTimeout(fitCanvas, 120));
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(fitCanvas).catch(() => {});
  }
}

/* ------------------------------------------------------------------ */
/* Small UI helpers                                                    */
/* ------------------------------------------------------------------ */

function toast(message) {
  toastEl.textContent = message;
  toastEl.hidden = false;
  requestAnimationFrame(() => toastEl.classList.add("is-visible"));
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toastEl.classList.remove("is-visible");
    window.setTimeout(() => { toastEl.hidden = true; }, 200);
  }, 2600);
}

function setStatus(text) {
  statusText.textContent = text;
}

function setReady() {
  document.body.classList.add("is-ready");
  setStatus("Ready — click the desktop to focus");
  document.querySelectorAll("[data-launch]").forEach((button) => {
    button.disabled = false;
  });
}

function readStoredSkin() {
  try {
    return localStorage.getItem(SKIN_KEY);
  } catch {
    return null;
  }
}

function storeSkin(skin) {
  try {
    localStorage.setItem(SKIN_KEY, skin);
  } catch {
    /* private mode or storage disabled: the skin just won't persist */
  }
}

/* ------------------------------------------------------------------ */
/* Desktop actions                                                     */
/* ------------------------------------------------------------------ */

function focusDesktop() {
  try {
    canvas.focus({ preventScroll: true });
  } catch {
    canvas.focus();
  }
}

// Terminal is a host view rather than an app, and the shell toggles it on F1.
function pressKey(key) {
  focusDesktop();
  window.dispatchEvent(new KeyboardEvent("keydown", {
    key,
    code: key,
    bubbles: true,
    cancelable: true,
  }));
  window.setTimeout(() => {
    window.dispatchEvent(new KeyboardEvent("keyup", { key, code: key, bubbles: true }));
  }, 40);
}

function launch(title) {
  if (!oasis) return;
  focusDesktop();
  try {
    if (title === "Terminal") {
      pressKey("F1");
      setStatus("Terminal toggled");
      return;
    }
    oasis.launch_app(title);
    setStatus(`${title} launched`);
  } catch (error) {
    console.warn(`Could not launch ${title}:`, error);
    toast(`${title} is not available in this build`);
  }
}

/* ------------------------------------------------------------------ */
/* Help panel                                                          */
/* ------------------------------------------------------------------ */

function setHelp(open) {
  help.hidden = !open;
  helpBtn.setAttribute("aria-expanded", String(open));
  if (open) {
    const close = $("help-close");
    if (close) close.focus();
  } else {
    helpBtn.focus();
  }
}

/* ------------------------------------------------------------------ */
/* Fullscreen                                                          */
/* ------------------------------------------------------------------ */

function updateFullscreenLabel() {
  const active = Boolean(document.fullscreenElement);
  fsBtn.title = active ? "Exit full screen" : "Full screen";
  const label = fsBtn.querySelector(".sr-only");
  if (label) label.textContent = active ? "Exit full screen" : "Full screen";
}

async function toggleFullscreen() {
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await document.documentElement.requestFullscreen({ navigationUI: "hide" });
    }
  } catch {
    toast("Full screen is blocked here — try the browser menu");
  }
}

/* ------------------------------------------------------------------ */
/* Boot                                                                */
/* ------------------------------------------------------------------ */

function fail(error) {
  console.error("OASIS_OS boot failed:", error);
  window.cancelAnimationFrame(rafId);
  bootOverlay.hidden = true;
  errorOverlay.hidden = false;
  errorMsg.textContent = error && error.message ? error.message : String(error);
  setStatus("Could not start");
  document.body.classList.remove("is-ready");
}

async function boot() {
  fitCanvas();
  watchViewport();

  const params = new URLSearchParams(window.location.search);
  const stored = readStoredSkin();
  const requestedSkin = params.get("skin") || stored || "xp";
  const skin = skins.has(requestedSkin) ? requestedSkin : "xp";
  skinSelect.value = skin;
  storeSkin(skin);

  bootMsg.textContent = "Starting the window manager…";

  try {
    await init();
    oasis = new OasisWasm("oasis", skin);
    window.__oasis = oasis;
    window.__oasisReady = true;

    fitCanvas();
    bootOverlay.hidden = true;
    setReady();
    updateFullscreenLabel();

    const app = params.get("app");
    if (app) {
      window.setTimeout(() => launch(app), 150);
    }

    focusDesktop();
    lastTime = 0;
    rafId = requestAnimationFrame(tick);

    if (params.get("fullscreen") === "1") {
      toggleFullscreen();
    }
  } catch (error) {
    fail(error);
  }
}

function tick(now) {
  const delta = lastTime ? Math.min((now - lastTime) / 1000, 0.1) : 0;
  lastTime = now;

  try {
    oasis.tick(delta);
  } catch (error) {
    fail(error);
    return;
  }

  rafId = requestAnimationFrame(tick);
}

/* ------------------------------------------------------------------ */
/* Wiring                                                              */
/* ------------------------------------------------------------------ */

document.querySelectorAll("[data-launch]").forEach((button) => {
  button.addEventListener("click", () => launch(button.dataset.launch));
});

skinSelect.addEventListener("change", () => {
  const next = skins.has(skinSelect.value) ? skinSelect.value : "xp";
  storeSkin(next);
  const url = new URL(window.location.href);
  url.searchParams.set("skin", next);
  window.location.href = url.toString();
});

helpBtn.addEventListener("click", () => setHelp(help.hidden));
$("help-close").addEventListener("click", () => setHelp(false));
$("help-done").addEventListener("click", () => setHelp(false));
$("retry").addEventListener("click", () => window.location.reload());
$("reload-btn").addEventListener("click", () => window.location.reload());
fsBtn.addEventListener("click", toggleFullscreen);
document.addEventListener("fullscreenchange", () => {
  updateFullscreenLabel();
  window.setTimeout(fitCanvas, 80);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !help.hidden) {
    event.stopPropagation();
    event.preventDefault();
    setHelp(false);
  }
}, true);

canvas.addEventListener("pointerdown", focusDesktop);
canvas.addEventListener("contextmenu", (event) => event.preventDefault());
viewport.addEventListener("pointerdown", (event) => {
  if (event.target === viewport) focusDesktop();
});

document.addEventListener("visibilitychange", () => {
  lastTime = 0;
});

boot();
