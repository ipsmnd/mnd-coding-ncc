/* ============================================================
   PRACTICE ARENA — shared question engine
   Question types: mcq, tf, multi, fill, order, match
   ============================================================ */
import PRACTICE_BANK from "../../lib/practiceBank.js";
import { store } from "../../lib/config.js";

export const PA = {
  modules: PRACTICE_BANK.MODULES,
  byId: new Map(PRACTICE_BANK.MODULES.map(m => [m.id, m])),
  TYPE_LABEL: PRACTICE_BANK.TYPE_LABEL,
  TYPE_HINT: PRACTICE_BANK.TYPE_HINT,
  PASS_RATIO: 0.75,
  EXAM_PASS: 70,
  PER_PAGE: 8,
  DOMAINS: ["Networking", "Cloud", "Security"],
  DOMAIN_CHIP: { Networking: "chip-blue", Cloud: "chip-cyan", Security: "chip-purple" }
};
PA.total = PA.modules.reduce((n, m) => n + m.qs.length, 0);

/* Deterministic shuffle so a question's option order is stable between visits */
export function paPerm(n, seed) {
  let s = seed >>> 0;
  const rand = () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const p = [...Array(n).keys()];
  for (let i = n - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; }
  if (n > 1 && p.every((v, i) => v === i)) p.push(p.shift());
  return p;
}
export const paNorm = s => String(s).toLowerCase().replace(/\s+/g, " ").trim();
export function paInitResp(q, modId, qi) {
  if (q.t === "multi") return [];
  if (q.t === "order") return paPerm(q.o.length, modId * 97 + qi * 13 + 1);
  if (q.t === "match") return q.p.map(() => -1);
  if (q.t === "fill") return "";
  return null;
}
export function paAnswered(q, r) {
  switch (q.t) {
    case "mcq": return r !== null && r !== undefined;
    case "tf": return typeof r === "boolean";
    case "multi": return Array.isArray(r) && r.length > 0;
    case "fill": return typeof r === "string" && r.trim() !== "";
    case "order": return Array.isArray(r);
    case "match": return Array.isArray(r) && r.every(x => x >= 0);
  }
  return false;
}
export function paGrade(q, r) {
  if (!paAnswered(q, r)) return false;
  switch (q.t) {
    case "mcq": case "tf": return r === q.a;
    case "multi": return r.length === q.a.length && q.a.every(i => r.includes(i));
    case "fill": return q.a.some(a => paNorm(a) === paNorm(r));
    case "order": case "match": return r.every((v, i) => v === i);
  }
  return false;
}
export function paAnswerText(q) {
  switch (q.t) {
    case "mcq": return q.o[q.a];
    case "tf": return q.a ? "True" : "False";
    case "multi": return q.a.map(i => q.o[i]).join(", ");
    case "fill": return q.a[0];
    case "order": return q.o.join(" → ");
    case "match": return q.p.map(([l, r]) => `${l} → ${r}`).join("; ");
  }
  return "";
}
export function paRespText(q, r) {
  if (!paAnswered(q, r) && q.t !== "order") return "Not answered";
  switch (q.t) {
    case "mcq": return q.o[r];
    case "tf": return r ? "True" : "False";
    case "multi": return r.map(i => q.o[i]).join(", ");
    case "fill": return r;
    case "order": return r.map(i => q.o[i]).join(" → ");
    case "match": return q.p.map(([l], i) => `${l} → ${q.p[r[i]][1]}`).join("; ");
  }
  return "";
}
export const paFmtTime = s => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
export const shortTitle = m => m.title.replace(/^Module \d+:\s*/, "");

/* ---------- topic practice progress (stored in this browser) ---------- */
export const paProg = () => store.get("practice:progress", {});
export const paSaveProg = all => store.set("practice:progress", all);
export function paModProg(all, id) { return all[id] || (all[id] = { qi: 0, view: "quiz", resp: {}, res: {} }); }
export function paStats(m, all = paProg()) {
  const p = all[m.id], res = p ? p.res : {};
  const checked = Object.keys(res).length, correct = Object.values(res).filter(Boolean).length;
  let status = checked ? "progress" : "new";
  if (checked === m.qs.length) status = correct >= Math.ceil(m.qs.length * PA.PASS_RATIO) ? "passed" : "retry";
  return { checked, correct, status };
}
