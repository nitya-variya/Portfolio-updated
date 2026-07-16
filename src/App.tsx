import Hero from './components/Hero/Hero';
import About from './components/About/About';
import Footer from './components/Footer/Footer';
import Manifesto from './components/Manifesto/Manifesto';
import WorksSection from './components/Works/Works';
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
            <WorksSection />
            <MethodologySection />
            <About />
          </div>
          <Footer />
        </main>
      </SmoothScroll>
    </>
  );
}

export default App;
