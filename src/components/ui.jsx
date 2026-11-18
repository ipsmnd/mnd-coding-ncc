/* ============================================================
   SHARED UI COMPONENTS
   ============================================================ */
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Icon } from "./Icon.jsx";
import { useApp } from "./AppContext.jsx";
import { DEFAULT_TITLE, store } from "../lib/config.js";
import { findCourse } from "../lib/data.js";

/* Trusted, static HTML from the course content files */
export function Html({ html, as: Tag = "div", ...rest }) {
  return <Tag {...rest} dangerouslySetInnerHTML={{ __html: html || "" }} />;
}

/* Sets the document title and meta description for a page */
export function usePageMeta(title, desc) {
  const { pathname } = useLocation();
  useEffect(() => {
    document.title = title ? `${title} · MND CODE` : DEFAULT_TITLE;
    const md = document.querySelector('meta[name="description"]');
    if (md && desc) md.setAttribute("content", desc);
    if (pathname === "/") {
      const seo = store.get("admin:seo", null);
      if (seo) { if (seo.title) document.title = seo.title; if (md && seo.description) md.setAttribute("content", seo.description); }
    }
  }, [title, desc, pathname]);
}

/* Matches a CSS media query and re-renders when it changes */
export function useMedia(query) {
  const [on, setOn] = useState(() => typeof matchMedia !== "undefined" && matchMedia(query).matches);
  useEffect(() => {
    const mq = matchMedia(query), f = () => setOn(mq.matches);
    f(); mq.addEventListener("change", f);
    return () => mq.removeEventListener("change", f);
  }, [query]);
  return on;
}

export function Crumbs({ list }) {
  return (
    <nav aria-label="Breadcrumb"><ol className="crumbs">
      {list.map(([t, h], i) => (
        <li key={i}>{h && i < list.length - 1 ? <Link to={h}>{t}</Link> : <span aria-current="page">{t}</span>}</li>
      ))}
    </ol></nav>
  );
}

export function PageHead({ eyebrow, title, lead, crumbs, children }) {
  return (
    <section className="page-head">
      <div className="glow-orb" style={{ background: "var(--blue)", top: -200, right: -120 }} />
      <div className="wrap" style={{ position: "relative" }}>
        {crumbs && <Crumbs list={crumbs} />}
        <span className="eyebrow">{eyebrow}</span>
        <h1 style={{ marginTop: 14 }}>{title}</h1>
        {lead && <p className="lead">{lead}</p>}
        {children}
      </div>
    </section>
  );
}

export const LevelChip = ({ level }) => (
  <span className={`chip ${level === "Beginner" ? "chip-ok" : level === "Intermediate" ? "chip-blue" : "chip-purple"}`}>{level}</span>
);

export function Empty({ icon = "search", title, children }) {
  return <div className="empty"><Icon name={icon} /><strong>{title}</strong>{children}</div>;
}

export function Alert({ kind = "info", icon, children, style }) {
  return <div className={`alert alert-${kind}`} style={style}><Icon name={icon || (kind === "ok" ? "check" : kind === "bad" ? "alert" : kind === "warn" ? "shield" : "info")} /><div>{children}</div></div>;
}

export const Outcomes = ({ items, icon = "check", style }) => (
  <ul className="outcomes" style={style}>{items.map((o, i) => <li key={i}><Icon name={icon} />{o}</li>)}</ul>
);

export const Progress = ({ value, style, barStyle }) => (
  <div className="progress" style={style}><i style={{ width: `${Math.max(0, Math.min(100, value))}%`, ...barStyle }} /></div>
);

export const Spinner = () => <span className="spinner" />;

/* ---------- course artwork (generated SVG) ---------- */
function courseArtSvg(slug, accent = "#3B82F6") {
  const id = "ca" + String(slug).replace(/\W/g, "");
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
    return `<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${grid}<path d="M200 28c20 14 38 18 52 18v42c0 30-24 46-52 56-28-10-52-26-52-56V46c14 0 32-4 52-18z" fill="#101625" stroke="${accent}" stroke-width="1.8"/><path d="m182 90 12 12 26-26" fill="none" stroke="#22C55E" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>${[0, 1, 2, 3, 4].map(i => `<text x="24" y="${42 + i * 24}" fill="#94A3B8" fill-opacity=".55" font-family="JetBrains Mono,monospace" font-size="9">${["scope: lab-only", "auth: written ✓", "finding: F-03", "cvss: 6.5", "status: fixed"][i]}</text>`).join("")}<rect x="0" y="0" width="400" height="2" fill="${accent}" opacity=".6"><animate attributeName="y" values="10;170;10" dur="5s" repeatCount="indefinite"/></rect></svg>`;
  }
  return `<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${grid}<circle cx="200" cy="90" r="34" fill="none" stroke="${accent}"/><circle cx="200" cy="90" r="6" fill="${accent}"/></svg>`;
}
export const CourseArt = ({ slug, accent }) => <span style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: courseArtSvg(slug, accent) }} />;

export function CourseCard({ c, big = false }) {
  return (
    <Link className="card card-link course-card reveal" to={c.route}>
      <div className="course-art"><CourseArt slug={c.slug} accent={c.accent} />
        <span className="chip chip-cyan" style={{ position: "absolute", top: 14, left: 14, background: "rgba(7,10,18,.75)" }}>{c.category}</span></div>
      <div className="course-body">
        <div className="row"><LevelChip level={c.level} /></div>
        <h3>{c.title}</h3><p>{c.short}</p>
        <div className="facts"><div><b>{c.modules.length}</b>modules</div><div><b>{c.lessons.length}</b>lessons</div><div><b>≈{c.hours} h</b>estimate</div></div>
        {big && <Outcomes items={c.outcomes || []} />}
        <span className="course-foot">View course <Icon name="arrow" style={{ width: 18, height: 18 }} /></span>
      </div>
    </Link>
  );
}

export function ProjectCard({ p }) {
  const { user } = useApp();
  const c = findCourse(p.course);
  return (
    <div className="card reveal stack" style={{ gap: 12 }}>
      <div className="row between"><span className="icon-box"><Icon name={p.icon} /></span><span className="demo-flag">Sample project</span></div>
      <h4>{p.title}</h4><p className="small muted">{p.brief}</p>
      <div className="row"><LevelChip level={p.level} />{c && <Link className="chip" to={c.route}>{c.title}</Link>}</div>
      <div className="xs dim mono" style={{ marginTop: 4 }}>DELIVERABLES</div>
      <Outcomes items={p.deliver} />
      {!user ? (
        <div className="row" style={{ marginTop: "auto", paddingTop: 6 }}><Link className="btn btn-ghost btn-sm" to={"/login?next=" + encodeURIComponent(p.guide ? "/projects/" + p.guide : "/projects")}><Icon name="lock" />Sign in to open the guide</Link></div>
      ) : (p.guide || p.pdf) ? (
        <div className="row" style={{ marginTop: "auto", paddingTop: 6 }}>
          {p.guide && <Link className="btn btn-primary btn-sm" to={"/projects/" + p.guide}><Icon name="book" />Open full guide</Link>}
          {p.pdf && <a className="btn btn-ghost btn-sm" href={encodeURI(p.pdf)} download><Icon name="file" />PDF</a>}
        </div>
      ) : null}
    </div>
  );
}

export function FaqItem({ q, a }) {
  return <details><summary>{q} <Icon name="chev" className="icon chev" /></summary><div className="acc-body"><p>{a}</p></div></details>;
}

/* Collapsible side navigation used by the dashboard, admin and lesson player */
export function SideNav({ id, kicker, label, icon = "menu", className = "side", ariaLabel, as: Tag = "nav", children }) {
  const [open, setOpen] = useState(false);
  const { pathname, search } = useLocation();
  useEffect(() => { setOpen(false); }, [pathname, search]);
  useEffect(() => {
    if (!open) return;
    const k = e => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", k);
    return () => document.removeEventListener("keydown", k);
  }, [open]);
  return (
    <div className="side-wrap">
      <button className="side-toggle" type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen(o => !o)}>
        <span className="row" style={{ gap: 12, flexWrap: "nowrap", minWidth: 0 }}>
          <Icon name={icon} style={{ color: "var(--cyan)" }} />
          <span style={{ minWidth: 0 }}><small>{kicker}</small><span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span></span>
        </span>
        <Icon name="chev" className="icon chev" />
      </button>
      <Tag className={`${className}${open ? " open" : ""}`} id={id} aria-label={ariaLabel}>{children}</Tag>
    </div>
  );
}

export function StatCard({ icon, value, label }) {
  return <div className="card"><div className="row" style={{ flexWrap: "nowrap" }}><span className="icon-box"><Icon name={icon} /></span><div className="stat"><b>{value}</b><span>{label}</span></div></div></div>;
}

/* Multiple-choice quiz: questions are { q, options, answer, why } */
export function Quiz({ qs, onDone }) {
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState(null);
  const [doneFired, setDoneFired] = useState(false);
  useEffect(() => { setI(0); setScore(0); setPicked(null); setDoneFired(false); }, [qs]);
  useEffect(() => {
    if (i >= qs.length && qs.length && !doneFired) { setDoneFired(true); onDone && onDone(score, qs.length); }
  }, [i, qs.length, score, doneFired, onDone]);

  if (!qs.length) return null;
  if (i >= qs.length) {
    const pct = Math.round(score / qs.length * 100);
    return (
      <div className="stack">
        <div className="row between"><h4>Result: {score} / {qs.length}</h4><span className={`chip ${score === qs.length ? "chip-ok" : score >= qs.length / 2 ? "chip-blue" : "chip-warn"}`}>{pct}%</span></div>
        <Progress value={score / qs.length * 100} />
        <p className="small muted">{score === qs.length ? "All correct. Well done." : "Review the explanations above the result, then try again."}</p>
        <div><button className="btn btn-ghost btn-sm" type="button" onClick={() => { setI(0); setScore(0); setPicked(null); setDoneFired(false); }}><Icon name="reset" />Try again</button></div>
      </div>
    );
  }
  const q = qs[i], answered = picked !== null, ok = picked === q.answer;
  return (
    <div className="quiz">
      <div className="row between"><span className="xs mono dim">QUESTION {i + 1} OF {qs.length}</span><span className="xs mono dim">SCORE {score}</span></div>
      <Progress value={i / qs.length * 100} />
      <h4 style={{ fontSize: "var(--t-base)" }} id={"qh" + i}>{q.q}</h4>
      <div className="q-opts" role="group" aria-labelledby={"qh" + i}>
        {q.options.map((o, k) => (
          <button key={k} className={`q-opt${answered && k === q.answer ? " right" : ""}${answered && k === picked && !ok ? " wrong" : ""}`} type="button" disabled={answered}
            onClick={() => { setPicked(k); if (k === q.answer) setScore(s => s + 1); }}>
            <span className="k">{"ABCD"[k]}</span><span>{o}</span>
          </button>
        ))}
      </div>
      <div aria-live="polite">
        {answered && <>
          <div className={`alert ${ok ? "alert-ok" : "alert-bad"}`}><Icon name={ok ? "check" : "alert"} /><div><strong>{ok ? "Correct." : "Not quite."}</strong> {q.why}</div></div>
          <div style={{ marginTop: 12 }}><button className="btn btn-primary btn-sm" type="button" autoFocus onClick={() => { setI(i + 1); setPicked(null); }}>{i + 1 < qs.length ? "Next question" : "See result"} <Icon name="arrow" /></button></div>
        </>}
      </div>
    </div>
  );
}
