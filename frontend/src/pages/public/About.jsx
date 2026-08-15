import { Link } from 'react-router-dom';
import { ShieldCheck, Users, Layers, Award } from 'lucide-react';
import FeatureCard from '../../components/FeatureCard';

const valueIconProps = { className: 'w-6 h-6', strokeWidth: 1.8 };

const VALUES = [
  {
    icon: <ShieldCheck {...valueIconProps} />,
    title: 'Outcomes over attendance',
    desc: 'We measure a batch by what students can build at the end of it, not by how many hours were logged.',
  },
  {
    icon: <Users {...valueIconProps} />,
    title: 'Small, real cohorts',
    desc: 'Batches stay small enough that instructors know every student by name and where they\u2019re stuck.',
  },
  {
    icon: <Layers {...valueIconProps} />,
    title: 'Industry-current curriculum',
    desc: 'Course material is revised against what employers are actually hiring for, not what\u2019s easy to teach.',
  },
  {
    icon: <Award {...valueIconProps} />,
    title: 'Certification that means something',
    desc: 'Every certificate is verifiable and tied to a real project portfolio, not a participation stamp.',
  },
];

const STATS = [
  { value: '500+', label: 'Students trained' },
  { value: '12+', label: 'Courses offered' },
  { value: '20+', label: 'Instructors' },
  { value: '90%', label: 'Completion rate' },
];

const TEAM = [
  { name: 'Ayesha Khan', role: 'Founder & Lead Instructor', focus: 'Full-Stack Development' },
  { name: 'Bilal Ahmed', role: 'Head of Curriculum', focus: 'Data & Backend Systems' },
  { name: 'Hira Malik', role: 'Student Success Lead', focus: 'Career Placement' },
];

export default function About() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden section-dark">
        <div className="absolute inset-0 gradient-mesh-dark" />
        <div className="absolute inset-0 hero-grid opacity-[0.06]" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center">
          <span className="kicker !bg-brand mb-5">About the academy</span>
          <h1 className="font-display text-3xl md:text-5xl font-bold mt-4 mb-5">
            We teach code like it's a craft, not a checklist.
          </h1>
          <p className="text-white/70 text-lg leading-relaxed max-w-2xl mx-auto">
            They Code It is a computer academy built around structured, cohort-based learning \u2014
            taking students from fundamentals to job-ready skills through onsite and online batches,
            real instructors, and certification that actually holds up.
          </p>
        </div>
      </section>

      {/* Stats strip */}
      <section className="bg-white border-b-2 border-brand-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display text-3xl md:text-4xl font-bold text-brand-700">{s.value}</p>
              <p className="font-mono text-[11px] uppercase tracking-wide text-muted mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Story */}
      <section>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="section-eyebrow mb-2">Our story</p>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-ink mb-5">
              Started in a classroom with ten students and one whiteboard.
            </h2>
            <div className="space-y-4 text-muted leading-relaxed">
              <p>
                They Code It started because too many bootcamps were selling certificates instead of skills.
                We set out to build something smaller and more deliberate: real batches, real instructors in
                the room, and a curriculum that gets rewritten every time the industry moves.
              </p>
              <p>
                Today we run onsite and online cohorts across multiple tracks, but the model hasn't changed \u2014
                small groups, real projects, and instructors who are still writing code professionally, not
                just teaching from slides.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/courses" className="btn-primary">Explore Courses</Link>
              <Link to="/contact" className="btn-secondary">Get in Touch</Link>
            </div>
          </div>
          <div className="card-dark p-8">
            <p className="font-mono text-xs text-brand-300 mb-4">// what we optimize for</p>
            <ul className="space-y-4">
              {[
                'Students who can ship a real project on day one of the job',
                'Instructors who are practitioners first, teachers second',
                'Cohorts small enough that nobody falls through the cracks',
              ].map((line) => (
                <li key={line} className="flex gap-3 text-sm text-white/80 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand mt-2 shrink-0" />
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-white border-y-2 border-brand-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="text-center mb-12">
            <p className="section-eyebrow mb-2">What we stand for</p>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-ink">The values behind every batch</h2>
            <div className="divider-brand mx-auto mt-4" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((v, i) => (
              <div key={v.title} className={`animate-fade-up stagger-${i + 1}`}>
                <FeatureCard icon={v.icon} title={v.title} desc={v.desc} index={i} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-brand-600 to-brand-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center">
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">Ready to start your cohort?</h2>
          <p className="text-white/80 mb-8 max-w-xl mx-auto">
            Browse our current tracks and find a batch that fits your schedule and goals.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/courses" className="btn bg-white text-brand-700 hover:bg-brand-50">Browse Courses</Link>
            <Link to="/contact" className="btn-outline-light">Contact Us</Link>
          </div>
        </div>
      </section>
    </div>
  );
}