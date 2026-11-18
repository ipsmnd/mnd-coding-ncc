/* ============================================================
   App-wide state: signed-in user, toasts, confirm dialog and the
   search palette. Data lives in localStorage, so `refresh()` simply
   re-renders everything that reads it.
   ============================================================ */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { currentUser, seedUsers } from "../lib/auth.js";
import { Icon } from "./Icon.jsx";

const AppCtx = createContext(null);
export const useApp = () => useContext(AppCtx);

export function AppProvider({ children }) {
  const [version, setVersion] = useState(0);
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const user = useMemo(() => currentUser(), [version]); // eslint-disable-line react-hooks/exhaustive-deps

  const refresh = useCallback(() => setVersion(v => v + 1), []);

  const toast = useCallback((msg, kind = "ok") => {
    const id = Math.random().toString(36).slice(2);
    setToasts(t => [...t, { id, msg, kind }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3600);
  }, []);

  const confirm = useCallback(opts => new Promise(resolve => setConfirmState({ ...opts, resolve })), []);

  useEffect(() => { seedUsers().then(seeded => { if (seeded) refresh(); }); }, [refresh]);

  const value = useMemo(() => ({ user, version, refresh, toast, confirm, searchOpen, setSearchOpen }),
    [user, version, refresh, toast, confirm, searchOpen]);

  return (
    <AppCtx.Provider value={value}>
      {children}
      <div className="toast-host" aria-live="polite">
        {toasts.map(t => (
          <div className="toast" key={t.id}>
            <Icon name={t.kind === "ok" ? "check" : t.kind === "bad" ? "alert" : "info"} style={{ color: `var(--${t.kind === "ok" ? "ok" : t.kind === "bad" ? "bad" : "cyan"})` }} />
            <span>{t.msg}</span>
          </div>
        ))}
      </div>
      {confirmState && <ConfirmDialog {...confirmState} onDone={v => { confirmState.resolve(v); setConfirmState(null); }} />}
    </AppCtx.Provider>
  );
}

/* A <dialog> opened as a modal while mounted. */
export function Modal({ onCancel, children, label }) {
  const ref = useRef(null);
  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
    return () => { if (d && d.open) d.close(); };
  }, []);
  return (
    <dialog ref={ref} aria-label={label} onCancel={e => { e.preventDefault(); onCancel && onCancel(); }}>
      <div className="dlg-body">{children}</div>
    </dialog>
  );
}

function ConfirmDialog({ title, body, confirm = "Confirm", danger = false, onDone }) {
  const ok = useRef(null);
  useEffect(() => { ok.current && ok.current.focus(); }, []);
  return (
    <Modal onCancel={() => onDone(false)} label={title}>
      <h3 style={{ fontSize: "var(--t-lg)" }}>{title}</h3>
      <p className="muted small">{body}</p>
      <div className="row" style={{ justifyContent: "flex-end" }}>
        <button className="btn btn-ghost" type="button" onClick={() => onDone(false)}>Cancel</button>
        <button ref={ok} className={`btn ${danger ? "btn-danger" : "btn-primary"}`} type="button" onClick={() => onDone(true)}>{confirm}</button>
      </div>
    </Modal>
  );
}
