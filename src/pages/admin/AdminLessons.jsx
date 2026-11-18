import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Icon } from "../../components/Icon.jsx";
import { useApp } from "../../components/AppContext.jsx";
import { Select } from "../../components/Select.jsx";
import { Empty, usePageMeta } from "../../components/ui.jsx";
import { store } from "../../lib/config.js";
import { getCourses } from "../../lib/data.js";
import { audit } from "../../lib/auth.js";
import { AdminHead, AdminShell } from "./AdminShell.jsx";

export function AdminLessons() {
  usePageMeta("Lesson Management");
  const { user: u, toast, confirm, refresh } = useApp();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const cs = getCourses();
  const sel = cs.find(c => c.slug === params.get("c")) || cs[0];
  const [nl, setNl] = useState({ m: "0", t: "", b: "", s: "draft" });
  const [err, setErr] = useState("");

  const toggle = k => {
    const st = store.get("admin:lessonStatus", {});
    st[k] = (st[k] || "published") === "published" ? "draft" : "published";
    store.set("admin:lessonStatus", st); audit(u.email, `Set lesson ${k} to ${st[k]}`);
    toast(`Lesson ${st[k] === "published" ? "published" : "moved to draft"}.`); refresh();
  };
  const remove = async (mi, id) => {
    if (!(await confirm({ title: "Delete this lesson?", body: "The lesson content will be removed permanently.", confirm: "Delete", danger: true }))) return;
    const ex = store.get("admin:extraLessons", {}), xi = +id.split("-x")[1] - 1;
    ex[sel.slug][mi].splice(xi, 1); store.set("admin:extraLessons", ex);
    audit(u.email, `Deleted lesson ${sel.slug}/${id}`); toast("Lesson deleted.", "info"); refresh();
  };
  const add = e => {
    e.preventDefault();
    const t = nl.t.trim(), b = nl.b.trim(), mi = nl.m;
    if (t.length < 4) return setErr("Lesson title needs at least 4 characters.");
    if (b.length < 40) return setErr("Lesson content needs at least 40 characters.");
    setErr("");
    const ex = store.get("admin:extraLessons", {}); ex[sel.slug] = ex[sel.slug] || {}; ex[sel.slug][mi] = ex[sel.slug][mi] || [];
    ex[sel.slug][mi].push({ title: t, body: b }); store.set("admin:extraLessons", ex);
    const key = `${sel.slug}/m${+mi + 1}-x${ex[sel.slug][mi].length}`;
    const st = store.get("admin:lessonStatus", {}); st[key] = nl.s; store.set("admin:lessonStatus", st);
    audit(u.email, `Added lesson “${t}” (${st[key]})`); toast("Lesson added.");
    setNl({ ...nl, t: "", b: "" }); refresh();
  };

  return (
    <AdminShell>
      <AdminHead title="Lessons" sub="Publish, unpublish and add lessons. Draft lessons are hidden from students." />
      <div className="row" style={{ marginBottom: 20 }}><label htmlFor="ls-c" className="small muted">Course</label>
        <Select id="ls-c" style={{ maxWidth: 360 }} value={sel ? sel.slug : ""} onChange={v => navigate("/admin/lessons?c=" + v)} options={cs.map(c => ({ value: c.slug, label: c.title }))} /></div>
      {sel ? <>
        <div className="acc">{sel.modules.map((m, i) => (
          <details key={sel.slug + i} open={i === 0 || undefined}>
            <summary><span><span className="mod-num">M{i + 1}</span>{m.title}</span><span className="row" style={{ gap: 10, flexWrap: "nowrap" }}><span className="xs dim mono">{m.lessons.filter(l => l.status === "published").length}/{m.lessons.length} live</span><Icon name="chev" className="icon chev" /></span></summary>
            <div className="acc-body"><div className="table-wrap"><table><tbody>{m.lessons.map(l => (
              <tr key={l.key}>
                <td style={{ width: "60%" }}>{l.title} {l.authored ? <span className="chip chip-ok" style={{ height: 20, fontSize: 10 }}>{l.custom ? "custom" : "full"}</span> : <span className="chip" style={{ height: 20, fontSize: 10 }}>outline</span>}</td>
                <td><span className={`chip ${l.status === "published" ? "chip-ok" : "chip-warn"}`}>{l.status}</span></td>
                <td><div className="row" style={{ gap: 4, flexWrap: "nowrap" }}>
                  <button className="btn btn-quiet btn-sm" type="button" onClick={() => toggle(l.key)}>{l.status === "published" ? "Unpublish" : "Publish"}</button>
                  <Link className="btn btn-quiet btn-sm" to={`/learn/${sel.slug}/${l.id}`} aria-disabled={l.status !== "published" || undefined} style={l.status !== "published" ? { pointerEvents: "none", opacity: .4 } : undefined}><Icon name="eye" />View</Link>
                  {l.custom && <button className="btn btn-quiet btn-sm" type="button" style={{ color: "#FDA4AF" }} aria-label="Delete lesson" onClick={() => remove(l.module, l.id)}><Icon name="trash" /></button>}
                </div></td>
              </tr>))}</tbody></table></div></div>
          </details>))}</div>
        <form className="card stack" style={{ marginTop: 24 }} noValidate onSubmit={add}><h3 style={{ fontSize: "var(--t-md)" }}>Add a lesson to {sel.title}</h3>
          <div className="grid g2">
            <div className="field"><label htmlFor="al-m">Module</label><Select id="al-m" value={nl.m} onChange={v => setNl({ ...nl, m: v })} options={sel.modules.map((m, i) => ({ value: String(i), label: `M${i + 1} · ${m.title}` }))} /></div>
            <div className="field"><label htmlFor="al-t">Lesson title</label><input className="input" id="al-t" maxLength={100} value={nl.t} onChange={e => setNl({ ...nl, t: e.target.value })} /></div>
          </div>
          <div className="field"><label htmlFor="al-b">Lesson content</label><textarea className="input" id="al-b" placeholder="Plain text. Separate paragraphs with a blank line." value={nl.b} onChange={e => setNl({ ...nl, b: e.target.value })} /></div>
          <div className="field"><label htmlFor="al-s">Status</label><Select id="al-s" style={{ maxWidth: 220 }} value={nl.s} onChange={v => setNl({ ...nl, s: v })} options={[{ value: "draft", label: "Draft" }, { value: "published", label: "Published" }]} /></div>
          <span className="err">{err}</span><div><button className="btn btn-primary" type="submit"><Icon name="plus" />Add lesson</button></div>
        </form>
      </> : <Empty title="No courses yet." />}
    </AdminShell>
  );
}
