import { Link } from "react-router-dom";
import { Icon } from "../components/Icon.jsx";
import { PageHead, usePageMeta } from "../components/ui.jsx";
import { findCourse, PATHS } from "../lib/data.js";

const STEPS = [["01", "IT Fundamentals", "Self-check your basics."], ["02", "Networking", "Core of every path."], ["03", "Cloud Infrastructure", "For the cloud path."], ["04", "Security Fundamentals", "For the security path."], ["05", "Practical Projects", "Every path ends here."]];

export default function LearningPaths() {
  usePageMeta("Learning Paths", "Three recommended learning paths: Network Administrator, Cloud Network Engineer, and Security Analyst & Pentester.");
  return (
    <>
      <PageHead eyebrow="Learning paths" title="Three routes through the curriculum." lead="Each path sequences modules, labs and a project toward one kind of role. Paths describe skills practised — they are not job guarantees." crumbs={[["Home", "/"], ["Learning paths", ""]]} />
      <section className="section-tight"><div className="wrap">
        <div className="roadmap" style={{ marginBottom: 56 }}>{STEPS.map(([n, t, d]) => <div className="rm-step" key={n}><div className="node">{n}</div><h4>{t}</h4><p>{d}</p></div>)}</div>
        <div className="grid g3">{PATHS.map(p => {
          const cs = p.courses.map(findCourse).filter(Boolean);
          return (
            <div className="card stack reveal" key={p.title}><span className="icon-box"><Icon name={p.icon} /></span><h3>{p.title}</h3><p className="small muted">{p.for}</p>
              <ol className="step-log" style={{ counterReset: "s" }}>{p.steps.map((s, i) => <li key={i}><span className="mono xs" style={{ color: "var(--cyan)" }}>{String(i + 1).padStart(2, "0")}</span>&nbsp; {s}</li>)}</ol>
              <div className="xs mono dim">COURSES</div>
              <div className="row">{cs.map(c => <Link key={c.slug} className="chip chip-cyan" to={c.route}>{c.title}</Link>)}</div>
              <div className="small muted">Estimated total: ≈{cs.reduce((a, c) => a + c.hours, 0)} hours</div>
            </div>);
        })}</div>
      </div></section>
    </>
  );
}
