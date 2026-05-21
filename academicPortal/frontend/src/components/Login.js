import React, { useState } from 'react';
import { useAuth, ROLES } from '../context/AuthContext';

const ROLE_META = {
  student: { icon: '🎓', color: '#4f46e5', label: 'Student' },
  faculty: { icon: '👨‍🏫', color: '#0891b2', label: 'Faculty' },
  admin: { icon: '🛡️', color: '#b45309', label: 'Admin' },
};

export default function Login() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(ROLES.STUDENT);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError('');
    if (!email || !password || (mode === 'register' && !name)) {
      setError('Name, email, and password are required.');
      return;
    }

    setLoading(true);
    const result = mode === 'login'
      ? await login(email, password)
      : await register(name, email, password, role);

    if (!result.success) setError(result.message);
    setLoading(false);
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-brand">
          <div className="login-brand-icon">🎓</div>
          <div className="login-brand-name">Academic Portal</div>
          <div className="login-brand-tagline">Sign in or register with your college email</div>
        </div>
        <div className="login-features">
          <div className="login-feature"><span>📋</span> View official notices</div>
          <div className="login-feature"><span>📅</span> See calendar events</div>
          <div className="login-feature"><span>🔐</span> Login with unique email accounts</div>
          <div className="login-feature"><span>👥</span> Dashboard changes based on your role</div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-card">
          <div className="login-card-title">{mode === 'login' ? 'Welcome Back' : 'Create Account'}</div>
          <div className="login-card-sub">
            {mode === 'login' ? 'Sign in to your portal' : 'Register with your college email'}
          </div>

          <div className="login-form">
            {mode === 'register' && (
              <div className="form-row">
                <label className="form-label">Full Name</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && submit()}
                />
              </div>
            )}
            <div className="form-row">
              <label className="form-label">Email</label>
              <input
                className="form-input"
                type="email"
                placeholder="your@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submit()}
              />
            </div>
            <div className="form-row">
              <label className="form-label">Password</label>
              <input
                className="form-input"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submit()}
              />
            </div>
            {mode === 'register' && (
              <div className="form-row">
                <label className="form-label">Role</label>
                <select className="form-select" value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value={ROLES.STUDENT}>Student</option>
                  <option value={ROLES.FACULTY}>Faculty</option>
                  <option value={ROLES.ADMIN}>Admin</option>
                </select>
              </div>
            )}
            {error && <div className="login-error">⚠️ {error}</div>}
            <button
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem', fontSize: '0.95rem' }}
              onClick={submit}
              disabled={loading}
            >
              {loading ? (mode === 'login' ? 'Signing in…' : 'Registering…') : (mode === 'login' ? 'Sign In →' : 'Create Account')}
            </button>
          </div>

          <div className="login-switch">
            {mode === 'login' ? (
              <span>
                New to the portal? <button className="link-button" onClick={switchMode}>Create account</button>
              </span>
            ) : (
              <span>
                Already have an account? <button className="link-button" onClick={switchMode}>Sign in</button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
