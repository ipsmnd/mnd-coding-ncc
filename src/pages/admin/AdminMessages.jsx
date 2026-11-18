import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Icon } from "../../components/Icon.jsx";
import { useApp } from "../../components/AppContext.jsx";
import { Empty, usePageMeta } from "../../components/ui.jsx";
import { fmtDT, store } from "../../lib/config.js";
import { audit } from "../../lib/auth.js";
import { AdminHead, AdminShell } from "./AdminShell.jsx";

const B = { fontFamily: "var(--f-body)", fontSize: "var(--t-sm)" };

export function AdminMessages() {
  usePageMeta("Contact Submissions");
  const { user: u, toast, confirm, refresh } = useApp();
  const [params] = useSearchParams();
  const filter = params.get("f") || "all";
  /* Messages opened in this visit are marked read in storage but stay in place until the next visit */
  const [opened, setOpened] = useState({});
  const msgs = store.get("messages", []);
  const wasRead = m => m.read && !opened[m.id];
  const list = msgs.filter(m => filter === "all" || (filter === "unread" ? !wasRead(m) : wasRead(m)));
  const upd = fn => { const ms = store.get("messages", []); fn(ms); store.set("messages", ms); refresh(); };
  const markOpened = m => {
    if (m.read) return;
    const ms = store.get("messages", []), x = ms.find(y => y.id === m.id); if (x) x.read = true; store.set("messages", ms);
    setOpened(o => ({ ...o, [m.id]: true }));
  };

  const del = async id => {
    if (!(await confirm({ title: "Delete this message?", body: "It will be removed from the inbox permanently.", confirm: "Delete", danger: true }))) return;
    upd(ms => ms.splice(ms.findIndex(x => x.id === id), 1)); audit(u.email, "Deleted a contact message"); toast("Message deleted.", "info");
  };
  const copy = email => {
    if (!navigator.clipboard) { toast("Copy isn't available here — select the address instead.", "info"); return; }
    navigator.clipboard.writeText(email).then(() => toast("Email copied.")).catch(() => toast("Copy isn't available here — select the address instead.", "info"));
  };

  return (
    <AdminShell>
      <AdminHead title="Messages" sub="Contact form submissions." />
      <div className="tab-row" style={{ marginBottom: 16 }}>{[["all", "All"], ["unread", "Unread"], ["read", "Read"]].map(([k, t]) => (
        <Link key={k} className={`btn btn-sm ${filter === k ? "btn-primary" : "btn-ghost"}`} to={"/admin/messages" + (k === "all" ? "" : "?f=" + k)}>{t} ({k === "all" ? msgs.length : msgs.filter(m => k === "unread" ? !m.read : m.read).length})</Link>
      ))}</div>
      {list.length ? <div className="acc">{list.map(m => (
        <details key={m.id} onToggle={e => { if (e.currentTarget.open) markOpened(m); }}>
          <summary><span style={{ minWidth: 0 }}><span className={`chip ${m.read ? "" : "chip-cyan"}`} style={{ marginRight: 10 }}>{m.read ? "read" : "new"}</span>{m.subject} <span className="small dim" style={{ fontFamily: "var(--f-body)", fontWeight: 400 }}>— {m.name}</span></span>
            <span className="row" style={{ gap: 10, flexWrap: "nowrap" }}><span className="xs dim mono" style={{ whiteSpace: "nowrap" }}>{fmtDT(m.ts)}</span><Icon name="chev" className="icon chev" /></span></summary>
          <div className="acc-body allow-copy">
            <div className="result-grid"><div><span>From</span><b style={B}>{m.name}</b></div><div><span>Email</span><b style={B}>{m.email}</b></div><div><span>Phone</span><b style={B}>{m.phone || "—"}</b></div><div><span>Course interest</span><b style={B}>{m.course || "Not specified"}</b></div></div>
            <p style={{ whiteSpace: "pre-wrap", color: "var(--text)" }}>{m.message}</p>
            <div className="row">
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => { setOpened(o => ({ ...o, [m.id]: false })); upd(ms => { const x = ms.find(y => y.id === m.id); x.read = !x.read; }); }}>{m.read ? "Mark as unread" : "Mark as read"}</button>
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => copy(m.email)}><Icon name="copy" />Copy email</button>
              <button className="btn btn-quiet btn-sm" type="button" style={{ color: "#FDA4AF" }} onClick={() => del(m.id)}><Icon name="trash" />Delete</button>
            </div>
          </div>
        </details>))}</div>
        : <Empty icon="inbox" title={filter === "all" ? "No messages yet." : "Nothing here."}><span className="small">Submissions from the contact page appear here.</span><Link className="btn btn-ghost btn-sm" to="/contact">Open contact page</Link></Empty>}
    </AdminShell>
  );
}
