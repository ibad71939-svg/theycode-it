export default function LoadingSpinner({
  fullScreen = true,
  size = 'lg',
  label = 'Loading…',
  textColor,
}) {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const textSizeMap = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const resolvedTextColor = textColor || (fullScreen ? 'text-white' : 'text-brand-dark');

  return (
    <div
      className={
        fullScreen
          ? 'fixed inset-0 bg-ink/60 backdrop-blur-sm flex items-center justify-center z-50'
          : 'flex items-center justify-center py-8'
      }
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-4">
        <div className={`relative ${sizeMap[size] || sizeMap.lg}`}>
          <div className="absolute inset-0 rounded-full border-4 border-current/20 opacity-60" />
          <div
            className="absolute inset-0 rounded-full border-4 border-transparent border-t-current border-r-current animate-spin"
            style={{
              animationDuration: '1s',
            }}
          ></div>
        </div>
        <p className={`font-medium ${textSizeMap[size] || textSizeMap.lg} ${resolvedTextColor}`}>
          {label}
        </p>
      </div>
    </div>
  );
}
