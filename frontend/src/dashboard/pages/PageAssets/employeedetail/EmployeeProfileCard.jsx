import { useState } from 'react';

const Field = ({ label, value }) => (
  <div className="profile-field">
    <span className="profile-field-label">{label}</span>
    <span className="profile-field-value">{value || <span className="profile-field-empty">Not set</span>}</span>
  </div>
);

const BASIC_FIELDS = [
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'date_of_birth', label: 'Date of birth' },
  { key: 'ni_number', label: 'NI number' },
  { key: 'address_line_1', label: 'Address' },
  { key: 'city', label: 'City' },
  { key: 'postcode', label: 'Postcode' },
  { key: 'emergency_contact_name', label: 'Emergency contact' },
  { key: 'emergency_contact_phone', label: 'Emergency contact phone' },
];

const TRAINING_FIELDS = [
  { key: 'job_title', label: 'Job title' },
  { key: 'employment_start_date', label: 'Start date' },
  { key: 'citb_test_id', label: 'CITB test ID' },
  { key: 'preferred_travel_distance', label: 'Max travel distance' },
];

export const ALL_PROFILE_FIELDS = [...BASIC_FIELDS, ...TRAINING_FIELDS];

export const ProfileCompletion = ({ employee }) => {
  const missing = ALL_PROFILE_FIELDS.filter(f => !employee[f.key]).map(f => f.label);
  const filled = ALL_PROFILE_FIELDS.length - missing.length;
  const pct = Math.round((filled / ALL_PROFILE_FIELDS.length) * 100);
  const colour = pct === 100 ? '#2ecc71' : pct >= 60 ? '#f5a623' : '#ff4d4d';
  if (pct === 100) return null;
  return (
    <div className="profile-completion">
      <div className="profile-completion-header">
        <span className="profile-completion-label">Profile incomplete</span>
        <span className="profile-completion-pct" style={{ color: colour }}>{pct}%</span>
      </div>
      <div className="profile-completion-track">
        <div className="profile-completion-fill" style={{ width: `${pct}%`, background: colour }} />
      </div>
      <p className="profile-completion-missing">Missing: {missing.join(', ')}</p>
    </div>
  );
};

const EmployeeProfileCard = ({ employee, onEdit, isSolo }) => {
  const [tab, setTab] = useState('basic');
  const addressParts = [employee.address_line_1, employee.address_line_2, employee.city, employee.postcode].filter(Boolean);

  return (
    <div className="profile-card">
      <div className="profile-card-top">
        <div className="profile-card-avatar">
          {employee.first_name?.[0]}{employee.last_name?.[0]}
        </div>
        <div className="profile-card-identity">
          <h1 className="detail-name">{employee.full_name}</h1>
          <p className="profile-card-role">{employee.job_title || (isSolo ? 'Sole Trader' : 'Employee')}</p>
        </div>
        <button onClick={() => onEdit('basic')} className="detail-edit-emp-btn">Edit</button>
      </div>

      <div className="profile-tabs">
        <button className={`profile-tab ${tab === 'basic' ? 'profile-tab--active' : ''}`} onClick={() => setTab('basic')}>Basic Profile</button>
        <button className={`profile-tab ${tab === 'training' ? 'profile-tab--active' : ''}`} onClick={() => setTab('training')}>Training Profile</button>
      </div>

      {tab === 'basic' && (
        <div className="profile-fields-grid">
          <Field label="Email" value={employee.email} />
          <Field label="Phone" value={employee.phone} />
          <Field label="Date of birth" value={employee.date_of_birth} />
          <Field label="NI number" value={employee.ni_number} />
          <div className="profile-field profile-field--wide">
            <span className="profile-field-label">Address</span>
            <span className="profile-field-value">
              {addressParts.length ? addressParts.join(', ') : <span className="profile-field-empty">Not set</span>}
            </span>
          </div>
          <Field label="Emergency contact" value={employee.emergency_contact_name} />
          <Field label="Emergency contact phone" value={employee.emergency_contact_phone} />
        </div>
      )}

      {tab === 'training' && (
        <div className="profile-fields-grid">
          <Field label={isSolo ? 'Trade' : 'Job title'} value={employee.job_title} />
          {!isSolo && <Field label="Start date" value={employee.employment_start_date} />}
          <Field label="CITB test ID" value={employee.citb_test_id} />
          <Field label="Max travel distance" value={employee.preferred_travel_distance ? `${employee.preferred_travel_distance} miles` : null} />
          <Field label="Driving licence" value={employee.driving_licence ? 'Yes' : 'No'} />
          <Field label="Own transport" value={employee.own_transport ? 'Yes' : 'No'} />
          <div className="profile-field profile-field--wide">
            <span className="profile-field-label">Preferred providers</span>
            <span className="profile-field-value">{employee.preferred_providers || <span className="profile-field-empty">Not set</span>}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeProfileCard;