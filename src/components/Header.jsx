/* ============================================================
   HEADER — logo, mega menu with course search, Learn menu,
   search button, account link and the mobile navigation.
   ============================================================ */
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Icon, Logo } from "./Icon.jsx";
import { useApp } from "./AppContext.jsx";
import { catHref, courseCats, getCourses, learnMenu } from "../lib/data.js";

export function Header() {
  const { user, setSearchOpen } = useApp();
  const { pathname, search } = useLocation();
  const [dd, setDd] = useState(null);
  const [mobile, setMobile] = useState(false);
  const navRef = useRef(null);
  const cats = courseCats(), total = cats.reduce((n, c) => n + c.list.length, 0);
  const menu = learnMenu(user);
  const active = p => pathname === p || (p !== "/" && pathname.startsWith(p)) ? "active" : "";

  useEffect(() => { setDd(null); setMobile(false); }, [pathname, search]);
  useEffect(() => { document.body.style.overflow = mobile ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [mobile]);
  useEffect(() => {
    if (!dd) return;
    const out = e => { if (!e.target.closest(".dd")) setDd(null); };
    document.addEventListener("click", out);
    return () => document.removeEventListener("click", out);
  }, [dd]);

  useEffect(() => {
    if (dd !== "learn") return;
    const a = navRef.current && navRef.current.querySelector(".dd-learn a");
    a && setTimeout(() => a.focus({ preventScroll: true }), 0);
  }, [dd]);

  const toggle = name => e => { e.stopPropagation(); setDd(d => d === name ? null : name); };
  const ddKey = e => { if (e.key === "Escape") { setDd(null); e.currentTarget.querySelector("button").focus(); } };
  const home = user ? (user.role === "admin" ? "/admin" : "/dashboard") : null;

  return (
    <>
      <header className="site-header">
        <div className="wrap nav" ref={navRef}>
          <Link className="logo" to="/" aria-label="MND CODE home"><Logo /><span>MND CODE<small>CONNECT · COMPUTE · SECURE</small></span></Link>
          <ul className="nav-links">
            <li><Link to="/" className={pathname === "/" ? "active" : ""}>Home</Link></li>
            <li className={`dd${dd === "courses" ? " open" : ""}`} onKeyDown={ddKey}>
              <button type="button" aria-expanded={dd === "courses"} aria-haspopup="true" className={pathname.startsWith("/courses") ? "active" : ""} onClick={toggle("courses")}>
                Courses <Icon name="chev" style={{ width: 15, height: 15 }} />
              </button>
              <div className="dd-menu mega" role="menu">{dd === "courses" && <MegaMenu cats={cats} total={total} />}</div>
            </li>
            <li className={`dd${dd === "learn" ? " open" : ""}`} onKeyDown={ddKey}>
              <button type="button" aria-expanded={dd === "learn"} aria-haspopup="true" className={menu.some(g => g.items.some(([, h]) => active(h))) ? "active" : ""} onClick={toggle("learn")}>
                Learn <Icon name="chev" style={{ width: 15, height: 15 }} />
              </button>
              <div className="dd-menu dd-learn" role="menu">
                {menu.map(g => (
                  <div className="dd-group" key={g.title}><span className="dd-group-h">{g.title}</span>
                    {g.items.map(([t, h, i, d]) => (
                      <Link key={h} to={h} role="menuitem" className={active(h)}>
                        <span className="icon-box"><Icon name={i} /></span><div>{t}<span>{d}</span></div>
                      </Link>
                    ))}
                  </div>
                ))}
                {!user && (
                  <Link className="dd-unlock" to="/login?next=/practice" role="menuitem">
                    <span className="icon-box"><Icon name="lock" /></span><div>Sign in to unlock more<span>Projects, Resources and Practice Arena are free for registered students</span></div>
                  </Link>
                )}
              </div>
            </li>
            <li><Link to="/about" className={active("/about")}>About</Link></li>
            <li><Link to="/contact" className={active("/contact")}>Contact</Link></li>
          </ul>
          <div className="nav-actions">
            <button className="search-btn" type="button" aria-label="Search" onClick={() => setSearchOpen(true)}>
              <Icon name="search" style={{ width: 16, height: 16 }} /><span>Search</span><kbd>Ctrl K</kbd>
            </button>
            {user
              ? <Link className="btn btn-ghost btn-sm hide-m" to={home}><Icon name="user" />{user.name.split(" ")[0]}</Link>
              : <Link className="btn btn-primary btn-sm hide-m" to="/login">Sign In</Link>}
            <button className="menu-toggle" type="button" aria-label="Open menu" aria-expanded={mobile} aria-controls="mnav" onClick={() => setMobile(m => !m)}>
              <Icon name={mobile ? "x" : "menu"} />
            </button>
          </div>
        </div>
      </header>
      <nav className={`mobile-nav${mobile ? " open" : ""}`} id="mnav" aria-label="Mobile">
        <Link to="/">Home</Link><Link to="/courses">All Courses</Link>
        {cats.map(k => <Link key={k.name} className="sub" to={catHref(k.name)}>{k.name} <small>{k.list.length}</small></Link>)}
        <span className="mnav-h">Learn</span>
        {menu.flatMap(g => g.items).map(([t, h]) => <Link key={h} className="sub" to={h}>{t}</Link>)}
        <Link to="/blog">Blog</Link><Link to="/faq">FAQ</Link><Link to="/about">About</Link><Link to="/contact">Contact</Link>
        {user ? <Link to={home}>My {user.role === "admin" ? "admin" : "dashboard"}</Link> : <><Link to="/login">Sign In</Link><Link to="/register">Create account</Link></>}
      </nav>
    </>
  );
}

/* Courses mega menu with live search */
function MegaMenu({ cats, total }) {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [act, setAct] = useState(0);
  const inp = useRef(null), res = useRef(null);
  useEffect(() => { inp.current && inp.current.focus({ preventScroll: true }); }, []);
  const t = q.trim().toLowerCase(), on = !!t;
  const hits = on ? getCourses().filter(c => { const hay = `${c.title} ${c.category} ${c.level} ${c.short || ""}`.toLowerCase(); return t.split(/\s+/).every(w => hay.includes(w)); })
    .sort((a, b) => (b.title.toLowerCase().includes(t) - a.title.toLowerCase().includes(t))) : [];
  const shown = hits.slice(0, 8);
  useEffect(() => { setAct(0); }, [q]);
  useEffect(() => { const a = res.current && res.current.querySelector(".active"); a && a.scrollIntoView({ block: "nearest" }); }, [act]);

  return (
    <>
      <div className="mega-search"><Icon name="search" />
        <input ref={inp} type="search" placeholder={`Search ${total} courses…`} autoComplete="off" aria-label="Search courses" aria-controls="megaRes"
          aria-activedescendant={on && shown[act] ? "megaO" + act : undefined} value={q} onChange={e => setQ(e.target.value)} onClick={e => e.stopPropagation()}
          onKeyDown={e => {
            const n = shown.length;
            if (e.key === "ArrowDown" && n) { e.preventDefault(); setAct((act + 1) % n); }
            else if (e.key === "ArrowUp" && n) { e.preventDefault(); setAct((act - 1 + n) % n); }
            else if (e.key === "Enter") { e.preventDefault(); if (!q.trim()) navigate("/courses"); else if (hits[act]) navigate(hits[act].route); }
            else if (e.key === "Escape" && q) { e.preventDefault(); e.stopPropagation(); setQ(""); }
          }} />
        <kbd>Enter</kbd>
      </div>
      <div className="mega-res" id="megaRes" role="listbox" hidden={!on} ref={res}>
        {on && (shown.length ? <>
          {shown.map((c, i) => (
            <Link key={c.slug} to={c.route} role="option" id={"megaO" + i} className={i === act ? "active" : undefined} onMouseMove={() => i !== act && setAct(i)}>
              <span className="icon-box"><Icon name={c.icon} /></span><div>{c.title}<span>{c.category} · {c.level}{c.duration ? " · " + c.duration : ""}</span></div>
            </Link>
          ))}
          {hits.length > shown.length && <Link className="mega-all" to={"/courses?q=" + encodeURIComponent(q.trim())}>See all {hits.length} results <Icon name="arrow" /></Link>}
        </> : <div className="mega-none"><Icon name="search" /><strong>No courses match “{q.trim()}”</strong><Link to="/courses">Browse all courses</Link></div>)}
      </div>
      <div className="mega-cols" hidden={on}>
        {cats.map(k => (
          <div className="mega-col" key={k.name}>
            <Link className="mega-cat" to={catHref(k.name)} role="menuitem"><span className="icon-box"><Icon name={k.icon} /></span><div>{k.name}<span>{k.list.length} courses</span></div></Link>
            <ul>{k.list.slice(0, 5).map(c => <li key={c.slug}><Link to={c.route} role="menuitem">{c.title}</Link></li>)}</ul>
            {k.list.length > 5 && <Link className="mega-more" to={catHref(k.name)} role="menuitem">View all {k.list.length} <Icon name="arrow" /></Link>}
          </div>
        ))}
      </div>
      <div className="mega-foot" hidden={on}><span>{total} courses across {cats.length} categories</span><Link to="/courses" role="menuitem">Browse all courses <Icon name="arrow" /></Link></div>
    </>
  );
}
