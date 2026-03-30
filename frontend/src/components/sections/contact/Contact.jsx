import React from 'react';
import { useForm, ValidationError } from '@formspree/react';
import './styles/contact.css';

const Contact = () => {
  const [state, handleSubmit] = useForm("mojpepkd");

  return (
    <section className="contact" id="contact">
      <div className="contact-container">

        <div className="contact-header">
          <div className="contact-label">Get In Touch</div>
          <h2 className="contact-heading">Ready to forget about cert admin?</h2>
          <p className="contact-subheading">
            Drop us a message and we will get you set up. Usually back within a few hours.
          </p>
        </div>

        <div className="contact-card">
          {state.succeeded ? (
            <div className="contact-success">
              <div className="contact-success-icon">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <path d="M5 14L11 20L23 8" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="contact-success-title">Message sent.</h3>
              <p className="contact-success-body">We will be in touch shortly.</p>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="contact-row">
                <div className="contact-field">
                  <label htmlFor="name" className="contact-label-field">Full Name</label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    className="contact-input"
                    placeholder="John Smith"
                    required
                  />
                </div>
                <div className="contact-field">
                  <label htmlFor="email" className="contact-label-field">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    className="contact-input"
                    placeholder="john@yourfirm.co.uk"
                    required
                  />
                  <ValidationError prefix="Email" field="email" errors={state.errors} className="contact-error" />
                </div>
              </div>

              <div className="contact-field">
                <label htmlFor="company" className="contact-label-field">Company Name</label>
                <input
                  id="company"
                  type="text"
                  name="company"
                  className="contact-input"
                  placeholder="Your firm"
                />
              </div>

              <div className="contact-field">
                <label htmlFor="message" className="contact-label-field">Message</label>
                <textarea
                  id="message"
                  name="message"
                  className="contact-textarea"
                  placeholder="Tell us a bit about your team and what you need..."
                  rows={5}
                  required
                />
                <ValidationError prefix="Message" field="message" errors={state.errors} className="contact-error" />
              </div>

              <button type="submit" disabled={state.submitting} className="contact-submit">
                {state.submitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}
        </div>

      </div>
    </section>
  );
};

export default Contact;