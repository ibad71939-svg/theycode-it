import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [levelFilter, setLevelFilter] = useState('all');

  useEffect(() => {
    api.get('/courses')
      .then(setCourses)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const levels = ['all', 'Beginner', 'Beginner to Intermediate', 'Advanced'];
  const filtered = levelFilter === 'all' ? courses : courses.filter((c) => c.level === levelFilter);

  if (loading) return <LoadingSpinner fullScreen={false} />;

  return (
    <div>
      {/* Header */}
      <section className="gradient-mesh border-b border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
          <span className="kicker mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-mint-400" />
            Curriculum
          </span>
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-3">Our Courses</h1>
          <p className="text-muted text-lg max-w-xl">
            Explore our structured, cohort-based learning programs designed to take you from
            fundamentals to job-ready skills.
          </p>
        </div>
      </section>

      {/* Filters + Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-wrap gap-2 mb-8">
          {levels.map((l) => (
            <button
              key={l}
              onClick={() => setLevelFilter(l)}
              className={`text-sm font-semibold px-4 py-2 rounded-full border transition-all ${
                levelFilter === l
                  ? 'bg-brand text-white border-brand'
                  : 'bg-white border-line text-muted hover:border-brand-300 hover:text-brand-700'
              }`}
            >
              {l === 'all' ? 'All Levels' : l}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted text-lg">No courses available at this time.</p>
            <Link to="/contact" className="inline-block mt-4 text-brand-700 font-semibold hover:text-brand-600">Contact us to be notified →</Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((c) => (
              <Link key={c.id} to={`/courses/${c.slug}`} className="group card-hover p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="pill text-brand-700 bg-brand-50">{c.level}</span>
                  <span className="font-mono text-xs text-muted">{c.durationWeeks} weeks</span>
                </div>
                <h2 className="font-display font-bold text-xl mb-2 group-hover:text-brand-700 transition-colors">{c.title}</h2>
                <p className="text-sm text-muted mb-5 line-clamp-2">{c.description}</p>

                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted">Fee</span>
                    <span className="font-display font-bold text-brand-700">Rs {c.fee?.toLocaleString()}</span>
                  </div>
                  {c.category && (
                    <div className="flex justify-between">
                      <span className="text-muted">Category</span>
                      <span className="font-medium text-ink">{c.category.name}</span>
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-4 border-t border-line flex justify-between items-center">
                  <p className="text-xs text-muted">{c.batches?.length || 0} batch{c.batches?.length !== 1 ? 'es' : ''} available</p>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 group-hover:gap-2 transition-all">
                    View Course
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M7.3 5.3a1 1 0 011.4 0l4 4a1 1 0 010 1.4l-4 4a1 1 0 01-1.4-1.4L10.6 10 7.3 6.7a1 1 0 010-1.4z" /></svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
