import React, { useEffect, useRef } from 'react';
import './styles/AboutPage.css';

const stats = [
  { value: '100%', label: 'Automated rebooking' },
  { value: '£0', label: 'Admin time spent on certs' },
  { value: '5 min', label: 'Average setup time' },
  { value: '15+', label: 'Cert types supported' },
];

const values = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M9 12l2 2 4-4" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="12" cy="12" r="9" stroke="#2563eb" strokeWidth="2"/>
      </svg>
    ),
    title: 'Built for trades',
    body: 'We come from the industry. We know how CSCS cards, IPAF certs, and First Aid renewals actually work on site — and we know what happens when one of them lapses.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Genuinely automated',
    body: 'We do not just send you a reminder and leave it there. When a cert is due we find the course, book the date, and confirm it. You just turn up.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'No one gets turned away',
    body: 'Showing up to site and being sent home because your card expired last week is the worst feeling in the trade. Certisave makes sure it never happens to your lads.',
  },
];

const AboutPage = () => {
  const pageRef = useRef(null);

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

    const els = pageRef.current?.querySelectorAll('.animate');
    els?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="about-page" ref={pageRef}>

      {/* ── Hero ── */}
      <section className="about-hero">
        <div className="about-hero-stars" aria-hidden="true">
          <span className="about-star about-star-1" />
          <span className="about-star about-star-2" />
          <span className="about-star about-star-3" />
        </div>
        <div className="about-hero-inner">
          <div className="about-hero-badge animate slide-up">
            <span className="about-hero-badge-dot" />
            About Certisave
          </div>
          <h1 className="about-hero-title animate slide-up delay-1">
            We built this because<br />
            <span className="about-hero-title-blue">we lived the problem.</span>
          </h1>
          <p className="about-hero-sub animate slide-up delay-2">
            Certisave was built by people who have worked in trades and construction.
            We know what it feels like to roll up to a job and get sent home because
            a card expired the week before — and we knew there had to be a better way
            than spreadsheets and phone reminders.
          </p>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="about-stats">
        <div className="about-stats-inner">
          {stats.map((stat, i) => (
            <div key={stat.label} className={`about-stat animate slide-up delay-${i + 1}`}>
              <span className="about-stat-value">{stat.value}</span>
              <span className="about-stat-label">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Story ── */}
      <section className="about-story">
        <div className="about-story-inner">
          <div className="about-story-left animate slide-up">
            <div className="about-section-label">Our Story</div>
            <h2 className="about-section-heading">
              Getting turned away from site is the worst part.
            </h2>
          </div>
          <div className="about-story-right animate slide-up delay-2">
            <p>
              Every trades firm knows the feeling. A lad turns up to a job, the
              site manager checks his card, and it expired three weeks ago. He gets
              sent home. The work does not happen. The client is on the phone.
              Someone is paying for that day whether the job got done or not.
            </p>
            <p>
              And then there is the admin behind it — chasing expiry dates, ringing
              training centres, hoping someone remembered to rebook. It all falls on
              whoever gets handed the spreadsheet, and it never gets the attention
              it actually needs. Until something lapses, and suddenly it does.
            </p>
            <p>
              We built Certisave so neither of those things happen again. You upload
              your team, we handle everything else. Tracking, alerts, rebooking — all
              of it. No lapsed cards, no admin, no one getting turned away.
            </p>
            <p>
              We are still early, and we are building this with real trades firms.
              If you want to shape what this becomes, early access is open now.
            </p>
            <a href="/signup" className="about-story-btn">Get Early Access</a>
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="about-values">
        <div className="about-values-inner">
          <div className="about-values-header animate slide-up">
            <div className="about-section-label">What We Stand For</div>
            <h2 className="about-section-heading">
              Simple principles.<br />Real results.
            </h2>
          </div>
          <div className="about-values-grid">
            {values.map((v, i) => (
              <div key={v.title} className={`about-value-card animate slide-up delay-${i + 1}`}>
                <div className="about-value-icon">{v.icon}</div>
                <h3 className="about-value-title">{v.title}</h3>
                <p className="about-value-body">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="about-cta">
        <div className="about-cta-inner animate slide-up">
          <h2 className="about-cta-heading">
            Ready to stop worrying about certs?
          </h2>
          <p className="about-cta-sub">
            Early access is open. £6.99/month, locked in for life.
          </p>
          <a href="/signup" className="about-cta-btn">Get Started</a>
        </div>
      </section>

    </div>
  );
};

export default AboutPage;