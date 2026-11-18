# MND CODE Academy — React version

The MND CODE site (networking, cloud and cybersecurity academy) rebuilt as a **React** app with **Vite** and **React Router**.
Every page, lab, quiz, dashboard and admin screen from the original HTML/JavaScript site has been rewritten as React components. It looks and works the same.

## Run it

You need [Node.js](https://nodejs.org) 18 or newer.

```bash
npm install        # first time only
npm run dev        # local development server at http://localhost:5173
npm run build      # production build into dist/
npm run preview    # preview the production build
```

Upload the contents of **`dist/`** to any static host (Vercel, Netlify, GitHub Pages, cPanel, etc.). No server setup is needed.
URLs use the hash style (`/#/courses/networking`), so the site works on any host and inside the Android app.
Old links such as `courses.html#/courses/networking` are forwarded to the new pages automatically.

**Demo logins** (stored only in the visitor's browser):
- Student: `student@demo.mndcode.in` / `Student#2026`
- Admin: `admin@demo.mndcode.in` / `Admin#2026`

## Content protection

`src/components/ContentProtection.jsx` blocks text copying, right-click, image saving/dragging, printing, and the
view-source / save / devtools shortcuts. It also blurs the page when the PrintScreen key is pressed or when the window
loses focus (for example, when a snipping tool opens). Form fields and the lab terminal still work normally.

- Turn it all off: set `PROTECTION_ENABLED = false`.
- Stop the blur when the window loses focus: set `BLUR_ON_FOCUS_LOSS = false`.
- Let people copy one area: add `className="allow-copy"` to it.

No website can fully stop screenshots (phone cameras, some OS tools and browser extensions still work). This makes copying harder; it doesn't guarantee it.

## Where things are

| Path | What it holds |
|---|---|
| `src/App.jsx` | Routes, page layout, sign-in guards |
| `src/lib/config.js` | **Site settings (`SITE`)**: company name, contact details, announcement bar |
| `src/lib/courseData.js` | All course, lesson, project, blog, FAQ and resource content |
| `src/lib/practiceBank.js` | Practice Arena question bank (33 topics, 132 questions) |
| `src/lib/data.js`, `src/lib/auth.js` | Course data with admin edits, demo accounts and progress |
| `src/components/` | Header, footer, search, dialogs, searchable select, shared UI, protection |
| `src/pages/` | Every page; `labs/`, `practice/`, `dashboard/` and `admin/` have their own folders |
| `src/styles.css` | The site's styles (unchanged from the original) |
| `public/projects/` | Project guide PDFs |
| `app/` | Android app files; `build-apk.py` now bundles `dist/` |
| `legacy/` | The old standalone `mock-test.html` and `original-single-file.html`, kept for reference only (not part of the build) |

## Android app

```bash
npm run build
python app/build-apk.py
```

This needs Java (`keytool`) on your PATH, as before.

## Note on the demo backend

Accounts, progress, contact messages and admin changes are saved in the visitor's browser (localStorage), just like the
original site. A production launch needs a real server for accounts and data.
