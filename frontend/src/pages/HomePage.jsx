import React from 'react'
import Hero from '../components/sections/hero/Hero'
import About from '../components/sections/about/About'
import HowItWorks from '../components/sections/howitworks/HowItWorks'
import Pricing from '../components/sections/pricing/Pricing'
import FAQ from '../components/sections/faq/Faq'
import Contact from '../components/sections/contact/Contact'

const HomePage = () => {
  return (
    <div className="w-full min-w-full">
      <Hero />
      <About />
      <HowItWorks />
      <Pricing />
      <FAQ />
      <Contact />
    </div>
  )
}

export default HomePage