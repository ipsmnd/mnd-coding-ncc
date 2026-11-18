/* ============================================================
   MND CODE — site configuration and shared helpers.
   Edit SITE below. Null values are hidden on the site.
   ============================================================ */
export const SITE = {
  name: "MND CODE",
  company: "MND CODE Pvt Ltd",
  domain: "MNDCODE.in",
  url: "https://mndcode.in",
  established: "01 April 2023",
  tagline: "Connect. Compute. Secure.",
  headline: "Build Your Future in Networking, Cloud & Cybersecurity.",
  // Configure verified contact details here (null = not shown on the site).
  contact: { email: null, phone: null, address: null, hours: null },
  // Add real profile URLs only, e.g. { label: "LinkedIn", url: "https://…" }
  social: [],
  announcement: { enabled: true, label: "New", text: "The interactive lab now includes 10 browser-based exercises — subnetting to report writing.", link: "/labs", linkText: "Open the lab" }
};

export const DEFAULT_TITLE = "MND CODE — Networking, Cloud & Cybersecurity Academy";

/* ---------- small utilities ---------- */
export const slug = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
export const today = () => new Date().toISOString().slice(0, 10);
export const fmtDate = d => new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
export const fmtDT = d => new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
export const sleep = ms => new Promise(r => setTimeout(r, ms));
export const reducedMotion = () => typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
export const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/* Storage: browser-only demo persistence with in-memory fallback */
const MEM = {};
export const store = {
  get(k, d) { try { const v = localStorage.getItem("mnd:" + k); return v == null ? (k in MEM ? MEM[k] : d) : JSON.parse(v); } catch { return k in MEM ? MEM[k] : d; } },
  set(k, v) { MEM[k] = v; try { localStorage.setItem("mnd:" + k, JSON.stringify(v)); } catch { /* storage blocked */ } },
  del(k) { delete MEM[k]; try { localStorage.removeItem("mnd:" + k); } catch { /* storage blocked */ } }
};

/* Password hashing (demo: browser only; production hashes on the server with argon2/bcrypt) */
export async function hashPw(pw, salt) {
  const data = new TextEncoder().encode(salt + ":" + pw);
  try {
    const buf = await crypto.subtle.digest("SHA-256", data);
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
  } catch {
    let h = 2166136261; for (const b of data) { h ^= b; h = Math.imul(h, 16777619); } return "f" + (h >>> 0).toString(16);
  }
}
