export default function Field({ label, required, className = '', children }) {
  return (
    <label className={`block text-sm ${className}`}>
      <span className="block text-xs font-medium text-muted mb-1.5">
        {label}
        {required && <span className="text-danger"> *</span>}
      </span>
      {children}
    </label>
  );
}
