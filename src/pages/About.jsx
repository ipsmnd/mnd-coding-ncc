import { Link } from "react-router-dom";
import { Icon } from "../components/Icon.jsx";
import { PageHead, usePageMeta } from "../components/ui.jsx";
import { SITE } from "../lib/config.js";

const Stat = ({ label, value }) => <div className="card"><div className="stat"><span>{label}</span><b style={{ fontSize: "var(--t-lg)" }}>{value}</b></div></div>;

export default function About() {
  usePageMeta("About Us", "About MND CODE Pvt Ltd — a technical education platform for networking, cloud and cybersecurity.");
  return (
    <>
      <PageHead eyebrow="About MND CODE" title="Technical education that respects your time and your judgement." lead="MND CODE helps students and aspiring IT professionals build practical skills in computer networking, cloud infrastructure, cybersecurity and authorized penetration testing." crumbs={[["Home", "/"], ["About", ""]]} />
      <section className="section"><div className="wrap grid g2" style={{ gap: 48, alignItems: "start" }}>
        <div className="prose">
          <h2 style={{ marginTop: 0 }}>What we do</h2>
          <p>We publish structured courses that teach how networks, cloud platforms and security controls actually work — then let you practise those ideas immediately in browser labs and guided projects.</p>
          <p>Our three courses connect: networking is the foundation, cloud extends it to virtual infrastructure, and security teaches you to assess and defend both. Learners can follow a complete path or take the course they need.</p>
          <h2>How we teach</h2>
          <ul><li><strong>Clarity first.</strong> Plain language, worked examples and diagrams before jargon.</li><li><strong>Practice next to theory.</strong> Exercises sit beside the lessons they reinforce.</li><li><strong>Responsibility always.</strong> Security testing is taught only for systems you own or are authorized to test.</li><li><strong>Honest claims.</strong> We publish what each course covers. We do not advertise ratings, placement figures or certifications we cannot substantiate.</li></ul>
        </div>
        <div className="stack">
          <Stat label="Company" value={SITE.company} />
          <div className="grid g2"><Stat label="Established" value={SITE.established} /><Stat label="Website" value={SITE.domain} /></div>
          <div className="card"><div className="stat"><span>Tagline</span><b style={{ fontSize: "var(--t-lg)" }}>{SITE.tagline}</b></div><p className="small muted" style={{ marginTop: 10 }}>Connect — understand how systems talk. Compute — build on cloud infrastructure. Secure — protect what you build.</p></div>
          <p className="xs dim">Founding date as supplied by the company. Registration details are available on request through the contact page.</p>
        </div>
      </div></section>
      <section className="section-tight" style={{ paddingBottom: "clamp(56px,8vw,104px)" }}><div className="wrap"><div className="cta"><h2 style={{ marginBottom: 16 }}>See the full curriculum.</h2><div className="hero-actions"><Link className="btn btn-primary" to="/courses">Browse courses <Icon name="arrow" /></Link><Link className="btn btn-ghost" to="/contact">Contact us</Link></div></div></div></section>
    </>
  );
}
