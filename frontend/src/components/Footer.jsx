import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-ink text-white/60 mt-24">
      <div className="max-w-6xl mx-auto px-6 py-12 grid sm:grid-cols-2 md:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-7 h-7 rounded-md bg-white/10 text-mint font-mono text-xs font-semibold flex items-center justify-center">
              &gt;_
            </span>
            <span className="font-display font-semibold text-white text-base">They Code It</span>
          </div>
          <p className="text-sm leading-relaxed max-w-xs">
            A computer academy for structured, cohort-based learning — from your first line
            of code to a job-ready portfolio.
          </p>
        </div>

        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-white/40 mb-3">Academy</p>
          <ul className="space-y-2 text-sm">
            <li><Link to="/courses" className="hover:text-white transition-colors">Courses</Link></li>
            <li><Link to="/about" className="hover:text-white transition-colors">About</Link></li>
            <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
          </ul>
        </div>

        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-white/40 mb-3">Account</p>
          <ul className="space-y-2 text-sm">
            <li><Link to="/login" className="hover:text-white transition-colors">Login</Link></li>
            <li><Link to="/register" className="hover:text-white transition-colors">Register</Link></li>
            <li><Link to="/verify-certificate" className="hover:text-white transition-colors">Verify Certificate</Link></li>
          </ul>
        </div>

        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-white/40 mb-3">Status</p>
          <p className="text-sm font-mono flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-mint cursor-blink" />
            Admissions open
          </p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-5 text-xs text-white/40 flex flex-col sm:flex-row justify-between gap-2">
          <span>© {new Date().getFullYear()} They Code It. All rights reserved.</span>
          <span className="font-mono">built with // care</span>
        </div>
      </div>
    </footer>
  );
}
