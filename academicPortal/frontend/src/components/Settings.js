import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const { user, updateProfile, logout } = useAuth();
  const [degree, setDegree] = useState(user?.degree || 'BTech');
  const [year, setYear] = useState(user?.year ? String(user.year) : '1');
  const [department, setDepartment] = useState(user?.department || 'CSE');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSave = async () => {
    setMessage('');
    setError('');
    setLoading(true);
    const result = await updateProfile(degree, Number(year), department);
    if (result.success) {
      setMessage('✓ Profile updated successfully!');
    } else {
      setError(result.message || 'Failed to update profile');
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '0 1rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>⚙️ Settings</div>
        <div style={{ fontSize: '0.95rem', color: '#64748b' }}>Manage your profile and academic information</div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#64748b', marginBottom: '0.5rem' }}>ACCOUNT INFO</div>
          <div style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.25rem' }}>{user?.name}</div>
          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{user?.email}</div>
          <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.5rem' }}>
            Role: <span style={{ fontWeight: 600, color: '#475569' }}>{user?.role.charAt(0).toUpperCase() + user?.role.slice(1)}</span>
          </div>
        </div>

        {user?.role === 'student' && (
          <>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Degree</label>
              <select
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: '0.5rem',
                  fontSize: '0.95rem',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                }}
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
              >
                <option>BTech</option>
                <option>MTech</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Year</label>
                <select
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: '0.5rem',
                    fontSize: '0.95rem',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                  }}
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                >
                  {degree === 'BTech' ? (
                    ['1', '2', '3', '4'].map(y => <option key={y}>{y}</option>)
                  ) : (
                    ['1', '2'].map(y => <option key={y}>{y}</option>)
                  )}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Department</label>
                <select
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: '0.5rem',
                    fontSize: '0.95rem',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                  }}
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                >
                  {['CSE', 'IT', 'ECE', 'AI&ML', 'EE', 'AI&DS', 'IoT'].map(d => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>
          </>
        )}

        {message && (
          <div style={{ padding: '0.75rem 1rem', background: '#dcfce7', color: '#166534', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.9rem', fontWeight: 500 }}>
            {message}
          </div>
        )}

        {error && (
          <div style={{ padding: '0.75rem 1rem', background: '#fee2e2', color: '#991b1b', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.9rem', fontWeight: 500 }}>
            ⚠️ {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {user?.role === 'student' && (
            <button
              onClick={handleSave}
              disabled={loading}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#4f46e5',
                color: '#fff',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: 'pointer',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Saving…' : '💾 Save Changes'}
            </button>
          )}
          <button
            onClick={logout}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#f3f4f6',
              color: '#6b7280',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            🚪 Logout
          </button>
        </div>
      </div>
    </div>
  );
}
