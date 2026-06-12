import Hero from './components/Hero/Hero';

function App() {
  return (
    <>
      <Hero />
      {/* Placeholder next section for scroll-triggered fade */}
      <section
        className="next-section"
        aria-label="Featured work"
      >
        <div className="next-section__inner">
          <h2>Selected Works</h2>
          <p>A curated collection of projects that push creative boundaries.</p>
        </div>
      </section>
    </>
  );
}

export default App;
