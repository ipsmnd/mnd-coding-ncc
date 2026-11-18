/* ============================================================
   SHELL: announcement bar, footer, search palette, back-to-top
   ============================================================ */
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Icon, Logo } from "./Icon.jsx";
import { useApp } from "./AppContext.jsx";
import { SITE, store, reducedMotion } from "../lib/config.js";
import { catHref, courseCats, searchFn } from "../lib/data.js";

export function Announcement() {
  const { version } = useApp();
  const a = { ...SITE.announcement, ...store.get("admin:announcement", {}) };
  const [dismissed, setDismissed] = useState(() => store.get("announceDismissed", "") === a.text);
  useEffect(() => { setDismissed(store.get("announceDismissed", "") === a.text); }, [version, a.text]);
  if (!a.enabled || dismissed || !a.text) return null;
  return (
    <div className="announce" role="region" aria-label="Announcement"><div className="wrap">
      <b>{a.label || "Update"}</b><span>{a.text}</span>
      {a.link && <Link to={a.link}>{a.linkText || "Learn more"} →</Link>}
      <button type="button" aria-label="Dismiss announcement" onClick={() => { store.set("announceDismissed", a.text); setDismissed(true); }}><Icon name="x" style={{ width: 16, height: 16 }} /></button>
    </div></div>
  );
}

export function Footer() {
  const { user } = useApp();
  const cats = courseCats();
  return (
    <footer className="site-footer"><div className="wrap">
      <div className="foot-grid">
        <div className="stack" style={{ gap: 14 }}>
          <Link className="logo" to="/"><Logo /><span>MND CODE<small>CONNECT · COMPUTE · SECURE</small></span></Link>
          <p className="small muted" style={{ maxWidth: "34ch" }}>Practical, responsible training in networking, cloud infrastructure and cybersecurity.</p>
        </div>
        <div><h5>Courses</h5><ul>{cats.map(k => <li key={k.name}><Link to={catHref(k.name)}>{k.name}</Link></li>)}</ul></div>
        <div><h5>Learn</h5><ul>
          <li><Link to="/learning-paths">Learning paths</Link></li><li><Link to="/labs">Practical labs</Link></li>
          {user && <><li><Link to="/practice">Practice Arena · mock tests</Link></li><li><Link to="/projects">Projects</Link></li><li><Link to="/resources">Resources</Link></li></>}
          <li><Link to="/blog">Blog</Link></li>
        </ul></div>
        <div><h5>Company</h5><ul><li><Link to="/about">About us</Link></li><li><Link to="/faq">FAQ</Link></li><li><Link to="/contact">Contact us</Link></li></ul></div>
      </div>
      <div className="foot-bottom"><span>© {new Date().getFullYear()} MND CODE. All rights reserved.</span><span className="foot-legal"><Link to="/privacy">Privacy</Link><Link to="/terms">Terms</Link></span></div>
    </div></footer>
  );
}

export function SearchPalette() {
  const { user, searchOpen, setSearchOpen } = useApp();
  const navigate = useNavigate();
  const dlg = useRef(null), inp = useRef(null), res = useRef(null);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);

  useEffect(() => {
    const k = e => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setSearchOpen(true); } };
    document.addEventListener("keydown", k);
    return () => document.removeEventListener("keydown", k);
  }, [setSearchOpen]);
  useEffect(() => {
    const d = dlg.current; if (!d) return;
    if (searchOpen && !d.open) { setQ(""); setSel(0); d.showModal(); setTimeout(() => inp.current && inp.current.focus(), 0); }
    if (!searchOpen && d.open) d.close();
  }, [searchOpen]);
  useEffect(() => { const a = res.current && res.current.querySelector(".sel"); a && a.scrollIntoView({ block: "nearest" }); }, [sel]);

  const items = q.trim() ? searchFn(q, user, 30) : [
    { t: "All courses", s: "", k: "Page", h: "/courses" }, { t: "Subnetting calculator", s: "", k: "Lab", h: "/labs?t=subnet" }, { t: "Learning paths", s: "", k: "Page", h: "/learning-paths" },
    ...(user ? [{ t: "Practice Arena", s: "", k: "Page", h: "/practice" }, { t: "Resources & cheat sheets", s: "", k: "Page", h: "/resources" }] : [])];
  const go = h => { setSearchOpen(false); navigate(h); };

  return (
    <dialog ref={dlg} aria-label="Search" onClose={() => setSearchOpen(false)}>
      <div className="pal-in">
        <Icon name="search" />
        <label htmlFor="palInput" className="sr-only">Search courses, lessons and resources</label>
        <input ref={inp} id="palInput" type="search" placeholder="Search courses, lessons, resources…" autoComplete="off" value={q}
          onChange={e => { setQ(e.target.value); setSel(0); }}
          onKeyDown={e => {
            if (e.key === "ArrowDown") { e.preventDefault(); setSel(Math.min(sel + 1, items.length - 1)); }
            if (e.key === "ArrowUp") { e.preventDefault(); setSel(Math.max(sel - 1, 0)); }
            if (e.key === "Enter" && items[sel]) { e.preventDefault(); go(items[sel].h); }
          }} />
        <button className="btn btn-quiet btn-sm" type="button" onClick={() => setSearchOpen(false)}>Esc</button>
      </div>
      <div className="pal-res" role="listbox" ref={res}>
        {items.length ? items.map((x, i) => (
          <a key={x.h + i} href={"#" + x.h} role="option" className={i === sel ? "sel" : ""} aria-selected={i === sel} onClick={e => { e.preventDefault(); go(x.h); }}>
            <span>{x.t}{x.s && <span className="dim xs" style={{ display: "block" }}>{x.s.slice(0, 70)}</span>}</span><small>{x.k}</small>
          </a>
        )) : <p className="muted small" style={{ padding: 16 }}>No results for “{q}”. Try a topic such as <em>subnet</em>, <em>VPC</em> or <em>SSH</em>.</p>}
      </div>
    </dialog>
  );
}

export function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const f = () => setShow(scrollY >= 900);
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);
  return (
    <button className="to-top" type="button" hidden={!show} aria-label="Back to top"
      onClick={() => { window.scrollTo({ top: 0, behavior: reducedMotion() ? "auto" : "smooth" }); document.getElementById("main")?.focus({ preventScroll: true }); }}>
      <Icon name="arrowUp" />
    </button>
  );
}
