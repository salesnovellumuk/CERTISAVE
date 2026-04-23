import { useEffect, useState } from 'react';
import './styles/SubscriptionInactivePage.css';

const SubscriptionInactivePage = () => {
  const [company, setCompany]       = useState(null);
  const [user, setUser]             = useState(null);
  const [loading, setLoading]       = useState(true);
  const [resubscribing, setResubscribing] = useState(false);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState(false);

  const token = localStorage.getItem('token');
  const headers = { 'Authorization': `Token ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => {
    const fetchData = async () => {
      const [compRes, meRes] = await Promise.all([
        fetch('/api/company/', { headers }),
        fetch('/api/me/', { headers }),
      ]);
      const [compData, meData] = await Promise.all([compRes.json(), meRes.json()]);
      setCompany(compData);
      setUser(meData);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleResubscribe = async () => {
    setResubscribing(true);
    setError('');
    try {
      const res = await fetch('/api/payments/resubscribe/', { method: 'POST', headers });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => { window.location.href = '/dashboard'; }, 2000);
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch { setError('Something went wrong'); }
    finally { setResubscribing(false); }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  if (loading) return (
    <div className="inactive-page">
      <p className="inactive-loading">Loading...</p>
    </div>
  );

  if (success) return (
    <div className="inactive-page">
      <div className="inactive-card">
        <div className="inactive-success-icon">✓</div>
        <h1 className="inactive-title">You're back!</h1>
        <p className="inactive-sub">Your subscription has been reactivated. Redirecting you to your dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="inactive-page">
      <div className="inactive-card">
        <div className="inactive-icon">⚠</div>
        <h1 className="inactive-title">Subscription inactive</h1>
        <p className="inactive-sub">
          Hi {user?.first_name} — your {company?.name} subscription is currently inactive.
          Reactivate to continue tracking your team's certifications.
        </p>

        <div className="inactive-plan">
          <div className="inactive-plan-row">
            <span>Plan</span>
            <span>{company?.plan === 'growth' ? 'Growth' : 'Starter'}</span>
          </div>
          <div className="inactive-plan-row">
            <span>Price</span>
            <span>{company?.plan === 'growth' ? '£24.99' : '£12.99'}/month</span>
          </div>
        </div>

        {error && <p className="inactive-error">{error}</p>}

        <button
          className="inactive-resubscribe-btn"
          onClick={handleResubscribe}
          disabled={resubscribing}
        >
          {resubscribing ? 'Reactivating...' : 'Reactivate subscription →'}
        </button>

        <button className="inactive-logout-btn" onClick={handleLogout}>
          Log out
        </button>
      </div>
    </div>
  );
};

export default SubscriptionInactivePage;