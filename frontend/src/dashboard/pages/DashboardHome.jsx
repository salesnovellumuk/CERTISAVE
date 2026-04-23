import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/DashboardHome.css';

const formatTime = (timeStr) => {
  if (!timeStr) return null;
  const [h, m] = timeStr.split(':');
  const date = new Date();
  date.setHours(parseInt(h), parseInt(m));
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
};

const IconClock = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);

const IconMapPin = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);

const IconBuilding = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
  </svg>
);

const STATUS_COLORS = {
  active:      '#4f6ef7',
  renewal_due: '#f5a623',
  expired:     '#ff4d4d',
  lapsed:      '#991b1b',
  rebooked:    '#2ecc71',
};

const DashboardHome = () => {
  const [company, setCompany]                   = useState(null);
  const [certs, setCerts]                       = useState([]);
  const [bookings, setBookings]                 = useState([]);
  const [loading, setLoading]                   = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgrading, setUpgrading]               = useState(false);
  const [upgradeMsg, setUpgradeMsg]             = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAll = async () => {
      const [compRes, certsRes, bookRes] = await Promise.all([
        fetch('/api/company/'),
        fetch('/api/certs/'),
        fetch('/api/booked-courses/'),
      ]);
      const [compData, certsData, bookData] = await Promise.all([
        compRes.json(), certsRes.json(), bookRes.json()
      ]);
      setCompany(compData);
      setCerts(certsData);
      setBookings(bookData);
      setLoading(false);
    };
    fetchAll();
  }, []);

  const handleUpgrade = async () => {
    setUpgrading(true);
    try {
      const res = await fetch('/api/payments/upgrade/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'growth' }),
      });
      const data = await res.json();
      if (res.ok) {
        setShowUpgradeModal(false);
        const compRes = await fetch('/api/company/');
        setCompany(await compRes.json());
        setUpgradeMsg('Upgraded to Growth — you can now add up to 50 employees.');
        setTimeout(() => setUpgradeMsg(''), 6000);
      } else {
        setUpgradeMsg(data.error || 'Upgrade failed');
      }
    } catch {
      setUpgradeMsg('Something went wrong');
    } finally {
      setUpgrading(false);
    }
  };

  if (loading) return <p className="loading">Loading...</p>;

  const urgentCerts = certs
    .filter(c => c.days_until_expiry <= 60 && !c.rebook_triggered)
    .sort((a, b) => a.days_until_expiry - b.days_until_expiry)
    .slice(0, 5);

  const upcomingBookings = bookings
    .filter(b => new Date(b.course_date) >= new Date())
    .sort((a, b) => new Date(a.course_date) - new Date(b.course_date))
    .slice(0, 4);

  const atLimit = company?.at_employee_limit;

  const stats = [
    {
      label: 'Employees',
      value: `${company?.total_employees}/${company?.employee_limit}`,
      variant: atLimit ? 'warn' : 'blue',
      action: atLimit && company?.plan === 'starter' ? () => setShowUpgradeModal(true) : null,
      actionLabel: 'Upgrade →',
    },
    { label: 'Total Certs',   value: company?.total_certs,   variant: 'blue'   },
    { label: 'Expiring Soon', value: company?.expiring_soon, variant: 'warn'   },
    { label: 'Expired',       value: company?.expired,       variant: 'danger' },
  ];

  return (
    <div className="home-wrapper">

      {showUpgradeModal && (
        <div className="home-upgrade-backdrop" onClick={() => setShowUpgradeModal(false)}>
          <div className="home-upgrade-modal" onClick={e => e.stopPropagation()}>
            <h2 className="home-upgrade-title">Upgrade to Growth</h2>
            <p className="home-upgrade-body">
              You've hit your {company?.employee_limit} employee limit on the Starter plan.
              Upgrade to Growth for up to 50 employees at £24.99/month.
            </p>
            <div className="home-upgrade-actions">
              <button className="home-upgrade-confirm" onClick={handleUpgrade} disabled={upgrading}>
                {upgrading ? 'Upgrading...' : 'Upgrade to Growth — £24.99/mo'}
              </button>
              <button className="home-upgrade-cancel" onClick={() => setShowUpgradeModal(false)}>
                Not now
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="home-header">
        <h1 className="home-title">{company?.name || 'Your Dashboard'}</h1>
        <p className="home-subtitle">Here's your compliance overview.</p>
      </div>

      {upgradeMsg && (
        <div className="home-upgrade-msg">{upgradeMsg}</div>
      )}

      <div className="stats-grid">
        {stats.map(({ label, value, variant, action, actionLabel }) => (
          <div key={label} className={`stat-card stat-card--${variant}`}>
            <p className="stat-label">{label}</p>
            <p className="stat-value">{value ?? 0}</p>
            {action && (
              <button className="stat-action" onClick={action}>{actionLabel}</button>
            )}
          </div>
        ))}
      </div>

      <div className="home-panels">

        <div className="home-panel">
          <div className="home-panel-header">
            <h2 className="home-panel-title">Needs Attention</h2>
            <button className="home-panel-link" onClick={() => navigate('/dashboard/certs')}>View all →</button>
          </div>
          {urgentCerts.length === 0 ? (
            <p className="home-empty">No certs expiring in the next 60 days.</p>
          ) : (
            <div className="urgent-list">
              {urgentCerts.map(cert => (
                <div
                  key={cert.id}
                  className="urgent-row"
                  style={{ borderLeft: `3px solid ${STATUS_COLORS[cert.status]}` }}
                  onClick={() => navigate(`/dashboard/employees/${cert.employee}`)}
                >
                  <div className="urgent-info">
                    <p className="urgent-cert">{cert.cert_type_name}</p>
                    <p className="urgent-meta">{cert.employee_name || 'Unknown'}</p>
                  </div>
                  <span
                    className="urgent-badge"
                    style={{
                      background: `${STATUS_COLORS[cert.status]}22`,
                      color: STATUS_COLORS[cert.status],
                    }}
                  >
                    {cert.days_until_expiry < 0
                      ? `${Math.abs(cert.days_until_expiry)}d overdue`
                      : `${cert.days_until_expiry}d left`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="home-panel">
          <div className="home-panel-header">
            <h2 className="home-panel-title">Upcoming Bookings</h2>
            <button className="home-panel-link" onClick={() => navigate('/dashboard/bookings')}>View all →</button>
          </div>
          {upcomingBookings.length === 0 ? (
            <p className="home-empty">No upcoming bookings.</p>
          ) : (
            <div className="upcoming-list">
              {upcomingBookings.map(b => {
                const d = new Date(b.course_date);
                return (
                  <div
                    key={b.id}
                    className="upcoming-row"
                    onClick={() => navigate(`/dashboard/bookings/${b.id}`)}
                  >
                    <div className="upcoming-date-block">
                      <span className="upcoming-day">{d.toLocaleDateString('en-GB', { day: 'numeric' })}</span>
                      <span className="upcoming-month">{d.toLocaleDateString('en-GB', { month: 'short' })}</span>
                    </div>
                    <div className="upcoming-info">
                      <p className="upcoming-name">{b.employee_name}</p>
                      <p className="upcoming-cert">{b.cert_type_name}</p>
                      <div className="upcoming-meta-row">
                        {b.course_time && <span className="upcoming-meta"><IconClock />{formatTime(b.course_time)}</span>}
                        {b.provider    && <span className="upcoming-meta"><IconBuilding />{b.provider}</span>}
                        {b.location    && <span className="upcoming-meta"><IconMapPin />{b.location}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default DashboardHome;