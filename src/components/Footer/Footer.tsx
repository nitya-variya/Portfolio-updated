import mountainImg from '../../assets/Mountain.webp';
import flowerImg from '../../assets/Flower.webp';

export default function Footer() {
  return (
    <footer className="parallax-footer" id="footer" aria-label="Site footer">

      {/* ── Distant Mountains ─────────────────── */}
      <div className="parallax-footer__layer parallax-footer__layer--mountains">
        <div
          className="parallax-footer__mountains"
          style={{ backgroundImage: `url(${mountainImg})` }}
          aria-hidden="true"
        />
      </div>

      {/* ── Foreground Flowers ────────────────── */}
      <div className="parallax-footer__layer parallax-footer__layer--flowers">
        <div
          className="parallax-footer__flowers"
          style={{ backgroundImage: `url(${flowerImg})` }}
          aria-hidden="true"
        />
      </div>

      {/* ── Telemetry HUD ────────────────────── */}
      <div className="parallax-footer__hud" aria-label="HUD telemetry overlay">

        {/* Left — Narrative Hook */}
        <div className="parallax-footer__hud-left">
          <p className="hud-narrative">
            Crafting digital structures.<br />Deliberate polish.
          </p>
        </div>

        {/* Right — Grid */}
        <div className="parallax-footer__hud-right" aria-label="Contact and network grid">
          <div className="hud-grid-col">
            <span className="hud-grid-col__header">LOCAL_SYS</span>
            <span className="hud-grid-col__value">Surat, IN</span>
            <span className="hud-grid-col__value">IST (+5:30)</span>
          </div>
          <div className="hud-grid-col">
            <span className="hud-grid-col__header">TRANSMIT</span>
            <a
              href="mailto:nityavariya045@gmail.com"
              className="hud-grid-col__link"
              aria-label="Send email"
            >
              nityavariya045@gmail.com
            </a>
          </div>
          <div className="hud-grid-col">
            <span className="hud-grid-col__header">NETWORK</span>
            <a
              href="https://www.linkedin.com/in/nitya-web-designer/"
              target="_blank"
              rel="noopener noreferrer"
              className="hud-grid-col__link"
              aria-label="LinkedIn profile"
            >
              LinkedIn
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hud-grid-col__link"
              aria-label="GitHub profile"
            >
              GitHub
            </a>
          </div>
        </div>

      </div>

    </footer>
  );
}


