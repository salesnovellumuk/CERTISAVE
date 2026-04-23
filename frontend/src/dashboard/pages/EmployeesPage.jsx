import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/EmployeesPage.css';

const validateNI = (ni) => {
  if (!ni) return true;
  const cleaned = ni.replace(/\s/g, '').toUpperCase();
  const niRegex = /^(?!BG|GB|NK|KN|TN|NT|ZZ)[A-CEGHJ-PR-TW-Z]{2}\d{6}[ABCD]$/;
  return niRegex.test(cleaned);
};

const PROFILE_FIELDS = [
  { key: 'email',       label: 'Email'   },
  { key: 'phone',       label: 'Phone'   },
  { key: 'date_of_birth', label: 'DOB'  },
  { key: 'ni_number',   label: 'NI'      },
  { key: 'address_line_1', label: 'Address' },
  { key: 'city',        label: 'City'    },
  { key: 'postcode',    label: 'Postcode' },
];

const isProfileIncomplete = (emp) => PROFILE_FIELDS.some(f => !emp[f.key]);

const EmployeesPage = () => {
  const [employees, setEmployees]               = useState([]);
  const [company, setCompany]                   = useState(null);
  const [loading, setLoading]                   = useState(true);
  const [sort, setSort]                         = useState('name_asc');
  const [showAddForm, setShowAddForm]           = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgrading, setUpgrading]               = useState(false);
  const [newEmployee, setNewEmployee]           = useState({
    first_name: '', last_name: '', email: '', phone: '',
    ni_number: '', date_of_birth: '', address_line_1: '',
    address_line_2: '', city: '', postcode: '',
  });
  const [saving, setSaving]           = useState(false);
  const [message, setMessage]         = useState('');
  const [messageType, setMessageType] = useState('success');
  const navigate = useNavigate();

  const showMessage = (msg, type = 'success') => {
    setMessage(msg); setMessageType(type);
    setTimeout(() => setMessage(''), 6000);
  };

  const fetchData = async () => {
    const [empRes, compRes] = await Promise.all([
      fetch('/api/employees/'),
      fetch('/api/company/'),
    ]);
    const [empData, compData] = await Promise.all([empRes.json(), compRes.json()]);
    setEmployees(empData);
    setCompany(compData);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleAddEmployee = async () => {
    if (!newEmployee.first_name || !newEmployee.last_name) {
      showMessage('First and last name are required', 'error');
      return;
    }
    if (!validateNI(newEmployee.ni_number)) {
      showMessage('Invalid NI number format (e.g. AB 12 34 56 C)', 'error');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/employees/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newEmployee,
          ni_number: newEmployee.ni_number.replace(/\s/g, '').toUpperCase(),
        }),
      });
      if (res.ok) {
        setNewEmployee({
          first_name: '', last_name: '', email: '', phone: '',
          ni_number: '', date_of_birth: '', address_line_1: '',
          address_line_2: '', city: '', postcode: '',
        });
        setShowAddForm(false);
        fetchData();
        showMessage('Employee added successfully');
      } else {
        const data = await res.json();
        if (data.detail === 'plan_limit_reached') {
          setShowAddForm(false);
          setShowUpgradeModal(true);
        } else {
          showMessage(JSON.stringify(data), 'error');
        }
      }
    } catch {
      showMessage('Something went wrong, please try again', 'error');
    } finally {
      setSaving(false);
    }
  };

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
        fetchData();
        showMessage('Upgraded to Growth — you can now add up to 50 employees.');
      } else {
        showMessage(data.error || 'Upgrade failed', 'error');
      }
    } catch {
      showMessage('Something went wrong', 'error');
    } finally {
      setUpgrading(false);
    }
  };

  const getSorted = () => {
    const result = [...employees];
    if (sort === 'name_asc')      return result.sort((a, b) => a.full_name.localeCompare(b.full_name));
    if (sort === 'name_desc')     return result.sort((a, b) => b.full_name.localeCompare(a.full_name));
    if (sort === 'most_certs')    return result.sort((a, b) => b.cert_count - a.cert_count);
    if (sort === 'most_expiring') return result.sort((a, b) => b.expiring_soon_count - a.expiring_soon_count);
    if (sort === 'most_expired')  return result.sort((a, b) => b.expired_count - a.expired_count);
    return result;
  };

  if (loading) return <p className="loading">Loading...</p>;

  const sorted  = getSorted();
  const atLimit = company?.at_employee_limit;
  const update  = (field, val) => setNewEmployee(prev => ({ ...prev, [field]: val }));
  const niChars = (newEmployee.ni_number.replace(/\s/g, '') + '         ').split('').slice(0, 9);

  return (
    <div className="employees-wrapper">

      {showUpgradeModal && (
        <div className="upgrade-backdrop" onClick={() => setShowUpgradeModal(false)}>
          <div className="upgrade-modal" onClick={e => e.stopPropagation()}>
            <h2 className="upgrade-modal-title">You've hit your limit</h2>
            <p className="upgrade-modal-body">
              Your Starter plan includes up to {company?.employee_limit} employees.
              Upgrade to Growth for up to 50 employees at £24.99/month.
            </p>
            <div className="upgrade-modal-actions">
              <button className="upgrade-confirm-btn" onClick={handleUpgrade} disabled={upgrading}>
                {upgrading ? 'Upgrading...' : 'Upgrade to Growth — £24.99/mo'}
              </button>
              <button className="upgrade-cancel-btn" onClick={() => setShowUpgradeModal(false)}>
                Not now
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="employees-header">
        <div className="employees-title-row">
          <h1 className="employees-title">Team</h1>
          <span className={`employees-count ${atLimit ? 'employees-count--limit' : ''}`}>
            {employees.length}/{company?.employee_limit}
          </span>
        </div>
        <p className="employees-subtitle">Click a team member to view their certs.</p>
      </div>

      {message && (
        <div className={`employees-message employees-message--${messageType}`}>{message}</div>
      )}

      <div className="employees-controls">
        <select value={sort} onChange={e => setSort(e.target.value)} className="employees-select">
          <option value='name_asc'>Name A–Z</option>
          <option value='name_desc'>Name Z–A</option>
          <option value='most_certs'>Most certs</option>
          <option value='most_expiring'>Most expiring soon</option>
          <option value='most_expired'>Most expired</option>
        </select>
        {atLimit ? (
          <button onClick={() => setShowUpgradeModal(true)} className="employees-upgrade-btn">
            Upgrade to add more ↑
          </button>
        ) : (
          <button onClick={() => setShowAddForm(!showAddForm)} className="employees-add-btn">
            + Add Employee
          </button>
        )}
      </div>

      {showAddForm && (
        <div className="employees-add-form">
          <h3 className="employees-add-form-title">Add Employee</h3>
          <p className="employees-add-section-label">Basic info</p>
          <div className="employees-add-form-row">
            <input type="text" placeholder="First name *" value={newEmployee.first_name} onChange={e => update('first_name', e.target.value)} className="employees-input" />
            <input type="text" placeholder="Last name *" value={newEmployee.last_name} onChange={e => update('last_name', e.target.value)} className="employees-input" />
          </div>
          <div className="employees-add-form-row">
            <input type="email" placeholder="Email" value={newEmployee.email} onChange={e => update('email', e.target.value)} className="employees-input" />
            <input type="tel" placeholder="Phone" value={newEmployee.phone} onChange={e => update('phone', e.target.value)} className="employees-input" />
          </div>
          <p className="employees-add-section-label">NI Number</p>
          <div className="ni-wrapper">
            {[0,1,2,3,4,5,6,7,8].map(i => (
              <input
                key={i}
                id={`ni-${i}`}
                type="text"
                maxLength={1}
                value={niChars[i].trim()}
                onChange={e => {
                  const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                  const arr = [...niChars];
                  arr[i] = val || ' ';
                  update('ni_number', arr.join('').trimEnd());
                  if (val && i < 8) document.getElementById(`ni-${i+1}`).focus();
                }}
                onKeyDown={e => {
                  if (e.key === 'Backspace' && !niChars[i].trim() && i > 0) {
                    document.getElementById(`ni-${i-1}`).focus();
                  }
                }}
                className={`ni-box ${i === 1 || i === 3 || i === 5 || i === 7 ? 'ni-box--gap' : ''}`}
              />
            ))}
          </div>
          <p className="employees-add-section-label">Date of birth</p>
          <input type="date" value={newEmployee.date_of_birth} onChange={e => update('date_of_birth', e.target.value)} className="employees-input employees-input--date" />
          <p className="employees-add-section-label">Address</p>
          <input type="text" placeholder="Address line 1" value={newEmployee.address_line_1} onChange={e => update('address_line_1', e.target.value)} className="employees-input" />
          <input type="text" placeholder="Address line 2" value={newEmployee.address_line_2} onChange={e => update('address_line_2', e.target.value)} className="employees-input" />
          <div className="employees-add-form-row">
            <input type="text" placeholder="City" value={newEmployee.city} onChange={e => update('city', e.target.value)} className="employees-input" />
            <input type="text" placeholder="Postcode" value={newEmployee.postcode} onChange={e => update('postcode', e.target.value)} className="employees-input" />
          </div>
          <div className="employees-add-form-actions">
            <button onClick={handleAddEmployee} disabled={saving} className="employees-save-btn">
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button onClick={() => { setSaving(false); setShowAddForm(false); }} className="employees-cancel-btn">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="employees-list">
        {sorted.length === 0 && <p className="employees-empty">No employees added yet.</p>}
        {sorted.map(emp => (
          <div key={emp.id} onClick={() => navigate(`/dashboard/employees/${emp.id}`)} className="employee-row">
            <div className="employee-info">
              <p className="employee-name">{emp.full_name}</p>
              <p className="employee-email">{emp.email || 'No email'}</p>
            </div>
            <div className="employee-badges">
              {emp.expired_count > 0 && (
                <span className="badge badge--danger">{emp.expired_count} expired</span>
              )}
              {emp.expiring_soon_count > 0 && (
                <span className="badge badge--warn">{emp.expiring_soon_count} expiring soon</span>
              )}
              {isProfileIncomplete(emp) && (
                <span className="badge badge--action">Action required</span>
              )}
              <span className="employee-cert-count">{emp.cert_count} certs</span>
              <span className="employee-chevron">›</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmployeesPage;