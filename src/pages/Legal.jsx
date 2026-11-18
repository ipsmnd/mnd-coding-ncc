import { Link } from "react-router-dom";
import { PageHead, usePageMeta } from "../components/ui.jsx";
import { SITE, fmtDate } from "../lib/config.js";

function Legal({ title, desc, sections }) {
  usePageMeta(title, desc);
  return (
    <>
      <PageHead eyebrow="Legal" title={title} lead={`Last updated ${fmtDate("2026-10-19")}. This page is a template prepared for ${SITE.company} and should be reviewed by a qualified legal professional before launch.`} crumbs={[["Home", "/"], [title, ""]]} />
      <section className="section-tight" style={{ paddingBottom: "clamp(56px,8vw,104px)" }}><div className="wrap"><article className="prose">
        {sections.map(([h, b]) => <div key={h}><h2>{h}</h2>{b}</div>)}
      </article></div></section>
    </>
  );
}

export function Privacy() {
  return <Legal title="Privacy Policy" desc="How MND CODE collects, uses and protects personal information." sections={[
    ["Who we are", <p>{SITE.company} operates {SITE.domain} ("MND CODE", "we"). This policy explains what personal information we collect and how we use it.</p>],
    ["Information we collect", <ul><li><strong>Account details</strong> — name, email address and a securely hashed password when you register.</li><li><strong>Learning activity</strong> — enrolled courses, completed lessons, quiz attempts and bookmarks, so we can show your progress.</li><li><strong>Contact form submissions</strong> — name, email, optional phone number, course interest, subject and message.</li><li><strong>Technical data</strong> — basic server logs needed for security and reliability. Analytics is used only if configured with appropriate privacy controls, and this policy will list it.</li></ul>],
    ["How we use it", <><ul><li>To provide courses, track progress and operate your account.</li><li>To reply to messages you send us.</li><li>To keep the platform secure, including detecting abuse.</li></ul><p>We do not sell personal information.</p></>],
    ["Retention", <p>Account and progress data are kept while your account is active. Contact messages are kept for as long as needed to respond and for a limited period afterwards. You can ask us to delete your data.</p>],
    ["Your rights", <p>You can request access to, correction of, or deletion of your personal information through the contact page. We will respond in line with applicable law, including India's Digital Personal Data Protection Act, 2023, as its rules take effect.</p>],
    ["Security", <p>Passwords are stored only as salted hashes. Access to administrative functions is restricted by role and checked on the server.</p>],
    ["Demo build notice", <p>This preview stores sample accounts, progress and messages only in your own browser's local storage. Nothing is sent to MND CODE servers. Clearing your browser data removes it.</p>]
  ]} />;
}

export function Terms() {
  return <Legal title="Terms & Conditions" desc="Terms and conditions for using MND CODE courses, labs and website." sections={[
    ["Acceptance", <p>By using {SITE.domain} you agree to these terms. If you do not agree, please do not use the site.</p>],
    ["Accounts", <p>Keep your login credentials confidential. You are responsible for activity under your account. Administrative accounts are granted by {SITE.company} only.</p>],
    ["Course content", <p>Course materials are provided for your personal learning. You may not redistribute or resell them without written permission. Content is © MND CODE — All Rights Reserved.</p>],
    ["Acceptable use and security training", <p>Security techniques taught on this site may be practised <strong>only</strong> on systems you own or have explicit written authorization to test, and in isolated lab environments. Unauthorized access to computer systems may be an offence under the Information Technology Act, 2000 and other laws. MND CODE accepts no responsibility for misuse.</p>],
    ["No guarantees", <p>Courses are educational. MND CODE does not guarantee employment, certification, or any particular result. Estimated durations are estimates only.</p>],
    ["Third-party services", <p>Optional exercises may refer to third-party cloud providers whose services can be chargeable. You are responsible for any charges on your own provider accounts.</p>],
    ["Changes", <p>We may update these terms. Material changes will be announced on the site.</p>],
    ["Contact", <p>Questions about these terms can be sent through the <Link to="/contact">contact page</Link>.</p>]
  ]} />;
}
