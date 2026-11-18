/* ============================================================
   LINUX LAB — a safe simulated shell with six tasks.
   Output lines are built as escaped HTML strings so the
   colouring (errors, prompts, matches) matches the original.
   ============================================================ */
import { useEffect, useRef, useState } from "react";
import { Icon } from "../../components/Icon.jsx";
import { SimNote } from "./NetworkLabs.jsx";

const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const makeFS = () => ({
  "/": { d: 1, c: ["home", "var", "etc"] }, "/home": { d: 1, c: ["student"] }, "/home/student": { d: 1, c: ["notes.txt", "secret.txt", ".bashrc", "scripts"] },
  "/home/student/notes.txt": { f: "Lab reminder: only test machines on the 10.10.0.0/24 lab network.\nTake a snapshot before every exercise.", m: "644" },
  "/home/student/secret.txt": { f: "synthetic-api-key-for-practice-only", m: "644" }, "/home/student/.bashrc": { f: "# shell settings\nalias ll='ls -la'", m: "644" },
  "/home/student/scripts": { d: 1, c: ["backup.sh"] }, "/home/student/scripts/backup.sh": { f: "#!/bin/bash\ntar -czf /tmp/notes.tgz ~/notes.txt", m: "755" },
  "/var": { d: 1, c: ["log"] }, "/var/log": { d: 1, c: ["auth.log", "syslog"] },
  "/var/log/auth.log": { f: "Oct 19 09:01:12 lab sshd[811]: Accepted publickey for student from 10.10.0.5\nOct 19 09:14:40 lab sshd[902]: Failed password for invalid user admin from 10.10.0.99\nOct 19 09:14:44 lab sshd[902]: Failed password for invalid user admin from 10.10.0.99\nOct 19 09:20:03 lab sudo: student : COMMAND=/usr/bin/apt update", m: "640" },
  "/var/log/syslog": { f: "Oct 19 09:00:01 lab systemd[1]: Started Daily apt download activities.", m: "640" },
  "/etc": { d: 1, c: ["hostname"] }, "/etc/hostname": { f: "mnd-lab", m: "644" }
});

function Terminal({ onReset }) {
  const sh = useRef(null);
  if (!sh.current) sh.current = { FS: makeFS(), cwd: "/home/student", hist: [], hi: 0 };
  const S = sh.current;
  const [lines, setLines] = useState([{ h: `<span class="dim">MND CODE simulated shell. Nothing here runs on a real system. Type 'help' to start.</span>` }]);
  const [done, setDone] = useState(() => new Set());
  const [val, setVal] = useState("");
  const out = useRef(null), inp = useRef(null);
  useEffect(() => { if (out.current) out.current.scrollTop = out.current.scrollHeight; }, [lines]);

  const TASKS = [
    ["Print your current directory", c => /^pwd$/.test(c)],
    ["List all files in your home, including hidden ones", c => /^ls\s+(-la|-al|-a|-l?a\w*)/.test(c)],
    ["Read notes.txt", c => (/^cat\s+(\.\/|~\/|\/home\/student\/)?notes\.txt$/.test(c) && S.cwd === "/home/student") || /^cat\s+\/home\/student\/notes\.txt$/.test(c)],
    ["Find failed logins in /var/log/auth.log", c => /^grep\s+(-i\s+)?["']?failed["']?\s+\/var\/log\/auth\.log$/i.test(c)],
    ["Make secret.txt readable only by you (owner read/write)", () => S.FS["/home/student/secret.txt"].m === "600"],
    ["Create a directory called reports in your home", () => !!S.FS["/home/student/reports"]]
  ];
  const prompt = () => `student@mnd-lab:${S.cwd.replace("/home/student", "~")}$`;
  const resolveP = p => { if (!p || p === "~") return "/home/student"; if (p.startsWith("~/")) p = "/home/student/" + p.slice(2); const parts = (p.startsWith("/") ? p : S.cwd + "/" + p).split("/"); const st = []; for (const x of parts) { if (!x || x === ".") continue; if (x === "..") st.pop(); else st.push(x); } return "/" + st.join("/"); };
  const permStr = (m, d) => (d ? "d" : "-") + m.split("").map(n => { n = +n; return (n & 4 ? "r" : "-") + (n & 2 ? "w" : "-") + (n & 1 ? "x" : "-"); }).join("");
  const FS = S.FS;
  const CMDS = {
    help: () => "Available: pwd, ls [-a] [-l] [path], cd [path], cat file, grep [-i] pattern file, chmod mode file, mkdir dir, touch file, whoami, id, hostname, uname -a, ip a, ss -tulpn, ps, echo text, history, clear",
    pwd: () => S.cwd, whoami: () => "student", id: () => "uid=1000(student) gid=1000(student) groups=1000(student),27(sudo)", hostname: () => FS["/etc/hostname"].f, uname: a => a[0] === "-a" ? "Linux mnd-lab 6.8.0-lab #1 SMP x86_64 GNU/Linux (simulated)" : "Linux",
    ls: a => { const fl = a.filter(x => x.startsWith("-")).join(""), arg = a.find(x => !x.startsWith("-")), p = resolveP(arg), n = FS[p]; if (!n) return `<span class="e">ls: cannot access '${esc(arg)}': No such file or directory</span>`; if (!n.d) return esc(p.split("/").pop()); let items = n.c.filter(x => fl.includes("a") || !x.startsWith(".")); if (fl.includes("a")) items = [".", "..", ...items]; if (fl.includes("l")) return items.map(x => { const q = FS[x === "." ? p : x === ".." ? resolveP(p + "/..") : p.replace(/\/$/, "") + "/" + x] || { d: 1 }; return `${permStr(q.m || "755", q.d)} 1 student student ${String(q.f ? q.f.length : 4096).padStart(5)} Oct 19 09:30 <span class="${q.d ? "s" : ""}">${esc(x)}</span>`; }).join("\n"); return items.map(x => { const q = FS[p.replace(/\/$/, "") + "/" + x]; return q && q.d ? `<span class="s">${esc(x)}</span>` : esc(x); }).join("  "); },
    cd: a => { const p = resolveP(a[0]); if (!FS[p]) return `<span class="e">cd: ${esc(a[0])}: No such file or directory</span>`; if (!FS[p].d) return `<span class="e">cd: ${esc(a[0])}: Not a directory</span>`; S.cwd = p; return ""; },
    cat: a => { if (!a[0]) return '<span class="e">cat: missing file operand</span>'; const p = resolveP(a[0]), n = FS[p]; if (!n) return `<span class="e">cat: ${esc(a[0])}: No such file or directory</span>`; if (n.d) return `<span class="e">cat: ${esc(a[0])}: Is a directory</span>`; return esc(n.f); },
    grep: a => { const ci = a[0] === "-i"; if (ci) a = a.slice(1); if (a.length < 2) return '<span class="e">usage: grep [-i] pattern file</span>'; const pat = a[0].replace(/^["']|["']$/g, ""), p = resolveP(a[1]), n = FS[p]; if (!n || n.d) return `<span class="e">grep: ${esc(a[1])}: No such file</span>`; const ls = n.f.split("\n").filter(l => (ci ? l.toLowerCase().includes(pat.toLowerCase()) : l.includes(pat))); return ls.length ? ls.map(l => esc(l).replace(new RegExp(esc(pat).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), ci ? "gi" : "g"), m => `<span class="e">${m}</span>`)).join("\n") : ""; },
    chmod: a => { if (a.length < 2 || !/^[0-7]{3}$/.test(a[0])) return '<span class="e">chmod: use a three-digit numeric mode, e.g. chmod 600 file (this simulator supports numeric modes)</span>'; const p = resolveP(a[1]); if (!FS[p]) return `<span class="e">chmod: cannot access '${esc(a[1])}': No such file or directory</span>`; FS[p].m = a[0]; return ""; },
    mkdir: a => { if (!a[0]) return '<span class="e">mkdir: missing operand</span>'; const p = resolveP(a[0]), par = resolveP(p + "/.."); if (FS[p]) return `<span class="e">mkdir: cannot create directory '${esc(a[0])}': File exists</span>`; if (!FS[par] || !FS[par].d) return '<span class="e">mkdir: parent directory does not exist</span>'; FS[p] = { d: 1, c: [], m: "755" }; FS[par].c.push(p.split("/").pop()); return ""; },
    touch: a => { if (!a[0]) return '<span class="e">touch: missing file operand</span>'; const p = resolveP(a[0]), par = resolveP(p + "/.."); if (!FS[p]) { if (!FS[par]) return '<span class="e">touch: no such directory</span>'; FS[p] = { f: "", m: "644" }; FS[par].c.push(p.split("/").pop()); } return ""; },
    echo: a => esc(a.join(" ").replace(/^["']|["']$/g, "")), history: () => S.hist.map((h, i) => `${String(i + 1).padStart(4)}  ${esc(h)}`).join("\n"),
    ip: a => a[0] === "a" || a[0] === "addr" ? "1: lo: inet 127.0.0.1/8\n2: eth0: inet 10.10.0.20/24 brd 10.10.0.255 (simulated lab address)" : "usage: ip a",
    ss: () => "Netid State  Local Address:Port\ntcp   LISTEN 0.0.0.0:22\ntcp   LISTEN 127.0.0.1:5432", ps: () => "  PID TTY      CMD\n  811 ?        sshd\n 1204 pts/0    bash\n 1290 pts/0    ps",
    clear: () => null, sudo: () => '<span class="e">sudo is disabled in this simulator. Practise privilege use on your own lab VM.</span>'
  };

  const run = raw => {
    const c = raw.trim();
    let next = [...lines, { h: `<span class="p">${esc(prompt())}</span> ${esc(c)}` }];
    if (c) {
      S.hist.push(c); S.hi = S.hist.length;
      const [cmd, ...args] = c.split(/\s+/);
      if (cmd === "clear") next = [];
      else { const fn = CMDS[cmd]; const r = fn ? fn(args) : `<span class="e">${esc(cmd)}: command not found. Type 'help' for the list.</span>`; if (r) next.push({ h: r }); }
      const nd = new Set(done);
      TASKS.forEach(([t, test], i) => { if (!nd.has(i) && test(c)) { nd.add(i); next.push({ h: `<span class="s">✓ Task ${i + 1} complete: ${t}</span>` }); } });
      if (nd.size === TASKS.length && done.size !== TASKS.length) next.push({ h: `<span class="s">All tasks complete. Well done.</span>` });
      setDone(nd);
    }
    setLines(next);
  };

  return (
    <>
      <div className="lab-pane">
        <div className="stack">
          <h3 style={{ fontSize: "var(--t-md)" }}>Tasks</h3>
          <ol className="step-log">{TASKS.map(([t], i) => (
            <li key={i} className={done.has(i) ? "on" : ""}>{done.has(i) ? <Icon name="check" style={{ color: "var(--ok)", width: 15, height: 15, verticalAlign: -3 }} /> : <span className="mono xs dim">{i + 1}.</span>} {t}</li>
          ))}</ol>
          <p className="xs dim">Type <code>help</code> for available commands. Use ↑ / ↓ for history.</p>
          <button className="btn btn-ghost btn-sm" type="button" style={{ alignSelf: "flex-start" }} onClick={onReset}><Icon name="reset" />Reset terminal</button>
        </div>
        <div className="terminal">
          <div className="term-bar"><i /><i /><i />&nbsp; student@mnd-lab — simulated shell</div>
          <div className="term-out allow-copy" ref={out} aria-live="polite" onClick={() => inp.current && inp.current.focus()}>
            {lines.map((l, k) => <div key={k} dangerouslySetInnerHTML={{ __html: l.h }} />)}
          </div>
          <form className="term-in" onSubmit={e => { e.preventDefault(); run(val); setVal(""); }}>
            <span>{prompt()}</span><label htmlFor="lx-i" className="sr-only">Command</label>
            <input id="lx-i" ref={inp} autoComplete="off" spellCheck="false" autoCapitalize="off" value={val} onChange={e => setVal(e.target.value)}
              onKeyDown={e => {
                if (e.key === "ArrowUp" && S.hi > 0) { S.hi--; setVal(S.hist[S.hi]); e.preventDefault(); }
                if (e.key === "ArrowDown") { S.hi = Math.min(S.hist.length, S.hi + 1); setVal(S.hist[S.hi] || ""); e.preventDefault(); }
              }} />
          </form>
        </div>
      </div>
      <SimNote />
    </>
  );
}

export function LinuxLab() {
  const [k, setK] = useState(0);
  return <Terminal key={k} onReset={() => setK(k + 1)} />;
}
