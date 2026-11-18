/* ============================================================
   CLOUD, FIREWALL, QUIZ, VULNERABILITY AND REPORT LABS
   ============================================================ */
import { useCallback, useMemo, useState } from "react";
import { Icon } from "../../components/Icon.jsx";
import { Select } from "../../components/Select.jsx";
import { useApp } from "../../components/AppContext.jsx";
import { Quiz } from "../../components/ui.jsx";
import { SimNote, ip2n } from "./NetworkLabs.jsx";
import { getCourses, findCourse, LESSONS } from "../../lib/data.js";
import { prog, saveProg, touch } from "../../lib/auth.js";
import { shuffle } from "../../lib/config.js";

const Check = ({ ok }) => <Icon name={ok ? "check" : "x"} style={{ width: 15, height: 15, verticalAlign: -3, color: `var(--${ok ? "ok" : "bad"})` }} />;

/* ---------- 6. Cloud architecture builder ---------- */
const COMPS = [["igw", "Internet gateway", "vpc"], ["nat", "NAT gateway", "none"], ["lb", "Load balancer", "none"], ["app1", "App server A", "none"], ["app2", "App server B", "none"], ["db", "Database", "none"], ["bastion", "Bastion host", "none"]];
const ZONES = { none: "Not placed", vpc: "VPC edge", pubA: "Public subnet · AZ-a", pubB: "Public subnet · AZ-b", privA: "Private subnet · AZ-a", privB: "Private subnet · AZ-b" };
const initCloud = () => ({ ...Object.fromEntries(COMPS.map(c => [c[0], c[2]])), dbRule: "any", sshRule: "any" });
const COMP_ICON = { db: "server", lb: "network", nat: "route", bastion: "lock" };

export function CloudLab() {
  const [st, setSt] = useState(initCloud);
  const set = (k, v) => setSt(s => ({ ...s, [k]: v }));
  const pub = z => z === "pubA" || z === "pubB", priv = z => z === "privA" || z === "privB", az = z => z.slice(-1);
  const apps = [st.app1, st.app2];
  const checks = [
    ["Internet gateway attached to the VPC", st.igw === "vpc", "Without an internet gateway nothing in the VPC is reachable from the internet."],
    ["Load balancer in a public subnet", pub(st.lb), "The load balancer is the only component users should reach directly, so it lives in a public subnet."],
    ["App servers in private subnets", apps.every(priv), "App servers receive traffic from the load balancer; they don't need public addresses."],
    ["App servers spread across two AZs", apps.every(z => z !== "none") && az(st.app1) !== az(st.app2), "Placing both servers in one zone means a single zone outage takes the app down."],
    ["Database in a private subnet", priv(st.db), "Databases should never be directly reachable from the internet."],
    ["Database accepts traffic only from the app tier", st.dbRule === "app", "Reference the app security group instead of 0.0.0.0/0 (least privilege)."],
    ["NAT gateway in a public subnet for private outbound updates", pub(st.nat), "Private servers reach the internet for patches via a NAT gateway placed in a public subnet."],
    ["Bastion in a public subnet with SSH restricted", pub(st.bastion) && st.sshRule === "office", "If you use a bastion, limit SSH to known admin IP ranges — or prefer a managed session service."]
  ];
  const pass = checks.filter(x => x[1]).length;
  return (
    <>
      <div className="lab-pane">
        <div className="stack">
          <p className="small muted">Goal: a web application reachable from the internet, with app servers and the database kept private and the design surviving the loss of one availability zone.</p>
          {COMPS.map(([id, n]) => (
            <div className="field" key={id}><label htmlFor={"cb-" + id}>{n}</label>
              <Select id={"cb-" + id} value={st[id]} onChange={v => set(id, v)} options={Object.entries(ZONES).filter(([z]) => id === "igw" ? ["vpc", "none"].includes(z) : z !== "vpc").map(([value, label]) => ({ value, label }))} /></div>
          ))}
          <div className="field"><label htmlFor="cb-dbRule">Database security group allows port 5432 from</label>
            <Select id="cb-dbRule" value={st.dbRule} onChange={v => set("dbRule", v)} options={[{ value: "any", label: "0.0.0.0/0 (anywhere)" }, { value: "app", label: "App server security group only" }]} /></div>
          <div className="field"><label htmlFor="cb-sshRule">Bastion allows SSH (22) from</label>
            <Select id="cb-sshRule" value={st.sshRule} onChange={v => set("sshRule", v)} options={[{ value: "any", label: "0.0.0.0/0 (anywhere)" }, { value: "office", label: "Office IP range only (203.0.113.0/28)" }]} /></div>
          <div className="row">
            <button className="btn btn-ghost btn-sm" type="button" onClick={() => setSt({ igw: "vpc", nat: "pubA", lb: "pubA", app1: "privA", app2: "privB", db: "privA", bastion: "pubB", dbRule: "app", sshRule: "office" })}>Show a passing design</button>
            <button className="btn btn-quiet btn-sm" type="button" onClick={() => setSt(initCloud())}><Icon name="reset" />Reset</button>
          </div>
        </div>
        <div className="stack">
          <div className="zone" style={{ borderStyle: "solid", borderColor: "rgba(34,211,238,.4)" }}>
            <h5>VPC 10.20.0.0/16 {st.igw === "vpc" ? <span className="chip chip-cyan" style={{ marginLeft: 8 }}>IGW attached</span> : <span className="chip chip-warn" style={{ marginLeft: 8 }}>no IGW</span>}</h5>
            <div className="canvas-board">{["pubA", "pubB", "privA", "privB"].map(z => {
              const here = COMPS.filter(c => st[c[0]] === z);
              return (
                <div key={z} className={`zone ${z.startsWith("pub") ? "pub" : "priv"}`}><h5>{ZONES[z]}</h5>
                  <div className="stack" style={{ gap: 6 }}>{here.length ? here.map(c => (
                    <div className="comp" key={c[0]}><span>{c[1]}</span><Icon name={COMP_ICON[c[0]] || "layers"} style={{ width: 16, height: 16, color: "var(--cyan)" }} /></div>
                  )) : <span className="xs dim">empty</span>}</div>
                </div>);
            })}</div>
          </div>
          <div><h4 style={{ fontSize: "var(--t-base)", marginBottom: 10 }}>Design checks <span className={`chip ${pass === checks.length ? "chip-ok" : "chip-warn"}`} style={{ marginLeft: 8 }}>{pass}/{checks.length} passing</span></h4>
            <ul className="step-log">
              {checks.map(([t, ok, why]) => <li key={t} className={ok ? "on" : ""}><Check ok={ok} /> <strong>{t}</strong>{!ok && <><br /><span className="xs">{why}</span></>}</li>)}
              {pass === checks.length && <li className="on" style={{ borderColor: "rgba(34,197,94,.6)" }}><Icon name="award" style={{ width: 15, height: 15, color: "var(--ok)", verticalAlign: -3 }} /> All checks pass. This is a sound multi-AZ, three-tier layout.</li>}
            </ul></div>
        </div>
      </div>
      <SimNote />
      <p className="xs dim">Cost note: on real providers, NAT gateways and load balancers are billed hourly. This builder deploys nothing.</p>
    </>
  );
}

/* ---------- 7. Firewall rules ---------- */
const cidrMatch = (ip, cidr) => { if (cidr === "any") return true; const [n, p] = cidr.split("/"); const size = 2 ** (32 - +(p ?? 32)); return Math.floor(ip2n(ip) / size) === Math.floor(ip2n(n) / size); };
const RULES = [
  { id: 1, act: "allow", proto: "tcp", src: "any", dst: "10.0.1.10/32", port: "443", note: "HTTPS to web server" },
  { id: 2, act: "allow", proto: "tcp", src: "10.0.2.0/24", dst: "10.0.3.5/32", port: "5432", note: "App tier to database" },
  { id: 3, act: "deny", proto: "tcp", src: "any", dst: "any", port: "22", note: "Block SSH" },
  { id: 4, act: "allow", proto: "tcp", src: "192.168.50.0/24", dst: "any", port: "22", note: "Admin VPN SSH" },
  { id: 5, act: "allow", proto: "udp", src: "10.0.0.0/16", dst: "10.0.0.2/32", port: "53", note: "Internal DNS" },
  { id: 6, act: "deny", proto: "any", src: "any", dst: "any", port: "any", note: "Default deny" }];
const PKTS = [["198.51.100.23", "10.0.1.10", "tcp", 443], ["198.51.100.23", "10.0.3.5", "tcp", 5432], ["10.0.2.15", "10.0.3.5", "tcp", 5432], ["192.168.50.9", "10.0.2.15", "tcp", 22], ["10.0.2.15", "10.0.0.2", "udp", 53], ["10.0.1.10", "10.0.3.5", "tcp", 5432], ["203.0.113.4", "10.0.1.10", "tcp", 80]];
const swap = (arr, a, b) => { const n = [...arr]; [n[a], n[b]] = [n[b], n[a]]; return n; };

export function FirewallLab() {
  const [rules, setRules] = useState(RULES);
  const [guesses, setGuesses] = useState({});
  const [reveal, setReveal] = useState(false);
  const [msg, setMsg] = useState(null);
  const evalP = p => rules.find(r => (r.proto === "any" || r.proto === p[2]) && cidrMatch(p[0], r.src) && cidrMatch(p[1], r.dst) && (r.port === "any" || +r.port === p[3])) || null;
  const check = () => {
    const n = Object.keys(guesses).length;
    if (n < PKTS.length) { setMsg(<span style={{ color: "#FCD34D" }}>Predict all {PKTS.length} packets first ({n} done).</span>); return; }
    setReveal(true);
    const ok = PKTS.filter((p, i) => guesses[i] === (evalP(p) ? evalP(p).act : "deny")).length;
    setMsg(<><strong>{ok} / {PKTS.length}</strong> correct.</>);
  };
  return (
    <div>
      <p className="small muted" style={{ marginBottom: 16 }}>Rules are checked top to bottom; the first match wins. Predict each packet's outcome, then check. Try moving rule 4 above rule 3 and see what changes.</p>
      <div className="table-wrap"><table><thead><tr><th>#</th><th>Action</th><th>Proto</th><th>Source</th><th>Destination</th><th>Port</th><th>Purpose</th><th>Order</th></tr></thead><tbody>
        {rules.map((r, i) => <tr key={r.id}><td className="num">{i + 1}</td><td><span className={`chip ${r.act === "allow" ? "chip-ok" : "chip-bad"}`}>{r.act}</span></td><td className="num">{r.proto}</td><td className="num">{r.src}</td><td className="num">{r.dst}</td><td className="num">{r.port}</td><td>{r.note}</td>
          <td><div className="row" style={{ gap: 4, flexWrap: "nowrap" }}>
            <button className="btn btn-quiet btn-sm" type="button" disabled={i === 0} aria-label={`Move rule ${i + 1} up`} onClick={() => setRules(swap(rules, i, i - 1))}><Icon name="up" /></button>
            <button className="btn btn-quiet btn-sm" type="button" disabled={i === rules.length - 1} aria-label={`Move rule ${i + 1} down`} onClick={() => setRules(swap(rules, i, i + 1))}><Icon name="down" /></button>
          </div></td></tr>)}
      </tbody></table></div>
      <h4 style={{ fontSize: "var(--t-base)", margin: "24px 0 10px" }}>Synthetic traffic</h4>
      <div className="table-wrap"><table><thead><tr><th>Packet</th><th>Source</th><th>Destination</th><th>Proto/Port</th><th>Your prediction</th>{reveal && <th>Result</th>}</tr></thead><tbody>
        {PKTS.map((p, i) => { const r = evalP(p), res = r ? r.act : "deny", g = guesses[i]; return (
          <tr key={i}><td className="num">P{i + 1}</td><td className="num">{p[0]}</td><td className="num">{p[1]}</td><td className="num">{p[2]}/{p[3]}</td>
            <td><div className="row" style={{ gap: 6, flexWrap: "nowrap" }}>{["allow", "deny"].map(a => <button key={a} type="button" className={`btn btn-sm ${g === a ? (a === "allow" ? "btn-primary" : "btn-danger") : "btn-ghost"}`} aria-pressed={g === a} onClick={() => setGuesses({ ...guesses, [i]: a })}>{a}</button>)}</div></td>
            {reveal && <td><Icon name={g === res ? "check" : "x"} style={{ color: `var(--${g === res ? "ok" : "bad"})`, width: 16, height: 16, verticalAlign: -3 }} /> <strong>{res}</strong> <span className="xs dim">by rule {rules.indexOf(r) + 1} ({r.note})</span></td>}
          </tr>); })}
      </tbody></table></div>
      <div className="row" style={{ marginTop: 16 }}>
        <button className="btn btn-primary" type="button" onClick={check}>Check predictions</button>
        <button className="btn btn-quiet" type="button" onClick={() => { setRules(RULES); setGuesses({}); setReveal(false); setMsg(null); }}><Icon name="reset" />Reset</button>
        <span className="small" aria-live="polite">{msg}</span>
      </div>
      <SimNote />
    </div>
  );
}

/* ---------- 8. Knowledge quizzes ---------- */
export function QuizLab() {
  const { user, toast } = useApp();
  const cs = useMemo(() => getCourses().filter(c => c.modules.length), []);
  const [slugSel, setSlugSel] = useState(cs[0] && cs[0].slug);
  const [round, setRound] = useState(0);
  const qs = useMemo(() => {
    const c = findCourse(slugSel); if (!c) return [];
    return shuffle(c.modules.map(m => m.check).concat(c.lessons.filter(l => LESSONS[l.key]).flatMap(l => LESSONS[l.key].quiz))).slice(0, 10);
  }, [slugSel, round]); // eslint-disable-line react-hooks/exhaustive-deps
  const onDone = useCallback((s, t) => {
    if (!user) return;
    const p = prog(user); p.quiz.push({ key: "lab:" + slugSel, score: s, total: t, ts: Date.now() }); touch(user, p); saveProg(user, p);
    toast("Quiz result saved to your dashboard");
  }, [user, slugSel, toast]);
  return (
    <>
      <div className="tab-row" style={{ marginBottom: 20 }}>{cs.map(c => <button key={c.slug} type="button" aria-pressed={c.slug === slugSel} onClick={() => { setSlugSel(c.slug); setRound(r => r + 1); }}>{c.title}</button>)}</div>
      <div style={{ maxWidth: 760 }}><Quiz qs={qs} onDone={onDone} /></div>
    </>
  );
}

/* ---------- 9. Vulnerability prioritisation ---------- */
const F = [
  { id: "F1", t: "Outdated TLS configuration allows TLS 1.0", cvss: 5.3, exp: "Internet", asset: "Customer portal", exploit: "No known practical exploit", fix: "Config change" },
  { id: "F2", t: "SQL injection in login form", cvss: 9.8, exp: "Internet", asset: "Customer portal", exploit: "Public technique, trivial", fix: "Code fix" },
  { id: "F3", t: "Default credentials on lab test switch", cvss: 9.8, exp: "Isolated lab VLAN", asset: "Training equipment", exploit: "Trivial", fix: "Change password" },
  { id: "F4", t: "Missing security headers (CSP, HSTS)", cvss: 4.3, exp: "Internet", asset: "Marketing site", exploit: "Requires another flaw", fix: "Config change" },
  { id: "F5", t: "Unpatched file server with remote code execution", cvss: 8.8, exp: "Internal network", asset: "HR file server", exploit: "Public exploit available", fix: "Vendor patch" },
  { id: "F6", t: "Verbose error messages reveal software versions", cvss: 5.3, exp: "Internet", asset: "Customer portal", exploit: "Information only", fix: "Config change" }];
const ef = { "Internet": 1, "Internal network": .75, "Isolated lab VLAN": .25 }, af = { "Customer portal": 1, "HR file server": .9, "Marketing site": .5, "Training equipment": .3 };
const xf = e => /trivial|public exploit/i.test(e) ? 1 : /public technique/i.test(e) ? 1 : /requires/i.test(e) ? .6 : .5;
const risk = f => +(f.cvss * ef[f.exp] * af[f.asset] * xf(f.exploit)).toFixed(2);
const REF = [...F].sort((a, b) => risk(b) - risk(a)).map(f => f.id);

export function VulnLab() {
  const [order, setOrder] = useState(() => shuffle(F.map(f => f.id)));
  const [checked, setChecked] = useState(false);
  const close = order.filter((id, i) => Math.abs(REF.indexOf(id) - i) <= 1).length;
  return (
    <div>
      <p className="small muted" style={{ marginBottom: 16 }}>Order these sample findings from highest to lowest <strong>risk</strong> for this fictional organisation. Consider exposure, asset value and exploitability — not just the CVSS score.</p>
      <ol className="prio-list">{order.map((id, i) => {
        const f = F.find(x => x.id === id), ri = REF.indexOf(id);
        return (
          <li key={id}><span className="rank">{i + 1}</span>
            <div style={{ minWidth: 0 }}><strong className="small">{id} · {f.t}</strong>
              <div className="row" style={{ gap: 6, marginTop: 6 }}><span className={`chip ${f.cvss >= 9 ? "chip-bad" : f.cvss >= 7 ? "chip-warn" : f.cvss >= 4 ? "chip-blue" : ""}`}>CVSS {f.cvss}</span><span className="chip">{f.exp}</span><span className="chip">{f.asset}</span><span className="chip">{f.exploit}</span></div>
              {checked && <div className="xs" style={{ marginTop: 6, color: Math.abs(ri - i) <= 1 ? "#86EFAC" : "#FDA4AF" }}>Reference position {ri + 1} · context score {risk(f)}</div>}
            </div>
            <div className="row" style={{ gap: 4, flexWrap: "nowrap" }}>
              <button className="btn btn-quiet btn-sm" type="button" disabled={i === 0} aria-label={`Move ${id} up`} onClick={() => setOrder(swap(order, i, i - 1))}><Icon name="up" /></button>
              <button className="btn btn-quiet btn-sm" type="button" disabled={i === order.length - 1} aria-label={`Move ${id} down`} onClick={() => setOrder(swap(order, i, i + 1))}><Icon name="down" /></button>
            </div></li>);
      })}</ol>
      <div className="row" style={{ marginTop: 16 }}>
        <button className="btn btn-primary" type="button" onClick={() => setChecked(true)}>Check my ranking</button>
        <button className="btn btn-quiet" type="button" onClick={() => { setOrder(shuffle(order)); setChecked(false); }}><Icon name="reset" />Shuffle</button>
      </div>
      <div aria-live="polite" style={{ marginTop: 16 }}>{checked && (
        <div className={`alert ${close >= 5 ? "alert-ok" : "alert-info"}`}><Icon name="info" /><div><strong>{close} of {F.length} findings within one place of the reference order.</strong>
          <p className="small" style={{ marginTop: 6 }}>Reference order: {REF.join(" → ")}. Context score = CVSS × exposure × asset value × exploitability. Note how F3, despite CVSS 9.8, ranks low because it sits on an isolated lab VLAN, while F2 tops the list: internet-facing, high-value and trivially exploitable. Real teams also weigh fix effort and business deadlines.</p></div></div>
      )}</div>
      <SimNote />
    </div>
  );
}

/* ---------- 10. Report writing ---------- */
const EMPTY_REPORT = { title: "", sev: "", asset: "", cvss: "", desc: "", ev: "", imp: "", fix: "" };
const EXAMPLE_REPORT = { title: "SQL injection in product search parameter", sev: "High", asset: "app.lab.example (10.10.0.30) — /search", cvss: "7.5", desc: "The search page builds its database query by concatenating user input into SQL. Input containing a single quote changes the query structure.", ev: "1. Sign in with the provided test account.\n2. Open /search and enter a single quote ( ' ).\n3. Observe a database error message.\n4. Enter a crafted condition (see appendix A, lab only) and observe that unpublished products are returned.", imp: "An attacker could read every product record, including unpublished items and supplier prices, exposing confidential commercial data. Depending on database permissions, records might also be modified.", fix: "Use parameterized queries (prepared statements) for all database access in the search feature. Run the application with a least-privilege database account, validate input against an allow-list, and replace detailed database errors with a generic error page. Retest after the fix." };

function reviewReport(f) {
  const v = k => f[k].trim();
  const all = [v("title"), v("desc"), v("ev"), v("imp"), v("fix")].join(" ").toLowerCase(), cv = v("cvss");
  return [
    ["Specific title naming the weakness and location", v("title").length >= 12 && /sql|inject/i.test(v("title")) && /search/i.test(v("title") + v("asset")), "Name the vulnerability type and where it occurs, e.g. 'SQL injection in product search'."],
    ["Severity is reasonable for the impact", ["High", "Critical"].includes(v("sev")), "Exposure of unpublished commercial data via injection usually rates High (or Critical if it allows modification)."],
    ["Affected asset matches the authorized scope", /app\.lab\.example|10\.10\.0\.30/.test(v("asset")), "Use the exact in-scope host from the scenario."],
    ["CVSS value, if given, is valid", !cv || (/^\d{1,2}(\.\d)?$/.test(cv) && +cv >= 0 && +cv <= 10), "CVSS scores range from 0.0 to 10.0 with one decimal place."],
    ["Reproduction steps are present", v("ev").length >= 40, "Give numbered steps someone else could follow in the lab."],
    ["No credentials or unnecessary sensitive data in evidence", !/lab!pass99/i.test(all), "Never paste the test account password into a report. Refer to 'the provided test account' instead."],
    ["Impact describes the data and business effect", /record|data|price|supplier|unpublished|confidential/i.test(v("imp")), "Say what an attacker could read or change, and why it matters."],
    ["Remediation recommends parameterized queries", /parameter|prepared statement|bind/i.test(v("fix")), "The primary fix for SQL injection is parameterized queries (prepared statements)."],
    ["Remediation includes a supporting control", /least privilege|error|validat|allow-?list|waf|account/i.test(v("fix")), "Add defence in depth: generic error pages, input validation, least-privilege DB account."]
  ];
}

export function ReportLab() {
  const [f, setF] = useState(EMPTY_REPORT);
  const [review, setReview] = useState(null); // snapshot of the form when reviewed
  const field = k => ({ id: "rp-" + k, value: f[k], onChange: e => setF({ ...f, [k]: e.target.value }) });
  const checks = review && reviewReport(review), pass = checks ? checks.filter(c => c[1]).length : 0;
  return (
    <>
      <div className="callout" style={{ marginBottom: 20 }}><h4>Fictional lab scenario</h4><p className="small">Authorized scope: <code>app.lab.example</code> (10.10.0.30), a practice application in your isolated lab. While testing the search page, you found that entering a single quote produced a database error, and a crafted input returned every product record including unpublished ones. A test account <code>tester01</code> with password <code>Lab!Pass99</code> was provided for the engagement. Unpublished records contain supplier prices.</p></div>
      <form className="grid g2" style={{ gap: 16 }} onSubmit={e => e.preventDefault()}>
        <div className="field"><label htmlFor="rp-title">Finding title</label><input className="input" placeholder="Short, specific title" {...field("title")} /></div>
        <div className="field"><label htmlFor="rp-sev">Severity</label><Select id="rp-sev" value={f.sev} onChange={v => setF({ ...f, sev: v })} options={[{ value: "", label: "Choose…" }, "Low", "Medium", "High", "Critical"]} /></div>
        <div className="field"><label htmlFor="rp-asset">Affected asset</label><input className="input mono-in" placeholder="host / URL" {...field("asset")} /></div>
        <div className="field"><label htmlFor="rp-cvss">CVSS base score (optional)</label><input className="input mono-in" placeholder="0.0 – 10.0" inputMode="decimal" {...field("cvss")} /></div>
        <div className="field" style={{ gridColumn: "1/-1" }}><label htmlFor="rp-desc">Description</label><textarea className="input" placeholder="What is the weakness and where does it occur?" {...field("desc")} /></div>
        <div className="field" style={{ gridColumn: "1/-1" }}><label htmlFor="rp-ev">Evidence & reproduction steps (within the authorized lab)</label><textarea className="input" placeholder="Steps a developer could follow to confirm it in the lab" {...field("ev")} /></div>
        <div className="field" style={{ gridColumn: "1/-1" }}><label htmlFor="rp-imp">Impact</label><textarea className="input" style={{ minHeight: 90 }} placeholder="What could happen and to which data?" {...field("imp")} /></div>
        <div className="field" style={{ gridColumn: "1/-1" }}><label htmlFor="rp-fix">Remediation</label><textarea className="input" style={{ minHeight: 90 }} placeholder="How should the team fix it?" {...field("fix")} /></div>
        <div className="row" style={{ gridColumn: "1/-1" }}>
          <button className="btn btn-primary" type="button" onClick={() => setReview({ ...f })}>Review my finding</button>
          <button className="btn btn-ghost" type="button" onClick={() => { setF(EXAMPLE_REPORT); setReview(EXAMPLE_REPORT); }}>Load example answer</button>
          <button className="btn btn-quiet" type="button" onClick={() => { setF(EMPTY_REPORT); setReview(null); }}><Icon name="reset" />Clear</button>
        </div>
      </form>
      <div style={{ marginTop: 24 }} aria-live="polite">{review && (
        <div className="grid g2" style={{ gap: 20, alignItems: "start" }}>
          <div className="stack">
            <div className="row between"><h4>Review</h4><span className={`chip ${pass === checks.length ? "chip-ok" : pass >= 6 ? "chip-blue" : "chip-warn"}`}>{pass}/{checks.length}</span></div>
            <ul className="step-log">{checks.map(([t, ok, tip]) => <li key={t} className={ok ? "on" : ""}><Check ok={ok} /> <strong>{t}</strong>{!ok && <><br /><span className="xs">{tip}</span></>}</li>)}</ul>
          </div>
          <div className="card" style={{ background: "#fff", color: "#0B1220", borderColor: "#D9E1EC" }}>
            <div className="xs mono" style={{ color: "#475569" }}>FINDING PREVIEW · FICTIONAL LAB</div>
            <h3 style={{ color: "#0B1220", margin: "8px 0" }}>{review.title.trim() || "Untitled finding"}</h3>
            <p className="small" style={{ color: "#475569" }}>Severity: <strong>{review.sev || "—"}</strong>{review.cvss.trim() && ` · CVSS ${review.cvss.trim()}`} · Asset: <code style={{ background: "#EEF2F8", color: "#0B1220" }}>{review.asset.trim() || "—"}</code></p>
            {[["Description", "desc"], ["Evidence", "ev"], ["Impact", "imp"], ["Remediation", "fix"]].map(([h, k]) => (
              <div key={k}><h4 style={{ color: "#0B1220", fontSize: "var(--t-sm)", marginTop: 14 }}>{h}</h4><p className="small" style={{ color: "#334155", whiteSpace: "pre-wrap" }}>{review[k].trim() || "—"}</p></div>
            ))}
          </div>
        </div>
      )}</div>
    </>
  );
}
