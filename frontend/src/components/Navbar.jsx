import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="w-9 h-9 rounded-xl bg-brand text-white font-mono text-sm font-bold flex items-center justify-center group-hover:bg-brand-600 transition-colors">
            TCI
          </span>
          <span className="font-display font-bold text-lg text-ink tracking-tight hidden sm:block">
            They Code It
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <Link to="/courses" className="px-3 py-2 text-sm font-medium text-ink/70 hover:text-brand-700 hover:bg-brand-50 rounded-lg transition-colors">Courses</Link>
          <Link to="/about" className="px-3 py-2 text-sm font-medium text-ink/70 hover:text-brand-700 hover:bg-brand-50 rounded-lg transition-colors">About</Link>
          <Link to="/contact" className="px-3 py-2 text-sm font-medium text-ink/70 hover:text-brand-700 hover:bg-brand-50 rounded-lg transition-colors">Contact</Link>
          <Link to="/verify-certificate" className="px-3 py-2 text-sm font-medium text-ink/70 hover:text-brand-700 hover:bg-brand-50 rounded-lg transition-colors">Verify Certificate</Link>
        </nav>

        <div className="flex items-center gap-3">
          {!user && (
            <>
              <Link to="/login" className="hidden sm:block text-sm font-semibold text-ink/80 hover:text-brand-700 transition-colors">
                Login
              </Link>
              <Link to="/register" className="btn-primary !py-2 !px-4">
                Get Started
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
              className="hidden sm:block text-sm font-semibold text-muted hover:text-danger transition-colors"
            >
              Logout
            </button>
          )}
          <button
            className="md:hidden p-2 text-ink/70 hover:text-brand-700"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
              {menuOpen
                ? <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
                : <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-line bg-white animate-fade-in">
          <div className="px-4 py-3 space-y-1">
            <Link to="/courses" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-ink/80 hover:bg-brand-50">Courses</Link>
            <Link to="/about" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-ink/80 hover:bg-brand-50">About</Link>
            <Link to="/contact" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-ink/80 hover:bg-brand-50">Contact</Link>
            <Link to="/verify-certificate" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-ink/80 hover:bg-brand-50">Verify Certificate</Link>
            {user && <button onClick={() => { logout(); setMenuOpen(false); navigate('/'); }} className="block w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-danger hover:bg-danger-50">Logout</button>}
          </div>
        </div>
      )}
    </header>
  );
}
