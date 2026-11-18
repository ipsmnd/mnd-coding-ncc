import { useEffect, useRef } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Icon } from "../components/Icon.jsx";
import { useApp } from "../components/AppContext.jsx";
import { CourseArt, CourseCard, Crumbs, FaqItem, LevelChip, Outcomes, Progress, useMedia, usePageMeta } from "../components/ui.jsx";
import { findCourse, findLesson } from "../lib/data.js";
import { prog, saveProg, touch } from "../lib/auth.js";
import { NotFound } from "./System.jsx";

export default function CourseDetail() {
  const { slug } = useParams();
  const c = findCourse(slug);
  if (!c) return <NotFound />;
  return <Course key={c.slug} c={c} />;
}

function Course({ c }) {
  usePageMeta(c.title, c.short);
  const { user, toast, refresh } = useApp();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const narrow = useMedia("(max-width:900px)");
  const acc = useRef(null);
  const p = prog(user), enrolled = !!(user && p.enrolled.includes(c.slug));
  const openM = +(params.get("m") || 1) - 1;
  const doneN = c.lessons.filter(l => p.done[l.key]).length;
  const nextC = c.next && findCourse(c.next);
  const first = c.lessons[0];
  const resume = enrolled && p.last && p.last.course === c.slug && findLesson(c, p.last.lesson) ? p.last.lesson : first && first.id;

  useEffect(() => {
    const m = params.get("m"); if (!m) return;
    const d = document.getElementById("mod-" + m);
    if (d) { d.open = true; setTimeout(() => d.scrollIntoView({ block: "start" }), 50); }
  }, [params]);

  const enroll = () => {
    if (!user) { toast("Sign in or create an account to enroll.", "info"); navigate("/login?next=" + encodeURIComponent(c.route)); return; }
    const pp = prog(user);
    if (pp.enrolled.includes(c.slug)) { toast("You're already enrolled.", "info"); return; }
    pp.enrolled.push(c.slug); touch(user, pp); saveProg(user, pp); toast(`Enrolled in ${c.title}`); refresh();
  };
  const setAll = open => acc.current && acc.current.querySelectorAll("details").forEach(d => { d.open = open; });

  return (
    <>
      <section className="page-head"><div className="glow-orb" style={{ background: c.accent, top: -200, right: -100 }} />
        <div className="wrap grid" style={{ gridTemplateColumns: narrow ? "minmax(0,1fr)" : "minmax(0,1.3fr) minmax(0,1fr)", gap: 40, alignItems: "center", position: "relative" }}>
          <div>
            <Crumbs list={[["Home", "/"], ["Courses", "/courses"], [c.title, ""]]} />
            <div className="row"><LevelChip level={c.level} /><span className="chip chip-cyan">{c.category}</span>{c.custom && <span className="demo-flag">Created in admin</span>}</div>
            <h1 style={{ margin: "16px 0 0", maxWidth: "22ch" }}>{c.title}</h1>
            <p className="lead" style={{ marginTop: 16 }}>{c.overview || c.short}</p>
            <div className="hero-actions" style={{ marginTop: 24 }}>
              {first && <Link className="btn btn-primary btn-lg" to={`/learn/${c.slug}/${resume}`}>{enrolled ? "Continue learning" : "Start the first lesson"} <Icon name="arrow" /></Link>}
              <button className="btn btn-ghost btn-lg" type="button" onClick={enroll}><Icon name={enrolled ? "check" : "plus"} />{enrolled ? "Enrolled" : "Enroll for free"}</button>
            </div>
            {enrolled && <div style={{ marginTop: 20, maxWidth: 380 }}><div className="row between small muted"><span>Your progress</span><span>{doneN}/{c.lessons.length} lessons</span></div><Progress style={{ marginTop: 6 }} value={c.lessons.length ? doneN / c.lessons.length * 100 : 0} /></div>}
          </div>
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div className="course-art" style={{ height: 200 }}><CourseArt slug={c.slug} accent={c.accent} /></div>
            <div style={{ padding: 20 }}><div className="facts"><div><b>{c.modules.length}</b>modules</div><div><b>{c.lessons.length}</b>lessons</div><div><b>≈{c.hours} h</b>estimate</div></div>
              <p className="xs dim" style={{ marginTop: 10 }}>Counts are calculated from the curriculum below. Time is an estimate (≈35 min per lesson, longer for projects); your pace will vary.</p></div>
          </div>
        </div></section>
      {c.rules && <div className="wrap" style={{ marginTop: 28 }}><div className="alert alert-warn"><Icon name="shield" /><div><strong>Rules of engagement.</strong> {c.rules}</div></div></div>}
      <section className="section-tight"><div className="wrap grid g2" style={{ gap: 24 }}>
        <div className="card stack"><h3>Learning objectives</h3><Outcomes items={c.objectives || []} /></div>
        <div className="stack" style={{ gap: 24 }}>
          <div className="card stack"><h3>Who it's for</h3><Outcomes items={c.audience || []} icon="user" /></div>
          <div className="card stack"><h3>Prerequisites</h3><Outcomes items={c.prerequisites || []} icon="info" /></div>
        </div></div></section>
      <section className="section-tight"><div className="wrap"><div className="sec-head" style={{ marginBottom: 20 }}><span className="eyebrow">Skills you'll practise</span></div>
        <div className="terms">{(c.skills || []).map(s => <span key={s} className="chip chip-blue" style={{ height: 34, fontSize: "var(--t-sm)" }}>{s}</span>)}</div></div></section>
      <section className="section-tight" id="curriculum"><div className="wrap">
        <div className="row between" style={{ marginBottom: 20, alignItems: "end" }}>
          <div className="sec-head" style={{ margin: 0 }}><span className="eyebrow">Full curriculum</span><h2>{c.modules.length} modules · {c.lessons.length} lessons</h2></div>
          <div className="row"><button className="btn btn-ghost btn-sm" type="button" onClick={() => setAll(true)}>Expand all</button><button className="btn btn-ghost btn-sm" type="button" onClick={() => setAll(false)}>Collapse all</button></div>
        </div>
        <div className="acc" ref={acc}>{c.modules.map((m, i) => {
          const ls = m.lessons.filter(l => l.status === "published");
          return (
            <details key={i} open={i === openM || undefined} id={"mod-" + (i + 1)}>
              <summary><span><span className="mod-num">MODULE {String(i + 1).padStart(2, "0")}</span>{m.title} {m.project && <span className="chip chip-purple" style={{ marginLeft: 8 }}>Project</span>}{m.optional && <span className="chip" style={{ marginLeft: 8 }}>Optional</span>}</span>
                <span className="row" style={{ gap: 10, flexWrap: "nowrap" }}><span className="xs dim mono" style={{ whiteSpace: "nowrap" }}>{ls.length} lessons</span><Icon name="chev" className="icon chev" /></span></summary>
              <div className="acc-body"><p>{m.summary}</p><div className="terms">{m.terms.map(t => <span key={t} className="chip">{t}</span>)}</div>
                <ol className="lesson-list">{ls.map((l, j) => (
                  <li key={l.id}><Link to={`/learn/${c.slug}/${l.id}`}><span className="n">{i + 1}.{j + 1}</span><span>{l.title}{l.authored && <> <span className="chip chip-ok" style={{ height: 20, fontSize: 10 }}>Full lesson</span></>}</span>
                    {p.done[l.key] && <Icon name="check" style={{ color: "var(--ok)", width: 15, height: 15, marginLeft: "auto", flex: "none" }} />}</Link></li>
                ))}</ol></div>
            </details>);
        })}</div>
      </div></section>
      <section className="section-tight"><div className="wrap grid g2" style={{ gap: 24 }}>
        <div className="card stack"><h3>Practical exercises & projects</h3>
          {(() => { const t = c.modules.filter(m => m.project).flatMap(m => m.topics).slice(0, 6); return <Outcomes items={t.length ? t : ["Guided exercises in every lesson."]} icon={t.length ? "wrench" : "check"} />; })()}
          <Link className="btn btn-ghost btn-sm" to="/labs" style={{ alignSelf: "flex-start" }}>Open the browser lab <Icon name="arrow" /></Link></div>
        <div className="card stack"><h3>Tools & software</h3><Outcomes items={c.tools || []} icon="terminal" /></div>
      </div></section>
      {c.faqs && <section className="section-tight"><div className="wrap"><div className="sec-head" style={{ marginBottom: 20 }}><span className="eyebrow">Course FAQ</span><h2>About this course</h2></div>
        <div className="acc">{c.faqs.map(([q, a]) => <FaqItem key={q} q={q} a={a} />)}</div><p className="xs dim" style={{ marginTop: 14 }}>Instructor details will be listed here once confirmed.</p></div></section>}
      <section className="section-tight" style={{ paddingBottom: "clamp(56px,8vw,104px)" }}><div className="wrap">
        {nextC
          ? <div className="cta" style={{ marginBottom: 40 }}><span className="eyebrow">Next on your path</span><h2 style={{ margin: "14px 0" }}>After this: {nextC.title}</h2><div className="hero-actions"><Link className="btn btn-primary" to={nextC.route}>View next course <Icon name="arrow" /></Link><Link className="btn btn-ghost" to="/learning-paths">See learning paths</Link></div></div>
          : <div className="cta" style={{ marginBottom: 40 }}><span className="eyebrow">Questions before enrolling?</span><h2 style={{ margin: "14px 0" }}>Talk to us about this course.</h2><div className="hero-actions"><Link className="btn btn-primary" to="/contact">Contact us <Icon name="arrow" /></Link></div></div>}
        <div className="sec-head" style={{ marginBottom: 20 }}><span className="eyebrow">Related courses</span></div>
        <div className="grid g2">{(c.related || []).map(findCourse).filter(Boolean).map(x => <CourseCard key={x.slug} c={x} />)}</div>
      </div></section>
    </>
  );
}
