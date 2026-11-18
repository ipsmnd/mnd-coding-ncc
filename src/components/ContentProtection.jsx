/* =========================================================
   CONTENT PROTECTION
   Blocks: text selection & copy, right-click, image saving /
   dragging, common "view source / save / print / devtools"
   shortcuts, and deters screenshots (PrintScreen key, blur
   when the tab loses focus, blank page when printing).

   Form fields (input, textarea, contenteditable) and anything
   inside an element with class "allow-copy" keep working, so
   users can still log in, type in the labs, etc.

   Turn it off by setting PROTECTION_ENABLED to false.

   NOTE: No website can fully stop screenshots (phone cameras,
   OS snipping tools, browser extensions). This is a deterrent.
   ========================================================= */
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./protection.css";

export const PROTECTION_ENABLED = true;
/* Blur the page whenever the window loses focus (e.g. a snipping tool opens).
   Set to false if visitors find it annoying; PrintScreen is still caught. */
const BLUR_ON_FOCUS_LOSS = true;

const EDITABLE = 'input,textarea,select,[contenteditable="true"],[contenteditable=""],.allow-copy';
const isEditable = el => !!(el && el.nodeType === 1 && el.closest && el.closest(EDITABLE));
const block = e => { e.preventDefault(); e.stopPropagation(); return false; };
const wipeClipboard = () => { try { navigator.clipboard && navigator.clipboard.writeText(""); } catch { /* not allowed */ } };

export function ContentProtection() {
  const [shield, setShield] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    if (!PROTECTION_ENABLED) return;
    document.documentElement.classList.add("mnd-protect");

    const show = ms => { setShield(true); clearTimeout(timer.current); if (ms) timer.current = setTimeout(() => setShield(false), ms); };
    const hide = () => setShield(false);

    const onContext = e => { if (!isEditable(e.target)) block(e); };
    const onCopy = e => {
      if (isEditable(e.target) || isEditable(document.activeElement)) return;
      if (e.clipboardData) e.clipboardData.setData("text/plain", "");
      block(e);
    };
    const onSelectStart = e => { if (!isEditable(e.target)) block(e); };
    const onDrag = e => { if (!isEditable(e.target)) block(e); };

    const onKeyDown = e => {
      const k = (e.key || "").toLowerCase(), ctrl = e.ctrlKey || e.metaKey;
      if (k === "printscreen" || e.keyCode === 44) { wipeClipboard(); show(1500); return block(e); }
      if (e.metaKey && e.shiftKey && ["3", "4", "5", "s"].includes(k)) { show(2000); return block(e); } // macOS / Windows snip
      if (k === "f12" || (ctrl && e.shiftKey && ["i", "j", "c"].includes(k))) return block(e);       // devtools
      if (ctrl && ["u", "s", "p"].includes(k)) return block(e);                                       // source / save / print
      if (ctrl && ["c", "x", "a"].includes(k) && !isEditable(e.target)) return block(e);              // copy / cut / select all
    };
    const onKeyUp = e => { if ((e.key || "").toLowerCase() === "printscreen" || e.keyCode === 44) { wipeClipboard(); show(1500); } };

    const onBlur = () => { if (BLUR_ON_FOCUS_LOSS) show(0); };
    const onVis = () => { if (!BLUR_ON_FOCUS_LOSS) return; document.hidden ? show(0) : hide(); };

    const opts = true;
    document.addEventListener("contextmenu", onContext, opts);
    document.addEventListener("copy", onCopy, opts);
    document.addEventListener("cut", onCopy, opts);
    document.addEventListener("selectstart", onSelectStart, opts);
    document.addEventListener("dragstart", onDrag, opts);
    document.addEventListener("keydown", onKeyDown, opts);
    document.addEventListener("keyup", onKeyUp, opts);
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", hide);
    window.addEventListener("beforeprint", onBlur);
    window.addEventListener("afterprint", hide);

    return () => {
      document.documentElement.classList.remove("mnd-protect");
      document.removeEventListener("contextmenu", onContext, opts);
      document.removeEventListener("copy", onCopy, opts);
      document.removeEventListener("cut", onCopy, opts);
      document.removeEventListener("selectstart", onSelectStart, opts);
      document.removeEventListener("dragstart", onDrag, opts);
      document.removeEventListener("keydown", onKeyDown, opts);
      document.removeEventListener("keyup", onKeyUp, opts);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", hide);
      window.removeEventListener("beforeprint", onBlur);
      window.removeEventListener("afterprint", hide);
      clearTimeout(timer.current);
    };
  }, []);

  useEffect(() => { document.body.classList.toggle("mnd-shield", shield); }, [shield]);

  if (!PROTECTION_ENABLED) return null;
  /* Rendered straight into <body> so the blur rule doesn't blur the message itself */
  return createPortal(
    <div id="mnd-shield" aria-hidden={!shield}>
      <div>&#128274; Content is protected.<br /><span style={{ fontWeight: 400, fontSize: 14, opacity: 0.8 }}>Screenshots and copying are not allowed on this site.</span></div>
    </div>, document.body);
}
