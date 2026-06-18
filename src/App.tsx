import Hero from './components/Hero/Hero';
import Contact from './components/Contact/Contact';
import Footer from './components/Footer/Footer';
import Manifesto from './components/Manifesto/Manifesto';
import WebGLStory from './components/WebGLStory/WebGLStory';
import ProductReveal from './components/ProductReveal/ProductReveal';
import SmoothScroll from './components/SmoothScroll';

function App() {
  return (
    <SmoothScroll>
      <div className="app-content">
        <Hero />
        <Manifesto />
        <WebGLStory />
        <ProductReveal />
        <Contact />
      </div>
      <Footer />
    </SmoothScroll>
  );
}

export default App;



