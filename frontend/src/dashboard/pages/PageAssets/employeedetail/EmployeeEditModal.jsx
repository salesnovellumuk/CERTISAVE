import { useState } from 'react';

const Toggle = ({ checked, onChange, label }) => (
  <label className="toggle-label">
    <div className={`toggle ${checked ? 'toggle--on' : ''}`} onClick={() => onChange(!checked)}>
      <div className="toggle-thumb" />
    </div>
    <span>{label}</span>
  </label>
);

const EmployeeEditModal = ({ editEmployee, editTab, setEditTab, onSave, onClose, saving }) => {
  const [state, setState] = useState({ ...editEmployee });
  const update = (field, val) => setState(prev => ({ ...prev, [field]: val }));
  const niChars = (state.ni_number?.replace(/\s/g, '') + '         ').split('').slice(0, 9);

  const handleSave = () => onSave(state);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box modal-box--large" onClick={e => e.stopPropagation()}>
        <div className="modal-box-header">
          <h3 className="modal-title">Edit Employee</h3>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="edit-tabs">
          <button className={`edit-tab ${editTab === 'basic' ? 'edit-tab--active' : ''}`} onClick={() => setEditTab('basic')}>Basic Info</button>
          <button className={`edit-tab ${editTab === 'training' ? 'edit-tab--active' : ''}`} onClick={() => setEditTab('training')}>Training Profile</button>
        </div>

        <div className="modal-scroll-body">
          {editTab === 'basic' && (
            <div className="edit-tab-content">
              <p className="detail-section-label">Name</p>
              <select value={state.title} onChange={e => update('title', e.target.value)} className="detail-input">
                <option value=''>Title</option>
                <option>Mr</option><option>Mrs</option><option>Ms</option>
                <option>Miss</option><option>Dr</option><option>Prof</option>
              </select>
              <div className="detail-form-row">
                <input type="text" placeholder="First name *" value={state.first_name} onChange={e => update('first_name', e.target.value)} className="detail-input" />
                <input type="text" placeholder="Middle name" value={state.middle_name} onChange={e => update('middle_name', e.target.value)} className="detail-input" />
                <input type="text" placeholder="Last name *" value={state.last_name} onChange={e => update('last_name', e.target.value)} className="detail-input" />
              </div>
              <p className="detail-section-label">Contact</p>
              <div className="detail-form-row">
                <input type="email" placeholder="Email" value={state.email} onChange={e => update('email', e.target.value)} className="detail-input" />
                <input type="tel" placeholder="Phone" value={state.phone} onChange={e => update('phone', e.target.value)} className="detail-input" />
              </div>
              <p className="detail-section-label">NI Number</p>
              <div className="ni-wrapper">
                {[0,1,2,3,4,5,6,7,8].map(i => (
                  <input key={i} id={`edit-ni-${i}`} type="text" maxLength={1}
                    value={niChars[i].trim()}
                    onChange={e => {
                      const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                      const arr = [...niChars]; arr[i] = val || ' ';
                      update('ni_number', arr.join('').trimEnd());
                      if (val && i < 8) document.getElementById(`edit-ni-${i+1}`).focus();
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Backspace' && !niChars[i].trim() && i > 0)
                        document.getElementById(`edit-ni-${i-1}`).focus();
                    }}
                    className={`ni-box ${i === 1 || i === 3 || i === 5 || i === 7 ? 'ni-box--gap' : ''}`}
                  />
                ))}
              </div>
              <p className="detail-section-label">Date of birth</p>
              <input type="date" value={state.date_of_birth} onChange={e => update('date_of_birth', e.target.value)} className="detail-input detail-input--date" />
              <p className="detail-section-label">Address</p>
              <input type="text" placeholder="Address line 1" value={state.address_line_1} onChange={e => update('address_line_1', e.target.value)} className="detail-input" />
              <input type="text" placeholder="Address line 2" value={state.address_line_2} onChange={e => update('address_line_2', e.target.value)} className="detail-input" />
              <div className="detail-form-row">
                <input type="text" placeholder="City" value={state.city} onChange={e => update('city', e.target.value)} className="detail-input" />
                <input type="text" placeholder="Postcode" value={state.postcode} onChange={e => update('postcode', e.target.value)} className="detail-input" />
              </div>
              <p className="detail-section-label">Emergency Contact</p>
              <div className="detail-form-row">
                <input type="text" placeholder="Emergency contact name" value={state.emergency_contact_name} onChange={e => update('emergency_contact_name', e.target.value)} className="detail-input" />
                <input type="tel" placeholder="Emergency contact phone" value={state.emergency_contact_phone} onChange={e => update('emergency_contact_phone', e.target.value)} className="detail-input" />
              </div>
            </div>
          )}

          {editTab === 'training' && (
            <div className="edit-tab-content">
              <p className="detail-section-label">Employment</p>
              <div className="detail-form-row">
                <input type="text" placeholder="Job title" value={state.job_title} onChange={e => update('job_title', e.target.value)} className="detail-input" />
              </div>
              <p className="detail-label">Employment start date</p>
              <input type="date" value={state.employment_start_date} onChange={e => update('employment_start_date', e.target.value)} className="detail-input detail-input--date" />
              <p className="detail-section-label">CSCS</p>
              <input type="text" placeholder="CITB HS&E test ID" value={state.citb_test_id} onChange={e => update('citb_test_id', e.target.value)} className="detail-input" />
              <p className="detail-section-label">Booking preferences</p>
              <textarea
                placeholder="Preferred providers (e.g. St John Ambulance for first aid)"
                value={state.preferred_providers}
                onChange={e => update('preferred_providers', e.target.value)}
                className="detail-input detail-input--textarea"
                rows={3}
              />
              <p className="detail-label">Max travel distance (miles)</p>
              <input
                type="number"
                placeholder="e.g. 30"
                value={state.preferred_travel_distance || ''}
                onChange={e => update('preferred_travel_distance', e.target.value ? parseInt(e.target.value) : null)}
                className="detail-input"
                style={{ maxWidth: '140px' }}
              />
              <p className="detail-section-label">Transport</p>
              <div className="toggle-group">
                <Toggle checked={state.driving_licence} onChange={v => update('driving_licence', v)} label="Has driving licence" />
                <Toggle checked={state.own_transport} onChange={v => update('own_transport', v)} label="Has own transport" />
              </div>
            </div>
          )}
        </div>

        <div className="detail-form-actions modal-actions-sticky">
          <button onClick={handleSave} disabled={saving} className="detail-save-btn">
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button onClick={onClose} className="detail-cancel-btn">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeEditModal;