import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const lastSeenRef = useRef(new Date().toISOString());

  const loadNotifications = async (since) => {
    if (!user) return;
    try {
      const response = await axios.get('/api/notifications', {
        params: since ? { since } : {},
      });
      const items = response.data.notifications || [];
      if (items.length) {
        setNotifications((current) => {
          const existing = current.map((item) => item.id);
          const merged = [...items.filter((item) => !existing.includes(item.id)), ...current];
          return merged.slice(0, 10);
        });
        if (since) {
          setUnreadCount((count) => count + items.length);
        }
      }
      if (response.data.serverTime) {
        lastSeenRef.current = response.data.serverTime;
      }
    } catch (err) {
      console.error('Notification load failed', err);
    }
  };

  useEffect(() => {
    if (!user) return;
    loadNotifications();
    const interval = setInterval(() => loadNotifications(lastSeenRef.current), 15000);
    return () => clearInterval(interval);
  }, [user]);

  const toggleOpen = () => {
    setOpen((prev) => !prev);
    if (!open) {
      setUnreadCount(0);
      lastSeenRef.current = new Date().toISOString();
    }
  };

  return (
    <div className="notification-bell">
      <button className="bell-btn" onClick={toggleOpen} title="View notifications">
        🔔
        {unreadCount > 0 && <span className="bell-badge">{unreadCount}</span>}
      </button>
      {open && (
        <div className="bell-dropdown">
          <div className="bell-dropdown-header">Recent notifications</div>
          {notifications.length === 0 ? (
            <div className="bell-empty">No new notices or events yet.</div>
          ) : (
            notifications.map((item) => (
              <div key={item.id} className="bell-item">
                <div className="bell-item-title">{item.type === 'notice' ? '📢' : '📅'} {item.title}</div>
                <div className="bell-item-detail">{item.detail?.slice(0, 80)}{item.detail?.length > 80 ? '...' : ''}</div>
              </div>
            ))
          )}
          <div className="bell-dropdown-footer">New items appear automatically when admin posts them.</div>
        </div>
      )}
    </div>
  );
}
