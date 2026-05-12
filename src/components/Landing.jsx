import { useState, useEffect } from 'react';
import './Landing.css';

const FEATURES = [
  { icon: '📖', title: 'Study Guides', desc: 'Comprehensive, structured guides with key takeaways for any topic.' },
  { icon: '🔀', title: 'Flowcharts', desc: 'Visual learning roadmaps from basics to mastery, step by step.' },
  { icon: '📊', title: 'Reports', desc: 'In-depth academic reports with abstracts, analysis, and references.' },
  { icon: '🔑', title: 'Key Points', desc: 'Priority-ranked essential concepts with importance indicators.' },
  { icon: '❓', title: 'Quizzes', desc: 'Interactive MCQ quizzes with instant scoring and explanations.' },
  { icon: '📄', title: 'PDF Sources', desc: 'Upload your own PDFs and let AI extract study materials from them.' },
];

const STEPS = [
  { num: '01', title: 'Enter Your Topic', desc: 'Type any subject, concept, or upload a PDF document as source material.' },
  { num: '02', title: 'AI Generates Everything', desc: 'Our Gemini-powered AI creates study guides, flowcharts, reports, key points, and quizzes in parallel.' },
  { num: '03', title: 'Study & Test Yourself', desc: 'Review the materials, take interactive quizzes, and track your understanding.' },
];

const STATS = [
  { value: '∞', label: 'Topics Available' },
  { value: '5', label: 'Content Types' },
  { value: '10x', label: 'Depth Mode' },
  { value: '< 30s', label: 'Generation Time' },
];

export default function Landing({ onGetStarted, onLogin, onSignup }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <div className="landing">
      {/* Navbar */}
      <nav className={`land-nav ${scrolled ? 'land-nav--scrolled' : ''}`}>
        <div className="land-nav__inner">
          <div className="land-nav__logo">
            <span className="land-nav__logo-icon">🚀</span>
            <span className="land-nav__logo-text">Learn<span className="land-nav__logo-accent">Lyft</span></span>
          </div>
          <div className="land-nav__links">
            <a href="#features" className="land-nav__link">Features</a>
            <a href="#how" className="land-nav__link">How it Works</a>
            <a href="#about" className="land-nav__link">About</a>
          </div>
          <div className="land-nav__actions">
            <button className="land-nav__login" onClick={onLogin}>Log In</button>
            <button className="land-nav__signup" onClick={onSignup}>Sign Up Free</button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="land-hero">
        <div className="land-hero__content">
          <div className="land-hero__badge animate-fade-in">
            <span className="land-hero__badge-dot" />
            Powered by Gemini AI
          </div>
          <h1 className="land-hero__title animate-fade-in">
            Elevate Your Learning<br />
            <span className="land-hero__title-gradient">With AI Superpowers</span>
          </h1>
          <p className="land-hero__subtitle animate-fade-in" style={{ animationDelay: '.1s' }}>
            LearnLyft transforms any topic into comprehensive study guides, visual flowcharts,
            detailed reports, key points, and interactive quizzes — all generated instantly by AI.
          </p>
          <div className="land-hero__ctas animate-fade-in" style={{ animationDelay: '.2s' }}>
            <button className="land-hero__cta-primary" onClick={onGetStarted}>
              Get Started Free
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
            <a href="#features" className="land-hero__cta-secondary">See Features ↓</a>
          </div>
        </div>
        <div className="land-hero__visual animate-fade-in" style={{ animationDelay: '.3s' }}>
          <div className="land-hero__card land-hero__card--1">📖 Study Guide</div>
          <div className="land-hero__card land-hero__card--2">🔀 Flowchart</div>
          <div className="land-hero__card land-hero__card--3">📊 Report</div>
          <div className="land-hero__card land-hero__card--4">🔑 Key Points</div>
          <div className="land-hero__card land-hero__card--5">❓ Quiz</div>
          <div className="land-hero__glow" />
        </div>
      </section>

      {/* Stats */}
      <section className="land-stats">
        {STATS.map((s, i) => (
          <div key={i} className="land-stat">
            <div className="land-stat__value">{s.value}</div>
            <div className="land-stat__label">{s.label}</div>
          </div>
        ))}
      </section>

      {/* Features */}
      <section className="land-features" id="features">
        <h2 className="land-section-title">Everything You Need to <span className="gradient-text">Study Smarter</span></h2>
        <p className="land-section-sub">One topic. Five powerful AI-generated resources. Zero effort.</p>
        <div className="land-features__grid">
          {FEATURES.map((f, i) => (
            <div key={i} className="land-feature-card" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="land-feature-card__icon">{f.icon}</div>
              <h3 className="land-feature-card__title">{f.title}</h3>
              <p className="land-feature-card__desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section className="land-how" id="how">
        <h2 className="land-section-title">How <span className="gradient-text">LearnLyft</span> Works</h2>
        <p className="land-section-sub">Three simple steps to unlock AI-powered learning.</p>
        <div className="land-how__steps">
          {STEPS.map((s, i) => (
            <div key={i} className="land-step">
              <div className="land-step__num">{s.num}</div>
              <h3 className="land-step__title">{s.title}</h3>
              <p className="land-step__desc">{s.desc}</p>
              {i < STEPS.length - 1 && <div className="land-step__arrow">→</div>}
            </div>
          ))}
        </div>
      </section>

      {/* Depth Mode CTA */}
      <section className="land-depth">
        <div className="land-depth__inner">
          <div className="land-depth__icon">🌀</div>
          <h2 className="land-depth__title">Super Depth Mode</h2>
          <p className="land-depth__desc">
            Toggle on Super Depth Mode for 10x more detailed content — graduate-level explanations,
            20+ quiz questions, advanced concepts, and expert-level insights. Experience the wormhole.
          </p>
          <button className="land-hero__cta-primary" onClick={onGetStarted}>Try Super Depth Mode</button>
        </div>
      </section>

      {/* About & Footer */}
      <footer className="land-footer" id="about">
        <div className="land-footer__top">
          <div className="land-footer__brand">
            <div className="land-nav__logo" style={{ marginBottom: 12 }}>
              <span className="land-nav__logo-icon">🚀</span>
              <span className="land-nav__logo-text">Learn<span className="land-nav__logo-accent">Lyft</span></span>
            </div>
            <p className="land-footer__tagline">Elevate your learning with AI-powered study tools.</p>
          </div>
          <div className="land-footer__col">
            <h4>Product</h4>
            <a href="#features">Features</a>
            <a href="#how">How it Works</a>
            <button onClick={onGetStarted} className="land-footer__link-btn">Get Started</button>
          </div>
          <div className="land-footer__col">
            <h4>Company</h4>
            <span>Built by <strong>CoreStar</strong></span>
            <span>Owned by <strong>Hruddayansh</strong></span>
          </div>
        </div>
        <div className="land-footer__bottom">
          <p>© 2026 LearnLyft. Made with ❤️ by <strong>CoreStar</strong> · Owned by <strong>Hruddayansh</strong></p>
        </div>
      </footer>
    </div>
  );
}
