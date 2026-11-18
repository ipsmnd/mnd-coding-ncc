/* Project guide pages: checklist, guided projects and tools, with progress saved in this browser. */
import { Fragment, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Icon } from "../components/Icon.jsx";
import { PageHead, Progress, usePageMeta } from "../components/ui.jsx";
import { findCourse, PROJECT_GUIDES } from "../lib/data.js";
import { store } from "../lib/config.js";
import { NotFound } from "./System.jsx";

const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
/* inline `code` and **bold** in guide text */
const gHtml = s => esc(s).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
const G = ({ text, as: Tag = "span", ...rest }) => <Tag {...rest} dangerouslySetInnerHTML={{ __html: gHtml(text) }} />;
const LVL = { Beginner: "chip-ok", Intermediate: "chip-blue", Advanced: "chip-purple" };

function GuideTable({ t }) {
  return <div className="table-wrap"><table><thead><tr>{t.head.map(h => <th key={h}>{h}</th>)}</tr></thead>
    <tbody>{t.rows.map((r, i) => <tr key={i}>{r.map((c, j) => <G as="td" key={j} text={c} />)}</tr>)}</tbody></table></div>;
}
function GuideBlock({ b, id }) {
  return (
    <section className="card stack guide-block" style={{ gap: 14 }} id={id}><h3>{b.title}</h3>
      {b.text && <G as="p" className="muted" text={b.text} />}
      {b.facts && <dl className="guide-facts">{b.facts.map(([k, v]) => <Fragment key={k}><dt>{k}</dt><G as="dd" text={v} /></Fragment>)}</dl>}
      {b.items && <ul className="outcomes">{b.items.map((it, i) => <li key={i}><Icon name="check" /><G text={it} /></li>)}</ul>}
      {b.table && <GuideTable t={b.table} />}
    </section>
  );
}
const jump = id => e => { e.preventDefault(); document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }); };

export default function ProjectGuide() {
  const { slug } = useParams();
  const g = PROJECT_GUIDES.find(x => x.slug === slug);
  if (!g) return <NotFound />;
  return <Guide key={g.slug} g={g} />;
}

function Guide({ g }) {
  usePageMeta(g.short || g.title, g.lead);
  const key = "guide:" + g.slug;
  const [saved, setSaved] = useState(() => store.get(key, {}));
  const save = s => { store.set(key, s); setSaved(s); };
  const toggle = k => { const s = { ...saved }; s[k] ? delete s[k] : s[k] = 1; save(s); };
  const c = findCourse(g.course);
  const start = g.startAt ?? 1, unit = g.unit || "Project";
  const ck = g.checklist, ckTotal = ck ? ck.groups.reduce((n, s) => n + s.items.length, 0) : 0;
  const ckDone = ck ? ck.groups.reduce((n, s, si) => n + s.items.filter((_, ii) => saved[`${si}-${ii}`]).length, 0) : 0;
  const projDone = g.projects.filter((_, i) => saved["done-" + i]).length;
  const pid = i => `guide-p${i}`;
  const toc = [
    ...(g.overview || []).map((b, i) => [`guide-o${i}`, b.title]),
    ...(ck && !g.checklistAfter ? [["guide-checklist", ck.title]] : []),
    ...g.projects.map((p, i) => [pid(i), `${unit} ${i + start}: ${p.title}`]),
    ...(g.capstone ? [["guide-capstone", g.capstone.title.replace(/:.*/, "")]] : []),
    ...(ck && g.checklistAfter ? [["guide-checklist", ck.title]] : []),
    ...(g.after || []).map((b, i) => [`guide-a${i}`, b.title]),
    ["guide-tools", "Tools"]
  ];
  const gi = PROJECT_GUIDES.indexOf(g), nextG = PROJECT_GUIDES[(gi + 1) % PROJECT_GUIDES.length];

  const checklist = ck && (
    <section id="guide-checklist" className="stack" style={{ gap: 18 }}>
      <div className="row between"><h2>{ck.title}</h2>
        <button type="button" className="btn btn-quiet btn-sm" onClick={() => { const s = {}; Object.keys(saved).filter(k => k.startsWith("done-")).forEach(k => { s[k] = saved[k]; }); save(s); }}><Icon name="reset" />Clear ticks</button></div>
      <div className="card stack" style={{ gap: 10, padding: 18 }}>
        <div className="row between small"><span>Checklist progress</span><span className="mono">{ckDone}/{ckTotal}</span></div>
        <Progress value={ckDone / ckTotal * 100} /><p className="xs dim">{ck.intro || ""} Saved in this browser.</p></div>
      <div className={`grid ${ck.groups.length > 1 ? "g2" : ""}`}>{ck.groups.map((s, si) => (
        <div className="card stack" style={{ gap: 12 }} key={si}>
          <div className="row"><span className="icon-box"><Icon name={s.icon || "check"} /></span><h3 style={{ fontSize: "var(--t-md)" }}>{s.title}</h3></div>
          <ul className={`guide-checks ${s.items.length > 6 ? "cols" : ""}`}>{s.items.map((it, ii) => (
            <li key={ii}><label><input type="checkbox" checked={!!saved[`${si}-${ii}`]} onChange={() => toggle(`${si}-${ii}`)} /><G text={it} /></label></li>
          ))}</ul>
        </div>))}</div>
    </section>
  );

  return (
    <>
      <PageHead eyebrow="Project guide" title={g.title} lead={g.lead} crumbs={[["Home", "/"], ["Projects", "/projects"], [g.short || g.title, ""]]}>
        <div className="row" style={{ marginTop: 22 }}>
          <a className="btn btn-primary" href={encodeURI(g.pdf)} download><Icon name="file" />Download PDF</a>
          <a className="btn btn-ghost" href={"#" + pid(0)} onClick={jump(pid(0))}><Icon name="layers" />Jump to the {g.projects.length} {unit.toLowerCase()}s</a>
        </div>
        <div className="row" style={{ marginTop: 18 }}>
          {c && <Link className="chip chip-cyan" to={c.route}>{c.title}</Link>}
          <span className="chip">{g.projects.length} {unit.toLowerCase()}s</span>
          {ck && <span className="chip">{ckTotal}-point checklist</span>}
          {g.level && <span className="chip">{g.level}</span>}
          {g.time && <span className="chip"><Icon name="clock" style={{ width: 12, height: 12 }} />{g.time}</span>}
        </div>
      </PageHead>
      <section className="section-tight"><div className="wrap guide-layout">
        <aside className="guide-toc card" aria-label="On this page">
          <span className="xs dim mono">ON THIS PAGE</span>
          {toc.map(([id, t]) => <a key={id} href={"#" + id} onClick={jump(id)}>{t}</a>)}
          <div className="guide-toc-prog"><div className="row between xs"><span className="dim">{unit}s done</span><span className="mono">{projDone}/{g.projects.length}</span></div><Progress style={{ height: 6 }} value={projDone / g.projects.length * 100} /></div>
        </aside>
        <div className="stack" style={{ gap: 32, minWidth: 0 }}>
          {g.warn && <div className="alert alert-warn"><Icon name="shield" /><G as="div" text={g.warn} /></div>}
          {(g.overview || []).map((b, i) => <GuideBlock key={i} b={b} id={`guide-o${i}`} />)}
          {!g.checklistAfter && checklist}
          <section className="stack" style={{ gap: 18 }}>
            <div><h2>{unit === "Phase" ? "Phases and deliverables" : "Guided projects"}</h2><p className="lead" style={{ marginTop: 10 }}>Work through them in order. Tick <strong>Mark as done</strong> on each card as you finish — your progress is saved in this browser.</p></div>
            {g.projects.map((p, i) => (
              <article className={`card guide-project${saved["done-" + i] ? " is-done" : ""}`} id={pid(i)} key={i}>
                <div className="row between">
                  <div className="row"><span className="mod-num mono">{String(i + start).padStart(2, "0")}</span><div><span className="xs dim mono">{unit.toUpperCase()} {i + start}</span><h3>{p.title}</h3></div></div>
                  <div className="row" style={{ gap: 6 }}>{p.when && <span className="chip"><Icon name="clock" style={{ width: 12, height: 12 }} />{p.when}</span>}{p.level && <span className={`chip ${LVL[p.level] || ""}`}>{p.level}</span>}</div>
                </div>
                {p.target && <p><strong>Target:</strong> <G className="muted" text={p.target} /></p>}
                {p.goal && <p><strong>Goal:</strong> <G className="muted" text={p.goal} /></p>}
                <div className={`guide-cols ${p.steps ? "" : "one"}`}>
                  {p.steps && <div><div className="xs dim mono" style={{ marginBottom: 10 }}>{(p.stepsLabel || "Steps").toUpperCase()}</div><ol className="guide-steps">{p.steps.map((s, k) => <G as="li" key={k} text={s} />)}</ol></div>}
                  <div><div className="xs dim mono" style={{ marginBottom: 10 }}>{(p.deliverLabel || (p.deliver.length > 1 ? "Deliverables" : "Deliverable")).toUpperCase()}</div>
                    <ul className="outcomes">{p.deliver.map((d, k) => <li key={k}><Icon name="check" /><G text={d} /></li>)}</ul></div>
                </div>
                {p.table && <div className="stack" style={{ gap: 8 }}>{p.table.caption && <div className="xs dim mono">{p.table.caption.toUpperCase()}</div>}<GuideTable t={p.table} /></div>}
                <label className="guide-done"><input type="checkbox" checked={!!saved["done-" + i]} onChange={() => toggle("done-" + i)} /><span>Mark as done</span></label>
              </article>
            ))}
          </section>
          {g.capstone && <section id="guide-capstone" className="callout ok"><h4>{g.capstone.title}</h4>{g.capstone.text && <G as="p" className="small" text={g.capstone.text} />}
            {g.capstone.items && <ul className="outcomes" style={{ marginTop: 12 }}>{g.capstone.items.map((it, k) => <li key={k}><Icon name="check" /><G text={it} /></li>)}</ul>}</section>}
          {g.checklistAfter && checklist}
          {(g.after || []).map((b, i) => <GuideBlock key={i} b={b} id={`guide-a${i}`} />)}
          <section id="guide-tools" className="stack" style={{ gap: 14 }}><h3>Tools you'll use</h3>
            <div className="row" style={{ gap: 8 }}>{g.tools.map(t => <span key={t} className="chip chip-blue mono">{t}</span>)}</div>
            {g.note && <div className="alert alert-info"><Icon name="info" /><G as="div" text={g.note} /></div>}
            {!g.warn && <div className="alert alert-warn"><Icon name="shield" /><div>Practise only in a lab you own or are explicitly authorised to use. Snapshot or back up before each {unit.toLowerCase()} so you can roll back.</div></div>}
          </section>
          <div className="row"><Link className="btn btn-ghost" to="/projects"><Icon name="left" />All projects</Link>
            {nextG !== g && <Link className="btn btn-ghost" to={"/projects/" + nextG.slug}>Next guide: {nextG.short || nextG.title}<Icon name="arrow" /></Link>}</div>
        </div>
      </div></section>
    </>
  );
}
