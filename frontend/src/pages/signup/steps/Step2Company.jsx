const Step2Company = ({ company, setCompany, onNext, onBack, loading, error }) => {
  const isSolo = company.accountType === 'solo';
  const canContinue = company.accountType && company.trade &&
    (isSolo || (company.name && company.size));

  return (
    <div className="signup-step">
      <div className="signup-tag">Step 2 of 7</div>
      <h1 className="signup-title">{isSolo ? 'About you' : 'About your company'}</h1>
      <p className="signup-sub">Helps us personalise your experience.</p>

      <div className="signup-fields">

        <div className="signup-field">
          <label>Are you a sole trader or a company?</label>
          <div className="signup-account-type">
            <button
              type="button"
              className={`signup-account-option ${company.accountType === 'solo' ? 'selected' : ''}`}
              onClick={() => setCompany({ ...company, accountType: 'solo', name: '', size: 'Just me' })}
            >
              <span className="signup-account-option-label">Sole trader</span>
              <span className="signup-account-option-sub">Just me. £3.99/month.</span>
            </button>
            <button
              type="button"
              className={`signup-account-option ${company.accountType === 'company' ? 'selected' : ''}`}
              onClick={() => setCompany({ ...company, accountType: 'company', size: '' })}
            >
              <span className="signup-account-option-label">Company</span>
              <span className="signup-account-option-sub">Team of two or more.</span>
            </button>
          </div>
        </div>

        {company.accountType === 'company' && (
          <div className="signup-field">
            <label>Company Name</label>
            <input
              value={company.name}
              onChange={e => setCompany({ ...company, name: e.target.value })}
              placeholder="Acme Construction Ltd"
            />
          </div>
        )}

        {company.accountType && (
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
        )}

        {company.accountType === 'company' && (
          <div className="signup-field">
            <label>Team Size</label>
            <select value={company.size} onChange={e => setCompany({ ...company, size: e.target.value })}>
              <option value="">How many employees?</option>
              <option>2–15</option>
              <option>16–50</option>
              <option>50+</option>
            </select>
          </div>
        )}

      </div>

      {error && <div className="signup-error">{error}</div>}
      <div className="signup-row">
        <button className="signup-btn-ghost" onClick={onBack}>← Back</button>
        <button className="signup-btn" onClick={onNext} disabled={loading || !canContinue}>
          {loading ? 'Saving...' : 'Continue →'}
        </button>
      </div>
    </div>
  );
};

export default Step2Company;