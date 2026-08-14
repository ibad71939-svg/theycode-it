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
    <div className="max-w-md mx-auto px-6 py-16">
      <span className="w-10 h-10 rounded-md bg-ink text-mint font-mono text-sm font-semibold flex items-center justify-center mb-5">
        &gt;_
      </span>
      <h1 className="font-display text-2xl md:text-3xl font-semibold mb-1">
        {mode === 'login' ? 'Welcome back' : 'Create your student account'}
      </h1>
      <p className="text-muted mb-6 text-sm">
        {mode === 'login' ? 'Login to access your student or admin portal.' : 'Register to start applying for courses.'}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4 card p-6">
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

        {error && <p className="text-danger text-sm">{error}</p>}

        <button type="submit" className="btn-primary w-full">
          {mode === 'login' ? 'Login' : 'Create Account'}
        </button>
      </form>

      <p className="text-sm text-muted mt-4 text-center">
        {mode === 'login' ? (
          <>New here? <Link to="/register" className="text-brand-dark font-medium">Create an account</Link></>
        ) : (
          <>Already have an account? <Link to="/login" className="text-brand-dark font-medium">Login</Link></>
        )}
      </p>
      <p className="text-xs text-muted mt-6 text-center font-mono">
        demo — admin@theycodeit.com / Passw0rd! · student@theycodeit.com / Passw0rd!
      </p>
      <Link to="/" className="block text-center text-xs text-muted mt-2 hover:text-brand">← Back to home</Link>
    </div>
  );
}
