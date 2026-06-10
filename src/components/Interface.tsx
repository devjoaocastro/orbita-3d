import { scrollToPage } from '../scrollBus'

function Marquee({ text }: { text: string }) {
  const chunk = Array(6).fill(text).join('  ')
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee__track">
        <span>{chunk}</span>
        <span>{chunk}</span>
      </div>
    </div>
  )
}

export default function Interface() {
  return (
    <div className="interface">
      {/* 0 — Hero */}
      <section className="section section--center section--hero">
        <p className="tagline">Creative agency · Lisbon → worldwide</p>
        <h1 className="hero-title">
          We build
          <br />
          <em>worlds</em>,
          <br />
          not websites.
        </h1>
        <p className="hero-sub">
          Immersive digital experiences — 3D, motion and code, from concept to launch.
        </p>
        <button className="cta" onClick={() => scrollToPage(1)}>
          Start the journey ↓
        </button>
        <div className="scroll-hint">
          <span className="scroll-hint__line" />
          <span className="scroll-hint__label">scroll</span>
        </div>
      </section>

      {/* 1 — Manifesto */}
      <section className="section section--left" data-num="01">
        <p className="kicker">01 — Manifesto</p>
        <h2>
          The screen is
          <br />
          our stage.
        </h2>
        <p className="body">
          Every pixel has physics. Every scroll tells a story. We design interfaces that
          breathe, react and stay in memory — the internet already has enough pages that
          feel like paper.
        </p>
        <Marquee text="IMMERSIVE — INTERACTIVE — UNFORGETTABLE —" />
      </section>

      {/* 2 — Services */}
      <section className="section section--left" data-num="02">
        <p className="kicker">02 — Services</p>
        <ul className="services">
          <li>
            <span>01</span>Immersive web &amp; WebGL
          </li>
          <li>
            <span>02</span>3D branding &amp; identity
          </li>
          <li>
            <span>03</span>Motion design
          </li>
          <li>
            <span>04</span>Art direction
          </li>
        </ul>
        <p className="hint">→ hover the objects</p>
      </section>

      {/* 3 — Work */}
      <section className="section section--top" data-num="03">
        <p className="kicker">03 — Work</p>
        <h2>Selected.</h2>
        <ul className="projects">
          <li>
            <em>NEBULA</em> — immersive platform · 2026
          </li>
          <li>
            <em>PULSE</em> — living identity · 2025
          </li>
          <li>
            <em>TIDE</em> — sensorial e-commerce · 2025
          </li>
        </ul>
      </section>

      {/* 4 — Studio */}
      <section className="section section--center" data-num="04">
        <p className="kicker">04 — Studio</p>
        <h2>
          Our own <em>gravity</em>.
        </h2>
        <div className="stats">
          <div>
            <strong>48</strong>
            <span>projects</span>
          </div>
          <div>
            <strong>12</strong>
            <span>awards</span>
          </div>
          <div>
            <strong>9</strong>
            <span>countries</span>
          </div>
        </div>
      </section>

      {/* 5 — Contact */}
      <section className="section section--center" data-num="05">
        <Marquee text="LET'S TALK — LET'S TALK —" />
        <p className="kicker">05 — Contact</p>
        <h2>
          Let's build the
          <br />
          <em>impossible</em>.
        </h2>
        <a className="cta cta--big" href="mailto:hello@orbita.studio">
          hello@orbita.studio
        </a>
        <footer className="footer">
          <span>ÓRBITA® {new Date().getFullYear()}</span>
          <span>Lisbon — in orbit</span>
        </footer>
      </section>
    </div>
  )
}
