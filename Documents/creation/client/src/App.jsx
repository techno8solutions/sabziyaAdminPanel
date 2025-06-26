import './App.css'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import FeaturedProducts from './components/FeaturedProducts'
import WhatWeOffer from './components/WhatWeOffer'
import WhyChooseUs from './components/WhyChooseUs'
import TestimonialSection from './components/Testimonial'
import ContactSection from './components/ContactSection'
import InstagramPreview from './components/InstagramPreview'

function App() {

  return (
    <div>
      <Navbar />
      <Hero />
      <FeaturedProducts />
      <WhatWeOffer />
      <InstagramPreview />
      <WhyChooseUs />
      <ContactSection />
      <Routes>
        <Route path="/" element={<Home />} />
        {/* <Route path="/about" element={<About />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/contact" element={<Contact />} /> */}
      </Routes>
    </div>
  )
}

export default App
