import Hero from './components/Hero/Hero';
import Contact from './components/Contact/Contact';
import Footer from './components/Footer/Footer';
import Manifesto from './components/Manifesto/Manifesto';
import AssemblyStory from './components/AssemblyStory/AssemblyStory';
import ProductReveal from './components/ProductReveal/ProductReveal';
import SmoothScroll from './components/SmoothScroll';

function App() {
  return (
    <SmoothScroll>
      <div className="app-content">
        <Hero />
        <Manifesto />
        <AssemblyStory />
        <ProductReveal />
        <Contact />
      </div>
      <Footer />
    </SmoothScroll>
  );
}

export default App;



