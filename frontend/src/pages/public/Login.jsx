import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Field from '../../components/Field';

export default function Login() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const user = mode === 'login' ? await login(form.email, form.password) : await register(form);
      const redirectTo = location.state?.redirectTo;
      if (redirectTo) navigate(redirectTo);
      else if (user.role === 'STUDENT') navigate('/student/dashboard');
      else navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 gradient-mesh">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="inline-flex w-12 h-12 rounded-xl bg-brand text-white font-mono text-base font-bold items-center justify-center mb-4">
            TCI
          </span>
          <h1 className="font-display text-2xl md:text-3xl font-bold mb-1">
            {mode === 'login' ? 'Welcome back' : 'Create your student account'}
          </h1>
          <p className="text-muted text-sm">
            {mode === 'login' ? 'Login to access your student or admin portal.' : 'Register to start applying for courses.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card p-7 space-y-4">
          {mode === 'register' && (
            <Field label="Full name" required>
              <input name="name" required placeholder="Full name" className="field-input"
                value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
          )}
          <Field label="Email" required>
            <input name="email" required type="email" placeholder="Email" className="field-input"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
          {mode === 'register' && (
            <Field label="Phone (optional)">
              <input name="phone" placeholder="Phone (optional)" className="field-input"
                value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </Field>
          )}
          <Field label="Password" required>
            <input name="password" required type="password" placeholder="Password" className="field-input"
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </Field>

          {error && <p className="text-danger text-sm bg-danger-50 px-3 py-2 rounded-lg">{error}</p>}

          <button type="submit" className="btn-primary w-full">
            {mode === 'login' ? 'Login' : 'Create Account'}
          </button>
        </form>

        <p className="text-sm text-muted mt-5 text-center">
          {mode === 'login' ? (
            <>New here? <Link to="/register" className="text-brand-700 font-semibold">Create an account</Link></>
          ) : (
            <>Already have an account? <Link to="/login" className="text-brand-700 font-semibold">Login</Link></>
          )}
        </p>
        <Link to="/" className="block text-center text-xs text-muted mt-3 hover:text-brand-700">← Back to home</Link>
      </div>
    </div>
  );
}
