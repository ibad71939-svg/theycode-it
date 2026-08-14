import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import ProgressThread from '../../components/ProgressThread';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  useEffect(() => {
    api.get('/courses').then(setCourses).catch(() => {}).finally(() => setLoadingCourses(false));
  }, []);

  return (
    <div>
      <section className="max-w-6xl mx-auto px-6 pt-16 md:pt-20 pb-20 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <span className="kicker">
            <span className="w-1.5 h-1.5 rounded-full bg-mint" />
            Computer Academy · Onsite &amp; Online
          </span>
          <h1 className="font-display text-4xl md:text-[3.25rem] leading-[1.08] font-semibold text-ink mt-5">
            Learn to code with a <span className="text-brand">structured path</span>,
            not scattered tutorials.
          </h1>
          <p className="mt-5 text-muted text-lg leading-relaxed max-w-md">
            They Code It takes you from your first line of code to a job-ready portfolio —
            with real instructors, cohort batches, and certification.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/courses" className="btn-primary">
              Browse Courses
            </Link>
            <Link to="/contact" className="btn-secondary">
              Talk to Us
            </Link>
          </div>

          <div className="mt-10 flex items-center gap-6 text-sm text-muted">
            <div>
              <p className="font-display text-xl font-semibold text-ink">{courses.length || '—'}</p>
              <p className="font-mono text-[11px] uppercase tracking-wide">Active courses</p>
            </div>
            <div className="w-px h-8 bg-ink/10" />
            <div>
              <p className="font-display text-xl font-semibold text-ink">Cohort</p>
              <p className="font-mono text-[11px] uppercase tracking-wide">Based learning</p>
            </div>
            <div className="w-px h-8 bg-ink/10" />
            <div>
              <p className="font-display text-xl font-semibold text-ink">Certified</p>
              <p className="font-mono text-[11px] uppercase tracking-wide">On completion</p>
            </div>
          </div>
        </div>

        <div className="editor-window">
          <div className="editor-titlebar">
            <span className="editor-dots">
              <span className="editor-dot bg-[#FF5F57]" />
              <span className="editor-dot bg-[#FEBC2E]" />
              <span className="editor-dot bg-[#28C840]" />
            </span>
            <span className="editor-filename">learning-path.json</span>
          </div>
          <div className="p-6">
            <p className="font-mono text-xs text-muted mb-5">
              <span className="text-brand">// </span>your progress once you enroll
            </p>
            <ProgressThread steps={['Enroll', 'Fundamentals', 'Projects', 'Certify']} currentIndex={1} />
          </div>
        </div>
      </section>

      <section className="bg-white border-y border-ink/10">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-brand-dark mb-2">01 — Curriculum</p>
              <h2 className="font-display text-2xl md:text-3xl font-semibold">Popular Courses</h2>
            </div>
            <Link to="/courses" className="hidden sm:inline text-sm font-semibold text-brand hover:text-brand-dark transition-colors">
              View all →
            </Link>
          </div>

          {loadingCourses ? (
            <LoadingSpinner fullScreen={false} />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.slice(0, 6).map((c) => (
                <Link
                  key={c.id}
                  to={`/courses/${c.slug}`}
                  className="group card p-5 hover:shadow-editor hover:border-brand/40 transition-all"
                >
                  <span className="pill text-brand-dark bg-brand-tint">
                    {c.level}
                  </span>
                  <h3 className="font-display font-semibold text-lg mt-3 group-hover:text-brand transition-colors">{c.title}</h3>
                  <p className="text-muted text-sm mt-2 line-clamp-2">{c.description}</p>
                  <div className="mt-4 pt-4 border-t border-ink/10 flex justify-between items-center text-sm">
                    <span className="text-muted font-mono text-xs">{c.durationWeeks} weeks</span>
                    <span className="font-semibold text-ink">Rs {c.fee?.toLocaleString()}</span>
                  </div>
                </Link>
              ))}
              {courses.length === 0 && <p className="text-muted">No courses available at this time.</p>}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
