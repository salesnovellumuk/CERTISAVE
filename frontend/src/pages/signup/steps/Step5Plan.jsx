const PLANS = [
  { id: 'solo',       label: 'Solo',       price: '£3.99',  per: '/month', desc: 'Just you. For sole traders managing your own certs.'  },
  { id: 'starter',    label: 'Starter',    price: '£6.99',  per: '/month', desc: 'Up to 15 employees. Perfect for small firms.' },
  { id: 'growth',     label: 'Growth',     price: '£24.99', per: '/month', desc: 'Up to 50 employees. For growing operations.'  },
  { id: 'enterprise', label: 'Enterprise', price: '',       per: '',       desc: 'Larger teams and multi-site operations.', comingSoon: true },
];

const Step5Plan = ({ plan, setPlan, onNext, onBack }) => (
  <div className="signup-step">
    <div className="signup-tag">Step 5 of 7</div>
    <h1 className="signup-title">Choose your plan</h1>
    <p className="signup-sub">Cancel anytime. No lock-in.</p>
    <div className="signup-plans">
      {PLANS.map(p => {
        const selected = plan === p.id && !p.comingSoon;
        return (
          <div key={p.id}
            className={`signup-plan ${selected ? 'selected' : ''} ${p.comingSoon ? 'signup-plan--soon' : ''}`}
            onClick={() => !p.comingSoon && setPlan(p.id)}
          >
            <div className="signup-plan-top">
              <div className="signup-plan-left">
                <div className={`signup-plan-tick ${selected ? 'signup-plan-tick--active' : ''}`}>
                  {selected && (
                    <svg viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg" className="signup-plan-tick-svg">
                      <path d="M1 5L4.5 8.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <span className="signup-plan-label">{p.label}</span>
              </div>
              {p.comingSoon
                ? <span className="signup-plan-soon-badge">Coming Soon</span>
                : <span className="signup-plan-price">{p.price}<span>{p.per}</span></span>
              }
            </div>
            <p className="signup-plan-desc">{p.desc}</p>
          </div>
        );
      })}
    </div>
    <div className="signup-row">
      <button className="signup-btn-ghost" onClick={onBack}>← Back</button>
      <button className="signup-btn" onClick={onNext}>Continue →</button>
    </div>
  </div>
);

export default Step5Plan;