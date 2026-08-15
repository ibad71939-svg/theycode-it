import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import CourseCard from '../../components/CourseCard';

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
              className={`text-sm font-semibold px-4 py-2 rounded-full border-2 transition-all ${
                levelFilter === l
                  ? 'bg-brand text-white border-brand'
                  : 'bg-white border-ink/10 text-muted hover:border-brand hover:text-brand-700'
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
            {filtered.map((c, i) => (
              <CourseCard key={c.id} course={c} index={i} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
