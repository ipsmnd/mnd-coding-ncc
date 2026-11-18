import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Icon } from "../components/Icon.jsx";
import { Select } from "../components/Select.jsx";
import { CourseCard, PageHead, usePageMeta } from "../components/ui.jsx";
import { getCourses } from "../lib/data.js";

const LEVELS = ["Beginner", "Intermediate", "Advanced"];
const DURATIONS = [{ value: "", label: "Any length" }, { value: "0-40", label: "Up to 40 hours" }, { value: "40-50", label: "40–50 hours" }, { value: "50-999", label: "More than 50 hours" }];

export default function Courses() {
  usePageMeta("All Courses", "Browse MND CODE courses in networking, cloud computing and ethical hacking. Filter by category, difficulty and estimated duration.");
  const [params] = useSearchParams();
  const cs = getCourses();
  const cats = [...new Set(cs.map(c => c.category))];
  const fromUrl = () => ({ q: params.get("q") || "", c: cats.includes(params.get("cat")) ? params.get("cat") : "", l: "", d: "" });
  const [f, setF] = useState(fromUrl);
  useEffect(() => { setF(fromUrl()); }, [params]); // eslint-disable-line react-hooks/exhaustive-deps
  const set = (k, v) => setF(s => ({ ...s, [k]: v }));
  const reset = () => setF({ q: "", c: "", l: "", d: "" });

  const q = f.q.toLowerCase().trim(), [lo, hi] = f.d ? f.d.split("-").map(Number) : [0, 1e9];
  const list = cs.filter(x => (!f.c || x.category === f.c) && (!f.l || x.level === f.l) && x.hours >= lo && x.hours <= hi &&
    (!q || q.split(/\s+/).every(w => [x.title, x.category, x.level, x.short, ...x.modules.map(m => m.title + " " + m.topics.join(" "))].join(" ").toLowerCase().includes(w))));

  return (
    <>
      <PageHead eyebrow="All courses" title="Choose where to start." lead="Filter by category, difficulty and estimated duration. Every course page lists its full curriculum." crumbs={[["Home", "/"], ["Courses", ""]]} />
      <section className="section-tight"><div className="wrap">
        <form className="filters" onSubmit={e => e.preventDefault()}>
          <div className="field"><label htmlFor="fq">Search</label><input className="input" id="fq" type="search" placeholder="e.g. subnet, VPC, Linux" value={f.q} onChange={e => set("q", e.target.value)} /></div>
          <div className="field"><label htmlFor="fc">Category</label><Select id="fc" value={f.c} onChange={v => set("c", v)} options={[{ value: "", label: "All categories" }, ...cats]} /></div>
          <div className="field"><label htmlFor="fl">Difficulty</label><Select id="fl" value={f.l} onChange={v => set("l", v)} options={[{ value: "", label: "All levels" }, ...LEVELS]} /></div>
          <div className="field"><label htmlFor="fd">Estimated duration</label><Select id="fd" value={f.d} onChange={v => set("d", v)} options={DURATIONS} /></div>
          <button className="btn btn-quiet" type="button" onClick={reset}><Icon name="reset" />Reset</button>
        </form>
        <p className="small muted" aria-live="polite">{list.length} of {cs.length} courses</p>
        <div className="grid g3" style={{ marginTop: 16 }}>
          {list.length ? list.map(x => <CourseCard key={x.slug} c={x} />) : (
            <div className="empty" style={{ gridColumn: "1/-1" }}><Icon name="search" /><strong>No courses match these filters.</strong><span className="small">Try a broader search or reset the filters.</span><button className="btn btn-ghost btn-sm" type="button" onClick={reset}>Reset filters</button></div>
          )}
        </div>
      </div></section>
    </>
  );
}
