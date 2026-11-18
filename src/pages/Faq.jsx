import { Link } from "react-router-dom";
import { Icon } from "../components/Icon.jsx";
import { FaqItem, PageHead, usePageMeta } from "../components/ui.jsx";
import { FAQS } from "../lib/data.js";

export default function Faq() {
  usePageMeta("FAQ", "Frequently asked questions about MND CODE courses, labs, prerequisites, equipment and certification.");
  return (
    <>
      <PageHead eyebrow="FAQ" title="Frequently asked questions." lead="Can't find your answer? Send us a message." crumbs={[["Home", "/"], ["FAQ", ""]]} />
      <section className="section-tight" style={{ paddingBottom: "clamp(56px,8vw,104px)" }}><div className="wrap" style={{ maxWidth: 900 }}>
        <div className="acc">{FAQS.map(([q, a]) => <FaqItem key={q} q={q} a={a} />)}</div>
        <div style={{ marginTop: 24 }}><Link className="btn btn-primary" to="/contact">Ask a question <Icon name="arrow" /></Link></div>
      </div></section>
    </>
  );
}
