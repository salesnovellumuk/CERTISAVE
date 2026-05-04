import { useRef, useEffect, useState } from 'react';
import { CardElement } from '@stripe/react-stripe-js';
import { TERMS_TEXT } from '../terms';

const CARD_STYLE = {
  hidePostalCode: true,
  style: {
    base: {
      fontFamily: 'Sora, sans-serif',
      fontSize: '15px',
      color: '#0f172a',
      '::placeholder': { color: '#94a3b8' },
    },
    invalid: { color: '#ef4444' },
  },
};

const Step6Payment = ({ plan, onNext, onBack, loading, error }) => {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);
  const [termsScrolled, setTermsScrolled] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const termsRef = useRef(null);

  const planLabel =
    plan === 'solo'   ? 'Solo — £3.99/month' :
    plan === 'growth' ? 'Growth — £24.99/month' :
                        'Starter — £6.99/month';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDraw = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setDrawing(true);
  };

  const draw = (e) => {
    e.preventDefault();
    if (!drawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e, canvas);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    setHasSigned(true);
  };

  const stopDraw = (e) => {
    e.preventDefault();
    setDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
  };

  const handleTermsScroll = (e) => {
    const el = e.target;
    if (el.scrollHeight - el.scrollTop <= el.clientHeight + 20) {
      setTermsScrolled(true);
    }
  };

  const canProceed = termsScrolled && termsAccepted && hasSigned;

  return (
    <div className="signup-step">
      <div className="signup-tag">Step 6 of 7</div>
      <h1 className="signup-title">Review & sign</h1>
      <p className="signup-sub">Read the terms below, then sign to authorise your card.</p>

      <div className="signup-plan-summary">
        <span className="signup-plan-summary-label">Selected plan</span>
        <span className="signup-plan-summary-value">{planLabel}</span>
      </div>

      <div className="signup-terms-section">
        <div className="signup-terms-header">
          <span className="signup-terms-title">Terms of Service & Billing Authorisation</span>
          {!termsScrolled && <span className="signup-terms-scroll-hint">Scroll to read all ↓</span>}
          {termsScrolled && <span className="signup-terms-scrolled">✓ Read</span>}
        </div>
        <div className="signup-terms-box" ref={termsRef} onScroll={handleTermsScroll}>
          {TERMS_TEXT.split('\n').map((line, i) => (
            <p key={i} className={`signup-terms-line ${line.match(/^\d+\./) ? 'signup-terms-heading' : ''}`}>
              {line || <br />}
            </p>
          ))}
        </div>
      </div>

      <label className="signup-terms-label" style={{ marginTop: '0.75rem' }}>
        <input
          type="checkbox"
          checked={termsAccepted}
          onChange={e => setTermsAccepted(e.target.checked)}
          disabled={!termsScrolled}
          className="signup-terms-check"
        />
        <span>
          I have read and agree to the Terms of Service and Billing Authorisation above. I understand that Certisave will charge my card for my monthly subscription and for training course bookings made on my behalf.
        </span>
      </label>

      <div className="signup-signature-section">
        <div className="signup-signature-header">
          <span className="signup-signature-label">Draw your signature to confirm</span>
          {hasSigned && <button className="signup-signature-clear" onClick={clearSignature}>Clear</button>}
        </div>
        <canvas
          ref={canvasRef}
          width={460}
          height={120}
          className="signup-signature-canvas"
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={stopDraw}
        />
        {!hasSigned && <p className="signup-signature-hint">Sign above using your mouse or finger</p>}
      </div>

      <div className="signup-field" style={{ marginTop: '0.75rem' }}>
        <label>Card Details</label>
        <div className="signup-card-element">
          <CardElement options={CARD_STYLE} />
        </div>
        <p className="signup-stripe-note">Secured by Stripe. Certisave never sees or stores your card details.</p>
      </div>

      {error && <div className="signup-error">{error}</div>}

      <div className="signup-row" style={{ marginTop: '0.5rem' }}>
        <button className="signup-btn-ghost" onClick={onBack}>← Back</button>
        <button className="signup-btn" onClick={onNext} disabled={loading || !canProceed}>
          {loading ? 'Setting up...' : 'Complete Setup →'}
        </button>
      </div>

      {!canProceed && (
        <p className="signup-proceed-hint">
          {!termsScrolled && 'Please scroll through and read the full terms.'}
          {termsScrolled && !termsAccepted && 'Please tick the box to confirm you agree.'}
          {termsScrolled && termsAccepted && !hasSigned && 'Please draw your signature above.'}
        </p>
      )}
    </div>
  );
};

export default Step6Payment;