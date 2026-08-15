import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import ProgressThread from '../../components/ProgressThread';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function CourseDetail() {
  const { slug } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [status, setStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [userEnrollment, setUserEnrollment] = useState(null);
  const [checkingEnrollment, setCheckingEnrollment] = useState(true);

  useEffect(() => {
    api.get(`/courses/${slug}`).then(setCourse).catch(() => {});
  }, [slug]);

  useEffect(() => {
    if (!user || !token) {
      setCheckingEnrollment(false);
      return;
    }
    api.get('/student/enrollments', token)
      .then((enrollments) => {
        const courseEnrollment = enrollments.find((e) => e.batch?.course?.slug === slug);
        setUserEnrollment(courseEnrollment);
        setCheckingEnrollment(false);
      })
      .catch(() => setCheckingEnrollment(false));
  }, [user, token, slug]);

  async function handleRegister() {
    if (!user) {
      navigate('/login', { state: { redirectTo: `/courses/${slug}` } });
      return;
    }
    if (!selectedBatch) { setStatus('Please select a batch first.'); return; }
    if (submitting) return;
    setSubmitting(true);
    try {
      await api.post('/enrollments', { batchId: selectedBatch }, token);
      setStatus('Application submitted! Our admissions team will review and confirm your seat.');
    } catch (e) {
      setStatus(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (!course) return <LoadingSpinner fullScreen={false} />;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted mb-6">
        <Link to="/courses" className="hover:text-brand-700">Courses</Link>
        <span>/</span>
        <span className="text-ink font-medium">{course.title}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <span className="pill-solid mb-4">{course.level}</span>
        <h1 className="font-display text-3xl md:text-4xl font-bold mt-4 mb-4">{course.title}</h1>
        <p className="text-muted text-lg leading-relaxed max-w-2xl">{course.description}</p>

        <div className="grid sm:grid-cols-3 gap-4 mt-8">
          <div className="stat-card">
            <div className="flex items-center gap-2 mb-1">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4 text-brand"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" strokeLinecap="round" /></svg>
              <p className="font-mono text-[11px] uppercase tracking-wide text-muted">Duration</p>
            </div>
            <p className="font-display font-bold text-lg">{course.durationWeeks} weeks</p>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-2 mb-1">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4 text-brand"><path d="M12 8c-1.5 0-3 .5-3 2v4c0 1 1 2 3 2s3-1 3-2v-4c0-1.5-1.5-2-3-2z" /><path d="M12 1v3m0 16v3" strokeLinecap="round" /><circle cx="12" cy="12" r="10" /></svg>
              <p className="font-mono text-[11px] uppercase tracking-wide text-muted">Fee</p>
            </div>
            <p className="font-display font-bold text-lg">Rs {course.fee?.toLocaleString()}</p>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-2 mb-1">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4 text-brand"><path d="M4 7h16M4 12h16M4 17h10" strokeLinecap="round" /></svg>
              <p className="font-mono text-[11px] uppercase tracking-wide text-muted">Category</p>
            </div>
            <p className="font-display font-bold text-lg">{course.category?.name || '—'}</p>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="card-tint p-6 mb-10">
        <p className="font-mono text-xs text-muted mb-5"><span className="text-brand-700 font-semibold">// </span>your journey once you enroll</p>
        {userEnrollment ? (
          <div>
            <ProgressThread
              steps={['Register', 'Approval', 'Fee Payment', 'Start Learning']}
              currentIndex={userEnrollment.status === 'PENDING' ? 1 : userEnrollment.status === 'APPROVED' || userEnrollment.status === 'ACTIVE' ? (userEnrollment.payments?.some((p) => p.status === 'PAID') ? 3 : 2) : 0}
            />
            <p className="text-sm text-brand-700 mt-4 font-medium">Status: {userEnrollment.status}</p>
          </div>
        ) : (
          <ProgressThread steps={['Register', 'Approval', 'Fee Payment', 'Start Learning']} currentIndex={0} />
        )}
      </div>

      {/* Enrollment / Batches */}
      <div>
        {checkingEnrollment ? (
          <div className="text-center py-8">
            <p className="text-muted">Checking your enrollment status…</p>
          </div>
        ) : userEnrollment ? (
          <div className="card border-mint-300 p-8 relative overflow-hidden">
            <span className="absolute left-0 top-0 bottom-0 w-1 bg-mint" />
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-mint-50 text-mint flex items-center justify-center text-xl shrink-0">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16Zm3.53-9.72a.75.75 0 00-1.06-1.06L9 10.69 7.53 9.22a.75.75 0 00-1.06 1.06l2 2a.75.75 0 001.06 0l4-4Z" clipRule="evenodd" /></svg>
              </div>
              <div className="flex-1">
                <h2 className="font-display text-2xl font-bold text-mint-700 mb-3">Enrollment Confirmed</h2>
                <p className="text-sm text-muted mb-4">You're enrolled in this course. Below is your enrollment status and details.</p>

                <div className="bg-brand-50 border border-brand-100 rounded-card p-4 space-y-3 mb-4">
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-wide text-muted">Batch Schedule</p>
                    <p className="text-lg font-display font-bold text-ink mt-1">{userEnrollment.batch?.schedule || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-wide text-muted">Enrollment Status</p>
                    <p className={`text-lg font-display font-bold mt-1 ${
                      userEnrollment.status === 'PENDING' ? 'text-warn' :
                      userEnrollment.status === 'APPROVED' || userEnrollment.status === 'ACTIVE' ? 'text-mint-700' :
                      userEnrollment.status === 'REJECTED' ? 'text-danger' :
                      'text-brand'
                    }`}>
                      {userEnrollment.status}
                    </p>
                  </div>
                </div>

                {userEnrollment.status === 'APPROVED' || userEnrollment.status === 'ACTIVE' ? (
                  <button onClick={() => navigate('/student/courses')} className="btn-primary">
                    Go to My Courses →
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="font-display text-xl font-bold mb-4">Available Batches</h2>
            <div className="space-y-3">
              {(course.batches || []).map((b) => (
                <label
                  key={b.id}
                  className={`flex items-center justify-between border-2 rounded-card p-5 cursor-pointer bg-white transition-all ${
                    selectedBatch === b.id ? 'border-brand ring-4 ring-brand-100' : 'border-ink/10 hover:border-brand-300'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize ${
                        b.mode === 'online' ? 'bg-brand-50 text-brand-700' :
                        b.mode === 'hybrid' ? 'bg-accent-50 text-accent-700' :
                        'bg-mint-50 text-mint-700'
                      }`}>
                        {b.mode}
                      </span>
                      <span className="text-sm font-medium text-ink">{b.schedule}</span>
                    </div>
                    <p className="text-sm text-muted">
                      {new Date(b.startDate).toLocaleDateString()} → {new Date(b.endDate).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-muted">Instructor: {b.instructor?.user?.name || 'TBA'}</p>
                    <p className="text-sm text-muted">Capacity: {b.enrolledCount || 0} / {b.capacity || '—'} seats</p>
                  </div>
                  <input type="radio" name="batch" value={b.id} checked={selectedBatch === b.id} onChange={() => setSelectedBatch(b.id)} className="accent-brand w-5 h-5" />
                </label>
              ))}
              {(course.batches || []).length === 0 && <p className="text-muted">No batches scheduled yet — contact us to be notified.</p>}
            </div>

            {course.batches?.length > 0 && (
              <button onClick={handleRegister} disabled={submitting} className="btn-primary mt-6 disabled:opacity-60">
                {submitting ? 'Submitting…' : user ? 'Register for This Batch' : 'Login to Register'}
              </button>
            )}
            {status && <p className="mt-3 text-sm text-brand-700">{status}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
