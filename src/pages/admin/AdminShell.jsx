import { Link, useLocation } from "react-router-dom";
import { Icon } from "../../components/Icon.jsx";
import { SideNav } from "../../components/ui.jsx";
import { store } from "../../lib/config.js";
import { useSignOut } from "../dashboard/Dashboard.jsx";

export const ADMIN_LINKS = [["/admin", "grid", "Overview"], ["/admin/courses", "book", "Courses"], ["/admin/lessons", "list", "Lessons"], ["/admin/students", "users", "Students"], ["/admin/messages", "inbox", "Messages"]];

export function AdminShell({ children }) {
  const { pathname } = useLocation();
  const signOut = useSignOut();
  const cur = ADMIN_LINKS.find(l => l[0] === pathname) || ADMIN_LINKS[0];
  const unread = store.get("messages", []).filter(m => !m.read).length;
  return (
    <div className="wrap app-shell">
      <SideNav id="sideNav" kicker="Admin menu" label={cur[2]} icon={cur[1]} ariaLabel="Admin">
        <div className="side-h">Admin</div>
        {ADMIN_LINKS.map(([h, i, t]) => (
          <Link key={h} to={h} className={pathname === h ? "active" : ""} aria-current={pathname === h ? "page" : undefined}><Icon name={i} />{t}
            {h === "/admin/messages" && unread > 0 && <span className="chip chip-cyan" style={{ height: 20, marginLeft: "auto" }}>{unread}</span>}</Link>
        ))}
        <div className="side-h">Site</div>
        <Link to="/"><Icon name="home" />View site</Link><Link to="/dashboard"><Icon name="user" />Student view</Link>
        <a href="#/" onClick={signOut}><Icon name="logout" />Sign out</a>
      </SideNav>
      <div style={{ minWidth: 0 }}>
        <div className="alert alert-warn" style={{ marginBottom: 20 }}><Icon name="info" /><span className="small"><strong>Prototype admin.</strong> Changes are saved in this browser only and logged below. In production these actions run through authenticated API endpoints with server-side role checks.</span></div>
        {children}
      </div>
    </div>
  );
}

export function AdminHead({ title, sub, children }) {
  return (
    <div className="row between" style={{ marginBottom: 24 }}>
      <div><span className="eyebrow">Admin</span><h1 style={{ fontSize: "var(--t-2xl)", marginTop: 10 }}>{title}</h1>{sub && <p className="small muted" style={{ marginTop: 6 }}>{sub}</p>}</div>
      {children}
    </div>
  );
}
