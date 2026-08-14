import { Fragment, useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import Field from '../../components/Field';
import LoadingSpinner from '../../components/LoadingSpinner';

const empty = { title: '', description: '', durationWeeks: 8, fee: 0, level: 'Beginner' };
const emptyBatch = {
  instructorId: '',
  startDate: '',
  endDate: '',
  schedule: '',
  capacity: 20,
  mode: 'onsite',
  status: 'upcoming',
};

export default function Courses() {
  const { token } = useAuth();
  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [form, setForm] = useState(empty);
  const [showForm, setShowForm] = useState(false);

  // Batch management state
  const [expandedCourseId, setExpandedCourseId] = useState(null);
  const [batchForm, setBatchForm] = useState(emptyBatch);
  const [editingBatchId, setEditingBatchId] = useState(null);
  const [loaded, setLoaded] = useState(false);

  function load() {
    if (!token) return;
    api.get('/admin/courses', token).then(setCourses).catch(() => {}).finally(() => setLoaded(true));
  }
  useEffect(load, [token]);
  useEffect(() => {
    if (!token) return;
    api.get('/admin/instructors', token).then(setInstructors).catch(() => {});
  }, [token]);

  async function createCourse(e) {
    e.preventDefault();
    await api.post('/admin/courses', form, token);
    setForm(empty);
    setShowForm(false);
    load();
  }

  async function togglePublish(c) {
    await api.put(`/admin/courses/${c.id}`, { isPublished: !c.isPublished }, token);
    load();
  }

  async function removeCourse(id) {
    await api.del(`/admin/courses/${id}`, token);
    load();
  }

  function toggleExpand(courseId) {
    setExpandedCourseId((cur) => (cur === courseId ? null : courseId));
    setEditingBatchId(null);
    setBatchForm(emptyBatch);
  }

  function startEditBatch(b) {
    setEditingBatchId(b.id);
    setBatchForm({
      instructorId: b.instructorId || '',
      startDate: b.startDate ? b.startDate.slice(0, 10) : '',
      endDate: b.endDate ? b.endDate.slice(0, 10) : '',
      schedule: b.schedule || '',
      capacity: b.capacity || 20,
      mode: b.mode || 'onsite',
      status: b.status || 'upcoming',
    });
  }

  async function saveBatch(e, courseId) {
    e.preventDefault();
    const payload = {
      ...batchForm,
      courseId,
      instructorId: batchForm.instructorId || null,
      capacity: Number(batchForm.capacity),
    };
    if (editingBatchId) {
      await api.put(`/admin/batches/${editingBatchId}`, payload, token);
    } else {
      await api.post('/admin/batches', payload, token);
    }
    setBatchForm(emptyBatch);
    setEditingBatchId(null);
    load();
  }

  if (!token || !loaded) return <LoadingSpinner fullScreen={false} />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-display text-2xl font-semibold">Courses & Batches</h1>
        <button onClick={() => setShowForm((s) => !s)} className="bg-brand text-white text-sm font-semibold px-4 py-2 rounded-admin hover:bg-brand-dark">
          {showForm ? 'Cancel' : '+ New Course'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={createCourse} className="bg-white border border-muted/10 rounded-admin p-5 mb-6 grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Field label="Title">
              <input name="title" required placeholder="Title" className="w-full border border-muted/20 rounded-admin px-3 py-2"
                value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Description">
              <textarea name="description" required placeholder="Description" className="w-full border border-muted/20 rounded-admin px-3 py-2"
                value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </Field>
          </div>
          <Field label="Duration (weeks)">
            <input name="durationWeeks" type="number" placeholder="Duration (weeks)" className="w-full border border-muted/20 rounded-admin px-3 py-2"
              value={form.durationWeeks} onChange={(e) => setForm({ ...form, durationWeeks: Number(e.target.value) })} />
          </Field>
          <Field label="Fee">
            <input name="fee" type="number" placeholder="Fee" className="w-full border border-muted/20 rounded-admin px-3 py-2"
              value={form.fee} onChange={(e) => setForm({ ...form, fee: Number(e.target.value) })} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Level">
              <select name="level" className="w-full border border-muted/20 rounded-admin px-3 py-2"
                value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>
                <option>Beginner</option>
                <option>Beginner to Intermediate</option>
                <option>Advanced</option>
              </select>
            </Field>
          </div>
          <button className="bg-brand text-white font-semibold rounded-admin py-2 sm:col-span-2 hover:bg-brand-dark">Create Course</button>
        </form>
      )}

      <div className="bg-white border border-muted/10 rounded-admin overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface text-muted text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Level</th>
              <th className="px-4 py-3 font-medium">Fee</th>
              <th className="px-4 py-3 font-medium">Batches</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((c) => (
              <Fragment key={c.id}>
                <tr className="border-t border-muted/10">
                  <td className="px-4 py-3 font-medium">{c.title}</td>
                  <td className="px-4 py-3 text-muted">{c.level}</td>
                  <td className="px-4 py-3">Rs {c.fee?.toLocaleString()}</td>
                  <td className="px-4 py-3 text-muted">
                    <button onClick={() => toggleExpand(c.id)} className="text-brand-dark font-medium hover:underline">
                      {c.batches?.length || 0} {expandedCourseId === c.id ? '▲' : '▼'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${c.isPublished ? 'bg-brand-tint text-brand-dark' : 'bg-muted/10 text-muted'}`}>
                      {c.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-4 py-3 space-x-3">
                    <button onClick={() => togglePublish(c)} className="text-brand-dark font-medium hover:underline">
                      {c.isPublished ? 'Unpublish' : 'Publish'}
                    </button>
                    <button onClick={() => toggleExpand(c.id)} className="text-brand-dark font-medium hover:underline">
                      {expandedCourseId === c.id ? 'Close' : 'Batches'}
                    </button>
                    <button onClick={() => removeCourse(c.id)} className="text-danger font-medium hover:underline">Delete</button>
                  </td>
                </tr>
                {expandedCourseId === c.id && (
                  <tr className="border-t border-muted/10 bg-surface/50">
                    <td colSpan={6} className="px-4 py-4">
                      <div className="mb-4">
                        <h3 className="font-semibold text-sm mb-2">Batches for {c.title}</h3>
                        {c.batches?.length ? (
                          <table className="w-full text-sm mb-3">
                            <thead className="text-muted text-left">
                              <tr>
                                <th className="py-1 pr-3 font-medium">Schedule</th>
                                <th className="py-1 pr-3 font-medium">Dates</th>
                                <th className="py-1 pr-3 font-medium">Instructor</th>
                                <th className="py-1 pr-3 font-medium">Capacity</th>
                                <th className="py-1 pr-3 font-medium">Mode</th>
                                <th className="py-1 pr-3 font-medium">Status</th>
                                <th className="py-1 pr-3 font-medium">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {c.batches.map((b) => {
                                const instructor = instructors.find((i) => i.id === b.instructorId);
                                return (
                                  <tr key={b.id} className="border-t border-muted/10">
                                    <td className="py-2 pr-3">{b.schedule}</td>
                                    <td className="py-2 pr-3 text-muted">
                                      {b.startDate?.slice(0, 10)} → {b.endDate?.slice(0, 10)}
                                    </td>
                                    <td className="py-2 pr-3 text-muted">{instructor?.user?.name || '—'}</td>
                                    <td className="py-2 pr-3 text-muted">{b.capacity}</td>
                                    <td className="py-2 pr-3 text-muted capitalize">{b.mode}</td>
                                    <td className="py-2 pr-3">
                                      <span className="text-xs font-semibold px-2 py-1 rounded-full bg-muted/10 text-muted capitalize">
                                        {b.status}
                                      </span>
                                    </td>
                                    <td className="py-2 pr-3">
                                      <button onClick={() => startEditBatch(b)} className="text-brand-dark font-medium hover:underline">
                                        Edit
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        ) : (
                          <p className="text-muted text-sm mb-3">No batches yet for this course.</p>
                        )}

                        <form onSubmit={(e) => saveBatch(e, c.id)} className="bg-white border border-muted/10 rounded-admin p-4 grid sm:grid-cols-3 gap-3">
                          <Field label="Instructor">
                            <select name="instructorId" className="w-full border border-muted/20 rounded-admin px-3 py-2"
                              value={batchForm.instructorId}
                              onChange={(e) => setBatchForm({ ...batchForm, instructorId: e.target.value })}>
                              <option value="">Unassigned instructor</option>
                              {instructors.map((i) => (
                                <option key={i.id} value={i.id}>{i.user?.name}</option>
                              ))}
                            </select>
                          </Field>
                          <Field label="Start date">
                            <input name="startDate" required type="date" className="w-full border border-muted/20 rounded-admin px-3 py-2"
                              value={batchForm.startDate}
                              onChange={(e) => setBatchForm({ ...batchForm, startDate: e.target.value })} />
                          </Field>
                          <Field label="End date">
                            <input name="endDate" required type="date" className="w-full border border-muted/20 rounded-admin px-3 py-2"
                              value={batchForm.endDate}
                              onChange={(e) => setBatchForm({ ...batchForm, endDate: e.target.value })} />
                          </Field>
                          <div className="sm:col-span-2">
                            <Field label="Schedule">
                              <input name="schedule" required placeholder="e.g. Mon/Wed/Fri 6-8pm" className="w-full border border-muted/20 rounded-admin px-3 py-2"
                                value={batchForm.schedule}
                                onChange={(e) => setBatchForm({ ...batchForm, schedule: e.target.value })} />
                            </Field>
                          </div>
                          <Field label="Capacity">
                            <input name="capacity" required type="number" placeholder="Capacity" className="w-full border border-muted/20 rounded-admin px-3 py-2"
                              value={batchForm.capacity}
                              onChange={(e) => setBatchForm({ ...batchForm, capacity: e.target.value })} />
                          </Field>
                          <Field label="Mode">
                            <select name="mode" className="w-full border border-muted/20 rounded-admin px-3 py-2"
                              value={batchForm.mode}
                              onChange={(e) => setBatchForm({ ...batchForm, mode: e.target.value })}>
                              <option value="onsite">Onsite</option>
                              <option value="online">Online</option>
                              <option value="hybrid">Hybrid</option>
                            </select>
                          </Field>
                          <Field label="Status">
                            <select name="status" className="w-full border border-muted/20 rounded-admin px-3 py-2"
                              value={batchForm.status}
                              onChange={(e) => setBatchForm({ ...batchForm, status: e.target.value })}>
                              <option value="upcoming">Upcoming</option>
                              <option value="active">Active</option>
                              <option value="completed">Completed</option>
                            </select>
                          </Field>
                          <div className="sm:col-span-3 flex gap-3">
                            <button type="submit" className="bg-brand text-white font-semibold rounded-admin py-2 px-4 hover:bg-brand-dark">
                              {editingBatchId ? 'Update Batch' : '+ Add Batch'}
                            </button>
                            {editingBatchId && (
                              <button type="button" onClick={() => { setEditingBatchId(null); setBatchForm(emptyBatch); }}
                                className="text-muted font-medium hover:underline">
                                Cancel edit
                              </button>
                            )}
                          </div>
                        </form>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
            {courses.length === 0 && <tr><td colSpan={6} className="px-4 py-6 text-center text-muted">No courses yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}