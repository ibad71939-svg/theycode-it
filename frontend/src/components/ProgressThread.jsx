// Signature brand element: a thin thread that visually connects steps,
// used in registration flow, curriculum timelines, and dashboard milestones.
export default function ProgressThread({ steps, currentIndex }) {
  return (
    <div className="flex items-center w-full">
      {steps.map((step, i) => (
        <div key={step} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-mono font-bold border-2 transition-all duration-300 ${
                i <= currentIndex
                  ? 'bg-brand border-brand text-white shadow-sm'
                  : 'bg-white border-line text-muted'
              }`}
            >
              {i < currentIndex ? (
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 011.4-1.4l3.8 3.8 6.8-6.8a1 1 0 011.4 0z" clipRule="evenodd" />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            <span className={`mt-2 text-xs text-center font-medium ${i <= currentIndex ? 'text-ink' : 'text-muted'}`}>
              {step}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className="flex-1 h-[2px] mx-2 mb-5 relative overflow-hidden bg-line rounded-full">
              <div
                className="absolute inset-y-0 left-0 bg-brand transition-all duration-500 rounded-full"
                style={{ width: i < currentIndex ? '100%' : '0%' }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
