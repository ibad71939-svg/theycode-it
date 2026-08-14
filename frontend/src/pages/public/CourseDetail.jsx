import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
    // Fetch user's enrollments to check if they're enrolled in this course
    api.get('/student/enrollments', token)
      .then((enrollments) => {
        // Find if user is enrolled in any batch of this course
        const courseEnrollment = enrollments.find((e) => e.batch?.course?.slug === slug);
        setUserEnrollment(courseEnrollment);
        setCheckingEnrollment(false);
      })
      .catch(() => {
        setCheckingEnrollment(false);
      });
  }, [user, token, slug]);

  async function handleRegister() {
    if (!user) {
      navigate('/login', { state: { redirectTo: `/courses/${slug}` } });
      return;
    }
    if (!selectedBatch) { setStatus('Please select a batch first.'); return; }
    try {
      await api.post('/enrollments', { batchId: selectedBatch }, token);
      setStatus('Application submitted! Our admissions team will review and confirm your seat.');
    } catch (e) {
      setStatus(e.message);
    }
  }

  if (!course) return <LoadingSpinner fullScreen={false} />;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <span className="pill text-brand-dark bg-brand-tint">{course.level}</span>
      <h1 className="font-display text-3xl md:text-4xl font-semibold mt-4">{course.title}</h1>
      <p className="text-muted mt-3 text-lg leading-relaxed">{course.description}</p>

      <div className="grid sm:grid-cols-3 gap-4 mt-8">
        <div className="card p-4">
          <p className="font-mono text-[11px] uppercase tracking-wide text-muted">Duration</p>
          <p className="font-display font-semibold mt-1">{course.durationWeeks} weeks</p>
        </div>
        <div className="card p-4">
          <p className="font-mono text-[11px] uppercase tracking-wide text-muted">Fee</p>
          <p className="font-display font-semibold mt-1">Rs {course.fee?.toLocaleString()}</p>
        </div>
        <div className="card p-4">
          <p className="font-mono text-[11px] uppercase tracking-wide text-muted">Category</p>
          <p className="font-display font-semibold mt-1">{course.category?.name || '—'}</p>
        </div>
      </div>

      <div className="mt-10 editor-window">
        <div className="editor-titlebar">
          <span className="editor-dots">
            <span className="editor-dot bg-[#FF5F57]" />
            <span className="editor-dot bg-[#FEBC2E]" />
            <span className="editor-dot bg-[#28C840]" />
          </span>
          <span className="editor-filename">your-journey.json</span>
        </div>
        <div className="p-6">
          {userEnrollment ? (
            <div>
              <ProgressThread
                steps={['Register', 'Approval', 'Fee Payment', 'Start Learning']}
                currentIndex={userEnrollment.status === 'PENDING' ? 1 : userEnrollment.status === 'APPROVED' || userEnrollment.status === 'ACTIVE' ? (userEnrollment.payments?.some((p) => p.status === 'PAID') ? 3 : 2) : 0}
              />
              <p className="text-sm text-brand-dark mt-4 font-medium">Status: {userEnrollment.status}</p>
            </div>
          ) : (
            <ProgressThread steps={['Register', 'Approval', 'Fee Payment', 'Start Learning']} currentIndex={0} />
          )}
        </div>
      </div>

      <div className="mt-10">
        {checkingEnrollment ? (
          <div className="text-center py-8">
            <p className="text-muted">Checking your enrollment status…</p>
          </div>
        ) : userEnrollment ? (
          <div className="card border-mint/30 p-8 relative overflow-hidden">
            <span className="absolute left-0 top-0 bottom-0 w-1 bg-mint" />
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-mint/10 text-mint flex items-center justify-center text-lg shrink-0">✓</div>
              <div className="flex-1">
                <h2 className="font-display text-2xl font-semibold text-mint-dark mb-3">Enrollment Confirmed</h2>
                <p className="text-sm text-muted mb-4">You're enrolled in this course. Below is your enrollment status and details.</p>

                <div className="bg-surface rounded-card p-4 space-y-3 mb-4">
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-wide text-muted">Batch Schedule</p>
                    <p className="text-lg font-display font-semibold text-ink mt-1">{userEnrollment.batch?.schedule || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-wide text-muted">Enrollment Status</p>
                    <p className={`text-lg font-display font-semibold mt-1 ${
                      userEnrollment.status === 'PENDING' ? 'text-warn' :
                      userEnrollment.status === 'APPROVED' || userEnrollment.status === 'ACTIVE' ? 'text-mint-dark' :
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
            <h2 className="font-display text-xl font-semibold mb-4">Available Batches</h2>
            <div className="space-y-3">
          {(course.batches || []).map((b) => (
            <label
              key={b.id}
              className={`flex items-center justify-between border rounded-card p-4 cursor-pointer bg-white transition-colors ${
                selectedBatch === b.id ? 'border-brand ring-1 ring-brand' : 'border-ink/10'
              }`}
            >
              <div>
                <p className="text-sm text-muted mb-2">
                  <span className="font-medium text-ink">Mode:</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize inline-block ml-1 ${
                    b.mode === 'online' ? 'bg-brand-tint text-brand-dark' :
                    b.mode === 'hybrid' ? 'bg-accent-tint text-accent-dark' :
                    'bg-mint-tint text-mint-dark'
                  }`}>
                    {b.mode}
                  </span>
                </p>
                <p className="text-sm text-muted">
                  <span className="font-medium text-ink">Start Date:</span> {new Date(b.startDate).toLocaleDateString()}
                </p>
                <p className="text-sm text-muted mt-0.5">
                  <span className="font-medium text-ink">End Date:</span> {new Date(b.endDate).toLocaleDateString()}
                </p>
                <p className="text-sm text-muted mt-0.5">
                  <span className="font-medium text-ink">Schedule:</span> {b.schedule}
                </p>
                <p className="text-sm text-muted mt-0.5">
                  <span className="font-medium text-ink">Instructor:</span> {b.instructor?.user?.name || 'TBA'}
                </p>
                <p className="text-sm text-muted mt-0.5">
                  <span className="font-medium text-ink">Capacity:</span> {b.enrolledCount || 0} out of {b.capacity || '—'} seats
                </p>
                <p className="text-sm text-muted mt-0.5">
                  <span className="font-medium text-ink">Enrolled Students:</span> {b.enrolledCount || 0} {b.enrolledCount === 1 ? 'student' : 'students'}
                </p>
              </div>
              <input type="radio" name="batch" value={b.id} checked={selectedBatch === b.id} onChange={() => setSelectedBatch(b.id)} className="accent-brand w-4 h-4" />
            </label>
          ))}
          {(course.batches || []).length === 0 && <p className="text-muted">No batches scheduled yet — contact us to be notified.</p>}
            </div>

            <button onClick={handleRegister} className="btn-primary mt-6">
              {user ? 'Register for This Batch' : 'Login to Register'}
            </button>
            {status && <p className="mt-3 text-sm text-brand-dark">{status}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
