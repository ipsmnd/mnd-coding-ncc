"use strict";
/* ============================================================
   BOOT
   ============================================================ */
/* Inside the Android app (Capacitor WebView) PDF downloads are unsupported, so download links are hidden via CSS */
if (window.Capacitor) document.documentElement.classList.add("in-app");
(async function boot() {
  curPath = pathFromHash();
  if (pageFile(curPath) !== CUR_FILE) { goToPage(curPath, true); return; }
  renderFooter();
  render();
  await seedUsers();
  renderHeader();
  const seo = store.get("admin:seo", null);
  if (seo && curPath === "/") { if (seo.title) document.title = seo.title; const md = document.querySelector('meta[name="description"]'); if (md && seo.description) md.setAttribute("content", seo.description); }
})();
