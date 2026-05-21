import React, { useState } from 'react';
import './styles.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Notices from './components/Notices';
import Calendar from './components/Calendar';

const ROLE_META = {
  student: { icon: '🎓', color: '#4f46e5' },
  faculty: { icon: '👨‍🏫', color: '#0891b2' },
  admin:   { icon: '🛡️',  color: '#b45309' },
};

function Portal() {
  const { user, logout } = useAuth();
  const [page, setPage] = useState('notices');

  if (!user) return <Login />;

  const meta = ROLE_META[user.role] || {};

  return (
    <div className="app">
      <header className="header">
        <div className="header-logo">
          <div className="header-logo-icon">🎓</div>
          <div>
            <div className="header-title">Academic Portal</div>
            <div className="header-subtitle">Notices &amp; Calendar</div>
          </div>
        </div>

        <nav className="header-nav">
          <button className={`nav-btn ${page === 'notices' ? 'active' : ''}`} onClick={() => setPage('notices')}>
            📋 Notices
          </button>
          <button className={`nav-btn ${page === 'calendar' ? 'active' : ''}`} onClick={() => setPage('calendar')}>
            📅 Calendar
          </button>
        </nav>

        <div className="header-user">
          <div className="header-user-avatar" style={{ background: meta.color }}>
            {meta.icon}
          </div>
          <div className="header-user-info">
            <div className="header-user-name">{user.name}</div>
            <div className="header-user-role" style={{ color: meta.color }}>
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </div>
          </div>
          <button className="logout-btn" onClick={logout} title="Sign out">⏏</button>
        </div>
      </header>

      <main className="main">
        {page === 'notices'  && <Notices />}
        {page === 'calendar' && <Calendar />}
      </main>

      <footer className="footer">
        Academic Portal © {new Date().getFullYear()} · Built with React &amp; Node.js
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Portal />
    </AuthProvider>
  );
}
