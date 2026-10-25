"use strict";
/* ============================================================
   DATA ACCESS (merges admin edits stored in this browser)
   ============================================================ */
function getCourses() {
  const ov = store.get("admin:courses", {});
  const extra = store.get("admin:extraLessons", {});
  const status = store.get("admin:lessonStatus", {});
  const custom = store.get("admin:customCourses", []);
  const all = [...BASE_COURSES.map(c => ({ ...c, custom: false })), ...custom.map(c => ({ ...c, custom: true }))];
  return all.filter(c => !(ov[c.slug] && ov[c.slug].deleted)).map(c => {
    const o = ov[c.slug] || {};
    const course = { ...c, ...o };
    course.modules = (c.modules || []).map((m, mi) => {
      const lessons = m.topics.map((t, li) => ({ key: `${c.slug}/m${mi + 1}-l${li + 1}`, id: `m${mi + 1}-l${li + 1}`, title: t, custom: false }))
        .concat(((extra[c.slug] || {})[mi] || []).map((x, xi) => ({ key: `${c.slug}/m${mi + 1}-x${xi + 1}`, id: `m${mi + 1}-x${xi + 1}`, title: x.title, body: x.body, custom: true })));
      lessons.forEach(l => { l.status = status[l.key] || "published"; l.module = mi; l.minutes = LESSONS[l.key]?.minutes || (m.project ? 90 : 35); l.authored = !!LESSONS[l.key] || l.custom; });
      return { ...m, index: mi, lessons };
    });
    course.allLessons = course.modules.flatMap(m => m.lessons);
    course.lessons = course.allLessons.filter(l => l.status === "published");
    course.hours = Math.max(1, Math.round(course.lessons.reduce((a, l) => a + l.minutes, 0) / 60));
    course.route = "/courses/" + c.slug;
    return course;
  });
}
const findCourse = s => getCourses().find(c => c.slug === s);
const findLesson = (c, id) => c && c.lessons.find(l => l.id === id);
const authoredCount = c => c.lessons.filter(l => l.authored).length;
