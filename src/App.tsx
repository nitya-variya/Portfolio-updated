import Hero from './components/Hero/Hero';
import Contact from './components/Contact/Contact';
import Footer from './components/Footer/Footer';
import SmoothScroll from './components/SmoothScroll';

function App() {
  return (
    <SmoothScroll>
      <Hero />
      <section
        className="next-section"
        aria-label="Featured work"
      >
        <div className="next-section__inner">
          <h2>Selected Works</h2>
          <p>A curated collection of projects that push creative boundaries.</p>
        </div>
      </section>
      <Contact />
      <Footer />
    </SmoothScroll>
  );
}

export default App;



