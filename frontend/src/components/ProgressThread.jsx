// Signature brand element: a thin thread that visually connects steps,
// used in registration flow, curriculum timelines, and dashboard milestones.
export default function ProgressThread({ steps, currentIndex }) {
  return (
    <div className="flex items-center w-full">
      {steps.map((step, i) => (
        <div key={step} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-semibold border-2 transition-colors ${
                i <= currentIndex
                  ? 'bg-brand border-brand text-white'
                  : 'bg-white border-ink/15 text-muted'
              }`}
            >
              {i + 1}
            </div>
            <span className={`mt-2 text-xs text-center ${i <= currentIndex ? 'text-ink font-medium' : 'text-muted'}`}>
              {step}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className="flex-1 h-[2px] mx-2 mb-5 relative overflow-hidden bg-ink/10">
              <div
                className="absolute inset-y-0 left-0 bg-brand transition-all duration-500"
                style={{ width: i < currentIndex ? '100%' : '0%' }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
