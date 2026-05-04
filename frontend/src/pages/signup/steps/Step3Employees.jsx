const CERTS = ['CSCS', 'First Aid', 'IPAF', 'PASMA', 'Asbestos Awareness', 'Manual Handling', 'Fire Safety', 'SMSTS', 'SSSTS'];

const Step3Employees = ({ employees, setEmployees, expandedEmp, setExpandedEmp, onNext, onBack, loading, error, isSolo }) => {
  const addEmployee = () => { setEmployees([...employees, blankEmployee()]); setExpandedEmp(employees.length); };
  const removeEmployee = (i) => setEmployees(employees.filter((_, idx) => idx !== i));
  const updateEmployee = (i, field, val) => {
    const u = [...employees]; u[i][field] = val; setEmployees(u);
  };
  const toggleCert = (i, cert) => {
    const u = [...employees];
    u[i].certs = u[i].certs.includes(cert) ? u[i].certs.filter(c => c !== cert) : [...u[i].certs, cert];
    setEmployees(u);
  };

  if (isSolo) {
    const emp = employees[0] || blankEmployee();
    return (
      <div className="signup-step">
        <div className="signup-tag">Step 3 of 7</div>
        <h1 className="signup-title">Your details</h1>
        <p className="signup-sub">Add the certs you currently hold and we'll track them for you.</p>

        <div className="signup-fields">
          <div className="signup-row-2">
            <div className="signup-field"><label>First Name *</label><input value={emp.first_name} onChange={e => updateEmployee(0, 'first_name', e.target.value)} placeholder="Jane" /></div>
            <div className="signup-field"><label>Last Name *</label><input value={emp.last_name} onChange={e => updateEmployee(0, 'last_name', e.target.value)} placeholder="Doe" /></div>
          </div>
          <div className="signup-row-2">
            <div className="signup-field"><label>Phone</label><input value={emp.phone} onChange={e => updateEmployee(0, 'phone', e.target.value)} placeholder="07700 000000" /></div>
            <div className="signup-field"><label>Date of Birth</label><input type="date" value={emp.date_of_birth} onChange={e => updateEmployee(0, 'date_of_birth', e.target.value)} /></div>
          </div>
          <div className="signup-field"><label>NI Number</label><input value={emp.ni_number} onChange={e => updateEmployee(0, 'ni_number', e.target.value)} placeholder="AB 12 34 56 C" /></div>
          <div className="signup-field"><label>Address Line 1</label><input value={emp.address_line_1} onChange={e => updateEmployee(0, 'address_line_1', e.target.value)} placeholder="123 Main Street" /></div>
          <div className="signup-field"><label>Address Line 2</label><input value={emp.address_line_2} onChange={e => updateEmployee(0, 'address_line_2', e.target.value)} placeholder="Flat 2" /></div>
          <div className="signup-row-2">
            <div className="signup-field"><label>City</label><input value={emp.city} onChange={e => updateEmployee(0, 'city', e.target.value)} placeholder="London" /></div>
            <div className="signup-field"><label>Postcode</label><input value={emp.postcode} onChange={e => updateEmployee(0, 'postcode', e.target.value)} placeholder="SW1A 1AA" /></div>
          </div>
          <div className="signup-field">
            <label>CITB Test ID <span className="signup-field-hint">(required for CSCS renewals)</span></label>
            <input value={emp.citb_test_id} onChange={e => updateEmployee(0, 'citb_test_id', e.target.value)} placeholder="CITB test ID" />
          </div>
          <div className="signup-field">
            <label>Certs you currently hold</label>
            <div className="signup-certs">
              {CERTS.map(cert => (
                <button key={cert} type="button"
                  className={`signup-cert ${emp.certs.includes(cert) ? 'selected' : ''}`}
                  onClick={() => toggleCert(0, cert)}
                >{cert}</button>
              ))}
            </div>
          </div>
        </div>

        {error && <div className="signup-error">{error}</div>}
        <div className="signup-row">
          <button className="signup-btn-ghost" onClick={onBack}>← Back</button>
          <button className="signup-btn" onClick={onNext} disabled={loading}>{loading ? 'Saving...' : 'Continue →'}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="signup-step">
      <div className="signup-tag">Step 3 of 7</div>
      <h1 className="signup-title">Add your team</h1>
      <p className="signup-sub">Add as much or as little as you have now — you can fill in the rest later.</p>
      <div className="signup-employees">
        {employees.map((emp, i) => (
          <div key={i} className="signup-employee">
            <div className="signup-employee-header" onClick={() => setExpandedEmp(expandedEmp === i ? -1 : i)}>
              <span className="signup-employee-num">
                {emp.first_name || emp.last_name ? `${emp.first_name} ${emp.last_name}`.trim() : `Employee ${i + 1}`}
              </span>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                {employees.length > 1 && (
                  <button className="signup-remove" onClick={e => { e.stopPropagation(); removeEmployee(i); }}>Remove</button>
                )}
                <span className="signup-expand-icon">{expandedEmp === i ? '▲' : '▼'}</span>
              </div>
            </div>
            {expandedEmp === i && (
              <div className="signup-fields" style={{ marginTop: '1rem' }}>
                <div className="signup-row-2">
                  <div className="signup-field"><label>First Name *</label><input value={emp.first_name} onChange={e => updateEmployee(i, 'first_name', e.target.value)} placeholder="Jane" /></div>
                  <div className="signup-field"><label>Last Name *</label><input value={emp.last_name} onChange={e => updateEmployee(i, 'last_name', e.target.value)} placeholder="Doe" /></div>
                </div>
                <div className="signup-row-2">
                  <div className="signup-field"><label>Email</label><input type="email" value={emp.email} onChange={e => updateEmployee(i, 'email', e.target.value)} placeholder="jane@firm.co.uk" /></div>
                  <div className="signup-field"><label>Phone</label><input value={emp.phone} onChange={e => updateEmployee(i, 'phone', e.target.value)} placeholder="07700 000000" /></div>
                </div>
                <div className="signup-row-2">
                  <div className="signup-field"><label>NI Number</label><input value={emp.ni_number} onChange={e => updateEmployee(i, 'ni_number', e.target.value)} placeholder="AB 12 34 56 C" /></div>
                  <div className="signup-field"><label>Date of Birth</label><input type="date" value={emp.date_of_birth} onChange={e => updateEmployee(i, 'date_of_birth', e.target.value)} /></div>
                </div>
                <div className="signup-field"><label>Address Line 1</label><input value={emp.address_line_1} onChange={e => updateEmployee(i, 'address_line_1', e.target.value)} placeholder="123 Main Street" /></div>
                <div className="signup-field"><label>Address Line 2</label><input value={emp.address_line_2} onChange={e => updateEmployee(i, 'address_line_2', e.target.value)} placeholder="Flat 2" /></div>
                <div className="signup-row-2">
                  <div className="signup-field"><label>City</label><input value={emp.city} onChange={e => updateEmployee(i, 'city', e.target.value)} placeholder="London" /></div>
                  <div className="signup-field"><label>Postcode</label><input value={emp.postcode} onChange={e => updateEmployee(i, 'postcode', e.target.value)} placeholder="SW1A 1AA" /></div>
                </div>
                <div className="signup-field">
                  <label>CITB Test ID <span className="signup-field-hint">(required for CSCS renewals)</span></label>
                  <input value={emp.citb_test_id} onChange={e => updateEmployee(i, 'citb_test_id', e.target.value)} placeholder="CITB test ID" />
                </div>
                <div className="signup-field">
                  <label>Certs they currently hold</label>
                  <div className="signup-certs">
                    {CERTS.map(cert => (
                      <button key={cert} type="button"
                        className={`signup-cert ${emp.certs.includes(cert) ? 'selected' : ''}`}
                        onClick={() => toggleCert(i, cert)}
                      >{cert}</button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        <button className="signup-add-employee" onClick={addEmployee}>+ Add another employee</button>
      </div>
      {error && <div className="signup-error">{error}</div>}
      <div className="signup-row">
        <button className="signup-btn-ghost" onClick={onBack}>← Back</button>
        <button className="signup-btn" onClick={onNext} disabled={loading}>{loading ? 'Saving...' : 'Continue →'}</button>
      </div>
    </div>
  );
};

const blankEmployee = () => ({
  first_name: '', last_name: '', email: '', phone: '',
  ni_number: '', date_of_birth: '', address_line_1: '', address_line_2: '',
  city: '', postcode: '', citb_test_id: '', certs: [],
});

export default Step3Employees;