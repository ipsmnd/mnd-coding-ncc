import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "../components/Icon.jsx";
import { Select } from "../components/Select.jsx";
import { useApp } from "../components/AppContext.jsx";
import { PageHead, Spinner, useMedia, usePageMeta } from "../components/ui.jsx";
import { EMAIL_RE, SITE, sleep, store, uid } from "../lib/config.js";
import { getCourses } from "../lib/data.js";

const RULES = {
  name: v => v.trim().length >= 2 || "Enter your name (at least 2 characters).",
  email: v => EMAIL_RE.test(v.trim()) || "Enter a valid email address, like name@example.com.",
  phone: v => !v.trim() || /^\+?[0-9 ()-]{7,20}$/.test(v.trim()) || "Use digits, spaces or + only (7–20 characters).",
  subject: v => v.trim().length >= 3 || "Add a short subject (at least 3 characters).",
  message: v => v.trim().length >= 20 || "Write at least 20 characters so we can help."
};

export default function Contact() {
  usePageMeta("Contact Us", "Contact MND CODE about courses, learning paths or partnerships.");
  const { user } = useApp();
  const narrow = useMedia("(max-width:900px)");
  const blank = () => ({ name: user ? user.name : "", email: user ? user.email : "", phone: "", course: "", subject: "", message: "" });
  const [f, setF] = useState(blank);
  const [err, setErr] = useState({});
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);
  const form = useRef(null);
  const c = SITE.contact, cs = getCourses();

  const check = n => { const r = RULES[n](f[n]); setErr(e => ({ ...e, [n]: r === true ? "" : r })); return r === true; };
  const bind = n => ({ id: "c-" + (n === "message" ? "msg" : n), name: n, value: f[n], onChange: e => setF({ ...f, [n]: e.target.value }), onBlur: () => RULES[n] && check(n), "aria-invalid": !!err[n], "aria-describedby": "e-" + n });

  const submit = async e => {
    e.preventDefault();
    const all = {}; Object.keys(RULES).forEach(n => { const r = RULES[n](f[n]); all[n] = r === true ? "" : r; });
    setErr(all);
    if (Object.values(all).some(Boolean)) { setStatus("invalid"); setTimeout(() => form.current?.querySelector("[aria-invalid=true]")?.focus(), 0); return; }
    setBusy(true); await sleep(700);
    try {
      const msgs = store.get("messages", []);
      msgs.unshift({ id: uid(), ...Object.fromEntries(Object.entries(f).map(([k, v]) => [k, String(v).trim().slice(0, 2000)])), ts: Date.now(), read: false });
      store.set("messages", msgs);
      setStatus("ok"); setF({ ...blank(), name: "", email: "" });
    } catch { setStatus("fail"); }
    setBusy(false);
  };

  return (
    <>
      <PageHead eyebrow="Contact" title="Send us a message." lead="Questions about a course, a learning path or anything else — we read every message." crumbs={[["Home", "/"], ["Contact", ""]]} />
      <section className="section-tight" style={{ paddingBottom: "clamp(56px,8vw,104px)" }}>
        <div className="wrap grid" style={{ gridTemplateColumns: narrow ? "minmax(0,1fr)" : "minmax(0,1.4fr) minmax(0,1fr)", gap: 32, alignItems: "start" }}>
          <form className="card stack" ref={form} noValidate style={{ gap: 18 }} onSubmit={submit}>
            <div className="grid g2">
              <div className="field"><label htmlFor="c-name">Full name *</label><input className="input" autoComplete="name" required maxLength={80} {...bind("name")} /><span className="err" id="e-name">{err.name}</span></div>
              <div className="field"><label htmlFor="c-email">Email *</label><input className="input" type="email" autoComplete="email" required maxLength={120} {...bind("email")} /><span className="err" id="e-email">{err.email}</span></div>
            </div>
            <div className="grid g2">
              <div className="field"><label htmlFor="c-phone">Phone <span className="dim">(optional)</span></label><input className="input" type="tel" autoComplete="tel" maxLength={20} placeholder="+91" {...bind("phone")} /><span className="err" id="e-phone">{err.phone}</span></div>
              <div className="field"><label htmlFor="c-course">Course interest</label>
                <Select id="c-course" value={f.course} onChange={v => setF({ ...f, course: v })} options={[{ value: "", label: "Not sure yet" }, ...cs.map(x => x.title), "Learning paths", "Other"]} /></div>
            </div>
            <div className="field"><label htmlFor="c-subject">Subject *</label><input className="input" required maxLength={120} {...bind("subject")} /><span className="err" id="e-subject">{err.subject}</span></div>
            <div className="field"><label htmlFor="c-msg">Message *</label><textarea className="input" required maxLength={2000} {...bind("message")} />
              <div className="row between"><span className="err" id="e-message">{err.message}</span><span className="xs dim">{f.message.length} / 2000</span></div></div>
            <p className="xs dim">We use the details you submit only to reply to your message. See the <Link to="/privacy">privacy policy</Link>.</p>
            <div className="row"><button className="btn btn-primary" type="submit" disabled={busy}>{busy ? <><Spinner />Sending…</> : <>Send message <Icon name="arrow" /></>}</button><span className="demo-flag">Demo: saved to this browser's admin inbox</span></div>
            <div aria-live="polite">
              {status === "invalid" && <div className="alert alert-bad"><Icon name="alert" /><span>Please fix the highlighted fields.</span></div>}
              {status === "ok" && <div className="alert alert-ok"><Icon name="check" /><span><strong>Message received.</strong> In this demo it is stored in the admin inbox in your browser. On the live site it will be delivered to the MND CODE team.</span></div>}
              {status === "fail" && <div className="alert alert-bad"><Icon name="alert" /><span>Your message couldn't be saved. Check that browser storage is allowed, then try again.</span></div>}
            </div>
          </form>
          <div className="stack">
            <div className="card stack"><h4>Contact details</h4>
              {[["mail", "Email", c.email], ["globe", "Website", SITE.domain], ["user", "Phone", c.phone], ["home", "Address", c.address], ["clock", "Hours", c.hours]].map(([i, l, v]) => (
                <div className="row" key={l} style={{ flexWrap: "nowrap", alignItems: "flex-start" }}><span className="icon-box" style={{ width: 36, height: 36 }}><Icon name={i} /></span><div><div className="xs dim mono">{l.toUpperCase()}</div><div className="small allow-copy">{v || <span className="dim">To be confirmed</span>}</div></div></div>
              ))}
              <p className="xs dim">Contact details are configured in <code>SITE.contact</code> and appear here once verified.</p></div>
            <div className="card stack"><h4>Before you write</h4><p className="small muted">Many common questions — prerequisites, equipment, labs, certification — are answered on the FAQ page.</p><Link className="btn btn-ghost btn-sm" to="/faq" style={{ alignSelf: "flex-start" }}>Read the FAQ</Link></div>
          </div>
        </div>
      </section>
    </>
  );
}
