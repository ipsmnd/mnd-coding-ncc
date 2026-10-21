"use strict";
/* ============================================================
   ADMIN
   ============================================================ */
const ADMIN_LINKS = [["/admin", "grid", "Overview"], ["/admin/courses", "book", "Courses"], ["/admin/lessons", "list", "Lessons"], ["/admin/students", "users", "Students"], ["/admin/messages", "inbox", "Messages"]];
const adminShell = (active, inner) => `<div class="wrap app-shell"><div class="side-wrap">${sideToggle("sideNav", "Admin menu", (ADMIN_LINKS.find(l => l[0] === active) || ADMIN_LINKS[0])[2], (ADMIN_LINKS.find(l => l[0] === active) || ADMIN_LINKS[0])[1])}<nav class="side" id="sideNav" aria-label="Admin">
  <div class="side-h">Admin</div>${[["/admin", "grid", "Overview"], ["/admin/courses", "book", "Courses"], ["/admin/lessons", "list", "Lessons"], ["/admin/students", "users", "Students"], ["/admin/messages", "inbox", "Messages"]].map(([h, i, t]) => `<a href="#${h}" class="${active === h ? "active" : ""}" ${active === h ? 'aria-current="page"' : ""}>${icon(i)}${t}${h === "/admin/messages" && store.get("messages", []).some(m => !m.read) ? `<span class="chip chip-cyan" style="height:20px;margin-left:auto">${store.get("messages", []).filter(m => !m.read).length}</span>` : ""}</a>`).join("")}
  <div class="side-h">Site</div><a href="#/">${icon("home")}View site</a><a href="#/dashboard">${icon("user")}Student view</a><a href="#" id="signOut">${icon("logout")}Sign out</a></nav></div>
  <div style="min-width:0"><div class="alert alert-warn" style="margin-bottom:20px">${icon("info")}<span class="small"><strong>Prototype admin.</strong> Changes are saved in this browser only and logged below. In production these actions run through authenticated API endpoints with server-side role checks.</span></div>${inner}</div></div>`;
const adminHead = (t, s, extra = "") => `<div class="row between" style="margin-bottom:24px"><div><span class="eyebrow">Admin</span><h1 style="font-size:var(--t-2xl);margin-top:10px">${t}</h1>${s ? `<p class="small muted" style="margin-top:6px">${s}</p>` : ""}</div>${extra}</div>`;

route("/admin", (_, u) => {
  const cs = getCourses(), users = store.get("users", []), msgs = store.get("messages", []), log = store.get("audit", []);
  const ann = { ...SITE.announcement, ...store.get("admin:announcement", {}) }, seo = store.get("admin:seo", {});
  return {
    title: "Admin Dashboard",
    html: adminShell("/admin", adminHead("Overview", "Platform activity stored in this browser.") + `
   <div class="grid g4 stats">${statCard("book", cs.length, "Courses")}${statCard("list", cs.reduce((a, c) => a + c.lessons.length, 0), "Published lessons")}${statCard("users", users.filter(x => x.role === "student").length, "Students")}${statCard("inbox", msgs.filter(m => !m.read).length, "Unread messages")}</div>
   <div class="grid g2" style="margin-top:24px;align-items:start">
    <form class="card stack" id="annF"><h3 style="font-size:var(--t-md)">${icon("megaphone", "icon", 'style="vertical-align:-3px;color:var(--cyan)"')} Site announcement</h3>
     <label class="row small"><input type="checkbox" id="an-on" ${ann.enabled ? "checked" : ""} style="accent-color:#22D3EE"> Show announcement bar</label>
     <div class="grid g2"><div class="field"><label for="an-label">Label</label><input class="input" id="an-label" value="${esc(ann.label)}" maxlength="16"></div><div class="field"><label for="an-link">Link (internal path)</label><input class="input mono-in" id="an-link" value="${esc(ann.link || "")}" placeholder="/labs"></div></div>
     <div class="field"><label for="an-text">Text</label><input class="input" id="an-text" value="${esc(ann.text)}" maxlength="160"></div><div class="field"><label for="an-lt">Link text</label><input class="input" id="an-lt" value="${esc(ann.linkText || "")}" maxlength="30"></div>
     <span class="err" id="an-err"></span><div><button class="btn btn-primary" type="submit">Publish announcement</button></div></form>
    <form class="card stack" id="seoF"><h3 style="font-size:var(--t-md)">${icon("globe", "icon", 'style="vertical-align:-3px;color:var(--cyan)"')} Homepage SEO metadata</h3>
     <div class="field"><label for="seo-t">Title tag</label><input class="input" id="seo-t" value="${esc(seo.title || "MND CODE — Networking, Cloud & Cybersecurity Academy")}" maxlength="70"><span class="hint" id="seo-tc"></span></div>
     <div class="field"><label for="seo-d">Meta description</label><textarea class="input" id="seo-d" style="min-height:90px" maxlength="170">${esc(seo.description || "MND CODE — learn networking, cloud computing, cybersecurity and responsible penetration testing with structured lessons, browser labs and guided projects.")}</textarea><span class="hint" id="seo-dc"></span></div>
     <div><button class="btn btn-primary" type="submit">Save metadata</button></div></form>
   </div>
   <div class="card stack" style="margin-top:24px"><div class="row between"><h3 style="font-size:var(--t-md)">Audit log</h3><span class="xs dim">${log.length} events</span></div>${log.length ? `<div class="table-wrap"><table><thead><tr><th>Time</th><th>Actor</th><th>Action</th></tr></thead><tbody>${log.slice(0, 25).map(a => `<tr><td class="num">${fmtDT(a.ts)}</td><td>${esc(a.actor)}</td><td>${esc(a.action)}</td></tr>`).join("")}</tbody></table></div>` : `<p class="small muted">No events yet.</p>`}</div>`),
    init: () => {
      wireSignOut();
      const cnt = () => { $("#seo-tc").textContent = `${$("#seo-t").value.length} / 60 recommended`; $("#seo-dc").textContent = `${$("#seo-d").value.length} / 155 recommended`; }; $("#seo-t").oninput = $("#seo-d").oninput = cnt; cnt();
      $("#annF").onsubmit = e => { e.preventDefault(); const link = $("#an-link").value.trim(); if (link && !/^\/[\w\-/?=&]*$/.test(link)) return $("#an-err").textContent = "Link must be an internal path starting with /, e.g. /labs."; if ($("#an-on").checked && !$("#an-text").value.trim()) return $("#an-err").textContent = "Add announcement text or turn the bar off."; $("#an-err").textContent = ""; store.set("admin:announcement", { enabled: $("#an-on").checked, label: $("#an-label").value.trim(), text: $("#an-text").value.trim(), link, linkText: $("#an-lt").value.trim() }); store.del("announceDismissed"); audit(u.email, "Updated site announcement"); toast("Announcement published."); render(); };
      $("#seoF").onsubmit = e => { e.preventDefault(); store.set("admin:seo", { title: $("#seo-t").value.trim(), description: $("#seo-d").value.trim() }); audit(u.email, "Updated homepage SEO metadata"); toast("Metadata saved."); };
    }
  };
}, { auth: "admin" });

let ADMIN_COURSE_FILTER = { q: "", c: "", l: "" }; // kept while editing so the list doesn't reset after each save
route("/admin/courses", (_, u) => {
  const cs = getCourses();
  return {
    title: "Course Management",
    html: adminShell("/admin/courses", adminHead("Courses", "Edit course details, create new courses or remove them.", `<button class="btn btn-primary" type="button" id="newC">${icon("plus")}New course</button>`) + `
   <div class="admin-filters" role="search">
    <div class="field"><label for="cl-q">Search courses</label><input class="input" id="cl-q" type="search" placeholder="Title, category or level" autocomplete="off"></div>
    <div class="field"><label for="cl-c">Category</label><select class="input" id="cl-c"><option value="">All categories</option>${[...new Set(cs.map(c => c.category))].map(k => `<option>${esc(k)}</option>`).join("")}</select></div>
    <div class="field"><label for="cl-l">Level</label><select class="input" id="cl-l"><option value="">All levels</option>${["Beginner", "Intermediate", "Advanced"].map(l => `<option>${l}</option>`).join("")}</select></div>
    <button class="btn btn-quiet" type="button" id="cl-r">${icon("reset")}Reset</button>
   </div>
   <p class="small muted" id="cl-n" aria-live="polite" style="margin:0 0 12px"></p>
   <div class="table-wrap"><table><thead><tr><th>Course</th><th>Category</th><th>Level</th><th>Modules</th><th>Lessons</th><th>Questions</th><th>Actions</th></tr></thead><tbody id="cl-b">${cs.map(c => `<tr data-q="${esc((c.title + " " + c.category + " " + c.level + " " + c.slug).toLowerCase())}" data-cat="${esc(c.category)}" data-lvl="${esc(c.level)}"><td><a href="#${c.route}"><strong>${esc(c.title)}</strong></a>${c.custom ? ` <span class="demo-flag">custom</span>` : ""}</td><td>${esc(c.category)}</td><td>${esc(c.level)}</td><td class="num">${c.modules.length}</td><td class="num">${c.lessons.length}${c.allLessons.length !== c.lessons.length ? ` <span class="xs dim">(+${c.allLessons.length - c.lessons.length} draft)</span>` : ""}</td><td class="num">${c.modules.length + c.lessons.filter(l => LESSONS[l.key]).reduce((a, l) => a + LESSONS[l.key].quiz.length, 0)}</td><td><div class="row" style="gap:4px;flex-wrap:nowrap"><button class="btn btn-quiet btn-sm" type="button" data-edit="${c.slug}">${icon("edit")}Edit</button><button class="btn btn-quiet btn-sm" type="button" data-del="${c.slug}" style="color:#FDA4AF">${icon("trash")}Delete</button></div></td></tr>`).join("")}</tbody></table></div>
   <div class="row" style="margin-top:16px"><button class="btn btn-ghost btn-sm" type="button" id="restore">${icon("reset")}Restore default courses</button></div>`),
    init: () => {
      wireSignOut();
      const q = $("#cl-q"), fc = $("#cl-c"), fl = $("#cl-l"), body = $("#cl-b");
      const filt = () => {
        const words = q.value.toLowerCase().trim().split(/\s+/).filter(Boolean); let n = 0;
        $$("tr[data-q]", body).forEach(r => { const ok = words.every(w => r.dataset.q.includes(w)) && (!fc.value || r.dataset.cat === fc.value) && (!fl.value || r.dataset.lvl === fl.value); r.hidden = !ok; n += ok; });
        let empty = $("#cl-empty"); if (!n && !empty) { body.insertAdjacentHTML("beforeend", `<tr id="cl-empty"><td colspan="7" style="text-align:center;padding:32px" class="muted">No courses match these filters.</td></tr>`); } else if (n && empty) empty.remove();
        $("#cl-n").textContent = `${n} of ${cs.length} courses`;
        ADMIN_COURSE_FILTER = { q: q.value, c: fc.value, l: fl.value };
      };
      q.value = ADMIN_COURSE_FILTER.q; if ([...fc.options].some(o => o.value === ADMIN_COURSE_FILTER.c)) fc.value = ADMIN_COURSE_FILTER.c; fl.value = ADMIN_COURSE_FILTER.l;
      q.oninput = filt; fc.onchange = filt; fl.onchange = filt;
      $("#cl-r").onclick = () => { q.value = ""; fc.value = ""; fl.value = ""; filt(); q.focus(); };
      filt();
      const form = (c = {}) => new Promise(res => {
        const d = $("#dlg"); $("#dlgBody").innerHTML = `<h3 style="font-size:var(--t-lg)">${c.slug ? "Edit course" : "New course"}</h3><form class="stack" id="cfm" novalidate>
         <div class="field"><label for="cf-t">Title</label><input class="input" id="cf-t" value="${esc(c.title || "")}" maxlength="80"></div>
         <div class="grid g2"><div class="field"><label for="cf-c">Category</label><select class="input" id="cf-c"><option value="" disabled ${c.category ? "" : "selected"}>Select a category</option>${[...new Set(getCourses().map(x => x.category))].map(k => `<option ${c.category === k ? "selected" : ""}>${esc(k)}</option>`).join("")}<option value="__new">＋ New category…</option></select><input class="input" id="cf-cn" placeholder="New category name" maxlength="30" hidden style="margin-top:8px" aria-label="New category name"></div><div class="field"><label for="cf-l">Level</label><select class="input" id="cf-l">${["Beginner", "Intermediate", "Advanced"].map(l => `<option ${c.level === l ? "selected" : ""}>${l}</option>`).join("")}</select></div></div>
         <div class="field"><label for="cf-s">Short description</label><textarea class="input" id="cf-s" style="min-height:80px" maxlength="240">${esc(c.short || "")}</textarea></div>
         ${c.slug ? "" : `<div class="field"><label for="cf-m">Modules</label><textarea class="input mono-in" id="cf-m" style="min-height:110px;font-size:13px" placeholder="One module per line:\nModule title: lesson one; lesson two"></textarea><span class="hint">Format: <code>Module title: lesson; lesson; lesson</code></span></div>`}
         <span class="err" id="cf-err"></span><div class="row" style="justify-content:flex-end"><button class="btn btn-ghost" type="button" id="cf-x">Cancel</button><button class="btn btn-primary" type="submit">Save</button></div></form>`;
        const close = v => { d.close(); res(v); };
        $("#cf-c").onchange = () => { const n = $("#cf-cn"); n.hidden = $("#cf-c").value !== "__new"; if (!n.hidden) n.focus(); }; $("#cf-x").onclick = () => close(null); d.oncancel = e => { e.preventDefault(); close(null); };
        $("#cfm").onsubmit = e => { e.preventDefault(); const v = { title: $("#cf-t").value.trim(), category: ($("#cf-c").value === "__new" ? $("#cf-cn").value : $("#cf-c").value).trim(), level: $("#cf-l").value, short: $("#cf-s").value.trim() }; if (v.title.length < 4) return $("#cf-err").textContent = "Title needs at least 4 characters."; if (!v.category) return $("#cf-err").textContent = $("#cf-c").value === "__new" ? "Type a name for the new category." : "Choose a category."; if (v.short.length < 20) return $("#cf-err").textContent = "Description needs at least 20 characters."; if (!c.slug) { const lines = $("#cf-m").value.split("\n").map(x => x.trim()).filter(Boolean); if (!lines.length) return $("#cf-err").textContent = "Add at least one module."; v.modules = lines.map(line => { const [t, ls] = line.split(":"); const topics = (ls || "").split(";").map(x => x.trim()).filter(Boolean); return { title: t.trim(), summary: "Module created in admin.", topics: topics.length ? topics : ["Introduction"], terms: [], check: { q: "Did you complete the lessons in this module?", options: ["Yes", "Not yet"], answer: 0, why: "Self-check created in admin." } }; }); } close(v); };
        d.showModal(); $("#cf-t").focus();
      });
      $("#newC").onclick = async () => { const v = await form(); if (!v) return; let s = slug(v.title); const ex = getCourses().map(c => c.slug); while (ex.includes(s)) s += "-2"; const custom = store.get("admin:customCourses", []); custom.push({ ...v, slug: s, icon: CAT_ICON[v.category] || "book", accent: "#22D3EE", overview: v.short, outcomes: [], objectives: [], audience: [], prerequisites: [], skills: [], tools: [], related: [], next: null }); store.set("admin:customCourses", custom); audit(u.email, `Created course “${v.title}”`); toast("Course created."); render(); };
      $$("[data-edit]").forEach(b => b.onclick = async () => { const c = findCourse(b.dataset.edit), v = await form(c); if (!v) return; const ov = store.get("admin:courses", {}); ov[c.slug] = { ...(ov[c.slug] || {}), ...v }; store.set("admin:courses", ov); audit(u.email, `Edited course “${v.title}”`); toast("Course saved."); render(); });
      $$("[data-del]").forEach(b => b.onclick = async () => { const c = findCourse(b.dataset.del); if (!(await confirmDialog({ title: `Delete “${c.title}”?`, body: c.custom ? "This custom course and its lessons will be removed." : "This core course will be hidden from the site. You can bring it back with 'Restore default courses'.", confirm: "Delete course", danger: true }))) return; if (c.custom) store.set("admin:customCourses", store.get("admin:customCourses", []).filter(x => x.slug !== c.slug)); else { const ov = store.get("admin:courses", {}); ov[c.slug] = { ...(ov[c.slug] || {}), deleted: true }; store.set("admin:courses", ov); } audit(u.email, `Deleted course “${c.title}”`); toast("Course deleted.", "info"); render(); });
      $("#restore").onclick = async () => { if (!(await confirmDialog({ title: "Restore default courses?", body: "All edits to the three core courses will be undone and hidden core courses shown again. Custom courses are kept.", confirm: "Restore" }))) return; store.del("admin:courses"); audit(u.email, "Restored default courses"); toast("Defaults restored."); render(); };
    }
  };
}, { auth: "admin" });

route("/admin/lessons", (_, u) => {
  const cs = getCourses(); const sel = cs.find(c => c.slug === qparam("c")) || cs[0];
  return {
    title: "Lesson Management",
    html: adminShell("/admin/lessons", adminHead("Lessons", "Publish, unpublish and add lessons. Draft lessons are hidden from students.") + `
   <div class="row" style="margin-bottom:20px"><label for="ls-c" class="small muted">Course</label><select class="input" id="ls-c" style="max-width:360px">${cs.map(c => `<option value="${c.slug}" ${c === sel ? "selected" : ""}>${esc(c.title)}</option>`).join("")}</select></div>
   ${sel ? `<div class="acc">${sel.modules.map((m, i) => `<details ${i === 0 ? "open" : ""}><summary><span><span class="mod-num">M${i + 1}</span>${esc(m.title)}</span><span class="row" style="gap:10px;flex-wrap:nowrap"><span class="xs dim mono">${m.lessons.filter(l => l.status === "published").length}/${m.lessons.length} live</span>${icon("chev", "icon chev")}</span></summary><div class="acc-body"><div class="table-wrap"><table><tbody>${m.lessons.map(l => `<tr><td style="width:60%">${esc(l.title)} ${l.authored ? `<span class="chip chip-ok" style="height:20px;font-size:10px">${l.custom ? "custom" : "full"}</span>` : `<span class="chip" style="height:20px;font-size:10px">outline</span>`}</td><td><span class="chip ${l.status === "published" ? "chip-ok" : "chip-warn"}">${l.status}</span></td><td><div class="row" style="gap:4px;flex-wrap:nowrap"><button class="btn btn-quiet btn-sm" type="button" data-tog="${l.key}">${l.status === "published" ? "Unpublish" : "Publish"}</button><a class="btn btn-quiet btn-sm" href="#/learn/${sel.slug}/${l.id}" ${l.status !== "published" ? 'aria-disabled="true" style="pointer-events:none;opacity:.4"' : ""}>${icon("eye")}View</a>${l.custom ? `<button class="btn btn-quiet btn-sm" type="button" data-rm="${l.module}|${l.id}" style="color:#FDA4AF">${icon("trash")}</button>` : ""}</div></td></tr>`).join("")}</tbody></table></div></div></details>`).join("")}</div>
   <form class="card stack" id="addL" style="margin-top:24px" novalidate><h3 style="font-size:var(--t-md)">Add a lesson to ${esc(sel.title)}</h3><div class="grid g2"><div class="field"><label for="al-m">Module</label><select class="input" id="al-m">${sel.modules.map((m, i) => `<option value="${i}">M${i + 1} · ${esc(m.title)}</option>`).join("")}</select></div><div class="field"><label for="al-t">Lesson title</label><input class="input" id="al-t" maxlength="100"></div></div><div class="field"><label for="al-b">Lesson content</label><textarea class="input" id="al-b" placeholder="Plain text. Separate paragraphs with a blank line."></textarea></div><div class="field"><label for="al-s">Status</label><select class="input" id="al-s" style="max-width:220px"><option value="draft">Draft</option><option value="published">Published</option></select></div><span class="err" id="al-err"></span><div><button class="btn btn-primary" type="submit">${icon("plus")}Add lesson</button></div></form>` : `<div class="empty">No courses yet.</div>`}`),
    init: () => {
      wireSignOut();
      $("#ls-c").onchange = e => navigate("/admin/lessons?c=" + e.target.value);
      $$("[data-tog]").forEach(b => b.onclick = () => { const st = store.get("admin:lessonStatus", {}); const k = b.dataset.tog; st[k] = (st[k] || "published") === "published" ? "draft" : "published"; store.set("admin:lessonStatus", st); audit(u.email, `Set lesson ${k} to ${st[k]}`); toast(`Lesson ${st[k] === "published" ? "published" : "moved to draft"}.`); render(); });
      $$("[data-rm]").forEach(b => b.onclick = async () => { if (!(await confirmDialog({ title: "Delete this lesson?", body: "The lesson content will be removed permanently.", confirm: "Delete", danger: true }))) return; const [mi, id] = b.dataset.rm.split("|"); const ex = store.get("admin:extraLessons", {}); const xi = +id.split("-x")[1] - 1; ex[sel.slug][mi].splice(xi, 1); store.set("admin:extraLessons", ex); audit(u.email, `Deleted lesson ${sel.slug}/${id}`); toast("Lesson deleted.", "info"); render(); });
      const f = $("#addL"); if (f) f.onsubmit = e => { e.preventDefault(); const t = $("#al-t").value.trim(), b = $("#al-b").value.trim(), mi = $("#al-m").value; if (t.length < 4) return $("#al-err").textContent = "Lesson title needs at least 4 characters."; if (b.length < 40) return $("#al-err").textContent = "Lesson content needs at least 40 characters."; const ex = store.get("admin:extraLessons", {}); ex[sel.slug] = ex[sel.slug] || {}; ex[sel.slug][mi] = ex[sel.slug][mi] || []; ex[sel.slug][mi].push({ title: t, body: b }); store.set("admin:extraLessons", ex); const key = `${sel.slug}/m${+mi + 1}-x${ex[sel.slug][mi].length}`; const st = store.get("admin:lessonStatus", {}); st[key] = $("#al-s").value; store.set("admin:lessonStatus", st); audit(u.email, `Added lesson “${t}” (${st[key]})`); toast("Lesson added."); render(); };
    }
  };
}, { auth: "admin" });

route("/admin/students", (_, u) => {
  const users = store.get("users", []), cs = getCourses();
  return {
    title: "Student Management",
    html: adminShell("/admin/students", adminHead("Students", "Registered accounts in this browser.") + `
   <div class="field" style="max-width:360px;margin-bottom:16px"><label for="st-q">Search students</label><input class="input" id="st-q" type="search" placeholder="Name or email"></div>
   <div class="table-wrap"><table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Enrolled</th><th>Lessons done</th><th>Joined</th><th>Actions</th></tr></thead><tbody id="st-b">${users.map(x => { const p = prog(x); return `<tr data-q="${esc((x.name + " " + x.email).toLowerCase())}"><td><strong>${esc(x.name)}</strong></td><td>${esc(x.email)}</td><td><span class="chip ${x.role === "admin" ? "chip-purple" : "chip-blue"}">${x.role}</span></td><td>${p.enrolled.map(s => `<span class="chip" style="height:22px;margin:2px">${esc((cs.find(c => c.slug === s) || { title: s }).title.split(" ")[0])}</span>`).join("") || '<span class="dim">—</span>'}</td><td class="num">${Object.keys(p.done).length}</td><td class="num">${fmtDate(x.created)}</td><td><div class="row" style="gap:4px;flex-wrap:nowrap"><select class="input" data-enr="${x.id}" aria-label="Enroll ${esc(x.name)} in a course" style="height:34px;width:150px;font-size:13px"><option value="">Enroll in…</option>${cs.filter(c => !p.enrolled.includes(c.slug)).map(c => `<option value="${c.slug}">${esc(c.title)}</option>`).join("")}</select>${x.id === u.id ? "" : `<button class="btn btn-quiet btn-sm" type="button" data-rmu="${x.id}" style="color:#FDA4AF" aria-label="Remove ${esc(x.name)}">${icon("trash")}</button>`}</div></td></tr>`; }).join("")}</tbody></table></div><p class="small muted" id="st-n" style="margin-top:10px"></p>`),
    init: () => {
      wireSignOut();
      const q = $("#st-q"), f = () => { let n = 0; $$("#st-b tr").forEach(r => { const ok = r.dataset.q.includes(q.value.toLowerCase().trim()); r.hidden = !ok; n += ok; }); $("#st-n").textContent = n ? `${n} account${n === 1 ? "" : "s"}` : "No accounts match your search."; }; q.oninput = f; f();
      $$("[data-enr]").forEach(s => s.onchange = () => { if (!s.value) return; const x = store.get("users", []).find(y => y.id === s.dataset.enr), p = prog(x); p.enrolled.push(s.value); saveProg(x, p); audit(u.email, `Enrolled ${x.email} in ${s.value}`); toast(`Enrolled ${x.name}.`); render(); });
      $$("[data-rmu]").forEach(b => b.onclick = async () => { const users = store.get("users", []), x = users.find(y => y.id === b.dataset.rmu); if (!(await confirmDialog({ title: `Remove ${x.name}?`, body: "Their account and learning progress will be deleted.", confirm: "Remove student", danger: true }))) return; store.set("users", users.filter(y => y.id !== x.id)); store.del("progress:" + x.id); audit(u.email, `Removed account ${x.email}`); toast("Account removed.", "info"); render(); });
    }
  };
}, { auth: "admin" });

route("/admin/messages", (_, u) => {
  const msgs = store.get("messages", []), filter = qparam("f") || "all";
  const list = msgs.filter(m => filter === "all" || (filter === "unread" ? !m.read : m.read));
  return {
    title: "Contact Submissions",
    html: adminShell("/admin/messages", adminHead("Messages", "Contact form submissions.") + `
   <div class="tab-row" style="margin-bottom:16px">${[["all", "All"], ["unread", "Unread"], ["read", "Read"]].map(([k, t]) => `<a class="btn btn-sm ${filter === k ? "btn-primary" : "btn-ghost"}" href="#/admin/messages${k === "all" ? "" : "?f=" + k}">${t} (${k === "all" ? msgs.length : msgs.filter(m => k === "unread" ? !m.read : m.read).length})</a>`).join("")}</div>
   ${list.length ? `<div class="acc">${list.map(m => `<details data-id="${m.id}"><summary><span style="min-width:0"><span class="chip ${m.read ? "" : "chip-cyan"}" style="margin-right:10px">${m.read ? "read" : "new"}</span>${esc(m.subject)} <span class="small dim" style="font-family:var(--f-body);font-weight:400">— ${esc(m.name)}</span></span><span class="row" style="gap:10px;flex-wrap:nowrap"><span class="xs dim mono" style="white-space:nowrap">${fmtDT(m.ts)}</span>${icon("chev", "icon chev")}</span></summary><div class="acc-body"><div class="result-grid"><div><span>From</span><b style="font-family:var(--f-body);font-size:var(--t-sm)">${esc(m.name)}</b></div><div><span>Email</span><b style="font-family:var(--f-body);font-size:var(--t-sm)">${esc(m.email)}</b></div><div><span>Phone</span><b style="font-family:var(--f-body);font-size:var(--t-sm)">${esc(m.phone || "—")}</b></div><div><span>Course interest</span><b style="font-family:var(--f-body);font-size:var(--t-sm)">${esc(m.course || "Not specified")}</b></div></div><p style="white-space:pre-wrap;color:var(--text)">${esc(m.message)}</p><div class="row"><button class="btn btn-ghost btn-sm" type="button" data-rd="${m.id}">${m.read ? "Mark as unread" : "Mark as read"}</button><button class="btn btn-ghost btn-sm" type="button" data-cp="${esc(m.email)}">${icon("copy")}Copy email</button><button class="btn btn-quiet btn-sm" type="button" data-dm="${m.id}" style="color:#FDA4AF">${icon("trash")}Delete</button></div></div></details>`).join("")}</div>` : `<div class="empty">${icon("inbox")}<strong>${filter === "all" ? "No messages yet." : "Nothing here."}</strong><span class="small">Submissions from the contact page appear here.</span><a class="btn btn-ghost btn-sm" href="#/contact">Open contact page</a></div>`}`),
    init: () => {
      wireSignOut();
      const upd = fn => { const ms = store.get("messages", []); fn(ms); store.set("messages", ms); };
      $$("details[data-id]").forEach(d => d.addEventListener("toggle", () => { if (d.open) upd(ms => { const m = ms.find(x => x.id === d.dataset.id); if (m && !m.read) { m.read = true; const c = $("summary .chip", d); c.className = "chip"; c.style.marginRight = "10px"; c.textContent = "read"; } }); }));
      $$("[data-rd]").forEach(b => b.onclick = () => { upd(ms => { const m = ms.find(x => x.id === b.dataset.rd); m.read = !m.read; }); render(); });
      $$("[data-cp]").forEach(b => b.onclick = () => { navigator.clipboard?.writeText(b.dataset.cp).then(() => toast("Email copied.")).catch(() => toast("Copy isn't available here — select the address instead.", "info")); });
      $$("[data-dm]").forEach(b => b.onclick = async () => { if (!(await confirmDialog({ title: "Delete this message?", body: "It will be removed from the inbox permanently.", confirm: "Delete", danger: true }))) return; upd(ms => ms.splice(ms.findIndex(x => x.id === b.dataset.dm), 1)); audit(u.email, "Deleted a contact message"); toast("Message deleted.", "info"); render(); });
    }
  };
}, { auth: "admin" });
