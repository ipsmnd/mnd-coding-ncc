/* ============================================================
   AUTH PAGES — sign in and register (demo: browser only)
   ============================================================ */
import { useRef, useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { Icon, Logo } from "../components/Icon.jsx";
import { useApp } from "../components/AppContext.jsx";
import { Spinner, usePageMeta } from "../components/ui.jsx";
import { EMAIL_RE, hashPw, sleep, store, uid } from "../lib/config.js";
import { audit, pwRule } from "../lib/auth.js";

const AuthCard = ({ children }) => (
  <section className="section"><div className="wrap" style={{ maxWidth: 480 }}><div className="card stack" style={{ gap: 20, padding: "clamp(22px,4vw,36px)" }}>{children}</div></div></section>
);
const Bad = ({ icon = "alert", children }) => <div className="alert alert-bad"><Icon name={icon} /><span>{children}</span></div>;

export function Login() {
  usePageMeta("Sign In", "Sign in to your MND CODE student account.");
  const { user, refresh, toast } = useApp();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [email, setEmail] = useState(""), [pw, setPw] = useState("");
  const [msg, setMsg] = useState(null), [busy, setBusy] = useState(false);
  const pwRef = useRef(null);
  if (user && !busy) return <Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} replace />;

  const demo = admin => { setEmail(admin ? "admin@demo.mndcode.in" : "student@demo.mndcode.in"); setPw(admin ? "Admin#2026" : "Student#2026"); pwRef.current && pwRef.current.focus(); };
  const submit = async e => {
    e.preventDefault();
    const em = email.trim().toLowerCase();
    const lock = store.get("loginLock", { n: 0, until: 0 });
    if (lock.until > Date.now()) { setMsg(<Bad icon="lock">Too many attempts. Try again in {Math.ceil((lock.until - Date.now()) / 1000)} seconds.</Bad>); return; }
    if (!em || !pw) { setMsg(<Bad>Enter your email and password.</Bad>); return; }
    setBusy(true); setMsg(null);
    await sleep(400);
    const u = store.get("users", []).find(x => x.email === em);
    const ok = u && (await hashPw(pw, u.salt)) === u.hash;
    if (!ok) {
      lock.n++; if (lock.n >= 5) { lock.until = Date.now() + 30000; lock.n = 0; } store.set("loginLock", lock);
      setBusy(false); setMsg(<Bad>That email and password don't match an account. Check both and try again.</Bad>); return;
    }
    store.set("loginLock", { n: 0, until: 0 }); store.set("session", { userId: u.id, ts: Date.now() });
    audit(u.email, "Signed in"); toast(`Signed in as ${u.name}`);
    const nx = params.get("next");
    refresh();
    navigate(nx && nx.startsWith("/") ? nx : u.role === "admin" ? "/admin" : "/dashboard");
  };

  return (
    <AuthCard>
      <div className="stack" style={{ gap: 8, textAlign: "center", alignItems: "center" }}><Logo /><h1 style={{ fontSize: "var(--t-xl)" }}>Welcome back</h1><p className="small muted">Sign in to continue learning.</p></div>
      <div className="alert alert-warn"><Icon name="info" /><div className="small"><strong>Demo mode.</strong> Accounts live only in this browser. Try{" "}
        <button className="btn btn-quiet btn-sm" type="button" style={{ height: "auto", padding: "0 4px", color: "var(--cyan)" }} onClick={() => demo(false)}>demo student</button> or{" "}
        <button className="btn btn-quiet btn-sm" type="button" style={{ height: "auto", padding: "0 4px", color: "var(--cyan)" }} onClick={() => demo(true)}>demo admin</button>.</div></div>
      <form className="stack" noValidate onSubmit={submit}>
        <div className="field"><label htmlFor="l-email">Email</label><input className="input" id="l-email" type="email" autoComplete="username" required value={email} onChange={e => setEmail(e.target.value)} /></div>
        <div className="field"><label htmlFor="l-pw">Password</label><input className="input" id="l-pw" type="password" autoComplete="current-password" required ref={pwRef} value={pw} onChange={e => setPw(e.target.value)} /></div>
        <div aria-live="polite">{msg}</div>
        <button className="btn btn-primary btn-lg" type="submit" disabled={busy}>{busy ? <><Spinner />Signing in…</> : "Sign in"}</button>
      </form>
      <p className="small muted" style={{ textAlign: "center" }}>New to MND CODE? <Link to="/register">Create an account</Link></p>
    </AuthCard>
  );
}

export function Register() {
  usePageMeta("Create Account", "Create a free MND CODE student account.");
  const { user, refresh, toast } = useApp();
  const navigate = useNavigate();
  const [f, setF] = useState({ name: "", email: "", pw: "", pw2: "", ok: false });
  const [err, setErr] = useState({});
  const [busy, setBusy] = useState(false);
  const form = useRef(null);
  if (user && !busy) return <Navigate to="/dashboard" replace />;
  const set = k => e => setF({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  const submit = async e => {
    e.preventDefault();
    const v = { ...f, name: f.name.trim(), email: f.email.trim().toLowerCase() };
    const users = store.get("users", []);
    const errs = {
      name: v.name.length < 2 ? "Enter your name." : "",
      email: !EMAIL_RE.test(v.email) ? "Enter a valid email address." : users.some(u => u.email === v.email) ? "An account with this email already exists. Sign in instead." : "",
      pw: !pwRule(v.pw) ? "Use at least 8 characters with upper- and lower-case letters and a number." : "",
      pw2: v.pw !== v.pw2 ? "Passwords don't match." : "",
      ok: !v.ok ? "Please accept the terms to continue." : ""
    };
    setErr(errs);
    if (Object.values(errs).some(Boolean)) { setTimeout(() => form.current?.querySelector("[aria-invalid=true]")?.focus(), 0); return; }
    setBusy(true);
    const salt = uid(); const u = { id: uid(), name: v.name, email: v.email, role: "student", salt, hash: await hashPw(v.pw, salt), created: new Date().toISOString() };
    users.push(u); store.set("users", users); store.set("session", { userId: u.id, ts: Date.now() });
    audit(u.email, "Registered account"); toast("Account created. Welcome to MND CODE!");
    refresh(); navigate("/dashboard");
  };

  return (
    <AuthCard>
      <div className="stack" style={{ gap: 8, textAlign: "center", alignItems: "center" }}><Logo /><h1 style={{ fontSize: "var(--t-xl)" }}>Create your account</h1><p className="small muted">Track progress, quiz results and bookmarks.</p></div>
      <form className="stack" noValidate ref={form} onSubmit={submit}>
        <div className="field"><label htmlFor="r-name">Full name</label><input className="input" id="r-name" autoComplete="name" maxLength={80} value={f.name} onChange={set("name")} aria-invalid={!!err.name} /><span className="err">{err.name}</span></div>
        <div className="field"><label htmlFor="r-email">Email</label><input className="input" id="r-email" type="email" autoComplete="email" maxLength={120} value={f.email} onChange={set("email")} aria-invalid={!!err.email} /><span className="err">{err.email}</span></div>
        <div className="field"><label htmlFor="r-pw">Password</label><input className="input" id="r-pw" type="password" autoComplete="new-password" aria-describedby="r-pwh" value={f.pw} onChange={set("pw")} aria-invalid={!!err.pw} />
          <span className="hint" id="r-pwh">At least 8 characters with upper- and lower-case letters and a number.</span><span className="err">{err.pw}</span></div>
        <div className="field"><label htmlFor="r-pw2">Confirm password</label><input className="input" id="r-pw2" type="password" autoComplete="new-password" value={f.pw2} onChange={set("pw2")} aria-invalid={!!err.pw2} /><span className="err">{err.pw2}</span></div>
        <label className="row small" style={{ flexWrap: "nowrap", alignItems: "flex-start", gap: 10 }}><input type="checkbox" checked={f.ok} onChange={set("ok")} style={{ marginTop: 4, accentColor: "#22D3EE" }} /><span>I agree to the <Link to="/terms">terms</Link>, including practising security techniques only on systems I own or am authorized to test.</span></label>
        <span className="err">{err.ok}</span>
        <button className="btn btn-primary btn-lg" type="submit" disabled={busy}>{busy ? <><Spinner />Creating…</> : "Create account"}</button>
        <p className="xs dim">Demo: your account is stored only in this browser, with the password saved as a salted hash.</p>
      </form>
      <p className="small muted" style={{ textAlign: "center" }}>Already registered? <Link to="/login">Sign in</Link></p>
    </AuthCard>
  );
}
