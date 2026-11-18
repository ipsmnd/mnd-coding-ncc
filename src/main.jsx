import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles.css";

/* Inside the Android app (Capacitor WebView) PDF downloads are unsupported, so download links are hidden via CSS */
if (window.Capacitor) document.documentElement.classList.add("in-app");

/* Old multi-page links (e.g. courses.html#/courses/networking) are redirected by the small
   HTML files in /public; this handles old short hashes like #networking. */
const SHORT = { home: "/", courses: "/courses", networking: "/courses/networking", cloud: "/courses/cloud-computing", "cloud-computing": "/courses/cloud-computing", "ethical-hacking": "/courses/ethical-hacking" };
const h = decodeURIComponent(location.hash || "");
if (/^#[\w.~-]+$/.test(h)) location.replace("#" + (SHORT[h.slice(1)] || "/" + h.slice(1)));

createRoot(document.getElementById("root")).render(<StrictMode><App /></StrictMode>);
