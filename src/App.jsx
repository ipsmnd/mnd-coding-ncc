/* ============================================================
   APP — routes and page layout.
   HashRouter keeps URLs like  #/courses/networking  so the site
   works on any static host and inside the Android app.
   ============================================================ */
import { Component, useEffect, useRef } from "react";
import { HashRouter, Navigate, Route, Routes, useLocation, Link } from "react-router-dom";
import { AppProvider, useApp } from "./components/AppContext.jsx";
import { Header } from "./components/Header.jsx";
import { Announcement, BackToTop, Footer, SearchPalette } from "./components/Shell.jsx";
import { ContentProtection } from "./components/ContentProtection.jsx";
import { Icon } from "./components/Icon.jsx";
import { usePageMeta } from "./components/ui.jsx";
import { reducedMotion } from "./lib/config.js";

import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import Courses from "./pages/Courses.jsx";
import CourseDetail from "./pages/CourseDetail.jsx";
import LearningPaths from "./pages/LearningPaths.jsx";
import Projects from "./pages/Projects.jsx";
import ProjectGuide from "./pages/ProjectGuide.jsx";
import Resources from "./pages/Resources.jsx";
import { Blog, BlogPost } from "./pages/Blog.jsx";
import Faq from "./pages/Faq.jsx";
import Contact from "./pages/Contact.jsx";
import { Privacy, Terms } from "./pages/Legal.jsx";
import Labs from "./pages/labs/Labs.jsx";
import Practice from "./pages/practice/Practice.jsx";
import Lesson from "./pages/Lesson.jsx";
import { Login, Register } from "./pages/Auth.jsx";
import { DashOverview, DashCourses, DashProgress, DashSettings } from "./pages/dashboard/Dashboard.jsx";
import { AdminOverview } from "./pages/admin/AdminOverview.jsx";
import { AdminCourses } from "./pages/admin/AdminCourses.jsx";
import { AdminLessons } from "./pages/admin/AdminLessons.jsx";
import { AdminStudents } from "./pages/admin/AdminStudents.jsx";
import { AdminMessages } from "./pages/admin/AdminMessages.jsx";
import { NotFound, AuthWall } from "./pages/System.jsx";

/* Pages that need a signed-in student, or an admin */
function Guard({ need = "student", children }) {
  const { user } = useApp();
  const { pathname, search } = useLocation();
  if (!user) return <AuthWall path={pathname + search} need={need} />;
  if (need === "admin" && user.role !== "admin") return <AuthWall path={pathname + search} need="admin" />;
  return children;
}

class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  componentDidUpdate(prev) { if (prev.resetKey !== this.props.resetKey && this.state.error) this.setState({ error: null }); }
  render() {
    if (!this.state.error) return this.props.children;
    return <ErrorPage error={this.state.error} retry={() => this.setState({ error: null })} />;
  }
}
function ErrorPage({ error, retry }) {
  usePageMeta("Something went wrong");
  return (
    <section className="section"><div className="wrap" style={{ maxWidth: 640 }}>
      <div className="alert alert-bad"><Icon name="alert" /><div><strong>This page failed to load.</strong><p className="small" style={{ marginTop: 6 }}>Reload the page or go back. If it keeps happening, tell us through the contact page. Details: {error && error.message}</p></div></div>
      <div className="row" style={{ marginTop: 20 }}><Link className="btn btn-primary" to="/">Go home</Link><button className="btn btn-ghost" type="button" onClick={retry}>Try again</button></div>
    </div></section>
  );
}

/* Per-route effects: scroll to top, scroll-reveal animation, stacked tables on phones */
function useRouteEffects(mainRef) {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, [pathname]);
  useEffect(() => {
    if (reducedMotion() || !("IntersectionObserver" in window)) return;
    const obs = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.remove("pre"); obs.unobserve(en.target); } }), { rootMargin: "0px 0px -8% 0px" });
    const t = setTimeout(() => {
      document.querySelectorAll(".reveal").forEach(el => { const r = el.getBoundingClientRect(); if (r.top > innerHeight) { el.classList.add("pre"); obs.observe(el); } });
    }, 30);
    return () => { clearTimeout(t); obs.disconnect(); document.querySelectorAll(".reveal.pre").forEach(el => el.classList.remove("pre")); };
  }, [pathname]);
  useEffect(() => {
    const main = mainRef.current; if (!main) return;
    let t;
    const label = () => main.querySelectorAll(".table-wrap table").forEach(tb => {
      const ths = [...tb.querySelectorAll("thead th")].map(th => th.textContent.trim());
      if (ths.length < 3) return;
      tb.classList.add("table-stack");
      tb.querySelectorAll("tbody tr").forEach(tr => tr.querySelectorAll("td").forEach((td, i) => { if (!td.hasAttribute("data-label")) td.setAttribute("data-label", ths[i] || ""); }));
    });
    const mo = new MutationObserver(() => { clearTimeout(t); t = setTimeout(label, 30); });
    mo.observe(main, { childList: true, subtree: true }); label();
    return () => { mo.disconnect(); clearTimeout(t); };
  }, [mainRef]);
}

function Layout() {
  const mainRef = useRef(null);
  const { pathname } = useLocation();
  useRouteEffects(mainRef);
  return (
    <>
      <a className="skip" href="#main" onClick={e => { e.preventDefault(); mainRef.current && mainRef.current.focus(); }}>Skip to content</a>
      <div className="bg-grid" aria-hidden="true" />
      <Announcement />
      <Header />
      <main id="main" tabIndex={-1} ref={mainRef}>
        <div className="page-enter" key={pathname}>
          <ErrorBoundary resetKey={pathname}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/courses/:slug" element={<CourseDetail />} />
              <Route path="/learning-paths" element={<LearningPaths />} />
              <Route path="/projects" element={<Guard><Projects /></Guard>} />
              <Route path="/projects/:slug" element={<Guard><ProjectGuide /></Guard>} />
              <Route path="/resources" element={<Guard><Resources /></Guard>} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/faq" element={<Faq />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/labs" element={<Labs />} />
              <Route path="/practice" element={<Guard><Practice /></Guard>} />
              <Route path="/learn" element={<Navigate to="/courses" replace />} />
              <Route path="/learn/:course/:lesson" element={<Lesson />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<Guard><DashOverview /></Guard>} />
              <Route path="/dashboard/courses" element={<Guard><DashCourses /></Guard>} />
              <Route path="/dashboard/progress" element={<Guard><DashProgress /></Guard>} />
              <Route path="/dashboard/settings" element={<Guard><DashSettings /></Guard>} />
              <Route path="/admin" element={<Guard need="admin"><AdminOverview /></Guard>} />
              <Route path="/admin/courses" element={<Guard need="admin"><AdminCourses /></Guard>} />
              <Route path="/admin/lessons" element={<Guard need="admin"><AdminLessons /></Guard>} />
              <Route path="/admin/students" element={<Guard need="admin"><AdminStudents /></Guard>} />
              <Route path="/admin/messages" element={<Guard need="admin"><AdminMessages /></Guard>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ErrorBoundary>
        </div>
      </main>
      <Footer />
      <SearchPalette />
      <BackToTop />
      <ContentProtection />
    </>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AppProvider>
        <Layout />
      </AppProvider>
    </HashRouter>
  );
}
