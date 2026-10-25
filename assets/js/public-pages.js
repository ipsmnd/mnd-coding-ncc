"use strict";
/* ============================================================
   PUBLIC PAGES
   ============================================================ */
route("/", () => {
  const cs = getCourses().filter(c => !c.custom).slice(0, 3);
  return {
    desc: "MND CODE — learn networking, cloud computing, cybersecurity and responsible penetration testing with structured lessons, browser labs and guided projects.",
    html: `
<section class="hero"><div class="glow-orb" style="background:var(--purple);top:-120px;left:-200px"></div>
 <div class="wrap hero-grid">
  <div><span class="eyebrow">Technical skills for the next generation</span>
   <h1><span class="grad-text">Master Networks.</span><br>Build in the Cloud.<br>Secure the Future.</h1>
   <p class="lead">Learn how modern networks operate, how cloud infrastructure connects the world, and how security professionals identify and reduce vulnerabilities through practical, responsible training.</p>
   <div class="hero-actions"><a class="btn btn-primary btn-lg" href="#/courses">Explore Our Courses ${icon("arrow")}</a><a class="btn btn-ghost btn-lg" href="#/labs">${icon("flask")}Explore Practical Labs</a></div>
   <div class="hero-meta"><span><i></i>3 structured courses</span><span>${getCourses().reduce((a, c) => a + c.modules.length, 0)} modules</span><span>10 browser lab exercises</span></div>
  </div>
  <div class="hero-visual" role="img" aria-label="Animated illustration of network nodes, servers, cloud regions and a security shield exchanging packets">
   <canvas id="heroCv"></canvas><span class="hv-tag">SIMULATED TELEMETRY</span>
   <div class="telemetry" aria-hidden="true"><div>LATENCY<b id="telA">18.4 ms</b></div><div>LINK HEALTH<b id="telB">97.2%</b></div><div>POLICY<b style="color:var(--ok)">default-deny</b></div></div>
  </div></div></section>

<section class="section-tight"><div class="wrap"><div class="grid g4 swipe" aria-label="Highlights">
 ${[["route", "Structured learning paths", "Three sequenced paths take you from fundamentals to projects without guessing what comes next."],
    ["flask", "Hands-on exercises", "Ten browser labs with real calculations, rule evaluation and feedback — no installs needed."],
    ["layers", "Realistic guided projects", "Design networks, cloud architectures and assessment reports you can show and explain."],
    ["book", "Beginner-friendly explanations", "Every lesson moves from what and why to a worked example, an exercise and a quick check."],
    ["chart", "Progress tracking", "See completed lessons, quiz results and your learning streak on your dashboard."],
    ["shield", "Responsible security practice", "Security skills are taught with written authorization, isolated labs and synthetic data only."],
    ["terminal", "Command-line confidence", "Practise Linux and network commands safely in a simulated terminal."],
    ["compass", "Clear about what's included", "No invented ratings, placement claims or certificates — just the curriculum, in full."]].map(([i, t, d]) => `<div class="card feat reveal"><span class="icon-box">${icon(i)}</span><h4>${t}</h4><p>${d}</p></div>`).join("")}
</div></div></section>

<section class="section"><div class="wrap">
 <div class="sec-head"><span class="eyebrow">Featured courses</span><h2>Three courses. One connected skill set.</h2><p class="lead">Each course is fully mapped below — every module and lesson, with estimated time calculated from the curriculum itself.</p></div>
 <div class="grid g3">${cs.map(c => courseCard(c, true)).join("")}</div>
</div></section>

<section class="section-tight"><div class="wrap">
 <div class="sec-head"><span class="eyebrow">Learning roadmap</span><h2>From first cable to first capstone.</h2></div>
 <div class="roadmap">${[["01", "IT Fundamentals", "Hardware, operating systems, the command line and how the internet is put together."], ["02", "Networking", "Addressing, subnetting, switching, routing and core services."], ["03", "Cloud Infrastructure", "Virtual networks, connectivity, security groups and infrastructure as code."], ["04", "Security Fundamentals", "CIA, Linux, lab setup, assessment methodology and hardening."], ["05", "Practical Projects", "Design, build, assess and document real-world-style scenarios."]].map(([n, t, d]) => `<div class="rm-step reveal"><div class="node">${n}</div><h4>${t}</h4><p>${d}</p></div>`).join("")}</div>
 <div style="margin-top:32px"><a class="btn btn-ghost" href="#/learning-paths">See the three learning paths ${icon("arrow")}</a></div>
</div></section>

<section class="section"><div class="wrap">
 <div class="sec-head"><span class="eyebrow">Interactive labs preview</span><h2>Try it right here. Subnet anything.</h2><p class="lead">This is the real calculator from the lab. Change the address or prefix and the network, broadcast and host range update instantly.</p></div>
 <div class="card" style="padding:clamp(18px,3vw,32px)"><div id="miniSubnet"></div></div>
 <div class="grid g4 swipe" style="margin-top:20px">${LAB_LIST.slice(1, 5).map(l => `<a class="card card-link reveal" href="#/labs?t=${l.id}" style="color:var(--text);text-decoration:none"><span class="icon-box">${icon(l.icon)}</span><h4 style="margin:14px 0 6px;font-size:var(--t-base)">${l.title}</h4><p class="small muted">${l.desc}</p></a>`).join("")}</div>
</div></section>

<section class="section-tight"><div class="wrap"><div class="card reveal" style="padding:clamp(22px,4vw,40px);display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:28px;align-items:center">
 <div class="stack" style="gap:14px"><span class="eyebrow">Practice Arena</span><h2>Mock tests that get you exam-ready.</h2><p class="lead">132 practice questions across 33 topics, in six formats. Practise topic by topic with instant feedback, then sit a timed mock exam and see where to improve.</p>
  <div class="hero-actions" style="margin:0"><a class="btn btn-primary" href="#/practice">${icon("target")}Start practising</a><a class="btn btn-ghost" href="#/practice?mode=exam">${icon("clock")}Take a mock exam</a></div>${currentUser() ? "" : `<p class="xs dim">${icon("lock", "icon", 'style="width:13px;height:13px;vertical-align:-2px"')} Free for registered students — <a href="#/register">create an account</a> or <a href="#/login?next=/practice">sign in</a>.</p>`}</div>
 <div class="row" style="gap:8px">${["Multiple choice", "True / False", "Multiple select", "Fill in the blank", "Put in order", "Match the pairs"].map((t, i) => `<span class="chip ${["chip-blue", "chip-cyan", "chip-purple"][i % 3]}">${t}</span>`).join("")}
  <div class="grid g3" style="width:100%;margin-top:12px;gap:12px">${[["33", "Topics"], ["132", "Questions"], ["70%", "Mock pass mark"]].map(([v, l]) => `<div class="stat"><b>${v}</b><span>${l}</span></div>`).join("")}</div></div>
</div></div></section>

<section class="section-tight"><div class="wrap">
 <div class="row between" style="margin-bottom:32px;align-items:end"><div class="sec-head" style="margin:0"><span class="eyebrow">Projects showcase</span><h2>Build things you can explain.</h2></div><span class="demo-flag">Educational examples</span></div>
 <div class="grid g3 swipe">${PROJECTS.slice(0, 3).map(projectCard).join("")}</div>
 <div style="margin-top:24px"><a class="btn btn-ghost" href="#/projects">All ${PROJECTS.length} example projects ${icon("arrow")}</a></div>
</div></section>

<section class="section"><div class="wrap">
 <div class="sec-head"><span class="eyebrow">Why MND CODE</span><h2>Designed around how technical skills actually stick.</h2></div>
 <div class="bento">
  <div class="card b1 reveal" style="min-height:260px;overflow:hidden"><span class="icon-box">${icon("layers")}</span><h3>Concept → example → practice → check</h3><p style="max-width:52ch">Every authored lesson follows the same nine-part structure: what it means, why it matters, a clear explanation, a practical example, a diagram, a guided exercise, a knowledge check, common mistakes and a summary. You always know where you are.</p>
   <div class="row" style="margin-top:20px">${["What", "Why", "Explain", "Example", "Diagram", "Exercise", "Check", "Mistakes", "Summary"].map((s, i) => `<span class="chip ${i < 4 ? "chip-blue" : i < 7 ? "chip-cyan" : "chip-purple"}">${String(i + 1).padStart(2, "0")} ${s}</span>`).join("")}</div></div>
  <div class="card b2 reveal"><span class="icon-box">${icon("wrench")}</span><h3>Practice-first</h3><p>Labs and projects sit next to the theory they reinforce, not at the end of the course.</p></div>
  <div class="card b3 reveal"><span class="icon-box">${icon("shield")}</span><h3>Responsible by design</h3><p>Authorization, scope and isolated labs are taught before any security tooling.</p></div>
  <div class="card b4 reveal"><span class="icon-box">${icon("globe")}</span><h3>Platform-neutral cloud</h3><p>Concepts first, then AWS, Azure and Google Cloud equivalents — with paid services flagged.</p></div>
  <div class="card b5 reveal"><span class="icon-box">${icon("list")}</span><h3>Transparent curriculum</h3><p>Every module and lesson is published on the course page before you start.</p></div>
 </div></div></section>

<section class="section paper"><div class="wrap">
 <div class="sec-head"><span class="eyebrow">Learning process</span><h2>Five steps, repeated in every module.</h2></div>
 <div class="process">${[["Discover", "Read the module overview and its objectives so you know what you are aiming for."], ["Learn", "Work through short lessons with diagrams and real examples."], ["Practice", "Apply it in the browser lab or a guided exercise straight away."], ["Build", "Combine skills in a project with a written deliverable."], ["Review", "Take the knowledge check, revisit mistakes and track progress."]].map(([t, d], i) => `<div><span class="k">STEP ${i + 1}</span><h4>${t}</h4><p>${d}</p></div>`).join("")}</div>
</div></section>

<section class="section"><div class="wrap" style="display:grid;grid-template-columns:minmax(0,.8fr) minmax(0,1.2fr);gap:40px" id="faqWrap">
 <div class="sec-head" style="margin:0"><span class="eyebrow">FAQ</span><h2>Questions learners ask first.</h2><p class="lead">Prerequisites, equipment, labs and what we do and don't claim.</p><div><a class="btn btn-ghost" href="#/faq">All questions ${icon("arrow")}</a></div></div>
 <div class="acc">${FAQS.slice(0, 6).map(faqItem).join("")}</div>
</div></section>

<section class="section-tight" style="padding-bottom:clamp(56px,8vw,104px)"><div class="wrap"><div class="cta reveal">
 <span class="eyebrow">Start today</span><h2 style="margin:16px 0">Your Next Chapter in Technology Starts Here.</h2><p class="lead">Pick a course, open the lab, and finish your first lesson in under half an hour.</p>
 <div class="hero-actions"><a class="btn btn-primary btn-lg" href="#/courses">Browse Courses ${icon("arrow")}</a><a class="btn btn-ghost btn-lg" href="#/contact">Contact Us</a></div>
</div></div></section>`,
    init: () => {
      heroCanvas($("#heroCv"));
      mountSubnet($("#miniSubnet"), true);
      const fw = $("#faqWrap"); const mq = matchMedia("(max-width:860px)"); const f = () => fw.style.gridTemplateColumns = mq.matches ? "minmax(0,1fr)" : "minmax(0,.8fr) minmax(0,1.2fr)"; f(); mq.addEventListener("change", f);
    }
  };
});

function projectCard(p) {
  const c = findCourse(p.course);
  return `<div class="card reveal stack" style="gap:12px"><div class="row between"><span class="icon-box">${icon(p.icon)}</span><span class="demo-flag">Sample project</span></div><h4>${esc(p.title)}</h4><p class="small muted">${esc(p.brief)}</p><div class="row">${levelChip(p.level)}${c ? `<a class="chip" href="#${c.route}">${esc(c.title)}</a>` : ""}</div><div class="xs dim mono" style="margin-top:4px">DELIVERABLES</div><ul class="outcomes">${p.deliver.map(d => `<li>${icon("check")}${esc(d)}</li>`).join("")}</ul>${!currentUser() ? `<div class="row" style="margin-top:auto;padding-top:6px"><a class="btn btn-ghost btn-sm" href="#/login?next=${encodeURIComponent(p.guide ? "/projects/" + p.guide : "/projects")}">${icon("lock")}Sign in to open the guide</a></div>` : p.guide || p.pdf ? `<div class="row" style="margin-top:auto;padding-top:6px">${p.guide ? `<a class="btn btn-primary btn-sm" href="#/projects/${p.guide}">${icon("book")}Open full guide</a>` : ""}${p.pdf ? `<a class="btn btn-ghost btn-sm" href="${encodeURI(p.pdf)}" download>${icon("file")}PDF</a>` : ""}</div>` : ""}</div>`;
}
const faqItem = ([q, a]) => `<details><summary>${esc(q)} ${icon("chev", "icon chev")}</summary><div class="acc-body"><p>${esc(a)}</p></div></details>`;

route("/about", () => ({
  title: "About Us", desc: "About MND CODE Pvt Ltd — a technical education platform for networking, cloud and cybersecurity.",
  html: pageHead("About MND CODE", "Technical education that respects your time and your judgement.", "MND CODE helps students and aspiring IT professionals build practical skills in computer networking, cloud infrastructure, cybersecurity and authorized penetration testing.", [["Home", "/"], ["About", ""]]) + `
<section class="section"><div class="wrap grid g2" style="gap:48px;align-items:start">
 <div class="prose"><h2 style="margin-top:0">What we do</h2><p>We publish structured courses that teach how networks, cloud platforms and security controls actually work — then let you practise those ideas immediately in browser labs and guided projects.</p><p>Our three courses connect: networking is the foundation, cloud extends it to virtual infrastructure, and security teaches you to assess and defend both. Learners can follow a complete path or take the course they need.</p><h2>How we teach</h2><ul><li><strong>Clarity first.</strong> Plain language, worked examples and diagrams before jargon.</li><li><strong>Practice next to theory.</strong> Exercises sit beside the lessons they reinforce.</li><li><strong>Responsibility always.</strong> Security testing is taught only for systems you own or are authorized to test.</li><li><strong>Honest claims.</strong> We publish what each course covers. We do not advertise ratings, placement figures or certifications we cannot substantiate.</li></ul></div>
 <div class="stack">
  <div class="card"><div class="stat"><span>Company</span><b style="font-size:var(--t-lg)">${esc(SITE.company)}</b></div></div>
  <div class="grid g2"><div class="card"><div class="stat"><span>Established</span><b style="font-size:var(--t-lg)">${esc(SITE.established)}</b></div></div><div class="card"><div class="stat"><span>Website</span><b style="font-size:var(--t-lg)">${esc(SITE.domain)}</b></div></div></div>
  <div class="card"><div class="stat"><span>Tagline</span><b style="font-size:var(--t-lg)">${esc(SITE.tagline)}</b></div><p class="small muted" style="margin-top:10px">Connect — understand how systems talk. Compute — build on cloud infrastructure. Secure — protect what you build.</p></div>
  <p class="xs dim">Founding date as supplied by the company. Registration details are available on request through the contact page.</p>
 </div></div></section>
<section class="section-tight" style="padding-bottom:clamp(56px,8vw,104px)"><div class="wrap"><div class="cta"><h2 style="margin-bottom:16px">See the full curriculum.</h2><div class="hero-actions"><a class="btn btn-primary" href="#/courses">Browse courses ${icon("arrow")}</a><a class="btn btn-ghost" href="#/contact">Contact us</a></div></div></div></section>`
}));

route("/courses", () => {
  const cs = getCourses();
  const cats = [...new Set(cs.map(c => c.category))], lvls = ["Beginner", "Intermediate", "Advanced"];
  return {
    title: "All Courses", desc: "Browse MND CODE courses in networking, cloud computing and ethical hacking. Filter by category, difficulty and estimated duration.",
    html: pageHead("All courses", "Choose where to start.", "Filter by category, difficulty and estimated duration. Every course page lists its full curriculum.", [["Home", "/"], ["Courses", ""]]) + `
<section class="section-tight"><div class="wrap">
 <form class="filters" id="cf" onsubmit="return false">
  <div class="field"><label for="fq">Search</label><input class="input" id="fq" type="search" placeholder="e.g. subnet, VPC, Linux"></div>
  <div class="field"><label for="fc">Category</label><select class="input" id="fc"><option value="">All categories</option>${cats.map(c => `<option>${esc(c)}</option>`).join("")}</select></div>
  <div class="field"><label for="fl">Difficulty</label><select class="input" id="fl"><option value="">All levels</option>${lvls.map(c => `<option>${c}</option>`).join("")}</select></div>
  <div class="field"><label for="fd">Estimated duration</label><select class="input" id="fd"><option value="">Any length</option><option value="0-40">Up to 40 hours</option><option value="40-50">40–50 hours</option><option value="50-999">More than 50 hours</option></select></div>
  <button class="btn btn-quiet" type="button" id="fr">${icon("reset")}Reset</button>
 </form>
 <p class="small muted" id="fcount" aria-live="polite"></p>
 <div class="grid g3" id="clist" style="margin-top:16px"></div>
</div></section>`,
    init: () => {
      const draw = () => {
        const q = $("#fq").value.toLowerCase().trim(), c = $("#fc").value, l = $("#fl").value, d = $("#fd").value;
        const [lo, hi] = d ? d.split("-").map(Number) : [0, 1e9];
        const list = cs.filter(x => (!c || x.category === c) && (!l || x.level === l) && x.hours >= lo && x.hours <= hi && (!q || q.split(/\s+/).every(w => [x.title, x.category, x.level, x.short, ...x.modules.map(m => m.title + " " + m.topics.join(" "))].join(" ").toLowerCase().includes(w))));
        $("#fcount").textContent = `${list.length} of ${cs.length} courses`;
        $("#clist").innerHTML = list.length ? list.map(x => courseCard(x)).join("") : `<div class="empty" style="grid-column:1/-1">${icon("search")}<strong>No courses match these filters.</strong><span class="small">Try a broader search or reset the filters.</span><button class="btn btn-ghost btn-sm" type="button" id="fr2">Reset filters</button></div>`;
        const r2 = $("#fr2"); if (r2) r2.onclick = reset;
      };
      const reset = () => { $("#cf").reset(); draw(); };
      const qc = qparam("cat"); if (qc && cats.includes(qc)) $("#fc").value = qc; const qq = qparam("q"); if (qq) $("#fq").value = qq;
      $$("#cf input,#cf select").forEach(e => e.addEventListener("input", draw)); $("#fr").onclick = reset; draw();
    }
  };
});

route("/courses/:slug", ({ slug }) => {
  const c = findCourse(slug); if (!c) return null;
  const u = currentUser(), p = prog(u), enrolled = u && p.enrolled.includes(c.slug);
  const openM = +(qparam("m") || 1) - 1;
  const doneN = c.lessons.filter(l => p.done[l.key]).length;
  const nextC = c.next && findCourse(c.next);
  const first = c.lessons[0];
  return {
    title: c.title, desc: c.short,
    html: `<section class="page-head"><div class="glow-orb" style="background:${c.accent};top:-200px;right:-100px"></div><div class="wrap grid" style="grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);gap:40px;align-items:center;position:relative" id="chero">
  <div>${crumbs([["Home", "/"], ["Courses", "/courses"], [c.title, ""]])}<div class="row">${levelChip(c.level)}<span class="chip chip-cyan">${esc(c.category)}</span>${c.custom ? `<span class="demo-flag">Created in admin</span>` : ""}</div>
   <h1 style="margin:16px 0 0;max-width:22ch">${esc(c.title)}</h1><p class="lead" style="margin-top:16px">${esc(c.overview || c.short)}</p>
   <div class="hero-actions" style="margin-top:24px">${first ? `<a class="btn btn-primary btn-lg" href="#/learn/${c.slug}/${(enrolled && p.last && p.last.course === c.slug && findLesson(c, p.last.lesson)) ? p.last.lesson : first.id}">${enrolled ? "Continue learning" : "Start the first lesson"} ${icon("arrow")}</a>` : ""}<button class="btn btn-ghost btn-lg" type="button" id="enrollBtn">${enrolled ? icon("check") + "Enrolled" : icon("plus") + "Enroll for free"}</button></div>
   ${enrolled ? `<div style="margin-top:20px;max-width:380px"><div class="row between small muted"><span>Your progress</span><span>${doneN}/${c.lessons.length} lessons</span></div><div class="progress" style="margin-top:6px"><i style="width:${c.lessons.length ? doneN / c.lessons.length * 100 : 0}%"></i></div></div>` : ""}
  </div>
  <div class="card" style="padding:0;overflow:hidden"><div class="course-art" style="height:200px">${courseArt(c.slug, c.accent)}</div><div style="padding:20px"><div class="facts"><div><b>${c.modules.length}</b>modules</div><div><b>${c.lessons.length}</b>lessons</div><div><b>≈${c.hours} h</b>estimate</div></div><p class="xs dim" style="margin-top:10px">Counts are calculated from the curriculum below. Time is an estimate (≈35 min per lesson, longer for projects); your pace will vary.</p></div></div>
 </div></section>
${c.rules ? `<div class="wrap" style="margin-top:28px"><div class="alert alert-warn">${icon("shield")}<div><strong>Rules of engagement.</strong> ${esc(c.rules)}</div></div></div>` : ""}
<section class="section-tight"><div class="wrap grid g2" style="gap:24px">
 <div class="card stack"><h3>Learning objectives</h3><ul class="outcomes">${(c.objectives || []).map(o => `<li>${icon("check")}${esc(o)}</li>`).join("")}</ul></div>
 <div class="stack" style="gap:24px">
  <div class="card stack"><h3>Who it's for</h3><ul class="outcomes">${(c.audience || []).map(o => `<li>${icon("user")}${esc(o)}</li>`).join("")}</ul></div>
  <div class="card stack"><h3>Prerequisites</h3><ul class="outcomes">${(c.prerequisites || []).map(o => `<li>${icon("info")}${esc(o)}</li>`).join("")}</ul></div>
 </div></div></section>
<section class="section-tight"><div class="wrap"><div class="sec-head" style="margin-bottom:20px"><span class="eyebrow">Skills you'll practise</span></div><div class="terms">${(c.skills || []).map(s => `<span class="chip chip-blue" style="height:34px;font-size:var(--t-sm)">${esc(s)}</span>`).join("")}</div></div></section>
<section class="section-tight" id="curriculum"><div class="wrap">
 <div class="row between" style="margin-bottom:20px;align-items:end"><div class="sec-head" style="margin:0"><span class="eyebrow">Full curriculum</span><h2>${c.modules.length} modules · ${c.lessons.length} lessons</h2></div><div class="row"><button class="btn btn-ghost btn-sm" type="button" id="expAll">Expand all</button><button class="btn btn-ghost btn-sm" type="button" id="colAll">Collapse all</button></div></div>
 <div class="acc" id="curAcc">${c.modules.map((m, i) => { const ls = m.lessons.filter(l => l.status === "published"); return `<details ${i === openM ? "open" : ""} id="mod-${i + 1}"><summary><span><span class="mod-num">MODULE ${String(i + 1).padStart(2, "0")}</span>${esc(m.title)} ${m.project ? `<span class="chip chip-purple" style="margin-left:8px">Project</span>` : ""}${m.optional ? `<span class="chip" style="margin-left:8px">Optional</span>` : ""}</span><span class="row" style="gap:10px;flex-wrap:nowrap"><span class="xs dim mono" style="white-space:nowrap">${ls.length} lessons</span>${icon("chev", "icon chev")}</span></summary>
   <div class="acc-body"><p>${esc(m.summary)}</p><div class="terms">${m.terms.map(t => `<span class="chip">${esc(t)}</span>`).join("")}</div>
   <ol class="lesson-list">${ls.map((l, j) => `<li><a href="#/learn/${c.slug}/${l.id}"><span class="n">${i + 1}.${j + 1}</span><span>${esc(l.title)}${l.authored ? ` <span class="chip chip-ok" style="height:20px;font-size:10px">Full lesson</span>` : ""}</span>${p.done[l.key] ? icon("check", "icon", 'style="color:var(--ok);width:15px;height:15px;margin-left:auto;flex:none"') : ""}</a></li>`).join("")}</ol></div></details>`; }).join("")}</div>
</div></section>
<section class="section-tight"><div class="wrap grid g2" style="gap:24px">
 <div class="card stack"><h3>Practical exercises & projects</h3><ul class="outcomes">${c.modules.filter(m => m.project).flatMap(m => m.topics).slice(0, 6).map(t => `<li>${icon("wrench")}${esc(t)}</li>`).join("") || "<li>Guided exercises in every lesson.</li>"}</ul><a class="btn btn-ghost btn-sm" href="#/labs" style="align-self:flex-start">Open the browser lab ${icon("arrow")}</a></div>
 <div class="card stack"><h3>Tools & software</h3><ul class="outcomes">${(c.tools || []).map(t => `<li>${icon("terminal")}${esc(t)}</li>`).join("")}</ul></div>
</div></section>
${c.faqs ? `<section class="section-tight"><div class="wrap"><div class="sec-head" style="margin-bottom:20px"><span class="eyebrow">Course FAQ</span><h2>About this course</h2></div><div class="acc">${c.faqs.map(faqItem).join("")}</div><p class="xs dim" style="margin-top:14px">Instructor details will be listed here once confirmed.</p></div></section>` : ""}
<section class="section-tight" style="padding-bottom:clamp(56px,8vw,104px)"><div class="wrap">
 ${nextC ? `<div class="cta" style="margin-bottom:40px"><span class="eyebrow">Next on your path</span><h2 style="margin:14px 0">After this: ${esc(nextC.title)}</h2><div class="hero-actions"><a class="btn btn-primary" href="#${nextC.route}">View next course ${icon("arrow")}</a><a class="btn btn-ghost" href="#/learning-paths">See learning paths</a></div></div>` : `<div class="cta" style="margin-bottom:40px"><span class="eyebrow">Questions before enrolling?</span><h2 style="margin:14px 0">Talk to us about this course.</h2><div class="hero-actions"><a class="btn btn-primary" href="#/contact">Contact us ${icon("arrow")}</a></div></div>`}
 <div class="sec-head" style="margin-bottom:20px"><span class="eyebrow">Related courses</span></div><div class="grid g2">${(c.related || []).map(findCourse).filter(Boolean).map(x => courseCard(x)).join("")}</div>
</div></section>`,
    init: () => {
      const ch = $("#chero"), mq = matchMedia("(max-width:900px)"), f = () => ch.style.gridTemplateColumns = mq.matches ? "minmax(0,1fr)" : "minmax(0,1.3fr) minmax(0,1fr)"; f(); mq.addEventListener("change", f);
      $("#expAll").onclick = () => $$("#curAcc details").forEach(d => d.open = true);
      $("#colAll").onclick = () => $$("#curAcc details").forEach(d => d.open = false);
      if (qparam("m")) $("#mod-" + qparam("m"))?.scrollIntoView({ block: "start" });
      $("#enrollBtn").onclick = () => {
        const u = currentUser();
        if (!u) { toast("Sign in or create an account to enroll.", "info"); navigate("/login?next=" + encodeURIComponent(c.route)); return; }
        const p = prog(u); if (!p.enrolled.includes(c.slug)) { p.enrolled.push(c.slug); touch(u, p); saveProg(u, p); toast(`Enrolled in ${c.title}`); render(); } else toast("You're already enrolled.", "info");
      };
    }
  };
});

route("/learning-paths", () => ({
  title: "Learning Paths", desc: "Three recommended learning paths: Network Administrator, Cloud Network Engineer, and Security Analyst & Pentester.",
  html: pageHead("Learning paths", "Three routes through the curriculum.", "Each path sequences modules, labs and a project toward one kind of role. Paths describe skills practised — they are not job guarantees.", [["Home", "/"], ["Learning paths", ""]]) + `
<section class="section-tight"><div class="wrap"><div class="roadmap" style="margin-bottom:56px">${[["01", "IT Fundamentals", "Self-check your basics."], ["02", "Networking", "Core of every path."], ["03", "Cloud Infrastructure", "For the cloud path."], ["04", "Security Fundamentals", "For the security path."], ["05", "Practical Projects", "Every path ends here."]].map(([n, t, d]) => `<div class="rm-step"><div class="node">${n}</div><h4>${t}</h4><p>${d}</p></div>`).join("")}</div>
 <div class="grid g3">${PATHS.map(p => `<div class="card stack reveal"><span class="icon-box">${icon(p.icon)}</span><h3>${esc(p.title)}</h3><p class="small muted">${esc(p.for)}</p><ol class="step-log" style="counter-reset:s">${p.steps.map((s, i) => `<li><span class="mono xs" style="color:var(--cyan)">${String(i + 1).padStart(2, "0")}</span>&nbsp; ${esc(s)}</li>`).join("")}</ol><div class="xs mono dim">COURSES</div><div class="row">${p.courses.map(findCourse).filter(Boolean).map(c => `<a class="chip chip-cyan" href="#${c.route}">${esc(c.title)}</a>`).join("")}</div><div class="small muted">Estimated total: ≈${p.courses.map(findCourse).filter(Boolean).reduce((a, c) => a + c.hours, 0)} hours</div></div>`).join("")}</div>
</div></section>`
}));

route("/projects", () => ({
  title: "Projects", desc: "Example guided projects from MND CODE courses: network design, VLAN routing, cloud architecture, Linux hardening and authorized web assessment.",
  html: pageHead("Projects", "Guided projects with real deliverables.", "These are educational example briefs used in the courses. They are not client work.", [["Home", "/"], ["Projects", ""]]) + `<section class="section-tight" style="padding-bottom:clamp(56px,8vw,104px)"><div class="wrap"><div class="grid g3">${PROJECTS.map(projectCard).join("")}</div></div></section>`
}), { auth: "student" });

/* Project guide pages: inline `code` and **bold** in guide text */
const guideText = s => esc(s).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
const pdfHref = p => encodeURI(p);
const guideTable = t => `<div class="table-wrap"><table><thead><tr>${t.head.map(h => `<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>${t.rows.map(r => `<tr>${r.map(c => `<td>${guideText(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
/* A free-form block: optional text, key facts, bullet list and table */
const guideBlock = (b, id) => `<section class="card stack guide-block" style="gap:14px"${id ? ` id="${id}"` : ""}><h3>${esc(b.title)}</h3>
  ${b.text ? `<p class="muted">${guideText(b.text)}</p>` : ""}
  ${b.facts ? `<dl class="guide-facts">${b.facts.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${guideText(v)}</dd>`).join("")}</dl>` : ""}
  ${b.items ? `<ul class="outcomes">${b.items.map(i => `<li>${icon("check")}<span>${guideText(i)}</span></li>`).join("")}</ul>` : ""}
  ${b.table ? guideTable(b.table) : ""}</section>`;

route("/projects/:slug", ({ slug }) => {
  const g = PROJECT_GUIDES.find(x => x.slug === slug);
  if (!g) return null;
  const c = findCourse(g.course);
  const key = "guide:" + g.slug;
  const start = g.startAt ?? 1;
  const unit = g.unit || "Project";
  const ck = g.checklist, ckTotal = ck ? ck.groups.reduce((n, s) => n + s.items.length, 0) : 0;
  const lvl = { Beginner: "chip-ok", Intermediate: "chip-blue", Advanced: "chip-purple" };
  const pid = i => `guide-p${i}`;
  const toc = [
    ...(g.overview || []).map((b, i) => [`guide-o${i}`, b.title]),
    ...(ck && !g.checklistAfter ? [["guide-checklist", ck.title]] : []),
    ...g.projects.map((p, i) => [pid(i), `${unit} ${i + start}: ${p.title}`]),
    ...(g.capstone ? [["guide-capstone", g.capstone.title.replace(/:.*/, "")]] : []),
    ...(ck && g.checklistAfter ? [["guide-checklist", ck.title]] : []),
    ...(g.after || []).map((b, i) => [`guide-a${i}`, b.title]),
    ["guide-tools", "Tools"]
  ];
  const checklistHTML = !ck ? "" : `<section id="guide-checklist" class="stack" style="gap:18px">
   <div class="row between"><h2>${esc(ck.title)}</h2><button type="button" class="btn btn-quiet btn-sm" id="gReset">${icon("reset")}Clear ticks</button></div>
   <div class="card stack" style="gap:10px;padding:18px"><div class="row between small"><span>Checklist progress</span><span class="mono" id="gCount">0/${ckTotal}</span></div><div class="progress"><i id="gBar" style="width:0"></i></div><p class="xs dim">${esc(ck.intro || "")} Saved in this browser.</p></div>
   <div class="grid ${ck.groups.length > 1 ? "g2" : ""}">${ck.groups.map((s, si) => `<div class="card stack" style="gap:12px"><div class="row"><span class="icon-box">${icon(s.icon || "check")}</span><h3 style="font-size:var(--t-md)">${esc(s.title)}</h3></div>
     <ul class="guide-checks ${s.items.length > 6 ? "cols" : ""}">${s.items.map((it, ii) => `<li><label><input type="checkbox" data-k="${si}-${ii}"><span>${guideText(it)}</span></label></li>`).join("")}</ul></div>`).join("")}</div>
  </section>`;
  return {
    title: g.short || g.title, desc: g.lead,
    html: pageHead("Project guide", esc(g.title), esc(g.lead), [["Home", "/"], ["Projects", "/projects"], [g.short || g.title, ""]],
      `<div class="row" style="margin-top:22px"><a class="btn btn-primary" href="${pdfHref(g.pdf)}" download>${icon("file")}Download PDF</a><a class="btn btn-ghost" href="#${pid(0)}">${icon("layers")}Jump to the ${g.projects.length} ${unit.toLowerCase()}s</a></div>
       <div class="row" style="margin-top:18px">${c ? `<a class="chip chip-cyan" href="#${c.route}">${esc(c.title)}</a>` : ""}<span class="chip">${g.projects.length} ${unit.toLowerCase()}s</span>${ck ? `<span class="chip">${ckTotal}-point checklist</span>` : ""}${g.level ? `<span class="chip">${esc(g.level)}</span>` : ""}${g.time ? `<span class="chip">${icon("clock", "icon", 'style="width:12px;height:12px"')}${esc(g.time)}</span>` : ""}</div>`) + `
<section class="section-tight"><div class="wrap guide-layout">
 <aside class="guide-toc card" aria-label="On this page">
  <span class="xs dim mono">ON THIS PAGE</span>
  ${toc.map(([id, t]) => `<a href="#${id}">${esc(t)}</a>`).join("")}
  <div class="guide-toc-prog"><div class="row between xs"><span class="dim">${unit}s done</span><span class="mono" id="gDone">0/${g.projects.length}</span></div><div class="progress" style="height:6px"><i id="gDoneBar" style="width:0"></i></div></div>
 </aside>
 <div class="stack" style="gap:32px;min-width:0">
  ${g.warn ? `<div class="alert alert-warn">${icon("shield")}<div>${guideText(g.warn)}</div></div>` : ""}
  ${(g.overview || []).map((b, i) => guideBlock(b, `guide-o${i}`)).join("")}
  ${g.checklistAfter ? "" : checklistHTML}
  <section class="stack" style="gap:18px">
   <div><h2>${unit === "Phase" ? "Phases and deliverables" : "Guided projects"}</h2><p class="lead" style="margin-top:10px">Work through them in order. Tick <strong>Mark as done</strong> on each card as you finish — your progress is saved in this browser.</p></div>
   ${g.projects.map((p, i) => `<article class="card guide-project" id="${pid(i)}">
     <div class="row between"><div class="row"><span class="mod-num mono">${String(i + start).padStart(2, "0")}</span><div><span class="xs dim mono">${unit.toUpperCase()} ${i + start}</span><h3>${esc(p.title)}</h3></div></div>
      <div class="row" style="gap:6px">${p.when ? `<span class="chip">${icon("clock", "icon", 'style="width:12px;height:12px"')}${esc(p.when)}</span>` : ""}${p.level ? `<span class="chip ${lvl[p.level] || ""}">${p.level}</span>` : ""}</div></div>
     ${p.target ? `<p><strong>Target:</strong> <span class="muted">${guideText(p.target)}</span></p>` : ""}
     ${p.goal ? `<p><strong>Goal:</strong> <span class="muted">${guideText(p.goal)}</span></p>` : ""}
     <div class="guide-cols ${p.steps ? "" : "one"}">
      ${p.steps ? `<div><div class="xs dim mono" style="margin-bottom:10px">${esc((p.stepsLabel || "Steps").toUpperCase())}</div><ol class="guide-steps">${p.steps.map(s => `<li>${guideText(s)}</li>`).join("")}</ol></div>` : ""}
      <div><div class="xs dim mono" style="margin-bottom:10px">${esc((p.deliverLabel || (p.deliver.length > 1 ? "Deliverables" : "Deliverable")).toUpperCase())}</div><ul class="outcomes">${p.deliver.map(d => `<li>${icon("check")}<span>${guideText(d)}</span></li>`).join("")}</ul></div>
     </div>
     ${p.table ? `<div class="stack" style="gap:8px">${p.table.caption ? `<div class="xs dim mono">${esc(p.table.caption.toUpperCase())}</div>` : ""}${guideTable(p.table)}</div>` : ""}
     <label class="guide-done"><input type="checkbox" data-done="${i}"><span>Mark as done</span></label>
    </article>`).join("")}
  </section>
  ${g.capstone ? `<section id="guide-capstone" class="callout ok"><h4>${esc(g.capstone.title)}</h4>${g.capstone.text ? `<p class="small">${guideText(g.capstone.text)}</p>` : ""}${g.capstone.items ? `<ul class="outcomes" style="margin-top:12px">${g.capstone.items.map(i => `<li>${icon("check")}<span>${guideText(i)}</span></li>`).join("")}</ul>` : ""}</section>` : ""}
  ${g.checklistAfter ? checklistHTML : ""}
  ${(g.after || []).map((b, i) => guideBlock(b, `guide-a${i}`)).join("")}
  <section id="guide-tools" class="stack" style="gap:14px"><h3>Tools you'll use</h3><div class="row" style="gap:8px">${g.tools.map(t => `<span class="chip chip-blue mono">${esc(t)}</span>`).join("")}</div>
   ${g.note ? `<div class="alert alert-info">${icon("info")}<div>${guideText(g.note)}</div></div>` : ""}
   ${g.warn ? "" : `<div class="alert alert-warn">${icon("shield")}<div>Practise only in a lab you own or are explicitly authorised to use. Snapshot or back up before each ${unit.toLowerCase()} so you can roll back.</div></div>`}</section>
  <div class="row"><a class="btn btn-ghost" href="#/projects">${icon("left")}All projects</a>${(() => { const i = PROJECT_GUIDES.indexOf(g), n = PROJECT_GUIDES[(i + 1) % PROJECT_GUIDES.length]; return n !== g ? `<a class="btn btn-ghost" href="#/projects/${n.slug}">Next guide: ${esc(n.short || n.title)}${icon("arrow")}</a>` : ""; })()}</div>
 </div>
</div></section>`,
    init: root => {
      const saved = () => store.get(key, {});
      const save = s => store.set(key, s);
      const boxes = $$(".guide-checks input", root), dones = $$("[data-done]", root);
      const paint = () => {
        if (ck) { const n = boxes.filter(b => b.checked).length; $("#gCount", root).textContent = `${n}/${ckTotal}`; $("#gBar", root).style.width = `${(n / ckTotal) * 100}%`; }
        const d = dones.filter(b => b.checked).length; $("#gDone", root).textContent = `${d}/${dones.length}`; $("#gDoneBar", root).style.width = `${(d / dones.length) * 100}%`;
        dones.forEach(b => b.closest(".guide-project").classList.toggle("is-done", b.checked));
      };
      const s0 = saved();
      boxes.forEach(b => { b.checked = !!s0[b.dataset.k]; b.onchange = () => { const s = saved(); b.checked ? s[b.dataset.k] = 1 : delete s[b.dataset.k]; save(s); paint(); }; });
      dones.forEach(b => { b.checked = !!s0["done-" + b.dataset.done]; b.onchange = () => { const s = saved(); b.checked ? s["done-" + b.dataset.done] = 1 : delete s["done-" + b.dataset.done]; save(s); paint(); }; });
      const reset = $("#gReset", root);
      if (reset) reset.onclick = () => { const s = saved(); Object.keys(s).filter(k => !k.startsWith("done-")).forEach(k => delete s[k]); save(s); boxes.forEach(b => b.checked = false); paint(); };
      $$('a[href^="#guide-"]', root).forEach(a => a.onclick = e => { e.preventDefault(); $(a.getAttribute("href"), root)?.scrollIntoView({ behavior: "smooth", block: "start" }); });
      paint();
    }
  };
}, { auth: "student" });

route("/resources", () => {
  const sel = qparam("r");
  return {
    title: "Resources & Tutorials", desc: "Cheat sheets and guides: common ports, subnet reference, Linux commands, troubleshooting, CVSS and avoiding cloud charges.",
    html: pageHead("Resources & tutorials", "Reference material you'll come back to.", "Cheat sheets and short guides written for MND CODE learners.", [["Home", "/"], ["Resources", ""]]) + `
<section class="section-tight" style="padding-bottom:clamp(56px,8vw,104px)"><div class="wrap">
 <div class="tab-row" id="rtabs" style="margin-bottom:20px">${["All", "networking", "cloud", "security", "linux"].map((t, i) => `<button type="button" aria-pressed="${i === 0}" data-t="${t}">${t[0].toUpperCase() + t.slice(1)}</button>`).join("")}</div>
 <div class="acc" id="rlist">${RESOURCES.map(r => `<details id="res-${r.id}" data-tags="${r.tags.join(" ")}" ${sel === r.id ? "open" : ""}><summary><span><span class="chip" style="margin-right:10px">${r.type}</span>${esc(r.title)}</span>${icon("chev", "icon chev")}</summary><div class="acc-body">${r.html}</div></details>`).join("")}</div>
 <div class="grid g2" style="margin-top:32px"><a class="card card-link" href="#/blog" style="color:var(--text);text-decoration:none"><span class="icon-box">${icon("file")}</span><h4 style="margin:12px 0 6px">Read the blog</h4><p class="small muted">Longer tutorials and explainers.</p></a><a class="card card-link" href="#/labs" style="color:var(--text);text-decoration:none"><span class="icon-box">${icon("flask")}</span><h4 style="margin:12px 0 6px">Practise in the lab</h4><p class="small muted">Ten interactive exercises.</p></a></div>
</div></section>`,
    init: () => {
      $$("#rtabs button").forEach(b => b.onclick = () => { $$("#rtabs button").forEach(x => x.setAttribute("aria-pressed", x === b)); $$("#rlist details").forEach(d => d.hidden = !(b.dataset.t === "All" || d.dataset.tags.includes(b.dataset.t))); });
      if (sel) $("#res-" + sel)?.scrollIntoView({ block: "center" });
    }
  };
}, { auth: "student" });

route("/blog", () => {
  const per = 3; let page = Math.max(1, +(qparam("page") || 1)); const pages = Math.ceil(POSTS.length / per); page = Math.min(page, pages);
  const list = POSTS.slice((page - 1) * per, page * per);
  return {
    title: "Blog", desc: "Tutorials and explainers on networking, cloud and security from MND CODE.",
    html: pageHead("Blog", "Notes from the lab.", "Explainers and tutorials on networking, cloud and security.", [["Home", "/"], ["Blog", ""]]) + `
<section class="section-tight" style="padding-bottom:clamp(56px,8vw,104px)"><div class="wrap"><div class="grid g3">${list.map(p => `<a class="card card-link stack reveal" href="#/blog/${p.slug}" style="color:var(--text);text-decoration:none;gap:12px"><div class="row"><span class="chip chip-cyan">${p.tag}</span><span class="xs dim">${fmtDate(p.date)} · ${p.read} min read</span></div><h3 style="font-size:var(--t-md)">${esc(p.title)}</h3><p class="small muted">${esc(p.excerpt)}</p><span class="course-foot">Read article ${icon("arrow")}</span></a>`).join("")}</div>
 <nav class="row" aria-label="Pagination" style="margin-top:32px;justify-content:center">${page > 1 ? `<a class="btn btn-ghost btn-sm" href="#/blog?page=${page - 1}">${icon("left")}Newer</a>` : ""}${Array.from({ length: pages }, (_, i) => `<a class="btn ${i + 1 === page ? "btn-primary" : "btn-ghost"} btn-sm" href="#/blog?page=${i + 1}" ${i + 1 === page ? 'aria-current="page"' : ""}>${i + 1}</a>`).join("")}${page < pages ? `<a class="btn btn-ghost btn-sm" href="#/blog?page=${page + 1}">Older ${icon("arrow")}</a>` : ""}</nav>
</div></section>`
  };
});
route("/blog/:slug", ({ slug }) => {
  const p = POSTS.find(x => x.slug === slug); if (!p) return null;
  const others = POSTS.filter(x => x !== p).slice(0, 2);
  return { title: p.title, desc: p.excerpt, html: pageHead(p.tag, esc(p.title), esc(p.excerpt), [["Home", "/"], ["Blog", "/blog"], [p.title, ""]], `<p class="small dim" style="margin-top:16px">${fmtDate(p.date)} · ${p.read} min read · MND CODE</p>`) + `<section class="section-tight"><div class="wrap"><article class="prose">${p.body}</article></div></section><section class="section-tight" style="padding-bottom:clamp(56px,8vw,104px)"><div class="wrap"><div class="sec-head" style="margin-bottom:20px"><span class="eyebrow">Keep reading</span></div><div class="grid g2">${others.map(o => `<a class="card card-link" href="#/blog/${o.slug}" style="color:var(--text);text-decoration:none"><span class="chip chip-cyan">${o.tag}</span><h4 style="margin:12px 0 6px">${esc(o.title)}</h4><p class="small muted">${esc(o.excerpt)}</p></a>`).join("")}</div></div></section>` };
});

route("/faq", () => ({
  title: "FAQ", desc: "Frequently asked questions about MND CODE courses, labs, prerequisites, equipment and certification.",
  html: pageHead("FAQ", "Frequently asked questions.", "Can't find your answer? Send us a message.", [["Home", "/"], ["FAQ", ""]]) + `<section class="section-tight" style="padding-bottom:clamp(56px,8vw,104px)"><div class="wrap" style="max-width:900px"><div class="acc">${FAQS.map(faqItem).join("")}</div><div style="margin-top:24px"><a class="btn btn-primary" href="#/contact">Ask a question ${icon("arrow")}</a></div></div></section>`
}));

route("/contact", () => {
  const c = SITE.contact, cs = getCourses();
  return {
    title: "Contact Us", desc: "Contact MND CODE about courses, learning paths or partnerships.",
    html: pageHead("Contact", "Send us a message.", "Questions about a course, a learning path or anything else — we read every message.", [["Home", "/"], ["Contact", ""]]) + `
<section class="section-tight" style="padding-bottom:clamp(56px,8vw,104px)"><div class="wrap grid" style="grid-template-columns:minmax(0,1.4fr) minmax(0,1fr);gap:32px;align-items:start" id="cwrap">
 <form class="card stack" id="cform" novalidate style="gap:18px">
  <div class="grid g2"><div class="field"><label for="c-name">Full name *</label><input class="input" id="c-name" name="name" autocomplete="name" required maxlength="80"><span class="err" id="e-name"></span></div>
  <div class="field"><label for="c-email">Email *</label><input class="input" id="c-email" name="email" type="email" autocomplete="email" required maxlength="120"><span class="err" id="e-email"></span></div></div>
  <div class="grid g2"><div class="field"><label for="c-phone">Phone <span class="dim">(optional)</span></label><input class="input" id="c-phone" name="phone" type="tel" autocomplete="tel" maxlength="20" placeholder="+91"><span class="err" id="e-phone"></span></div>
  <div class="field"><label for="c-course">Course interest</label><select class="input" id="c-course" name="course"><option value="">Not sure yet</option>${cs.map(x => `<option>${esc(x.title)}</option>`).join("")}<option>Learning paths</option><option>Other</option></select></div></div>
  <div class="field"><label for="c-subject">Subject *</label><input class="input" id="c-subject" name="subject" required maxlength="120"><span class="err" id="e-subject"></span></div>
  <div class="field"><label for="c-msg">Message *</label><textarea class="input" id="c-msg" name="message" required maxlength="2000"></textarea><div class="row between"><span class="err" id="e-message"></span><span class="xs dim" id="c-count">0 / 2000</span></div></div>
  <p class="xs dim">We use the details you submit only to reply to your message. See the <a href="#/privacy">privacy policy</a>.</p>
  <div class="row"><button class="btn btn-primary" type="submit" id="c-submit">Send message ${icon("arrow")}</button><span class="demo-flag">Demo: saved to this browser's admin inbox</span></div>
  <div id="c-status" aria-live="polite"></div>
 </form>
 <div class="stack">
  <div class="card stack"><h4>Contact details</h4>${[["mail", "Email", c.email], ["globe", "Website", SITE.domain], ["user", "Phone", c.phone], ["home", "Address", c.address], ["clock", "Hours", c.hours]].map(([i, l, v]) => `<div class="row" style="flex-wrap:nowrap;align-items:flex-start"><span class="icon-box" style="width:36px;height:36px">${icon(i)}</span><div><div class="xs dim mono">${l.toUpperCase()}</div><div class="small">${v ? esc(v) : `<span class="dim">To be confirmed</span>`}</div></div></div>`).join("")}<p class="xs dim">Contact details are configured in <code>SITE.contact</code> and appear here once verified.</p></div>
  <div class="card stack"><h4>Before you write</h4><p class="small muted">Many common questions — prerequisites, equipment, labs, certification — are answered on the FAQ page.</p><a class="btn btn-ghost btn-sm" href="#/faq" style="align-self:flex-start">Read the FAQ</a></div>
 </div></div></section>`,
    init: () => {
      const cw = $("#cwrap"), mq = matchMedia("(max-width:900px)"), f = () => cw.style.gridTemplateColumns = mq.matches ? "minmax(0,1fr)" : "minmax(0,1.4fr) minmax(0,1fr)"; f(); mq.addEventListener("change", f);
      const u = currentUser(); if (u) { $("#c-name").value = u.name; $("#c-email").value = u.email; }
      $("#c-msg").oninput = e => $("#c-count").textContent = `${e.target.value.length} / 2000`;
      const rules = { name: v => v.trim().length >= 2 || "Enter your name (at least 2 characters).", email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || "Enter a valid email address, like name@example.com.", phone: v => !v.trim() || /^\+?[0-9 ()-]{7,20}$/.test(v.trim()) || "Use digits, spaces or + only (7–20 characters).", subject: v => v.trim().length >= 3 || "Add a short subject (at least 3 characters).", message: v => v.trim().length >= 20 || "Write at least 20 characters so we can help." };
      const check = n => { const el = $(`#cform [name=${n}]`), r = rules[n](el.value); el.setAttribute("aria-invalid", r !== true); el.setAttribute("aria-describedby", "e-" + n); $("#e-" + n).textContent = r === true ? "" : r; return r === true; };
      Object.keys(rules).forEach(n => $(`#cform [name=${n}]`).addEventListener("blur", () => check(n)));
      $("#cform").onsubmit = async e => {
        e.preventDefault();
        const ok = Object.keys(rules).map(check).every(Boolean);
        if (!ok) { $("#c-status").innerHTML = `<div class="alert alert-bad">${icon("alert")}<span>Please fix the highlighted fields.</span></div>`; $("#cform [aria-invalid=true]").focus(); return; }
        const btn = $("#c-submit"); btn.disabled = true; btn.innerHTML = `<span class="spinner"></span>Sending…`;
        await sleep(700);
        try {
          const fd = Object.fromEntries(new FormData($("#cform")));
          const msgs = store.get("messages", []); msgs.unshift({ id: uid(), ...Object.fromEntries(Object.entries(fd).map(([k, v]) => [k, String(v).trim().slice(0, 2000)])), ts: Date.now(), read: false }); store.set("messages", msgs);
          $("#c-status").innerHTML = `<div class="alert alert-ok">${icon("check")}<span><strong>Message received.</strong> In this demo it is stored in the admin inbox in your browser. On the live site it will be delivered to the MND CODE team.</span></div>`;
          $("#cform").reset(); $("#c-count").textContent = "0 / 2000";
        } catch { $("#c-status").innerHTML = `<div class="alert alert-bad">${icon("alert")}<span>Your message couldn't be saved. Check that browser storage is allowed, then try again.</span></div>`; }
        btn.disabled = false; btn.innerHTML = `Send message ${icon("arrow")}`;
      };
    }
  };
});

const legal = (title, sections) => pageHead("Legal", title, `Last updated ${fmtDate("2026-10-19")}. This page is a template prepared for ${esc(SITE.company)} and should be reviewed by a qualified legal professional before launch.`, [["Home", "/"], [title, ""]]) + `<section class="section-tight" style="padding-bottom:clamp(56px,8vw,104px)"><div class="wrap"><article class="prose">${sections.map(([h, b]) => `<h2>${h}</h2>${b}`).join("")}</article></div></section>`;
route("/privacy", () => ({
  title: "Privacy Policy", desc: "How MND CODE collects, uses and protects personal information.",
  html: legal("Privacy Policy", [
    ["Who we are", `<p>${esc(SITE.company)} operates ${esc(SITE.domain)} ("MND CODE", "we"). This policy explains what personal information we collect and how we use it.</p>`],
    ["Information we collect", `<ul><li><strong>Account details</strong> — name, email address and a securely hashed password when you register.</li><li><strong>Learning activity</strong> — enrolled courses, completed lessons, quiz attempts and bookmarks, so we can show your progress.</li><li><strong>Contact form submissions</strong> — name, email, optional phone number, course interest, subject and message.</li><li><strong>Technical data</strong> — basic server logs needed for security and reliability. Analytics is used only if configured with appropriate privacy controls, and this policy will list it.</li></ul>`],
    ["How we use it", `<ul><li>To provide courses, track progress and operate your account.</li><li>To reply to messages you send us.</li><li>To keep the platform secure, including detecting abuse.</li></ul><p>We do not sell personal information.</p>`],
    ["Retention", `<p>Account and progress data are kept while your account is active. Contact messages are kept for as long as needed to respond and for a limited period afterwards. You can ask us to delete your data.</p>`],
    ["Your rights", `<p>You can request access to, correction of, or deletion of your personal information through the contact page. We will respond in line with applicable law, including India's Digital Personal Data Protection Act, 2023, as its rules take effect.</p>`],
    ["Security", `<p>Passwords are stored only as salted hashes. Access to administrative functions is restricted by role and checked on the server.</p>`],
    ["Demo build notice", `<p>This preview stores sample accounts, progress and messages only in your own browser's local storage. Nothing is sent to MND CODE servers. Clearing your browser data removes it.</p>`]
  ])
}));
route("/terms", () => ({
  title: "Terms & Conditions", desc: "Terms and conditions for using MND CODE courses, labs and website.",
  html: legal("Terms & Conditions", [
    ["Acceptance", `<p>By using ${esc(SITE.domain)} you agree to these terms. If you do not agree, please do not use the site.</p>`],
    ["Accounts", `<p>Keep your login credentials confidential. You are responsible for activity under your account. Administrative accounts are granted by ${esc(SITE.company)} only.</p>`],
    ["Course content", `<p>Course materials are provided for your personal learning. You may not redistribute or resell them without written permission. Content is © MND CODE — All Rights Reserved.</p>`],
    ["Acceptable use and security training", `<p>Security techniques taught on this site may be practised <strong>only</strong> on systems you own or have explicit written authorization to test, and in isolated lab environments. Unauthorized access to computer systems may be an offence under the Information Technology Act, 2000 and other laws. MND CODE accepts no responsibility for misuse.</p>`],
    ["No guarantees", `<p>Courses are educational. MND CODE does not guarantee employment, certification, or any particular result. Estimated durations are estimates only.</p>`],
    ["Third-party services", `<p>Optional exercises may refer to third-party cloud providers whose services can be chargeable. You are responsible for any charges on your own provider accounts.</p>`],
    ["Changes", `<p>We may update these terms. Material changes will be announced on the site.</p>`],
    ["Contact", `<p>Questions about these terms can be sent through the <a href="#/contact">contact page</a>.</p>`]
  ])
}));

function notFound() {
  return { title: "Page not found", html: `<section class="section"><div class="wrap" style="text-align:center;display:flex;flex-direction:column;align-items:center;gap:18px"><div class="mono" style="font-size:clamp(3rem,10vw,6rem);font-weight:600;color:var(--cyan);line-height:1">404</div><p class="mono small dim">destination host unreachable: ${esc(curPath)}</p><h1 style="font-size:var(--t-2xl)">This page didn't route.</h1><p class="lead">The link may be outdated or mistyped. Try search, or head back to a known route.</p><div class="row" style="justify-content:center"><a class="btn btn-primary" href="#/">Go home</a><a class="btn btn-ghost" href="#/courses">Browse courses</a><button class="btn btn-ghost" type="button" onclick="openSearch()">${icon("search")}Search</button></div></div></section>` };
}
function errorPage(e) {
  return { title: "Something went wrong", html: `<section class="section"><div class="wrap" style="max-width:640px"><div class="alert alert-bad">${icon("alert")}<div><strong>This page failed to load.</strong><p class="small" style="margin-top:6px">Reload the page or go back. If it keeps happening, tell us through the contact page. Details: ${esc(e && e.message)}</p></div></div><div class="row" style="margin-top:20px"><a class="btn btn-primary" href="#/">Go home</a><button class="btn btn-ghost" type="button" onclick="render()">Try again</button></div></div></section>` };
}
function authWall(path, need) {
  const u = currentUser();
  return { title: "Sign in required", html: `<section class="section"><div class="wrap" style="max-width:560px"><div class="card stack" style="text-align:center;align-items:center;padding:40px"><span class="icon-box">${icon("lock")}</span><h1 style="font-size:var(--t-xl)">${need === "admin" && u ? "Administrator access required" : "Please sign in to continue"}</h1><p class="muted">${need === "admin" && u ? "Your account doesn't have permission to view this page." : "This area is for registered students."}</p><div class="row" style="justify-content:center">${need === "admin" && u ? `<a class="btn btn-primary" href="#/dashboard">Go to my dashboard</a>` : `<a class="btn btn-primary" href="#/login?next=${encodeURIComponent(path)}">Sign in</a><a class="btn btn-ghost" href="#/register">Create account</a>`}</div><p class="xs dim">Demo note: this check runs in the browser. The production backend enforces roles on every API request.</p></div></div></section>` };
}
