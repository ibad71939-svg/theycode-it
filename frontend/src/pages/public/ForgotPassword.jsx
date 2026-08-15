import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Field from '../../components/Field';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!EMAIL_RE.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setSubmitting(true);
    try {
      // Supabase sends the reset email itself (not via our Resend-based
      // backend email helper) — see backend/src/lib/email.js for the note
      // on configuring custom SMTP for Supabase Auth emails before launch.
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (resetErr) throw resetErr;
      setSent(true);
    } catch (err) {
      // Deliberately vague — don't reveal whether an account exists for
      // this email (avoids leaking which emails are registered).
      setSent(true);
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
          <h1 className="font-display text-2xl md:text-3xl font-bold mb-1">Reset your password</h1>
          <p className="text-muted text-sm">We'll email you a link to set a new one.</p>
        </div>

        {sent ? (
          <div className="card p-7 text-center space-y-3">
            <p className="text-sm text-ink">
              If an account exists for <strong>{email}</strong>, a password reset link is on its way. Check your inbox (and spam folder).
            </p>
            <Link to="/login" className="text-brand-700 font-semibold text-sm">← Back to login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card p-7 space-y-4">
            <Field label="Email" required>
              <input
                name="email"
                required
                type="email"
                placeholder="you@example.com"
                className="field-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>

            {error && <p className="text-danger text-sm bg-danger-50 px-3 py-2 rounded-lg">{error}</p>}

            <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-60">
              {submitting ? 'Sending…' : 'Send reset link'}
            </button>
          </form>
        )}

        <Link to="/login" className="block text-center text-xs text-muted mt-6 hover:text-brand-700">← Back to login</Link>
      </div>
    </div>
  );
}