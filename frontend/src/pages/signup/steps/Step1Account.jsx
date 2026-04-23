const Step1Account = ({ account, setAccount, onNext, loading, error }) => (
  <div className="signup-step">
    <div className="signup-tag">Step 1 of 7</div>
    <h1 className="signup-title">Create your account</h1>
    <p className="signup-sub">Takes less than 2 minutes.</p>
    <div className="signup-fields">
      <div className="signup-row-2">
        <div className="signup-field">
          <label>First Name</label>
          <input value={account.firstName} onChange={e => setAccount({ ...account, firstName: e.target.value })} placeholder="John" />
        </div>
        <div className="signup-field">
          <label>Last Name</label>
          <input value={account.lastName} onChange={e => setAccount({ ...account, lastName: e.target.value })} placeholder="Smith" />
        </div>
      </div>
      <div className="signup-field">
        <label>Email Address</label>
        <input type="email" value={account.email} onChange={e => setAccount({ ...account, email: e.target.value })} placeholder="john@yourfirm.co.uk" />
      </div>
      <div className="signup-field">
        <label>Password</label>
        <input type="password" value={account.password} onChange={e => setAccount({ ...account, password: e.target.value })} placeholder="Min. 8 characters" />
      </div>
    </div>
    {error && <div className="signup-error">{error}</div>}
    <button className="signup-btn" onClick={onNext} disabled={loading || !account.firstName || !account.email || !account.password}>
      {loading ? 'Creating account...' : 'Continue →'}
    </button>
  </div>
);

export default Step1Account;