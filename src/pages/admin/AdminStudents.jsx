import { useState } from "react";
import { Icon } from "../../components/Icon.jsx";
import { useApp } from "../../components/AppContext.jsx";
import { Select } from "../../components/Select.jsx";
import { usePageMeta } from "../../components/ui.jsx";
import { fmtDate, store } from "../../lib/config.js";
import { getCourses } from "../../lib/data.js";
import { audit, prog, saveProg } from "../../lib/auth.js";
import { AdminHead, AdminShell } from "./AdminShell.jsx";

export function AdminStudents() {
  usePageMeta("Student Management");
  const { user: u, toast, confirm, refresh } = useApp();
  const [q, setQ] = useState("");
  const users = store.get("users", []), cs = getCourses();
  const shown = users.filter(x => (x.name + " " + x.email).toLowerCase().includes(q.toLowerCase().trim()));

  const enroll = (x, s) => { if (!s) return; const p = prog(x); p.enrolled.push(s); saveProg(x, p); audit(u.email, `Enrolled ${x.email} in ${s}`); toast(`Enrolled ${x.name}.`); refresh(); };
  const remove = async x => {
    if (!(await confirm({ title: `Remove ${x.name}?`, body: "Their account and learning progress will be deleted.", confirm: "Remove student", danger: true }))) return;
    store.set("users", store.get("users", []).filter(y => y.id !== x.id)); store.del("progress:" + x.id);
    audit(u.email, `Removed account ${x.email}`); toast("Account removed.", "info"); refresh();
  };

  return (
    <AdminShell>
      <AdminHead title="Students" sub="Registered accounts in this browser." />
      <div className="field" style={{ maxWidth: 360, marginBottom: 16 }}><label htmlFor="st-q">Search students</label><input className="input" id="st-q" type="search" placeholder="Name or email" value={q} onChange={e => setQ(e.target.value)} /></div>
      <div className="table-wrap"><table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Enrolled</th><th>Lessons done</th><th>Joined</th><th>Actions</th></tr></thead><tbody>
        {shown.map(x => { const p = prog(x); return (
          <tr key={x.id}>
            <td><strong>{x.name}</strong></td><td className="allow-copy">{x.email}</td>
            <td><span className={`chip ${x.role === "admin" ? "chip-purple" : "chip-blue"}`}>{x.role}</span></td>
            <td>{p.enrolled.length ? p.enrolled.map(s => <span key={s} className="chip" style={{ height: 22, margin: 2 }}>{(cs.find(c => c.slug === s) || { title: s }).title.split(" ")[0]}</span>) : <span className="dim">—</span>}</td>
            <td className="num">{Object.keys(p.done).length}</td><td className="num">{fmtDate(x.created)}</td>
            <td><div className="row" style={{ gap: 4, flexWrap: "nowrap" }}>
              <Select ariaLabel={`Enroll ${x.name} in a course`} style={{ height: 34, width: 150, fontSize: 13 }} value="" onChange={v => enroll(x, v)}
                options={[{ value: "", label: "Enroll in…" }, ...cs.filter(c => !p.enrolled.includes(c.slug)).map(c => ({ value: c.slug, label: c.title }))]} />
              {x.id !== u.id && <button className="btn btn-quiet btn-sm" type="button" style={{ color: "#FDA4AF" }} aria-label={`Remove ${x.name}`} onClick={() => remove(x)}><Icon name="trash" /></button>}
            </div></td>
          </tr>); })}
      </tbody></table></div>
      <p className="small muted" style={{ marginTop: 10 }}>{shown.length ? `${shown.length} account${shown.length === 1 ? "" : "s"}` : "No accounts match your search."}</p>
    </AdminShell>
  );
}
