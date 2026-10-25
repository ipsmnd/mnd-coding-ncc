"use strict";
/* ============================================================
   DEMO AUTH & PROGRESS (browser-only; production = server)
   ============================================================ */
async function seedUsers() {
  const users = store.get("users", null);
  if (users && users.length) return;
  const mk = async (name, email, pw, role) => { const salt = uid(); return { id: uid(), name, email, role, salt, hash: await hashPw(pw, salt), created: new Date().toISOString() }; };
  const list = [await mk("Demo Student", "student@demo.mndcode.in", "Student#2026", "student"), await mk("Demo Admin", "admin@demo.mndcode.in", "Admin#2026", "admin")];
  store.set("users", list);
  const s = list[0];
  const d = n => { const x = new Date(); x.setDate(x.getDate() - n); return x.toISOString().slice(0, 10); };
  store.set("progress:" + s.id, {
    enrolled: ["networking", "cloud-computing"], bookmarks: ["networking/m3-l5"],
    done: { "networking/m1-l1": Date.now() - 5 * 864e5, "networking/m1-l2": Date.now() - 4 * 864e5, "networking/m2-l1": Date.now() - 2 * 864e5, "cloud-computing/m1-l1": Date.now() - 864e5 },
    quiz: [{ key: "networking/m1-l1", score: 2, total: 2, ts: Date.now() - 5 * 864e5 }, { key: "networking/m2-l1", score: 1, total: 2, ts: Date.now() - 2 * 864e5 }],
    activity: [d(5), d(4), d(2), d(1)], last: { course: "networking", lesson: "m2-l2" }, sample: true
  });
  audit("system", "Seeded demo accounts");
}
const currentUser = () => { const s = store.get("session", null); if (!s) return null; return store.get("users", []).find(u => u.id === s.userId) || null; };
const prog = u => store.get("progress:" + (u ? u.id : "anon"), { enrolled: [], done: {}, quiz: [], bookmarks: [], activity: [], last: null });
const saveProg = (u, p) => store.set("progress:" + u.id, p);
function touch(u, p) { const t = today(); if (!p.activity.includes(t)) p.activity.push(t); }
function streak(p) {
  const set = new Set(p.activity); let n = 0; const d = new Date();
  if (!set.has(d.toISOString().slice(0, 10))) d.setDate(d.getDate() - 1);
  while (set.has(d.toISOString().slice(0, 10))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
function audit(actor, action) { const a = store.get("audit", []); a.unshift({ ts: Date.now(), actor, action }); store.set("audit", a.slice(0, 200)); }
