"use strict";
/* ============================================================
   INTERACTIVE LAB — all results are computed locally or
   simulated from sample data. Nothing contacts real systems.
   ============================================================ */
const LAB_LIST = [
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
const SIM_NOTE = `<p class="xs dim" style="margin-top:12px">${icon("info", "icon", 'style="width:13px;height:13px;vertical-align:-2px"')} Simulated with sample data in your browser. No real network, DNS, cloud or scan activity takes place.</p>`;

route("/labs", () => {
  const t = LAB_LIST.find(l => l.id === qparam("t")) ? qparam("t") : "subnet";
  return {
    title: "Practical Labs", desc: "Ten browser-based networking, cloud and security exercises: subnetting, OSI, packet flow, DNS, Linux, cloud architecture, firewall rules, quizzes, vulnerability prioritisation and report writing.",
    html: pageHead("Interactive lab", "Practise in the browser. Safely.", "Ten exercises with real calculations, validation and feedback. Every network, DNS, cloud and scan result is simulated from sample data.", [["Home", "/"], ["Labs", ""]]) + `
<section class="section-tight" style="padding-bottom:clamp(56px,8vw,104px)"><div class="wrap">
 <div class="lab-tabs" role="tablist" aria-label="Lab exercises">${LAB_LIST.map((l, i) => `<button class="lab-tab" role="tab" type="button" id="tab-${l.id}" aria-selected="${l.id === t}" aria-controls="labPane" data-id="${l.id}"><span class="mono xs dim">${String(i + 1).padStart(2, "0")}</span>${l.title}</button>`).join("")}</div>
 <div class="field lab-select"><label for="labSel">Exercise</label><select class="input" id="labSel">${LAB_LIST.map((l, i) => `<option value="${l.id}" ${l.id === t ? "selected" : ""}>${String(i + 1).padStart(2, "0")} · ${l.title}</option>`).join("")}</select></div>
 <div class="card" style="margin-top:16px;padding:clamp(18px,3vw,32px)" role="tabpanel" id="labPane" aria-labelledby="tab-${t}"></div>
</div></section>`,
    init: () => {
      const open = id => {
        $$(".lab-tab").forEach(b => b.setAttribute("aria-selected", b.dataset.id === id)); $("#labSel").value = id;
        const l = LAB_LIST.find(x => x.id === id), pane = $("#labPane");
        pane.setAttribute("aria-labelledby", "tab-" + id);
        pane.innerHTML = `<div class="row between" style="margin-bottom:20px"><div class="row"><span class="icon-box">${icon(l.icon)}</span><div><h2 style="font-size:var(--t-xl)">${l.title}</h2><p class="small muted">${l.desc}</p></div></div></div><div id="labBody"></div>`;
        LAB_MOUNT[id]($("#labBody"));
        try { history.replaceState(null, "", "#/labs?t=" + id); curPath = "/labs?t=" + id; } catch { curPath = "/labs?t=" + id; }
      };
      $$(".lab-tab").forEach(b => b.onclick = () => open(b.dataset.id)); $("#labSel").onchange = e => open(e.target.value);
      $(".lab-tabs").addEventListener("keydown", e => { if (!["ArrowRight", "ArrowLeft"].includes(e.key)) return; const bs = $$(".lab-tab"), i = bs.indexOf(document.activeElement); if (i < 0) return; const n = bs[(i + (e.key === "ArrowRight" ? 1 : -1) + bs.length) % bs.length]; n.focus(); n.click(); });
      open(t);
      $("#tab-" + t).scrollIntoView({ block: "nearest", inline: "center" });
    }
  };
});

/* ---------- 1. Subnetting ---------- */
const ip2n = s => { const p = s.trim().split("."); if (p.length !== 4 || p.some(x => !/^\d{1,3}$/.test(x) || +x > 255)) return null; return p.reduce((a, x) => a * 256 + +x, 0); };
const n2ip = n => [24, 16, 8, 0].map(s => Math.floor(n / 2 ** s) % 256).join(".");
const toBin = n => [24, 16, 8, 0].map(s => (Math.floor(n / 2 ** s) % 256).toString(2).padStart(8, "0")).join(".");
function subnet(ipStr, prefix) {
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
function mountSubnet(el, compact = false) {
  el.innerHTML = `<div class="lab-pane">
   <form class="stack" id="snf" onsubmit="return false">
    <div class="field"><label for="sn-ip">IPv4 address</label><input class="input mono-in" id="sn-ip" value="192.168.10.77" inputmode="decimal" autocomplete="off" spellcheck="false"></div>
    <div class="field"><label for="sn-p">Prefix length (CIDR) <span class="dim" id="sn-pv">/26</span></label><input id="sn-p" type="range" min="0" max="32" value="26" style="width:100%;accent-color:#22D3EE"><select class="input mono-in" id="sn-ps" aria-label="Prefix as subnet mask">${Array.from({ length: 33 }, (_, p) => `<option value="${p}" ${p === 26 ? "selected" : ""}>/${p} — ${n2ip(2 ** 32 - 2 ** (32 - p))}</option>`).join("")}</select></div>
    <span class="err" id="sn-err" aria-live="polite"></span>
    <button class="btn btn-ghost btn-sm" type="button" id="sn-reset" style="align-self:flex-start">${icon("reset")}Reset example</button>
   </form>
   <div class="stack"><div class="result-grid" id="sn-out" aria-live="polite"></div><div class="bits" id="sn-bits"></div></div></div>
   ${compact ? "" : `<hr class="rule" style="margin:28px 0"><div class="stack"><h3 style="font-size:var(--t-md)">Practice mode</h3><p class="small muted">Work it out by hand, then check. Questions are generated randomly.</p><div id="sn-prac"></div></div>`}`;
  const ipI = $("#sn-ip", el), pR = $("#sn-p", el), pS = $("#sn-ps", el);
  const calc = () => {
    const r = subnet(ipI.value, pR.value); $("#sn-pv", el).textContent = "/" + pR.value;
    if (r.error) { $("#sn-err", el).textContent = r.error; ipI.setAttribute("aria-invalid", "true"); return; }
    $("#sn-err", el).textContent = ""; ipI.setAttribute("aria-invalid", "false");
    const rows = [["Network address", n2ip(r.net) + "/" + r.prefix], ["Broadcast address", r.prefix >= 31 ? "n/a (" + (r.prefix === 31 ? "point-to-point" : "single host") + ")" : n2ip(r.bc)], ["Subnet mask", n2ip(r.mask)], ["Wildcard mask", n2ip(r.wildcard)], ["First usable host", n2ip(r.first)], ["Last usable host", n2ip(r.last)], ["Usable hosts", r.usable.toLocaleString("en-IN")], ["Total addresses", r.size.toLocaleString("en-IN")], ["Address type", r.type], ["Block size", r.size >= 256 ? "spans octets" : r.size + " in last octet"]];
    $("#sn-out", el).innerHTML = rows.map(([k, v]) => `<div><span>${k}</span><b>${esc(v)}</b></div>`).join("");
    const b = toBin(r.ip).replace(/\./g, "");     let out = "", i = 0; for (const ch of b) { if (i && i % 8 === 0) out += "."; out += `<span class="${i < r.prefix ? "n" : "h"}">${ch}</span>`; i++; }
    $("#sn-bits", el).innerHTML = `<div class="dim xs">BINARY · <span class="n">network bits (${r.prefix})</span> · <span class="h">host bits (${32 - r.prefix})</span></div>${out}`;
  };
  ipI.oninput = calc; pR.oninput = () => { pS.value = pR.value; calc(); }; pS.onchange = () => { pR.value = pS.value; calc(); };
  $("#sn-reset", el).onclick = () => { ipI.value = "192.168.10.77"; pR.value = pS.value = 26; calc(); };
  calc();
  if (!compact) {
    const pr = $("#sn-prac", el);
    const newQ = () => {
      const p = 20 + Math.floor(Math.random() * 10), ip = n2ip([10, 172, 192][Math.floor(Math.random() * 3)] * 2 ** 24 + Math.floor(Math.random() * 2 ** 24));
      const r = subnet(ip, p), ask = ["network", "broadcast", "usable"][Math.floor(Math.random() * 3)];
      const ans = ask === "network" ? n2ip(r.net) : ask === "broadcast" ? n2ip(r.bc) : String(r.usable);
      pr.innerHTML = `<div class="row" style="align-items:end"><div class="field" style="flex:1;min-width:220px"><label for="pq">What is the <strong>${ask === "usable" ? "number of usable hosts" : ask + " address"}</strong> for <code>${ip}/${p}</code>?</label><input class="input mono-in" id="pq" autocomplete="off"></div><button class="btn btn-primary" type="button" id="pcheck">Check</button><button class="btn btn-ghost" type="button" id="pnew">New question</button></div><div id="pfb" aria-live="polite" style="margin-top:12px"></div>`;
      $("#pcheck", pr).onclick = () => { const v = $("#pq", pr).value.trim().replace(/,/g, ""); const ok = v === ans; $("#pfb", pr).innerHTML = `<div class="alert ${ok ? "alert-ok" : "alert-bad"}">${icon(ok ? "check" : "alert")}<span>${ok ? "Correct." : `Not quite. The answer is <code>${ans}</code>.`} Block size is 2^${32 - p} = ${r.size.toLocaleString("en-IN")} addresses; network ${n2ip(r.net)}, broadcast ${n2ip(r.bc)}.</span></div>`; };
      $("#pq", pr).onkeydown = e => { if (e.key === "Enter") $("#pcheck", pr).click(); };
      $("#pnew", pr).onclick = newQ;
    };
    newQ();
  }
}

/* ---------- 2. OSI ---------- */
const OSI = [
  { n: 7, name: "Application", pdu: "Data", dev: "Hosts, proxies, application firewalls", proto: "HTTP, HTTPS, DNS, SMTP, SSH, DHCP", ex: "Your browser sends GET /index.html to a web server.", fix: "Wrong URL, server returns 500, DNS name not found." },
  { n: 6, name: "Presentation", pdu: "Data", dev: "Hosts", proto: "TLS encryption, UTF-8, JPEG, compression", ex: "TLS encrypts the HTTP request before it leaves your laptop.", fix: "Certificate errors, character-encoding problems." },
  { n: 5, name: "Session", pdu: "Data", dev: "Hosts", proto: "Session setup and teardown (e.g. RPC, TLS sessions)", ex: "A video call keeps one logical session open while you talk.", fix: "Sessions timing out, repeated re-authentication." },
  { n: 4, name: "Transport", pdu: "Segment / Datagram", dev: "Hosts, stateful firewalls, load balancers", proto: "TCP, UDP — ports 443, 53, 22…", ex: "TCP opens a connection to port 443 with a three-way handshake.", fix: "Port blocked by firewall, service not listening." },
  { n: 3, name: "Network", pdu: "Packet", dev: "Routers, Layer 3 switches", proto: "IPv4, IPv6, ICMP", ex: "Your router forwards the packet toward 203.0.113.10.", fix: "Wrong gateway, missing route, bad subnet mask." },
  { n: 2, name: "Data Link", pdu: "Frame", dev: "Switches, access points, NICs", proto: "Ethernet, Wi-Fi (802.11), ARP, VLAN tags", ex: "The switch looks up the destination MAC and forwards the frame out one port.", fix: "Wrong VLAN, duplex mismatch, MAC flapping." },
  { n: 1, name: "Physical", pdu: "Bits", dev: "Cables, transceivers, hubs, radios", proto: "Copper, fibre, radio signals", ex: "Your Wi-Fi card converts the frame into radio waves.", fix: "Unplugged cable, weak Wi-Fi signal, damaged fibre." }
];
const LAB_OSI_Q = [["Switch forwarding by MAC address", 2], ["Router choosing a path by IP address", 3], ["HTTP GET request", 7], ["TCP port 443", 4], ["Fibre-optic cable", 1], ["TLS encryption", 6], ["ARP request", 2], ["ICMP echo (ping)", 3], ["DNS query", 7], ["UDP datagram", 4]];
function mountOSI(el) {
  el.innerHTML = `<div class="lab-pane"><div class="osi" id="osiL">${OSI.map(l => `<button type="button" aria-pressed="false" data-n="${l.n}"><b>L${l.n}</b><span>${l.name}</span><span class="xs dim">${l.pdu}</span></button>`).join("")}</div><div class="stack" id="osiD"></div></div><hr class="rule" style="margin:28px 0"><div class="stack"><h3 style="font-size:var(--t-md)">Which layer?</h3><div id="osiQ"></div></div>`;
  const show = n => { const l = OSI.find(x => x.n === n); $$("#osiL button", el).forEach(b => b.setAttribute("aria-pressed", +b.dataset.n === n)); $("#osiD", el).innerHTML = `<div><span class="eyebrow">Layer ${l.n}</span><h3 style="margin-top:8px">${l.name}</h3></div><div class="result-grid"><div><span>PDU</span><b>${l.pdu}</b></div><div><span>Devices</span><b style="font-family:var(--f-body);font-size:var(--t-sm)">${l.dev}</b></div></div><div class="callout"><h4>Protocols & standards</h4><p class="small">${l.proto}</p></div><div class="callout ok"><h4>Real-world example</h4><p class="small">${l.ex}</p></div><div class="callout warn"><h4>Typical problems at this layer</h4><p class="small">${l.fix}</p></div>`; };
  $$("#osiL button", el).forEach(b => b.onclick = () => show(+b.dataset.n)); show(4);
  let qi = 0, sc = 0; const order = [...LAB_OSI_Q].sort(() => Math.random() - .5);
  const q = () => {
    const box = $("#osiQ", el);
    if (qi >= order.length) { box.innerHTML = `<div class="alert alert-ok">${icon("award")}<span>You scored ${sc} / ${order.length}.</span></div><button class="btn btn-ghost btn-sm" type="button" id="oq-r" style="margin-top:12px">${icon("reset")}Restart</button>`; $("#oq-r", box).onclick = () => { qi = 0; sc = 0; order.sort(() => Math.random() - .5); q(); }; return; }
    const [t, a] = order[qi];
    box.innerHTML = `<p class="small">${qi + 1}/${order.length} · At which layer does this belong: <strong>${t}</strong>?</p><div class="row" style="margin-top:10px">${[1, 2, 3, 4, 5, 6, 7].map(n => `<button class="btn btn-ghost btn-sm" type="button" data-a="${n}">L${n}</button>`).join("")}</div><div id="oqf" aria-live="polite" style="margin-top:10px"></div>`;
    $$("[data-a]", box).forEach(b => b.onclick = () => { const ok = +b.dataset.a === a; if (ok) sc++; $$("[data-a]", box).forEach(x => x.disabled = true); $("#oqf", box).innerHTML = `<div class="alert ${ok ? "alert-ok" : "alert-bad"}">${icon(ok ? "check" : "alert")}<span>${ok ? "Correct" : "Answer: Layer " + a} — ${OSI.find(x => x.n === a).name}.</span></div><button class="btn btn-primary btn-sm" type="button" id="oqn" style="margin-top:10px">Next</button>`; $("#oqn", box).onclick = () => { qi++; q(); }; });
  };
  q();
}

/* ---------- 3. Packet journey ---------- */
const PJ = {
  web: { label: "Load a web page", nodes: [["Laptop", "192.168.1.20", 60], ["Switch", "L2", 210], ["Home router", "192.168.1.1 / 198.51.100.7", 360], ["ISP router", "198.51.100.1", 510], ["Web server", "203.0.113.10", 660]],
    steps: [[0, "Your browser builds an HTTPS request. TCP adds source port 51544 → destination port 443. IP adds 192.168.1.20 → 203.0.113.10."], [0, "The destination is not on the local subnet, so the laptop sends the frame to its default gateway. ARP finds the router's MAC address."], [1, "The switch reads the destination MAC, finds it in its MAC table, and forwards the frame out of the router's port. IP addresses are untouched."], [2, "The router strips the Ethernet header, checks its routing table (default route → ISP) and performs NAT: source becomes 198.51.100.7."], [3, "The ISP router decrements TTL and forwards the packet using longest-prefix match toward 203.0.113.0/24. A new Layer 2 header is added for each link."], [4, "The web server receives the segment on port 443, TLS decrypts it, and the HTTP request is handed to the web application. The reply follows the path in reverse."]] },
  ping: { label: "Ping the gateway", nodes: [["Laptop", "192.168.1.20", 110], ["Switch", "L2", 360], ["Home router", "192.168.1.1", 610]],
    steps: [[0, "ping 192.168.1.1 creates an ICMP Echo Request. The gateway is on the same subnet, so no routing is needed."], [0, "The laptop checks its ARP cache. If the router's MAC is missing, it broadcasts an ARP request: 'Who has 192.168.1.1?'"], [1, "The switch floods the ARP broadcast to all ports in the VLAN. The router replies with its MAC address."], [2, "The router receives the ICMP Echo Request and sends an Echo Reply. Round-trip time is reported by ping."]] }
};
function mountPacket(el) {
  let sc = "web", i = 0, timer = null;
  el.innerHTML = `<div class="row" style="margin-bottom:16px"><div class="tab-row" id="pjS">${Object.entries(PJ).map(([k, v]) => `<button type="button" data-k="${k}" aria-pressed="${k === "web"}">${v.label}</button>`).join("")}</div></div><div style="overflow-x:auto" id="pjWrap"><svg class="packet-svg" id="pjSvg" viewBox="0 0 720 170" role="img" aria-label="Network path diagram"></svg></div><div class="row" style="margin:16px 0"><button class="btn btn-ghost btn-sm" type="button" id="pjP">${icon("left")}Back</button><button class="btn btn-primary btn-sm" type="button" id="pjN">Next hop ${icon("arrow")}</button><button class="btn btn-ghost btn-sm" type="button" id="pjA">${icon("play")}Auto-play</button><button class="btn btn-quiet btn-sm" type="button" id="pjR">${icon("reset")}Reset</button></div><ol class="step-log" id="pjL"></ol>${SIM_NOTE}`;
  const draw = () => {
    const s = PJ[sc], node = s.nodes[s.steps[i][0]];
    if (el.clientWidth < 560) {
      const cur = s.steps[i][0], H = s.nodes.length * 78 + 10, svg = $("#pjSvg", el);
      svg.setAttribute("viewBox", `0 0 320 ${H}`);
      svg.innerHTML = `<defs><linearGradient id="pjg" x1="0" x2="1"><stop offset="0" stop-color="#3B82F6"/><stop offset="1" stop-color="#22D3EE"/></linearGradient></defs>` +
        s.nodes.slice(1).map((n, k) => `<line x1="160" y1="${k * 78 + 56}" x2="160" y2="${(k + 1) * 78 + 12}" stroke="#94A3B8" stroke-opacity=".35" stroke-width="2"/>`).join("") +
        s.nodes.map((n, k) => `<g><rect x="60" y="${k * 78 + 12}" width="200" height="44" rx="10" fill="${k === cur ? "rgba(34,211,238,.12)" : "#101625"}" stroke="${k === cur ? "#22D3EE" : "rgba(148,163,184,.35)"}"/><text x="160" y="${k * 78 + 31}" text-anchor="middle" fill="#F8FAFC" font-family="Space Grotesk,sans-serif" font-size="14" font-weight="600">${n[0]}</text><text x="160" y="${k * 78 + 47}" text-anchor="middle" fill="#94A3B8" font-family="JetBrains Mono,monospace" font-size="10">${n[1]}</text></g>`).join("") +
        `<circle cx="36" cy="${cur * 78 + 34}" r="9" fill="url(#pjg)"><animate attributeName="r" values="8;10;8" dur="1.2s" repeatCount="indefinite"/></circle><text x="292" y="${cur * 78 + 38}" text-anchor="middle" fill="#22D3EE" font-family="JetBrains Mono,monospace" font-size="10">${i + 1}/${s.steps.length}</text>`;
      $("#pjL", el).innerHTML = s.steps.map((st, k) => `<li class="${k === i ? "on" : ""}" ${k === i ? 'aria-current="step"' : ""} ${Math.abs(k - i) > 0 ? 'hidden' : ""}><span class="mono xs" style="color:var(--cyan)">${String(k + 1).padStart(2, "0")} · ${s.nodes[st[0]][0]}</span><br>${st[1]}</li>`).join("");
      $("#pjP", el).disabled = i === 0; $("#pjN", el).disabled = i === s.steps.length - 1;
      return;
    }
    $("#pjSvg", el).setAttribute("viewBox", "0 0 720 170");
    $("#pjSvg", el).innerHTML = `<defs><linearGradient id="pjg" x1="0" x2="1"><stop offset="0" stop-color="#3B82F6"/><stop offset="1" stop-color="#22D3EE"/></linearGradient></defs>` +
      s.nodes.slice(1).map((n, k) => `<line x1="${s.nodes[k][2]}" y1="70" x2="${n[2]}" y2="70" stroke="#94A3B8" stroke-opacity=".35" stroke-width="2"/>`).join("") +
      s.nodes.map((n, k) => `<g><rect x="${n[2] - 52}" y="45" width="104" height="50" rx="10" fill="${k === s.steps[i][0] ? "rgba(34,211,238,.12)" : "#101625"}" stroke="${k === s.steps[i][0] ? "#22D3EE" : "rgba(148,163,184,.35)"}"/><text x="${n[2]}" y="68" text-anchor="middle" fill="#F8FAFC" font-family="Space Grotesk,sans-serif" font-size="13" font-weight="600">${n[0]}</text><text x="${n[2]}" y="85" text-anchor="middle" fill="#94A3B8" font-family="JetBrains Mono,monospace" font-size="9">${n[1]}</text></g>`).join("") +
      `<circle cx="${node[2]}" cy="30" r="9" fill="url(#pjg)" style="transition:cx .6s"><animate attributeName="r" values="8;10;8" dur="1.2s" repeatCount="indefinite"/></circle><text x="${node[2]}" y="14" text-anchor="middle" fill="#22D3EE" font-family="JetBrains Mono,monospace" font-size="10">PACKET</text><text x="20" y="140" fill="#94A3B8" font-family="JetBrains Mono,monospace" font-size="11">Step ${i + 1} of ${s.steps.length}</text>`;
    $("#pjL", el).innerHTML = s.steps.map((st, k) => `<li class="${k === i ? "on" : ""}" ${k === i ? 'aria-current="step"' : ""}><span class="mono xs" style="color:var(--cyan)">${String(k + 1).padStart(2, "0")} · ${s.nodes[st[0]][0]}</span><br>${st[1]}</li>`).join("");
    $("#pjP", el).disabled = i === 0; $("#pjN", el).disabled = i === s.steps.length - 1;
  };
  const stop = () => { clearInterval(timer); timer = null; $("#pjA", el).innerHTML = icon("play") + "Auto-play"; };
  $("#pjN", el).onclick = () => { i++; draw(); }; $("#pjP", el).onclick = () => { i--; draw(); };
  $("#pjR", el).onclick = () => { stop(); i = 0; draw(); };
  $("#pjA", el).onclick = () => { if (timer) return stop(); $("#pjA", el).innerHTML = icon("x") + "Stop"; timer = setInterval(() => { if (!el.isConnected) return stop(); if (i >= PJ[sc].steps.length - 1) return stop(); i++; draw(); }, 2200); };
  $$("#pjS button", el).forEach(b => b.onclick = () => { stop(); sc = b.dataset.k; i = 0; $$("#pjS button", el).forEach(x => x.setAttribute("aria-pressed", x === b)); draw(); });
  draw();
}

/* ---------- 4. DNS ---------- */
const DNS_ZONES = {
  "lab.example": { ns: "ns1.lab.example", rec: { "lab.example": { A: ["203.0.113.10"], MX: ["10 mail.lab.example"], TXT: ['"v=spf1 mx -all"'] }, "www.lab.example": { A: ["203.0.113.10"], AAAA: ["2001:db8::10"] }, "mail.lab.example": { A: ["203.0.113.25"] }, "blog.lab.example": { CNAME: ["www.lab.example"] }, "api.lab.example": { A: ["203.0.113.40", "203.0.113.41"] } } },
  "shop.test": { ns: "ns.shop.test", rec: { "shop.test": { A: ["198.51.100.80"] }, "www.shop.test": { CNAME: ["shop.test"] } } }
};
function mountDNS(el) {
  const cache = {};
  el.innerHTML = `<div class="lab-pane"><form class="stack" id="dnf" onsubmit="return false"><div class="field"><label for="dn-n">Domain name</label><input class="input mono-in" id="dn-n" value="www.lab.example" autocomplete="off" spellcheck="false"></div><div class="field"><label for="dn-t">Record type</label><select class="input" id="dn-t">${["A", "AAAA", "MX", "CNAME", "TXT"].map(t => `<option>${t}</option>`).join("")}</select></div><div class="row"><button class="btn btn-primary" type="submit" id="dn-go">Resolve</button><button class="btn btn-ghost" type="button" id="dn-c">Clear cache</button></div><p class="xs dim">Try: blog.lab.example, api.lab.example, lab.example (MX), www.shop.test, missing.lab.example</p></form><div class="stack"><ol class="step-log" id="dn-l"><li>Enter a name and press Resolve to watch a recursive resolver work.</li></ol><div id="dn-a"></div></div></div>${SIM_NOTE}`;
  const resolve = async () => {
    let name = $("#dn-n", el).value.trim().toLowerCase().replace(/\.$/, ""); const type = $("#dn-t", el).value;
    const L = $("#dn-l", el), A = $("#dn-a", el); L.innerHTML = ""; A.innerHTML = "";
    if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(name)) { A.innerHTML = `<div class="alert alert-bad">${icon("alert")}<span>Enter a domain name such as www.lab.example (letters, digits, hyphens and dots).</span></div>`; return; }
    const step = async (t, d = 380) => { const li = document.createElement("li"); li.className = "on"; li.innerHTML = t; $$("li", L).forEach(x => x.className = ""); L.appendChild(li); await sleep(matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : d); };
    $("#dn-go", el).disabled = true;
    const key = name + "/" + type;
    await step(`<b>Stub resolver</b> on your laptop asks the recursive resolver for <code>${name}</code> ${type}.`);
    if (cache[key] && cache[key].exp > Date.now()) { await step(`<b>Cache hit.</b> The resolver answers from cache (TTL ${Math.round((cache[key].exp - Date.now()) / 1000)} s remaining). No external queries needed.`); show(cache[key].ans, true); $("#dn-go", el).disabled = false; return; }
    const tld = name.split(".").pop();
    const zone = Object.keys(DNS_ZONES).find(z => name === z || name.endsWith("." + z));
    await step(`<b>Root server</b>: “I don't know ${name}, but the <code>.${tld}</code> TLD servers do.” (referral)`);
    if (!["example", "test"].includes(tld)) { await step(`<b>.${tld} TLD</b>: this simulator only holds sample zones under .example and .test.`); show({ rcode: "NXDOMAIN" }); $("#dn-go", el).disabled = false; return; }
    await step(`<b>.${tld} TLD server</b>: “Ask ${zone ? DNS_ZONES[zone].ns : "the zone's name server"}.” (referral)`);
    if (!zone) { await step(`<b>.${tld} TLD</b>: no delegation exists for this name.`); show({ rcode: "NXDOMAIN" }); $("#dn-go", el).disabled = false; return; }
    let cur = name, chain = [], recs;
    for (let hop = 0; hop < 5; hop++) {
      recs = DNS_ZONES[zone].rec[cur];
      await step(`<b>${DNS_ZONES[zone].ns}</b> (authoritative) looks up <code>${cur}</code>.`);
      if (!recs) break;
      if (recs[type]) break;
      if (recs.CNAME && type !== "CNAME") { chain.push(`${cur} CNAME ${recs.CNAME[0]}`); await step(`Found <code>CNAME ${recs.CNAME[0]}</code> — the resolver follows the alias.`); cur = recs.CNAME[0]; continue; }
      break;
    }
    const ans = !recs ? { rcode: "NXDOMAIN" } : recs[type] ? { rcode: "NOERROR", chain, records: recs[type].map(v => `${cur}  300  IN  ${type}  ${v}`) } : { rcode: "NOERROR", chain, records: [], note: `The name exists but has no ${type} record (NODATA).` };
    cache[key] = { ans, exp: Date.now() + 300000 };
    await step(`<b>Recursive resolver</b> caches the answer for 300 s and replies to your laptop.`, 0);
    show(ans); $("#dn-go", el).disabled = false;
  };
  const show = (a, cached) => { $("#dn-a", el).innerHTML = `<div class="terminal"><div class="term-bar"><i></i><i></i><i></i>&nbsp; simulated answer ${cached ? "(from cache)" : ""}</div><div class="term-out" style="height:auto;min-height:0">;; status: <span class="${a.rcode === "NOERROR" ? "p" : "e"}">${a.rcode}</span>\n${(a.chain || []).map(c => esc(c)).join("\n")}${a.chain && a.chain.length ? "\n" : ""}${(a.records || []).map(r => `<span class="s">${esc(r)}</span>`).join("\n")}${a.note ? "\n;; " + esc(a.note) : ""}${a.rcode === "NXDOMAIN" ? "\n;; The name does not exist in the sample zones." : ""}</div></div>`; };
  $("#dnf", el).onsubmit = e => { e.preventDefault(); resolve(); };
  $("#dn-c", el).onclick = () => { Object.keys(cache).forEach(k => delete cache[k]); toast("Resolver cache cleared", "info"); };
}

/* ---------- 5. Linux terminal ---------- */
function mountLinux(el) {
  const FS = {
    "/": { d: 1, c: ["home", "var", "etc"] }, "/home": { d: 1, c: ["student"] }, "/home/student": { d: 1, c: ["notes.txt", "secret.txt", ".bashrc", "scripts"] },
    "/home/student/notes.txt": { f: "Lab reminder: only test machines on the 10.10.0.0/24 lab network.\nTake a snapshot before every exercise.", m: "644" },
    "/home/student/secret.txt": { f: "synthetic-api-key-for-practice-only", m: "644" }, "/home/student/.bashrc": { f: "# shell settings\nalias ll='ls -la'", m: "644" },
    "/home/student/scripts": { d: 1, c: ["backup.sh"] }, "/home/student/scripts/backup.sh": { f: "#!/bin/bash\ntar -czf /tmp/notes.tgz ~/notes.txt", m: "755" },
    "/var": { d: 1, c: ["log"] }, "/var/log": { d: 1, c: ["auth.log", "syslog"] },
    "/var/log/auth.log": { f: "Oct 19 09:01:12 lab sshd[811]: Accepted publickey for student from 10.10.0.5\nOct 19 09:14:40 lab sshd[902]: Failed password for invalid user admin from 10.10.0.99\nOct 19 09:14:44 lab sshd[902]: Failed password for invalid user admin from 10.10.0.99\nOct 19 09:20:03 lab sudo: student : COMMAND=/usr/bin/apt update", m: "640" },
    "/var/log/syslog": { f: "Oct 19 09:00:01 lab systemd[1]: Started Daily apt download activities.", m: "640" },
    "/etc": { d: 1, c: ["hostname"] }, "/etc/hostname": { f: "mnd-lab", m: "644" }
  };
  let cwd = "/home/student"; const hist = []; let hi = 0;
  const TASKS = [["Print your current directory", c => /^pwd$/.test(c)], ["List all files in your home, including hidden ones", c => /^ls\s+(-la|-al|-a|-l?a\w*)/.test(c)], ["Read notes.txt", c => /^cat\s+(\.\/|~\/|\/home\/student\/)?notes\.txt$/.test(c) && cwd === "/home/student" || /^cat\s+\/home\/student\/notes\.txt$/.test(c)], ["Find failed logins in /var/log/auth.log", c => /^grep\s+(-i\s+)?["']?failed["']?\s+\/var\/log\/auth\.log$/i.test(c)], ["Make secret.txt readable only by you (owner read/write)", () => FS["/home/student/secret.txt"].m === "600"], ["Create a directory called reports in your home", () => !!FS["/home/student/reports"]]];
  const done = new Set();
  el.innerHTML = `<div class="lab-pane"><div class="stack"><h3 style="font-size:var(--t-md)">Tasks</h3><ol class="step-log" id="lx-t"></ol><p class="xs dim">Type <code>help</code> for available commands. Use ↑ / ↓ for history.</p><button class="btn btn-ghost btn-sm" type="button" id="lx-r" style="align-self:flex-start">${icon("reset")}Reset terminal</button></div>
   <div class="terminal"><div class="term-bar"><i></i><i></i><i></i>&nbsp; student@mnd-lab — simulated shell</div><div class="term-out" id="lx-o" aria-live="polite"></div><form class="term-in" id="lx-f"><span id="lx-p"></span><label for="lx-i" class="sr-only">Command</label><input id="lx-i" autocomplete="off" spellcheck="false" autocapitalize="off"></form></div></div>${SIM_NOTE}`;
  const out = $("#lx-o", el), inp = $("#lx-i", el);
  const prompt = () => `student@mnd-lab:${cwd.replace("/home/student", "~")}$`;
  const resolveP = p => { if (!p || p === "~") return "/home/student"; if (p.startsWith("~/")) p = "/home/student/" + p.slice(2); let parts = (p.startsWith("/") ? p : cwd + "/" + p).split("/"); const st = []; for (const x of parts) { if (!x || x === ".") continue; if (x === "..") st.pop(); else st.push(x); } return "/" + st.join("/"); };
  const permStr = (m, d) => (d ? "d" : "-") + m.split("").map(n => { n = +n; return (n & 4 ? "r" : "-") + (n & 2 ? "w" : "-") + (n & 1 ? "x" : "-"); }).join("");
  const write = (h, cls = "") => { out.insertAdjacentHTML("beforeend", `<div class="${cls}">${h}</div>`); out.scrollTop = out.scrollHeight; };
  const drawTasks = () => { $("#lx-t", el).innerHTML = TASKS.map(([t], i) => `<li class="${done.has(i) ? "on" : ""}">${done.has(i) ? icon("check", "icon", 'style="color:var(--ok);width:15px;height:15px;vertical-align:-3px"') : `<span class="mono xs dim">${i + 1}.</span>`} ${t}</li>`).join(""); };
  const CMDS = {
    help: () => "Available: pwd, ls [-a] [-l] [path], cd [path], cat file, grep [-i] pattern file, chmod mode file, mkdir dir, touch file, whoami, id, hostname, uname -a, ip a, ss -tulpn, ps, echo text, history, clear",
    pwd: () => cwd, whoami: () => "student", id: () => "uid=1000(student) gid=1000(student) groups=1000(student),27(sudo)", hostname: () => FS["/etc/hostname"].f, "uname": a => a[0] === "-a" ? "Linux mnd-lab 6.8.0-lab #1 SMP x86_64 GNU/Linux (simulated)" : "Linux",
    ls: a => { const fl = a.filter(x => x.startsWith("-")).join(""), p = resolveP(a.find(x => !x.startsWith("-"))), n = FS[p]; if (!n) return `<span class="e">ls: cannot access '${esc(a.find(x => !x.startsWith("-")))}': No such file or directory</span>`; if (!n.d) return esc(p.split("/").pop()); let items = n.c.filter(x => fl.includes("a") || !x.startsWith(".")); if (fl.includes("a")) items = [".", "..", ...items]; if (fl.includes("l")) return items.map(x => { const q = FS[x === "." ? p : x === ".." ? resolveP(p + "/..") : p.replace(/\/$/, "") + "/" + x] || { d: 1 }; return `${permStr(q.m || "755", q.d)} 1 student student ${String(q.f ? q.f.length : 4096).padStart(5)} Oct 19 09:30 <span class="${q.d ? "s" : ""}">${esc(x)}</span>`; }).join("\n"); return items.map(x => { const q = FS[p.replace(/\/$/, "") + "/" + x]; return q && q.d ? `<span class="s">${esc(x)}</span>` : esc(x); }).join("  "); },
    cd: a => { const p = resolveP(a[0]); if (!FS[p]) return `<span class="e">cd: ${esc(a[0])}: No such file or directory</span>`; if (!FS[p].d) return `<span class="e">cd: ${esc(a[0])}: Not a directory</span>`; cwd = p; return ""; },
    cat: a => { if (!a[0]) return '<span class="e">cat: missing file operand</span>'; const p = resolveP(a[0]), n = FS[p]; if (!n) return `<span class="e">cat: ${esc(a[0])}: No such file or directory</span>`; if (n.d) return `<span class="e">cat: ${esc(a[0])}: Is a directory</span>`; return esc(n.f); },
    grep: a => { const ci = a[0] === "-i"; if (ci) a = a.slice(1); if (a.length < 2) return '<span class="e">usage: grep [-i] pattern file</span>'; const pat = a[0].replace(/^["']|["']$/g, ""), p = resolveP(a[1]), n = FS[p]; if (!n || n.d) return `<span class="e">grep: ${esc(a[1])}: No such file</span>`; const lines = n.f.split("\n").filter(l => (ci ? l.toLowerCase().includes(pat.toLowerCase()) : l.includes(pat))); return lines.length ? lines.map(l => esc(l).replace(new RegExp(pat.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), ci ? "gi" : "g"), m => `<span class="e">${m}</span>`)).join("\n") : ""; },
    chmod: a => { if (a.length < 2 || !/^[0-7]{3}$/.test(a[0])) return '<span class="e">chmod: use a three-digit numeric mode, e.g. chmod 600 file (this simulator supports numeric modes)</span>'; const p = resolveP(a[1]); if (!FS[p]) return `<span class="e">chmod: cannot access '${esc(a[1])}': No such file or directory</span>`; FS[p].m = a[0]; return ""; },
    mkdir: a => { if (!a[0]) return '<span class="e">mkdir: missing operand</span>'; const p = resolveP(a[0]), par = resolveP(p + "/.."); if (FS[p]) return `<span class="e">mkdir: cannot create directory '${esc(a[0])}': File exists</span>`; if (!FS[par] || !FS[par].d) return '<span class="e">mkdir: parent directory does not exist</span>'; FS[p] = { d: 1, c: [], m: "755" }; FS[par].c.push(p.split("/").pop()); return ""; },
    touch: a => { if (!a[0]) return '<span class="e">touch: missing file operand</span>'; const p = resolveP(a[0]), par = resolveP(p + "/.."); if (!FS[p]) { if (!FS[par]) return '<span class="e">touch: no such directory</span>'; FS[p] = { f: "", m: "644" }; FS[par].c.push(p.split("/").pop()); } return ""; },
    echo: a => esc(a.join(" ").replace(/^["']|["']$/g, "")), history: () => hist.map((h, i) => `${String(i + 1).padStart(4)}  ${esc(h)}`).join("\n"),
    "ip": a => a[0] === "a" || a[0] === "addr" ? "1: lo: inet 127.0.0.1/8\n2: eth0: inet 10.10.0.20/24 brd 10.10.0.255 (simulated lab address)" : "usage: ip a",
    ss: () => "Netid State  Local Address:Port\ntcp   LISTEN 0.0.0.0:22\ntcp   LISTEN 127.0.0.1:5432", ps: () => "  PID TTY      CMD\n  811 ?        sshd\n 1204 pts/0    bash\n 1290 pts/0    ps",
    clear: () => { out.innerHTML = ""; return null; }, sudo: () => '<span class="e">sudo is disabled in this simulator. Practise privilege use on your own lab VM.</span>'
  };
  const run = raw => {
    const c = raw.trim(); write(`<span class="p">${esc(prompt())}</span> ${esc(c)}`);
    if (!c) return; hist.push(c); hi = hist.length;
    const [cmd, ...args] = c.split(/\s+/);
    const fn = CMDS[cmd]; const r = fn ? fn(args) : `<span class="e">${esc(cmd)}: command not found. Type 'help' for the list.</span>`;
    if (r) write(r);
    TASKS.forEach(([t, test], i) => { if (!done.has(i) && test(c)) { done.add(i); write(`<span class="s">✓ Task ${i + 1} complete: ${t}</span>`); } });
    drawTasks(); $("#lx-p", el).textContent = prompt();
    if (done.size === TASKS.length) write(`<span class="s">All tasks complete. Well done.</span>`);
  };
  $("#lx-f", el).onsubmit = e => { e.preventDefault(); run(inp.value); inp.value = ""; };
  inp.onkeydown = e => { if (e.key === "ArrowUp" && hi > 0) { hi--; inp.value = hist[hi]; e.preventDefault(); } if (e.key === "ArrowDown") { hi = Math.min(hist.length, hi + 1); inp.value = hist[hi] || ""; e.preventDefault(); } };
  $("#lx-r", el).onclick = () => mountLinux(el);
  out.onclick = () => inp.focus();
  write(`<span class="dim">MND CODE simulated shell. Nothing here runs on a real system. Type 'help' to start.</span>`);
  drawTasks(); $("#lx-p", el).textContent = prompt();
}

/* ---------- 6. Cloud architecture builder ---------- */
function mountCloud(el) {
  const COMPS = [["igw", "Internet gateway", "vpc"], ["nat", "NAT gateway", "none"], ["lb", "Load balancer", "none"], ["app1", "App server A", "none"], ["app2", "App server B", "none"], ["db", "Database", "none"], ["bastion", "Bastion host", "none"]];
  const st = Object.fromEntries(COMPS.map(c => [c[0], c[2]])); st.az = "one"; st.dbRule = "any"; st.sshRule = "any";
  const ZONES = { none: "Not placed", vpc: "VPC edge", pubA: "Public subnet · AZ-a", pubB: "Public subnet · AZ-b", privA: "Private subnet · AZ-a", privB: "Private subnet · AZ-b" };
  el.innerHTML = `<div class="lab-pane"><div class="stack"><p class="small muted">Goal: a web application reachable from the internet, with app servers and the database kept private and the design surviving the loss of one availability zone.</p>
   ${COMPS.map(([id, n]) => `<div class="field"><label for="cb-${id}">${n}</label><select class="input" id="cb-${id}" data-id="${id}">${Object.entries(ZONES).filter(([z]) => id === "igw" ? ["vpc", "none"].includes(z) : z !== "vpc").map(([z, l]) => `<option value="${z}" ${st[id] === z ? "selected" : ""}>${l}</option>`).join("")}</select></div>`).join("")}
   <div class="field"><label for="cb-dbRule">Database security group allows port 5432 from</label><select class="input" id="cb-dbRule" data-id="dbRule"><option value="any">0.0.0.0/0 (anywhere)</option><option value="app">App server security group only</option></select></div>
   <div class="field"><label for="cb-sshRule">Bastion allows SSH (22) from</label><select class="input" id="cb-sshRule" data-id="sshRule"><option value="any">0.0.0.0/0 (anywhere)</option><option value="office">Office IP range only (203.0.113.0/28)</option></select></div>
   <div class="row"><button class="btn btn-ghost btn-sm" type="button" id="cb-sol">Show a passing design</button><button class="btn btn-quiet btn-sm" type="button" id="cb-reset">${icon("reset")}Reset</button></div></div>
   <div class="stack"><div class="zone" style="border-style:solid;border-color:rgba(34,211,238,.4)"><h5>VPC 10.20.0.0/16 <span id="cb-igwBadge"></span></h5><div class="canvas-board">${["pubA", "pubB", "privA", "privB"].map(z => `<div class="zone ${z.startsWith("pub") ? "pub" : "priv"}"><h5>${ZONES[z]}</h5><div data-z="${z}" class="stack" style="gap:6px"></div></div>`).join("")}</div></div>
   <div><h4 style="font-size:var(--t-base);margin-bottom:10px">Design checks <span id="cb-score" class="chip" style="margin-left:8px"></span></h4><ul class="step-log" id="cb-c"></ul></div></div></div>${SIM_NOTE}<p class="xs dim">Cost note: on real providers, NAT gateways and load balancers are billed hourly. This builder deploys nothing.</p>`;
  const pub = z => z === "pubA" || z === "pubB", priv = z => z === "privA" || z === "privB", az = z => z.slice(-1);
  const check = () => {
    const s = st, apps = [s.app1, s.app2];
    return [
      ["Internet gateway attached to the VPC", s.igw === "vpc", "Without an internet gateway nothing in the VPC is reachable from the internet."],
      ["Load balancer in a public subnet", pub(s.lb), "The load balancer is the only component users should reach directly, so it lives in a public subnet."],
      ["App servers in private subnets", apps.every(priv), "App servers receive traffic from the load balancer; they don't need public addresses."],
      ["App servers spread across two AZs", apps.every(z => z !== "none") && az(s.app1) !== az(s.app2), "Placing both servers in one zone means a single zone outage takes the app down."],
      ["Database in a private subnet", priv(s.db), "Databases should never be directly reachable from the internet."],
      ["Database accepts traffic only from the app tier", s.dbRule === "app", "Reference the app security group instead of 0.0.0.0/0 (least privilege)."],
      ["NAT gateway in a public subnet for private outbound updates", pub(s.nat), "Private servers reach the internet for patches via a NAT gateway placed in a public subnet."],
      ["Bastion in a public subnet with SSH restricted", pub(s.bastion) && s.sshRule === "office", "If you use a bastion, limit SSH to known admin IP ranges — or prefer a managed session service."]
    ];
  };
  const draw = () => {
    $$("[data-z]", el).forEach(z => z.innerHTML = COMPS.filter(c => st[c[0]] === z.dataset.z).map(c => `<div class="comp"><span>${c[1]}</span>${icon(c[0] === "db" ? "server" : c[0] === "lb" ? "network" : c[0] === "nat" ? "route" : c[0] === "bastion" ? "lock" : "layers", "icon", 'style="width:16px;height:16px;color:var(--cyan)"')}</div>`).join("") || `<span class="xs dim">empty</span>`);
    $("#cb-igwBadge", el).innerHTML = st.igw === "vpc" ? `<span class="chip chip-cyan" style="margin-left:8px">IGW attached</span>` : `<span class="chip chip-warn" style="margin-left:8px">no IGW</span>`;
    const r = check(), pass = r.filter(x => x[1]).length;
    $("#cb-score", el).textContent = `${pass}/${r.length} passing`; $("#cb-score", el).className = "chip " + (pass === r.length ? "chip-ok" : "chip-warn");
    $("#cb-c", el).innerHTML = r.map(([t, ok, why]) => `<li class="${ok ? "on" : ""}">${icon(ok ? "check" : "x", "icon", `style="width:15px;height:15px;vertical-align:-3px;color:var(--${ok ? "ok" : "bad"})"`)} <strong>${t}</strong>${ok ? "" : `<br><span class="xs">${why}</span>`}</li>`).join("") + (pass === r.length ? `<li class="on" style="border-color:rgba(34,197,94,.6)">${icon("award", "icon", 'style="width:15px;height:15px;color:var(--ok);vertical-align:-3px"')} All checks pass. This is a sound multi-AZ, three-tier layout.</li>` : "");
  };
  $$("select[data-id]", el).forEach(s => s.onchange = () => { st[s.dataset.id] = s.value; draw(); });
  $("#cb-sol", el).onclick = () => { Object.assign(st, { igw: "vpc", nat: "pubA", lb: "pubA", app1: "privA", app2: "privB", db: "privA", bastion: "pubB", dbRule: "app", sshRule: "office" }); $$("select[data-id]", el).forEach(s => s.value = st[s.dataset.id]); draw(); };
  $("#cb-reset", el).onclick = () => mountCloud(el);
  draw();
}

/* ---------- 7. Firewall rules ---------- */
const cidrMatch = (ip, cidr) => { if (cidr === "any") return true; const [n, p] = cidr.split("/"); const size = 2 ** (32 - +(p ?? 32)); return Math.floor(ip2n(ip) / size) === Math.floor(ip2n(n) / size); };
function mountFirewall(el) {
  let rules = [
    { id: 1, act: "allow", proto: "tcp", src: "any", dst: "10.0.1.10/32", port: "443", note: "HTTPS to web server" },
    { id: 2, act: "allow", proto: "tcp", src: "10.0.2.0/24", dst: "10.0.3.5/32", port: "5432", note: "App tier to database" },
    { id: 3, act: "deny", proto: "tcp", src: "any", dst: "any", port: "22", note: "Block SSH" },
    { id: 4, act: "allow", proto: "tcp", src: "192.168.50.0/24", dst: "any", port: "22", note: "Admin VPN SSH" },
    { id: 5, act: "allow", proto: "udp", src: "10.0.0.0/16", dst: "10.0.0.2/32", port: "53", note: "Internal DNS" },
    { id: 6, act: "deny", proto: "any", src: "any", dst: "any", port: "any", note: "Default deny" }];
  const PKTS = [["198.51.100.23", "10.0.1.10", "tcp", 443], ["198.51.100.23", "10.0.3.5", "tcp", 5432], ["10.0.2.15", "10.0.3.5", "tcp", 5432], ["192.168.50.9", "10.0.2.15", "tcp", 22], ["10.0.2.15", "10.0.0.2", "udp", 53], ["10.0.1.10", "10.0.3.5", "tcp", 5432], ["203.0.113.4", "10.0.1.10", "tcp", 80]];
  let guesses = {};
  const evalP = p => { for (const r of rules) { if ((r.proto === "any" || r.proto === p[2]) && cidrMatch(p[0], r.src) && cidrMatch(p[1], r.dst) && (r.port === "any" || +r.port === p[3])) return r; } return null; };
  const draw = (reveal = false) => {
    el.innerHTML = `<p class="small muted" style="margin-bottom:16px">Rules are checked top to bottom; the first match wins. Predict each packet's outcome, then check. Try moving rule 4 above rule 3 and see what changes.</p>
    <div class="table-wrap"><table><thead><tr><th>#</th><th>Action</th><th>Proto</th><th>Source</th><th>Destination</th><th>Port</th><th>Purpose</th><th>Order</th></tr></thead><tbody>${rules.map((r, i) => `<tr><td class="num">${i + 1}</td><td><span class="chip ${r.act === "allow" ? "chip-ok" : "chip-bad"}">${r.act}</span></td><td class="num">${r.proto}</td><td class="num">${r.src}</td><td class="num">${r.dst}</td><td class="num">${r.port}</td><td>${r.note}</td><td><div class="row" style="gap:4px;flex-wrap:nowrap"><button class="btn btn-quiet btn-sm" type="button" data-up="${i}" ${i === 0 ? "disabled" : ""} aria-label="Move rule ${i + 1} up">${icon("up")}</button><button class="btn btn-quiet btn-sm" type="button" data-dn="${i}" ${i === rules.length - 1 ? "disabled" : ""} aria-label="Move rule ${i + 1} down">${icon("down")}</button></div></td></tr>`).join("")}</tbody></table></div>
    <h4 style="font-size:var(--t-base);margin:24px 0 10px">Synthetic traffic</h4>
    <div class="table-wrap"><table><thead><tr><th>Packet</th><th>Source</th><th>Destination</th><th>Proto/Port</th><th>Your prediction</th>${reveal ? "<th>Result</th>" : ""}</tr></thead><tbody>${PKTS.map((p, i) => { const r = evalP(p), res = r ? r.act : "deny", g = guesses[i]; return `<tr><td class="num">P${i + 1}</td><td class="num">${p[0]}</td><td class="num">${p[1]}</td><td class="num">${p[2]}/${p[3]}</td><td><div class="row" style="gap:6px;flex-wrap:nowrap">${["allow", "deny"].map(a => `<button type="button" class="btn btn-sm ${g === a ? (a === "allow" ? "btn-primary" : "btn-danger") : "btn-ghost"}" data-g="${i}" data-a="${a}" aria-pressed="${g === a}">${a}</button>`).join("")}</div></td>${reveal ? `<td>${g === res ? icon("check", "icon", 'style="color:var(--ok);width:16px;height:16px;vertical-align:-3px"') : icon("x", "icon", 'style="color:var(--bad);width:16px;height:16px;vertical-align:-3px"')} <strong>${res}</strong> <span class="xs dim">by rule ${rules.indexOf(r) + 1} (${r.note})</span></td>` : ""}</tr>`; }).join("")}</tbody></table></div>
    <div class="row" style="margin-top:16px"><button class="btn btn-primary" type="button" id="fw-chk">Check predictions</button><button class="btn btn-quiet" type="button" id="fw-r">${icon("reset")}Reset</button><span id="fw-s" class="small" aria-live="polite"></span></div>${SIM_NOTE}`;
    $$("[data-g]", el).forEach(b => b.onclick = () => { guesses[b.dataset.g] = b.dataset.a; draw(reveal); });
    $$("[data-up]", el).forEach(b => b.onclick = () => { const i = +b.dataset.up; [rules[i - 1], rules[i]] = [rules[i], rules[i - 1]]; draw(reveal); });
    $$("[data-dn]", el).forEach(b => b.onclick = () => { const i = +b.dataset.dn; [rules[i + 1], rules[i]] = [rules[i], rules[i + 1]]; draw(reveal); });
    $("#fw-chk", el).onclick = () => { if (Object.keys(guesses).length < PKTS.length) { $("#fw-s", el).innerHTML = `<span style="color:#FCD34D">Predict all ${PKTS.length} packets first (${Object.keys(guesses).length} done).</span>`; return; } draw(true); const n = PKTS.filter((p, i) => guesses[i] === (evalP(p) ? evalP(p).act : "deny")).length; $("#fw-s", el).innerHTML = `<strong>${n} / ${PKTS.length}</strong> correct.`; };
    $("#fw-r", el).onclick = () => mountFirewall(el);
  };
  draw();
}

/* ---------- 8. Quizzes ---------- */
function mountQuizLab(el) {
  const cs = getCourses().filter(c => c.modules.length);
  el.innerHTML = `<div class="tab-row" id="qz-s" style="margin-bottom:20px">${cs.map((c, i) => `<button type="button" data-s="${c.slug}" aria-pressed="${i === 0}">${esc(c.title)}</button>`).join("")}</div><div id="qz-b" style="max-width:760px"></div>`;
  const start = slug => {
    const c = findCourse(slug); const qs = c.modules.map(m => m.check).concat(c.lessons.filter(l => LESSONS[l.key]).flatMap(l => LESSONS[l.key].quiz)).sort(() => Math.random() - .5).slice(0, 10);
    mountQuiz($("#qz-b", el), qs, (s, t) => { const u = currentUser(); if (u) { const p = prog(u); p.quiz.push({ key: "lab:" + slug, score: s, total: t, ts: Date.now() }); touch(u, p); saveProg(u, p); toast("Quiz result saved to your dashboard"); } });
  };
  $$("#qz-s button", el).forEach(b => b.onclick = () => { $$("#qz-s button", el).forEach(x => x.setAttribute("aria-pressed", x === b)); start(b.dataset.s); });
  start(cs[0].slug);
}

/* ---------- 9. Vulnerability prioritisation ---------- */
function mountVuln(el) {
  const F = [
    { id: "F1", t: "Outdated TLS configuration allows TLS 1.0", cvss: 5.3, exp: "Internet", asset: "Customer portal", exploit: "No known practical exploit", fix: "Config change" },
    { id: "F2", t: "SQL injection in login form", cvss: 9.8, exp: "Internet", asset: "Customer portal", exploit: "Public technique, trivial", fix: "Code fix" },
    { id: "F3", t: "Default credentials on lab test switch", cvss: 9.8, exp: "Isolated lab VLAN", asset: "Training equipment", exploit: "Trivial", fix: "Change password" },
    { id: "F4", t: "Missing security headers (CSP, HSTS)", cvss: 4.3, exp: "Internet", asset: "Marketing site", exploit: "Requires another flaw", fix: "Config change" },
    { id: "F5", t: "Unpatched file server with remote code execution", cvss: 8.8, exp: "Internal network", asset: "HR file server", exploit: "Public exploit available", fix: "Vendor patch" },
    { id: "F6", t: "Verbose error messages reveal software versions", cvss: 5.3, exp: "Internet", asset: "Customer portal", exploit: "Information only", fix: "Config change" }];
  const ef = { "Internet": 1, "Internal network": .75, "Isolated lab VLAN": .25 }, af = { "Customer portal": 1, "HR file server": .9, "Marketing site": .5, "Training equipment": .3 };
  const xf = e => /trivial|public exploit/i.test(e) ? 1 : /public technique/i.test(e) ? 1 : /requires/i.test(e) ? .6 : .5;
  const risk = f => +(f.cvss * ef[f.exp] * af[f.asset] * xf(f.exploit)).toFixed(2);
  let order = F.map(f => f.id).sort(() => Math.random() - .5), checked = false;
  const ref = [...F].sort((a, b) => risk(b) - risk(a)).map(f => f.id);
  const draw = () => {
    el.innerHTML = `<p class="small muted" style="margin-bottom:16px">Order these sample findings from highest to lowest <strong>risk</strong> for this fictional organisation. Consider exposure, asset value and exploitability — not just the CVSS score.</p>
    <ol class="prio-list">${order.map((id, i) => { const f = F.find(x => x.id === id), ri = ref.indexOf(id); return `<li><span class="rank">${i + 1}</span><div style="min-width:0"><strong class="small">${id} · ${f.t}</strong><div class="row" style="gap:6px;margin-top:6px"><span class="chip ${f.cvss >= 9 ? "chip-bad" : f.cvss >= 7 ? "chip-warn" : f.cvss >= 4 ? "chip-blue" : ""}">CVSS ${f.cvss}</span><span class="chip">${f.exp}</span><span class="chip">${f.asset}</span><span class="chip">${f.exploit}</span></div>${checked ? `<div class="xs" style="margin-top:6px;color:${Math.abs(ri - i) <= 1 ? "#86EFAC" : "#FDA4AF"}">Reference position ${ri + 1} · context score ${risk(f)}</div>` : ""}</div><div class="row" style="gap:4px;flex-wrap:nowrap"><button class="btn btn-quiet btn-sm" type="button" data-u="${i}" ${i === 0 ? "disabled" : ""} aria-label="Move ${id} up">${icon("up")}</button><button class="btn btn-quiet btn-sm" type="button" data-d="${i}" ${i === order.length - 1 ? "disabled" : ""} aria-label="Move ${id} down">${icon("down")}</button></div></li>`; }).join("")}</ol>
    <div class="row" style="margin-top:16px"><button class="btn btn-primary" type="button" id="vp-c">Check my ranking</button><button class="btn btn-quiet" type="button" id="vp-r">${icon("reset")}Shuffle</button></div><div id="vp-o" aria-live="polite" style="margin-top:16px"></div>${SIM_NOTE}`;
    $$("[data-u]", el).forEach(b => b.onclick = () => { const i = +b.dataset.u; [order[i - 1], order[i]] = [order[i], order[i - 1]]; draw(); });
    $$("[data-d]", el).forEach(b => b.onclick = () => { const i = +b.dataset.d; [order[i + 1], order[i]] = [order[i], order[i + 1]]; draw(); });
    $("#vp-r", el).onclick = () => { order.sort(() => Math.random() - .5); checked = false; draw(); };
    $("#vp-c", el).onclick = () => { checked = true; draw(); const close = order.filter((id, i) => Math.abs(ref.indexOf(id) - i) <= 1).length; $("#vp-o", el).innerHTML = `<div class="alert ${close >= 5 ? "alert-ok" : "alert-info"}">${icon("info")}<div><strong>${close} of ${F.length} findings within one place of the reference order.</strong><p class="small" style="margin-top:6px">Reference order: ${ref.join(" → ")}. Context score = CVSS × exposure × asset value × exploitability. Note how F3, despite CVSS 9.8, ranks low because it sits on an isolated lab VLAN, while F2 tops the list: internet-facing, high-value and trivially exploitable. Real teams also weigh fix effort and business deadlines.</p></div></div>`; };
  };
  draw();
}

/* ---------- 10. Report writing ---------- */
function mountReport(el) {
  el.innerHTML = `<div class="callout" style="margin-bottom:20px"><h4>Fictional lab scenario</h4><p class="small">Authorized scope: <code>app.lab.example</code> (10.10.0.30), a practice application in your isolated lab. While testing the search page, you found that entering a single quote produced a database error, and a crafted input returned every product record including unpublished ones. A test account <code>tester01</code> with password <code>Lab!Pass99</code> was provided for the engagement. Unpublished records contain supplier prices.</p></div>
  <form class="grid g2" id="rp-f" onsubmit="return false" style="gap:16px">
   <div class="field"><label for="rp-title">Finding title</label><input class="input" id="rp-title" placeholder="Short, specific title"></div>
   <div class="field"><label for="rp-sev">Severity</label><select class="input" id="rp-sev"><option value="">Choose…</option><option>Low</option><option>Medium</option><option>High</option><option>Critical</option></select></div>
   <div class="field"><label for="rp-asset">Affected asset</label><input class="input mono-in" id="rp-asset" placeholder="host / URL"></div>
   <div class="field"><label for="rp-cvss">CVSS base score (optional)</label><input class="input mono-in" id="rp-cvss" placeholder="0.0 – 10.0" inputmode="decimal"></div>
   <div class="field" style="grid-column:1/-1"><label for="rp-desc">Description</label><textarea class="input" id="rp-desc" placeholder="What is the weakness and where does it occur?"></textarea></div>
   <div class="field" style="grid-column:1/-1"><label for="rp-ev">Evidence & reproduction steps (within the authorized lab)</label><textarea class="input" id="rp-ev" placeholder="Steps a developer could follow to confirm it in the lab"></textarea></div>
   <div class="field" style="grid-column:1/-1"><label for="rp-imp">Impact</label><textarea class="input" id="rp-imp" style="min-height:90px" placeholder="What could happen and to which data?"></textarea></div>
   <div class="field" style="grid-column:1/-1"><label for="rp-fix">Remediation</label><textarea class="input" id="rp-fix" style="min-height:90px" placeholder="How should the team fix it?"></textarea></div>
   <div class="row" style="grid-column:1/-1"><button class="btn btn-primary" type="button" id="rp-chk">Review my finding</button><button class="btn btn-ghost" type="button" id="rp-ex">Load example answer</button><button class="btn btn-quiet" type="button" id="rp-clr">${icon("reset")}Clear</button></div>
  </form><div id="rp-o" style="margin-top:24px" aria-live="polite"></div>`;
  const v = id => $("#" + id, el).value.trim();
  $("#rp-chk", el).onclick = () => {
    const all = [v("rp-title"), v("rp-desc"), v("rp-ev"), v("rp-imp"), v("rp-fix")].join(" ").toLowerCase();
    const cv = v("rp-cvss");
    const checks = [
      ["Specific title naming the weakness and location", v("rp-title").length >= 12 && /sql|inject/i.test(v("rp-title")) && /search/i.test(v("rp-title") + v("rp-asset")), "Name the vulnerability type and where it occurs, e.g. 'SQL injection in product search'."],
      ["Severity is reasonable for the impact", ["High", "Critical"].includes(v("rp-sev")), "Exposure of unpublished commercial data via injection usually rates High (or Critical if it allows modification)."],
      ["Affected asset matches the authorized scope", /app\.lab\.example|10\.10\.0\.30/.test(v("rp-asset")), "Use the exact in-scope host from the scenario."],
      ["CVSS value, if given, is valid", !cv || (/^\d{1,2}(\.\d)?$/.test(cv) && +cv >= 0 && +cv <= 10), "CVSS scores range from 0.0 to 10.0 with one decimal place."],
      ["Reproduction steps are present", v("rp-ev").length >= 40, "Give numbered steps someone else could follow in the lab."],
      ["No credentials or unnecessary sensitive data in evidence", !/lab!pass99/i.test(all), "Never paste the test account password into a report. Refer to 'the provided test account' instead."],
      ["Impact describes the data and business effect", /record|data|price|supplier|unpublished|confidential/i.test(v("rp-imp")), "Say what an attacker could read or change, and why it matters."],
      ["Remediation recommends parameterized queries", /parameter|prepared statement|bind/i.test(v("rp-fix")), "The primary fix for SQL injection is parameterized queries (prepared statements)."],
      ["Remediation includes a supporting control", /least privilege|error|validat|allow-?list|waf|account/i.test(v("rp-fix")), "Add defence in depth: generic error pages, input validation, least-privilege DB account."]
    ];
    const pass = checks.filter(c => c[1]).length;
    $("#rp-o", el).innerHTML = `<div class="grid g2" style="gap:20px;align-items:start"><div class="stack"><div class="row between"><h4>Review</h4><span class="chip ${pass === checks.length ? "chip-ok" : pass >= 6 ? "chip-blue" : "chip-warn"}">${pass}/${checks.length}</span></div><ul class="step-log">${checks.map(([t, ok, tip]) => `<li class="${ok ? "on" : ""}">${icon(ok ? "check" : "x", "icon", `style="width:15px;height:15px;vertical-align:-3px;color:var(--${ok ? "ok" : "bad"})"`)} <strong>${t}</strong>${ok ? "" : `<br><span class="xs">${tip}</span>`}</li>`).join("")}</ul></div>
    <div class="card" style="background:#fff;color:#0B1220;border-color:#D9E1EC"><div class="xs mono" style="color:#475569">FINDING PREVIEW · FICTIONAL LAB</div><h3 style="color:#0B1220;margin:8px 0">${esc(v("rp-title") || "Untitled finding")}</h3><p class="small" style="color:#475569">Severity: <strong>${esc(v("rp-sev") || "—")}</strong>${cv ? ` · CVSS ${esc(cv)}` : ""} · Asset: <code style="background:#EEF2F8;color:#0B1220">${esc(v("rp-asset") || "—")}</code></p>${[["Description", "rp-desc"], ["Evidence", "rp-ev"], ["Impact", "rp-imp"], ["Remediation", "rp-fix"]].map(([h, id]) => `<h4 style="color:#0B1220;font-size:var(--t-sm);margin-top:14px">${h}</h4><p class="small" style="color:#334155;white-space:pre-wrap">${esc(v(id) || "—")}</p>`).join("")}</div></div>`;
  };
  $("#rp-ex", el).onclick = () => {
    const ex = { "rp-title": "SQL injection in product search parameter", "rp-sev": "High", "rp-asset": "app.lab.example (10.10.0.30) — /search", "rp-cvss": "7.5", "rp-desc": "The search page builds its database query by concatenating user input into SQL. Input containing a single quote changes the query structure.", "rp-ev": "1. Sign in with the provided test account.\n2. Open /search and enter a single quote ( ' ).\n3. Observe a database error message.\n4. Enter a crafted condition (see appendix A, lab only) and observe that unpublished products are returned.", "rp-imp": "An attacker could read every product record, including unpublished items and supplier prices, exposing confidential commercial data. Depending on database permissions, records might also be modified.", "rp-fix": "Use parameterized queries (prepared statements) for all database access in the search feature. Run the application with a least-privilege database account, validate input against an allow-list, and replace detailed database errors with a generic error page. Retest after the fix." };
    Object.entries(ex).forEach(([k, val]) => $("#" + k, el).value = val); $("#rp-chk", el).click();
  };
  $("#rp-clr", el).onclick = () => { $("#rp-f", el).reset(); $("#rp-o", el).innerHTML = ""; };
}

const LAB_MOUNT = { subnet: mountSubnet, osi: mountOSI, packet: mountPacket, dns: mountDNS, linux: mountLinux, cloud: mountCloud, firewall: mountFirewall, quiz: mountQuizLab, vuln: mountVuln, report: mountReport };
