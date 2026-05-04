import React, { useEffect, useRef, useState } from 'react';
import './styles/PricingPage.css';

const features = [
  'Unlimited employees',
  'Unlimited cert types tracked',
  'Automated rebooking on every renewal',
  'Email and SMS alerts',
  'Photo upload — we read the cert details',
  'Approved training centre network',
  'One dashboard for your whole team',
  'GDPR compliant, UK hosted',
  'Priority support',
  'No setup fees, no contract',
];

const faqs = [
  {
    q: 'What does early access actually mean?',
    a: 'You get the full product at £6.99 a month, locked in for life. We are still adding features, and early access customers help shape what gets built next. Once we leave early access the price goes up — but yours stays where it started.',
  },
  {
    q: 'How many employees can I add?',
    a: 'Unlimited. Whether you have five guys on site or fifty, the price does not change. We charge per company, not per head.',
  },
  {
    q: 'What happens when a cert expires?',
    a: 'It does not. That is the whole point. Certisave finds the nearest approved training centre, books the renewal date, and sends you one notification confirming it is sorted. You just turn up.',
  },
  {
    q: 'Do I have to sign a contract?',
    a: 'No. Monthly rolling, cancel any time. We do not lock you in because we do not need to — if it works, you stay.',
  },
  {
    q: 'Which certs do you support?',
    a: 'CSCS, IPAF, PASMA, LOLER, First Aid, IOSH, SMSTS, SSSTS, asbestos awareness, and 15+ others. If you have a cert type we do not yet support, tell us and we will add it.',
  },
  {
    q: 'Is my data safe?',
    a: 'Yes. We are UK hosted, GDPR compliant, and ICO registered. Your team data is encrypted in transit and at rest. We never share or sell anything.',
  },
];

const PricingPage = () => {
  const pageRef = useRef(null);
  const [openFaq, setOpenFaq] = useState(0);

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
    <div className="pp-page" ref={pageRef}>

      {/* ── Hero ── */}
      <section className="pp-hero">
        <div className="pp-hero-stars" aria-hidden="true">
          <span className="pp-star pp-star-1" />
          <span className="pp-star pp-star-2" />
          <span className="pp-star pp-star-3" />
        </div>
        <div className="pp-hero-inner">
          <div className="pp-hero-badge animate slide-up">
            <span className="pp-hero-badge-dot" />
            Early access pricing
          </div>
          <h1 className="pp-hero-title animate slide-up delay-1">
            One price.<br />
            <span className="pp-hero-title-blue">Locked in for life.</span>
          </h1>
          <p className="pp-hero-sub animate slide-up delay-2">
            Sign up during early access and the price never goes up. Not when we
            add features, not when we leave beta, not ever.
          </p>
        </div>
      </section>

      {/* ── Plan card ── */}
      <section className="pp-plan">
        <div className="pp-plan-inner">
          <div className="pp-plan-card animate slide-up">
            <div className="pp-plan-card-tag">Early Access</div>
            <div className="pp-plan-card-price">
              <span className="pp-plan-card-currency">£</span>
              <span className="pp-plan-card-amount">6.99</span>
              <span className="pp-plan-card-period">/month</span>
            </div>
            <p className="pp-plan-card-sub">
              Per company. Unlimited employees. Cancel any time.
            </p>
            <a href="/signup" className="pp-plan-card-btn">Get Early Access</a>
            <div className="pp-plan-card-divider" />
            <ul className="pp-plan-card-list">
              {features.map((f) => (
                <li key={f} className="pp-plan-card-item">
                  <span className="pp-plan-card-tick" aria-hidden="true">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M3 7.5l2.5 2.5L11 4.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <div className="pp-plan-side">
            <div className="pp-plan-side-block animate slide-up delay-1">
              <div className="pp-plan-side-label">Why one price</div>
              <h3 className="pp-plan-side-heading">No tiers. No upsells.</h3>
              <p className="pp-plan-side-text">
                We hate pricing pages with eight tiers and a calculator. You get
                everything we offer for one flat fee — that is the whole pricing
                page right there.
              </p>
            </div>

            <div className="pp-plan-side-block animate slide-up delay-2">
              <div className="pp-plan-side-label">What it costs you not to</div>
              <h3 className="pp-plan-side-heading">A single turned-away day costs more.</h3>
              <p className="pp-plan-side-text">
                One lad sent home from site for a lapsed card costs you a day's
                labour, the job slipping, and a phone call from the client. £6.99
                a month is cheaper than that happening once.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Comparison ── */}
      <section className="pp-compare">
        <div className="pp-compare-inner">
          <div className="pp-compare-header animate slide-up">
            <div className="pp-section-label">The Comparison</div>
            <h2 className="pp-section-heading">
              Spreadsheets vs Certisave.
            </h2>
          </div>

          <div className="pp-compare-grid">
            <div className="pp-compare-card pp-compare-card-bad animate slide-up delay-1">
              <div className="pp-compare-card-tag">The old way</div>
              <h3 className="pp-compare-card-title">Spreadsheets &amp; phone reminders</h3>
              <ul className="pp-compare-list">
                <li><span className="pp-cross">×</span>Manual tracking of every cert expiry</li>
                <li><span className="pp-cross">×</span>Someone has to remember to check it</li>
                <li><span className="pp-cross">×</span>Ringing round training centres yourself</li>
                <li><span className="pp-cross">×</span>Hoping the rebooking actually got done</li>
                <li><span className="pp-cross">×</span>Lads getting turned away from site</li>
                <li><span className="pp-cross">×</span>Hours of admin every month</li>
              </ul>
            </div>

            <div className="pp-compare-card pp-compare-card-good animate slide-up delay-2">
              <div className="pp-compare-card-tag-light">The Certisave way</div>
              <h3 className="pp-compare-card-title-light">Set it once. Done.</h3>
              <ul className="pp-compare-list-light">
                <li><span className="pp-tick-pill" aria-hidden="true">
                  <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
                    <path d="M3 7.5l2.5 2.5L11 4.5" stroke="#1d4ed8" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>Every cert tracked automatically</li>
                <li><span className="pp-tick-pill" aria-hidden="true">
                  <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
                    <path d="M3 7.5l2.5 2.5L11 4.5" stroke="#1d4ed8" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>Renewals booked before anything lapses</li>
                <li><span className="pp-tick-pill" aria-hidden="true">
                  <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
                    <path d="M3 7.5l2.5 2.5L11 4.5" stroke="#1d4ed8" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>Approved training centre network sorted</li>
                <li><span className="pp-tick-pill" aria-hidden="true">
                  <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
                    <path d="M3 7.5l2.5 2.5L11 4.5" stroke="#1d4ed8" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>One notification when it is done</li>
                <li><span className="pp-tick-pill" aria-hidden="true">
                  <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
                    <path d="M3 7.5l2.5 2.5L11 4.5" stroke="#1d4ed8" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>No one ever turned away again</li>
                <li><span className="pp-tick-pill" aria-hidden="true">
                  <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
                    <path d="M3 7.5l2.5 2.5L11 4.5" stroke="#1d4ed8" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>Five minutes a month, max</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="pp-faq">
        <div className="pp-faq-inner">
          <div className="pp-faq-header animate slide-up">
            <div className="pp-section-label">Common questions</div>
            <h2 className="pp-section-heading">
              Everything you might be wondering.
            </h2>
          </div>

          <div className="pp-faq-list">
            {faqs.map((item, i) => (
              <button
                key={item.q}
                className={`pp-faq-item ${openFaq === i ? 'is-open' : ''}`}
                onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                type="button"
              >
                <div className="pp-faq-q">
                  <span>{item.q}</span>
                  <span className="pp-faq-icon" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
                <div className="pp-faq-a">
                  <p>{item.a}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="pp-cta">
        <div className="pp-cta-inner animate slide-up">
          <h2 className="pp-cta-heading">
            £6.99/month. Locked in for life.
          </h2>
          <p className="pp-cta-sub">
            Early access is open now. No contract, no setup fees, cancel any time.
          </p>
          <a href="/signup" className="pp-cta-btn">Get Early Access</a>
        </div>
      </section>

    </div>
  );
};

export default PricingPage;