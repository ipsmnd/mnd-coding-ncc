import { Link, useLocation } from "react-router-dom";
import { Icon } from "../components/Icon.jsx";
import { useApp } from "../components/AppContext.jsx";
import { usePageMeta } from "../components/ui.jsx";

export function NotFound() {
  usePageMeta("Page not found");
  const { setSearchOpen } = useApp();
  const { pathname } = useLocation();
  return (
    <section className="section"><div className="wrap" style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
      <div className="mono" style={{ fontSize: "clamp(3rem,10vw,6rem)", fontWeight: 600, color: "var(--cyan)", lineHeight: 1 }}>404</div>
      <p className="mono small dim">destination host unreachable: {pathname}</p>
      <h1 style={{ fontSize: "var(--t-2xl)" }}>This page didn't route.</h1>
      <p className="lead">The link may be outdated or mistyped. Try search, or head back to a known route.</p>
      <div className="row" style={{ justifyContent: "center" }}>
        <Link className="btn btn-primary" to="/">Go home</Link><Link className="btn btn-ghost" to="/courses">Browse courses</Link>
        <button className="btn btn-ghost" type="button" onClick={() => setSearchOpen(true)}><Icon name="search" />Search</button>
      </div>
    </div></section>
  );
}

export function AuthWall({ path, need }) {
  const { user } = useApp();
  usePageMeta("Sign in required");
  const admin = need === "admin" && user;
  return (
    <section className="section"><div className="wrap" style={{ maxWidth: 560 }}><div className="card stack" style={{ textAlign: "center", alignItems: "center", padding: 40 }}>
      <span className="icon-box"><Icon name="lock" /></span>
      <h1 style={{ fontSize: "var(--t-xl)" }}>{admin ? "Administrator access required" : "Please sign in to continue"}</h1>
      <p className="muted">{admin ? "Your account doesn't have permission to view this page." : "This area is for registered students."}</p>
      <div className="row" style={{ justifyContent: "center" }}>
        {admin ? <Link className="btn btn-primary" to="/dashboard">Go to my dashboard</Link>
          : <><Link className="btn btn-primary" to={"/login?next=" + encodeURIComponent(path)}>Sign in</Link><Link className="btn btn-ghost" to="/register">Create account</Link></>}
      </div>
      <p className="xs dim">Demo note: this check runs in the browser. The production backend enforces roles on every API request.</p>
    </div></div></section>
  );
}
