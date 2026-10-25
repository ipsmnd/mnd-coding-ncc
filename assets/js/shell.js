"use strict";
/* ============================================================
   SHELL: announcement, header, mobile nav, footer, search
   ============================================================ */
function renderAnnounce() {
  const a = { ...SITE.announcement, ...store.get("admin:announcement", {}) };
  const dismissed = store.get("announceDismissed", "") === a.text;
  const host = $("#announce");
  if (!a.enabled || dismissed || !a.text) { host.innerHTML = ""; return; }
  host.innerHTML = `<div class="announce" role="region" aria-label="Announcement"><div class="wrap"><b>${esc(a.label || "Update")}</b><span>${esc(a.text)}</span>${a.link ? `<a href="#${esc(a.link)}">${esc(a.linkText || "Learn more")} →</a>` : ""}<button type="button" id="annX" aria-label="Dismiss announcement">${icon("x", "icon", 'style="width:16px;height:16px"')}</button></div></div>`;
  $("#annX").onclick = () => { store.set("announceDismissed", a.text); host.innerHTML = ""; };
}
function navActive(p) { return curPath === p || (p !== "/" && curPath.startsWith(p)) ? "active" : ""; }
/* Course categories for the header menu, mobile nav and footer */
const CAT_ICON = { Networking: "network", Cloud: "cloud", Cybersecurity: "shield", "Penetration Testing": "target" };
const catHref = cat => "#/courses?cat=" + encodeURIComponent(cat);
function courseCats() {
  const m = new Map();
  getCourses().forEach(c => { if (!m.has(c.category)) m.set(c.category, []); m.get(c.category).push(c); });
  return [...m].map(([name, list]) => ({ name, list, icon: CAT_ICON[name] || list[0].icon }));
}
/* Search inside the Courses mega menu */
function wireMegaSearch() {
  const q = $("#megaQ"), res = $("#megaRes"), cols = $("#megaCols"), foot = $("#megaFoot");
  let hits = [], act = 0;
  const draw = () => {
    const t = q.value.trim().toLowerCase(), on = !!t;
    res.hidden = !on; cols.hidden = on; foot.hidden = on;
    if (!on) return;
    const words = t.split(/\s+/);
    hits = getCourses().filter(c => { const hay = `${c.title} ${c.category} ${c.level} ${c.short || ""}`.toLowerCase(); return words.every(w => hay.includes(w)); })
      .sort((a, b) => (b.title.toLowerCase().includes(t) - a.title.toLowerCase().includes(t)));
    act = 0;
    const shown = hits.slice(0, 8);
    res.innerHTML = shown.length ? shown.map((c, i) => `<a href="#${c.route}" role="option" id="megaO${i}" data-i="${i}"><span class="icon-box">${icon(c.icon)}</span><div>${esc(c.title)}<span>${esc(c.category)} · ${esc(c.level)}${c.duration ? " · " + esc(c.duration) : ""}</span></div></a>`).join("") +
      (hits.length > shown.length ? `<a class="mega-all" href="#/courses?q=${encodeURIComponent(q.value.trim())}">See all ${hits.length} results ${icon("arrow")}</a>` : "")
      : `<div class="mega-none">${icon("search")}<strong>No courses match “${esc(q.value.trim())}”</strong><a href="#/courses">Browse all courses</a></div>`;
    mark();
  };
  const mark = () => $$("[data-i]", res).forEach(a => { const on = +a.dataset.i === act; a.classList.toggle("active", on); if (on) { q.setAttribute("aria-activedescendant", a.id); a.scrollIntoView({ block: "nearest" }); } });
  q.addEventListener("input", draw);
  q.addEventListener("click", e => e.stopPropagation());
  q.addEventListener("keydown", e => {
    const n = Math.min(hits.length, 8);
    if (e.key === "ArrowDown" && n) { e.preventDefault(); act = (act + 1) % n; mark(); }
    else if (e.key === "ArrowUp" && n) { e.preventDefault(); act = (act - 1 + n) % n; mark(); }
    else if (e.key === "Enter") { e.preventDefault(); const t = q.value.trim(); if (!t) navigate("/courses"); else if (hits[act]) navigate(hits[act].route); }
    else if (e.key === "Escape" && q.value) { e.preventDefault(); e.stopPropagation(); q.value = ""; draw(); }
  });
  res.addEventListener("mousemove", e => { const a = e.target.closest("[data-i]"); if (a && +a.dataset.i !== act) { act = +a.dataset.i; mark(); } });
}
/* Sections that open only for signed-in students (routes use { auth: "student" }) */
const STUDENT_ONLY = ["/projects", "/resources", "/practice"];
const isStudentOnly = h => STUDENT_ONLY.some(p => h === p || h.startsWith(p + "/") || h.startsWith(p + "?"));
/* Learn menu entries visible to the current visitor */
const learnMenu = () => { const u = currentUser(); return LEARN_MENU.map(g => ({ ...g, items: g.items.filter(([, h]) => u || !isStudentOnly(h)) })).filter(g => g.items.length); };
/* "Learn" menu: study material and hands-on practice */
const LEARN_MENU = [
  { title: "Study", items: [
    ["Learning Paths", "/learning-paths", "route", "Step-by-step tracks from fundamentals to projects"],
    ["Projects", "/projects", "layers", "Guided projects with checklists and deliverables"],
    ["Resources", "/resources", "book", "Cheat sheets, guides and reference material"]] },
  { title: "Practice", items: [
    ["Labs", "/labs", "flask", "Ten hands-on browser exercises"],
    ["Practice Arena", "/practice", "target", "Topic practice and timed mock exams"]] }
];
function renderHeader() {
  const u = currentUser(); const cats = courseCats(), total = cats.reduce((n, c) => n + c.list.length, 0);
  $("#hdr").innerHTML = `<div class="wrap nav">
    <a class="logo" href="#/" aria-label="MND CODE home">${LOGO}<span>MND CODE<small>CONNECT · COMPUTE · SECURE</small></span></a>
    <ul class="nav-links">
      <li><a href="#/" class="${curPath === "/" ? "active" : ""}">Home</a></li>
      <li class="dd" id="ddCourses"><button type="button" aria-expanded="false" aria-haspopup="true" class="${curPath.startsWith("/courses") ? "active" : ""}">Courses ${icon("chev", "icon", 'style="width:15px;height:15px"')}</button>
        <div class="dd-menu mega" role="menu">
          <div class="mega-search">${icon("search")}<input type="search" id="megaQ" placeholder="Search ${total} courses…" autocomplete="off" aria-label="Search courses" aria-controls="megaRes"><kbd>Enter</kbd></div>
          <div class="mega-res" id="megaRes" role="listbox" hidden></div>
          <div class="mega-cols" id="megaCols">${cats.map(k => `<div class="mega-col">
            <a class="mega-cat" href="${catHref(k.name)}" role="menuitem"><span class="icon-box">${icon(k.icon)}</span><div>${esc(k.name)}<span>${k.list.length} courses</span></div></a>
            <ul>${k.list.slice(0, 5).map(c => `<li><a href="#${c.route}" role="menuitem">${esc(c.title)}</a></li>`).join("")}</ul>
            ${k.list.length > 5 ? `<a class="mega-more" href="${catHref(k.name)}" role="menuitem">View all ${k.list.length} ${icon("arrow")}</a>` : ""}
          </div>`).join("")}</div>
          <div class="mega-foot" id="megaFoot"><span>${total} courses across ${cats.length} categories</span><a href="#/courses" role="menuitem">Browse all courses ${icon("arrow")}</a></div>
        </div></li>
      <li class="dd" id="ddLearn"><button type="button" aria-expanded="false" aria-haspopup="true" class="${learnMenu().some(g => g.items.some(([, h]) => navActive(h))) ? "active" : ""}">Learn ${icon("chev", "icon", 'style="width:15px;height:15px"')}</button>
        <div class="dd-menu dd-learn" role="menu">${learnMenu().map(g => `<div class="dd-group"><span class="dd-group-h">${g.title}</span>
          ${g.items.map(([t, h, i, d]) => `<a href="#${h}" role="menuitem" class="${navActive(h)}"><span class="icon-box">${icon(i)}</span><div>${t}<span>${d}</span></div></a>`).join("")}</div>`).join("")}
          ${u ? "" : `<a class="dd-unlock" href="#/login?next=/practice" role="menuitem"><span class="icon-box">${icon("lock")}</span><div>Sign in to unlock more<span>Projects, Resources and Practice Arena are free for registered students</span></div></a>`}
        </div></li>
      <li><a href="#/about" class="${navActive("/about")}">About</a></li>
      <li><a href="#/contact" class="${navActive("/contact")}">Contact</a></li>
    </ul>
    <div class="nav-actions">
      <button class="search-btn" type="button" id="openSearch" aria-label="Search">${icon("search", "icon", 'style="width:16px;height:16px"')}<span>Search</span><kbd>Ctrl K</kbd></button>
      ${u ? `<a class="btn btn-ghost btn-sm hide-m" href="#${u.role === "admin" ? "/admin" : "/dashboard"}">${icon("user")}${esc(u.name.split(" ")[0])}</a>` : `<a class="btn btn-primary btn-sm hide-m" href="#/login">Sign In</a>`}
      <button class="menu-toggle" id="menuToggle" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="mnav">${icon("menu")}</button>
    </div></div>`;
  $$(".nav-links .dd").forEach(dd => {
    const b = $("button", dd);
    b.onclick = e => {
      e.stopPropagation();
      $$(".nav-links .dd.open").forEach(o => { if (o !== dd) { o.classList.remove("open"); $("button", o).setAttribute("aria-expanded", "false"); } });
      const o = dd.classList.toggle("open"); b.setAttribute("aria-expanded", o);
      if (o) setTimeout(() => ($("#megaQ", dd) || $("a", dd)).focus({ preventScroll: true }), 0);
    };
    dd.addEventListener("keydown", e => { if (e.key === "Escape") { dd.classList.remove("open"); b.setAttribute("aria-expanded", "false"); b.focus(); } });
  });
  wireMegaSearch();
  $("#openSearch").onclick = openSearch;
  $("#mnav").innerHTML = `<a href="#/">Home</a><a href="#/courses">All Courses</a>${cats.map(k => `<a class="sub" href="${catHref(k.name)}">${esc(k.name)} <small>${k.list.length}</small></a>`).join("")}<span class="mnav-h">Learn</span>${learnMenu().flatMap(g => g.items).map(([t, h]) => `<a class="sub" href="#${h}">${t}</a>`).join("")}<a href="#/blog">Blog</a><a href="#/faq">FAQ</a><a href="#/about">About</a><a href="#/contact">Contact</a>${u ? `<a href="#${u.role === "admin" ? "/admin" : "/dashboard"}">My ${u.role === "admin" ? "admin" : "dashboard"}</a>` : `<a href="#/login">Sign In</a><a href="#/register">Create account</a>`}`;
  $("#menuToggle").onclick = () => { const m = $("#mnav"), o = m.classList.toggle("open"); $("#menuToggle").setAttribute("aria-expanded", o); $("#menuToggle").innerHTML = icon(o ? "x" : "menu"); document.body.style.overflow = o ? "hidden" : ""; };
}
function renderFooter() {
  const cats = courseCats();
  $("#ftr").innerHTML = `<div class="wrap"><div class="foot-grid">
    <div class="stack" style="gap:14px"><a class="logo" href="#/">${LOGO}<span>MND CODE<small>CONNECT · COMPUTE · SECURE</small></span></a>
      <p class="small muted" style="max-width:34ch">Practical, responsible training in networking, cloud infrastructure and cybersecurity.</p></div>
    <div><h5>Courses</h5><ul>${cats.map(k => `<li><a href="${catHref(k.name)}">${esc(k.name)}</a></li>`).join("")}</ul></div>
    <div><h5>Learn</h5><ul><li><a href="#/learning-paths">Learning paths</a></li><li><a href="#/labs">Practical labs</a></li>${currentUser() ? `<li><a href="#/practice">Practice Arena · mock tests</a></li><li><a href="#/projects">Projects</a></li><li><a href="#/resources">Resources</a></li>` : ""}<li><a href="#/blog">Blog</a></li></ul></div>
    <div><h5>Company</h5><ul><li><a href="#/about">About us</a></li><li><a href="#/faq">FAQ</a></li><li><a href="#/contact">Contact us</a></li></ul></div>
  </div><div class="foot-bottom"><span>© ${new Date().getFullYear()} MND CODE. All rights reserved.</span><span class="foot-legal"><a href="#/privacy">Privacy</a><a href="#/terms">Terms</a></span></div></div>`;
}

/* Search palette */
function searchIndex() {
  const out = [];
  getCourses().forEach(c => {
    out.push({ t: c.title, s: c.short, k: "Course", h: c.route });
    c.modules.forEach((m, i) => out.push({ t: `Module ${i + 1}: ${m.title}`, s: c.title, k: "Module", h: `${c.route}?m=${i + 1}` }));
    c.lessons.forEach(l => out.push({ t: l.title, s: c.title, k: "Lesson", h: `/learn/${c.slug}/${l.id}` }));
  });
  RESOURCES.forEach(r => out.push({ t: r.title, s: r.type, k: "Resource", h: "/resources?r=" + r.id }));
  POSTS.forEach(p => out.push({ t: p.title, s: p.excerpt, k: "Blog", h: "/blog/" + p.slug }));
  PROJECTS.forEach(p => out.push({ t: p.title, s: "Example project", k: "Project", h: p.guide ? "/projects/" + p.guide : "/projects" }));
  PROJECT_GUIDES.forEach(g => out.push({ t: g.title, s: "Project guide · checklist + " + g.projects.length + " projects", k: "Guide", h: "/projects/" + g.slug }));
  LAB_LIST.forEach(l => out.push({ t: l.title, s: l.desc, k: "Lab", h: "/labs?t=" + l.id }));
  [["Practice Arena — mock tests", "/practice"], ["Mock exam (timed)", "/practice?mode=exam"], ["Learning paths", "/learning-paths"], ["FAQ", "/faq"], ["Contact us", "/contact"], ["About MND CODE", "/about"]].forEach(([t, h]) => out.push({ t, s: "Page", k: "Page", h }));
  return currentUser() ? out : out.filter(x => !isStudentOnly(x.h));
}
function searchFn(q, limit = 40) {
  const terms = q.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  return searchIndex().map(x => { const hay = (x.t + " " + x.s).toLowerCase(); let score = 0; for (const t of terms) { if (!hay.includes(t)) return null; score += x.t.toLowerCase().includes(t) ? 3 : 1; } if (x.k === "Course") score += 2; return { ...x, score }; }).filter(Boolean).sort((a, b) => b.score - a.score).slice(0, limit);
}
function openSearch() {
  const d = $("#pal"), inp = $("#palInput"), res = $("#palRes");
  let sel = 0, items = [];
  const draw = () => {
    items = inp.value.trim() ? searchFn(inp.value, 30) : [{ t: "All courses", s: "", k: "Page", h: "/courses" }, { t: "Subnetting calculator", s: "", k: "Lab", h: "/labs?t=subnet" }, { t: "Learning paths", s: "", k: "Page", h: "/learning-paths" }, ...(currentUser() ? [{ t: "Practice Arena", s: "", k: "Page", h: "/practice" }, { t: "Resources & cheat sheets", s: "", k: "Page", h: "/resources" }] : [])];
    res.innerHTML = items.length ? items.map((x, i) => `<a href="#${esc(x.h)}" role="option" class="${i === sel ? "sel" : ""}" aria-selected="${i === sel}"><span>${esc(x.t)}${x.s ? `<span class="dim xs" style="display:block">${esc(x.s.slice(0, 70))}</span>` : ""}</span><small>${x.k}</small></a>`).join("") : `<p class="muted small" style="padding:16px">No results for “${esc(inp.value)}”. Try a topic such as <em>subnet</em>, <em>VPC</em> or <em>SSH</em>.</p>`;
  };
  inp.value = ""; sel = 0; draw();
  inp.oninput = () => { sel = 0; draw(); };
  inp.onkeydown = e => {
    if (e.key === "ArrowDown") { e.preventDefault(); sel = Math.min(sel + 1, items.length - 1); draw(); $(".sel", res)?.scrollIntoView({ block: "nearest" }); }
    if (e.key === "ArrowUp") { e.preventDefault(); sel = Math.max(sel - 1, 0); draw(); $(".sel", res)?.scrollIntoView({ block: "nearest" }); }
    if (e.key === "Enter" && items[sel]) { e.preventDefault(); d.close(); navigate(items[sel].h); }
  };
  res.onclick = e => { if (e.target.closest("a")) d.close(); };
  $("#palClose").onclick = () => d.close();
  d.showModal(); inp.focus();
}
document.addEventListener("keydown", e => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); if (!$("#pal").open) openSearch(); } });
const qparam = k => new URLSearchParams(curPath.split("?")[1] || "").get(k);

/* Back to top */
window.addEventListener("scroll", () => { $("#toTop").hidden = scrollY < 900; }, { passive: true });
$("#toTop").onclick = () => { window.scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); $("#main").focus({ preventScroll: true }); };
