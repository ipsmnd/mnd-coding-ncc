"use strict";
/* ============================================================
   SHARED COMPONENTS
   ============================================================ */
const crumbs = list => `<nav aria-label="Breadcrumb"><ol class="crumbs">${list.map(([t, h], i) => `<li>${h && i < list.length - 1 ? `<a href="#${h}">${esc(t)}</a>` : `<span aria-current="page">${esc(t)}</span>`}</li>`).join("")}</ol></nav>`;
const pageHead = (eyebrow, title, lead, cr, extra = "") => `<section class="page-head"><div class="glow-orb" style="background:var(--blue);top:-200px;right:-120px"></div><div class="wrap" style="position:relative">${cr ? crumbs(cr) : ""}<span class="eyebrow">${esc(eyebrow)}</span><h1 style="margin-top:14px">${title}</h1>${lead ? `<p class="lead">${lead}</p>` : ""}${extra}</div></section>`;
const levelChip = l => `<span class="chip ${l === "Beginner" ? "chip-ok" : l === "Intermediate" ? "chip-blue" : "chip-purple"}">${esc(l)}</span>`;

function courseArt(slug, accent = "#3B82F6") {
  const id = "ca" + slug.replace(/\W/g, "");
  const grid = `<defs><linearGradient id="${id}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${accent}" stop-opacity=".35"/><stop offset="1" stop-color="#070A12" stop-opacity="0"/></linearGradient><pattern id="${id}p" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0v24" fill="none" stroke="#94A3B8" stroke-opacity=".08"/></pattern></defs><rect width="400" height="180" fill="#0B1120"/><rect width="400" height="180" fill="url(#${id}p)"/><rect width="400" height="180" fill="url(#${id}g)"/>`;
  if (slug === "networking") {
    const n = [[70, 50], [70, 130], [200, 90], [330, 50], [330, 130], [140, 90], [260, 90]];
    const e = [[0, 5], [1, 5], [5, 2], [2, 6], [6, 3], [6, 4]];
    return `<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${grid}${e.map(([a, b]) => `<line x1="${n[a][0]}" y1="${n[a][1]}" x2="${n[b][0]}" y2="${n[b][1]}" stroke="${accent}" stroke-opacity=".6" stroke-width="1.5" stroke-dasharray="4 4"><animate attributeName="stroke-dashoffset" from="16" to="0" dur="1.6s" repeatCount="indefinite"/></line>`).join("")}${n.map(([x, y], i) => i === 2 ? `<rect x="${x - 22}" y="${y - 14}" width="44" height="28" rx="6" fill="#101625" stroke="#22D3EE"/><text x="${x}" y="${y + 4}" fill="#22D3EE" font-family="JetBrains Mono,monospace" font-size="10" text-anchor="middle">CORE</text>` : `<circle cx="${x}" cy="${y}" r="${i > 4 ? 9 : 7}" fill="#101625" stroke="${i > 4 ? "#22D3EE" : accent}" stroke-width="1.5"/>`).join("")}<text x="200" y="166" text-anchor="middle" fill="#94A3B8" font-family="JetBrains Mono,monospace" font-size="10">192.168.10.0/24 · VLAN 10 · 20 · 30</text></svg>`;
  }
  if (slug === "cloud-computing") {
    return `<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${grid}<rect x="40" y="26" width="320" height="128" rx="12" fill="none" stroke="${accent}" stroke-opacity=".55" stroke-dasharray="5 4"/><text x="52" y="44" fill="${accent}" font-family="JetBrains Mono,monospace" font-size="10">VPC 10.20.0.0/16</text>${[0, 1].map(z => `<rect x="${60 + z * 150}" y="56" width="130" height="38" rx="8" fill="#3B82F6" fill-opacity=".12" stroke="#3B82F6" stroke-opacity=".5"/><text x="${72 + z * 150}" y="79" fill="#93C5FD" font-family="JetBrains Mono,monospace" font-size="9">public · AZ-${"ab"[z]}</text><rect x="${60 + z * 150}" y="102" width="130" height="38" rx="8" fill="#8B5CF6" fill-opacity=".12" stroke="#8B5CF6" stroke-opacity=".5"/><text x="${72 + z * 150}" y="125" fill="#C4B5FD" font-family="JetBrains Mono,monospace" font-size="9">private · AZ-${"ab"[z]}</text>`).join("")}<path d="M200 6 v20" stroke="#22D3EE" stroke-width="2"/><circle cx="200" cy="6" r="4" fill="#22D3EE"><animate attributeName="opacity" values="1;.3;1" dur="2s" repeatCount="indefinite"/></circle></svg>`;
  }
  if (slug === "ethical-hacking") {
    return `<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${grid}<path d="M200 28c20 14 38 18 52 18v42c0 30-24 46-52 56-28-10-52-26-52-56V46c14 0 32-4 52-18z" fill="#101625" stroke="${accent}" stroke-width="1.8"/><path d="m182 90 12 12 26-26" fill="none" stroke="#22C55E" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>${[0, 1, 2, 3, 4].map(i => `<text x="${24}" y="${42 + i * 24}" fill="#94A3B8" fill-opacity=".55" font-family="JetBrains Mono,monospace" font-size="9">${["scope: lab-only", "auth: written ✓", "finding: F-03", "cvss: 6.5", "status: fixed"][i]}</text>`).join("")}<rect x="0" y="0" width="400" height="2" fill="${accent}" opacity=".6"><animate attributeName="y" values="10;170;10" dur="5s" repeatCount="indefinite"/></rect></svg>`;
  }
  return `<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${grid}<circle cx="200" cy="90" r="34" fill="none" stroke="${accent}"/><circle cx="200" cy="90" r="6" fill="${accent}"/></svg>`;
}

function courseCard(c, big = false) {
  return `<a class="card card-link course-card reveal" href="#${c.route}">
    <div class="course-art">${courseArt(c.slug, c.accent)}<span class="chip chip-cyan" style="position:absolute;top:14px;left:14px;background:rgba(7,10,18,.75)">${esc(c.category)}</span></div>
    <div class="course-body"><div class="row">${levelChip(c.level)}</div>
      <h3>${esc(c.title)}</h3><p>${esc(c.short)}</p>
      <div class="facts"><div><b>${c.modules.length}</b>modules</div><div><b>${c.lessons.length}</b>lessons</div><div><b>≈${c.hours} h</b>estimate</div></div>
      ${big ? `<ul class="outcomes">${(c.outcomes || []).map(o => `<li>${icon("check")}${esc(o)}</li>`).join("")}</ul>` : ""}
      <span class="course-foot">View course ${icon("arrow", "icon", 'style="width:18px;height:18px"')}</span></div></a>`;
}

/* Quiz component: mount(el, questions, onDone) */
function mountQuiz(el, qs, onDone) {
  let i = 0, score = 0;
  const draw = () => {
    if (i >= qs.length) {
      el.innerHTML = `<div class="stack"><div class="row between"><h4>Result: ${score} / ${qs.length}</h4><span class="chip ${score === qs.length ? "chip-ok" : score >= qs.length / 2 ? "chip-blue" : "chip-warn"}">${Math.round(score / qs.length * 100)}%</span></div><div class="progress"><i style="width:${score / qs.length * 100}%"></i></div><p class="small muted">${score === qs.length ? "All correct. Well done." : "Review the explanations above the result, then try again."}</p><div><button class="btn btn-ghost btn-sm" type="button" data-retry>${icon("reset")}Try again</button></div></div>`;
      $("[data-retry]", el).onclick = () => { i = 0; score = 0; draw(); };
      onDone && onDone(score, qs.length);
      return;
    }
    const q = qs[i];
    el.innerHTML = `<div class="quiz"><div class="row between"><span class="xs mono dim">QUESTION ${i + 1} OF ${qs.length}</span><span class="xs mono dim">SCORE ${score}</span></div><div class="progress"><i style="width:${i / qs.length * 100}%"></i></div>
      <h4 style="font-size:var(--t-base)" id="qh${i}">${esc(q.q)}</h4><div class="q-opts" role="group" aria-labelledby="qh${i}">${q.options.map((o, k) => `<button class="q-opt" type="button" data-k="${k}"><span class="k">${"ABCD"[k]}</span><span>${esc(o)}</span></button>`).join("")}</div><div data-fb aria-live="polite"></div></div>`;
    $$(".q-opt", el).forEach(b => b.onclick = () => {
      const k = +b.dataset.k, ok = k === q.answer; if (ok) score++;
      $$(".q-opt", el).forEach(x => { x.disabled = true; if (+x.dataset.k === q.answer) x.classList.add("right"); });
      if (!ok) b.classList.add("wrong");
      $("[data-fb]", el).innerHTML = `<div class="alert ${ok ? "alert-ok" : "alert-bad"}">${icon(ok ? "check" : "alert")}<div><strong>${ok ? "Correct." : "Not quite."}</strong> ${esc(q.why)}</div></div><div style="margin-top:12px"><button class="btn btn-primary btn-sm" type="button" data-next>${i + 1 < qs.length ? "Next question" : "See result"} ${icon("arrow")}</button></div>`;
      $("[data-next]", el).onclick = () => { i++; draw(); };
      $("[data-next]", el).focus();
    });
  };
  draw();
}

/* Hero network canvas */
function heroCanvas(cv) {
  const ctx = cv.getContext("2d"); const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let W, H, dpr, nodes, packets = [], raf;
  const kinds = ["router", "server", "cloud", "shield", "node", "node", "node", "node", "server", "node", "cloud", "node"];
  function size() {
    dpr = Math.min(devicePixelRatio || 1, 2); const r = cv.getBoundingClientRect(); W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const pts = [[.5, .42], [.2, .22], [.8, .2], [.82, .62], [.16, .6], [.34, .36], [.66, .36], [.36, .7], [.64, .72], [.5, .14], [.92, .4], [.06, .4]];
    nodes = pts.map((p, i) => ({ x: p[0] * W, y: p[1] * H * .86, k: kinds[i], ph: Math.random() * 6 }));
  }
  const edges = [[0, 5], [0, 6], [0, 7], [0, 8], [5, 1], [6, 2], [6, 3], [5, 4], [1, 9], [2, 9], [3, 10], [4, 11], [7, 4], [8, 3]];
  function glyph(n, t) {
    const { x, y, k } = n; const pulse = .5 + .5 * Math.sin(t / 700 + n.ph);
    ctx.save();
    const col = k === "shield" ? "#8B5CF6" : k === "cloud" ? "#22D3EE" : k === "router" ? "#22D3EE" : "#3B82F6";
    ctx.shadowColor = col; ctx.shadowBlur = 12 + pulse * 10; ctx.strokeStyle = col; ctx.fillStyle = "#0D1322"; ctx.lineWidth = 1.6;
    if (k === "node") { ctx.beginPath(); ctx.arc(x, y, 5, 0, 7); ctx.fill(); ctx.stroke(); }
    else if (k === "server") { for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x - 16, y - 15 + i * 10, 32, 8, 2) : ctx.rect(x - 16, y - 15 + i * 10, 32, 8); ctx.fill(); ctx.stroke(); ctx.fillStyle = i === 1 ? "#22C55E" : col; ctx.fillRect(x - 12, y - 12 + i * 10, 3, 2); ctx.fillStyle = "#0D1322"; } }
    else if (k === "cloud") { ctx.beginPath(); ctx.arc(x - 8, y + 2, 8, Math.PI * .5, Math.PI * 1.5); ctx.arc(x, y - 5, 10, Math.PI, 0); ctx.arc(x + 10, y + 2, 8, Math.PI * 1.5, Math.PI * .5); ctx.closePath(); ctx.fill(); ctx.stroke(); }
    else if (k === "shield") { ctx.beginPath(); ctx.moveTo(x, y - 15); ctx.lineTo(x + 12, y - 9); ctx.lineTo(x + 11, y + 4); ctx.quadraticCurveTo(x + 6, y + 12, x, y + 15); ctx.quadraticCurveTo(x - 6, y + 12, x - 11, y + 4); ctx.lineTo(x - 12, y - 9); ctx.closePath(); ctx.fill(); ctx.stroke(); }
    else if (k === "router") { ctx.beginPath(); ctx.arc(x, y, 18, 0, 7); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x - 8, y); ctx.lineTo(x + 8, y); ctx.moveTo(x, y - 8); ctx.lineTo(x, y + 8); ctx.stroke(); ctx.globalAlpha = .25 + pulse * .25; ctx.beginPath(); ctx.arc(x, y, 28 + pulse * 6, 0, 7); ctx.stroke(); }
    ctx.restore();
  }
  function frame(t) {
    ctx.clearRect(0, 0, W, H);
    ctx.lineWidth = 1;
    edges.forEach(([a, b]) => { const A = nodes[a], B = nodes[b]; const g = ctx.createLinearGradient(A.x, A.y, B.x, B.y); g.addColorStop(0, "rgba(59,130,246,.45)"); g.addColorStop(1, "rgba(34,211,238,.15)"); ctx.strokeStyle = g; ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.stroke(); });
    if (!reduce && Math.random() < .06 && packets.length < 14) { const e = edges[Math.floor(Math.random() * edges.length)]; const rev = Math.random() < .5; packets.push({ a: rev ? e[1] : e[0], b: rev ? e[0] : e[1], p: 0, s: .006 + Math.random() * .01, c: Math.random() < .15 ? "#8B5CF6" : "#22D3EE" }); }
    packets = packets.filter(p => p.p <= 1);
    packets.forEach(p => { p.p += p.s; const A = nodes[p.a], B = nodes[p.b]; const x = A.x + (B.x - A.x) * p.p, y = A.y + (B.y - A.y) * p.p; ctx.save(); ctx.fillStyle = p.c; ctx.shadowColor = p.c; ctx.shadowBlur = 10; ctx.beginPath(); ctx.arc(x, y, 2.6, 0, 7); ctx.fill(); ctx.restore(); });
    nodes.forEach(n => glyph(n, t));
    if (!reduce && cv.isConnected) raf = requestAnimationFrame(frame);
  }
  size(); frame(0);
  const ro = new ResizeObserver(() => { size(); if (reduce) frame(0); }); ro.observe(cv);
  // live-looking telemetry is labelled as simulated in the UI
  const tel = () => { if (!cv.isConnected) return; const a = $("#telA"), b = $("#telB"); if (a) a.textContent = (14 + Math.random() * 9).toFixed(1) + " ms"; if (b) b.textContent = (93 + Math.random() * 6).toFixed(1) + "%"; setTimeout(tel, 1600); };
  if (!reduce) tel();
}
