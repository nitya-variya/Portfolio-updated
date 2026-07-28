import Hero from './components/Hero/Hero';
import Footer from './components/Footer/Footer';
import Manifesto from './components/Manifesto/Manifesto';
import RockSequence from './components/ZenTransition/RockSequence';
import WorksSection from './components/Works/Works';
import AboutSection from './components/AboutSection/AboutSection';
import MethodologySection from './components/Process/MethodologySection';
import SmoothScroll from './components/SmoothScroll';

function App() {
  return (
    <>
      <SmoothScroll>
        <main className="fs_main_app_wrapper">
          <div className="app-content">
            <Hero />
            <Manifesto />
            <RockSequence />
            <WorksSection />
            <MethodologySection />
            <AboutSection />
          </div>
          <Footer />
        </main>
      </SmoothScroll>
    </>
  );
}

export default App;
