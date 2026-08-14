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
    <div>
      <section className="gradient-mesh border-b border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
          <span className="kicker mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-mint-400" />
            Get in touch
          </span>
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-3">Talk to Us</h1>
          <p className="text-muted text-lg max-w-xl">Have questions about a course or batch timing? Send us a message and our admissions team will reach out.</p>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        {sent ? (
          <div className="card border-mint-300 p-8 text-center animate-scale-in">
            <div className="w-14 h-14 rounded-full bg-mint-50 text-mint flex items-center justify-center mx-auto mb-4">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-7 h-7"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16Zm3.53-9.72a.75.75 0 00-1.06-1.06L9 10.69 7.53 9.22a.75.75 0 00-1.06 1.06l2 2a.75.75 0 001.06 0l4-4Z" clipRule="evenodd" /></svg>
            </div>
            <h2 className="font-display text-xl font-bold mb-2">Thanks! We'll be in touch.</h2>
            <p className="text-muted">Our admissions team will reach out shortly.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card p-8 space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Full name" required>
                <input name="name" required placeholder="Full name" className="field-input"
                  value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </Field>
              <Field label="Email" required>
                <input name="email" required type="email" placeholder="Email" className="field-input"
                  value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </Field>
            </div>
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
            <button type="submit" className="btn-primary w-full">
              Send Message
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
