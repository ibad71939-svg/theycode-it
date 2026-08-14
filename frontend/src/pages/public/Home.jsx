import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import ProgressThread from '../../components/ProgressThread';
import LoadingSpinner from '../../components/LoadingSpinner';

const HERO_IMG = 'https://images.pexels.com/photos/5530437/pexels-photo-5530437.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6">
        <path d="M12 14l9-5-9-5-9 5 9 5z" strokeLinejoin="round" />
        <path d="M12 14l6.16-3.42a12 12 0 01.34 5.84L12 20l-6.5-3.58a12 12 0 01.34-5.84L12 14z" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Cohort-Based Learning',
    desc: 'Learn in structured batches with peers, not alone. Real schedules, real deadlines, real progress.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6">
        <path d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 100-8 4 4 0 000 8z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Real Instructors',
    desc: 'Every batch is led by an experienced instructor who reviews your work and answers your questions.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6">
        <path d="M9 12l2 2 4-4m5.62-1.16a10 10 0 11-5.62 5.62" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Verified Certificates',
    desc: 'Complete your course and earn a certificate with a unique verification code employers can check.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6">
        <path d="M3 7h18M3 12h18M3 17h18" strokeLinecap="round" />
      </svg>
    ),
    title: 'Onsite & Online',
    desc: 'Choose the mode that fits your life — attend in person at our campus or join batches online.',
  },
];

const STEPS = [
  { num: '01', title: 'Browse & Enroll', desc: 'Pick a course, choose a batch that fits your schedule, and submit your enrollment.' },
  { num: '02', title: 'Get Approved', desc: 'Our admissions team reviews your application and confirms your seat in the cohort.' },
  { num: '03', title: 'Learn & Build', desc: 'Attend sessions, complete assignments, and build real projects with instructor support.' },
  { num: '04', title: 'Get Certified', desc: 'Finish the course and receive a verifiable certificate to showcase your skills.' },
];

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  useEffect(() => {
    api.get('/courses').then(setCourses).catch(() => {}).finally(() => setLoadingCourses(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden gradient-mesh">
        <div className="absolute inset-0 hero-grid opacity-50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-16 md:pt-24 pb-20 grid md:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-up">
            <span className="kicker">
              <span className="w-1.5 h-1.5 rounded-full bg-mint-400" />
              Computer Academy · Onsite & Online
            </span>
            <h1 className="font-display text-4xl md:text-[3.5rem] leading-[1.08] font-bold text-ink mt-5 tracking-tight">
              Learn to code with a <span className="text-brand">structured path</span>, not scattered tutorials.
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

            <div className="mt-12 flex items-center gap-6 text-sm">
              <div>
                <p className="font-display text-2xl font-bold text-ink">{courses.length || '—'}</p>
                <p className="font-mono text-[11px] uppercase tracking-wide text-muted">Active courses</p>
              </div>
              <div className="w-px h-10 bg-line" />
              <div>
                <p className="font-display text-2xl font-bold text-ink">Cohort</p>
                <p className="font-mono text-[11px] uppercase tracking-wide text-muted">Based learning</p>
              </div>
              <div className="w-px h-10 bg-line" />
              <div>
                <p className="font-display text-2xl font-bold text-ink">Certified</p>
                <p className="font-mono text-[11px] uppercase tracking-wide text-muted">On completion</p>
              </div>
            </div>
          </div>

          <div className="relative animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <div className="relative rounded-xl2 overflow-hidden shadow-hover">
              <img
                src={HERO_IMG}
                alt="Students learning in a computer classroom"
                className="w-full h-[360px] md:h-[420px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 bg-white/95 backdrop-blur rounded-card p-4 shadow-card">
                <p className="font-mono text-xs text-brand-600 mb-1">// your learning path</p>
                <ProgressThread steps={['Enroll', 'Fundamentals', 'Projects', 'Certify']} currentIndex={1} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white border-y border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="text-center mb-12">
            <p className="section-eyebrow mb-2">Why They Code It</p>
            <h2 className="font-display text-2xl md:text-3xl font-bold">A learning experience designed for outcomes</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="card p-6 hover:shadow-card transition-all duration-200">
                <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="font-display font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Courses */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="section-eyebrow mb-2">01 — Curriculum</p>
            <h2 className="font-display text-2xl md:text-3xl font-bold">Popular Courses</h2>
          </div>
          <Link to="/courses" className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-600 transition-colors">
            View all
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M7.3 5.3a1 1 0 011.4 0l4 4a1 1 0 010 1.4l-4 4a1 1 0 01-1.4-1.4L10.6 10 7.3 6.7a1 1 0 010-1.4z" /></svg>
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
                className="group card-hover p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="pill text-brand-700 bg-brand-50">{c.level}</span>
                  <span className="font-mono text-xs text-muted">{c.durationWeeks} weeks</span>
                </div>
                <h3 className="font-display font-bold text-lg mb-2 group-hover:text-brand-700 transition-colors">{c.title}</h3>
                <p className="text-muted text-sm mb-4 line-clamp-2">{c.description}</p>
                <div className="pt-4 border-t border-line flex justify-between items-center">
                  <span className="text-xs text-muted">{c.batches?.length || 0} batches available</span>
                  <span className="font-display font-bold text-ink">Rs {c.fee?.toLocaleString()}</span>
                </div>
              </Link>
            ))}
            {courses.length === 0 && <p className="text-muted">No courses available at this time.</p>}
          </div>
        )}
      </section>

      {/* How It Works */}
      <section className="bg-ink text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="text-center mb-12">
            <p className="font-mono text-xs uppercase tracking-wider text-brand-300 mb-2">02 — Process</p>
            <h2 className="font-display text-2xl md:text-3xl font-bold">How it works</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((s) => (
              <div key={s.num} className="relative">
                <p className="font-mono text-3xl font-bold text-brand-400 mb-3">{s.num}</p>
                <h3 className="font-display font-bold text-lg mb-2">{s.title}</h3>
                <p className="text-sm text-white/60 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="relative overflow-hidden rounded-xl2 bg-gradient-to-br from-brand-600 to-brand-800 p-10 md:p-14 text-center">
          <div className="absolute inset-0 hero-grid opacity-10" />
          <div className="relative">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-3">Ready to start your coding journey?</h2>
            <p className="text-white/80 mb-6 max-w-lg mx-auto">Browse our courses, pick a batch, and enroll today. Our admissions team will confirm your seat.</p>
            <Link to="/courses" className="inline-flex items-center gap-2 bg-white text-brand-700 font-semibold px-6 py-3 rounded-card hover:bg-brand-50 transition-colors">
              Browse Courses
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M7.3 5.3a1 1 0 011.4 0l4 4a1 1 0 010 1.4l-4 4a1 1 0 01-1.4-1.4L10.6 10 7.3 6.7a1 1 0 010-1.4z" /></svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
