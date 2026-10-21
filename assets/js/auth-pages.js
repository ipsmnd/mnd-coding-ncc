"use strict";
/* ============================================================
   AUTH PAGES
   ============================================================ */
const authCard = inner => `<section class="section"><div class="wrap" style="max-width:480px"><div class="card stack" style="gap:20px;padding:clamp(22px,4vw,36px)">${inner}</div></div></section>`;
const pwRule = v => v.length >= 8 && /[a-z]/.test(v) && /[A-Z]/.test(v) && /\d/.test(v);
route("/login", (_, user) => {
  if (user) return { html: "", init: () => navigate(user.role === "admin" ? "/admin" : "/dashboard", { replace: true }) };
  return {
    title: "Sign In", desc: "Sign in to your MND CODE student account.",
    html: authCard(`<div class="stack" style="gap:8px;text-align:center;align-items:center">${LOGO}<h1 style="font-size:var(--t-xl)">Welcome back</h1><p class="small muted">Sign in to continue learning.</p></div>
   <div class="alert alert-warn">${icon("info")}<div class="small"><strong>Demo mode.</strong> Accounts live only in this browser. Try <button class="btn btn-quiet btn-sm" type="button" data-demo="student" style="height:auto;padding:0 4px;color:var(--cyan)">demo student</button> or <button class="btn btn-quiet btn-sm" type="button" data-demo="admin" style="height:auto;padding:0 4px;color:var(--cyan)">demo admin</button>.</div></div>
   <form class="stack" id="lf" novalidate><div class="field"><label for="l-email">Email</label><input class="input" id="l-email" type="email" autocomplete="username" required></div>
   <div class="field"><label for="l-pw">Password</label><input class="input" id="l-pw" type="password" autocomplete="current-password" required></div>
   <div id="l-st" aria-live="polite"></div><button class="btn btn-primary btn-lg" type="submit" id="l-btn">Sign in</button></form>
   <p class="small muted" style="text-align:center">New to MND CODE? <a href="#/register">Create an account</a></p>`),
    init: () => {
      $$("[data-demo]").forEach(b => b.onclick = () => { const a = b.dataset.demo === "admin"; $("#l-email").value = a ? "admin@demo.mndcode.in" : "student@demo.mndcode.in"; $("#l-pw").value = a ? "Admin#2026" : "Student#2026"; $("#l-pw").focus(); });
      $("#lf").onsubmit = async e => {
        e.preventDefault(); const st = $("#l-st"), em = $("#l-email").value.trim().toLowerCase(), pw = $("#l-pw").value;
        const lock = store.get("loginLock", { n: 0, until: 0 });
        if (lock.until > Date.now()) { st.innerHTML = `<div class="alert alert-bad">${icon("lock")}<span>Too many attempts. Try again in ${Math.ceil((lock.until - Date.now()) / 1000)} seconds.</span></div>`; return; }
        if (!em || !pw) { st.innerHTML = `<div class="alert alert-bad">${icon("alert")}<span>Enter your email and password.</span></div>`; return; }
        const b = $("#l-btn"); b.disabled = true; b.innerHTML = `<span class="spinner"></span>Signing in…`;
        await sleep(400);
        const u = store.get("users", []).find(x => x.email === em);
        const ok = u && (await hashPw(pw, u.salt)) === u.hash;
        b.disabled = false; b.textContent = "Sign in";
        if (!ok) { lock.n++; if (lock.n >= 5) { lock.until = Date.now() + 30000; lock.n = 0; } store.set("loginLock", lock); st.innerHTML = `<div class="alert alert-bad">${icon("alert")}<span>That email and password don't match an account. Check both and try again.</span></div>`; return; }
        store.set("loginLock", { n: 0, until: 0 }); store.set("session", { userId: u.id, ts: Date.now() });
        audit(u.email, "Signed in"); toast(`Signed in as ${u.name}`); renderFooter();
        const nx = qparam("next"); navigate(nx && nx.startsWith("/") ? nx : u.role === "admin" ? "/admin" : "/dashboard");
      };
    }
  };
});
route("/register", (_, user) => {
  if (user) return { html: "", init: () => navigate("/dashboard", { replace: true }) };
  return {
    title: "Create Account", desc: "Create a free MND CODE student account.",
    html: authCard(`<div class="stack" style="gap:8px;text-align:center;align-items:center">${LOGO}<h1 style="font-size:var(--t-xl)">Create your account</h1><p class="small muted">Track progress, quiz results and bookmarks.</p></div>
   <form class="stack" id="rf" novalidate>
    <div class="field"><label for="r-name">Full name</label><input class="input" id="r-name" autocomplete="name" maxlength="80"><span class="err" id="re-name"></span></div>
    <div class="field"><label for="r-email">Email</label><input class="input" id="r-email" type="email" autocomplete="email" maxlength="120"><span class="err" id="re-email"></span></div>
    <div class="field"><label for="r-pw">Password</label><input class="input" id="r-pw" type="password" autocomplete="new-password" aria-describedby="r-pwh"><span class="hint" id="r-pwh">At least 8 characters with upper- and lower-case letters and a number.</span><span class="err" id="re-pw"></span></div>
    <div class="field"><label for="r-pw2">Confirm password</label><input class="input" id="r-pw2" type="password" autocomplete="new-password"><span class="err" id="re-pw2"></span></div>
    <label class="row small" style="flex-wrap:nowrap;align-items:flex-start;gap:10px"><input type="checkbox" id="r-ok" style="margin-top:4px;accent-color:#22D3EE"><span>I agree to the <a href="#/terms">terms</a>, including practising security techniques only on systems I own or am authorized to test.</span></label><span class="err" id="re-ok"></span>
    <div id="r-st" aria-live="polite"></div><button class="btn btn-primary btn-lg" type="submit" id="r-btn">Create account</button>
    <p class="xs dim">Demo: your account is stored only in this browser, with the password saved as a salted hash.</p>
   </form><p class="small muted" style="text-align:center">Already registered? <a href="#/login">Sign in</a></p>`),
    init: () => {
      $("#rf").onsubmit = async e => {
        e.preventDefault();
        const f = { name: $("#r-name").value.trim(), email: $("#r-email").value.trim().toLowerCase(), pw: $("#r-pw").value, pw2: $("#r-pw2").value, ok: $("#r-ok").checked };
        const users = store.get("users", []);
        const errs = { name: f.name.length < 2 ? "Enter your name." : "", email: !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email) ? "Enter a valid email address." : users.some(u => u.email === f.email) ? "An account with this email already exists. Sign in instead." : "", pw: !pwRule(f.pw) ? "Use at least 8 characters with upper- and lower-case letters and a number." : "", pw2: f.pw !== f.pw2 ? "Passwords don't match." : "", ok: !f.ok ? "Please accept the terms to continue." : "" };
        Object.entries(errs).forEach(([k, v]) => { $("#re-" + k).textContent = v; const inp = $("#r-" + k); if (inp && inp.type !== "checkbox") inp.setAttribute("aria-invalid", !!v); });
        if (Object.values(errs).some(Boolean)) { $("#rf [aria-invalid=true]")?.focus(); return; }
        const b = $("#r-btn"); b.disabled = true; b.innerHTML = `<span class="spinner"></span>Creating…`;
        const salt = uid(); const u = { id: uid(), name: f.name, email: f.email, role: "student", salt, hash: await hashPw(f.pw, salt), created: new Date().toISOString() };
        users.push(u); store.set("users", users); store.set("session", { userId: u.id, ts: Date.now() });
        audit(u.email, "Registered account"); toast("Account created. Welcome to MND CODE!"); navigate("/dashboard");
      };
    }
  };
});

const sideToggle = (id, kicker, label, ic = "menu") => `<button class="side-toggle" type="button" aria-expanded="false" aria-controls="${id}" data-side-toggle><span class="row" style="gap:12px;flex-wrap:nowrap;min-width:0">${icon(ic, "icon", 'style="color:var(--cyan)"')}<span style="min-width:0"><small>${kicker}</small><span style="display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(label)}</span></span></span>${icon("chev", "icon chev")}</button>`;
document.addEventListener("click", e => {
  const t = e.target.closest("[data-side-toggle]"); if (!t) return;
  const nav = document.getElementById(t.getAttribute("aria-controls")); const open = !nav.classList.contains("open");
  nav.classList.toggle("open", open); t.setAttribute("aria-expanded", open);
  if (open) { const a = nav.querySelector(".active"); if (a) a.scrollIntoView({ block: "nearest" }); }
});
document.addEventListener("keydown", e => { if (e.key !== "Escape") return; const n = document.querySelector(".side.open"); if (n) { n.classList.remove("open"); const t = document.querySelector(`[aria-controls="${n.id}"]`); t.setAttribute("aria-expanded", "false"); t.focus(); } });
