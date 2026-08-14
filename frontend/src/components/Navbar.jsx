import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-ink/10">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="w-8 h-8 rounded-md bg-ink text-mint font-mono text-sm font-semibold flex items-center justify-center group-hover:bg-brand transition-colors">
            &gt;_
          </span>
          <span className="font-display font-semibold text-lg text-ink tracking-tight">
            They Code It
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-ink/70">
          <Link to="/courses" className="hover:text-brand transition-colors">Courses</Link>
          <Link to="/about" className="hover:text-brand transition-colors">About</Link>
          <Link to="/contact" className="hover:text-brand transition-colors">Contact</Link>
          <Link to="/verify-certificate" className="hover:text-brand transition-colors font-mono text-xs uppercase tracking-wide text-muted">
            Verify Certificate
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {!user && (
            <>
              <Link to="/login" className="text-sm font-medium text-ink/70 hover:text-brand transition-colors">
                Login
              </Link>
              <Link to="/courses" className="btn-primary !py-2 !px-4">
                Enroll Now
              </Link>
            </>
          )}
          {user && user.role === 'STUDENT' && (
            <Link to="/student/dashboard" className="btn-primary !py-2 !px-4">
              My Dashboard
            </Link>
          )}
          {user && (user.role === 'SUPER_ADMIN' || user.role === 'REGISTRAR') && (
            <Link to="/admin/dashboard" className="btn-primary !py-2 !px-4">
              Admin Panel
            </Link>
          )}
          {user && (
            <button
              onClick={() => { logout(); navigate('/'); }}
              className="text-sm font-medium text-muted hover:text-danger transition-colors"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
