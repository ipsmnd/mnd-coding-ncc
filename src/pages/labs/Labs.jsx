/* ============================================================
   INTERACTIVE LAB — ten browser exercises in tabs.
   ============================================================ */
import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Icon } from "../../components/Icon.jsx";
import { Select } from "../../components/Select.jsx";
import { PageHead, usePageMeta } from "../../components/ui.jsx";
import { LAB_LIST } from "../../lib/data.js";
import { SubnetLab, OsiLab, PacketLab, DnsLab } from "./NetworkLabs.jsx";
import { LinuxLab } from "./LinuxLab.jsx";
import { CloudLab, FirewallLab, QuizLab, VulnLab, ReportLab } from "./BuildLabs.jsx";

const LAB_COMPONENT = { subnet: SubnetLab, osi: OsiLab, packet: PacketLab, dns: DnsLab, linux: LinuxLab, cloud: CloudLab, firewall: FirewallLab, quiz: QuizLab, vuln: VulnLab, report: ReportLab };

export default function Labs() {
  usePageMeta("Practical Labs", "Ten browser-based networking, cloud and security exercises: subnetting, OSI, packet flow, DNS, Linux, cloud architecture, firewall rules, quizzes, vulnerability prioritisation and report writing.");
  const [params, setParams] = useSearchParams();
  const t = LAB_LIST.some(l => l.id === params.get("t")) ? params.get("t") : "subnet";
  const lab = LAB_LIST.find(l => l.id === t), Body = LAB_COMPONENT[t];
  const tabs = useRef(null);
  const open = id => setParams({ t: id }, { replace: true });

  useEffect(() => { const b = tabs.current && tabs.current.querySelector(`#tab-${t}`); b && b.scrollIntoView({ block: "nearest", inline: "center" }); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <PageHead eyebrow="Interactive lab" title="Practise in the browser. Safely." lead="Ten exercises with real calculations, validation and feedback. Every network, DNS, cloud and scan result is simulated from sample data." crumbs={[["Home", "/"], ["Labs", ""]]} />
      <section className="section-tight" style={{ paddingBottom: "clamp(56px,8vw,104px)" }}><div className="wrap">
        <div className="lab-tabs" role="tablist" aria-label="Lab exercises" ref={tabs}
          onKeyDown={e => {
            if (!["ArrowRight", "ArrowLeft"].includes(e.key)) return;
            const i = LAB_LIST.findIndex(l => "tab-" + l.id === document.activeElement.id); if (i < 0) return;
            const n = LAB_LIST[(i + (e.key === "ArrowRight" ? 1 : -1) + LAB_LIST.length) % LAB_LIST.length];
            open(n.id); setTimeout(() => document.getElementById("tab-" + n.id)?.focus(), 0);
          }}>
          {LAB_LIST.map((l, i) => (
            <button key={l.id} className="lab-tab" role="tab" type="button" id={"tab-" + l.id} aria-selected={l.id === t} aria-controls="labPane" onClick={() => open(l.id)}>
              <span className="mono xs dim">{String(i + 1).padStart(2, "0")}</span>{l.title}
            </button>
          ))}
        </div>
        <div className="field lab-select"><label htmlFor="labSel">Exercise</label>
          <Select id="labSel" value={t} onChange={open} options={LAB_LIST.map((l, i) => ({ value: l.id, label: `${String(i + 1).padStart(2, "0")} · ${l.title}` }))} /></div>
        <div className="card" style={{ marginTop: 16, padding: "clamp(18px,3vw,32px)" }} role="tabpanel" id="labPane" aria-labelledby={"tab-" + t}>
          <div className="row between" style={{ marginBottom: 20 }}><div className="row"><span className="icon-box"><Icon name={lab.icon} /></span><div><h2 style={{ fontSize: "var(--t-xl)" }}>{lab.title}</h2><p className="small muted">{lab.desc}</p></div></div></div>
          <div><Body key={t} /></div>
        </div>
      </div></section>
    </>
  );
}
