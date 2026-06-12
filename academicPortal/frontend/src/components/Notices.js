import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['All', 'General', 'Exam', 'Holiday', 'Event', 'Urgent'];
const DEGREES = ['All', 'BTech', 'MTech'];
const DEPARTMENTS = ['All', 'CSE', 'IT', 'ECE', 'AI&ML', 'EE', 'AI&DS', 'IoT'];

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getAttachmentHref(url) {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  const host = window.location.hostname || 'localhost';
  const protocol = window.location.protocol || 'http:';
  const apiPort = (process.env.REACT_APP_API_PORT && process.env.REACT_APP_API_PORT.length) ? process.env.REACT_APP_API_PORT : '5000';
  return `${protocol}//${host}:${apiPort}${url}`;
}

function NoticeModal({ notice, onClose, onDelete, onEdit, canEdit }) {
  if (!notice) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className={`notice-badge badge-${notice.category}`}>{notice.category}</span>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {canEdit && (
              <>
                <button
                  className="btn"
                  style={{ background: '#fef3c7', color: '#92400e', padding: '0.3rem 0.8rem', fontSize: '0.8rem' }}
                  onClick={() => onEdit(notice)}
                >✏️ Edit</button>
                <button
                  className="btn"
                  style={{ background: '#fee2e2', color: '#dc2626', padding: '0.3rem 0.8rem', fontSize: '0.8rem' }}
                  onClick={() => { onDelete(notice._id); onClose(); }}
                >🗑 Delete</button>
              </>
            )}
            <button className="modal-close" onClick={onClose}>✕</button>
          </div>
        </div>
        <div className="modal-title" style={{ marginBottom: '0.75rem' }}>{notice.title}</div>
        {notice.isCancelled && (
          <div style={{ marginBottom: '0.75rem', fontWeight: 600, color: '#b91c1c' }}>⚠️ Class cancelled or event cancelled</div>
        )}
        {notice.classTiming && (
          <div style={{ marginBottom: '0.75rem', color: '#475569' }}>⏰ Class timing: <strong>{notice.classTiming}</strong></div>
        )}
        <div className="modal-body">{notice.content}</div>
        {notice.attachmentUrl && (
          <div style={{ marginTop: '1rem' }}>
            <a href={notice.attachmentUrl} target="_blank" rel="noreferrer" className="link-button">
              📎 Download attachment: {notice.attachmentName || 'File'}
            </a>
          </div>
        )}
        <div className="modal-meta" style={{ marginTop: '1rem' }}>
          Posted by <strong>{notice.postedBy}</strong> · {formatDate(notice.createdAt)}
        </div>
      </div>
    </div>
  );
}

function AddNoticeForm({ notice, onAdded, onCancel }) {
  const initial = {
    title: '',
    content: '',
    category: 'General',
    isImportant: false,
    postedBy: '',
    degree: 'BTech',
    year: 'All',
    department: 'All',
    classTiming: '',
    isCancelled: false,
    attachmentUrl: '',
    attachmentName: '',
    attachmentType: '',
  };

  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (notice) {
      setForm({
        title: notice.title || '',
        content: notice.content || '',
        category: notice.category || 'General',
        isImportant: notice.isImportant || false,
        postedBy: notice.postedBy || '',
        degree: notice.degree || 'BTech',
        year: notice.year != null ? String(notice.year) : 'All',
        department: notice.department || 'All',
        classTiming: notice.classTiming || '',
        isCancelled: notice.isCancelled || false,
        attachmentUrl: notice.attachmentUrl || '',
        attachmentName: notice.attachmentName || '',
        attachmentType: notice.attachmentType || '',
      });
    } else {
      setForm(initial);
    }
  }, [notice]);

  const handle = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  const uploadFile = async (file) => {
    if (!file) return;
    setUploading(true);
    const data = new FormData();
    data.append('file', file);
    try {
      const response = await axios.post('/api/uploads', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setForm({
        ...form,
        attachmentUrl: response.data.url,
        attachmentName: response.data.filename,
        attachmentType: response.data.mimeType,
      });
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to upload attachment.');
    }
    setUploading(false);
  };

  const submit = async () => {
    if (!form.title || !form.content) return alert('Title and content are required.');
    setLoading(true);
    try {
      const payload = {
        title: form.title,
        content: form.content,
        category: form.category,
        postedBy: form.postedBy,
        isImportant: form.isImportant,
        degree: form.degree,
        year: form.year === 'All' ? undefined : Number(form.year),
        department: form.department === 'All' ? undefined : form.department,
        classTiming: form.classTiming,
        isCancelled: form.isCancelled,
        attachmentUrl: form.attachmentUrl,
        attachmentName: form.attachmentName,
        attachmentType: form.attachmentType,
      };
      if (payload.year === undefined) delete payload.year;
      if (payload.department === undefined) delete payload.department;

      if (notice) {
        await axios.put(`/api/notices/${notice._id}`, payload);
      } else {
        await axios.post('/api/notices', payload);
      }
      onAdded();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to save notice.');
    }
    setLoading(false);
  };

  return (
    <div className="form-card" style={{ marginBottom: '1.5rem' }}>
      <div className="page-title" style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
        {notice ? '✏️ Edit Notice' : '📝 Add New Notice'}
      </div>
      <div className="form-row">
        <label className="form-label">Title *</label>
        <input className="form-input" name="title" value={form.title} onChange={handle} placeholder="Notice title" />
      </div>
      <div className="form-row">
        <label className="form-label">Content *</label>
        <textarea className="form-textarea" name="content" value={form.content} onChange={handle} placeholder="Notice content..." rows={4} />
      </div>
      <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label className="form-label">Category</label>
          <select className="form-select" name="category" value={form.category} onChange={handle}>
            {['General', 'Exam', 'Holiday', 'Event', 'Urgent'].map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">Posted By</label>
          <input className="form-input" name="postedBy" value={form.postedBy} onChange={handle} placeholder="Department / Name" />
        </div>
      </div>
      <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.75rem' }}>
        <div>
          <label className="form-label">Degree</label>
          <select className="form-select" name="degree" value={form.degree} onChange={handle}>
            <option>BTech</option>
            <option>MTech</option>
          </select>
        </div>
        <div>
          <label className="form-label">Year</label>
          <select className="form-select" name="year" value={form.year} onChange={handle}>
            <option>All</option>
            {form.degree === 'BTech' ? ['1', '2', '3', '4'].map((y) => <option key={y}>{y}</option>) : ['1', '2'].map((y) => <option key={y}>{y}</option>)}
          </select>
        </div>
      </div>
      <div className="form-row" style={{ marginTop: '0.75rem' }}>
        <label className="form-label">Department</label>
        <select className="form-select" name="department" value={form.department} onChange={handle}>
          <option>All</option>
          {['CSE', 'IT', 'ECE', 'AI&ML', 'EE', 'AI&DS', 'IoT'].map((d) => <option key={d}>{d}</option>)}
        </select>
      </div>
      <div className="form-row" style={{ marginTop: '0.75rem' }}>
        <label className="form-label">Class Timing (optional)</label>
        <input className="form-input" name="classTiming" value={form.classTiming} onChange={handle} placeholder="e.g. 10:00 AM - 11:00 AM" />
      </div>
      <label className="form-checkbox-row" style={{ marginTop: '0.5rem' }}>
        <input type="checkbox" name="isCancelled" checked={form.isCancelled} onChange={handle} />
        Mark this notice as class/event cancelled
      </label>
      <div className="form-row" style={{ marginTop: '0.75rem' }}>
        <label className="form-label">Attachment (PDF/Image)</label>
        <input
          className="form-input"
          type="file"
          accept=".pdf,image/*"
          onChange={(e) => uploadFile(e.target.files[0])}
        />
        {uploading && <div style={{ marginTop: '0.5rem', color: '#2563eb' }}>Uploading...</div>}
        {form.attachmentUrl && (
          <div style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
            Attached: <strong>{form.attachmentName}</strong>
          </div>
        )}
      </div>
      <div className="btn-row">
        <button className="btn btn-primary" onClick={submit} disabled={loading || uploading}>
          {loading ? 'Saving…' : notice ? 'Save Notice' : 'Post Notice'}
        </button>
        <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

export default function Notices() {
  const { canEdit, user } = useAuth();
  const isStudent = user?.role === 'student';
  const [notices, setNotices] = useState([]);
  const [active, setActive] = useState('All');
  const [degreeFilter, setDegreeFilter] = useState(isStudent && user?.degree ? user.degree : 'All');
  const [yearFilter, setYearFilter] = useState(isStudent && user?.year ? String(user.year) : 'All');
  const [deptFilter, setDeptFilter] = useState(isStudent && user?.department ? user.department : 'All');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);

  const fetchNotices = async () => {
    setLoading(true);
    const params = {};
    if (active !== 'All') params.category = active;
    if (degreeFilter !== 'All') params.degree = degreeFilter;
    if (yearFilter !== 'All') params.year = yearFilter;
    if (deptFilter !== 'All') params.department = deptFilter;
    const res = await axios.get('/api/notices', { params });
    setNotices(res.data);
    setLoading(false);
  };

  useEffect(() => { fetchNotices(); }, [active, degreeFilter, yearFilter, deptFilter]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this notice?')) return;
    await axios.delete(`/api/notices/${id}`);
    if (selected && selected._id === id) setSelected(null);
    setEditingNotice(null);
    fetchNotices();
  };

  const handleEdit = (notice) => {
    setEditingNotice(notice);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingNotice(null);
  };

  return (
    <>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="page-title">📋 Notice Board</div>
          <div className="page-desc">All official announcements from departments and administration</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className={`role-badge role-${user.role}`}>
            {user.role === 'admin' ? '🛡️' : user.role === 'faculty' ? '👨‍🏫' : '🎓'}{' '}
            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
          </span>
          {canEdit && (
            <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setEditingNotice(null); }}>
              {showForm ? '✕ Cancel' : '+ Add Notice'}
            </button>
          )}
        </div>
      </div>

      {!canEdit && (
        <div className="view-only-banner">
          👀 You are in <strong>View Only</strong> mode. Only admin users can manage notices.
        </div>
      )}

      {showForm && canEdit && (
        <AddNoticeForm
          notice={editingNotice}
          onAdded={() => { closeForm(); fetchNotices(); }}
          onCancel={closeForm}
        />
      )}

      <div className="filter-bar">
        {!isStudent && (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <label style={{ fontSize: '0.9rem', color: '#666' }}>Degree</label>
            <select className="form-select" value={degreeFilter} onChange={(e) => { setDegreeFilter(e.target.value); setYearFilter('All'); }}>
              {DEGREES.map((d) => <option key={d}>{d}</option>)}
            </select>
            <label style={{ fontSize: '0.9rem', color: '#666' }}>Year</label>
            <select className="form-select" value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}>
              <option>All</option>
              {degreeFilter === 'BTech' && ['1', '2', '3', '4'].map((y) => <option key={y}>{y}</option>)}
              {degreeFilter === 'MTech' && ['1', '2'].map((y) => <option key={y}>{y}</option>)}
            </select>
            <label style={{ fontSize: '0.9rem', color: '#666' }}>Department</label>
            <select className="form-select" value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
              {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
        )}
        {isStudent && (
          <div style={{ padding: '0.5rem', background: '#f0f9ff', borderRadius: '0.5rem', fontSize: '0.9rem', color: '#0369a1', marginBottom: '0.5rem', width: '100%' }}>
            📚 Showing notices for <strong>{user?.degree} Year {user?.year} · {user?.department}</strong>
          </div>
        )}
        <div style={{ marginTop: isStudent ? 0 : '0.5rem', width: '100%' }}>
          {CATEGORIES.map((c) => (
            <button key={c} className={`filter-chip ${active === c ? 'active' : ''}`} onClick={() => setActive(c)}>{c}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading notices…</div>
      ) : notices.length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon">📭</div><div>No notices found.</div></div>
      ) : (
        <div className="notices-grid">
          {notices.map((n) => (
            <div key={n._id} className={`notice-card ${n.isImportant ? 'important' : ''}`}>
              <div className="notice-meta">
                <span className={`notice-badge badge-${n.category}`}>{n.category}</span>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  {n.isImportant && <span className="notice-important-tag">⭐ Important</span>}
                  {canEdit && (
                    <>
                      <button className="delete-icon-btn" title="Edit notice" onClick={() => handleEdit(n)}>✏️</button>
                      <button className="delete-icon-btn" title="Delete notice" onClick={() => handleDelete(n._id)}>🗑</button>
                    </>
                  )}
                </div>
              </div>
              <div className="notice-title" onClick={() => setSelected(n)} style={{ cursor: 'pointer' }}>{n.title}</div>
              <div className="notice-content">{n.content}</div>
              {n.attachmentUrl && (
                <div style={{ marginTop: '0.75rem', color: '#0f172a', fontSize: '0.9rem' }}>
                  <a href={getAttachmentHref(n.attachmentUrl)} download={n.attachmentName || true} className="link-button">📎 Download attachment</a>
                </div>
              )}
              <div className="notice-footer">
                <span className="notice-by">🏢 {n.postedBy || 'Administration'}</span>
                <span>{n.degree ? `${n.degree} ${n.year || ''}` : ''} {n.department ? `· ${n.department}` : ''}</span>
                <span>{formatDate(n.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <NoticeModal notice={selected} onClose={() => setSelected(null)} onDelete={handleDelete} onEdit={(n) => { setSelected(null); handleEdit(n); }} canEdit={canEdit} />
      )}
    </>
  );
}
