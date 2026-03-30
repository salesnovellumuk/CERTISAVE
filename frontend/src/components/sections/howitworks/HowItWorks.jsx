import React, { useEffect, useRef } from 'react';
import './styles/hiwstyles.css';

const steps = [
  {
    number: '01',
    tag: 'Get Started',
    title: 'Upload your team\'s certs',
    body: 'Add your employees and upload a photo of each cert card. We extract the details automatically. Takes a few minutes, you never have to do it again.',
    detail: 'Supports IPAF, CSCS, First Aid, LOLER, PASMA and more.',
  },
  {
    number: '02',
    tag: 'We Take Over',
    title: 'We track every expiry date',
    body: 'Our system monitors every cert across your entire team. When something is coming up for renewal you get a heads up. No spreadsheets, no reminders on your phone, nothing to manage.',
    detail: 'Alerts sent at your selected intervals before expiry.',
  },
  {
    number: '03',
    tag: 'Fully Handled',
    title: 'We rebook the training',
    body: 'When a cert is due we find an approved training centre near you, secure a date, and book it. You get one notification confirming it is sorted.',
    detail: 'You just turn up on the day. That is it.',
  },
];

const HowItWorks = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
          }
        });
      },
      { threshold: 0.15 }
    );

    const els = sectionRef.current?.querySelectorAll('.animate');
    els?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section className="hiw" id="how-it-works" ref={sectionRef}>
      <div className="hiw-container">

        <div className="hiw-header animate slide-up">
          <div className="hiw-label">How It Works</div>
          <h2 className="hiw-heading">
            Just forget about it.
          </h2>
          <p className="hiw-subheading">
            Set up takes minutes. After that, Certisave runs in the background
            and handles everything without you lifting a finger.
          </p>
        </div>

        <div className="hiw-sticky-wrapper">
          <div className="hiw-sticky-left">
            {steps.map((step, i) => (
              <div className="hiw-sticky-step" key={step.number}>
                <div className={`hiw-card animate slide-up delay-${i + 1}`}>
                  <div className="hiw-card-top">
                    <span className="hiw-number">{step.number}</span>
                    <span className="hiw-tag">{step.tag}</span>
                  </div>
                  <h3 className="hiw-card-title">{step.title}</h3>
                  <p className="hiw-card-body">{step.body}</p>
                  <div className="hiw-card-detail">{step.detail}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="hiw-sticky-right">
            <div className="hiw-sticky-visual animate slide-left delay-2">
              <div className="hiw-visual-inner">
                <div className="hiw-visual-card">
                  <div className="hiw-visual-tag">Live Tracking</div>
                  <div className="hiw-visual-rows">
                    <div className="hiw-visual-row">
                      <div className="hiw-visual-row-left">
                        <div className="hiw-visual-dot green" />
                        <div className="hiw-visual-info">
                          <span className="hiw-visual-name">Dan Richards</span>
                          <span className="hiw-visual-cert">IPAF PAL Card</span>
                        </div>
                      </div>
                      <span className="hiw-visual-expiry green-text">Valid</span>
                    </div>
                    <div className="hiw-visual-row">
                      <div className="hiw-visual-row-left">
                        <div className="hiw-visual-dot amber" />
                        <div className="hiw-visual-info">
                          <span className="hiw-visual-name">Craig Walsh</span>
                          <span className="hiw-visual-cert">First Aid at Work</span>
                        </div>
                      </div>
                      <span className="hiw-visual-expiry amber-text">42 days</span>
                    </div>
                    <div className="hiw-visual-row">
                      <div className="hiw-visual-row-left">
                        <div className="hiw-visual-dot green" />
                        <div className="hiw-visual-info">
                          <span className="hiw-visual-name">Mark Evans</span>
                          <span className="hiw-visual-cert">CSCS Blue Card</span>
                        </div>
                      </div>
                      <span className="hiw-visual-expiry green-text">Valid</span>
                    </div>
                    <div className="hiw-visual-row">
                      <div className="hiw-visual-row-left">
                        <div className="hiw-visual-dot red" />
                        <div className="hiw-visual-info">
                          <span className="hiw-visual-name">Jamie Nolan</span>
                          <span className="hiw-visual-cert">LOLER Inspection</span>
                        </div>
                      </div>
                      <span className="hiw-visual-expiry red-text">Rebooked</span>
                    </div>
                    <div className="hiw-visual-row">
                      <div className="hiw-visual-row-left">
                        <div className="hiw-visual-dot green" />
                        <div className="hiw-visual-info">
                          <span className="hiw-visual-name">Steve Parr</span>
                          <span className="hiw-visual-cert">PASMA Card</span>
                        </div>
                      </div>
                      <span className="hiw-visual-expiry green-text">Valid</span>
                    </div>
                  </div>
                </div>
                <div className="hiw-visual-badge">
                  <span className="hiw-badge-dot" />
                  All renewals handled automatically
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="hiw-cta-wrap">
          <a href="#contact" className="hiw-cta-btn">
            I am interested, get me started
          </a>
        </div>

      </div>
    </section>
  );
};

export default HowItWorks;