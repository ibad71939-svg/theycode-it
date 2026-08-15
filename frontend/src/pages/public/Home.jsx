import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Users, ShieldCheck, ListChecks, ArrowRight } from 'lucide-react';
import { api } from '../../lib/api';
import ProgressThread from '../../components/ProgressThread';
import CourseCard from '../../components/CourseCard';
import FeatureCard from '../../components/FeatureCard';
import { SkeletonCardGrid } from '../../components/Skeleton';

const HERO_IMG = 'https://images.pexels.com/photos/5530437/pexels-photo-5530437.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

const iconProps = { className: 'w-6 h-6', strokeWidth: 1.8 };

const FEATURES = [
  {
    icon: <GraduationCap {...iconProps} />,
    title: 'Cohort-Based Learning',
    desc: 'Learn in structured batches with peers, not alone. Real schedules, real deadlines, real progress.',
  },
  {
    icon: <Users {...iconProps} />,
    title: 'Real Instructors',
    desc: 'Every batch is led by an experienced instructor who reviews your work and answers your questions.',
  },
  {
    icon: <ShieldCheck {...iconProps} />,
    title: 'Verified Certificates',
    desc: 'Complete your course and earn a certificate with a unique verification code employers can check.',
  },
  {
    icon: <ListChecks {...iconProps} />,
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
    api.get('/courses')
      .then((result) => setCourses(Array.isArray(result) ? result : []))
      .catch(() => {})
      .finally(() => setLoadingCourses(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden gradient-mesh">
        <div className="absolute inset-0 hero-grid opacity-[0.06]" />
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

            <div className="mt-12 flex items-center gap-3 text-sm">
              <div className="bg-ink text-white rounded-card px-4 py-3">
                <p className="font-display text-2xl font-bold">{courses.length || '—'}</p>
                <p className="font-mono text-[11px] uppercase tracking-wide text-white/60">Active courses</p>
              </div>
              <div className="bg-brand text-white rounded-card px-4 py-3">
                <p className="font-display text-2xl font-bold">Cohort</p>
                <p className="font-mono text-[11px] uppercase tracking-wide text-white/80">Based learning</p>
              </div>
              <div className="bg-ink text-white rounded-card px-4 py-3">
                <p className="font-display text-2xl font-bold">Certified</p>
                <p className="font-mono text-[11px] uppercase tracking-wide text-white/60">On completion</p>
              </div>
            </div>
          </div>

          <div className="relative animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <div className="relative rounded-xl2 overflow-hidden shadow-hover border-4 border-white">
              <img
                src={HERO_IMG}
                alt="Students learning in a computer classroom"
                className="w-full h-[360px] md:h-[420px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 bg-white/95 backdrop-blur rounded-card p-4 shadow-card border-2 border-white">
                <p className="font-mono text-xs text-brand-600 mb-1">// your learning path</p>
                <ProgressThread steps={['Enroll', 'Fundamentals', 'Projects', 'Certify']} currentIndex={1} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white border-y-2 border-brand-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="text-center mb-12">
            <p className="section-eyebrow mb-2">Why They Code It</p>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-ink">A learning experience designed for outcomes</h2>
            <div className="divider-brand mx-auto mt-4" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f, i) => (
              <div key={f.title} className={`animate-fade-up stagger-${i + 1}`}>
                <FeatureCard icon={f.icon} title={f.title} desc={f.desc} index={i} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Courses */}
      <section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="section-eyebrow mb-2">01 — Curriculum</p>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-ink">Popular Courses</h2>
              <div className="divider-brand mt-4" />
            </div>
            <Link to="/courses" className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-ink hover:bg-brand rounded-full px-4 py-2 transition-colors">
              View all
              <ArrowRight className="w-4 h-4" strokeWidth={2.25} />
            </Link>
          </div>

          {loadingCourses ? (
            <SkeletonCardGrid count={6} />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.slice(0, 6).map((c, i) => (
                <div key={c.id} className={`animate-fade-up stagger-${Math.min(i + 1, 8)}`}>
                  <CourseCard course={c} index={i} compact />
                </div>
              ))}
              {courses.length === 0 && <p className="text-muted">No courses available at this time.</p>}
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="relative section-dark overflow-hidden">
        <div className="absolute inset-0 gradient-mesh-dark" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="text-center mb-12">
            <span className="kicker !bg-brand mb-2">02 — Process</span>
            <h2 className="font-display text-2xl md:text-3xl font-bold mt-4">How it works</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((s, i) => (
              <div key={s.num} className={`relative bg-white/5 border border-white/10 rounded-card p-5 hover:bg-white/10 hover:border-brand/50 transition-colors animate-fade-up stagger-${i + 1}`}>
                <div className="w-11 h-11 rounded-full bg-brand text-white font-mono text-sm font-bold flex items-center justify-center mb-4">
                  {s.num}
                </div>
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
              <ArrowRight className="w-4 h-4" strokeWidth={2.25} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}