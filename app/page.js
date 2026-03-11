'use client';

export const dynamic = 'force-dynamic';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="landing">
      <div className="landing-bg" />

      {/* Premium Navigation */}
      <nav className="landing-nav" style={{ justifyContent: 'space-between', padding: '1rem 4rem' }}>
        <div className="landing-logo">
          <div className="logo-icon">📄</div>
          DocsVault
        </div>
        <div className="landing-nav-links">
          <Link href="/compare" className="btn btn-ghost">Compare</Link>
          <Link href="/donate" className="btn btn-ghost">Support</Link>
          <Link href="/login" className="btn btn-ghost">Sign In</Link>
          <Link href="/register" className="btn btn-primary btn-sm">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-badge animate-float">
          ✨ The Evolution of Document Sharing
        </div>
        <h1 className="text-glow">
          Share Documents. <br />
          <span className="gradient-text">Augmented by AI.</span>
        </h1>
        <p className="hero-subtitle">
            Securely distribute your documents with page-level tracking, email gated access, and an intelligent AI knowledge base that answers viewer questions automatically.
        </p>
        <div className="hero-actions">
          <Link href="/register" className="btn btn-primary btn-lg">
            Start Sharing — It&apos;s Free
          </Link>
          <Link href="/compare" className="btn btn-secondary btn-lg">
            See Comparisons →
          </Link>
        </div>
        
        {/* Visual Hook - Dashboard Preview Placeholder */}
        <div style={{ 
          marginTop: '4rem', 
          width: '90%', 
          maxWidth: '1000px', 
          height: '400px', 
          background: 'rgba(255,255,255,0.05)', 
          borderRadius: '24px', 
          border: '1px solid rgba(249,115,22,0.2)',
          boxShadow: '0 0 50px rgba(249,115,22,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          color: 'var(--text-tertiary)',
          backdropFilter: 'blur(20px)',
          animation: 'fadeInUp 1s ease 0.5s both'
        }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '1rem' }}>📈</div>
                <p>Interactive Analytics & AI Knowledge Base Dashboard</p>
            </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section className="features-section" style={{ paddingTop: '8rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <h2 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Smarter <span className="gradient-text">Distribution</span></h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
                Stop sending blind PDFs. Get full visibility into how your audience interacts with your most important materials.
            </p>
        </div>

        <div className="features-grid">
          {/* AI Feature */}
          <div className="feature-card glass-card">
            <div className="feature-icon">🤖</div>
            <h3 className="gradient-text">AI Knowledge Base</h3>
            <p>Every document you upload becomes an intelligent expert. Viewers can ask any question, and our AI answers based directly on your content, saving you hours of meetings.</p>
          </div>

          {/* Sharing Feature */}
          <div className="feature-card glass-card">
            <div className="feature-icon">🛡️</div>
            <h3 className="gradient-text">Advanced Controls</h3>
            <p>Go beyond simple links. Implement Email Gates to capture leads, Passcode Protection for confidentiality, and Expiration Dates for time-sensitive deals.</p>
          </div>

          {/* Analytics Feature */}
          <div className="feature-card glass-card">
            <div className="feature-icon">👁️‍🗨️</div>
            <h3 className="gradient-text">Stunning Analytics</h3>
            <p>See exactly which pages catch the eye. Track time spent per page, browser type, location, and individual engagement metrics in a premium dashboard.</p>
          </div>
        </div>
      </section>

      {/* Comparison Preview */}
      <section style={{ padding: '8rem 2rem', textAlign: 'center' }}>
        <h2>Why choosing us?</h2>
        <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
            <div className="glass-card" style={{ padding: '2rem', borderRadius: '16px', width: '300px' }}>
                <div style={{ fontSize: '24px', marginBottom: '1rem' }}>💎</div>
                <h4>Free AI KB</h4>
                <p style={{ fontSize: '14px', color: 'var(--text-tertiary)' }}>No extra cost for automated Q&A on your links.</p>
            </div>
            <div className="glass-card" style={{ padding: '2rem', borderRadius: '16px', width: '300px' }}>
                <div style={{ fontSize: '24px', marginBottom: '1rem' }}>♾️</div>
                <h4>Unlimited Docs</h4>
                <p style={{ fontSize: '14px', color: 'var(--text-tertiary)' }}>No restrictive limits on your document library.</p>
            </div>
            <div className="glass-card" style={{ padding: '2rem', borderRadius: '16px', width: '300px' }}>
                <div style={{ fontSize: '24px', marginBottom: '1rem' }}>🚀</div>
                <h4>Ultra Performance</h4>
                <p style={{ fontSize: '14px', color: 'var(--text-tertiary)' }}>Instant navigation and site-wide &lt;15ms latency experience.</p>
            </div>
        </div>
        <div style={{ marginTop: '4rem' }}>
            <Link href="/compare" className="btn btn-secondary">
                View Full Comparison Table
            </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '4rem', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
        <div className="landing-logo" style={{ justifyContent: 'center', marginBottom: '1rem' }}>
          <div className="logo-icon">📄</div> DocsVault
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>© 2026 DocsVault. Built for high-performance teams.</p>
      </footer>

      <style jsx>{`
        .gradient-text {
          background: linear-gradient(135deg, #F97316 0%, #FB923C 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .hero h1 {
          font-size: 5rem;
          font-weight: 900;
          letter-spacing: -2px;
          line-height: 1;
        }
        @media (max-width: 768px) {
          .hero h1 { font-size: 3rem; }
          .landing-nav { padding: 1rem !important; }
        }
      `}</style>
    </div>
  );
}
