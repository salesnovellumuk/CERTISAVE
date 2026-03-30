// src/pages/AboutPage.jsx
import React from 'react';

const AboutPage = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          {/* Left column */}
          <div className="relative">
            <h2 className="text-4xl font-light tracking-tight mb-6">
              *Your About Heading*
            </h2>
          </div>

          {/* Right column */}
          <div className="relative">
            <p className="text-xl leading-relaxed">
              *Your Description Here* Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
              Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
          </div>
        </div>

        {/* Additional Content Section */}
        <div className="text-center mt-12">
          <button className="px-8 py-3 bg-black text-white hover:bg-gray-800 transition-colors duration-200">
            <span>*Call To Action*</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default AboutPage;