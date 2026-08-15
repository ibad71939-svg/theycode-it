import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Field from '../../components/Field';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.email || !form.password) {
      setError('Please enter your email and password.');
      return;
    }
    if (!EMAIL_RE.test(form.email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setSubmitting(true);
    try {
      const user = await login(form.email, form.password);
      const redirectTo = location.state?.redirectTo;
      if (redirectTo) navigate(redirectTo);
      else if (user.role === 'STUDENT') navigate('/student/dashboard');
      else navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message === 'Invalid login credentials' ? 'Incorrect email or password.' : err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 gradient-mesh">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="inline-flex w-12 h-12 rounded-xl bg-brand text-white font-mono text-base font-bold items-center justify-center mb-4">
            TCI
          </span>
          <h1 className="font-display text-2xl md:text-3xl font-bold mb-1">Welcome back</h1>
          <p className="text-muted text-sm">Login to access your student or admin portal.</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-7 space-y-4">
          <Field label="Email" required>
            <input name="email" required type="email" placeholder="you@example.com" className="field-input"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
          <Field label="Password" required>
            <input name="password" required type="password" placeholder="Password" className="field-input"
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </Field>
          <div className="text-right -mt-2">
            <Link to="/forgot-password" className="text-xs text-brand-700 font-medium hover:underline">Forgot password?</Link>
          </div>

          {error && <p className="text-danger text-sm bg-danger-50 px-3 py-2 rounded-lg">{error}</p>}

          <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-60">
            {submitting ? 'Logging in…' : 'Login'}
          </button>
        </form>

        <p className="text-sm text-muted mt-5 text-center">
          New here? <Link to="/register" className="text-brand-700 font-semibold">Create an account</Link>
        </p>
        <Link to="/" className="block text-center text-xs text-muted mt-3 hover:text-brand-700">← Back to home</Link>
      </div>
    </div>
  );
}