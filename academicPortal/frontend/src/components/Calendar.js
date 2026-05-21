import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const TYPE_COLORS = {
  Holiday: '#16a34a', Exam: '#dc2626', Festival: '#ec4899',
  Academic: '#4f46e5', Sports: '#f97316', Cultural: '#a855f7',
};

function formatEventDate(date) {
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function AddEventForm({ onAdded, onCancel }) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({ title: '', description: '', date: today, type: 'Academic', location: '' });
  const [loading, setLoading] = useState(false);
  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    if (!form.title || !form.date) return alert('Title and date are required.');
    setLoading(true);
    try {
      await axios.post('/api/events', { ...form, color: TYPE_COLORS[form.type] || '#4f46e5' });
      onAdded();
    } catch { alert('Failed to add event.'); }
    setLoading(false);
  };

  return (
    <div className="form-card" style={{ marginBottom: '1.5rem' }}>
      <div className="page-title" style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>📅 Add New Event</div>
      <div className="form-row">
        <label className="form-label">Title *</label>
        <input className="form-input" name="title" value={form.title} onChange={handle} placeholder="Event title" />
      </div>
      <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label className="form-label">Date *</label>
          <input className="form-input" type="date" name="date" value={form.date} onChange={handle} />
        </div>
        <div>
          <label className="form-label">Type</label>
          <select className="form-select" name="type" value={form.type} onChange={handle}>
            {Object.keys(TYPE_COLORS).map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>
      <div className="form-row">
        <label className="form-label">Location</label>
        <input className="form-input" name="location" value={form.location} onChange={handle} placeholder="e.g. Main Auditorium" />
      </div>
      <div className="form-row">
        <label className="form-label">Description</label>
        <textarea className="form-textarea" name="description" value={form.description} onChange={handle} rows={3} />
      </div>
      <div className="btn-row">
        <button className="btn btn-primary" onClick={submit} disabled={loading}>{loading ? 'Saving…' : 'Add Event'}</button>
        <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

export default function Calendar() {
  const { canEdit, user } = useAuth();
  const now = new Date();
  const [year, setYear]           = useState(now.getFullYear());
  const [month, setMonth]         = useState(now.getMonth());
  const [events, setEvents]       = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [adding, setAdding]       = useState(false);
  const [selected, setSelected]   = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const fetchEvents = async () => {
    setLoading(true);
    const [monthRes, allRes] = await Promise.all([
      axios.get('/api/events', { params: { month: month + 1, year } }),
      axios.get('/api/events'),
    ]);
    setEvents(monthRes.data);
    setAllEvents(allRes.data);
    setLoading(false);
  };

  useEffect(() => { fetchEvents(); }, [month, year]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    await axios.delete(`/api/events/${id}`);
    setSelectedEvent(null);
    fetchEvents();
  };

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y-1); } else setMonth(m => m-1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y+1); } else setMonth(m => m+1); };

  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const getEventsForDay = (day) => {
    if (!day) return [];
    return events.filter(e => {
      const d = new Date(e.date);
      return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
    });
  };

  const isToday = (day) => {
    const t = new Date();
    return day && t.getDate() === day && t.getMonth() === month && t.getFullYear() === year;
  };

  const upcoming = allEvents
    .filter(e => new Date(e.date) >= new Date(now.getFullYear(), now.getMonth(), now.getDate()))
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 8);

  return (
    <>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="page-title">📅 Academic Calendar</div>
          <div className="page-desc">All holidays, exams, and events for the academic year</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className={`role-badge role-${user.role}`}>
            {user.role === 'admin' ? '🛡️' : user.role === 'faculty' ? '👨‍🏫' : '🎓'}{' '}
            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
          </span>
          {canEdit && (
            <button className="btn btn-primary" onClick={() => setAdding(!adding)}>
              {adding ? '✕ Cancel' : '+ Add Event'}
            </button>
          )}
        </div>
      </div>

      {!canEdit && (
        <div className="view-only-banner">
          👀 You are in <strong>View Only</strong> mode. Only Faculty and Admin can add or delete events.
        </div>
      )}

      {adding && canEdit && (
        <AddEventForm onAdded={() => { setAdding(false); fetchEvents(); }} onCancel={() => setAdding(false)} />
      )}

      {/* Legend */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {Object.entries(TYPE_COLORS).map(([t, c]) => (
          <span key={t} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', fontWeight: 500, color: '#6b7a99' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: c, display: 'inline-block' }} />
            {t}
          </span>
        ))}
      </div>

      <div className="calendar-layout">
        {/* Main Calendar */}
        <div className="calendar-card">
          <div className="cal-header">
            <button className="cal-nav-btn" onClick={prevMonth}>‹</button>
            <div className="cal-month-title">{MONTHS[month]} {year}</div>
            <button className="cal-nav-btn" onClick={nextMonth}>›</button>
          </div>

          <div className="cal-grid">
            {DAYS.map(d => <div key={d} className="cal-day-name">{d}</div>)}
            {cells.map((day, i) => {
              const dayEvents = getEventsForDay(day);
              return (
                <div
                  key={i}
                  className={`cal-cell ${!day ? 'empty' : ''} ${isToday(day) ? 'today' : ''} ${selected === day ? 'selected' : ''}`}
                  onClick={() => day && setSelected(day === selected ? null : day)}
                >
                  {day && <div className="cal-day-num">{day}</div>}
                  {dayEvents.slice(0, 2).map((e, j) => (
                    <div key={j} className="cal-event-dot" style={{ background: e.color || '#4f46e5' }} title={e.title} />
                  ))}
                  {dayEvents.length > 2 && <div style={{ fontSize: '0.6rem', color: '#6b7a99', marginTop: 1 }}>+{dayEvents.length - 2}</div>}
                </div>
              );
            })}
          </div>

          {selected && (
            <div style={{ marginTop: '1.25rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
              <div style={{ fontWeight: 600, color: 'var(--navy)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                Events on {selected} {MONTHS[month]}
              </div>
              {getEventsForDay(selected).length === 0 ? (
                <div style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>No events on this day.</div>
              ) : (
                getEventsForDay(selected).map(e => (
                  <div key={e._id} onClick={() => setSelectedEvent(e)}
                    style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '0.5rem 0', cursor: 'pointer', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: e.color, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--navy)' }}>{e.title}</div>
                      {e.location && <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>📍 {e.location}</div>}
                    </div>
                    {canEdit && (
                      <button className="delete-icon-btn" onClick={ev => { ev.stopPropagation(); handleDelete(e._id); }}>🗑</button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="events-sidebar">
          <div className="events-sidebar-card">
            <div className="sidebar-title">📌 Upcoming Events</div>
            {loading ? (
              <div style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Loading…</div>
            ) : upcoming.length === 0 ? (
              <div style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>No upcoming events.</div>
            ) : (
              upcoming.map(e => (
                <div key={e._id} className="event-item" onClick={() => setSelectedEvent(e)} style={{ cursor: 'pointer' }}>
                  <div className="event-dot-bar" style={{ background: e.color || '#4f46e5' }} />
                  <div style={{ flex: 1 }}>
                    <div className="event-info-title">{e.title}</div>
                    <div className="event-info-date">{formatEventDate(e.date)}</div>
                    <span className="event-type-badge" style={{ background: (e.color || '#4f46e5') + '22', color: e.color || '#4f46e5' }}>{e.type}</span>
                  </div>
                  {canEdit && (
                    <button className="delete-icon-btn" style={{ flexShrink: 0 }}
                      onClick={ev => { ev.stopPropagation(); handleDelete(e._id); }}>🗑</button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="modal-overlay" onClick={() => setSelectedEvent(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="event-type-badge" style={{
                background: (selectedEvent.color || '#4f46e5') + '22',
                color: selectedEvent.color || '#4f46e5',
                fontSize: '0.78rem', padding: '0.25rem 0.8rem', borderRadius: '999px', fontWeight: 600
              }}>{selectedEvent.type}</span>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {canEdit && (
                  <button
                    className="btn"
                    style={{ background: '#fee2e2', color: '#dc2626', padding: '0.3rem 0.8rem', fontSize: '0.8rem' }}
                    onClick={() => handleDelete(selectedEvent._id)}
                  >🗑 Delete</button>
                )}
                <button className="modal-close" onClick={() => setSelectedEvent(null)}>✕</button>
              </div>
            </div>
            <div className="modal-title" style={{ marginBottom: '0.75rem' }}>{selectedEvent.title}</div>
            <div className="modal-meta" style={{ marginTop: 0, marginBottom: '0.75rem' }}>
              📅 {formatEventDate(selectedEvent.date)}
              {selectedEvent.location && <span> · 📍 {selectedEvent.location}</span>}
            </div>
            {selectedEvent.description && <div className="modal-body">{selectedEvent.description}</div>}
          </div>
        </div>
      )}
    </>
  );
}
