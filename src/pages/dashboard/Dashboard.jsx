/* ============================================================
   STUDENT DASHBOARD
   ============================================================ */
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Icon } from "../../components/Icon.jsx";
import { useApp } from "../../components/AppContext.jsx";
import { CourseArt, Empty, Progress, SideNav, StatCard, useMedia, usePageMeta } from "../../components/ui.jsx";
import { EMAIL_RE, fmtDate, fmtDT, hashPw, store, uid } from "../../lib/config.js";
import { findCourse, findLesson, getCourses } from "../../lib/data.js";
import { audit, prog, pwRule, saveProg, streak } from "../../lib/auth.js";

const DASH_LINKS = [["/dashboard", "home", "Overview"], ["/dashboard/courses", "book", "My courses"], ["/dashboard/progress", "chart", "Progress & achievements"], ["/dashboard/settings", "sliders", "Profile & settings"]];

export function useSignOut() {
  const { user, refresh, toast } = useApp();
  const navigate = useNavigate();
  return e => { e && e.preventDefault(); if (user) audit(user.email, "Signed out"); store.del("session"); toast("Signed out."); refresh(); navigate("/"); };
}

function DashShell({ children }) {
  const { user } = useApp();
  const { pathname } = useLocation();
  const signOut = useSignOut();
  const cur = DASH_LINKS.find(l => l[0] === pathname) || DASH_LINKS[0];
  return (
    <div className="wrap app-shell">
      <SideNav id="sideNav" kicker="Student menu" label={cur[2]} icon={cur[1]} ariaLabel="Dashboard">
        <div className="side-h">Student</div>
        {DASH_LINKS.map(([h, i, t]) => <Link key={h} to={h} className={pathname === h ? "active" : ""} aria-current={pathname === h ? "page" : undefined}><Icon name={i} />{t}</Link>)}
        {user.role === "admin" && <><div className="side-h">Admin</div><Link to="/admin"><Icon name="grid" />Admin dashboard</Link></>}
        <div className="side-h">Learn</div>
        <Link to="/courses"><Icon name="compass" />Browse courses</Link><Link to="/labs"><Icon name="flask" />Practical labs</Link><Link to="/practice"><Icon name="target" />Practice Arena</Link>
        <Link to="/projects"><Icon name="layers" />Projects</Link><Link to="/resources"><Icon name="book" />Resources</Link>
        <a href="#/" onClick={signOut}><Icon name="logout" />Sign out</a>
      </SideNav>
      <div style={{ minWidth: 0 }}>{children}</div>
    </div>
  );
}
const Head = ({ eyebrow, title, children }) => <div className="row between"><div><span className="eyebrow">{eyebrow}</span><h1 style={{ fontSize: "var(--t-2xl)", marginTop: 10 }}>{title}</h1></div>{children}</div>;
const allLessons = cs => cs.flatMap(c => c.lessons.map(l => ({ ...l, c })));
const quizName = (q, allL) => q.key.startsWith("lab:") ? (findCourse(q.key.slice(4)) || { title: "" }).title : (allL.find(x => x.key === q.key) || { title: q.key }).title;

export function DashOverview() {
  usePageMeta("Dashboard");
  const { user: u } = useApp();
  const p = prog(u), cs = getCourses(), en = cs.filter(c => p.enrolled.includes(c.slug));
  const doneN = Object.keys(p.done).length, avg = p.quiz.length ? Math.round(p.quiz.reduce((a, q) => a + q.score / q.total, 0) / p.quiz.length * 100) : null;
  const lastC = p.last && findCourse(p.last.course), lastL = lastC && findLesson(lastC, p.last.lesson);
  const allL = allLessons(cs);
  const acts = [...Object.entries(p.done).map(([k, ts]) => ({ ts, t: `Completed “${(allL.find(x => x.key === k) || { title: k }).title}”`, i: "check" })),
    ...p.quiz.map(q => ({ ts: q.ts, t: `Quiz ${q.key.startsWith("lab:") ? "(lab) " + quizName(q, allL) : "“" + quizName(q, allL) + "”"}: ${q.score}/${q.total}`, i: "target" }))].sort((a, b) => b.ts - a.ts).slice(0, 6);
  const days = Array.from({ length: 28 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - 27 + i); return d.toISOString().slice(0, 10); });
  const set = new Set(p.activity);
  return (
    <DashShell><div className="stack" style={{ gap: 24 }}>
      <Head eyebrow="Student dashboard" title={`Welcome, ${u.name.split(" ")[0]}.`}>{p.sample && <span className="demo-flag">Includes sample activity</span>}</Head>
      <div className="grid g4 stats"><StatCard icon="book" value={en.length} label="Enrolled" /><StatCard icon="check" value={doneN} label="Lessons done" /><StatCard icon="target" value={avg == null ? "—" : avg + "%"} label="Avg. quiz" /><StatCard icon="flame" value={streak(p) + "d"} label="Streak" /></div>
      {lastL ? (
        <div className="card" style={{ borderColor: "rgba(34,211,238,.35)" }}><div className="row between">
          <div><span className="xs mono" style={{ color: "var(--cyan)" }}>CONTINUE LEARNING</span><h3 style={{ marginTop: 8 }}>{lastL.title}</h3><p className="small muted">{lastC.title} · Module {lastL.module + 1}</p></div>
          <Link className="btn btn-primary" to={`/learn/${lastC.slug}/${lastL.id}`}><Icon name="play" />Resume</Link></div></div>
      ) : <Empty icon="compass" title="No lesson in progress yet."><Link className="btn btn-primary btn-sm" to="/courses">Choose a course</Link></Empty>}
      <div className="grid g2" style={{ alignItems: "start" }}>
        <div className="card stack"><div className="row between"><h3 style={{ fontSize: "var(--t-md)" }}>Enrolled courses</h3><Link className="small" to="/dashboard/courses">Manage</Link></div>
          {en.length ? en.map(c => { const d = c.lessons.filter(l => p.done[l.key]).length; return (
            <Link key={c.slug} to={c.route} style={{ color: "var(--text)", textDecoration: "none" }} className="stack"><div className="row between small"><strong>{c.title}</strong><span className="muted">{d}/{c.lessons.length}</span></div><Progress value={d / c.lessons.length * 100} /></Link>); })
            : <p className="small muted">You haven't enrolled yet. <Link to="/courses">Browse courses</Link>.</p>}</div>
        <div className="card stack"><h3 style={{ fontSize: "var(--t-md)" }}>Recent activity</h3>
          {acts.length ? <ul className="step-log">{acts.map((a, k) => <li key={k}><Icon name={a.i} style={{ width: 14, height: 14, verticalAlign: -2, color: "var(--cyan)" }} /> {a.t}<br /><span className="xs dim">{fmtDT(a.ts)}</span></li>)}</ul>
            : <p className="small muted">Complete a lesson or quiz and it will appear here.</p>}</div>
      </div>
      <div className="grid g2" style={{ alignItems: "start" }}>
        <div className="card stack"><h3 style={{ fontSize: "var(--t-md)" }}>Last 28 days</h3>
          <div className="heat" role="img" aria-label={`${p.activity.length} active days recorded`}>{days.map(d => <i key={d} className={set.has(d) ? "l3" : ""} title={d + (set.has(d) ? " · active" : "")} />)}</div>
          <p className="xs dim">Streak counts consecutive days with a completed lesson or quiz.</p></div>
        <div className="card stack"><h3 style={{ fontSize: "var(--t-md)" }}>Bookmarks</h3>
          {p.bookmarks.length ? <ul className="step-log">{p.bookmarks.map(k => { const x = allL.find(y => y.key === k); return x ? <li key={k}><Link to={`/learn/${x.c.slug}/${x.id}`}>{x.title}</Link><br /><span className="xs dim">{x.c.title}</span></li> : null; })}</ul>
            : <p className="small muted">Use the bookmark button on any lesson to save it here.</p>}</div>
      </div>
    </div></DashShell>
  );
}

export function DashCourses() {
  usePageMeta("My Courses");
  const { user: u, toast, confirm, refresh } = useApp();
  const narrow = useMedia("(max-width:560px)");
  const p = prog(u), cs = getCourses();
  const enroll = s => { const pp = prog(u); pp.enrolled.push(s); saveProg(u, pp); toast("Enrolled."); refresh(); };
  const unenroll = async s => {
    if (!(await confirm({ title: "Unenroll from this course?", body: "Your completed lessons are kept, so you can re-enroll later without losing progress.", confirm: "Unenroll" }))) return;
    const pp = prog(u); pp.enrolled = pp.enrolled.filter(x => x !== s); saveProg(u, pp); toast("Unenrolled.", "info"); refresh();
  };
  return (
    <DashShell><div className="stack" style={{ gap: 24 }}>
      <Head eyebrow="My courses" title="Your learning" />
      {cs.map(c => {
        const en = p.enrolled.includes(c.slug), d = c.lessons.filter(l => p.done[l.key]).length, nx = c.lessons.find(l => !p.done[l.key]);
        return (
          <div key={c.slug} className="card" style={{ display: "grid", gridTemplateColumns: narrow ? "minmax(0,1fr)" : "minmax(0,160px) minmax(0,1fr)", gap: 20, padding: 16 }}>
            <div className="course-art" style={{ height: 110, borderRadius: 12, border: "1px solid var(--line)" }}><CourseArt slug={c.slug} accent={c.accent} /></div>
            <div className="stack" style={{ gap: 10 }}>
              <div className="row between"><h3 style={{ fontSize: "var(--t-md)" }}>{c.title}</h3>{en ? <span className="chip chip-ok">Enrolled</span> : <span className="chip">Not enrolled</span>}</div>
              {en ? <><div className="row between small muted"><span>{d} of {c.lessons.length} lessons</span><span>{Math.round(d / c.lessons.length * 100)}%</span></div><Progress value={d / c.lessons.length * 100} /></> : <p className="small muted">{c.short}</p>}
              <div className="row">{en ? <>
                {nx ? <Link className="btn btn-primary btn-sm" to={`/learn/${c.slug}/${nx.id}`}><Icon name="play" />{d ? "Continue" : "Start"}</Link> : <span className="chip chip-ok"><Icon name="award" style={{ width: 14, height: 14 }} /> All lessons complete</span>}
                <Link className="btn btn-ghost btn-sm" to={c.route}>Curriculum</Link>
                <button className="btn btn-quiet btn-sm" type="button" onClick={() => unenroll(c.slug)}>Unenroll</button>
              </> : <>
                <button className="btn btn-primary btn-sm" type="button" onClick={() => enroll(c.slug)}><Icon name="plus" />Enroll</button>
                <Link className="btn btn-ghost btn-sm" to={c.route}>View course</Link>
              </>}</div>
            </div>
          </div>);
      })}
    </div></DashShell>
  );
}

export function DashProgress() {
  usePageMeta("Progress & Achievements");
  const { user: u } = useApp();
  const p = prog(u), cs = getCourses(), doneN = Object.keys(p.done).length;
  const modDone = cs.flatMap(c => c.modules.filter(m => { const ls = m.lessons.filter(l => l.status === "published"); return ls.length && ls.every(l => p.done[l.key]); }));
  const ach = [["play", "First step", "Complete your first lesson", doneN >= 1], ["layers", "Ten down", "Complete 10 lessons", doneN >= 10], ["target", "Perfect score", "Score 100% on a quiz", p.quiz.some(q => q.score === q.total)], ["flame", "On a roll", "Reach a 3-day streak", streak(p) >= 3], ["award", "Module master", "Finish every lesson in a module", modDone.length > 0], ["compass", "Explorer", "Enroll in all three core courses", ["networking", "cloud-computing", "ethical-hacking"].every(s => p.enrolled.includes(s))]];
  const allL = allLessons(cs), enrolled = cs.filter(c => p.enrolled.includes(c.slug));
  return (
    <DashShell><div className="stack" style={{ gap: 24 }}>
      <Head eyebrow="Progress & achievements" title="How you're doing" />
      <div className="grid g3">{ach.map(([i, t, d, ok]) => (
        <div key={t} className="card stack" style={{ gap: 8, ...(ok ? { borderColor: "rgba(34,197,94,.45)" } : { opacity: .7 }) }}>
          <div className="row between"><span className="icon-box" style={ok ? undefined : { filter: "grayscale(1)" }}><Icon name={i} /></span>{ok ? <span className="chip chip-ok">Earned</span> : <span className="chip">Locked</span>}</div>
          <h4>{t}</h4><p className="small muted">{d}</p></div>))}</div>
      <div className="card stack"><h3 style={{ fontSize: "var(--t-md)" }}>Module progress</h3>
        {enrolled.length ? enrolled.map(c => (
          <details key={c.slug} className="acc" style={{ background: "none" }} open><summary style={{ padding: "12px 0" }}>{c.title} <Icon name="chev" className="icon chev" /></summary>
            <div className="stack" style={{ gap: 10, paddingBottom: 12 }}>{c.modules.map((m, i) => { const ls = m.lessons.filter(l => l.status === "published"), d = ls.filter(l => p.done[l.key]).length; return (
              <div key={i}><div className="row between small"><span><span className="mono xs dim">M{i + 1}</span> {m.title}</span><span className="muted">{d}/{ls.length}</span></div><Progress style={{ marginTop: 4, height: 6 }} value={ls.length ? d / ls.length * 100 : 0} /></div>); })}</div>
          </details>)) : <p className="small muted">Enroll in a course to see module progress.</p>}</div>
      <div className="card stack"><h3 style={{ fontSize: "var(--t-md)" }}>Quiz attempts</h3>
        {p.quiz.length ? <div className="table-wrap"><table><thead><tr><th>Quiz</th><th>Score</th><th>Date</th></tr></thead><tbody>
          {[...p.quiz].reverse().map((q, k) => <tr key={k}><td>{q.key.startsWith("lab:") ? "Lab quiz · " + quizName(q, allL) : quizName(q, allL)}</td><td className="num">{q.score}/{q.total} <span className={`chip ${q.score === q.total ? "chip-ok" : ""}`} style={{ marginLeft: 6 }}>{Math.round(q.score / q.total * 100)}%</span></td><td className="num">{fmtDT(q.ts)}</td></tr>)}
        </tbody></table></div> : <p className="small muted">No quiz attempts yet. Every lesson ends with a knowledge check.</p>}</div>
      <div className="alert alert-info"><Icon name="award" /><span>Certificates are not issued yet. They will appear here once MND CODE has a verified issuance process.</span></div>
    </div></DashShell>
  );
}

export function DashSettings() {
  usePageMeta("Profile & Settings");
  const { user: u, toast, confirm, refresh } = useApp();
  const navigate = useNavigate();
  const [name, setName] = useState(u.name), [email, setEmail] = useState(u.email), [pErr, setPErr] = useState("");
  const [pw, setPw] = useState({ old: "", n1: "", n2: "" }), [cpErr, setCpErr] = useState("");

  const saveProfile = e => {
    e.preventDefault();
    const n = name.trim(), em = email.trim().toLowerCase(), users = store.get("users", []);
    if (n.length < 2) return setPErr("Enter your name.");
    if (!EMAIL_RE.test(em)) return setPErr("Enter a valid email address.");
    if (users.some(x => x.email === em && x.id !== u.id)) return setPErr("That email is used by another account.");
    setPErr(""); const x = users.find(y => y.id === u.id); x.name = n; x.email = em; store.set("users", users);
    audit(em, "Updated profile"); toast("Profile saved."); refresh();
  };
  const changePw = async e => {
    e.preventDefault();
    const users = store.get("users", []), x = users.find(y => y.id === u.id);
    if ((await hashPw(pw.old, x.salt)) !== x.hash) return setCpErr("Your current password is incorrect.");
    if (!pwRule(pw.n1)) return setCpErr("Use at least 8 characters with upper- and lower-case letters and a number.");
    if (pw.n1 !== pw.n2) return setCpErr("New passwords don't match.");
    x.salt = uid(); x.hash = await hashPw(pw.n1, x.salt); store.set("users", users);
    audit(x.email, "Changed password"); setPw({ old: "", n1: "", n2: "" }); setCpErr(""); toast("Password updated.");
  };
  const resetProgress = async () => {
    if (!(await confirm({ title: "Reset all progress?", body: "Completed lessons, quiz attempts, bookmarks and your streak will be cleared. Enrollments are kept. This can't be undone.", confirm: "Reset progress", danger: true }))) return;
    const p = prog(u); saveProg(u, { enrolled: p.enrolled, done: {}, quiz: [], bookmarks: [], activity: [], last: null }); toast("Progress reset.", "info"); refresh();
  };
  const deleteAccount = async () => {
    if (!(await confirm({ title: "Delete your account?", body: "Your account and all progress will be permanently removed from this browser.", confirm: "Delete account", danger: true }))) return;
    store.set("users", store.get("users", []).filter(x => x.id !== u.id)); store.del("progress:" + u.id); store.del("session");
    audit(u.email, "Deleted own account"); toast("Account deleted.", "info"); refresh(); navigate("/");
  };
  const setP = k => e => setPw({ ...pw, [k]: e.target.value });

  return (
    <DashShell><div className="stack" style={{ gap: 24, maxWidth: 720 }}>
      <Head eyebrow="Profile & settings" title="Your account" />
      <form className="card stack" noValidate onSubmit={saveProfile}><h3 style={{ fontSize: "var(--t-md)" }}>Profile</h3>
        <div className="grid g2"><div className="field"><label htmlFor="p-name">Name</label><input className="input" id="p-name" value={name} onChange={e => setName(e.target.value)} maxLength={80} /></div>
          <div className="field"><label htmlFor="p-email">Email</label><input className="input" id="p-email" type="email" value={email} onChange={e => setEmail(e.target.value)} maxLength={120} /></div></div>
        <span className="err">{pErr}</span><div><button className="btn btn-primary" type="submit">Save profile</button></div>
        <p className="xs dim">Role: {u.role} · Member since {fmtDate(u.created)}</p></form>
      <form className="card stack" noValidate onSubmit={changePw}><h3 style={{ fontSize: "var(--t-md)" }}>Change password</h3>
        <div className="field"><label htmlFor="cp-old">Current password</label><input className="input" id="cp-old" type="password" autoComplete="current-password" value={pw.old} onChange={setP("old")} /></div>
        <div className="grid g2"><div className="field"><label htmlFor="cp-new">New password</label><input className="input" id="cp-new" type="password" autoComplete="new-password" value={pw.n1} onChange={setP("n1")} /></div>
          <div className="field"><label htmlFor="cp-new2">Confirm new password</label><input className="input" id="cp-new2" type="password" autoComplete="new-password" value={pw.n2} onChange={setP("n2")} /></div></div>
        <span className="err">{cpErr}</span><div><button className="btn btn-primary" type="submit">Update password</button></div></form>
      <div className="card stack" style={{ borderColor: "rgba(244,63,94,.3)" }}><h3 style={{ fontSize: "var(--t-md)" }}>Data & account</h3>
        <p className="small muted">Reset clears completed lessons, quizzes, bookmarks and streak. Deleting your account removes it from this browser.</p>
        <div className="row"><button className="btn btn-ghost" type="button" onClick={resetProgress}><Icon name="reset" />Reset progress</button>
          {u.role !== "admin" && <button className="btn btn-danger" type="button" onClick={deleteAccount}><Icon name="trash" />Delete account</button>}</div></div>
    </div></DashShell>
  );
}
