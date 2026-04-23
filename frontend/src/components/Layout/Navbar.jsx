import React, { useState, useEffect } from 'react';
import { useForm, ValidationError } from '@formspree/react';
import './styles/nav.css';

const WaitlistModal = ({ onClose }) => {
  const [state, handleSubmit] = useForm("xreopory");

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M2 2L16 16M16 2L2 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        <div className="modal-header">
          <div className="modal-tag">Early Access</div>
          <h2 className="modal-title">Join the waitlist</h2>
          <p className="modal-subtitle">
            Be first in line when Certisave launches. No spam, just a heads up when you are good to go.
          </p>
        </div>
        {state.succeeded ? (
          <div className="modal-success">
            <div className="modal-success-icon">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M5 14L11 20L23 8" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="modal-success-title">You are on the list.</h3>
            <p className="modal-success-body">We will be in touch when Certisave is ready.</p>
          </div>
        ) : (
          <form className="modal-form" onSubmit={handleSubmit}>
            <div className="modal-field">
              <label htmlFor="name" className="modal-label">Full Name</label>
              <input id="name" type="text" name="name" className="modal-input" placeholder="John Smith" required />
            </div>
            <div className="modal-field">
              <label htmlFor="email" className="modal-label">Email Address</label>
              <input id="email" type="email" name="email" className="modal-input" placeholder="john@yourfirm.co.uk" required />
              <ValidationError prefix="Email" field="email" errors={state.errors} className="modal-error" />
            </div>
            <div className="modal-field">
              <label htmlFor="company" className="modal-label">Company Name</label>
              <input id="company" type="text" name="company" className="modal-input" placeholder="Your firm" />
            </div>
            <button type="submit" disabled={state.submitting} className="modal-submit">
              {state.submitting ? 'Sending...' : 'Join Waitlist'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

const Navbar = () => {
  const [scrolled, setScrolled]   = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = modalOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [modalOpen]);

  return (
    <>
      <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
        <div className="navbar-container">
          <div className="navbar-inner">
            <a href="/" className="navbar-logo">
              Certi<span>save</span>
            </a>
            <div className="navbar-actions">
              <a href="/login" className="navbar-login">Log in</a>
              <a href="/signup" className="navbar-cta">Get Started →</a>
            </div>
          </div>
        </div>
      </nav>
      {modalOpen && <WaitlistModal onClose={() => setModalOpen(false)} />}
    </>
  );
};

export default Navbar;