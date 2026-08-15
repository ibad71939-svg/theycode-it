// Same alternation idea as CourseCard.jsx: 4 identical cards in a row (all
// card-tint) reads as flat/monotone even though the tint itself isn't pure
// white. Cycling 3 treatments gives the grid real visual rhythm instead.
const THEMES = [
  { card: 'card-tint', iconBg: 'bg-brand text-white', title: 'text-ink', desc: 'text-muted' },
  { card: 'bg-white border-2 border-ink/10 rounded-card', iconBg: 'bg-ink text-white', title: 'text-ink', desc: 'text-muted' },
  { card: 'card-dark', iconBg: 'bg-brand text-white', title: 'text-white', desc: 'text-white/65' },
];

export default function FeatureCard({ icon, title, desc, index = 0 }) {
  const t = THEMES[index % THEMES.length];
  return (
    <div className={`${t.card} p-6 hover:-translate-y-1 hover:shadow-hover hover:border-brand transition-all duration-200`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${t.iconBg}`}>
        {icon}
      </div>
      <h3 className={`font-display font-bold text-lg mb-2 ${t.title}`}>{title}</h3>
      <p className={`text-sm leading-relaxed ${t.desc}`}>{desc}</p>
    </div>
  );
}
