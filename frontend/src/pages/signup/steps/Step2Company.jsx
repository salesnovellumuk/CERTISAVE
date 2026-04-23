const Step2Company = ({ company, setCompany, onNext, onBack, loading, error }) => (
  <div className="signup-step">
    <div className="signup-tag">Step 2 of 7</div>
    <h1 className="signup-title">About your company</h1>
    <p className="signup-sub">Helps us personalise your experience.</p>
    <div className="signup-fields">
      <div className="signup-field">
        <label>Company Name</label>
        <input value={company.name} onChange={e => setCompany({ ...company, name: e.target.value })} placeholder="Acme Construction Ltd" />
      </div>
      <div className="signup-field">
        <label>Trade / Industry</label>
        <select value={company.trade} onChange={e => setCompany({ ...company, trade: e.target.value })}>
          <option value="">Select your trade</option>
          <option>Electrical</option>
          <option>Plumbing</option>
          <option>Scaffolding</option>
          <option>Groundworks</option>
          <option>Roofing</option>
          <option>General Construction</option>
          <option>Facilities Management</option>
          <option>Other</option>
        </select>
      </div>
      <div className="signup-field">
        <label>Team Size</label>
          <select value={company.size} onChange={e => setCompany({ ...company, size: e.target.value })}>
            <option value="">How many employees?</option>
            <option>Just me</option>
            <option>2–15</option>
            <option>16–50</option>
            <option>50+</option>
  </select>
    </div>
    </div>
    {error && <div className="signup-error">{error}</div>}
    <div className="signup-row">
      <button className="signup-btn-ghost" onClick={onBack}>← Back</button>
      <button className="signup-btn" onClick={onNext} disabled={loading || !company.name || !company.trade || !company.size}>
        {loading ? 'Saving...' : 'Continue →'}
      </button>
    </div>
  </div>
);

export default Step2Company;