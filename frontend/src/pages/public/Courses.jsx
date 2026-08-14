import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/courses')
      .then(setCourses)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner fullScreen={false} />;

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <p className="kicker mb-5">
        <span className="w-1.5 h-1.5 rounded-full bg-mint" />
        Curriculum
      </p>
      <h1 className="font-display text-3xl md:text-4xl font-semibold mb-3">Our Courses</h1>
      <p className="text-muted mb-12 max-w-xl">
        Explore our structured, cohort-based learning programs designed to take you from
        fundamentals to job-ready skills.
      </p>

      {courses.length === 0 ? (
        <p className="text-muted text-center py-8">No courses available at this time.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((c) => (
            <Link key={c.id} to={`/courses/${c.slug}`} className="group card p-6 hover:border-brand hover:shadow-editor transition-all">
              <span className="pill text-brand-dark bg-brand-tint">{c.level}</span>
              <h2 className="font-display text-lg font-semibold mt-3 mb-2 group-hover:text-brand transition-colors">{c.title}</h2>
              <p className="text-sm text-muted mb-4 line-clamp-2">{c.description}</p>

              <div className="space-y-2 text-sm font-mono text-xs">
                <p><span className="text-muted">duration:</span> <span className="font-medium text-ink">{c.durationWeeks}wk</span></p>
                <p><span className="text-muted">fee:</span> <span className="font-medium text-brand-dark">Rs {c.fee?.toLocaleString()}</span></p>
                {c.category && <p><span className="text-muted">category:</span> <span className="font-medium text-ink">{c.category.name}</span></p>}
              </div>

              <div className="mt-4 pt-4 border-t border-ink/10">
                <p className="text-xs text-muted mb-2">{c.batches?.length || 0} batch{c.batches?.length !== 1 ? 'es' : ''} available</p>
                <button className="btn-primary w-full">
                  View Course
                </button>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
