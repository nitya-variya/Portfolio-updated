import Hero from './components/Hero/Hero';
import Contact from './components/Contact/Contact';
import Footer from './components/Footer/Footer';
import Manifesto from './components/Manifesto/Manifesto';
import WorksSection from './components/Works/Works';
import SmoothScroll from './components/SmoothScroll';

function App() {
  return (
    <>
      <SmoothScroll>
        <div className="app-content">
          <Hero />
          <Manifesto />
          <WorksSection />
          <Contact />
        </div>
        <Footer />
      </SmoothScroll>
    </>
  );
}

export default App;
