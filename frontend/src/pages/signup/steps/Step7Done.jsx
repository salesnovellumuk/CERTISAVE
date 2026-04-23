import { useState } from 'react';

const Step7Done = () => {
  const [going, setGoing] = useState(false);
  return (
    <div className="signup-step signup-done">
      <div className="signup-done-icon">✓</div>
      <h1 className="signup-title">You're all set.</h1>
      <p className="signup-sub">Certisave is now tracking your team's certs. We'll handle the rest.</p>
      <button
        className="signup-btn"
        onClick={() => {
          setGoing(true);
          setTimeout(() => { window.location.href = '/dashboard'; }, 800);
        }}
        disabled={going}
      >
        {going ? (
          <span className="signup-btn-dots">
            <span className="signup-dot signup-dot--white" />
            <span className="signup-dot signup-dot--white" />
            <span className="signup-dot signup-dot--white" />
          </span>
        ) : 'Go to Dashboard →'}
      </button>
    </div>
  );
};

export default Step7Done;