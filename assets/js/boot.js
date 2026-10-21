"use strict";
/* ============================================================
   BOOT
   ============================================================ */
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
