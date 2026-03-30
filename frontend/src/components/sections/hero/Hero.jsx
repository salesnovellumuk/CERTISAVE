import React, { useEffect, useState } from 'react';
import './styles/hero.css';

const Hero = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <section className="hero-section">

      <div className="hero-stars" aria-hidden="true">
        <span className="star star-1" />
        <span className="star star-2" />
        <span className="star star-3" />
        <span className="star star-4" />
        <span className="star star-5" />
        <span className="star star-6" />
      </div>

      <div className="hero-inner">
        <div className={`hero-content ${isLoaded ? 'is-loaded' : ''}`}>

          <div className="hero-badge">
            <span className="hero-badge-dot" />
            Early access open
          </div>

          <h1 className="hero-title">
            Your team's certs.<br />
            <span className="hero-title-blue">Under control.</span>
          </h1>

          <p className="hero-sub">
            Certisave tracks every CSCS card, IPAF cert, insurance doc and
            training qualification across your whole team — and automatically
            rebooks the training before anything lapses.
          </p>

          <div className="hero-actions">
            <a href="#contact" className="hero-cta-btn">
              Get Early Access
            </a>
          </div>

        </div>

        <div className="hero-visual-wrap">
          <div className={`hero-visual ${isLoaded ? 'is-loaded' : ''}`}>
            <img
              src="https://ik.imagekit.io/o6eendyey/CERTISAVE/CERTIIMAGE2.webp?tr=w-900,f-auto,pr-true"
              alt="Construction site"
              className="hero-img"
            />
          </div>
        </div>

      </div>
    </section>
  );
};

export default Hero;