import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Icon } from "../components/Icon.jsx";
import { Html, PageHead, usePageMeta } from "../components/ui.jsx";
import { RESOURCES } from "../lib/data.js";

const TABS = ["All", "networking", "cloud", "security", "linux"];

export default function Resources() {
  usePageMeta("Resources & Tutorials", "Cheat sheets and guides: common ports, subnet reference, Linux commands, troubleshooting, CVSS and avoiding cloud charges.");
  const [params] = useSearchParams();
  const sel = params.get("r");
  const [tab, setTab] = useState("All");
  useEffect(() => { if (sel) setTimeout(() => document.getElementById("res-" + sel)?.scrollIntoView({ block: "center" }), 50); }, [sel]);
  return (
    <>
      <PageHead eyebrow="Resources & tutorials" title="Reference material you'll come back to." lead="Cheat sheets and short guides written for MND CODE learners." crumbs={[["Home", "/"], ["Resources", ""]]} />
      <section className="section-tight" style={{ paddingBottom: "clamp(56px,8vw,104px)" }}><div className="wrap">
        <div className="tab-row" style={{ marginBottom: 20 }}>{TABS.map(t => <button key={t} type="button" aria-pressed={tab === t} onClick={() => setTab(t)}>{t[0].toUpperCase() + t.slice(1)}</button>)}</div>
        <div className="acc">{RESOURCES.map(r => (
          <details key={r.id} id={"res-" + r.id} open={sel === r.id || undefined} hidden={!(tab === "All" || r.tags.includes(tab))}>
            <summary><span><span className="chip" style={{ marginRight: 10 }}>{r.type}</span>{r.title}</span><Icon name="chev" className="icon chev" /></summary>
            <Html className="acc-body" html={r.html} />
          </details>
        ))}</div>
        <div className="grid g2" style={{ marginTop: 32 }}>
          <Link className="card card-link" to="/blog" style={{ color: "var(--text)", textDecoration: "none" }}><span className="icon-box"><Icon name="file" /></span><h4 style={{ margin: "12px 0 6px" }}>Read the blog</h4><p className="small muted">Longer tutorials and explainers.</p></Link>
          <Link className="card card-link" to="/labs" style={{ color: "var(--text)", textDecoration: "none" }}><span className="icon-box"><Icon name="flask" /></span><h4 style={{ margin: "12px 0 6px" }}>Practise in the lab</h4><p className="small muted">Ten interactive exercises.</p></Link>
        </div>
      </div></section>
    </>
  );
}
