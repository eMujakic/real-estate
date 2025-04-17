import React from 'react'
import HeroSection from './HeroSection'
import FeaturesSection from './FeaturesSection'
import DiscoverSection from './DiscoverSection'
import CallToAction from './CallToAction'
import FooterSection from './FooterSection'


const Landing = () => {
  return (
    <div>
      <HeroSection></HeroSection>
      <FeaturesSection></FeaturesSection>
      <DiscoverSection></DiscoverSection>
      <CallToAction></CallToAction>
      <FooterSection></FooterSection>
    </div>
  )
}

export default Landing