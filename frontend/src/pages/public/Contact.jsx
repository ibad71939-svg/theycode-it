import { useState } from 'react';
import { api } from '../../lib/api';
import Field from '../../components/Field';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '', courseInterest: '' });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await api.post('/enrollments/leads', form);
      setSent(true);
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <p className="kicker mb-5">
        <span className="w-1.5 h-1.5 rounded-full bg-mint" />
        Get in touch
      </p>
      <h1 className="font-display text-3xl md:text-4xl font-semibold mb-2">Talk to Us</h1>
      <p className="text-muted mb-8">Have questions about a course or batch timing? Send us a message.</p>

      {sent ? (
        <div className="bg-mint-tint text-mint-dark rounded-card p-6 font-medium flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0">✓</span>
          Thanks! Our admissions team will reach out shortly.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 card p-6">
          <Field label="Full name" required>
            <input name="name" required placeholder="Full name" className="field-input"
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Email" required>
            <input name="email" required type="email" placeholder="Email" className="field-input"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
          <Field label="Phone (optional)">
            <input name="phone" placeholder="Phone (optional)" className="field-input"
              value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </Field>
          <Field label="Course you're interested in">
            <input name="courseInterest" placeholder="Course you're interested in" className="field-input"
              value={form.courseInterest} onChange={(e) => setForm({ ...form, courseInterest: e.target.value })} />
          </Field>
          <Field label="Message">
            <textarea name="message" placeholder="Message" rows={4} className="field-input"
              value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
          </Field>
          {error && <p className="text-danger text-sm">{error}</p>}
          <button type="submit" className="btn-primary">
            Send Message
          </button>
        </form>
      )}
    </div>
  );
}
