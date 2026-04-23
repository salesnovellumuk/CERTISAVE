import React, { useState, useEffect, useRef } from 'react';
import './styles/faq.css';

const faqs = [
  {
    q: 'How do I get started?',
    a: 'Sign up, add your employees, and upload a photo of each cert card. We extract the details and take it from there. The whole setup takes under ten minutes.',
  },
  {
    q: 'Can I view all of my team\'s certs at any time?',
    a: 'Yes. Your dashboard shows every cert across your entire team, their expiry dates, and their current status. Green, amber or red at a glance.',
  },
  {
    q: 'What happens when a cert is about to expire?',
    a: 'We send you alerts at 90, 60 and 30 days before expiry. Before it lapses we find an approved training centre near you, secure a date, and book the course. You just get a notification confirming it is sorted.',
  },
  {
    q: 'Do I have to do anything when a renewal is booked?',
    a: 'No. We handle the whole thing. Your employee just needs to turn up on the day. If a date does not work, you can let us know and we will rebook.',
  },
  {
    q: 'What certs do you cover?',
    a: 'We cover IPAF, CSCS, First Aid at Work, LOLER, PASMA and more. If you have a cert type that is not on the list just get in touch and we will add it.',
  },
  {
    q: 'Who pays for the training course itself?',
    a: 'You do. Certisave handles the admin and booking — the cost of the training course is paid directly to the training centre as normal. Our fee is just the monthly subscription.',
  },
  {
    q: 'Is there a contract or minimum term?',
    a: 'No contract, no minimum term. You can cancel any time and you will not be charged again.',
  },
  {
    q: 'What if I have more than 50 employees?',
    a: 'Get in touch and we will sort out a plan that works for your team size.',
  },
];

const FAQ = () => {
  const [open, setOpen] = useState(null);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('in-view');
        });
      },
      { threshold: 0.1 }
    );

    const els = sectionRef.current?.querySelectorAll('.animate');
    els?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section className="faq" id="faq" ref={sectionRef}>
      <div className="faq-container">

        <div className="faq-header animate slide-up">
          <div className="faq-label">FAQ</div>
          <h2 className="faq-heading">Got questions?</h2>
          <p className="faq-subheading">
            Everything you need to know about Certisave. If something is not covered here just get in touch.
          </p>
        </div>

        <div className="faq-list animate slide-up delay-2">
          {faqs.map((item, i) => (
            <div
              key={i}
              className={`faq-item ${open === i ? 'faq-item-open' : ''}`}
            >
              <button
                className="faq-question"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span>{item.q}</span>
                <span className="faq-icon">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path
                      d="M4 7L9 12L14 7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </button>
              <div className="faq-answer-wrap">
                <p className="faq-answer">{item.a}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default FAQ;