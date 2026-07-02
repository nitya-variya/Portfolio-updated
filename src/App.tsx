import Hero from './components/Hero/Hero';
import Footer from './components/Footer/Footer';
import Manifesto from './components/Manifesto/Manifesto';
import WorksSection from './components/Works/Works';
// import BrutalistArchive from './components/Archive/Archive';
import SmoothScroll from './components/SmoothScroll';
import GradualBlur from './components/GradualBlur';

function App() {
  return (
    <>
      <SmoothScroll>
        <main className="fs_main_app_wrapper">
          <div className="app-content">
            <Hero />
            <Manifesto />
            <WorksSection />
            {/* <BrutalistArchive /> */}
            {/* <Contact /> */}
          </div>
          <Footer />
        </main>
      </SmoothScroll>

      {/* 2. THE GLOBAL FIXED BLUR LENS */}
      <div 
        className="fs_global_blur_overlay"
        style={{ 
          position: 'fixed',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '15vh',
          pointerEvents: 'none',
          zIndex: 9999
        }}
      >
        <GradualBlur 
          target="page" 
          position="bottom" 
          height="100%" 
          strength={4}  
          divCount={8}  
          curve="bezier" 
        />
      </div>
    </>
  );
}

export default App;
