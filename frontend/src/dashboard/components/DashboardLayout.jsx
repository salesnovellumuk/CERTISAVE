import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import styles from './DashboardLayout.module.css';

const DashboardLayout = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await fetch('/api/me/');
        if (res.ok) setUser(await res.json());
      } catch {}
    };

    const fetchNotifs = async () => {
      try {
        const res = await fetch('/api/notifications/');
        if (res.ok) {
          const data = await res.json();
          setUnreadCount(data.filter(n => !n.read).length);
        }
      } catch {}
    };

    fetchMe();
    fetchNotifs();

    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await fetch('/api/logout/', { method: 'POST' });
    navigate('/login');
  };

  const closeMenu = () => setMenuOpen(false);
  const firstName = user?.first_name || user?.email?.split('@')[0] || '—';

  return (
    <div className={styles.wrapper}>
      <aside className={`${styles.sidebar} ${menuOpen ? styles.sidebarOpen : ''}`}>

        <div className={styles.logo}>Certisave</div>

        <div className={styles.profileStrip}>
          <div className={styles.profileLeft}>
            <span className={styles.profileGreeting}>Hey,</span>
            <span className={styles.profileName}>{firstName}</span>
          </div>
          <NavLink
            to="/dashboard/notifications"
            className={({ isActive }) => `${styles.iconBtn} ${isActive ? styles.iconBtnActive : ''}`}
            onClick={() => { closeMenu(); setUnreadCount(0); }}
            title="Notifications"
          >
            <div className={styles.bellWrap}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              {unreadCount > 0 && (
                <span className={styles.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
              )}
            </div>
          </NavLink>
        </div>

        <nav className={styles.nav}>
          <NavLink to="/dashboard" end className={({ isActive }) => isActive ? styles.active : ''} onClick={closeMenu}>Overview</NavLink>
          <NavLink to="/dashboard/employees" className={({ isActive }) => isActive ? styles.active : ''} onClick={closeMenu}>Team</NavLink>
          <NavLink to="/dashboard/certs" className={({ isActive }) => isActive ? styles.active : ''} onClick={closeMenu}>Certs</NavLink>
          <NavLink to="/dashboard/bookings" className={({ isActive }) => isActive ? styles.active : ''} onClick={closeMenu}>Bookings</NavLink>
        </nav>

        <div className={styles.bottom}>
          <div className={styles.bottomRow}>
            <NavLink
              to="/dashboard/settings"
              className={({ isActive }) => `${styles.iconBtn} ${isActive ? styles.iconBtnActive : ''}`}
              onClick={closeMenu}
              title="Settings"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            </NavLink>
            <button onClick={() => setShowLogoutConfirm(true)} className={styles.logout}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.4rem', verticalAlign: 'middle' }}>
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Log out
            </button>
          </div>
        </div>

      </aside>

      {menuOpen && <div className={styles.overlay} onClick={closeMenu} />}

      <div className={styles.content}>
        <header className={styles.mobileHeader}>
          <span className={styles.mobileLogo}>Certisave</span>
          <button className={styles.hamburger} onClick={() => setMenuOpen(!menuOpen)}>
            <span className={`${styles.bar} ${menuOpen ? styles.barOpen1 : ''}`} />
            <span className={`${styles.bar} ${menuOpen ? styles.barOpen2 : ''}`} />
            <span className={`${styles.bar} ${menuOpen ? styles.barOpen3 : ''}`} />
          </button>
        </header>
        <main className={styles.main}>
          <Outlet />
        </main>
      </div>

      {showLogoutConfirm && (
        <div className={styles.modalOverlay} onClick={() => setShowLogoutConfirm(false)}>
          <div className={styles.modalBox} onClick={e => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Log out?</h3>
            <p className={styles.modalBody}>You'll need to log back in to access your dashboard.</p>
            <div className={styles.modalActions}>
              <button onClick={handleLogout} className={styles.modalConfirm}>Log out</button>
              <button onClick={() => setShowLogoutConfirm(false)} className={styles.modalCancel}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;