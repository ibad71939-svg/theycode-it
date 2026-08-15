import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import ProgressThread from '../../components/ProgressThread';

const STEPS = ['Account', 'Personal Details', 'Guardian Contact', 'Review'];

const initialForm = {
  name: '', email: '', phone: '', password: '', confirmPassword: '',
  idNumber: '', dob: '', gender: '', address: '',
  guardianName: '', guardianPhone: '', guardianRelation: '',
  consentAccepted: false,
};

// Kept in sync with frontend/src/pages/public/ResetPassword.jsx's
// validatePassword(). 6 characters was too weak for accounts holding
// CNIC/ID numbers and payment history — bumped to 8+ with a letter and a
// number. This is enforced client-side only (the raw password never
// reaches our backend — see AuthContext.register(), which calls Supabase
// Auth's signUp() directly), so if you ever add another entry point for
// creating accounts, re-apply this same check there.
function validatePassword(pw) {
  if (pw.length < 8) return 'Password must be at least 8 characters.';
  if (!/[a-zA-Z]/.test(pw) || !/[0-9]/.test(pw)) return 'Password must include at least one letter and one number.';
  return '';
}

function Field({ label, children, required }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink">{label}{required && <span className="text-danger"> *</span>}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

const inputClass = 'field-input';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Register() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  function set(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  function validateStep() {
    setError('');
    if (step === 0) {
      if (!form.name || !form.email || !form.phone || !form.password) return 'Please fill in all required fields.';
      if (!EMAIL_RE.test(form.email)) return 'Please enter a valid email address.';
      const pwErr = validatePassword(form.password);
      if (pwErr) return pwErr;
      if (form.password !== form.confirmPassword) return 'Passwords do not match.';
    }
    if (step === 1) {
      if (!form.idNumber || !form.dob || !form.address) return 'Please fill in all required fields.';
    }
    if (step === 3) {
      if (!form.consentAccepted) return 'Please accept the Terms & Privacy Policy to continue.';
    }
    return '';
  }

  function next() {
    const err = validateStep();
    if (err) { setError(err); return; }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function back() {
    setError('');
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleSubmit() {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError('');
    try {
      const { confirmPassword, ...payload } = form;
      const user = await register(payload);
      navigate(user.role === 'STUDENT' ? '/student/dashboard' : '/admin/dashboard');
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Signup failed. Please try again.');
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] gradient-mesh px-4 py-12">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <span className="inline-flex w-12 h-12 rounded-xl bg-brand text-white font-mono text-base font-bold items-center justify-center mb-4">
            TCI
          </span>
          <h1 className="font-display text-2xl md:text-3xl font-bold mb-1">Create your student account</h1>
          <p className="text-muted text-sm">This information is used for your official enrollment record.</p>
        </div>

        <div className="card p-7">
          <ProgressThread steps={STEPS} currentIndex={step} />

          <div className="mt-8 space-y-4">
            {step === 0 && (
              <>
                <Field label="Full name" required>
                  <input name="name" className={inputClass} value={form.name} onChange={set('name')} placeholder="As per your CNIC / ID card" />
                </Field>
                <Field label="Email" required>
                  <input name="email" type="email" className={inputClass} value={form.email} onChange={set('email')} placeholder="you@example.com" />
                </Field>
                <Field label="Phone number" required>
                  <input name="phone" className={inputClass} value={form.phone} onChange={set('phone')} placeholder="03XX-XXXXXXX" />
                </Field>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Password" required>
                    <input name="password" type="password" className={inputClass} value={form.password} onChange={set('password')} placeholder="Min. 8 chars, 1 letter, 1 number" />
                  </Field>
                  <Field label="Confirm password" required>
                    <input name="confirmPassword" type="password" className={inputClass} value={form.confirmPassword} onChange={set('confirmPassword')} />
                  </Field>
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <Field label="CNIC / ID number" required>
                  <input name="idNumber" className={inputClass} value={form.idNumber} onChange={set('idNumber')} placeholder="42101-0000000-1" />
                </Field>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Date of birth" required>
                    <input name="dob" type="date" className={inputClass} value={form.dob} onChange={set('dob')} />
                  </Field>
                  <Field label="Gender">
                    <select name="gender" className={inputClass} value={form.gender} onChange={set('gender')}>
                      <option value="">Prefer not to say</option>
                      <option>Female</option>
                      <option>Male</option>
                      <option>Other</option>
                    </select>
                  </Field>
                </div>
                <Field label="Residential address" required>
                  <textarea name="address" rows={3} className={inputClass} value={form.address} onChange={set('address')} placeholder="House / street, area, city" />
                </Field>
              </>
            )}

            {step === 2 && (
              <>
                <p className="text-xs text-muted -mt-2 mb-2">Optional, but recommended for our records and in case of emergency.</p>
                <Field label="Guardian / emergency contact name">
                  <input name="guardianName" className={inputClass} value={form.guardianName} onChange={set('guardianName')} placeholder="Full name" />
                </Field>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Relationship">
                    <input name="guardianRelation" className={inputClass} value={form.guardianRelation} onChange={set('guardianRelation')} placeholder="Parent, sibling, spouse…" />
                  </Field>
                  <Field label="Guardian phone number">
                    <input name="guardianPhone" className={inputClass} value={form.guardianPhone} onChange={set('guardianPhone')} placeholder="03XX-XXXXXXX" />
                  </Field>
                </div>
              </>
            )}

            {step === 3 && (
              <div className="text-sm space-y-3">
                <div className="border-b border-line pb-3">
                  <p className="font-mono text-[11px] font-semibold text-muted uppercase tracking-wide mb-2">Account</p>
                  <p>{form.name} · {form.email} · {form.phone}</p>
                </div>
                <div className="border-b border-line pb-3">
                  <p className="font-mono text-[11px] font-semibold text-muted uppercase tracking-wide mb-2">Personal details</p>
                  <p>ID: {form.idNumber} · DOB: {form.dob || '—'} · {form.gender || 'Not specified'}</p>
                  <p className="text-muted mt-1">{form.address}</p>
                </div>
                <div>
                  <p className="font-mono text-[11px] font-semibold text-muted uppercase tracking-wide mb-2">Guardian contact</p>
                  <p>{form.guardianName || '—'} {form.guardianRelation && `(${form.guardianRelation})`} {form.guardianPhone && `· ${form.guardianPhone}`}</p>
                </div>
                <label className="flex items-start gap-2.5 pt-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-0.5 w-4 h-4 rounded border-line accent-brand"
                    checked={form.consentAccepted}
                    onChange={(e) => setForm({ ...form, consentAccepted: e.target.checked })}
                  />
                  <span className="text-xs text-muted leading-relaxed">
                    I agree to the <Link to="/terms" target="_blank" className="text-brand-700 font-semibold hover:underline">Terms & Privacy Policy</Link>,
                    including how my personal information (and my guardian's, if provided) is collected and used.
                  </span>
                </label>
              </div>
            )}

            {error && <p className="text-danger text-sm bg-danger-50 px-3 py-2 rounded-lg">{error}</p>}
          </div>

          <div className="flex justify-between mt-8">
            <button
              onClick={back}
              disabled={step === 0}
              className="text-sm font-medium text-muted disabled:opacity-0 hover:text-ink"
            >
              ← Back
            </button>
            {step < STEPS.length - 1 ? (
              <button onClick={next} className="btn-primary !py-2.5">
                Continue
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={!form.consentAccepted} className="btn-primary !py-2.5 disabled:opacity-50">
                Create Account
              </button>
            )}
          </div>
        </div>

        <p className="text-sm text-muted mt-5 text-center">
          Already have an account? <Link to="/login" className="text-brand-700 font-semibold">Login</Link>
        </p>
      </div>
    </div>
  );
}