import { useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "../../components/Icon.jsx";
import { Modal, useApp } from "../../components/AppContext.jsx";
import { Select } from "../../components/Select.jsx";
import { usePageMeta } from "../../components/ui.jsx";
import { slug as slugify, store } from "../../lib/config.js";
import { CAT_ICON, findCourse, getCourses, LESSONS } from "../../lib/data.js";
import { audit } from "../../lib/auth.js";
import { AdminHead, AdminShell } from "./AdminShell.jsx";

const LEVELS = ["Beginner", "Intermediate", "Advanced"];
let FILTER = { q: "", c: "", l: "" }; // kept while editing so the list doesn't reset after each save

export function AdminCourses() {
  usePageMeta("Course Management");
  const { user: u, toast, confirm, refresh } = useApp();
  const cs = getCourses();
  const cats = [...new Set(cs.map(c => c.category))];
  const [f, setF0] = useState(() => ({ ...FILTER, c: cats.includes(FILTER.c) ? FILTER.c : "" }));
  const setF = v => { FILTER = v; setF0(v); };
  const [form, setForm] = useState(null); // { course } while the editor is open

  const words = f.q.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const shown = cs.filter(c => { const hay = (c.title + " " + c.category + " " + c.level + " " + c.slug).toLowerCase(); return words.every(w => hay.includes(w)) && (!f.c || c.category === f.c) && (!f.l || c.level === f.l); });

  const save = v => {
    const c = form.course;
    setForm(null);
    if (!c) {
      let s = slugify(v.title); const ex = getCourses().map(x => x.slug); while (ex.includes(s)) s += "-2";
      const custom = store.get("admin:customCourses", []);
      custom.push({ ...v, slug: s, icon: CAT_ICON[v.category] || "book", accent: "#22D3EE", overview: v.short, outcomes: [], objectives: [], audience: [], prerequisites: [], skills: [], tools: [], related: [], next: null });
      store.set("admin:customCourses", custom); audit(u.email, `Created course “${v.title}”`); toast("Course created.");
    } else {
      const ov = store.get("admin:courses", {}); ov[c.slug] = { ...(ov[c.slug] || {}), ...v }; store.set("admin:courses", ov);
      audit(u.email, `Edited course “${v.title}”`); toast("Course saved.");
    }
    refresh();
  };
  const del = async s => {
    const c = findCourse(s);
    if (!(await confirm({ title: `Delete “${c.title}”?`, body: c.custom ? "This custom course and its lessons will be removed." : "This core course will be hidden from the site. You can bring it back with 'Restore default courses'.", confirm: "Delete course", danger: true }))) return;
    if (c.custom) store.set("admin:customCourses", store.get("admin:customCourses", []).filter(x => x.slug !== c.slug));
    else { const ov = store.get("admin:courses", {}); ov[c.slug] = { ...(ov[c.slug] || {}), deleted: true }; store.set("admin:courses", ov); }
    audit(u.email, `Deleted course “${c.title}”`); toast("Course deleted.", "info"); refresh();
  };
  const restore = async () => {
    if (!(await confirm({ title: "Restore default courses?", body: "All edits to the three core courses will be undone and hidden core courses shown again. Custom courses are kept.", confirm: "Restore" }))) return;
    store.del("admin:courses"); audit(u.email, "Restored default courses"); toast("Defaults restored."); refresh();
  };

  return (
    <AdminShell>
      <AdminHead title="Courses" sub="Edit course details, create new courses or remove them."><button className="btn btn-primary" type="button" onClick={() => setForm({ course: null })}><Icon name="plus" />New course</button></AdminHead>
      <div className="admin-filters" role="search">
        <div className="field"><label htmlFor="cl-q">Search courses</label><input className="input" id="cl-q" type="search" placeholder="Title, category or level" autoComplete="off" value={f.q} onChange={e => setF({ ...f, q: e.target.value })} /></div>
        <div className="field"><label htmlFor="cl-c">Category</label><Select id="cl-c" value={f.c} onChange={v => setF({ ...f, c: v })} options={[{ value: "", label: "All categories" }, ...cats]} /></div>
        <div className="field"><label htmlFor="cl-l">Level</label><Select id="cl-l" value={f.l} onChange={v => setF({ ...f, l: v })} options={[{ value: "", label: "All levels" }, ...LEVELS]} /></div>
        <button className="btn btn-quiet" type="button" onClick={() => { setF({ q: "", c: "", l: "" }); document.getElementById("cl-q")?.focus(); }}><Icon name="reset" />Reset</button>
      </div>
      <p className="small muted" aria-live="polite" style={{ margin: "0 0 12px" }}>{shown.length} of {cs.length} courses</p>
      <div className="table-wrap"><table><thead><tr><th>Course</th><th>Category</th><th>Level</th><th>Modules</th><th>Lessons</th><th>Questions</th><th>Actions</th></tr></thead><tbody>
        {shown.length ? shown.map(c => (
          <tr key={c.slug}>
            <td><Link to={c.route}><strong>{c.title}</strong></Link>{c.custom && <> <span className="demo-flag">custom</span></>}</td>
            <td>{c.category}</td><td>{c.level}</td><td className="num">{c.modules.length}</td>
            <td className="num">{c.lessons.length}{c.allLessons.length !== c.lessons.length && <> <span className="xs dim">(+{c.allLessons.length - c.lessons.length} draft)</span></>}</td>
            <td className="num">{c.modules.length + c.lessons.filter(l => LESSONS[l.key]).reduce((a, l) => a + LESSONS[l.key].quiz.length, 0)}</td>
            <td><div className="row" style={{ gap: 4, flexWrap: "nowrap" }}>
              <button className="btn btn-quiet btn-sm" type="button" onClick={() => setForm({ course: c })}><Icon name="edit" />Edit</button>
              <button className="btn btn-quiet btn-sm" type="button" style={{ color: "#FDA4AF" }} onClick={() => del(c.slug)}><Icon name="trash" />Delete</button>
            </div></td>
          </tr>
        )) : <tr><td colSpan={7} style={{ textAlign: "center", padding: 32 }} className="muted">No courses match these filters.</td></tr>}
      </tbody></table></div>
      <div className="row" style={{ marginTop: 16 }}><button className="btn btn-ghost btn-sm" type="button" onClick={restore}><Icon name="reset" />Restore default courses</button></div>
      {form && <CourseForm c={form.course} cats={cats} onCancel={() => setForm(null)} onSave={save} />}
    </AdminShell>
  );
}

function CourseForm({ c, cats, onCancel, onSave }) {
  const [v, setV] = useState({ title: c ? c.title : "", category: c ? c.category : "", newCat: "", level: c ? c.level : "Beginner", short: c ? c.short || "" : "", modules: "" });
  const [err, setErr] = useState("");
  const set = k => e => setV({ ...v, [k]: e.target.value });
  const submit = e => {
    e.preventDefault();
    const out = { title: v.title.trim(), category: (v.category === "__new" ? v.newCat : v.category).trim(), level: v.level, short: v.short.trim() };
    if (out.title.length < 4) return setErr("Title needs at least 4 characters.");
    if (!out.category) return setErr(v.category === "__new" ? "Type a name for the new category." : "Choose a category.");
    if (out.short.length < 20) return setErr("Description needs at least 20 characters.");
    if (!c) {
      const lines = v.modules.split("\n").map(x => x.trim()).filter(Boolean);
      if (!lines.length) return setErr("Add at least one module.");
      out.modules = lines.map(line => { const [t, ls] = line.split(":"); const topics = (ls || "").split(";").map(x => x.trim()).filter(Boolean); return { title: t.trim(), summary: "Module created in admin.", topics: topics.length ? topics : ["Introduction"], terms: [], check: { q: "Did you complete the lessons in this module?", options: ["Yes", "Not yet"], answer: 0, why: "Self-check created in admin." } }; });
    }
    onSave(out);
  };
  return (
    <Modal onCancel={onCancel} label={c ? "Edit course" : "New course"}>
      <h3 style={{ fontSize: "var(--t-lg)" }}>{c ? "Edit course" : "New course"}</h3>
      <form className="stack" noValidate onSubmit={submit}>
        <div className="field"><label htmlFor="cf-t">Title</label><input className="input" id="cf-t" autoFocus value={v.title} onChange={set("title")} maxLength={80} /></div>
        <div className="grid g2">
          <div className="field"><label htmlFor="cf-c">Category</label>
            <Select id="cf-c" value={v.category} onChange={x => setV({ ...v, category: x })} options={[{ value: "", label: "Select a category", disabled: true }, ...cats, { value: "__new", label: "＋ New category…" }]} />
            {v.category === "__new" && <input className="input" autoFocus placeholder="New category name" maxLength={30} style={{ marginTop: 8 }} aria-label="New category name" value={v.newCat} onChange={set("newCat")} />}
          </div>
          <div className="field"><label htmlFor="cf-l">Level</label><Select id="cf-l" value={v.level} onChange={x => setV({ ...v, level: x })} options={LEVELS} /></div>
        </div>
        <div className="field"><label htmlFor="cf-s">Short description</label><textarea className="input" id="cf-s" style={{ minHeight: 80 }} maxLength={240} value={v.short} onChange={set("short")} /></div>
        {!c && <div className="field"><label htmlFor="cf-m">Modules</label><textarea className="input mono-in" id="cf-m" style={{ minHeight: 110, fontSize: 13 }} placeholder={"One module per line:\nModule title: lesson one; lesson two"} value={v.modules} onChange={set("modules")} />
          <span className="hint">Format: <code>Module title: lesson; lesson; lesson</code></span></div>}
        <span className="err">{err}</span>
        <div className="row" style={{ justifyContent: "flex-end" }}><button className="btn btn-ghost" type="button" onClick={onCancel}>Cancel</button><button className="btn btn-primary" type="submit">Save</button></div>
      </form>
    </Modal>
  );
}
