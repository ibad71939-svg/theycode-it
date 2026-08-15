import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="no-print sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-line pt-safe">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center group">
          <span className="font-display font-bold text-xl text-ink tracking-tight group-hover:opacity-90 transition-opacity">
            They{' '}
            <span style={{ color: 'rgb(5, 165, 140)' }}>Code</span>{' '}
            It
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            to="/courses"
            className="px-3 py-2 text-sm font-semibold text-ink/70 hover:text-brand-700 hover:bg-brand-50 rounded-lg transition-colors"
          >
            Courses
          </Link>

          <Link
            to="/about"
            className="px-3 py-2 text-sm font-semibold text-ink/70 hover:text-brand-700 hover:bg-brand-50 rounded-lg transition-colors"
          >
            About
          </Link>

          <Link
            to="/contact"
            className="px-3 py-2 text-sm font-semibold text-ink/70 hover:text-brand-700 hover:bg-brand-50 rounded-lg transition-colors"
          >
            Contact
          </Link>

          <Link
            to="/verify-certificate"
            className="px-3 py-2 text-sm font-semibold text-ink/70 hover:text-brand-700 hover:bg-brand-50 rounded-lg transition-colors"
          >
            Verify Certificate
          </Link>
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {!user && (
            <>
              <Link
                to="/login"
                className="hidden sm:block text-sm font-semibold text-ink/80 hover:text-brand-700 transition-colors"
              >
                Login
              </Link>

              <Link to="/register" className="btn-primary !py-2 !px-4">
                Get Started
              </Link>
            </>
          )}

          {user && user.role === 'STUDENT' && (
            <Link
              to="/student/dashboard"
              className="btn-primary !py-2 !px-4"
            >
              My Dashboard
            </Link>
          )}

          {user &&
            (user.role === 'SUPER_ADMIN' || user.role === 'REGISTRAR') && (
              <Link
                to="/admin/dashboard"
                className="btn-primary !py-2 !px-4"
              >
                Admin Panel
              </Link>
            )}

          {user && (
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="hidden sm:block text-sm font-semibold text-muted hover:text-danger transition-colors"
            >
              Logout
            </button>
          )}

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-ink/70 hover:text-brand-700"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            {menuOpen ? (
              <X className="w-6 h-6" strokeWidth={2} />
            ) : (
              <Menu className="w-6 h-6" strokeWidth={2} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {menuOpen && (
        <div className="md:hidden border-t border-line bg-white animate-fade-in">
          <div className="px-4 py-3 space-y-1">
            <Link
              to="/courses"
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-ink/80 hover:bg-brand-50"
            >
              Courses
            </Link>

            <Link
              to="/about"
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-ink/80 hover:bg-brand-50"
            >
              About
            </Link>

            <Link
              to="/contact"
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-ink/80 hover:bg-brand-50"
            >
              Contact
            </Link>

            <Link
              to="/verify-certificate"
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-ink/80 hover:bg-brand-50"
            >
              Verify Certificate
            </Link>

            {user && (
              <button
                onClick={() => {
                  logout();
                  setMenuOpen(false);
                  navigate('/');
                }}
                className="block w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-danger hover:bg-danger-50"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
