import { useEffect } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Icon } from "../components/Icon.jsx";
import { Html, PageHead, usePageMeta } from "../components/ui.jsx";
import { POSTS } from "../lib/data.js";
import { fmtDate } from "../lib/config.js";
import { NotFound } from "./System.jsx";

const PER = 3;

export function Blog() {
  usePageMeta("Blog", "Tutorials and explainers on networking, cloud and security from MND CODE.");
  const [params] = useSearchParams();
  const pages = Math.ceil(POSTS.length / PER);
  const page = Math.min(Math.max(1, +(params.get("page") || 1)), pages);
  const list = POSTS.slice((page - 1) * PER, page * PER);
  useEffect(() => { window.scrollTo({ top: 0 }); }, [page]);
  return (
    <>
      <PageHead eyebrow="Blog" title="Notes from the lab." lead="Explainers and tutorials on networking, cloud and security." crumbs={[["Home", "/"], ["Blog", ""]]} />
      <section className="section-tight" style={{ paddingBottom: "clamp(56px,8vw,104px)" }}><div className="wrap">
        <div className="grid g3">{list.map(p => (
          <Link key={p.slug} className="card card-link stack reveal" to={"/blog/" + p.slug} style={{ color: "var(--text)", textDecoration: "none", gap: 12 }}>
            <div className="row"><span className="chip chip-cyan">{p.tag}</span><span className="xs dim">{fmtDate(p.date)} · {p.read} min read</span></div>
            <h3 style={{ fontSize: "var(--t-md)" }}>{p.title}</h3><p className="small muted">{p.excerpt}</p><span className="course-foot">Read article <Icon name="arrow" /></span>
          </Link>
        ))}</div>
        <nav className="row" aria-label="Pagination" style={{ marginTop: 32, justifyContent: "center" }}>
          {page > 1 && <Link className="btn btn-ghost btn-sm" to={`/blog?page=${page - 1}`}><Icon name="left" />Newer</Link>}
          {Array.from({ length: pages }, (_, i) => <Link key={i} className={`btn ${i + 1 === page ? "btn-primary" : "btn-ghost"} btn-sm`} to={`/blog?page=${i + 1}`} aria-current={i + 1 === page ? "page" : undefined}>{i + 1}</Link>)}
          {page < pages && <Link className="btn btn-ghost btn-sm" to={`/blog?page=${page + 1}`}>Older <Icon name="arrow" /></Link>}
        </nav>
      </div></section>
    </>
  );
}

export function BlogPost() {
  const { slug } = useParams();
  const p = POSTS.find(x => x.slug === slug);
  usePageMeta(p ? p.title : "Page not found", p && p.excerpt);
  if (!p) return <NotFound />;
  const others = POSTS.filter(x => x !== p).slice(0, 2);
  return (
    <>
      <PageHead eyebrow={p.tag} title={p.title} lead={p.excerpt} crumbs={[["Home", "/"], ["Blog", "/blog"], [p.title, ""]]}>
        <p className="small dim" style={{ marginTop: 16 }}>{fmtDate(p.date)} · {p.read} min read · MND CODE</p>
      </PageHead>
      <section className="section-tight"><div className="wrap"><Html as="article" className="prose" html={p.body} /></div></section>
      <section className="section-tight" style={{ paddingBottom: "clamp(56px,8vw,104px)" }}><div className="wrap">
        <div className="sec-head" style={{ marginBottom: 20 }}><span className="eyebrow">Keep reading</span></div>
        <div className="grid g2">{others.map(o => (
          <Link key={o.slug} className="card card-link" to={"/blog/" + o.slug} style={{ color: "var(--text)", textDecoration: "none" }}><span className="chip chip-cyan">{o.tag}</span><h4 style={{ margin: "12px 0 6px" }}>{o.title}</h4><p className="small muted">{o.excerpt}</p></Link>
        ))}</div>
      </div></section>
    </>
  );
}
