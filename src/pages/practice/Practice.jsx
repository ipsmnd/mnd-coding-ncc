/* ============================================================
   PRACTICE ARENA — topic-wise practice and timed mock exams.
   Progress is stored in this browser only.
   ============================================================ */
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Icon } from "../../components/Icon.jsx";
import { useApp } from "../../components/AppContext.jsx";
import { Select } from "../../components/Select.jsx";
import { Empty, LevelChip, PageHead, Progress, usePageMeta } from "../../components/ui.jsx";
import { fmtDT, store } from "../../lib/config.js";
import { PA, paAnswered, paAnswerText, paFmtTime, paGrade, paInitResp, paModProg, paNorm, paPerm, paProg, paRespText, paSaveProg, paStats, shortTitle } from "./engine.js";
import { DomainChip, QuestionInput, TypeChip } from "./QuestionInput.jsx";

export default function Practice() {
  usePageMeta("Practice Arena", "Practice Arena — topic-wise practice questions and timed mock exams for networking, cloud and cybersecurity, with six question types and instant feedback.");
  const { confirm, toast } = useApp();
  const [params, setParams] = useSearchParams();
  const mode = params.get("mode") === "exam" ? "exam" : "topics";
  const [tick, setTick] = useState(0); // bumps after progress is saved, so the stats re-read storage
  const bump = () => setTick(t => t + 1);
  const [resetKey, setResetKey] = useState(0); // remounts the pane after "Reset progress"
  const [jumpTo, setJumpTo] = useState(() => { const m = +params.get("m"); return PA.byId.has(m) ? m : null; });

  const switchMode = (m, open = null) => { setJumpTo(open); setParams(m === "exam" ? { mode: "exam" } : {}, { replace: true }); };
  const reset = async () => {
    if (!await confirm({ title: "Reset practice progress?", body: "This clears your topic answers, mock exam history and any exam in progress on this device.", confirm: "Reset", danger: true })) return;
    ["practice:progress", "practice:exams", "practice:active"].forEach(k => store.del(k));
    bump(); setResetKey(k => k + 1); toast("Practice progress reset");
  };

  return (
    <>
      <PageHead eyebrow="Practice Arena" title={<>Mock tests that get you <span className="grad-text">exam-ready.</span></>} crumbs={[["Home", "/"], ["Practice Arena", ""]]}
        lead={`${PA.total} practice questions across ${PA.modules.length} topics in six formats — multiple choice, true/false, multi-select, fill in the blank, ordering and matching. Practise topic by topic, then sit a timed mock exam.`} />
      <section className="section-tight" style={{ paddingBottom: "clamp(56px,8vw,104px)" }}><div className="wrap stack" style={{ gap: 20 }}>
        <Stats tick={tick} />
        <div className="row between">
          <div className="tab-row" role="group" aria-label="Practice mode">
            <button type="button" aria-pressed={mode === "topics"} onClick={() => switchMode("topics")}><Icon name="book" style={{ width: 15, height: 15, verticalAlign: -2 }} /> Topic practice</button>
            <button type="button" aria-pressed={mode === "exam"} onClick={() => switchMode("exam")}><Icon name="clock" style={{ width: 15, height: 15, verticalAlign: -2 }} /> Mock exam</button>
          </div>
          <button type="button" className="btn btn-quiet btn-sm" onClick={reset}><Icon name="reset" />Reset progress</button>
        </div>
        <div id="paPane">
          {mode === "exam" ? <MockExam key={"e" + resetKey} onChange={bump} onPractise={id => switchMode("topics", id)} />
            : <Topics key={"t" + resetKey} initialOpen={jumpTo} onChange={bump} />}
        </div>
      </div></section>
    </>
  );
}

function Stats({ tick }) { // eslint-disable-line no-unused-vars
  const all = paProg(); let passed = 0, correct = 0;
  PA.modules.forEach(m => { const s = paStats(m, all); if (s.status === "passed") passed++; correct += s.correct; });
  const exams = store.get("practice:exams", []);
  const best = exams.length ? Math.max(...exams.map(e => e.pct)) + "%" : "—";
  return (
    <div className="grid g4 pa-stats">
      {[["Topics passed", `${passed}/${PA.modules.length}`], ["Questions correct", `${correct}/${PA.total}`], ["Best mock score", best], ["Mock exams taken", exams.length]].map(([l, v]) => (
        <div className="card stat" style={{ padding: 18 }} key={l}><span>{l}</span><b>{v}</b></div>
      ))}
      <Progress style={{ gridColumn: "1/-1" }} value={correct / PA.total * 100} />
    </div>
  );
}

/* ================= Topic practice ================= */
function Topics({ initialOpen, onChange }) {
  const [ui, setUi] = useState({ domain: "All", diff: "All", status: "All", q: "", page: 1, open: initialOpen });
  const [, force] = useState(0);
  const list = useRef(null);
  const all = paProg(), q = paNorm(ui.q);
  const filtered = PA.modules.filter(m => (ui.domain === "All" || m.domain === ui.domain) && (ui.diff === "All" || m.difficulty === ui.diff) &&
    (ui.status === "All" || paStats(m, all).status === ui.status) && (!q || paNorm(m.title + " " + m.description).includes(q)));
  const pages = Math.max(1, Math.ceil(filtered.length / PA.PER_PAGE));
  const page = Math.min(ui.page, pages);
  const items = filtered.slice((page - 1) * PA.PER_PAGE, page * PA.PER_PAGE);
  const set = patch => setUi(s => ({ ...s, page: 1, ...patch }));
  const saved = () => { force(x => x + 1); onChange(); };

  useEffect(() => {
    if (!initialOpen) return;
    const i = filtered.findIndex(m => m.id === initialOpen);
    if (i >= 0) setUi(s => ({ ...s, page: Math.floor(i / PA.PER_PAGE) + 1 }));
    setTimeout(() => document.querySelector(`.pa-mod[data-id="${initialOpen}"]`)?.scrollIntoView({ block: "start", behavior: "smooth" }), 80);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = id => {
    setUi(s => ({ ...s, open: s.open === id ? null : id }));
    setTimeout(() => { const card = document.querySelector(`.pa-mod[data-id="${id}"]`); if (card && card.getBoundingClientRect().top < 70) card.scrollIntoView({ block: "start", behavior: "smooth" }); }, 0);
  };
  const nextMod = id => {
    const i = filtered.findIndex(x => x.id === id), nx = filtered[i + 1] || filtered[0];
    if (!nx || nx.id === id) return;
    setUi(s => ({ ...s, open: nx.id, page: Math.floor(filtered.indexOf(nx) / PA.PER_PAGE) + 1 }));
    setTimeout(() => document.querySelector(`.pa-mod[data-id="${nx.id}"]`)?.scrollIntoView({ block: "start", behavior: "smooth" }), 0);
  };

  return (
    <>
      <div className="card pa-filters">
        <div className="tab-row" role="group" aria-label="Domain">{["All", ...PA.DOMAINS].map(d => <button key={d} type="button" aria-pressed={ui.domain === d} onClick={() => set({ domain: d })}>{d === "All" ? "All domains" : d}</button>)}</div>
        <div className="pa-filter-row">
          <div className="field pa-grow"><label htmlFor="paQ">Search topics</label><input className="input" id="paQ" type="search" placeholder="e.g. subnetting, Kubernetes, OAuth" value={ui.q} onChange={e => set({ q: e.target.value })} /></div>
          <div className="field"><label htmlFor="paDiff">Difficulty</label><Select id="paDiff" value={ui.diff} onChange={v => set({ diff: v })} options={["All", "Beginner", "Intermediate", "Advanced"].map(v => ({ value: v, label: v === "All" ? "All levels" : v }))} /></div>
          <div className="field"><label htmlFor="paStatus">Status</label><Select id="paStatus" value={ui.status} onChange={v => set({ status: v })} options={[["All", "All statuses"], ["new", "Not started"], ["progress", "In progress"], ["passed", "Passed"], ["retry", "Needs retry"]].map(([value, label]) => ({ value, label }))} /></div>
        </div>
      </div>
      <div className="pa-list" ref={list}>
        {items.length ? items.map(m => <ModuleCard key={m.id} m={m} open={ui.open === m.id} onToggle={() => toggle(m.id)} onSaved={saved} onNext={() => nextMod(m.id)} />)
          : <Empty title="No topics match your filters."><span className="small">Try a different domain, level, status or search term.</span></Empty>}
      </div>
      <div className="row between">
        <button type="button" className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => { setUi(s => ({ ...s, page: page - 1 })); list.current?.scrollIntoView({ block: "start", behavior: "smooth" }); }}><Icon name="left" />Previous</button>
        <span className="small muted">Page {page} of {pages} · {filtered.length} topics</span>
        <button type="button" className="btn btn-ghost btn-sm" disabled={page >= pages} onClick={() => { setUi(s => ({ ...s, page: page + 1 })); list.current?.scrollIntoView({ block: "start", behavior: "smooth" }); }}>Next<Icon name="arrow" /></button>
      </div>
    </>
  );
}

function ModuleCard({ m, open, onToggle, onSaved, onNext }) {
  const card = useRef(null);
  const all = paProg(), s = paStats(m, all), p = all[m.id];
  const status = { new: null, progress: <span className="chip chip-warn">{s.correct}/{m.qs.length} · in progress</span>, passed: <span className="chip chip-ok"><Icon name="check" style={{ width: 12, height: 12 }} />Passed {s.correct}/{m.qs.length}</span>, retry: <span className="chip chip-bad">Retry {s.correct}/{m.qs.length}</span> }[s.status];

  /* mutate this module's saved progress, then re-render */
  const edit = (fn, focusSel) => {
    const a = paProg(), mp = paModProg(a, m.id); const r = fn(mp, a); paSaveProg(a); onSaved();
    if (focusSel) setTimeout(() => card.current?.querySelector(focusSel)?.focus(), 0);
    return r;
  };

  return (
    <article className={`pa-mod ${open ? "open" : ""}`} data-id={m.id} ref={card}>
      <button type="button" className="pa-mod-head" aria-expanded={open} onClick={onToggle}>
        <span className="mod-num mono">{String(m.id).padStart(2, "0")}</span>
        <span className="pa-grow stack" style={{ gap: 6 }}><span className="pa-mod-title">{shortTitle(m)}</span>
          <span className="row" style={{ gap: 6 }}><DomainChip d={m.domain} /><LevelChip level={m.difficulty} /><span className="xs dim mono">{m.qs.length} questions</span>
            <span className="pa-dots" aria-hidden="true">{m.qs.map((_, i) => <i key={i} className={p && p.res[i] === true ? "ok" : p && p.res[i] === false ? "bad" : ""} />)}</span>{status}</span></span>
        <Icon name="chev" className="icon pa-chev" />
      </button>
      {open && <div className="pa-mod-body"><p className="small muted">{m.description}</p>
        {p && p.view === "summary" ? <Summary m={m} edit={edit} onNext={onNext} /> : <TopicQuiz m={m} edit={edit} />}</div>}
    </article>
  );
}

function TopicQuiz({ m, edit }) {
  const all = paProg(), p = all[m.id] || { qi: 0, resp: {}, res: {} };
  const qi = p.qi >= 0 && p.qi < m.qs.length ? p.qi : 0, q = m.qs[qi];
  const r = p.resp[qi] !== undefined ? p.resp[qi] : paInitResp(q, m.id, qi);
  const checked = p.res[qi] !== undefined, last = qi === m.qs.length - 1;
  const check = () => { if (!paAnswered(q, r)) return; edit(mp => { mp.resp[qi] = r; mp.res[qi] = paGrade(q, r); }, `[data-act="next"].btn-primary,[data-act="finish"],[data-act="retry-q"]`); };
  const go = fn => edit(fn);
  return (
    <div className="pa-quiz quiz">
      <div className="row between">
        <div className="row" style={{ gap: 6 }}>{m.qs.map((_, i) => <button key={i} type="button" className={`pa-step ${i === qi ? "cur" : ""} ${p.res[i] === true ? "ok" : p.res[i] === false ? "bad" : ""}`} aria-label={`Question ${i + 1}`} onClick={() => go(mp => { mp.qi = i; mp.view = "quiz"; })}>{i + 1}</button>)}</div>
        <span className="xs dim mono">Question {qi + 1} of {m.qs.length}</span>
      </div>
      <div className="row" style={{ gap: 8 }}><TypeChip q={q} /><span className="xs dim">{PA.TYPE_HINT[q.t]}</span></div>
      <h4 className="pa-q">{q.q}</h4>
      <QuestionInput key={m.id + "-" + qi} q={q} r={r} modId={m.id} qi={qi} reveal={checked} locked={checked} onChange={n => edit(mp => { mp.resp[qi] = n; })} onEnter={check} />
      {checked && (p.res[qi]
        ? <div className="alert alert-ok"><Icon name="check" /><div><strong>Correct!</strong> {last ? "Open your results to finish this topic." : "Move on to the next question."}</div></div>
        : <div className="alert alert-bad"><Icon name="alert" /><div><strong>Not quite.</strong> Correct answer: {paAnswerText(q)}</div></div>)}
      <div className="row between">
        <div className="row" style={{ gap: 6 }}>
          <button type="button" className="btn btn-ghost btn-sm" disabled={qi === 0} onClick={() => go(mp => { if (mp.qi > 0) mp.qi--; })}><Icon name="left" />Previous</button>
          {checked && !p.res[qi] && <button type="button" className="btn btn-quiet btn-sm" data-act="retry-q" onClick={() => go(mp => { delete mp.res[qi]; delete mp.resp[qi]; })}><Icon name="reset" />Try again</button>}
        </div>
        <div className="row" style={{ gap: 6 }}>
          {!checked && !last && <button type="button" className="btn btn-quiet btn-sm" data-act="next" onClick={() => go(mp => { mp.qi = qi + 1; })}>Skip</button>}
          {!checked ? <button type="button" className="btn btn-primary btn-sm" disabled={!paAnswered(q, r)} onClick={check}>Check answer</button>
            : last ? <button type="button" className="btn btn-primary btn-sm" data-act="finish" onClick={() => go(mp => { mp.view = "summary"; })}>See results<Icon name="arrow" /></button>
              : <button type="button" className="btn btn-primary btn-sm" data-act="next" onClick={() => go(mp => { mp.qi = qi + 1; })}>Next question<Icon name="arrow" /></button>}
        </div>
      </div>
    </div>
  );
}

function Summary({ m, edit, onNext }) {
  const all = paProg(), p = all[m.id], s = paStats(m, all), need = Math.ceil(m.qs.length * PA.PASS_RATIO), left = m.qs.length - s.checked;
  return (
    <div className="pa-quiz quiz">
      <div className="row" style={{ alignItems: "baseline", gap: 10 }}><b className="pa-score">{s.correct}/{m.qs.length}</b><span className="small muted">correct</span></div>
      {s.status === "passed" ? <div className="alert alert-ok"><Icon name="award" /><div><strong>Topic passed.</strong> You answered {s.correct} of {m.qs.length} correctly.</div></div>
        : left ? <div className="alert alert-warn"><Icon name="info" /><div><strong>{left} question{left > 1 ? "s" : ""} still unanswered.</strong> Answer them all to complete the topic — {need} correct needed to pass.</div></div>
          : <div className="alert alert-bad"><Icon name="alert" /><div><strong>Not passed yet.</strong> You need {need} of {m.qs.length}. Review your misses and retry.</div></div>}
      <ul className="pa-review">{m.qs.map((q, i) => (
        <li key={i}>{p.res[i] === true ? <Icon name="check" className="icon pa-ok" /> : p.res[i] === false ? <Icon name="x" className="icon pa-bad" /> : <span className="dim">–</span>}
          <span><span className="xs dim mono">Q{i + 1} · {PA.TYPE_LABEL[q.t]}</span><br />{q.q}</span></li>))}</ul>
      <div className="row">
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => edit(mp => { mp.view = "quiz"; mp.qi = 0; })}>Review answers</button>
        <button type="button" className="btn btn-quiet btn-sm" onClick={() => edit((mp, a) => { a[m.id] = { qi: 0, view: "quiz", resp: {}, res: {} }; })}><Icon name="reset" />Retry topic</button>
        <span className="pa-grow" />
        <button type="button" className="btn btn-primary btn-sm" onClick={onNext}>Next topic<Icon name="arrow" /></button>
      </div>
    </div>
  );
}

/* ================= Mock exam ================= */
const getActive = () => store.get("practice:active", null);
const setActive = a => a ? store.set("practice:active", a) : store.del("practice:active");
const examQ = ([mid, qi]) => PA.byId.get(mid).qs[qi];
const examResp = (ex, i) => { const it = ex.items[i]; return ex.resp[i] !== undefined ? ex.resp[i] : paInitResp(examQ(it), it[0], it[1]); };
const remaining = ex => ex.limit ? Math.max(0, Math.round(ex.limit - (Date.now() - ex.started) / 1000)) : null;
const scrollPane = () => document.getElementById("paPane")?.scrollIntoView({ block: "start", behavior: "smooth" });

function MockExam({ onChange, onPractise }) {
  const [ex, setEx] = useState(getActive);
  const update = next => { setActive(next); setEx(next ? { ...next } : null); };
  if (ex && ex.done) return <ExamResult ex={ex} onNew={() => update(null)} onPractise={id => { setActive(null); onPractise(id); }} />;
  if (ex) return <ExamRunning ex={ex} update={update} onFinished={onChange} />;
  return <ExamSetup onStart={e => { update(e); scrollPane(); }} />;
}

function ExamSetup({ onStart }) {
  const [domain, setDomain] = useState("All"), [n, setN] = useState(20), [timed, setTimed] = useState(true);
  const hist = store.get("practice:exams", []);
  const pool = d => PA.modules.filter(m => d === "All" || m.domain === d).reduce((k, m) => k + m.qs.length, 0);
  const start = () => {
    const all = []; PA.modules.forEach(m => { if (domain === "All" || m.domain === domain) m.qs.forEach((_, qi) => all.push([m.id, qi])); });
    const order = paPerm(all.length, Date.now() % 2147483647), count = Math.min(n, all.length);
    onStart({ items: order.slice(0, count).map(i => all[i]), resp: {}, flags: {}, idx: 0, started: Date.now(), limit: timed ? count * 60 : 0, domain });
  };
  return (
    <div className="grid pa-exam-grid">
      <div className="card stack" style={{ gap: 20 }}>
        <div className="row"><span className="icon-box"><Icon name="clock" /></span><div><h3>Start a mock exam</h3><p className="small muted">Random questions, no hints until you submit — just like the real thing.</p></div></div>
        <div className="stack" style={{ gap: 8 }}><span className="small" style={{ color: "#CBD5E1", fontWeight: 500 }}>Domain</span>
          <div className="tab-row" role="group" aria-label="Exam domain">{["All", ...PA.DOMAINS].map(d => <button key={d} type="button" aria-pressed={domain === d} onClick={() => setDomain(d)}>{d === "All" ? "All domains" : d} <span className="xs dim">{pool(d)}</span></button>)}</div></div>
        <div className="stack" style={{ gap: 8 }}><span className="small" style={{ color: "#CBD5E1", fontWeight: 500 }}>Number of questions</span>
          <div className="tab-row" role="group" aria-label="Number of questions">{[10, 20, 30].map(k => <button key={k} type="button" aria-pressed={n === k} onClick={() => setN(k)}>{k} questions</button>)}</div></div>
        <div className="stack" style={{ gap: 8 }}><span className="small" style={{ color: "#CBD5E1", fontWeight: 500 }}>Timer</span>
          <div className="tab-row" role="group" aria-label="Timer"><button type="button" aria-pressed={timed} onClick={() => setTimed(true)}>Timed · 1 min per question</button><button type="button" aria-pressed={!timed} onClick={() => setTimed(false)}>Untimed</button></div></div>
        <div className="callout"><h4>Exam rules</h4><p className="small muted">Answers are saved as you go and you can jump between questions or flag them for review. Results, explanations and a domain breakdown appear after you submit. Pass mark: {PA.EXAM_PASS}%.</p></div>
        <div><button type="button" className="btn btn-primary btn-lg" onClick={start}><Icon name="play" />Start mock exam</button></div>
      </div>
      <div className="card stack" style={{ gap: 14 }}>
        <h4>Recent attempts</h4>
        {hist.length ? <ul className="pa-hist">{hist.slice(0, 8).map((h, k) => (
          <li key={k}><span className={`chip ${h.pct >= PA.EXAM_PASS ? "chip-ok" : "chip-bad"}`}>{h.pct}%</span><span className="pa-grow small">{h.domain === "All" ? "All domains" : h.domain} · {h.n} Qs<br /><span className="xs dim">{fmtDT(h.date)} · {paFmtTime(h.secs)}</span></span></li>
        ))}</ul> : <div className="empty" style={{ padding: "28px 16px" }}><Icon name="award" /><span className="small">No attempts yet. Your scores will appear here.</span></div>}
      </div>
    </div>
  );
}

function finishExam(ex) {
  const correct = ex.items.filter((it, k) => paGrade(examQ(it), ex.resp[k])).length;
  const pct = Math.round((correct / ex.items.length) * 100);
  const secs = Math.round(Math.min(ex.limit || Infinity, (Date.now() - ex.started) / 1000));
  const done = { ...ex, done: true, correct, pct, secs };
  const hist = store.get("practice:exams", []);
  hist.unshift({ date: new Date().toISOString(), domain: ex.domain, n: ex.items.length, correct, pct, secs });
  store.set("practice:exams", hist.slice(0, 20));
  return done;
}

function ExamRunning({ ex, update, onFinished }) {
  const { confirm, toast } = useApp();
  const [, setNow] = useState(Date.now());
  const exRef = useRef(ex); exRef.current = ex;
  const i = ex.idx, it = ex.items[i], q = examQ(it), m = PA.byId.get(it[0]), r = examResp(ex, i);
  const isDone = k => ex.resp[k] !== undefined && paAnswered(examQ(ex.items[k]), ex.resp[k]);
  const answeredN = ex.items.filter((_, k) => isDone(k)).length;
  const left = remaining(ex);
  const finish = () => { update(finishExam(exRef.current)); onFinished(); scrollPane(); };

  useEffect(() => {
    if (!ex.limit) return;
    const t = setInterval(() => {
      setNow(Date.now());
      if (remaining(exRef.current) <= 0) { clearInterval(t); toast("Time's up — your exam was submitted", "info"); finish(); }
    }, 1000);
    return () => clearInterval(t);
  }, [ex.started]); // eslint-disable-line react-hooks/exhaustive-deps

  const act = async a => {
    const next = { ...ex, resp: { ...ex.resp }, flags: { ...ex.flags } };
    if (q.t === "order" && next.resp[i] === undefined && (a === "next" || a === "submit")) next.resp[i] = examResp(ex, i);
    if (a === "prev") next.idx--;
    else if (a === "next") next.idx++;
    else if (a === "flag") next.flags[i] = !next.flags[i];
    else if (a === "quit") { if (!await confirm({ title: "Abandon this exam?", body: "Your answers for this attempt will be discarded and it won't be scored.", confirm: "Abandon", danger: true })) return; update(null); return; }
    else if (a === "submit") {
      const un = next.items.filter((_, k) => !(next.resp[k] !== undefined && paAnswered(examQ(next.items[k]), next.resp[k]))).length;
      if (!await confirm({ title: "Submit your exam?", body: un ? `${un} question${un > 1 ? "s are" : " is"} still unanswered and will be marked wrong.` : "You have answered every question.", confirm: "Submit" })) return;
      exRef.current = next; finish(); return;
    }
    update(next);
  };
  const goto = k => update({ ...ex, idx: k });

  return (
    <div className="grid pa-exam-grid">
      <div className="card stack" style={{ gap: 18 }}>
        <div className="row between"><span className="xs mono dim">Question {i + 1} of {ex.items.length}</span>
          {left !== null ? <span className={`chip ${left < 60 ? "chip-bad" : "chip-cyan"} mono`}><Icon name="clock" style={{ width: 13, height: 13 }} />{paFmtTime(left)}</span> : <span className="chip mono">Untimed</span>}</div>
        <Progress value={((i + 1) / ex.items.length) * 100} />
        <div className="row" style={{ gap: 6 }}><TypeChip q={q} /><DomainChip d={m.domain} /><span className="xs dim">{shortTitle(m)}</span></div>
        <h4 className="pa-q">{q.q}</h4>
        <p className="xs dim" style={{ marginTop: -8 }}>{PA.TYPE_HINT[q.t].replace(", then press Enter or Check answer", "")}</p>
        <QuestionInput key={i} q={q} r={r} modId={it[0]} qi={it[1]} onChange={n => update({ ...ex, resp: { ...ex.resp, [i]: n } })} onEnter={() => act(i < ex.items.length - 1 ? "next" : "submit")} />
        <div className="row between">
          <div className="row" style={{ gap: 6 }}>
            <button type="button" className="btn btn-ghost btn-sm" disabled={i === 0} onClick={() => act("prev")}><Icon name="left" />Previous</button>
            <button type="button" className="btn btn-quiet btn-sm" aria-pressed={!!ex.flags[i]} onClick={() => act("flag")}><Icon name="bookmark" />{ex.flags[i] ? "Flagged" : "Flag for review"}</button>
          </div>
          {i < ex.items.length - 1 ? <button type="button" className="btn btn-primary btn-sm" onClick={() => act("next")}>Save &amp; next<Icon name="arrow" /></button>
            : <button type="button" className="btn btn-primary btn-sm" onClick={() => act("submit")}>Submit exam<Icon name="check" /></button>}
        </div>
      </div>
      <div className="card stack" style={{ gap: 14 }}>
        <div className="row between"><h4>Question map</h4><span className="xs dim">{answeredN}/{ex.items.length} answered</span></div>
        <div className="pa-map">{ex.items.map((_, k) => { const a = isDone(k); return (
          <button key={k} type="button" className={`pa-step ${k === i ? "cur" : ""} ${a ? "done" : ""} ${ex.flags[k] ? "flag" : ""}`} aria-label={`Question ${k + 1}${a ? ", answered" : ""}${ex.flags[k] ? ", flagged" : ""}`} onClick={() => goto(k)}>{k + 1}</button>); })}</div>
        <div className="row xs dim" style={{ gap: 12 }}><span><i className="pa-key done" />Answered</span><span><i className="pa-key flag" />Flagged</span><span><i className="pa-key" />Not answered</span></div>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => act("submit")}>Submit exam</button>
        <button type="button" className="btn btn-quiet btn-sm" onClick={() => act("quit")}><Icon name="x" />Abandon exam</button>
      </div>
    </div>
  );
}

function ExamResult({ ex, onNew, onPractise }) {
  const [onlyWrong, setOnlyWrong] = useState(false);
  const passed = ex.pct >= PA.EXAM_PASS;
  const breakdown = (keyFn, labelFn) => {
    const g = {};
    ex.items.forEach((it, k) => { const key = keyFn(it); g[key] = g[key] || [0, 0]; g[key][1]++; if (paGrade(examQ(it), ex.resp[k])) g[key][0]++; });
    return Object.entries(g).map(([k, [c, t]]) => (
      <div className="stack" style={{ gap: 6 }} key={k}><div className="row between small"><span>{labelFn(k)}</span><span className="mono">{c}/{t}</span></div>
        <Progress value={(c / t) * 100} barStyle={c / t < 0.7 ? { background: "var(--warn)" } : undefined} /></div>));
  };
  return (
    <div className="stack" style={{ gap: 20 }}>
      <div className="card pa-result">
        <div className="stack" style={{ gap: 10 }}>
          <span className="eyebrow">Mock exam result</span>
          <div className="row" style={{ alignItems: "baseline", gap: 12 }}><b className="pa-score pa-score-lg">{ex.pct}%</b><span className={`chip ${passed ? "chip-ok" : "chip-bad"}`}>{passed ? "Passed" : "Below pass mark"}</span></div>
          <p className="muted small">{ex.correct} of {ex.items.length} correct · {ex.domain === "All" ? "All domains" : ex.domain} · time {paFmtTime(ex.secs)} · pass mark {PA.EXAM_PASS}%</p>
          <div className="row"><button type="button" className="btn btn-primary btn-sm" onClick={onNew}><Icon name="reset" />New mock exam</button><button type="button" className="btn btn-ghost btn-sm" onClick={() => onPractise(null)}><Icon name="book" />Practise weak topics</button></div>
        </div>
        <div className="stack" style={{ gap: 12 }}><h4>By domain</h4>{breakdown(it => PA.byId.get(it[0]).domain, k => k)}</div>
        <div className="stack" style={{ gap: 12 }}><h4>By question type</h4>{breakdown(it => examQ(it).t, k => PA.TYPE_LABEL[k])}</div>
      </div>
      <div className="card stack" style={{ gap: 14 }}>
        <div className="row between"><h4>Answer review</h4>
          <div className="tab-row" role="group" aria-label="Review filter"><button type="button" aria-pressed={!onlyWrong} onClick={() => setOnlyWrong(false)}>All</button><button type="button" aria-pressed={onlyWrong} onClick={() => setOnlyWrong(true)}>Incorrect only</button></div></div>
        <ol className={`pa-rv-list${onlyWrong ? " only-wrong" : ""}`}>{ex.items.map((it, k) => {
          const q = examQ(it), r = ex.resp[k], ok = paGrade(q, r), m = PA.byId.get(it[0]);
          return (
            <li key={k} className={`pa-rv ${ok ? "" : "is-wrong"}`}>
              <div className="row between"><span className="row" style={{ gap: 6 }}><span className="mono xs dim">Q{k + 1}</span><TypeChip q={q} /><DomainChip d={m.domain} /></span>
                {ok ? <span className="chip chip-ok"><Icon name="check" style={{ width: 12, height: 12 }} />Correct</span> : <span className="chip chip-bad">Incorrect</span>}</div>
              <p className="pa-q" style={{ fontSize: "var(--t-base)" }}>{q.q}</p>
              <p className="small"><span className="dim">Your answer:</span> <span className={ok ? "pa-ok" : "pa-bad"}>{paRespText(q, r === undefined ? paInitResp(q, it[0], it[1]) : r)}</span></p>
              {!ok && <p className="small"><span className="dim">Correct answer:</span> <span className="pa-ok">{paAnswerText(q)}</span></p>}
              <a className="xs" href={"#/practice?m=" + m.id} onClick={e => { e.preventDefault(); onPractise(m.id); }}>Practise “{shortTitle(m)}” →</a>
            </li>);
        })}</ol>
      </div>
    </div>
  );
}
