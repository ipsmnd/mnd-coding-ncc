/* ============================================================
   NETWORK LABS — subnetting, OSI, packet journey, DNS.
   All results are computed locally or simulated from sample data.
   ============================================================ */
import { Fragment, useEffect, useRef, useState } from "react";
import { Icon } from "../../components/Icon.jsx";
import { Select } from "../../components/Select.jsx";
import { useApp } from "../../components/AppContext.jsx";
import { reducedMotion, shuffle, sleep } from "../../lib/config.js";

export function SimNote() {
  return <p className="xs dim" style={{ marginTop: 12 }}><Icon name="info" style={{ width: 13, height: 13, verticalAlign: -2 }} /> Simulated with sample data in your browser. No real network, DNS, cloud or scan activity takes place.</p>;
}
const Fb = ({ ok, children }) => <div className={`alert ${ok ? "alert-ok" : "alert-bad"}`}><Icon name={ok ? "check" : "alert"} /><span>{children}</span></div>;

/* ---------- 1. Subnetting ---------- */
export const ip2n = s => { const p = s.trim().split("."); if (p.length !== 4 || p.some(x => !/^\d{1,3}$/.test(x) || +x > 255)) return null; return p.reduce((a, x) => a * 256 + +x, 0); };
export const n2ip = n => [24, 16, 8, 0].map(s => Math.floor(n / 2 ** s) % 256).join(".");
const toBin = n => [24, 16, 8, 0].map(s => (Math.floor(n / 2 ** s) % 256).toString(2).padStart(8, "0")).join(".");
export function subnet(ipStr, prefix) {
  const ip = ip2n(ipStr); if (ip == null) return { error: "Enter a valid IPv4 address: four numbers from 0 to 255 separated by dots, e.g. 192.168.10.77." };
  prefix = +prefix; if (!(prefix >= 0 && prefix <= 32)) return { error: "Prefix must be between 0 and 32." };
  const size = 2 ** (32 - prefix), mask = 2 ** 32 - size, net = Math.floor(ip / size) * size, bc = net + size - 1;
  const usable = prefix === 32 ? 1 : prefix === 31 ? 2 : size - 2;
  const first = prefix >= 31 ? net : net + 1, last = prefix >= 31 ? bc : bc - 1;
  const o1 = Math.floor(ip / 2 ** 24), o2 = Math.floor(ip / 2 ** 16) % 256;
  const priv = o1 === 10 || (o1 === 172 && o2 >= 16 && o2 <= 31) || (o1 === 192 && o2 === 168);
  const type = o1 === 127 ? "Loopback" : (o1 === 169 && o2 === 254) ? "Link-local (APIPA)" : o1 >= 224 && o1 <= 239 ? "Multicast" : (o1 === 100 && o2 >= 64 && o2 <= 127) ? "Shared (CGNAT)" : priv ? "Private (RFC 1918)" : "Public";
  return { ip, prefix, size, mask, net, bc, usable, first, last, type, wildcard: 2 ** 32 - 1 - mask };
}
const PREFIX_OPTS = Array.from({ length: 33 }, (_, p) => ({ value: p, label: `/${p} — ${n2ip(2 ** 32 - 2 ** (32 - p))}` }));

export function SubnetLab({ compact = false }) {
  const [ip, setIp] = useState("192.168.10.77");
  const [prefix, setPrefix] = useState(26);
  const r = subnet(ip, prefix);
  const rows = r.error ? [] : [["Network address", n2ip(r.net) + "/" + r.prefix], ["Broadcast address", r.prefix >= 31 ? "n/a (" + (r.prefix === 31 ? "point-to-point" : "single host") + ")" : n2ip(r.bc)], ["Subnet mask", n2ip(r.mask)], ["Wildcard mask", n2ip(r.wildcard)], ["First usable host", n2ip(r.first)], ["Last usable host", n2ip(r.last)], ["Usable hosts", r.usable.toLocaleString("en-IN")], ["Total addresses", r.size.toLocaleString("en-IN")], ["Address type", r.type], ["Block size", r.size >= 256 ? "spans octets" : r.size + " in last octet"]];
  const bits = r.error ? [] : toBin(r.ip).replace(/\./g, "").split("");
  return (
    <>
      <div className="lab-pane">
        <form className="stack" onSubmit={e => e.preventDefault()}>
          <div className="field"><label htmlFor="sn-ip">IPv4 address</label>
            <input className="input mono-in" id="sn-ip" value={ip} onChange={e => setIp(e.target.value)} inputMode="decimal" autoComplete="off" spellCheck="false" aria-invalid={!!r.error} /></div>
          <div className="field"><label htmlFor="sn-p">Prefix length (CIDR) <span className="dim">/{prefix}</span></label>
            <input id="sn-p" type="range" min="0" max="32" value={prefix} onChange={e => setPrefix(+e.target.value)} style={{ width: "100%", accentColor: "#22D3EE" }} />
            <Select className="input mono-in" ariaLabel="Prefix as subnet mask" value={prefix} onChange={v => setPrefix(+v)} options={PREFIX_OPTS} /></div>
          <span className="err" aria-live="polite">{r.error || ""}</span>
          <button className="btn btn-ghost btn-sm" type="button" style={{ alignSelf: "flex-start" }} onClick={() => { setIp("192.168.10.77"); setPrefix(26); }}><Icon name="reset" />Reset example</button>
        </form>
        <div className="stack">
          <div className="result-grid" aria-live="polite">{rows.map(([k, v]) => <div key={k}><span>{k}</span><b>{v}</b></div>)}</div>
          {!r.error && <div className="bits allow-copy">
            <div className="dim xs">BINARY · <span className="n">network bits ({r.prefix})</span> · <span className="h">host bits ({32 - r.prefix})</span></div>
            {bits.map((ch, i) => <Fragment key={i}>{i && i % 8 === 0 ? "." : ""}<span className={i < r.prefix ? "n" : "h"}>{ch}</span></Fragment>)}
          </div>}
        </div>
      </div>
      {!compact && <><hr className="rule" style={{ margin: "28px 0" }} /><div className="stack"><h3 style={{ fontSize: "var(--t-md)" }}>Practice mode</h3><p className="small muted">Work it out by hand, then check. Questions are generated randomly.</p><SubnetPractice /></div></>}
    </>
  );
}

function newSubnetQ() {
  const p = 20 + Math.floor(Math.random() * 10), ip = n2ip([10, 172, 192][Math.floor(Math.random() * 3)] * 2 ** 24 + Math.floor(Math.random() * 2 ** 24));
  const r = subnet(ip, p), ask = ["network", "broadcast", "usable"][Math.floor(Math.random() * 3)];
  return { p, ip, r, ask, ans: ask === "network" ? n2ip(r.net) : ask === "broadcast" ? n2ip(r.bc) : String(r.usable) };
}
function SubnetPractice() {
  const [q, setQ] = useState(newSubnetQ);
  const [v, setV] = useState("");
  const [fb, setFb] = useState(null);
  const check = () => setFb(v.trim().replace(/,/g, "") === q.ans);
  const next = () => { setQ(newSubnetQ()); setV(""); setFb(null); };
  return (
    <div>
      <div className="row" style={{ alignItems: "end" }}>
        <div className="field" style={{ flex: 1, minWidth: 220 }}><label htmlFor="pq">What is the <strong>{q.ask === "usable" ? "number of usable hosts" : q.ask + " address"}</strong> for <code>{q.ip}/{q.p}</code>?</label>
          <input className="input mono-in" id="pq" autoComplete="off" value={v} onChange={e => setV(e.target.value)} onKeyDown={e => { if (e.key === "Enter") check(); }} /></div>
        <button className="btn btn-primary" type="button" onClick={check}>Check</button>
        <button className="btn btn-ghost" type="button" onClick={next}>New question</button>
      </div>
      <div aria-live="polite" style={{ marginTop: 12 }}>
        {fb !== null && <Fb ok={fb}>{fb ? "Correct." : <>Not quite. The answer is <code>{q.ans}</code>.</>} Block size is 2^{32 - q.p} = {q.r.size.toLocaleString("en-IN")} addresses; network {n2ip(q.r.net)}, broadcast {n2ip(q.r.bc)}.</Fb>}
      </div>
    </div>
  );
}

/* ---------- 2. OSI ---------- */
export const OSI = [
  { n: 7, name: "Application", pdu: "Data", dev: "Hosts, proxies, application firewalls", proto: "HTTP, HTTPS, DNS, SMTP, SSH, DHCP", ex: "Your browser sends GET /index.html to a web server.", fix: "Wrong URL, server returns 500, DNS name not found." },
  { n: 6, name: "Presentation", pdu: "Data", dev: "Hosts", proto: "TLS encryption, UTF-8, JPEG, compression", ex: "TLS encrypts the HTTP request before it leaves your laptop.", fix: "Certificate errors, character-encoding problems." },
  { n: 5, name: "Session", pdu: "Data", dev: "Hosts", proto: "Session setup and teardown (e.g. RPC, TLS sessions)", ex: "A video call keeps one logical session open while you talk.", fix: "Sessions timing out, repeated re-authentication." },
  { n: 4, name: "Transport", pdu: "Segment / Datagram", dev: "Hosts, stateful firewalls, load balancers", proto: "TCP, UDP — ports 443, 53, 22…", ex: "TCP opens a connection to port 443 with a three-way handshake.", fix: "Port blocked by firewall, service not listening." },
  { n: 3, name: "Network", pdu: "Packet", dev: "Routers, Layer 3 switches", proto: "IPv4, IPv6, ICMP", ex: "Your router forwards the packet toward 203.0.113.10.", fix: "Wrong gateway, missing route, bad subnet mask." },
  { n: 2, name: "Data Link", pdu: "Frame", dev: "Switches, access points, NICs", proto: "Ethernet, Wi-Fi (802.11), ARP, VLAN tags", ex: "The switch looks up the destination MAC and forwards the frame out one port.", fix: "Wrong VLAN, duplex mismatch, MAC flapping." },
  { n: 1, name: "Physical", pdu: "Bits", dev: "Cables, transceivers, hubs, radios", proto: "Copper, fibre, radio signals", ex: "Your Wi-Fi card converts the frame into radio waves.", fix: "Unplugged cable, weak Wi-Fi signal, damaged fibre." }
];
const LAB_OSI_Q = [["Switch forwarding by MAC address", 2], ["Router choosing a path by IP address", 3], ["HTTP GET request", 7], ["TCP port 443", 4], ["Fibre-optic cable", 1], ["TLS encryption", 6], ["ARP request", 2], ["ICMP echo (ping)", 3], ["DNS query", 7], ["UDP datagram", 4]];

export function OsiLab() {
  const [layer, setLayer] = useState(4);
  const l = OSI.find(x => x.n === layer);
  return (
    <>
      <div className="lab-pane">
        <div className="osi">{OSI.map(o => <button key={o.n} type="button" aria-pressed={o.n === layer} onClick={() => setLayer(o.n)}><b>L{o.n}</b><span>{o.name}</span><span className="xs dim">{o.pdu}</span></button>)}</div>
        <div className="stack">
          <div><span className="eyebrow">Layer {l.n}</span><h3 style={{ marginTop: 8 }}>{l.name}</h3></div>
          <div className="result-grid"><div><span>PDU</span><b>{l.pdu}</b></div><div><span>Devices</span><b style={{ fontFamily: "var(--f-body)", fontSize: "var(--t-sm)" }}>{l.dev}</b></div></div>
          <div className="callout"><h4>Protocols & standards</h4><p className="small">{l.proto}</p></div>
          <div className="callout ok"><h4>Real-world example</h4><p className="small">{l.ex}</p></div>
          <div className="callout warn"><h4>Typical problems at this layer</h4><p className="small">{l.fix}</p></div>
        </div>
      </div>
      <hr className="rule" style={{ margin: "28px 0" }} />
      <div className="stack"><h3 style={{ fontSize: "var(--t-md)" }}>Which layer?</h3><OsiQuiz /></div>
    </>
  );
}
function OsiQuiz() {
  const [order, setOrder] = useState(() => shuffle(LAB_OSI_Q));
  const [qi, setQi] = useState(0), [sc, setSc] = useState(0), [pick, setPick] = useState(null);
  if (qi >= order.length) return (
    <div><div className="alert alert-ok"><Icon name="award" /><span>You scored {sc} / {order.length}.</span></div>
      <button className="btn btn-ghost btn-sm" type="button" style={{ marginTop: 12 }} onClick={() => { setQi(0); setSc(0); setPick(null); setOrder(shuffle(LAB_OSI_Q)); }}><Icon name="reset" />Restart</button></div>
  );
  const [t, a] = order[qi];
  return (
    <div>
      <p className="small">{qi + 1}/{order.length} · At which layer does this belong: <strong>{t}</strong>?</p>
      <div className="row" style={{ marginTop: 10 }}>{[1, 2, 3, 4, 5, 6, 7].map(n => <button key={n} className="btn btn-ghost btn-sm" type="button" disabled={pick !== null} onClick={() => { setPick(n); if (n === a) setSc(sc + 1); }}>L{n}</button>)}</div>
      <div aria-live="polite" style={{ marginTop: 10 }}>{pick !== null && <>
        <Fb ok={pick === a}>{pick === a ? "Correct" : "Answer: Layer " + a} — {OSI.find(x => x.n === a).name}.</Fb>
        <button className="btn btn-primary btn-sm" type="button" style={{ marginTop: 10 }} autoFocus onClick={() => { setQi(qi + 1); setPick(null); }}>Next</button>
      </>}</div>
    </div>
  );
}

/* ---------- 3. Packet journey ---------- */
const PJ = {
  web: { label: "Load a web page", nodes: [["Laptop", "192.168.1.20", 60], ["Switch", "L2", 210], ["Home router", "192.168.1.1 / 198.51.100.7", 360], ["ISP router", "198.51.100.1", 510], ["Web server", "203.0.113.10", 660]],
    steps: [[0, "Your browser builds an HTTPS request. TCP adds source port 51544 → destination port 443. IP adds 192.168.1.20 → 203.0.113.10."], [0, "The destination is not on the local subnet, so the laptop sends the frame to its default gateway. ARP finds the router's MAC address."], [1, "The switch reads the destination MAC, finds it in its MAC table, and forwards the frame out of the router's port. IP addresses are untouched."], [2, "The router strips the Ethernet header, checks its routing table (default route → ISP) and performs NAT: source becomes 198.51.100.7."], [3, "The ISP router decrements TTL and forwards the packet using longest-prefix match toward 203.0.113.0/24. A new Layer 2 header is added for each link."], [4, "The web server receives the segment on port 443, TLS decrypts it, and the HTTP request is handed to the web application. The reply follows the path in reverse."]] },
  ping: { label: "Ping the gateway", nodes: [["Laptop", "192.168.1.20", 110], ["Switch", "L2", 360], ["Home router", "192.168.1.1", 610]],
    steps: [[0, "ping 192.168.1.1 creates an ICMP Echo Request. The gateway is on the same subnet, so no routing is needed."], [0, "The laptop checks its ARP cache. If the router's MAC is missing, it broadcasts an ARP request: 'Who has 192.168.1.1?'"], [1, "The switch floods the ARP broadcast to all ports in the VLAN. The router replies with its MAC address."], [2, "The router receives the ICMP Echo Request and sends an Echo Reply. Round-trip time is reported by ping."]] }
};
const svgT = { fontFamily: "Space Grotesk,sans-serif", fontWeight: 600 }, svgM = { fontFamily: "JetBrains Mono,monospace" };

export function PacketLab() {
  const [sc, setSc] = useState("web");
  const [i, setI] = useState(0);
  const [auto, setAuto] = useState(false);
  const [narrow, setNarrow] = useState(false);
  const box = useRef(null);
  const s = PJ[sc], cur = s.steps[i][0];

  useEffect(() => {
    const el = box.current; if (!el) return;
    const ro = new ResizeObserver(() => setNarrow(el.clientWidth < 560)); ro.observe(el);
    return () => ro.disconnect();
  }, []);
  useEffect(() => {
    if (!auto) return;
    const t = setInterval(() => setI(x => { if (x >= PJ[sc].steps.length - 1) { setAuto(false); return x; } return x + 1; }), 2200);
    return () => clearInterval(t);
  }, [auto, sc]);

  const H = s.nodes.length * 78 + 10;
  return (
    <div ref={box}>
      <div className="row" style={{ marginBottom: 16 }}><div className="tab-row">{Object.entries(PJ).map(([k, v]) => <button key={k} type="button" aria-pressed={k === sc} onClick={() => { setAuto(false); setSc(k); setI(0); }}>{v.label}</button>)}</div></div>
      <div style={{ overflowX: "auto" }} id="pjWrap">
        {narrow ? (
          <svg className="packet-svg" viewBox={`0 0 320 ${H}`} role="img" aria-label="Network path diagram">
            <defs><linearGradient id="pjg" x1="0" x2="1"><stop offset="0" stopColor="#3B82F6" /><stop offset="1" stopColor="#22D3EE" /></linearGradient></defs>
            {s.nodes.slice(1).map((n, k) => <line key={k} x1="160" y1={k * 78 + 56} x2="160" y2={(k + 1) * 78 + 12} stroke="#94A3B8" strokeOpacity=".35" strokeWidth="2" />)}
            {s.nodes.map((n, k) => <g key={k}><rect x="60" y={k * 78 + 12} width="200" height="44" rx="10" fill={k === cur ? "rgba(34,211,238,.12)" : "#101625"} stroke={k === cur ? "#22D3EE" : "rgba(148,163,184,.35)"} />
              <text x="160" y={k * 78 + 31} textAnchor="middle" fill="#F8FAFC" fontSize="14" style={svgT}>{n[0]}</text>
              <text x="160" y={k * 78 + 47} textAnchor="middle" fill="#94A3B8" fontSize="10" style={svgM}>{n[1]}</text></g>)}
            <circle cx="36" cy={cur * 78 + 34} r="9" fill="url(#pjg)"><animate attributeName="r" values="8;10;8" dur="1.2s" repeatCount="indefinite" /></circle>
            <text x="292" y={cur * 78 + 38} textAnchor="middle" fill="#22D3EE" fontSize="10" style={svgM}>{i + 1}/{s.steps.length}</text>
          </svg>
        ) : (
          <svg className="packet-svg" viewBox="0 0 720 170" role="img" aria-label="Network path diagram">
            <defs><linearGradient id="pjg" x1="0" x2="1"><stop offset="0" stopColor="#3B82F6" /><stop offset="1" stopColor="#22D3EE" /></linearGradient></defs>
            {s.nodes.slice(1).map((n, k) => <line key={k} x1={s.nodes[k][2]} y1="70" x2={n[2]} y2="70" stroke="#94A3B8" strokeOpacity=".35" strokeWidth="2" />)}
            {s.nodes.map((n, k) => <g key={k}><rect x={n[2] - 52} y="45" width="104" height="50" rx="10" fill={k === cur ? "rgba(34,211,238,.12)" : "#101625"} stroke={k === cur ? "#22D3EE" : "rgba(148,163,184,.35)"} />
              <text x={n[2]} y="68" textAnchor="middle" fill="#F8FAFC" fontSize="13" style={svgT}>{n[0]}</text>
              <text x={n[2]} y="85" textAnchor="middle" fill="#94A3B8" fontSize="9" style={svgM}>{n[1]}</text></g>)}
            <circle cx={s.nodes[cur][2]} cy="30" r="9" fill="url(#pjg)" style={{ transition: "cx .6s" }}><animate attributeName="r" values="8;10;8" dur="1.2s" repeatCount="indefinite" /></circle>
            <text x={s.nodes[cur][2]} y="14" textAnchor="middle" fill="#22D3EE" fontSize="10" style={svgM}>PACKET</text>
            <text x="20" y="140" fill="#94A3B8" fontSize="11" style={svgM}>Step {i + 1} of {s.steps.length}</text>
          </svg>
        )}
      </div>
      <div className="row" style={{ margin: "16px 0" }}>
        <button className="btn btn-ghost btn-sm" type="button" disabled={i === 0} onClick={() => setI(i - 1)}><Icon name="left" />Back</button>
        <button className="btn btn-primary btn-sm" type="button" disabled={i === s.steps.length - 1} onClick={() => setI(i + 1)}>Next hop <Icon name="arrow" /></button>
        <button className="btn btn-ghost btn-sm" type="button" onClick={() => setAuto(a => !a)}><Icon name={auto ? "x" : "play"} />{auto ? "Stop" : "Auto-play"}</button>
        <button className="btn btn-quiet btn-sm" type="button" onClick={() => { setAuto(false); setI(0); }}><Icon name="reset" />Reset</button>
      </div>
      <ol className="step-log">{s.steps.map((st, k) => (
        <li key={k} className={k === i ? "on" : ""} aria-current={k === i ? "step" : undefined} hidden={narrow && k !== i}>
          <span className="mono xs" style={{ color: "var(--cyan)" }}>{String(k + 1).padStart(2, "0")} · {s.nodes[st[0]][0]}</span><br />{st[1]}
        </li>))}
      </ol>
      <SimNote />
    </div>
  );
}

/* ---------- 4. DNS ---------- */
const DNS_ZONES = {
  "lab.example": { ns: "ns1.lab.example", rec: { "lab.example": { A: ["203.0.113.10"], MX: ["10 mail.lab.example"], TXT: ['"v=spf1 mx -all"'] }, "www.lab.example": { A: ["203.0.113.10"], AAAA: ["2001:db8::10"] }, "mail.lab.example": { A: ["203.0.113.25"] }, "blog.lab.example": { CNAME: ["www.lab.example"] }, "api.lab.example": { A: ["203.0.113.40", "203.0.113.41"] } } },
  "shop.test": { ns: "ns.shop.test", rec: { "shop.test": { A: ["198.51.100.80"] }, "www.shop.test": { CNAME: ["shop.test"] } } }
};
const C = ({ children }) => <code>{children}</code>;

export function DnsLab() {
  const { toast } = useApp();
  const [name, setName] = useState("www.lab.example");
  const [type, setType] = useState("A");
  const [steps, setSteps] = useState(null);
  const [ans, setAns] = useState(null);
  const [busy, setBusy] = useState(false);
  const cache = useRef({});
  const alive = useRef(true);
  useEffect(() => () => { alive.current = false; }, []);

  const resolve = async () => {
    const n = name.trim().toLowerCase().replace(/\.$/, "");
    setSteps([]); setAns(null);
    if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(n)) { setAns({ invalid: true }); return; }
    setBusy(true);
    const step = async (node, d = 380) => { if (!alive.current) return; setSteps(s => [...s, node]); await sleep(reducedMotion() ? 0 : d); };
    const done = (a, cached) => { if (!alive.current) return; setAns({ ...a, cached }); setBusy(false); };
    const key = n + "/" + type;
    await step(<><b>Stub resolver</b> on your laptop asks the recursive resolver for <C>{n}</C> {type}.</>);
    const hit = cache.current[key];
    if (hit && hit.exp > Date.now()) { await step(<><b>Cache hit.</b> The resolver answers from cache (TTL {Math.round((hit.exp - Date.now()) / 1000)} s remaining). No external queries needed.</>); return done(hit.ans, true); }
    const tld = n.split(".").pop();
    const zone = Object.keys(DNS_ZONES).find(z => n === z || n.endsWith("." + z));
    await step(<><b>Root server</b>: “I don't know {n}, but the <C>.{tld}</C> TLD servers do.” (referral)</>);
    if (!["example", "test"].includes(tld)) { await step(<><b>.{tld} TLD</b>: this simulator only holds sample zones under .example and .test.</>); return done({ rcode: "NXDOMAIN" }); }
    await step(<><b>.{tld} TLD server</b>: “Ask {zone ? DNS_ZONES[zone].ns : "the zone's name server"}.” (referral)</>);
    if (!zone) { await step(<><b>.{tld} TLD</b>: no delegation exists for this name.</>); return done({ rcode: "NXDOMAIN" }); }
    let cur = n, recs; const chain = [];
    for (let hop = 0; hop < 5; hop++) {
      recs = DNS_ZONES[zone].rec[cur];
      await step(<><b>{DNS_ZONES[zone].ns}</b> (authoritative) looks up <C>{cur}</C>.</>);
      if (!recs || recs[type]) break;
      if (recs.CNAME && type !== "CNAME") { chain.push(`${cur} CNAME ${recs.CNAME[0]}`); await step(<>Found <C>CNAME {recs.CNAME[0]}</C> — the resolver follows the alias.</>); cur = recs.CNAME[0]; continue; }
      break;
    }
    const a = !recs ? { rcode: "NXDOMAIN" } : recs[type] ? { rcode: "NOERROR", chain, records: recs[type].map(v => `${cur}  300  IN  ${type}  ${v}`) } : { rcode: "NOERROR", chain, records: [], note: `The name exists but has no ${type} record (NODATA).` };
    cache.current[key] = { ans: a, exp: Date.now() + 300000 };
    await step(<><b>Recursive resolver</b> caches the answer for 300 s and replies to your laptop.</>, 0);
    done(a);
  };

  return (
    <>
      <div className="lab-pane">
        <form className="stack" onSubmit={e => { e.preventDefault(); if (!busy) resolve(); }}>
          <div className="field"><label htmlFor="dn-n">Domain name</label><input className="input mono-in" id="dn-n" value={name} onChange={e => setName(e.target.value)} autoComplete="off" spellCheck="false" /></div>
          <div className="field"><label htmlFor="dn-t">Record type</label><Select id="dn-t" value={type} onChange={setType} options={["A", "AAAA", "MX", "CNAME", "TXT"]} /></div>
          <div className="row"><button className="btn btn-primary" type="submit" disabled={busy}>Resolve</button><button className="btn btn-ghost" type="button" onClick={() => { cache.current = {}; toast("Resolver cache cleared", "info"); }}>Clear cache</button></div>
          <p className="xs dim">Try: blog.lab.example, api.lab.example, lab.example (MX), www.shop.test, missing.lab.example</p>
        </form>
        <div className="stack">
          <ol className="step-log">{steps === null ? <li>Enter a name and press Resolve to watch a recursive resolver work.</li> : steps.map((s, k) => <li key={k} className={k === steps.length - 1 ? "on" : ""}>{s}</li>)}</ol>
          <div>{ans && (ans.invalid
            ? <div className="alert alert-bad"><Icon name="alert" /><span>Enter a domain name such as www.lab.example (letters, digits, hyphens and dots).</span></div>
            : <div className="terminal"><div className="term-bar"><i /><i /><i />&nbsp; simulated answer {ans.cached ? "(from cache)" : ""}</div>
              <div className="term-out" style={{ height: "auto", minHeight: 0 }}>
                {";; status: "}<span className={ans.rcode === "NOERROR" ? "p" : "e"}>{ans.rcode}</span>{"\n"}
                {(ans.chain || []).join("\n")}{ans.chain && ans.chain.length ? "\n" : ""}
                {(ans.records || []).map((r, k) => <Fragment key={k}>{k ? "\n" : ""}<span className="s">{r}</span></Fragment>)}
                {ans.note ? "\n;; " + ans.note : ""}{ans.rcode === "NXDOMAIN" ? "\n;; The name does not exist in the sample zones." : ""}
              </div></div>)}</div>
        </div>
      </div>
      <SimNote />
    </>
  );
}

