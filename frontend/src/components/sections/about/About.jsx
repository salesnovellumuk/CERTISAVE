import React, { useEffect, useRef } from 'react';
import './styles/about.css';

const stats = [
  { number: '100%', label: 'Managed for you' },
  { number: '£0', label: 'Hidden fees' },
  { number: '5min', label: 'Setup time' },
  { number: '0', label: 'Days wasted' },
];

const About = () => {
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
      { threshold: 0.12 }
    );

    const els = sectionRef.current?.querySelectorAll('.animate');
    els?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section className="about" id="about" ref={sectionRef}>
      <div className="about-container">

        <div className="about-label animate slide-up">Who We Are</div>

        <div className="about-top animate slide-up delay-1">
          <h2 className="about-heading">
            Built by tradesmen,<br />
            for <span className="about-heading-blue">tradesmen.</span>
          </h2>
          <div className="about-body-wrap">
            <p className="about-body">
              A lapsed cert means your guy gets turned away at the gate. That
              is a wasted day, an angry employee, and a job that does not get
              done. Certisave exists so that never happens — we track every
              cert across your team and handle every renewal before anything
              comes close to lapsing.
            </p>
            <p className="about-body">
              No spreadsheets, no chasing training centres, no last minute
              scrambles. You just get a notification telling you it is sorted.
              That is the entire process from your side.
            </p>
          </div>
        </div>

        <div className="about-stats-wrap animate slide-up delay-2">
          <div className="about-stats">
            {stats.map((s) => (
              <div className="about-stat" key={s.label}>
                <span className="about-stat-number">{s.number}</span>
                <span className="about-stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="about-cards">
          <div className="about-card-image animate slide-up delay-2">
            <div className="about-card-image-overlay" />
            <div className="about-card-image-content">
              <div className="about-card-tag-white">Our Promise</div>
              <h3 className="about-card-image-title">No cert lapses.<br />Ever.</h3>
              <p className="about-card-image-text">
                When a renewal is coming up we find the nearest approved training
                centre, secure a date, and book it. You get one notification
                confirming it is sorted. That is the entire process from your side.
              </p>
              <div className="about-card-pills">
                <div className="about-pill-white">IPAF</div>
                <div className="about-pill-white">CSCS</div>
                <div className="about-pill-white">First Aid</div>
                <div className="about-pill-white">LOLER</div>
                <div className="about-pill-white">PASMA</div>
              </div>
            </div>
          </div>

          <div className="about-cards-right">
            <div className="about-card animate slide-left delay-3">
              <div className="about-card-shine" />
              <div className="about-card-tag">Who We Serve</div>
              <p className="about-card-title">Any firm with guys on site.</p>
              <ul className="about-list">
                <li><span className="about-list-dot" />Plant hire and machinery operators</li>
                <li><span className="about-list-dot" />Civil engineering and groundworks</li>
                <li><span className="about-list-dot" />Roofing and facade contractors</li>
                <li><span className="about-list-dot" />Drylining and finishing trades</li>
                <li><span className="about-list-dot" />Electrical and mechanical contractors</li>
              </ul>
            </div>

            <div className="about-card about-card-blue animate slide-left delay-4">
              <div className="about-card-shine" />
              <div className="about-card-tag">Why It Works</div>
              <p className="about-card-title">Set it once. Done.</p>
              <p className="about-card-text">
                Upload a photo of each cert card. We extract the details, set the
                reminders, and handle every renewal from that point on. No
                logins to remember, no admin to chase, no one getting turned
                away at the gate.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default About;