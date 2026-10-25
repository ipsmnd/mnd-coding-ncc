"use strict";
/* ============================================================
   ROUTER
   ============================================================ */
const ROUTES = [];
const route = (pattern, fn, opts = {}) => ROUTES.push({ re: new RegExp("^" + pattern.replace(/:(\w+)/g, "(?<$1>[^/]+)") + "/?$"), fn, opts });
let curPath = "/";

/* ---------- multi-page: each top-level section lives in its own HTML file ---------- */
const PAGE_FILES = {
  "": "index.html", about: "about.html", courses: "courses.html", "learning-paths": "learning-paths.html",
  projects: "projects.html", resources: "resources.html", blog: "blog.html", faq: "faq.html",
  contact: "contact.html", privacy: "privacy.html", terms: "terms.html", labs: "labs.html", practice: "practice.html",
  learn: "learn.html", login: "login.html", register: "register.html", dashboard: "dashboard.html", admin: "admin.html"
};
const pageFile = path => PAGE_FILES[path.split("?")[0].split("/")[1] || ""] || "index.html";
const HOME_PATH = document.body.dataset.route || "/";
const CUR_FILE = pageFile(HOME_PATH);
const DEFAULT_ROUTE = Object.fromEntries(Object.entries(PAGE_FILES).map(([k, f]) => [f, "/" + k]));
function goToPage(path, replace = false) {
  const f = pageFile(path);
  const url = f + (path === DEFAULT_ROUTE[f] ? "" : "#" + path);
  replace ? location.replace(url) : location.assign(url);
}
function pathFromHash() {
  const h = decodeURIComponent(location.hash || "");
  if (h.startsWith("#/")) return h.slice(1);
  if (/^#[\w.~-]+$/.test(h)) { const t = h.slice(1); const map = { home: "/", courses: "/courses", networking: "/courses/networking", cloud: "/courses/cloud-computing", "cloud-computing": "/courses/cloud-computing", "ethical-hacking": "/courses/ethical-hacking", main: curPath }; return map[t] || "/" + t; }
  return HOME_PATH;
}
function navigate(path, { replace = false } = {}) {
  if (pageFile(path) !== CUR_FILE) { goToPage(path, replace); return; }
  curPath = path;
  try { const h = "#" + path; if (location.hash !== h) history[replace ? "replaceState" : "pushState"](null, "", h); } catch {}
  render();
}
function render() {
  const path = curPath.split("?")[0];
  closeMenus();
  let match = null, params = {};
  for (const r of ROUTES) { const m = path.match(r.re); if (m) { match = r; params = m.groups || {}; break; } }
  const user = currentUser();
  let page;
  if (!match) page = notFound();
  else if (match.opts.auth && !user) page = authWall(path, "student");
  else if (match.opts.auth === "admin" && user.role !== "admin") page = authWall(path, "admin");
  else { try { page = match.fn(params, user) || notFound(); } catch (e) { console.error(e); page = errorPage(e); } }
  document.title = page.title ? `${page.title} · MND CODE` : "MND CODE — Networking, Cloud & Cybersecurity Academy";
  const md = document.querySelector('meta[name="description"]'); if (md && page.desc) md.setAttribute("content", page.desc);
  if (path === "/") { const seo = store.get("admin:seo", null); if (seo) { if (seo.title) document.title = seo.title; if (md && seo.description) md.setAttribute("content", seo.description); } }
  const main = $("#main");
  main.innerHTML = `<div class="page-enter">${page.html}</div>`;
  renderHeader(); renderAnnounce();
  window.scrollTo({ top: 0, behavior: "instant" });
  setupReveal();
  if (page.init) { try { page.init(main); } catch (e) { console.error(e); } }
  if (page.focus !== false && document.activeElement && document.activeElement !== document.body && !main.contains(document.activeElement)) main.focus({ preventScroll: true });
}
function closeMenus() { $$(".dd.open").forEach(d => d.classList.remove("open")); const m = $("#mnav"); if (m) m.classList.remove("open"); const t = $("#menuToggle"); if (t) t.setAttribute("aria-expanded", "false"); document.body.style.overflow = ""; }

document.addEventListener("click", e => {
  const a = e.target.closest("a[href]");
  if (a) {
    const href = a.getAttribute("href");
    if (href.startsWith("#/")) { e.preventDefault(); navigate(href.slice(1)); return; }
    if (a.id === "skipLink") { e.preventDefault(); $("#main").focus(); return; }
  }
  if (!e.target.closest(".dd")) $$(".dd.open").forEach(d => { d.classList.remove("open"); $("button", d).setAttribute("aria-expanded", "false"); });
});
window.addEventListener("popstate", () => { curPath = pathFromHash(); render(); });
window.addEventListener("hashchange", () => { const p = pathFromHash(); if (p !== curPath) { curPath = p; render(); } });

/* ---------- responsive tables: label cells so they stack on phones ---------- */
function labelTables(root = document) {
  $$(".table-wrap table", root).forEach(t => {
    const ths = $$("thead th", t).map(th => th.textContent.trim());
    if (!ths.length || ths.length < 3) return;
    t.classList.add("table-stack");
    $$("tbody tr", t).forEach(tr => $$("td", tr).forEach((td, i) => { if (!td.hasAttribute("data-label")) td.setAttribute("data-label", ths[i] || ""); }));
  });
}
new MutationObserver(() => { clearTimeout(labelTables._t); labelTables._t = setTimeout(labelTables, 30); }).observe(document.getElementById("main"), { childList: true, subtree: true });

/* ---------- reveal on scroll (content visible at rest; only slides in) ---------- */
let revealObs;
function setupReveal() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
  revealObs && revealObs.disconnect();
  revealObs = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.remove("pre"); revealObs.unobserve(en.target); } }), { rootMargin: "0px 0px -8% 0px" });
  $$(".reveal").forEach(el => { const r = el.getBoundingClientRect(); if (r.top > innerHeight) { el.classList.add("pre"); revealObs.observe(el); } });
}
