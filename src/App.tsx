import Hero from './components/Hero/Hero';
import Footer from './components/Footer/Footer';
import Manifesto from './components/Manifesto/Manifesto';
import RockSequence from './components/ZenTransition/RockSequence';
import WorksSection from './components/Works/Works';
import Capabilities from './components/Capabilities/Capabilities';
import AboutSection from './components/AboutSection/AboutSection';
import Testimonials from './components/Testimonials/Testimonials';
import Contact from './components/Contact/Contact';
import SmoothScroll from './components/SmoothScroll';

function App() {
  return (
    <>
      <SmoothScroll>
        <main className="fs_main_app_wrapper">
          <div className="app-content">
            <Hero />
            <Manifesto />
            <WorksSection />
            <RockSequence />
            <Capabilities />
            <AboutSection />
            <Testimonials />
            <Contact />
          </div>
          <Footer />
        </main>
      </SmoothScroll>
    </>
  );
}

export default App;
