import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['All', 'General', 'Exam', 'Holiday', 'Event', 'Urgent'];

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function NoticeModal({ notice, onClose, onDelete, canEdit }) {
  if (!notice) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className={`notice-badge badge-${notice.category}`}>{notice.category}</span>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {canEdit && (
              <button
                className="btn"
                style={{ background: '#fee2e2', color: '#dc2626', padding: '0.3rem 0.8rem', fontSize: '0.8rem' }}
                onClick={() => { onDelete(notice._id); onClose(); }}
              >🗑 Delete</button>
            )}
            <button className="modal-close" onClick={onClose}>✕</button>
          </div>
        </div>
        <div className="modal-title" style={{ marginBottom: '0.75rem' }}>{notice.title}</div>
        <div className="modal-body">{notice.content}</div>
        <div className="modal-meta">
          Posted by <strong>{notice.postedBy}</strong> · {formatDate(notice.createdAt)}
        </div>
      </div>
    </div>
  );
}

function AddNoticeForm({ onAdded, onCancel }) {
  const [form, setForm] = useState({ title: '', content: '', category: 'General', isImportant: false, postedBy: '' });
  const [loading, setLoading] = useState(false);
  const handle = e => setForm({ ...form, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const submit = async () => {
    if (!form.title || !form.content) return alert('Title and content are required.');
    setLoading(true);
    try { await axios.post('/api/notices', form); onAdded(); }
    catch { alert('Failed to add notice.'); }
    setLoading(false);
  };

  return (
    <div className="form-card" style={{ marginBottom: '1.5rem' }}>
      <div className="page-title" style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>📝 Add New Notice</div>
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
            {['General','Exam','Holiday','Event','Urgent'].map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">Posted By</label>
          <input className="form-input" name="postedBy" value={form.postedBy} onChange={handle} placeholder="Department / Name" />
        </div>
      </div>
      <label className="form-checkbox-row">
        <input type="checkbox" name="isImportant" checked={form.isImportant} onChange={handle} />
        Mark as Important
      </label>
      <div className="btn-row">
        <button className="btn btn-primary" onClick={submit} disabled={loading}>{loading ? 'Saving…' : 'Post Notice'}</button>
        <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

export default function Notices() {
  const { canEdit, user } = useAuth();
  const [notices, setNotices]   = useState([]);
  const [active, setActive]     = useState('All');
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);
  const [adding, setAdding]     = useState(false);

  const fetchNotices = async () => {
    setLoading(true);
    const params = active !== 'All' ? { category: active } : {};
    const res = await axios.get('/api/notices', { params });
    setNotices(res.data);
    setLoading(false);
  };

  useEffect(() => { fetchNotices(); }, [active]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this notice?')) return;
    await axios.delete(`/api/notices/${id}`);
    fetchNotices();
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
            <button className="btn btn-primary" onClick={() => setAdding(!adding)}>
              {adding ? '✕ Cancel' : '+ Add Notice'}
            </button>
          )}
        </div>
      </div>

      {!canEdit && (
        <div className="view-only-banner">
          👀 You are in <strong>View Only</strong> mode. Only Faculty and Admin can post or delete notices.
        </div>
      )}

      {adding && canEdit && (
        <AddNoticeForm onAdded={() => { setAdding(false); fetchNotices(); }} onCancel={() => setAdding(false)} />
      )}

      <div className="filter-bar">
        {CATEGORIES.map(c => (
          <button key={c} className={`filter-chip ${active === c ? 'active' : ''}`} onClick={() => setActive(c)}>{c}</button>
        ))}
      </div>

      {loading ? (
        <div className="loading">Loading notices…</div>
      ) : notices.length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon">📭</div><div>No notices found.</div></div>
      ) : (
        <div className="notices-grid">
          {notices.map(n => (
            <div key={n._id} className={`notice-card ${n.isImportant ? 'important' : ''}`}>
              <div className="notice-meta">
                <span className={`notice-badge badge-${n.category}`}>{n.category}</span>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  {n.isImportant && <span className="notice-important-tag">⭐ Important</span>}
                  {canEdit && (
                    <button className="delete-icon-btn" title="Delete notice" onClick={() => handleDelete(n._id)}>🗑</button>
                  )}
                </div>
              </div>
              <div className="notice-title" onClick={() => setSelected(n)} style={{ cursor: 'pointer' }}>{n.title}</div>
              <div className="notice-content">{n.content}</div>
              <div className="notice-footer">
                <span className="notice-by">🏢 {n.postedBy || 'Administration'}</span>
                <span>{formatDate(n.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <NoticeModal notice={selected} onClose={() => setSelected(null)} onDelete={handleDelete} canEdit={canEdit} />
      )}
    </>
  );
}
