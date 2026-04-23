import { useEffect, useState } from 'react';
import './styles/SettingsPage.css';

const CANCEL_REASONS = [
  { id: 'too_expensive',    label: 'Too expensive' },
  { id: 'not_using',        label: 'Not using it enough' },
  { id: 'missing_features', label: 'Missing features I need' },
  { id: 'switching',        label: 'Switching to another service' },
  { id: 'temporary',        label: 'Just taking a break' },
  { id: 'other',            label: 'Other' },
];

const SettingsPage = () => {
  const [company, setCompany]             = useState(null);
  const [user, setUser]                   = useState(null);
  const [loading, setLoading]             = useState(true);
  const [cancelling, setCancelling]       = useState(false);
  const [resubscribing, setResubscribing] = useState(false);
  const [showConfirm, setShowConfirm]     = useState(false);
  const [cancelStep, setCancelStep]       = useState('quiz');
  const [cancelReason, setCancelReason]   = useState('');
  const [cancelFeedback, setCancelFeedback] = useState('');
  const [message, setMessage]             = useState('');
  const [messageType, setMessageType]     = useState('success');

  const showMsg = (msg, type = 'success') => {
    setMessage(msg); setMessageType(type);
    setTimeout(() => setMessage(''), 6000);
  };

  const fetchData = async () => {
    const [compRes, meRes] = await Promise.all([
      fetch('/api/company/'),
      fetch('/api/me/'),
    ]);
    const [compData, meData] = await Promise.all([compRes.json(), meRes.json()]);
    setCompany(compData);
    setUser(meData);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openCancelModal = () => {
    setCancelStep('quiz'); setCancelReason(''); setCancelFeedback(''); setShowConfirm(true);
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const res = await fetch('/api/payments/cancel/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: cancelReason, feedback: cancelFeedback }),
      });
      const data = await res.json();
      if (res.ok) {
        setShowConfirm(false);
        showMsg("Subscription cancelled. You'll have access until the end of your billing period.");
        fetchData();
      } else { showMsg(data.error || 'Something went wrong', 'error'); }
    } catch { showMsg('Something went wrong', 'error'); }
    finally { setCancelling(false); }
  };

  const handleResubscribe = async () => {
    setResubscribing(true);
    try {
      const res = await fetch('/api/payments/resubscribe/', { method: 'POST' });
      const data = await res.json();
      if (res.ok) { showMsg('Subscription reactivated — welcome back!'); fetchData(); }
      else { showMsg(data.error || 'Something went wrong', 'error'); }
    } catch { showMsg('Something went wrong', 'error'); }
    finally { setResubscribing(false); }
  };

  if (loading) return <p className="loading">Loading...</p>;

  const planLabel          = company?.plan === 'growth' ? 'Growth' : 'Starter';
  const planPrice          = company?.plan === 'growth' ? '£24.99' : '£12.99';
  const planLimit          = company?.employee_limit;
  const subscriptionActive = company?.subscription_active;

  return (
    <div className="settings-wrapper">
      {showConfirm && (
        <div className="settings-backdrop" onClick={() => setShowConfirm(false)}>
          <div className="settings-modal" onClick={e => e.stopPropagation()}>
            {cancelStep === 'quiz' && (
              <>
                <h2 className="settings-modal-title">Before you go...</h2>
                <p className="settings-modal-body">Help us improve — what's the main reason you're cancelling?</p>
                <div className="settings-cancel-reasons">
                  {CANCEL_REASONS.map(r => (
                    <button key={r.id} className={`settings-cancel-reason ${cancelReason === r.id ? 'settings-cancel-reason--active' : ''}`} onClick={() => setCancelReason(r.id)}>
                      {r.label}
                    </button>
                  ))}
                </div>
                <textarea className="settings-cancel-feedback" placeholder="Anything else you'd like us to know? (optional)" value={cancelFeedback} onChange={e => setCancelFeedback(e.target.value)} rows={3} />
                <div className="settings-modal-actions">
                  <button className="settings-modal-back" onClick={() => setShowConfirm(false)}>Actually, keep my subscription</button>
                  <button className="settings-cancel-confirm" onClick={() => setCancelStep('confirm')} disabled={!cancelReason}>Continue to cancel →</button>
                </div>
              </>
            )}
            {cancelStep === 'confirm' && (
              <>
                <h2 className="settings-modal-title">Are you sure?</h2>
                <p className="settings-modal-body">Your subscription will cancel at the end of your current billing period. You'll keep full access until then and won't be charged again.</p>
                <div className="settings-cancel-summary">
                  <span className="settings-cancel-summary-label">Reason</span>
                  <span className="settings-cancel-summary-value">{CANCEL_REASONS.find(r => r.id === cancelReason)?.label}</span>
                </div>
                <div className="settings-modal-actions">
                  <button className="settings-modal-back" onClick={() => setShowConfirm(false)}>Keep my subscription</button>
                  <button className="settings-cancel-confirm" onClick={handleCancel} disabled={cancelling}>
                    {cancelling ? 'Cancelling...' : 'Yes, cancel my subscription'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="settings-header">
        <h1 className="settings-title">Settings</h1>
        <p className="settings-subtitle">Manage your account and subscription.</p>
      </div>

      {message && <div className={`settings-message settings-message--${messageType}`}>{message}</div>}

      <div className="settings-section">
        <h2 className="settings-section-title">Account</h2>
        <div className="settings-card">
          <div className="settings-row"><span className="settings-row-label">Name</span><span className="settings-row-value">{user?.first_name} {user?.last_name}</span></div>
          <div className="settings-row"><span className="settings-row-label">Email</span><span className="settings-row-value">{user?.email}</span></div>
          <div className="settings-row"><span className="settings-row-label">Company</span><span className="settings-row-value">{company?.name}</span></div>
        </div>
      </div>

      <div className="settings-section">
        <h2 className="settings-section-title">Plan</h2>
        <div className="settings-card">
          <div className="settings-row">
            <span className="settings-row-label">Current plan</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="settings-plan-badge">{planLabel}</span>
              {!subscriptionActive && <span className="settings-plan-cancelled-badge">Cancelled</span>}
            </div>
          </div>
          <div className="settings-row"><span className="settings-row-label">Price</span><span className="settings-row-value">{planPrice}/month</span></div>
          <div className="settings-row"><span className="settings-row-label">Employee limit</span><span className="settings-row-value">{company?.total_employees} of {planLimit} used</span></div>
          {company?.plan === 'starter' && subscriptionActive && (
            <div className="settings-row">
              <span className="settings-row-label">Need more?</span>
              <span className="settings-row-value settings-row-hint">Upgrade to Growth for up to 50 employees at £24.99/month — contact us to upgrade.</span>
            </div>
          )}
        </div>
      </div>

      <div className="settings-section">
        <h2 className={`settings-section-title ${subscriptionActive ? 'settings-section-title--danger' : 'settings-section-title--success'}`}>
          {subscriptionActive ? 'Danger Zone' : 'Reactivate'}
        </h2>
        <div className={`settings-card ${subscriptionActive ? 'settings-card--danger' : 'settings-card--success'}`}>
          <div className="settings-danger-row">
            {subscriptionActive ? (
              <>
                <div>
                  <p className="settings-danger-label">Cancel subscription</p>
                  <p className="settings-danger-hint">Your access continues until the end of your billing period. No further charges.</p>
                </div>
                <button className="settings-cancel-btn" onClick={openCancelModal}>Cancel subscription</button>
              </>
            ) : (
              <>
                <div>
                  <p className="settings-success-label">Reactivate subscription</p>
                  <p className="settings-success-hint">Your subscription has been cancelled. Reactivate to continue using Certisave and resume automatic cert renewals.</p>
                </div>
                <button className="settings-resubscribe-btn" onClick={handleResubscribe} disabled={resubscribing}>
                  {resubscribing ? 'Reactivating...' : 'Reactivate →'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;