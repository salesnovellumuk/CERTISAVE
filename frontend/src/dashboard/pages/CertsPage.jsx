import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/CertsPage.css';

const STATUS_COLORS = {
  active:        '#4f6ef7',
  expiring_soon: '#f5a623',
  expired:       '#ff4d4d',
  rebooked:      '#2ecc71',
};

const formatExpiry = (cert) => {
  const [year, month, day] = cert.expiry_date.split('-');
  const date = new Date(year, month - 1, day).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
  if (cert.days_until_expiry < 0) return `Expired ${date} (${Math.abs(cert.days_until_expiry)} days ago)`;
  if (cert.days_until_expiry === 0) return `Expires today`;
  return `Expires ${date}, ${cert.days_until_expiry} days left`;
};

const CertsPage = () => {
  const [certs, setCerts]         = useState([]);
  const [employees, setEmployees] = useState({});
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState('expiry_asc');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const [certsRes, empRes] = await Promise.all([
        fetch('/api/certs/'),
        fetch('/api/employees/'),
      ]);
      const certsData = await certsRes.json();
      const empData   = await empRes.json();
      const empMap = {};
      empData.forEach(e => empMap[e.id] = e.full_name);
      setCerts(certsData);
      setEmployees(empMap);
      setLoading(false);
    };
    fetchData();
  }, []);

  const getFiltered = () => {
    let result = [...certs];
    if (filter === 'expiry_asc')  return result.sort((a, b) => a.days_until_expiry - b.days_until_expiry);
    if (filter === 'expiry_desc') return result.sort((a, b) => b.days_until_expiry - a.days_until_expiry);
    if (filter === 'newest')      return result.sort((a, b) => new Date(b.issue_date) - new Date(a.issue_date));
    if (filter === 'expired')     return result.filter(c => c.days_until_expiry < 0).sort((a, b) => a.days_until_expiry - b.days_until_expiry);
    if (filter === 'expiring_30') return result.filter(c => c.days_until_expiry >= 0 && c.days_until_expiry <= 30).sort((a, b) => a.days_until_expiry - b.days_until_expiry);
    if (filter === 'expiring_60') return result.filter(c => c.days_until_expiry >= 0 && c.days_until_expiry <= 60).sort((a, b) => a.days_until_expiry - b.days_until_expiry);
    if (filter === 'expiring_90') return result.filter(c => c.days_until_expiry >= 0 && c.days_until_expiry <= 90).sort((a, b) => a.days_until_expiry - b.days_until_expiry);
    if (filter === 'rebooked')    return result.filter(c => c.rebook_triggered);
    return result;
  };

  if (loading) return <p className="loading">Loading...</p>;

  const displayed = getFiltered();

  return (
    <div className="certs-wrapper">
      <h1 className="certs-title">Certificates</h1>
      <p className="certs-subtitle">All certs across your team.</p>

      <div className="certs-controls">
        <select value={filter} onChange={e => setFilter(e.target.value)} className="certs-select">
          <option value='expiry_asc'>Expiring soonest first</option>
          <option value='expiry_desc'>Expiring latest first</option>
          <option value='newest'>Recently added</option>
          <option value='expiring_30'>Expiring within 30 days</option>
          <option value='expiring_60'>Expiring within 60 days</option>
          <option value='expiring_90'>Expiring within 90 days</option>
          <option value='expired'>Expired</option>
          <option value='rebooked'>Rebooked</option>
        </select>
      </div>

      <div className="certs-list">
        {displayed.length === 0 && <p className="certs-empty">No certs found.</p>}
        {displayed.map(cert => (
          <div
            key={cert.id}
            onClick={() => navigate(`/dashboard/employees/${cert.employee}`)}
            className="cert-row"
            style={{ borderLeft: `4px solid ${STATUS_COLORS[cert.status] || '#4f6ef7'}` }}
          >
            <div className="cert-info">
              <p className="cert-name">{cert.cert_type_name}</p>
              <p className="cert-meta">{employees[cert.employee] || 'Unknown'}</p>
            </div>
            <div className="cert-days">
              {formatExpiry(cert)}
            </div>
            <div className="cert-divider" />
            <div className="cert-status-wrapper">
              <span
                className="cert-status"
                style={{
                  background: `${STATUS_COLORS[cert.status]}22`,
                  color: STATUS_COLORS[cert.status] || '#4f6ef7',
                }}
              >
                {(cert.status || '').replace('_', ' ')}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CertsPage;