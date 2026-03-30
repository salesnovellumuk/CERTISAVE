import React, { useState, useEffect } from 'react';
import './styles/footer.css';

const privacyContent = {
  title: 'Privacy Policy',
  updated: 'Last updated: March 2026',
  sections: [
    {
      heading: 'Who We Are',
      body: 'Certisave is a brand of Novellum. We provide a managed compliance certificate tracking and rebooking service for trades and construction firms in the UK and Ireland. References to "we", "us" or "our" in this policy refer to Novellum operating under the Certisave brand.',
    },
    {
      heading: 'What Information We Collect',
      body: 'We collect information you provide when signing up or contacting us. This includes your name, email address, company name, and details about your employees such as their names, certification types and expiry dates. We may also collect information submitted through our contact and waitlist forms.',
    },
    {
      heading: 'How We Use Your Information',
      body: 'We use your information to deliver the Certisave service — tracking certification expiry dates, arranging training course bookings on your behalf, and sending you renewal notifications. We do not sell your data to third parties. We do not use your data for advertising purposes.',
    },
    {
      heading: 'Employee Data',
      body: 'As part of the service you may provide us with personal data relating to your employees, including names and certification details. You are responsible for ensuring you have the appropriate legal basis to share this information with us. We process it solely to deliver the service and will not use it for any other purpose.',
    },
    {
      heading: 'Data Storage and Security',
      body: 'Your data is stored securely and access is limited to those who need it to deliver the service. We take reasonable steps to protect your information from unauthorised access, loss or misuse.',
    },
    {
      heading: 'Data Retention',
      body: 'We retain your data for as long as you are a Certisave customer and for a reasonable period afterwards in case of disputes or queries. You can request deletion of your data at any time by contacting us.',
    },
    {
      heading: 'Your Rights',
      body: 'You have the right to access, correct or delete the personal data we hold about you. You may also object to how we process your data or request that we restrict processing in certain circumstances. To exercise any of these rights, contact us at hello@certisave.com.',
    },
    {
      heading: 'Cookies',
      body: 'Our website may use basic cookies to ensure it functions correctly. We do not use tracking or advertising cookies.',
    },
    {
      heading: 'Contact',
      body: 'If you have any questions about this privacy policy or how we handle your data, please contact us at hello@certisave.com.',
    },
  ],
};

const tosContent = {
  title: 'Terms of Service',
  updated: 'Last updated: March 2026',
  sections: [
    {
      heading: 'About Certisave',
      body: 'Certisave is a brand of Novellum. By using Certisave you agree to these terms. Please read them carefully.',
    },
    {
      heading: 'The Service',
      body: 'Certisave provides a managed service for tracking employee certification expiry dates and arranging training course renewals on behalf of your business. We act as an intermediary between you and approved training providers. We do not deliver training ourselves.',
    },
    {
      heading: 'Your Responsibilities',
      body: 'You are responsible for providing accurate and up to date information about your employees and their certifications. You are responsible for ensuring your employees attend booked training courses. You must notify us promptly if an employee leaves your business or if any details change.',
    },
    {
      heading: 'Bookings and Payments',
      body: 'The cost of training courses is your responsibility and is paid directly to the training provider. Certisave charges a separate monthly subscription fee for the management service. Subscription fees are charged in advance and are non-refundable once a billing period has started.',
    },
    {
      heading: 'Cancellation',
      body: 'You may cancel your subscription at any time. Cancellation takes effect at the end of the current billing period. No further charges will be made after cancellation. We do not offer refunds for partial months.',
    },
    {
      heading: 'Limitation of Liability',
      body: 'We take reasonable care in delivering the Certisave service but we cannot guarantee that all certifications will be renewed before expiry in every circumstance, for example where a training provider cancels at short notice or an employee fails to attend. We are not liable for any loss arising from a lapsed certification, a missed booking or a training provider failure.',
    },
    {
      heading: 'Data',
      body: 'By using Certisave you agree to our Privacy Policy. You confirm that you have the right to share employee data with us for the purpose of delivering the service.',
    },
    {
      heading: 'Changes to These Terms',
      body: 'We may update these terms from time to time. We will notify you of any significant changes. Continued use of the service after changes are communicated constitutes acceptance of the updated terms.',
    },
    {
      heading: 'Governing Law',
      body: 'These terms are governed by the laws of England and Wales.',
    },
    {
      heading: 'Contact',
      body: 'If you have any questions about these terms please contact us at hello@certisave.com.',
    },
  ],
};

const LegalModal = ({ content, onClose }) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div className="legal-backdrop" onClick={onClose}>
      <div className="legal-modal" onClick={(e) => e.stopPropagation()}>
        <div className="legal-modal-header">
          <div>
            <h2 className="legal-modal-title">{content.title}</h2>
            <p className="legal-modal-updated">{content.updated}</p>
          </div>
          <button className="legal-modal-close" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M2 2L16 16M16 2L2 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="legal-modal-body">
          {content.sections.map((s) => (
            <div key={s.heading} className="legal-section">
              <h3 className="legal-section-heading">{s.heading}</h3>
              <p className="legal-section-body">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Footer = () => {
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [tosOpen, setTosOpen] = useState(false);

  return (
    <>
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-top">
            <div className="footer-brand">
              <a href="/" className="footer-logo">Certi<span>save</span></a>
              <p className="footer-tagline">
                Cert tracking and rebooking for trades firms. Fully managed, fully automated.
              </p>
            </div>

            <div className="footer-links">
              <div className="footer-col">
                <p className="footer-col-title">Product</p>
                <a href="#how-it-works" className="footer-link">How It Works</a>
                <a href="#pricing" className="footer-link">Pricing</a>
                <a href="#faq" className="footer-link">FAQ</a>
              </div>
              <div className="footer-col">
                <p className="footer-col-title">Company</p>
                <a href="#about" className="footer-link">About</a>
                <a href="#contact" className="footer-link">Contact</a>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p className="footer-copy">
              &copy; {new Date().getFullYear()} Certisave. All rights reserved. Certisave is a brand of Novellum.
            </p>
            <div className="footer-legal">
              <button className="footer-legal-link" onClick={() => setPrivacyOpen(true)}>Privacy Policy</button>
              <button className="footer-legal-link" onClick={() => setTosOpen(true)}>Terms of Service</button>
            </div>
          </div>
        </div>
      </footer>

      {privacyOpen && <LegalModal content={privacyContent} onClose={() => setPrivacyOpen(false)} />}
      {tosOpen && <LegalModal content={tosContent} onClose={() => setTosOpen(false)} />}
    </>
  );
};

export default Footer;