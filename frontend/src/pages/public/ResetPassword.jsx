import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Field from '../../components/Field';
import { useToast } from '../../components/Toast';

// Password policy kept in sync with Register.jsx — see PASSWORD_RULES there
// for the shared rationale (min length + letter + number).
function validatePassword(pw) {
  if (pw.length < 8) return 'Password must be at least 8 characters.';
  if (!/[a-zA-Z]/.test(pw) || !/[0-9]/.test(pw)) return 'Password must include at least one letter and one number.';
  return '';
}

export default function ResetPassword() {
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    // Supabase's client automatically parses the recovery token out of the
    // URL (hash or ?code=) on load and fires this event once a session from
    // that link is established. Until then, there's no valid session to
    // update the password on.
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true);
    });
    // Fallback: if the event already fired before this listener attached,
    // check whether we already have a session.
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session) setReady(true);
    });
    return () => sub?.subscription?.unsubscribe();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const pwErr = validatePassword(password);
    if (pwErr) return setError(pwErr);
    if (password !== confirmPassword) return setError('Passwords do not match.');

    setSubmitting(true);
    try {
      const { error: updateErr } = await supabase.auth.updateUser({ password });
      if (updateErr) throw updateErr;
      toast.success('Password updated. Please log in with your new password.');
      await supabase.auth.signOut().catch(() => {});
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Could not reset your password. The link may have expired — request a new one.');
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
          <h1 className="font-display text-2xl md:text-3xl font-bold mb-1">Set a new password</h1>
          <p className="text-muted text-sm">Choose a new password for your account.</p>
        </div>

        {!ready ? (
          <div className="card p-7 text-center space-y-3">
            <p className="text-sm text-muted">Verifying your reset link…</p>
            <p className="text-xs text-muted">
              If this doesn't update, your link may have expired. <Link to="/forgot-password" className="text-brand-700 font-semibold">Request a new one</Link>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card p-7 space-y-4">
            <Field label="New password" required>
              <input
                name="password"
                required
                type="password"
                placeholder="Min. 8 characters, 1 letter, 1 number"
                className="field-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>
            <Field label="Confirm new password" required>
              <input
                name="confirmPassword"
                required
                type="password"
                className="field-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </Field>

            {error && <p className="text-danger text-sm bg-danger-50 px-3 py-2 rounded-lg">{error}</p>}

            <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-60">
              {submitting ? 'Saving…' : 'Save new password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}