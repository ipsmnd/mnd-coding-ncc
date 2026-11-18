import { Link } from "react-router-dom";
import { Icon } from "../components/Icon.jsx";
import { HeroCanvas } from "../components/HeroCanvas.jsx";
import { CourseCard, FaqItem, ProjectCard, useMedia, usePageMeta } from "../components/ui.jsx";
import { useApp } from "../components/AppContext.jsx";
import { SubnetLab } from "./labs/NetworkLabs.jsx";
import { FAQS, getCourses, LAB_LIST, PROJECTS } from "../lib/data.js";

const FEATURES = [["route", "Structured learning paths", "Three sequenced paths take you from fundamentals to projects without guessing what comes next."],
  ["flask", "Hands-on exercises", "Ten browser labs with real calculations, rule evaluation and feedback — no installs needed."],
  ["layers", "Realistic guided projects", "Design networks, cloud architectures and assessment reports you can show and explain."],
  ["book", "Beginner-friendly explanations", "Every lesson moves from what and why to a worked example, an exercise and a quick check."],
  ["chart", "Progress tracking", "See completed lessons, quiz results and your learning streak on your dashboard."],
  ["shield", "Responsible security practice", "Security skills are taught with written authorization, isolated labs and synthetic data only."],
  ["terminal", "Command-line confidence", "Practise Linux and network commands safely in a simulated terminal."],
  ["compass", "Clear about what's included", "No invented ratings, placement claims or certificates — just the curriculum, in full."]];
const ROADMAP = [["01", "IT Fundamentals", "Hardware, operating systems, the command line and how the internet is put together."], ["02", "Networking", "Addressing, subnetting, switching, routing and core services."], ["03", "Cloud Infrastructure", "Virtual networks, connectivity, security groups and infrastructure as code."], ["04", "Security Fundamentals", "CIA, Linux, lab setup, assessment methodology and hardening."], ["05", "Practical Projects", "Design, build, assess and document real-world-style scenarios."]];
const PROCESS = [["Discover", "Read the module overview and its objectives so you know what you are aiming for."], ["Learn", "Work through short lessons with diagrams and real examples."], ["Practice", "Apply it in the browser lab or a guided exercise straight away."], ["Build", "Combine skills in a project with a written deliverable."], ["Review", "Take the knowledge check, revisit mistakes and track progress."]];
const LESSON_PARTS = ["What", "Why", "Explain", "Example", "Diagram", "Exercise", "Check", "Mistakes", "Summary"];

export default function Home() {
  usePageMeta(null, "MND CODE — learn networking, cloud computing, cybersecurity and responsible penetration testing with structured lessons, browser labs and guided projects.");
  const { user } = useApp();
  const narrow = useMedia("(max-width:860px)");
  const all = getCourses(), cs = all.filter(c => !c.custom).slice(0, 3);
  return (
    <>
      <section className="hero"><div className="glow-orb" style={{ background: "var(--purple)", top: -120, left: -200 }} />
        <div className="wrap hero-grid">
          <div><span className="eyebrow">Technical skills for the next generation</span>
            <h1><span className="grad-text">Master Networks.</span><br />Build in the Cloud.<br />Secure the Future.</h1>
            <p className="lead">Learn how modern networks operate, how cloud infrastructure connects the world, and how security professionals identify and reduce vulnerabilities through practical, responsible training.</p>
            <div className="hero-actions"><Link className="btn btn-primary btn-lg" to="/courses">Explore Our Courses <Icon name="arrow" /></Link><Link className="btn btn-ghost btn-lg" to="/labs"><Icon name="flask" />Explore Practical Labs</Link></div>
            <div className="hero-meta"><span><i />3 structured courses</span><span>{all.reduce((a, c) => a + c.modules.length, 0)} modules</span><span>10 browser lab exercises</span></div>
          </div>
          <HeroCanvas />
        </div></section>

      <section className="section-tight"><div className="wrap"><div className="grid g4 swipe" aria-label="Highlights">
        {FEATURES.map(([i, t, d]) => <div className="card feat reveal" key={t}><span className="icon-box"><Icon name={i} /></span><h4>{t}</h4><p>{d}</p></div>)}
      </div></div></section>

      <section className="section"><div className="wrap">
        <div className="sec-head"><span className="eyebrow">Featured courses</span><h2>Three courses. One connected skill set.</h2><p className="lead">Each course is fully mapped below — every module and lesson, with estimated time calculated from the curriculum itself.</p></div>
        <div className="grid g3">{cs.map(c => <CourseCard key={c.slug} c={c} big />)}</div>
      </div></section>

      <section className="section-tight"><div className="wrap">
        <div className="sec-head"><span className="eyebrow">Learning roadmap</span><h2>From first cable to first capstone.</h2></div>
        <div className="roadmap">{ROADMAP.map(([n, t, d]) => <div className="rm-step reveal" key={n}><div className="node">{n}</div><h4>{t}</h4><p>{d}</p></div>)}</div>
        <div style={{ marginTop: 32 }}><Link className="btn btn-ghost" to="/learning-paths">See the three learning paths <Icon name="arrow" /></Link></div>
      </div></section>

      <section className="section"><div className="wrap">
        <div className="sec-head"><span className="eyebrow">Interactive labs preview</span><h2>Try it right here. Subnet anything.</h2><p className="lead">This is the real calculator from the lab. Change the address or prefix and the network, broadcast and host range update instantly.</p></div>
        <div className="card" style={{ padding: "clamp(18px,3vw,32px)" }}><SubnetLab compact /></div>
        <div className="grid g4 swipe" style={{ marginTop: 20 }}>{LAB_LIST.slice(1, 5).map(l => (
          <Link key={l.id} className="card card-link reveal" to={"/labs?t=" + l.id} style={{ color: "var(--text)", textDecoration: "none" }}><span className="icon-box"><Icon name={l.icon} /></span><h4 style={{ margin: "14px 0 6px", fontSize: "var(--t-base)" }}>{l.title}</h4><p className="small muted">{l.desc}</p></Link>
        ))}</div>
      </div></section>

      <section className="section-tight"><div className="wrap"><div className="card reveal" style={{ padding: "clamp(22px,4vw,40px)", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,300px),1fr))", gap: 28, alignItems: "center" }}>
        <div className="stack" style={{ gap: 14 }}><span className="eyebrow">Practice Arena</span><h2>Mock tests that get you exam-ready.</h2><p className="lead">132 practice questions across 33 topics, in six formats. Practise topic by topic with instant feedback, then sit a timed mock exam and see where to improve.</p>
          <div className="hero-actions" style={{ margin: 0 }}><Link className="btn btn-primary" to="/practice"><Icon name="target" />Start practising</Link><Link className="btn btn-ghost" to="/practice?mode=exam"><Icon name="clock" />Take a mock exam</Link></div>
          {!user && <p className="xs dim"><Icon name="lock" style={{ width: 13, height: 13, verticalAlign: -2 }} /> Free for registered students — <Link to="/register">create an account</Link> or <Link to="/login?next=/practice">sign in</Link>.</p>}</div>
        <div className="row" style={{ gap: 8 }}>{["Multiple choice", "True / False", "Multiple select", "Fill in the blank", "Put in order", "Match the pairs"].map((t, i) => <span key={t} className={`chip ${["chip-blue", "chip-cyan", "chip-purple"][i % 3]}`}>{t}</span>)}
          <div className="grid g3" style={{ width: "100%", marginTop: 12, gap: 12 }}>{[["33", "Topics"], ["132", "Questions"], ["70%", "Mock pass mark"]].map(([v, l]) => <div className="stat" key={l}><b>{v}</b><span>{l}</span></div>)}</div></div>
      </div></div></section>

      <section className="section-tight"><div className="wrap">
        <div className="row between" style={{ marginBottom: 32, alignItems: "end" }}><div className="sec-head" style={{ margin: 0 }}><span className="eyebrow">Projects showcase</span><h2>Build things you can explain.</h2></div><span className="demo-flag">Educational examples</span></div>
        <div className="grid g3 swipe">{PROJECTS.slice(0, 3).map(p => <ProjectCard key={p.title} p={p} />)}</div>
        <div style={{ marginTop: 24 }}><Link className="btn btn-ghost" to="/projects">All {PROJECTS.length} example projects <Icon name="arrow" /></Link></div>
      </div></section>

      <section className="section"><div className="wrap">
        <div className="sec-head"><span className="eyebrow">Why MND CODE</span><h2>Designed around how technical skills actually stick.</h2></div>
        <div className="bento">
          <div className="card b1 reveal" style={{ minHeight: 260, overflow: "hidden" }}><span className="icon-box"><Icon name="layers" /></span><h3>Concept → example → practice → check</h3><p style={{ maxWidth: "52ch" }}>Every authored lesson follows the same nine-part structure: what it means, why it matters, a clear explanation, a practical example, a diagram, a guided exercise, a knowledge check, common mistakes and a summary. You always know where you are.</p>
            <div className="row" style={{ marginTop: 20 }}>{LESSON_PARTS.map((s, i) => <span key={s} className={`chip ${i < 4 ? "chip-blue" : i < 7 ? "chip-cyan" : "chip-purple"}`}>{String(i + 1).padStart(2, "0")} {s}</span>)}</div></div>
          <div className="card b2 reveal"><span className="icon-box"><Icon name="wrench" /></span><h3>Practice-first</h3><p>Labs and projects sit next to the theory they reinforce, not at the end of the course.</p></div>
          <div className="card b3 reveal"><span className="icon-box"><Icon name="shield" /></span><h3>Responsible by design</h3><p>Authorization, scope and isolated labs are taught before any security tooling.</p></div>
          <div className="card b4 reveal"><span className="icon-box"><Icon name="globe" /></span><h3>Platform-neutral cloud</h3><p>Concepts first, then AWS, Azure and Google Cloud equivalents — with paid services flagged.</p></div>
          <div className="card b5 reveal"><span className="icon-box"><Icon name="list" /></span><h3>Transparent curriculum</h3><p>Every module and lesson is published on the course page before you start.</p></div>
        </div></div></section>

      <section className="section paper"><div className="wrap">
        <div className="sec-head"><span className="eyebrow">Learning process</span><h2>Five steps, repeated in every module.</h2></div>
        <div className="process">{PROCESS.map(([t, d], i) => <div key={t}><span className="k">STEP {i + 1}</span><h4>{t}</h4><p>{d}</p></div>)}</div>
      </div></section>

      <section className="section"><div className="wrap" style={{ display: "grid", gridTemplateColumns: narrow ? "minmax(0,1fr)" : "minmax(0,.8fr) minmax(0,1.2fr)", gap: 40 }}>
        <div className="sec-head" style={{ margin: 0 }}><span className="eyebrow">FAQ</span><h2>Questions learners ask first.</h2><p className="lead">Prerequisites, equipment, labs and what we do and don't claim.</p><div><Link className="btn btn-ghost" to="/faq">All questions <Icon name="arrow" /></Link></div></div>
        <div className="acc">{FAQS.slice(0, 6).map(([q, a]) => <FaqItem key={q} q={q} a={a} />)}</div>
      </div></section>

      <section className="section-tight" style={{ paddingBottom: "clamp(56px,8vw,104px)" }}><div className="wrap"><div className="cta reveal">
        <span className="eyebrow">Start today</span><h2 style={{ margin: "16px 0" }}>Your Next Chapter in Technology Starts Here.</h2><p className="lead">Pick a course, open the lab, and finish your first lesson in under half an hour.</p>
        <div className="hero-actions"><Link className="btn btn-primary btn-lg" to="/courses">Browse Courses <Icon name="arrow" /></Link><Link className="btn btn-ghost btn-lg" to="/contact">Contact Us</Link></div>
      </div></div></section>
    </>
  );
}
