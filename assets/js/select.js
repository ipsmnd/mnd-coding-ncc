"use strict";
/* ============================================================
   CUSTOM SELECT — every <select class="input"> is upgraded to a
   searchable dropdown. The native select stays in the DOM (hidden)
   as the source of truth, so forms, .value, onchange and reset()
   keep working unchanged.
   ============================================================ */
const CS = { open: null };
const csNorm = s => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

function csLabel(sel) {
  const o = sel.options[sel.selectedIndex];
  return o ? o.textContent : "";
}
function csSync(sel) {
  const w = sel._cs; if (!w) return;
  const o = sel.options[sel.selectedIndex];
  w.val.textContent = csLabel(sel) || "Select…";
  w.trigger.classList.toggle("cs-placeholder", !o || o.value === "");
  w.trigger.disabled = sel.disabled;
}

function csClose(focusTrigger = false) {
  const st = CS.open; if (!st) return;
  CS.open = null;
  st.panel.remove();
  st.w.trigger.setAttribute("aria-expanded", "false");
  window.removeEventListener("scroll", st.place, true);
  window.removeEventListener("resize", st.place);
  if (focusTrigger) st.w.trigger.focus();
}

function csOpen(sel, initial = "") {
  if (CS.open && CS.open.sel === sel) return;
  csClose();
  const w = sel._cs, id = w.id;
  const panel = document.createElement("div");
  panel.className = "cs-panel";
  panel.innerHTML = `<div class="cs-search">${icon("search")}<input type="text" placeholder="Search…" autocomplete="off" spellcheck="false" aria-label="Search options" aria-controls="${id}-list" aria-autocomplete="list"></div><ul class="cs-list" id="${id}-list" role="listbox"></ul>`;
  (sel.closest("dialog") || document.body).appendChild(panel);
  const input = $("input", panel), list = $("ul", panel);
  let items = [], act = 0;

  const draw = () => {
    const q = csNorm(input.value.trim());
    items = [...sel.options].map((o, i) => ({ o, i })).filter(({ o }) => !q || csNorm(o.textContent).includes(q));
    act = Math.max(0, items.findIndex(x => x.i === sel.selectedIndex));
    if (q) act = Math.max(0, items.findIndex(x => !x.o.disabled));
    list.innerHTML = items.length ? items.map(({ o, i }, k) => `<li role="option" id="${id}-o${i}" data-k="${k}" aria-selected="${i === sel.selectedIndex}"${o.disabled ? ' aria-disabled="true"' : ""}><span>${esc(o.textContent)}</span>${i === sel.selectedIndex ? icon("check") : ""}</li>`).join("") : `<li class="cs-empty">No matches</li>`;
    mark();
  };
  const mark = () => {
    $$("li[data-k]", list).forEach(li => li.classList.toggle("active", +li.dataset.k === act));
    const a = $(`li[data-k="${act}"]`, list);
    if (a) { input.setAttribute("aria-activedescendant", a.id); a.scrollIntoView({ block: "nearest" }); } else input.removeAttribute("aria-activedescendant");
  };
  const move = d => {
    if (!items.length) return;
    let n = act;
    for (let s = 0; s < items.length; s++) { n = (n + d + items.length) % items.length; if (!items[n].o.disabled) break; }
    act = n; mark();
  };
  const pick = k => {
    const it = items[k]; if (!it || it.o.disabled) return;
    const changed = sel.selectedIndex !== it.i;
    sel.selectedIndex = it.i;
    csClose(true);
    if (changed) { sel.dispatchEvent(new Event("input", { bubbles: true })); sel.dispatchEvent(new Event("change", { bubbles: true })); }
  };
  const place = () => {
    const r = w.trigger.getBoundingClientRect();
    if (!r.width) { csClose(); return; }
    const below = innerHeight - r.bottom, up = below < 280 && r.top > below;
    const maxH = Math.min(320, (up ? r.top : below) - 16);
    panel.style.width = Math.max(r.width, 220) + "px";
    panel.style.left = Math.min(Math.max(8, r.left), innerWidth - Math.max(r.width, 220) - 8) + "px";
    panel.style.top = up ? "" : r.bottom + 6 + "px";
    panel.style.bottom = up ? innerHeight - r.top + 6 + "px" : "";
    list.style.maxHeight = Math.max(120, maxH - 56) + "px";
    panel.classList.toggle("cs-up", up);
  };

  input.addEventListener("input", draw);
  input.addEventListener("keydown", e => {
    if (e.key === "ArrowDown") { e.preventDefault(); move(1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); move(-1); }
    else if (e.key === "Home") { e.preventDefault(); act = 0; move(0); }
    else if (e.key === "End") { e.preventDefault(); act = items.length - 1; mark(); }
    else if (e.key === "Enter") { e.preventDefault(); pick(act); }
    else if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); csClose(true); }
    else if (e.key === "Tab") csClose();
  });
  list.addEventListener("mousedown", e => e.preventDefault());
  list.addEventListener("click", e => { const li = e.target.closest("li[data-k]"); if (li) pick(+li.dataset.k); });
  list.addEventListener("mousemove", e => { const li = e.target.closest("li[data-k]"); if (li && +li.dataset.k !== act && li.getAttribute("aria-disabled") !== "true") { act = +li.dataset.k; mark(); } });

  CS.open = { sel, w, panel, place };
  w.trigger.setAttribute("aria-expanded", "true");
  input.value = initial;
  draw(); place();
  window.addEventListener("scroll", place, true);
  window.addEventListener("resize", place);
  input.focus({ preventScroll: true });
}

function csEnhance(sel) {
  if (sel._cs || sel.multiple || sel.size > 1) return;
  const id = "cs-" + uid();
  const wrap = document.createElement("div");
  wrap.className = "cs";
  const st = sel.getAttribute("style"); if (st) wrap.setAttribute("style", st);
  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className = [...sel.classList].join(" ") + " cs-trigger";
  trigger.setAttribute("role", "combobox");
  trigger.setAttribute("aria-haspopup", "listbox");
  trigger.setAttribute("aria-expanded", "false");
  trigger.setAttribute("aria-controls", id + "-list");
  const lbl = sel.id && document.querySelector(`label[for="${CSS.escape(sel.id)}"]`);
  if (lbl) { if (!lbl.id) lbl.id = id + "-lbl"; trigger.setAttribute("aria-labelledby", lbl.id + " " + id + "-val"); }
  else if (sel.getAttribute("aria-label")) trigger.setAttribute("aria-label", sel.getAttribute("aria-label"));
  trigger.innerHTML = `<span class="cs-val" id="${id}-val"></span>${icon("chev", "icon cs-chev")}`;
  sel.parentNode.insertBefore(wrap, sel);
  wrap.append(trigger, sel);
  sel.classList.add("cs-native"); sel.tabIndex = -1; sel.setAttribute("aria-hidden", "true");
  sel._cs = { id, wrap, trigger, val: $(".cs-val", trigger) };

  // keep the trigger in sync when code sets .value / .selectedIndex directly
  for (const prop of ["value", "selectedIndex"]) {
    const d = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, prop);
    Object.defineProperty(sel, prop, { configurable: true, get() { return d.get.call(this); }, set(v) { d.set.call(this, v); csSync(this); } });
  }
  sel.addEventListener("change", () => csSync(sel));
  sel.addEventListener("invalid", () => trigger.focus());
  new MutationObserver(() => csSync(sel)).observe(sel, { childList: true, subtree: true, attributes: true, attributeFilter: ["disabled", "selected"] });
  if (sel.form && !sel.form._csReset) { sel.form._csReset = true; sel.form.addEventListener("reset", () => setTimeout(() => $$("select", sel.form).forEach(csSync))); }
  if (lbl) lbl.addEventListener("click", e => { e.preventDefault(); trigger.focus(); });

  trigger.addEventListener("click", () => CS.open && CS.open.sel === sel ? csClose(true) : csOpen(sel));
  trigger.addEventListener("keydown", e => {
    if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) { e.preventDefault(); csOpen(sel); }
    else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) { e.preventDefault(); csOpen(sel, e.key); }
  });
  csSync(sel);
}

function enhanceSelects(root = document) { $$("select.input", root).forEach(csEnhance); }
document.addEventListener("mousedown", e => { const st = CS.open; if (st && !st.panel.contains(e.target) && !st.w.wrap.contains(e.target)) csClose(); }, true);
new MutationObserver(muts => {
  for (const m of muts) for (const n of m.addedNodes) if (n.nodeType === 1) { if (n.matches("select.input")) csEnhance(n); else if (n.querySelector) enhanceSelects(n); }
  if (CS.open && !CS.open.w.wrap.isConnected) csClose();
}).observe(document.documentElement, { childList: true, subtree: true });
