import { useState } from "react";
import { Icon } from "../../components/Icon.jsx";
import { useApp } from "../../components/AppContext.jsx";
import { StatCard, usePageMeta } from "../../components/ui.jsx";
import { DEFAULT_TITLE, SITE, fmtDT, store } from "../../lib/config.js";
import { getCourses } from "../../lib/data.js";
import { audit } from "../../lib/auth.js";
import { AdminHead, AdminShell } from "./AdminShell.jsx";

const DEFAULT_DESC = "MND CODE — learn networking, cloud computing, cybersecurity and responsible penetration testing with structured lessons, browser labs and guided projects.";

export function AdminOverview() {
  usePageMeta("Admin Dashboard");
  const { user: u, toast, refresh } = useApp();
  const cs = getCourses(), users = store.get("users", []), msgs = store.get("messages", []), log = store.get("audit", []);
  const ann0 = { ...SITE.announcement, ...store.get("admin:announcement", {}) }, seo0 = store.get("admin:seo", {});
  const [ann, setAnn] = useState({ enabled: !!ann0.enabled, label: ann0.label || "", link: ann0.link || "", text: ann0.text || "", linkText: ann0.linkText || "" });
  const [annErr, setAnnErr] = useState("");
  const [seo, setSeo] = useState({ title: seo0.title || DEFAULT_TITLE, description: seo0.description || DEFAULT_DESC });
  const a = k => e => setAnn({ ...ann, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  const publish = e => {
    e.preventDefault();
    const link = ann.link.trim();
    if (link && !/^\/[\w\-/?=&]*$/.test(link)) return setAnnErr("Link must be an internal path starting with /, e.g. /labs.");
    if (ann.enabled && !ann.text.trim()) return setAnnErr("Add announcement text or turn the bar off.");
    setAnnErr("");
    store.set("admin:announcement", { enabled: ann.enabled, label: ann.label.trim(), text: ann.text.trim(), link, linkText: ann.linkText.trim() });
    store.del("announceDismissed"); audit(u.email, "Updated site announcement"); toast("Announcement published."); refresh();
  };
  const saveSeo = e => { e.preventDefault(); store.set("admin:seo", { title: seo.title.trim(), description: seo.description.trim() }); audit(u.email, "Updated homepage SEO metadata"); toast("Metadata saved."); refresh(); };

  return (
    <AdminShell>
      <AdminHead title="Overview" sub="Platform activity stored in this browser." />
      <div className="grid g4 stats">
        <StatCard icon="book" value={cs.length} label="Courses" /><StatCard icon="list" value={cs.reduce((n, c) => n + c.lessons.length, 0)} label="Published lessons" />
        <StatCard icon="users" value={users.filter(x => x.role === "student").length} label="Students" /><StatCard icon="inbox" value={msgs.filter(m => !m.read).length} label="Unread messages" />
      </div>
      <div className="grid g2" style={{ marginTop: 24, alignItems: "start" }}>
        <form className="card stack" onSubmit={publish}><h3 style={{ fontSize: "var(--t-md)" }}><Icon name="megaphone" style={{ verticalAlign: -3, color: "var(--cyan)" }} /> Site announcement</h3>
          <label className="row small"><input type="checkbox" checked={ann.enabled} onChange={a("enabled")} style={{ accentColor: "#22D3EE" }} /> Show announcement bar</label>
          <div className="grid g2"><div className="field"><label htmlFor="an-label">Label</label><input className="input" id="an-label" value={ann.label} onChange={a("label")} maxLength={16} /></div>
            <div className="field"><label htmlFor="an-link">Link (internal path)</label><input className="input mono-in" id="an-link" value={ann.link} onChange={a("link")} placeholder="/labs" /></div></div>
          <div className="field"><label htmlFor="an-text">Text</label><input className="input" id="an-text" value={ann.text} onChange={a("text")} maxLength={160} /></div>
          <div className="field"><label htmlFor="an-lt">Link text</label><input className="input" id="an-lt" value={ann.linkText} onChange={a("linkText")} maxLength={30} /></div>
          <span className="err">{annErr}</span><div><button className="btn btn-primary" type="submit">Publish announcement</button></div></form>
        <form className="card stack" onSubmit={saveSeo}><h3 style={{ fontSize: "var(--t-md)" }}><Icon name="globe" style={{ verticalAlign: -3, color: "var(--cyan)" }} /> Homepage SEO metadata</h3>
          <div className="field"><label htmlFor="seo-t">Title tag</label><input className="input" id="seo-t" value={seo.title} onChange={e => setSeo({ ...seo, title: e.target.value })} maxLength={70} /><span className="hint">{seo.title.length} / 60 recommended</span></div>
          <div className="field"><label htmlFor="seo-d">Meta description</label><textarea className="input" id="seo-d" style={{ minHeight: 90 }} maxLength={170} value={seo.description} onChange={e => setSeo({ ...seo, description: e.target.value })} /><span className="hint">{seo.description.length} / 155 recommended</span></div>
          <div><button className="btn btn-primary" type="submit">Save metadata</button></div></form>
      </div>
      <div className="card stack" style={{ marginTop: 24 }}><div className="row between"><h3 style={{ fontSize: "var(--t-md)" }}>Audit log</h3><span className="xs dim">{log.length} events</span></div>
        {log.length ? <div className="table-wrap"><table><thead><tr><th>Time</th><th>Actor</th><th>Action</th></tr></thead><tbody>
          {log.slice(0, 25).map((x, k) => <tr key={k}><td className="num">{fmtDT(x.ts)}</td><td>{x.actor}</td><td>{x.action}</td></tr>)}
        </tbody></table></div> : <p className="small muted">No events yet.</p>}</div>
    </AdminShell>
  );
}
