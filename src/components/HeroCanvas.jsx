/* Animated network illustration on the home page (canvas). */
import { useEffect, useRef } from "react";
import { reducedMotion } from "../lib/config.js";

export function HeroCanvas() {
  const cvRef = useRef(null), telA = useRef(null), telB = useRef(null);
  useEffect(() => {
    const cv = cvRef.current, ctx = cv.getContext("2d"), reduce = reducedMotion();
    let W, H, dpr, nodes, packets = [], raf, telT, alive = true;
    const kinds = ["router", "server", "cloud", "shield", "node", "node", "node", "node", "server", "node", "cloud", "node"];
    const edges = [[0, 5], [0, 6], [0, 7], [0, 8], [5, 1], [6, 2], [6, 3], [5, 4], [1, 9], [2, 9], [3, 10], [4, 11], [7, 4], [8, 3]];
    function size() {
      dpr = Math.min(devicePixelRatio || 1, 2); const r = cv.getBoundingClientRect(); W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const pts = [[.5, .42], [.2, .22], [.8, .2], [.82, .62], [.16, .6], [.34, .36], [.66, .36], [.36, .7], [.64, .72], [.5, .14], [.92, .4], [.06, .4]];
      nodes = pts.map((p, i) => ({ x: p[0] * W, y: p[1] * H * .86, k: kinds[i], ph: Math.random() * 6 }));
    }
    function glyph(n, t) {
      const { x, y, k } = n; const pulse = .5 + .5 * Math.sin(t / 700 + n.ph);
      ctx.save();
      const col = k === "shield" ? "#8B5CF6" : k === "cloud" ? "#22D3EE" : k === "router" ? "#22D3EE" : "#3B82F6";
      ctx.shadowColor = col; ctx.shadowBlur = 12 + pulse * 10; ctx.strokeStyle = col; ctx.fillStyle = "#0D1322"; ctx.lineWidth = 1.6;
      if (k === "node") { ctx.beginPath(); ctx.arc(x, y, 5, 0, 7); ctx.fill(); ctx.stroke(); }
      else if (k === "server") { for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x - 16, y - 15 + i * 10, 32, 8, 2) : ctx.rect(x - 16, y - 15 + i * 10, 32, 8); ctx.fill(); ctx.stroke(); ctx.fillStyle = i === 1 ? "#22C55E" : col; ctx.fillRect(x - 12, y - 12 + i * 10, 3, 2); ctx.fillStyle = "#0D1322"; } }
      else if (k === "cloud") { ctx.beginPath(); ctx.arc(x - 8, y + 2, 8, Math.PI * .5, Math.PI * 1.5); ctx.arc(x, y - 5, 10, Math.PI, 0); ctx.arc(x + 10, y + 2, 8, Math.PI * 1.5, Math.PI * .5); ctx.closePath(); ctx.fill(); ctx.stroke(); }
      else if (k === "shield") { ctx.beginPath(); ctx.moveTo(x, y - 15); ctx.lineTo(x + 12, y - 9); ctx.lineTo(x + 11, y + 4); ctx.quadraticCurveTo(x + 6, y + 12, x, y + 15); ctx.quadraticCurveTo(x - 6, y + 12, x - 11, y + 4); ctx.lineTo(x - 12, y - 9); ctx.closePath(); ctx.fill(); ctx.stroke(); }
      else if (k === "router") { ctx.beginPath(); ctx.arc(x, y, 18, 0, 7); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x - 8, y); ctx.lineTo(x + 8, y); ctx.moveTo(x, y - 8); ctx.lineTo(x, y + 8); ctx.stroke(); ctx.globalAlpha = .25 + pulse * .25; ctx.beginPath(); ctx.arc(x, y, 28 + pulse * 6, 0, 7); ctx.stroke(); }
      ctx.restore();
    }
    function frame(t) {
      if (!alive) return;
      ctx.clearRect(0, 0, W, H); ctx.lineWidth = 1;
      edges.forEach(([a, b]) => { const A = nodes[a], B = nodes[b]; const g = ctx.createLinearGradient(A.x, A.y, B.x, B.y); g.addColorStop(0, "rgba(59,130,246,.45)"); g.addColorStop(1, "rgba(34,211,238,.15)"); ctx.strokeStyle = g; ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.stroke(); });
      if (!reduce && Math.random() < .06 && packets.length < 14) { const e = edges[Math.floor(Math.random() * edges.length)]; const rev = Math.random() < .5; packets.push({ a: rev ? e[1] : e[0], b: rev ? e[0] : e[1], p: 0, s: .006 + Math.random() * .01, c: Math.random() < .15 ? "#8B5CF6" : "#22D3EE" }); }
      packets = packets.filter(p => p.p <= 1);
      packets.forEach(p => { p.p += p.s; const A = nodes[p.a], B = nodes[p.b]; const x = A.x + (B.x - A.x) * p.p, y = A.y + (B.y - A.y) * p.p; ctx.save(); ctx.fillStyle = p.c; ctx.shadowColor = p.c; ctx.shadowBlur = 10; ctx.beginPath(); ctx.arc(x, y, 2.6, 0, 7); ctx.fill(); ctx.restore(); });
      nodes.forEach(n => glyph(n, t));
      if (!reduce) raf = requestAnimationFrame(frame);
    }
    size(); frame(0);
    const ro = new ResizeObserver(() => { size(); if (reduce) frame(0); }); ro.observe(cv);
    /* live-looking telemetry is labelled as simulated in the UI */
    const tel = () => { if (!alive) return; if (telA.current) telA.current.textContent = (14 + Math.random() * 9).toFixed(1) + " ms"; if (telB.current) telB.current.textContent = (93 + Math.random() * 6).toFixed(1) + "%"; telT = setTimeout(tel, 1600); };
    if (!reduce) tel();
    return () => { alive = false; cancelAnimationFrame(raf); clearTimeout(telT); ro.disconnect(); };
  }, []);
  return (
    <div className="hero-visual" role="img" aria-label="Animated illustration of network nodes, servers, cloud regions and a security shield exchanging packets">
      <canvas ref={cvRef} /><span className="hv-tag">SIMULATED TELEMETRY</span>
      <div className="telemetry" aria-hidden="true">
        <div>LATENCY<b ref={telA}>18.4 ms</b></div><div>LINK HEALTH<b ref={telB}>97.2%</b></div><div>POLICY<b style={{ color: "var(--ok)" }}>default-deny</b></div>
      </div>
    </div>
  );
}
