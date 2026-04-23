const Step4HowItWorks = ({ onNext, onBack }) => (
  <div className="signup-step">
    <div className="signup-tag">Step 4 of 7</div>
    <h1 className="signup-title">Here's how it works.</h1>
    <p className="signup-sub">Simple, automated, done.</p>
    <div className="signup-how">
      <div className="signup-how-step">
        <div className="signup-how-num">01</div>
        <div>
          <h3>We track expiries</h3>
          <p>All your team's cert expiry dates in one place, always up to date.</p>
        </div>
      </div>
      <div className="signup-how-step">
        <div className="signup-how-num">02</div>
        <div>
          <h3>We remind you</h3>
          <p>Automated alerts before anything lapses — no surprises on site.</p>
        </div>
      </div>
      <div className="signup-how-step">
        <div className="signup-how-num">03</div>
        <div>
          <h3>We rebook training</h3>
          <p>Certisave automatically arranges renewal so you never have to think about it.</p>
        </div>
      </div>
      <div className="signup-how-step">
        <div className="signup-how-num">04</div>
        <div>
          <h3>We charge your card</h3>
          <p>Course costs are charged directly to your saved card. No invoices, no chasing — it just happens.</p>
        </div>
      </div>
    </div>
    <div className="signup-row">
      <button className="signup-btn-ghost" onClick={onBack}>← Back</button>
      <button className="signup-btn" onClick={onNext}>Looks good →</button>
    </div>
  </div>
);

export default Step4HowItWorks;