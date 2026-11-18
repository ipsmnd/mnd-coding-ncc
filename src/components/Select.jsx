/* ============================================================
   SEARCHABLE SELECT — replaces native <select class="input">
   with a searchable dropdown (same look as the original site).
   options: [{ value, label, disabled }] or plain strings.
   ============================================================ */
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "./Icon.jsx";

const norm = s => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
let seq = 0;

export function Select({ id, value, onChange, options, className = "input", style, ariaLabel, disabled }) {
  const opts = options.map(o => typeof o === "object" ? o : { value: o, label: o });
  const [open, setOpen] = useState(false);
  const [initial, setInitial] = useState("");
  const trigger = useRef(null);
  const [uidv] = useState(() => "cs-" + (++seq));
  const selIdx = opts.findIndex(o => String(o.value) === String(value));
  const cur = opts[selIdx];

  const close = (focus = false) => { setOpen(false); if (focus) trigger.current && trigger.current.focus(); };
  const pick = o => { if (o.disabled) return; close(true); if (String(o.value) !== String(value)) onChange(o.value); };
  const show = (txt = "") => { if (disabled) return; setInitial(txt); setOpen(true); };

  return (
    <div className="cs" style={style}>
      <button ref={trigger} id={id} type="button" disabled={disabled}
        className={`${className} cs-trigger${!cur || cur.value === "" ? " cs-placeholder" : ""}`}
        role="combobox" aria-haspopup="listbox" aria-expanded={open} aria-controls={uidv + "-list"} aria-label={ariaLabel}
        onClick={() => open ? close(true) : show()}
        onKeyDown={e => {
          if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) { e.preventDefault(); show(); }
          else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) { e.preventDefault(); show(e.key); }
        }}>
        <span className="cs-val">{cur ? cur.label : "Select…"}</span><Icon name="chev" className="icon cs-chev" />
      </button>
      {open && <Panel id={uidv} trigger={trigger} opts={opts} selIdx={selIdx} initial={initial} onPick={pick} onClose={close} />}
    </div>
  );
}

function Panel({ id, trigger, opts, selIdx, initial, onPick, onClose }) {
  const [q, setQ] = useState(initial);
  const [act, setAct] = useState(0);
  const panel = useRef(null), list = useRef(null), input = useRef(null);
  const [pos, setPos] = useState({});
  const items = opts.map((o, i) => ({ o, i })).filter(({ o }) => !q.trim() || norm(o.label).includes(norm(q.trim())));
  const host = (trigger.current && trigger.current.closest("dialog")) || document.body;

  useEffect(() => {
    const t = q.trim() ? items.findIndex(x => !x.o.disabled) : items.findIndex(x => x.i === selIdx);
    setAct(Math.max(0, t));
  }, [q]); // eslint-disable-line react-hooks/exhaustive-deps

  useLayoutEffect(() => {
    const place = () => {
      const r = trigger.current && trigger.current.getBoundingClientRect();
      if (!r || !r.width) { onClose(); return; }
      const below = innerHeight - r.bottom, up = below < 280 && r.top > below;
      const maxH = Math.min(320, (up ? r.top : below) - 16), w = Math.max(r.width, 220);
      setPos({ up, width: w, left: Math.min(Math.max(8, r.left), innerWidth - w - 8), top: up ? undefined : r.bottom + 6, bottom: up ? innerHeight - r.top + 6 : undefined, listMax: Math.max(120, maxH - 56) });
    };
    place();
    window.addEventListener("scroll", place, true); window.addEventListener("resize", place);
    const out = e => { if (panel.current && !panel.current.contains(e.target) && !trigger.current.parentNode.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", out, true);
    input.current && input.current.focus({ preventScroll: true });
    return () => { window.removeEventListener("scroll", place, true); window.removeEventListener("resize", place); document.removeEventListener("mousedown", out, true); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { const a = list.current && list.current.querySelector(`[data-k="${act}"]`); a && a.scrollIntoView({ block: "nearest" }); }, [act, q]);

  const move = d => {
    if (!items.length) return;
    let n = act;
    for (let s = 0; s < items.length; s++) { n = (n + d + items.length) % items.length; if (!items[n].o.disabled) break; }
    setAct(n);
  };

  return createPortal(
    <div ref={panel} className={`cs-panel${pos.up ? " cs-up" : ""}`} style={{ width: pos.width, left: pos.left, top: pos.top, bottom: pos.bottom }}>
      <div className="cs-search"><Icon name="search" />
        <input ref={input} type="text" placeholder="Search…" autoComplete="off" spellCheck="false" aria-label="Search options" aria-controls={id + "-list"} aria-autocomplete="list"
          aria-activedescendant={items[act] ? `${id}-o${items[act].i}` : undefined} value={q} onChange={e => setQ(e.target.value)}
          onKeyDown={e => {
            if (e.key === "ArrowDown") { e.preventDefault(); move(1); }
            else if (e.key === "ArrowUp") { e.preventDefault(); move(-1); }
            else if (e.key === "Home") { e.preventDefault(); setAct(0); }
            else if (e.key === "End") { e.preventDefault(); setAct(items.length - 1); }
            else if (e.key === "Enter") { e.preventDefault(); items[act] && onPick(items[act].o); }
            else if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); onClose(true); }
            else if (e.key === "Tab") onClose();
          }} />
      </div>
      <ul ref={list} className="cs-list" id={id + "-list"} role="listbox" style={{ maxHeight: pos.listMax }} onMouseDown={e => e.preventDefault()}>
        {items.length ? items.map(({ o, i }, k) => (
          <li key={i} role="option" id={`${id}-o${i}`} data-k={k} aria-selected={i === selIdx} aria-disabled={o.disabled || undefined}
            className={k === act ? "active" : undefined} onClick={() => onPick(o)} onMouseMove={() => { if (k !== act && !o.disabled) setAct(k); }}>
            <span>{o.label}</span>{i === selIdx && <Icon name="check" />}
          </li>
        )) : <li className="cs-empty">No matches</li>}
      </ul>
    </div>, host);
}
