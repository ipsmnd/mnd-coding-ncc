/* ============================================================
   DATA ACCESS — merges admin edits stored in this browser
   with the base course content.
   ============================================================ */
import { store } from "./config.js";
import { BASE_COURSES, LESSONS, RESOURCES, POSTS, PROJECTS, PROJECT_GUIDES, FAQS, PATHS } from "./courseData.js";

export { BASE_COURSES, LESSONS, RESOURCES, POSTS, PROJECTS, PROJECT_GUIDES, FAQS, PATHS };

export function getCourses() {
  const ov = store.get("admin:courses", {});
  const extra = store.get("admin:extraLessons", {});
  const status = store.get("admin:lessonStatus", {});
  const custom = store.get("admin:customCourses", []);
  const all = [...BASE_COURSES.map(c => ({ ...c, custom: false })), ...custom.map(c => ({ ...c, custom: true }))];
  return all.filter(c => !(ov[c.slug] && ov[c.slug].deleted)).map(c => {
    const o = ov[c.slug] || {};
    const course = { ...c, ...o };
    course.modules = (c.modules || []).map((m, mi) => {
      const lessons = m.topics.map((t, li) => ({ key: `${c.slug}/m${mi + 1}-l${li + 1}`, id: `m${mi + 1}-l${li + 1}`, title: t, custom: false }))
        .concat(((extra[c.slug] || {})[mi] || []).map((x, xi) => ({ key: `${c.slug}/m${mi + 1}-x${xi + 1}`, id: `m${mi + 1}-x${xi + 1}`, title: x.title, body: x.body, custom: true })));
      lessons.forEach(l => { l.status = status[l.key] || "published"; l.module = mi; l.minutes = LESSONS[l.key]?.minutes || (m.project ? 90 : 35); l.authored = !!LESSONS[l.key] || l.custom; });
      return { ...m, index: mi, lessons };
    });
    course.allLessons = course.modules.flatMap(m => m.lessons);
    course.lessons = course.allLessons.filter(l => l.status === "published");
    course.hours = Math.max(1, Math.round(course.lessons.reduce((a, l) => a + l.minutes, 0) / 60));
    course.route = "/courses/" + c.slug;
    return course;
  });
}
export const findCourse = s => getCourses().find(c => c.slug === s);
export const findLesson = (c, id) => c && c.lessons.find(l => l.id === id);

/* Course categories for the header menu, mobile nav and footer */
export const CAT_ICON = { Networking: "network", Cloud: "cloud", Cybersecurity: "shield", "Penetration Testing": "target" };
export const catHref = cat => "/courses?cat=" + encodeURIComponent(cat);
export function courseCats() {
  const m = new Map();
  getCourses().forEach(c => { if (!m.has(c.category)) m.set(c.category, []); m.get(c.category).push(c); });
  return [...m].map(([name, list]) => ({ name, list, icon: CAT_ICON[name] || list[0].icon }));
}

/* Sections that open only for signed-in students */
export const STUDENT_ONLY = ["/projects", "/resources", "/practice"];
export const isStudentOnly = h => STUDENT_ONLY.some(p => h === p || h.startsWith(p + "/") || h.startsWith(p + "?"));

export const LEARN_MENU = [
  { title: "Study", items: [
    ["Learning Paths", "/learning-paths", "route", "Step-by-step tracks from fundamentals to projects"],
    ["Projects", "/projects", "layers", "Guided projects with checklists and deliverables"],
    ["Resources", "/resources", "book", "Cheat sheets, guides and reference material"]] },
  { title: "Practice", items: [
    ["Labs", "/labs", "flask", "Ten hands-on browser exercises"],
    ["Practice Arena", "/practice", "target", "Topic practice and timed mock exams"]] }
];
export const learnMenu = user => LEARN_MENU.map(g => ({ ...g, items: g.items.filter(([, h]) => user || !isStudentOnly(h)) })).filter(g => g.items.length);

export const LAB_LIST = [
  { id: "subnet", title: "Subnetting calculator", icon: "network", desc: "Network, broadcast, mask and host range for any IPv4/CIDR, plus practice questions." },
  { id: "osi", title: "OSI model explorer", icon: "layers", desc: "Click through all seven layers with real devices, protocols and examples." },
  { id: "packet", title: "Packet journey", icon: "route", desc: "Step a packet from laptop to web server and watch headers change hop by hop." },
  { id: "dns", title: "DNS lookup simulator", icon: "globe", desc: "Resolve names through root, TLD and authoritative servers using sample records." },
  { id: "linux", title: "Linux command quiz", icon: "terminal", desc: "Complete six tasks in a safe simulated terminal." },
  { id: "cloud", title: "Cloud architecture builder", icon: "cloud", desc: "Place components in public and private subnets and pass the design checks." },
  { id: "firewall", title: "Firewall rule evaluation", icon: "shield", desc: "Predict which synthetic packets an ordered rule set allows or denies." },
  { id: "quiz", title: "Knowledge quizzes", icon: "target", desc: "Ten-question quizzes drawn from each course's module checks." },
  { id: "vuln", title: "Vulnerability prioritisation", icon: "bug", desc: "Rank sample findings by real risk, not only CVSS score." },
  { id: "report", title: "Security report writing", icon: "file", desc: "Write a finding for a fictional lab scenario and get structured feedback." }
];

/* Site-wide search */
export function searchIndex(user) {
  const out = [];
  getCourses().forEach(c => {
    out.push({ t: c.title, s: c.short, k: "Course", h: c.route });
    c.modules.forEach((m, i) => out.push({ t: `Module ${i + 1}: ${m.title}`, s: c.title, k: "Module", h: `${c.route}?m=${i + 1}` }));
    c.lessons.forEach(l => out.push({ t: l.title, s: c.title, k: "Lesson", h: `/learn/${c.slug}/${l.id}` }));
  });
  RESOURCES.forEach(r => out.push({ t: r.title, s: r.type, k: "Resource", h: "/resources?r=" + r.id }));
  POSTS.forEach(p => out.push({ t: p.title, s: p.excerpt, k: "Blog", h: "/blog/" + p.slug }));
  PROJECTS.forEach(p => out.push({ t: p.title, s: "Example project", k: "Project", h: p.guide ? "/projects/" + p.guide : "/projects" }));
  PROJECT_GUIDES.forEach(g => out.push({ t: g.title, s: "Project guide · checklist + " + g.projects.length + " projects", k: "Guide", h: "/projects/" + g.slug }));
  LAB_LIST.forEach(l => out.push({ t: l.title, s: l.desc, k: "Lab", h: "/labs?t=" + l.id }));
  [["Practice Arena — mock tests", "/practice"], ["Mock exam (timed)", "/practice?mode=exam"], ["Learning paths", "/learning-paths"], ["FAQ", "/faq"], ["Contact us", "/contact"], ["About MND CODE", "/about"]].forEach(([t, h]) => out.push({ t, s: "Page", k: "Page", h }));
  return user ? out : out.filter(x => !isStudentOnly(x.h));
}
export function searchFn(q, user, limit = 40) {
  const terms = q.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  return searchIndex(user).map(x => { const hay = (x.t + " " + x.s).toLowerCase(); let score = 0; for (const t of terms) { if (!hay.includes(t)) return null; score += x.t.toLowerCase().includes(t) ? 3 : 1; } if (x.k === "Course") score += 2; return { ...x, score }; }).filter(Boolean).sort((a, b) => b.score - a.score).slice(0, limit);
}
