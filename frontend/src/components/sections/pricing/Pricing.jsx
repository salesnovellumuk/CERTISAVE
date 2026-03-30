import React, { useEffect, useRef } from 'react';
import './styles/pricing.css';

const tiers = [
  {
    name: 'Starter',
    price: '12.99',
    employees: 'Up to 15 employees',
    cta: 'Get Started',
    ctaHref: '#contact',
    note: 'No contract. Cancel any time.',
    included: [
      'Unlimited cert uploads',
      'Automatic expiry tracking',
      'Training course rebooking',
      'Email notifications at your selected intervals',
      'IPAF, CSCS, First Aid, LOLER, PASMA and more',
      'No hidden fees, no contracts',
    ],
    highlight: false,
  },
  {
    name: 'Growth',
    price: '24.99',
    employees: 'Up to 50 employees',
    cta: 'Get Started',
    ctaHref: '#contact',
    note: 'No contract. Cancel any time.',
    included: [
      'Everything in Starter',
      'Priority rebooking',
      'Dedicated account manager',
      'Monthly compliance summary report',
      'Multi-site team support',
      'No hidden fees, no contracts',
    ],
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: null,
    employees: '50+ employees',
    cta: 'Get in Touch',
    ctaHref: '#contact',
    note: 'Custom pricing for your team.',
    included: [
      'Everything in Growth',
      'Unlimited employees',
      'Custom cert types',
      'Bespoke reporting',
      'SLA guaranteed response times',
      'Dedicated support line',
    ],
    highlight: false,
  },
];

const Pricing = () => {
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
      { threshold: 0.1 }
    );

    const els = sectionRef.current?.querySelectorAll('.animate');
    els?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section className="pricing" id="pricing" ref={sectionRef}>
      <div className="pricing-container">

        <div className="pricing-header animate slide-up">
          <div className="pricing-label">Pricing</div>
          <h2 className="pricing-heading">
            One price.<br />No surprises.
          </h2>
          <p className="pricing-subheading">
            Flat rate, cancel any time. Less than a round of coffees a month
            to never think about cert admin again.
          </p>
        </div>

        <div className="pricing-grid">
          {tiers.map((tier, i) => (
            <div
              key={tier.name}
              className={`pricing-card animate slide-up delay-${i + 1} ${tier.highlight ? 'pricing-card-highlight' : ''}`}
            >
              {tier.highlight && <div className="pricing-badge">Most Popular</div>}
              <div className="pricing-tier">{tier.name}</div>

              <div className="pricing-price">
                {tier.price ? (
                  <>
                    <span className="pricing-currency">£</span>
                    <span className="pricing-amount">{tier.price}</span>
                    <span className="pricing-period">/mo</span>
                  </>
                ) : (
                  <span className="pricing-custom">Custom</span>
                )}
              </div>

              <p className="pricing-employees">{tier.employees}</p>

              <a href={tier.ctaHref} className={`pricing-cta ${tier.highlight ? 'pricing-cta-highlight' : ''}`}>
                {tier.cta}
              </a>
              <p className="pricing-note">{tier.note}</p>

              <div className="pricing-divider" />

              <ul className="pricing-list">
                {tier.included.map((item) => (
                  <li key={item} className="pricing-list-item">
                    <span className="pricing-check">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M2 7L5.5 10.5L12 3.5" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Pricing;