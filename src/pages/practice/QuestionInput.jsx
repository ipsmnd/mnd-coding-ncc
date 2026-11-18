/* Renders the answer controls for one practice question. */
import { useRef } from "react";
import { Icon } from "../../components/Icon.jsx";
import { PA, paGrade, paPerm } from "./engine.js";

export const TypeChip = ({ q }) => <span className="chip chip-cyan">{PA.TYPE_LABEL[q.t]}</span>;
export const DomainChip = ({ d }) => <span className={`chip ${PA.DOMAIN_CHIP[d] || ""}`}>{d}</span>;

export function QuestionInput({ q, r, modId, qi, reveal = false, locked = false, onChange, onEnter }) {
  const box = useRef(null);
  const ok = reveal && paGrade(q, r);
  const focusLater = sel => setTimeout(() => { const el = box.current && box.current.querySelector(sel); el && el.focus(); }, 0);

  if (q.t === "mcq" || q.t === "tf") {
    const opts = q.t === "tf" ? [["True", true], ["False", false]] : q.o.map((o, i) => [o, i]);
    return (
      <div className={`q-opts ${q.t === "tf" ? "pa-tf" : ""}`} role="radiogroup" ref={box}>
        {opts.map(([label, val], i) => {
          let cls = r === val ? "sel" : "";
          if (reveal) cls = val === q.a ? "right" : (r === val ? "wrong" : "");
          const k = q.t === "tf" ? (val ? "T" : "F") : String.fromCharCode(65 + i);
          return (
            <button key={String(val)} type="button" className={`q-opt ${cls}`} role="radio" aria-checked={r === val} disabled={locked} onClick={() => onChange(val)}>
              <span className="k">{k}</span><span className="pa-grow">{label}</span>
              {reveal && val === q.a ? <Icon name="check" className="icon pa-ok" /> : reveal && r === val ? <Icon name="x" className="icon pa-bad" /> : null}
            </button>);
        })}
      </div>);
  }
  if (q.t === "multi") {
    return (
      <div className="q-opts" ref={box}>
        {q.o.map((o, i) => {
          const sel = r.includes(i), isA = q.a.includes(i);
          const cls = reveal ? (isA && sel ? "right" : isA ? "missed" : sel ? "wrong" : "") : sel ? "sel" : "";
          return (
            <button key={i} type="button" className={`q-opt ${cls}`} role="checkbox" aria-checked={sel} disabled={locked}
              onClick={() => onChange(sel ? r.filter(x => x !== i) : [...r, i])}>
              <span className="k pa-box">{sel && <Icon name="check" />}</span><span className="pa-grow">{o}</span>
              {reveal && isA && !sel && <span className="xs pa-ok">missed</span>}
            </button>);
        })}
      </div>);
  }
  if (q.t === "fill") {
    return (
      <div ref={box}>
        <input type="text" className={`input pa-fill ${reveal ? (ok ? "pa-right" : "pa-wrong") : ""}`} value={r} placeholder="Type your answer" autoComplete="off" spellCheck="false" aria-label="Your answer" disabled={locked}
          onChange={e => onChange(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); onEnter && onEnter(); } }} />
        <p className="xs dim">Not case-sensitive. Press Enter to submit.</p>
      </div>);
  }
  if (q.t === "order") {
    const move = (pos, dir) => {
      const to = pos + dir; if (to < 0 || to >= r.length) return;
      const n = [...r]; [n[pos], n[to]] = [n[to], n[pos]]; onChange(n);
      focusLater(`[data-pos="${to}"][data-dir="${dir}"]:not(:disabled)`);
    };
    return (
      <ol className="pa-order" ref={box}>
        {r.map((it, pos) => (
          <li key={it} className={reveal ? (it === pos ? "pa-right" : "pa-wrong") : ""}>
            <span className="mono xs dim">{pos + 1}</span><span className="pa-grow">{q.o[it]}</span>
            <button type="button" className="pa-icon-btn" data-pos={pos} data-dir="-1" aria-label="Move up" disabled={locked || pos === 0} onClick={() => move(pos, -1)}><Icon name="up" /></button>
            <button type="button" className="pa-icon-btn" data-pos={pos} data-dir="1" aria-label="Move down" disabled={locked || pos === r.length - 1} onClick={() => move(pos, 1)}><Icon name="down" /></button>
          </li>))}
      </ol>);
  }
  if (q.t === "match") {
    const perm = paPerm(q.p.length, modId * 131 + qi * 7 + 3);
    return (
      <div className="pa-match" ref={box}>
        {q.p.map(([left], row) => (
          <div key={row} className={`pa-match-row ${reveal ? (r[row] === row ? "pa-right" : "pa-wrong") : ""}`}>
            <span className="pa-match-l">{left}</span>
            <select className="pa-sel" aria-label={`Match for ${left}`} disabled={locked} value={r[row]} onChange={e => { const n = [...r]; n[row] = +e.target.value; onChange(n); }}>
              <option value={-1}>Choose…</option>
              {perm.map(j => <option key={j} value={j}>{q.p[j][1]}</option>)}
            </select>
            {reveal && r[row] !== row && <span className="xs pa-ok pa-fix">Correct: {q.p[row][1]}</span>}
          </div>))}
      </div>);
  }
  return null;
}
