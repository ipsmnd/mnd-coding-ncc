import { PageHead, ProjectCard, usePageMeta } from "../components/ui.jsx";
import { PROJECTS } from "../lib/data.js";

export default function Projects() {
  usePageMeta("Projects", "Example guided projects from MND CODE courses: network design, VLAN routing, cloud architecture, Linux hardening and authorized web assessment.");
  return (
    <>
      <PageHead eyebrow="Projects" title="Guided projects with real deliverables." lead="These are educational example briefs used in the courses. They are not client work." crumbs={[["Home", "/"], ["Projects", ""]]} />
      <section className="section-tight" style={{ paddingBottom: "clamp(56px,8vw,104px)" }}><div className="wrap"><div className="grid g3">{PROJECTS.map(p => <ProjectCard key={p.title} p={p} />)}</div></div></section>
    </>
  );
}
