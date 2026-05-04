import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import EmployeeProfileCard, { ProfileCompletion } from './PageAssets/employeedetail/EmployeeProfileCard';
import EmployeeEditModal from './PageAssets/employeedetail/EmployeeEditModal';
import { IPAFExtras, PASMAExtras, GenericExtras } from './PageAssets/employeedetail/CertExtras';
import './styles/EmployeeDetailPage.css';

const STATUS_COLORS = {
  active:      '#4f6ef7',
  renewal_due: '#f5a623',
  expired:     '#ff4d4d',
  lapsed:      '#991b1b',
  rebooked:    '#2ecc71',
};

const CertTypeToggle = ({ isNew, onChange }) => (
  <div className="cert-type-toggle">
    <button type="button" className={`cert-type-btn ${isNew ? 'cert-type-btn--active' : ''}`} onClick={() => onChange(true)}>New cert</button>
    <button type="button" className={`cert-type-btn ${!isNew ? 'cert-type-btn--active' : ''}`} onClick={() => onChange(false)}>Renewal</button>
  </div>
);

const EmployeeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee]             = useState(null);
  const [certTypes, setCertTypes]           = useState([]);
  const [loading, setLoading]               = useState(true);
  const [isSolo, setIsSolo]                 = useState(false);
  const [showAddForm, setShowAddForm]       = useState(false);
  const [newCert, setNewCert]               = useState({ cert_type: '', issue_date: '', certificate_number: '', is_first_application: true, notes: '', extras: {} });
  const [saving, setSaving]                 = useState(false);
  const [message, setMessage]               = useState('');
  const [messageType, setMessageType]       = useState('success');
  const [certSort, setCertSort]             = useState('expiry_asc');
  const [showEdit, setShowEdit]             = useState(false);
  const [editTab, setEditTab]               = useState('basic');
  const [editEmployee, setEditEmployee]     = useState({});
  const [savingEmployee, setSavingEmployee] = useState(false);
  const [deleteModal, setDeleteModal]       = useState(null);
  const [deleteConfirm, setDeleteConfirm]   = useState('');
  const [deleting, setDeleting]             = useState(false);
  const [editModal, setEditModal]           = useState(null);
  const [editData, setEditData]             = useState({});
  const [editConfirm, setEditConfirm]       = useState('');
  const [editing, setEditing]               = useState(false);
  const [openMenu, setOpenMenu]             = useState(null);

  const headers = { 'Content-Type': 'application/json' };
  const opts    = { credentials: 'include' };

  const showMessage = (msg, type = 'success') => {
    setMessage(msg); setMessageType(type);
    setTimeout(() => setMessage(''), 6000);
  };

  const fetchEmployee = async () => {
    const res = await fetch(`/api/employees/${id}/`, opts);
    const data = await res.json();
    setEmployee(data);
    setEditEmployee({
      title:                     data.title || '',
      first_name:                data.first_name || '',
      middle_name:               data.middle_name || '',
      last_name:                 data.last_name || '',
      email:                     data.email || '',
      phone:                     data.phone || '',
      ni_number:                 data.ni_number || '',
      date_of_birth:             data.date_of_birth || '',
      address_line_1:            data.address_line_1 || '',
      address_line_2:            data.address_line_2 || '',
      city:                      data.city || '',
      postcode:                  data.postcode || '',
      emergency_contact_name:    data.emergency_contact_name || '',
      emergency_contact_phone:   data.emergency_contact_phone || '',
      job_title:                 data.job_title || '',
      employment_start_date:     data.employment_start_date || '',
      citb_test_id:              data.citb_test_id || '',
      preferred_providers:       data.preferred_providers || '',
      preferred_travel_distance: data.preferred_travel_distance || null,
      driving_licence:           data.driving_licence || false,
      own_transport:             data.own_transport || false,
    });
    setLoading(false);
  };

  const fetchCertTypes = async () => {
    const res = await fetch('/api/cert-types/', opts);
    setCertTypes(await res.json());
  };

  const fetchMe = async () => {
    try {
      const res = await fetch('/api/me/', opts);
      if (res.ok) {
        const data = await res.json();
        setIsSolo(data.is_solo);
      }
    } catch {}
  };

  useEffect(() => { fetchEmployee(); fetchCertTypes(); fetchMe(); }, [id]);

  const getSortedCerts = () => {
    if (!employee) return [];
    const result = [...employee.certs];
    if (certSort === 'expiry_asc')  return result.sort((a, b) => a.days_until_expiry - b.days_until_expiry);
    if (certSort === 'expiry_desc') return result.sort((a, b) => b.days_until_expiry - a.days_until_expiry);
    if (certSort === 'name_asc')    return result.sort((a, b) => a.cert_type_name.localeCompare(b.cert_type_name));
    if (certSort === 'name_desc')   return result.sort((a, b) => b.cert_type_name.localeCompare(a.cert_type_name));
    return result;
  };

  const handleSaveEmployee = async (data) => {
    setSavingEmployee(true);
    try {
      const cleaned = {
        ...data,
        ni_number: data.ni_number.replace(/\s/g, '').toUpperCase(),
      };
      if (!cleaned.employment_start_date) delete cleaned.employment_start_date;
      if (!cleaned.date_of_birth) delete cleaned.date_of_birth;

      const res = await fetch(`/api/employees/${id}/`, {
        method: 'PATCH',
        headers,
        ...opts,
        body: JSON.stringify(cleaned),
      });
      if (res.ok) {
        fetchEmployee();
        setShowEdit(false);
        showMessage(isSolo ? 'Profile updated successfully' : 'Employee updated successfully');
      } else {
        const d = await res.json();
        console.log('PATCH error body:', d);
        showMessage(JSON.stringify(d), 'error');
      }
    } catch (e) {
      console.log('catch error:', e);
      showMessage('Something went wrong', 'error');
    }
    finally { setSavingEmployee(false); }
  };

  const handleAddCert = async () => {
    if (!newCert.cert_type || !newCert.issue_date) {
      showMessage('Cert type and issue date are required', 'error');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/certs/', {
        method: 'POST',
        headers,
        ...opts,
        body: JSON.stringify({ ...newCert, employee: id }),
      });
      if (res.ok) {
        setNewCert({ cert_type: '', issue_date: '', certificate_number: '', is_first_application: true, notes: '', extras: {} });
        setShowAddForm(false);
        fetchEmployee();
        showMessage('Certificate added successfully');
      } else {
        const d = await res.json();
        showMessage(d.non_field_errors?.[0] || JSON.stringify(d), 'error');
      }
    } catch { showMessage('Something went wrong', 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (deleteConfirm !== 'DELETE CERT') return;
    setDeleting(true);
    const res = await fetch(`/api/certs/${deleteModal.id}/`, { method: 'DELETE', ...opts });
    if (res.ok) {
      setDeleteModal(null);
      setDeleteConfirm('');
      fetchEmployee();
      showMessage('Certificate deleted');
    } else {
      showMessage('Failed to delete', 'error');
    }
    setDeleting(false);
  };

  const handleEditCert = async () => {
    if (editConfirm !== 'CHANGE') return;
    setEditing(true);
    const res = await fetch(`/api/certs/${editModal.id}/`, {
      method: 'PATCH',
      headers,
      ...opts,
      body: JSON.stringify(editData),
    });
    if (res.ok) {
      setEditModal(null);
      setEditConfirm('');
      fetchEmployee();
      showMessage('Certificate updated');
    } else {
      const d = await res.json();
      showMessage(JSON.stringify(d), 'error');
    }
    setEditing(false);
  };

  const openEditModal = (cert) => {
    setEditModal(cert);
    setEditData({
      cert_type:            cert.cert_type,
      issue_date:           cert.issue_date,
      certificate_number:   cert.certificate_number || '',
      is_first_application: cert.is_first_application || false,
      notes:                cert.notes || '',
      extras:               cert.extras || {},
    });
    setEditConfirm('');
  };

  const getCertTypeName = (certTypeId) => certTypes.find(ct => ct.id === parseInt(certTypeId))?.name || '';

  const renderExtras = (certTypeId, extras, onChange) => {
    const name = getCertTypeName(certTypeId);
    if (!certTypeId) return null;
    if (name.includes('IPAF'))  return <IPAFExtras extras={extras} onChange={onChange} />;
    if (name.includes('PASMA')) return <PASMAExtras extras={extras} onChange={onChange} />;
    return <GenericExtras extras={extras} onChange={onChange} />;
  };

  if (loading) return <p className="loading">Loading...</p>;

  const sortedCerts = getSortedCerts();

  return (
    <div className="detail-wrapper">
      {!isSolo && (
        <button onClick={() => navigate('/dashboard/employees')} className="detail-back">← Back to Team</button>
      )}

      {message && <div className={`detail-message detail-message--${messageType}`}>{message}</div>}

      <EmployeeProfileCard
        employee={employee}
        onEdit={(tab) => { setEditTab(tab); setShowEdit(true); }}
        isSolo={isSolo}
      />

      <ProfileCompletion employee={employee} />

      {showEdit && (
        <EmployeeEditModal
          editEmployee={editEmployee}
          editTab={editTab}
          setEditTab={setEditTab}
          onSave={handleSaveEmployee}
          onClose={() => setShowEdit(false)}
          saving={savingEmployee}
          isSolo={isSolo}
        />
      )}

      <div className="detail-certs-header">
        <h2 className="detail-certs-title">{isSolo ? 'Your Certificates' : 'Certificates'}</h2>
        <div className="detail-certs-actions">
          <select value={certSort} onChange={e => setCertSort(e.target.value)} className="detail-sort-select">
            <option value='expiry_asc'>Expiring soonest</option>
            <option value='expiry_desc'>Expiring latest</option>
            <option value='name_asc'>Name A–Z</option>
            <option value='name_desc'>Name Z–A</option>
          </select>
          <button onClick={() => setShowAddForm(!showAddForm)} className="detail-add-btn">+ Add Cert</button>
        </div>
      </div>

      {showAddForm && (
        <div className="detail-add-form">
          <h3 className="detail-add-form-title">Add Certificate</h3>
          <select
            value={newCert.cert_type}
            onChange={e => setNewCert({ ...newCert, cert_type: e.target.value, extras: {} })}
            className="detail-input"
          >
            <option value=''>Select cert type</option>
            {certTypes.map(ct => <option key={ct.id} value={ct.id}>{ct.name}</option>)}
          </select>
          <CertTypeToggle isNew={newCert.is_first_application} onChange={v => setNewCert({ ...newCert, is_first_application: v })} />
          {renderExtras(newCert.cert_type, newCert.extras, extras => setNewCert({ ...newCert, extras }))}
          <label className="detail-label">Issue date</label>
          <input type='date' value={newCert.issue_date} onChange={e => setNewCert({ ...newCert, issue_date: e.target.value })} className="detail-input detail-input--date" />
          <input type='text' placeholder='Certificate / card number (optional)' value={newCert.certificate_number} onChange={e => setNewCert({ ...newCert, certificate_number: e.target.value })} className="detail-input" />
          <input type='text' placeholder='Notes (optional)' value={newCert.notes} onChange={e => setNewCert({ ...newCert, notes: e.target.value })} className="detail-input" />
          <div className="detail-form-actions">
            <button onClick={handleAddCert} disabled={saving} className="detail-save-btn">{saving ? 'Saving...' : 'Save'}</button>
            <button onClick={() => { setSaving(false); setShowAddForm(false); }} className="detail-cancel-btn">Cancel</button>
          </div>
        </div>
      )}

      <div className="detail-certs-list">
        {sortedCerts.length === 0 && <p className="detail-empty">No certs added yet.</p>}
        {sortedCerts.map(cert => (
          <div key={cert.id} className="cert-row" style={{ borderLeft: `4px solid ${STATUS_COLORS[cert.status] || '#4f6ef7'}` }}>
            <div className="cert-info">
              <p className="cert-name">{cert.cert_type_name}</p>
              <p className="cert-expiry">Expires: {cert.expiry_date}</p>
              {cert.certificate_number && <p className="cert-ref">Ref: {cert.certificate_number}</p>}
              {cert.is_first_application && <p className="cert-ref cert-ref--first">New cert</p>}
              {cert.extras?.preferred_location && <p className="cert-ref">📍 {cert.extras.preferred_location}</p>}
            </div>
            <div className="cert-days">
              {cert.days_until_expiry > 0 ? `${cert.days_until_expiry}d left` : `${Math.abs(cert.days_until_expiry)}d overdue`}
            </div>

            <div className="cert-buttons cert-buttons--desktop">
              <button onClick={() => openEditModal(cert)} className="cert-manage-btn">Manage</button>
              <button onClick={() => { setDeleteModal(cert); setDeleteConfirm(''); }} className="cert-delete-btn">Delete</button>
            </div>

            <div className="cert-divider" />

            <div className="cert-status-wrapper">
              <span className="cert-status" style={{ background: `${STATUS_COLORS[cert.status]}22`, color: STATUS_COLORS[cert.status] || '#4f6ef7' }}>
                {(cert.status || '').replace(/_/g, ' ')}
              </span>
            </div>

            <div className="cert-dots-wrap">
              <button className="cert-dots-btn" onClick={e => { e.stopPropagation(); setOpenMenu(openMenu === cert.id ? null : cert.id); }}>
                ⋯
              </button>
            </div>
          </div>
        ))}
      </div>

      {openMenu !== null && (
        <>
          <div className="cert-dots-backdrop" onClick={() => setOpenMenu(null)} />
          <div className="cert-dots-menu">
            <div className="cert-dots-menu-handle" />
            <button onClick={() => {
              const cert = sortedCerts.find(c => c.id === openMenu);
              if (cert) openEditModal(cert);
              setOpenMenu(null);
            }}>
              Manage
            </button>
            <button
              className="cert-dots-delete"
              onClick={() => {
                const cert = sortedCerts.find(c => c.id === openMenu);
                if (cert) { setDeleteModal(cert); setDeleteConfirm(''); }
                setOpenMenu(null);
              }}
            >
              Delete
            </button>
          </div>
        </>
      )}

      {deleteModal && (
        <div className="modal-overlay" onClick={() => setDeleteModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-box-header">
              <h3 className="modal-title">Delete Certificate</h3>
              <button className="modal-close-btn" onClick={() => setDeleteModal(null)}>✕</button>
            </div>
            <p className="modal-body">You are about to delete <strong className="modal-strong">{deleteModal.cert_type_name}</strong> for {employee.full_name}. This cannot be undone.</p>
            <p className="modal-warning">Type <strong>DELETE CERT</strong> to confirm</p>
            <input type='text' value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)} placeholder='DELETE CERT' className="detail-input" />
            <div className="detail-form-actions">
              <button onClick={handleDelete} disabled={deleteConfirm !== 'DELETE CERT' || deleting} className={`modal-confirm-btn ${deleteConfirm === 'DELETE CERT' ? 'modal-confirm-btn--active' : ''}`}>
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
              <button onClick={() => setDeleteModal(null)} className="detail-cancel-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {editModal && (
        <div className="modal-overlay" onClick={() => setEditModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-box-header">
              <h3 className="modal-title">Manage Certificate</h3>
              <button className="modal-close-btn" onClick={() => setEditModal(null)}>✕</button>
            </div>
            <div className="modal-scroll-body">
              <select value={editData.cert_type} onChange={e => setEditData({ ...editData, cert_type: e.target.value, extras: {} })} className="detail-input">
                {certTypes.map(ct => <option key={ct.id} value={ct.id}>{ct.name}</option>)}
              </select>
              <CertTypeToggle isNew={editData.is_first_application} onChange={v => setEditData({ ...editData, is_first_application: v })} />
              {renderExtras(editData.cert_type, editData.extras || {}, extras => setEditData({ ...editData, extras }))}
              <label className="detail-label" style={{ marginTop: '0.5rem' }}>Issue date</label>
              <input type='date' value={editData.issue_date} onChange={e => setEditData({ ...editData, issue_date: e.target.value })} className="detail-input detail-input--date" />
              <input type='text' placeholder='Certificate number (optional)' value={editData.certificate_number} onChange={e => setEditData({ ...editData, certificate_number: e.target.value })} className="detail-input" style={{ marginTop: '0.75rem' }} />
              <input type='text' placeholder='Notes (optional)' value={editData.notes} onChange={e => setEditData({ ...editData, notes: e.target.value })} className="detail-input" style={{ marginTop: '0.75rem' }} />
              <p className="modal-change-warning" style={{ marginTop: '0.75rem' }}>Type <strong>CHANGE</strong> to confirm</p>
              <input type='text' value={editConfirm} onChange={e => setEditConfirm(e.target.value)} placeholder='CHANGE' className="detail-input" style={{ marginTop: '0.5rem' }} />
            </div>
            <div className="detail-form-actions modal-actions-sticky">
              <button onClick={handleEditCert} disabled={editConfirm !== 'CHANGE' || editing} className={`modal-edit-btn ${editConfirm === 'CHANGE' ? 'modal-edit-btn--active' : ''}`}>
                {editing ? 'Saving...' : 'Save changes'}
              </button>
              <button onClick={() => setEditModal(null)} className="detail-cancel-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDetailPage;