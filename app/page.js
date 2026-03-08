export const dynamic = 'force-dynamic';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="landing">
      <div className="landing-bg" />

      {/* Navigation */}
      <nav className="landing-nav">
        <div className="landing-logo">
          <div className="logo-icon">📄</div>
          DocsVault
        </div>
        <div className="landing-nav-links">
          <Link href="/login" className="btn btn-ghost">Sign In</Link>
          <Link href="/register" className="btn btn-primary btn-sm">Get Started Free</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-badge">
          ✨ Open Source DocSend Alternative
        </div>
        <h1>
          Share Documents.<br />
          <span className="gradient-text">Track Everything.</span>
        </h1>
        <p className="hero-subtitle">
          Upload your pitch decks, proposals, and documents. Share them via secure links and get real-time analytics on who viewed what, when, and for how long.
        </p>
        <div className="hero-actions">
          <Link href="/register" className="btn btn-primary btn-lg">
            Start Sharing — It&apos;s Free
          </Link>
          <Link href="/login" className="btn btn-secondary btn-lg">
            Sign In →
          </Link>
        </div>
        <div className="hero-stats">
          <div className="hero-stat">
            <div className="stat-number">100%</div>
            <div className="stat-label">Self-Hosted</div>
          </div>
          <div className="hero-stat">
            <div className="stat-number">Real-time</div>
            <div className="stat-label">Analytics</div>
          </div>
          <div className="hero-stat">
            <div className="stat-number">∞</div>
            <div className="stat-label">Documents</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <h2>Everything you need to share <span className="gradient-text">smarter</span></h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🔗</div>
            <h3>Secure Link Sharing</h3>
            <p>Create shareable links with email gates, passcode protection, expiration dates, and download controls. Full control over who sees your documents.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Page-Level Analytics</h3>
            <p>See exactly which pages each viewer spent time on. Understand engagement with a heatmap of page views and time spent per page.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">👥</div>
            <h3>Viewer Tracking</h3>
            <p>Know who opened your document, when they viewed it, how long they spent, and which pages caught their attention.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🛡️</div>
            <h3>Email Gate & Passcode</h3>
            <p>Require viewers to enter their email before accessing your document. Add an optional passcode for extra security.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⏱️</div>
            <h3>Link Expiration</h3>
            <p>Set expiration dates on your links. Once expired, your document is automatically no longer accessible via that link.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🚀</div>
            <h3>Self-Hosted</h3>
            <p>Deploy on your own Vercel account. Your data stays yours. No third-party access to your sensitive documents.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
