import { Link } from 'react-router-dom';

// Alternates 3 card treatments across a grid so course listings don't read
// as flat white-on-white. Cycles by index — every 3rd card is white/bordered,
// tint, or dark, in that order.
const THEMES = [
  { card: 'card-tint-hover', title: 'text-ink group-hover:text-brand-700', muted: 'text-ink/60', accent: 'text-brand-700', border: 'border-brand-200' },
  { card: 'card-hover', title: 'text-ink group-hover:text-brand-700', muted: 'text-muted', accent: 'text-brand-700', border: 'border-ink/10' },
  { card: 'card-dark-hover', title: 'text-white group-hover:text-mint-300', muted: 'text-white/60', accent: 'text-mint-300', border: 'border-white/15' },
];

export default function CourseCard({ course, index = 0, compact = false }) {
  const t = THEMES[index % THEMES.length];

  return (
    <Link to={`/courses/${course.slug}`} className={`group ${t.card} ${compact ? 'p-5' : 'p-6'}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="pill-solid">{course.level}</span>
        <span className={`font-mono text-xs ${t.muted}`}>{course.durationWeeks} weeks</span>
      </div>
      <h3 className={`font-display font-bold text-lg mb-2 transition-colors ${t.title}`}>{course.title}</h3>
      <p className={`text-sm mb-4 line-clamp-2 ${t.muted}`}>{course.description}</p>
      <div className={`pt-4 border-t-2 flex justify-between items-center ${t.border}`}>
        <span className={`text-xs ${t.muted}`}>
          {course.batches?.length || 0} batch{course.batches?.length !== 1 ? 'es' : ''} available
        </span>
        <span className={`font-display font-bold ${t.accent}`}>Rs {course.fee?.toLocaleString()}</span>
      </div>
    </Link>
  );
}
