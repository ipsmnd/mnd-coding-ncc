/* ============================================================
   LESSON PLAYER
   ============================================================ */
import { Fragment, useCallback, useEffect, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Icon } from "../components/Icon.jsx";
import { useApp } from "../components/AppContext.jsx";
import { Crumbs, Html, Quiz, SideNav, usePageMeta } from "../components/ui.jsx";
import { findCourse, findLesson, LESSONS } from "../lib/data.js";
import { prog, saveProg, touch } from "../lib/auth.js";
import { OSI } from "./labs/NetworkLabs.jsx";
import { NotFound } from "./System.jsx";

const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/* Lesson diagrams (generated SVG markup from static values) */
function diagram(k) {
  const T = (x, y, s, c = "#F8FAFC", sz = 12, a = "middle", f = "Space Grotesk,sans-serif") => `<text x="${x}" y="${y}" fill="${c}" font-size="${sz}" text-anchor="${a}" font-family="${f}">${s}</text>`;
  const B = (x, y, w, h, s, sub, col = "#3B82F6") => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="#101625" stroke="${col}" stroke-opacity=".7"/>${T(x + w / 2, y + h / 2 + (sub ? -2 : 4), s)}${sub ? T(x + w / 2, y + h / 2 + 14, sub, "#94A3B8", 9, "middle", "JetBrains Mono,monospace") : ""}`;
  const L = (x1, y1, x2, y2, c = "#94A3B8") => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-opacity=".55" stroke-width="1.6"/>`;
  const wrap = (body, h = 220, cap = "") => `<figure style="margin:0"><div style="overflow-x:auto;border:1px solid var(--line);border-radius:14px;background:#0B1120;padding:12px"><svg viewBox="0 0 640 ${h}" style="width:100%;min-width:480px;height:auto;display:block" role="img" aria-label="${esc(cap)}">${body}</svg></div>${cap ? `<figcaption class="xs dim" style="margin-top:8px">${esc(cap)}</figcaption>` : ""}</figure>`;
  switch (k) {
    case "office": return wrap(`${[0, 1, 2, 3].map(i => B(20 + i * 100, 150, 84, 46, ["Laptop", "Laptop", "Printer", "Phone"][i], ["Wired", "Wired", "Wired", "Wi-Fi"][i])).join("")}${[0, 1, 2].map(i => L(62 + i * 100, 150, 250, 106)).join("")}${L(362, 150, 330, 96, "#22D3EE")}${B(200, 60, 100, 46, "Switch", "Layer 2", "#22D3EE")}${B(300, 50, 70, 46, "AP", "Wi-Fi", "#22D3EE")}${L(300, 83, 420, 83)}${B(420, 60, 90, 46, "Router", "gateway", "#8B5CF6")}${L(510, 83, 560, 83)}${B(560, 60, 70, 46, "ISP", "internet", "#94A3B8")}`, 220, "A small-office network: end devices connect to a switch or access point; the router links the LAN to the internet provider.");
    case "osi": return wrap(OSI.map((l, i) => `<rect x="120" y="${10 + i * 28}" width="400" height="24" rx="6" fill="${["#8B5CF6", "#8B5CF6", "#8B5CF6", "#3B82F6", "#3B82F6", "#22D3EE", "#22D3EE"][i]}" fill-opacity=".14" stroke="${["#8B5CF6", "#8B5CF6", "#8B5CF6", "#3B82F6", "#3B82F6", "#22D3EE", "#22D3EE"][i]}" stroke-opacity=".5"/>${T(140, 26 + i * 28, "L" + l.n, "#22D3EE", 11, "start", "JetBrains Mono,monospace")}${T(180, 26 + i * 28, l.name, "#F8FAFC", 12, "start")}${T(500, 26 + i * 28, l.pdu, "#94A3B8", 10, "end", "JetBrains Mono,monospace")}`).join("") + T(60, 110, "send ↓", "#94A3B8", 11) + T(580, 110, "↑ receive", "#94A3B8", 11), 210, "The seven OSI layers with the data unit at each layer.");
    case "subnet": return wrap(`${T(20, 30, "192.168.10.0/24 split into four /26 subnets", "#94A3B8", 12, "start")}${[0, 1, 2, 3].map(i => `<rect x="${20 + i * 152}" y="50" width="144" height="90" rx="10" fill="${i === 1 ? "rgba(34,211,238,.14)" : "#101625"}" stroke="${i === 1 ? "#22D3EE" : "#3B82F6"}" stroke-opacity=".7"/>${T(92 + i * 152, 76, ".%d – .%d".replace("%d", i * 64).replace("%d", i * 64 + 63), "#F8FAFC", 13, "middle", "JetBrains Mono,monospace")}${T(92 + i * 152, 98, "net ." + i * 64, "#94A3B8", 10, "middle", "JetBrains Mono,monospace")}${T(92 + i * 152, 114, "bcast ." + (i * 64 + 63), "#94A3B8", 10, "middle", "JetBrains Mono,monospace")}${T(92 + i * 152, 130, "62 hosts", "#22D3EE", 10, "middle", "JetBrains Mono,monospace")}`).join("")}${T(20, 170, "192.168.10.77 falls in the second block → network .64, broadcast .127", "#22D3EE", 12, "start")}`, 190, "A /24 divided into four /26 blocks of 64 addresses each.");
    case "cloud": case "vpc": return wrap(`<rect x="20" y="20" width="600" height="180" rx="14" fill="none" stroke="#22D3EE" stroke-dasharray="5 4" stroke-opacity=".6"/>${T(36, 40, "VPC 10.20.0.0/16", "#22D3EE", 11, "start", "JetBrains Mono,monospace")}${[0, 1].map(z => `<rect x="${40 + z * 295}" y="54" width="275" height="56" rx="10" fill="rgba(59,130,246,.1)" stroke="#3B82F6" stroke-opacity=".5"/>${T(52 + z * 295, 72, "public · AZ-" + "ab"[z] + " · 10.20." + (z + 1) + ".0/24", "#93C5FD", 10, "start", "JetBrains Mono,monospace")}${T(177 + z * 295, 96, "Load balancer" + (z ? " node" : "") + " · NAT", "#F8FAFC", 12)}<rect x="${40 + z * 295}" y="124" width="275" height="60" rx="10" fill="rgba(139,92,246,.1)" stroke="#8B5CF6" stroke-opacity=".5"/>${T(52 + z * 295, 142, "private · AZ-" + "ab"[z] + " · 10.20.1" + (z + 1) + ".0/24", "#C4B5FD", 10, "start", "JetBrains Mono,monospace")}${T(177 + z * 295, 168, "App server" + (z ? " B" : " A") + (z ? "" : " · Database"), "#F8FAFC", 12)}`).join("")}`, 210, "A two-zone VPC with public subnets for internet-facing components and private subnets for application and data tiers.");
    case "shared": return wrap(["Data & access", "Applications", "Operating system", "Virtualisation", "Physical hosts & network", "Facilities"].map((r, i) => `${T(20, 32 + i * 30, esc(r), "#F8FAFC", 12, "start")}${[0, 1, 2].map(m => { const cust = [[1, 1, 1], [1, 1, 0], [1, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]][i][m]; return `<rect x="${230 + m * 135}" y="${16 + i * 30}" width="125" height="24" rx="6" fill="${cust ? "rgba(34,211,238,.18)" : "rgba(148,163,184,.08)"}" stroke="${cust ? "#22D3EE" : "#475569"}" stroke-opacity=".6"/>${T(292 + m * 135, 32 + i * 30, cust ? "customer" : "provider", cust ? "#22D3EE" : "#94A3B8", 10, "middle", "JetBrains Mono,monospace")}`; }).join("")}`).join("") + ["IaaS", "PaaS", "SaaS"].map((m, i) => T(292 + i * 135, 205, m, "#F8FAFC", 12)).join(""), 215, "Shared responsibility by service model. Simplified: in SaaS the customer still manages user access settings.");
    case "cia": return wrap(`<polygon points="320,20 520,190 120,190" fill="rgba(139,92,246,.08)" stroke="#8B5CF6" stroke-opacity=".7"/>${B(255, 4, 130, 40, "Confidentiality", "encryption · access", "#22D3EE")}${B(50, 170, 140, 40, "Integrity", "hashes · signatures", "#3B82F6")}${B(450, 170, 140, 40, "Availability", "backups · redundancy", "#8B5CF6")}${T(320, 130, "Protected asset", "#94A3B8", 12)}`, 215, "The CIA triad and example controls for each property.");
    case "roe": return wrap(["Written authorization", "Scope defined", "Rules of engagement", "Test in scope only", "Report & retest"].map((s, i) => `${B(16 + i * 126, 70, 110, 56, s.split(" ")[0], esc(s.split(" ").slice(1).join(" ")) || " ", i === 0 ? "#22C55E" : "#3B82F6")}${i < 4 ? `<path d="M${128 + i * 126} 98 h12" stroke="#22D3EE" stroke-width="2" marker-end="url(#ar)"/>` : ""}`).join("") + `<defs><marker id="ar" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 10 5 0 10z" fill="#22D3EE"/></marker></defs>${T(320, 170, "No written permission → no testing.", "#FCD34D", 13)}`, 200, "The order of an ethical engagement: permission and scope come before any testing.");
    case "inject": return wrap(`${B(20, 40, 170, 60, "User input", "untrusted", "#F43F5E")}${B(235, 40, 170, 60, "Query template", "SELECT … WHERE email = ?", "#22D3EE")}${B(450, 40, 170, 60, "Database", "executes fixed structure", "#22C55E")}${L(190, 70, 235, 70, "#22D3EE")}${L(405, 70, 450, 70, "#22D3EE")}${T(320, 140, "Parameters are bound as values — input can never become SQL code.", "#94A3B8", 12)}`, 170, "Parameterized queries separate the query structure from user-supplied data.");
    default: return "";
  }
}
const labFor = course => ({ networking: ["subnet", "Subnetting calculator"], "cloud-computing": ["cloud", "Cloud architecture builder"], "ethical-hacking": ["report", "Security report writing"] }[course] || ["quiz", "Knowledge quizzes"]);

export default function Lesson() {
  const { course, lesson } = useParams();
  const c = findCourse(course), l = findLesson(c, lesson);
  if (!c || !l) return <NotFound />;
  return <LessonView key={l.key} c={c} l={l} />;
}

function LessonView({ c, l }) {
  const { user, toast, refresh } = useApp();
  const navigate = useNavigate();
  usePageMeta(`${l.title} — ${c.title}`, `${c.title}, module ${l.module + 1}: ${l.title}.`);
  const m = c.modules[l.module], idx = c.lessons.indexOf(l), prev = c.lessons[idx - 1], next = c.lessons[idx + 1];
  const p = prog(user), done = !!p.done[l.key], bm = p.bookmarks.includes(l.key), A = LESSONS[l.key];
  const [labId, labName] = labFor(c.slug);
  const here = `/learn/${c.slug}/${l.id}`;
  const quiz = useMemo(() => A ? A.quiz : [m.check], [A, m]);

  useEffect(() => { if (user) { const pp = prog(user); pp.last = { course: c.slug, lesson: l.id }; saveProg(user, pp); } }, [user, c.slug, l.id]);

  const onQuiz = useCallback((s, t) => { if (!user) return; const pp = prog(user); pp.quiz.push({ key: l.key, score: s, total: t, ts: Date.now() }); touch(user, pp); saveProg(user, pp); }, [user, l.key]);
  const toggleDone = () => {
    if (!user) { toast("Sign in to track progress.", "info"); navigate("/login?next=" + encodeURIComponent(here)); return; }
    const pp = prog(user);
    if (pp.done[l.key]) delete pp.done[l.key]; else { pp.done[l.key] = Date.now(); if (!pp.enrolled.includes(c.slug)) pp.enrolled.push(c.slug); }
    touch(user, pp); saveProg(user, pp);
    if (pp.done[l.key] && next) { toast("Lesson complete. On to the next one."); navigate(`/learn/${c.slug}/${next.id}`); }
    else { toast(pp.done[l.key] ? "Lesson complete." : "Marked as not done.", pp.done[l.key] ? "ok" : "info"); refresh(); }
  };
  const toggleBm = () => {
    if (!user) { toast("Sign in to bookmark lessons.", "info"); return; }
    const pp = prog(user), i = pp.bookmarks.indexOf(l.key);
    i >= 0 ? pp.bookmarks.splice(i, 1) : pp.bookmarks.push(l.key);
    saveProg(user, pp); toast(i >= 0 ? "Bookmark removed." : "Lesson bookmarked."); refresh();
  };
  const QuizBox = <div className="card"><Quiz qs={quiz} onDone={onQuiz} /></div>;

  let body;
  if (A) body = <>
    <div className="callout"><h4>1 · What it means</h4><Html as="p" html={A.what} /></div>
    <h2>Why it matters</h2><Html as="p" html={A.why} />
    <h2>Explanation</h2><Html html={A.body} />
    <h2>Practical example</h2><div className="callout ok"><h4>Example</h4><Html as="p" html={A.example} /></div>
    {A.diagram && <><h2>Diagram</h2><Html html={diagram(A.diagram)} /></>}
    <h2>Guided exercise</h2><div className="callout"><h4>Try it</h4><Html as="p" html={A.exercise} /></div>
    <h2>Knowledge check</h2>{QuizBox}
    <h2>Common mistakes</h2><ul>{A.mistakes.map((x, i) => <Html as="li" key={i} html={x} />)}</ul>
    <h2>Summary</h2><div className="callout ok"><h4>Key takeaway</h4><Html as="p" html={A.summary} /></div>
    <h3>Further reading</h3><ul>{A.further.map((x, i) => <Html as="li" key={i} html={x} />)}</ul>
  </>;
  else if (l.custom) body = <>
    <span className="demo-flag">Lesson added in admin</span>
    {(l.body || "").split(/\n{2,}/).map((pp, i) => <p key={i} style={{ whiteSpace: "pre-line" }}>{pp}</p>)}
    <h2>Module check</h2>{QuizBox}
  </>;
  else body = <>
    <div className="alert alert-info"><Icon name="info" /><div><strong>Outline lesson.</strong> The full nine-part write-up for this topic is being authored. Use this outline, the module check and the linked lab to study it now.</div></div>
    <h2>Where this fits</h2><p>This lesson is part of <strong>Module {l.module + 1}: {m.title}</strong>. {m.summary}</p>
    <h2>Lessons in this module</h2><ol>{m.lessons.filter(x => x.status === "published").map(x => <li key={x.key}>{x.key === l.key ? <><strong>{x.title}</strong> ← you are here</> : x.title}</li>)}</ol>
    <h2>Key terms to learn</h2><div className="terms">{m.terms.map(t => <span key={t} className="chip chip-blue">{t}</span>)}</div>
    <p className="small muted">Write a one-sentence definition of each term in your own words, then check it against a trusted reference such as vendor documentation or the RFC.</p>
    <h2>Guided practice</h2><div className="callout"><h4>Lab</h4><p>Reinforce this module in the <Link to={"/labs?t=" + labId}>{labName}</Link>.</p></div>
    <h2>Module check</h2>{QuizBox}
  </>;

  const doneCount = c.lessons.filter(x => p.done[x.key]).length;
  return (
    <div className="wrap app-shell">
      <SideNav id="lessonNav" kicker={"Course contents · Module " + (l.module + 1)} label={`${doneCount} of ${c.lessons.length} lessons done`} icon="list" as="aside" className="side lesson-side" ariaLabel="Course contents">
        <Link to={c.route}><Icon name="left" />{c.title}</Link>
        {c.modules.map((mm, mi) => {
          const pub = mm.lessons.filter(x => x.status === "published");
          return (
            <Fragment key={mi}>
              <div className="side-h">Module {mi + 1}</div>
              {mi === l.module ? pub.map(x => (
                <Link key={x.key} to={`/learn/${c.slug}/${x.id}`} className={x.key === l.key ? "active" : ""} aria-current={x.key === l.key ? "page" : undefined}>
                  {p.done[x.key] ? <Icon name="check" className="icon done" style={{ width: 15, height: 15, flex: "none", marginTop: 2 }} /> : <span className="mono xs dim" style={{ minWidth: 15 }}>·</span>}<span>{x.title}</span>
                </Link>
              )) : <Link to={`/learn/${c.slug}/${(pub[0] || {}).id || ""}`}><span>{mm.title}</span></Link>}
            </Fragment>);
        })}
      </SideNav>
      <article style={{ minWidth: 0 }}>
        <Crumbs list={[["Courses", "/courses"], [c.title, c.route], ["Module " + (l.module + 1), c.route + "?m=" + (l.module + 1)], [l.title, ""]]} />
        <div className="row between" style={{ alignItems: "flex-start" }}>
          <div><span className="eyebrow">Module {l.module + 1} · Lesson {m.lessons.indexOf(l) + 1}</span>
            <h1 style={{ fontSize: "clamp(1.8rem,3.6vw,2.6rem)", marginTop: 12, maxWidth: "24ch" }}>{l.title}</h1>
            <p className="small muted" style={{ marginTop: 10 }}><Icon name="clock" style={{ width: 14, height: 14, verticalAlign: -2 }} /> ≈{l.minutes} min (estimate) {A && <>· <span className="chip chip-ok" style={{ height: 20, fontSize: 10 }}>Full lesson</span></>}</p></div>
          <div className="row"><button className="btn btn-ghost btn-sm" type="button" aria-pressed={bm} onClick={toggleBm}><Icon name="bookmark" />{bm ? "Bookmarked" : "Bookmark"}</button></div>
        </div>
        {!user && <div className="alert alert-info" style={{ marginTop: 20 }}><Icon name="info" /><span>You're previewing this lesson. <Link to={"/login?next=" + encodeURIComponent(here)}>Sign in</Link> to track progress, bookmarks and quiz results.</span></div>}
        {c.rules && <div className="alert alert-warn" style={{ marginTop: 20 }}><Icon name="shield" /><span>Practise only on systems you own or are authorized to test, in an isolated lab.</span></div>}
        <div className="prose" style={{ marginTop: 28 }}>{body}</div>
        <hr className="rule" style={{ margin: "40px 0 24px" }} />
        <div className="row between">
          <button className={`btn ${done ? "btn-ghost" : "btn-primary"}`} type="button" onClick={toggleDone}><Icon name="check" />{done ? "Completed — mark as not done" : "Mark lesson complete"}</button>
          <span className="small muted">{idx + 1} of {c.lessons.length} lessons</span>
        </div>
        <nav className="grid g2" style={{ marginTop: 24 }} aria-label="Lesson navigation">
          {prev ? <Link className="card card-link" to={`/learn/${c.slug}/${prev.id}`} style={{ color: "var(--text)", textDecoration: "none" }}><span className="xs dim mono">← PREVIOUS</span><div style={{ marginTop: 6, fontWeight: 600 }}>{prev.title}</div></Link>
            : <Link className="card card-link" to={c.route} style={{ color: "var(--text)", textDecoration: "none" }}><span className="xs dim mono">← BACK</span><div style={{ marginTop: 6, fontWeight: 600 }}>Course overview</div></Link>}
          {next ? <Link className="card card-link" to={`/learn/${c.slug}/${next.id}`} style={{ color: "var(--text)", textDecoration: "none", textAlign: "right" }}><span className="xs dim mono">NEXT →</span><div style={{ marginTop: 6, fontWeight: 600 }}>{next.title}</div></Link>
            : <Link className="card card-link" to="/dashboard/progress" style={{ color: "var(--text)", textDecoration: "none", textAlign: "right" }}><span className="xs dim mono">FINISHED →</span><div style={{ marginTop: 6, fontWeight: 600 }}>View your progress</div></Link>}
        </nav>
      </article>
    </div>
  );
}
