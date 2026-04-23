import { useEffect, useState } from 'react';
import './styles/NotificationsPage.css';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    const res = await fetch('/api/notifications/');
    const data = await res.json();
    setNotifications(data);
    setLoading(false);
  };

  useEffect(() => { fetchNotifications(); }, []);

  const markRead = async (id) => {
    await fetch(`/api/notifications/${id}/read/`, { method: 'POST' });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.read);
    await Promise.all(unread.map(n => fetch(`/api/notifications/${n.id}/read/`, { method: 'POST' })));
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) return <p className="loading">Loading...</p>;

  return (
    <div className="notifs-wrapper">
      <div className="notifs-header">
        <div>
          <h1 className="notifs-title">Notifications</h1>
          <p className="notifs-subtitle">{unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="notifs-mark-all-btn">Mark all as read</button>
        )}
      </div>
      {notifications.length === 0 && <p className="notifs-empty">No notifications yet.</p>}
      <div className="notifs-list">
        {notifications.map(n => (
          <div key={n.id} className={`notif-row ${n.read ? 'notif-row--read' : ''}`} onClick={() => !n.read && markRead(n.id)}>
            <div className="notif-dot-wrap">{!n.read && <span className="notif-dot" />}</div>
            <div className="notif-body">
              <p className="notif-title">{n.title}</p>
              {n.body && <p className="notif-message">{n.body}</p>}
              <p className="notif-time">{formatDate(n.created_at)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationsPage;