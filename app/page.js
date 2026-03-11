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

      {/* 1. Vibrant Hero Section (Based on Slide 2) */}
      <section className="hero container" style={{ 
        paddingTop: '160px', 
        paddingBottom: '100px',
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr',
        gap: '4rem',
        alignItems: 'center',
        textAlign: 'left',
        minHeight: 'auto'
      }}>
        <div className="animate-fadeInUp">
          <div className="hero-badge" style={{ 
            background: 'rgba(249,115,22,0.05)', 
            border: '1px solid rgba(249,115,22,0.1)',
            color: 'var(--accent-primary)',
            marginBottom: '1.5rem',
            display: 'inline-flex'
          }}>
            ✨ Next-Gen Document Distribution
          </div>
          <h1 style={{ 
            fontSize: '5rem', 
            fontWeight: '900', 
            lineHeight: '1.1', 
            marginBottom: '2rem',
            color: 'var(--text-primary)'
          }}>
            Share Documents. <br />
            <span className="gradient-text-vibrant">Augmented by AI.</span>
          </h1>
          <p style={{ 
            fontSize: '1.25rem', 
            color: 'var(--text-secondary)', 
            marginBottom: '3rem',
            maxWidth: '600px',
            lineHeight: '1.6'
          }}>
            The most secure way to distribute your high-stakes documents, now with AI-powered Q&A for your viewers. Track engagement, gate access, and answer questions automatically.
          </p>
          <div className="hero-actions" style={{ display: 'flex', gap: '1.5rem' }}>
            <Link href="/register" className="btn btn-primary btn-lg" style={{ padding: '1.25rem 2.5rem' }}>
              Get Started Free
            </Link>
            <Link href="/compare" className="btn btn-secondary btn-lg" style={{ padding: '1.25rem 2.5rem' }}>
              Compare with DocSend
            </Link>
          </div>
        </div>

        <div className="hero-visual animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
          <div className="hero-vibrant-gradient" />
          <div className="glass-card" style={{ 
            width: '100%', 
            height: '400px', 
            borderRadius: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1,
            position: 'relative'
          }}>
             <div className="mockup-window" style={{ width: '90%', height: '80%' }}>
                <div className="mockup-header">
                    <div className="dot" /> <div className="dot" /> <div className="dot" />
                </div>
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '40px', marginBottom: '1rem' }}>📄✨</div>
                    <p style={{ color: 'var(--text-secondary)' }}>Intelligent Document Preview</p>
                    <div style={{ 
                        marginTop: '2rem', 
                        height: '100px', 
                        background: 'var(--bg-tertiary)', 
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <span className="text-glow" style={{ fontSize: '12px', color: 'var(--accent-primary)' }}>Analyzing content with AI...</span>
                    </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* 2. AI Knowledge Base Showcase (Based on Slide 4) */}
      <section style={{ padding: '100px 2rem', background: 'var(--bg-secondary)' }}>
        <div className="container" style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1.2fr', 
          gap: '6rem', 
          alignItems: 'center' 
        }}>
           <div className="mockup-window animate-fadeInUp">
                <div className="mockup-header">
                    <div className="dot" /> <div className="dot" /> <div className="dot" />
                    <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginLeft: 'auto' }}>view.docvault.xyz/pitch-deck</span>
                </div>
                <div style={{ padding: '1.5rem', background: 'var(--bg-primary)' }}>
                    <div style={{ height: '300px', background: 'white', borderRadius: '8px', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', fontWeight: '700' }}>Investment Pitch Deck.pdf</div>
                        <div style={{ padding: '1rem' }}>
                            <div style={{ height: '10px', background: 'var(--bg-tertiary)', width: '60%', marginBottom: '10px' }} />
                            <div style={{ height: '10px', background: 'var(--bg-tertiary)', width: '80%', marginBottom: '10px' }} />
                            <div style={{ height: '10px', background: 'var(--bg-tertiary)', width: '40%', marginBottom: '10px' }} />
                        </div>
                        {/* Floating AI Chat Mockup */}
                        <div className="glass-card animate-float" style={{ 
                            position: 'absolute', 
                            bottom: '20px', 
                            right: '20px', 
                            width: '240px',
                            padding: '1rem',
                            borderRadius: '16px',
                            border: '1px solid var(--accent-glow)',
                            boxShadow: 'var(--shadow-lg)'
                        }}>
                            <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--accent-primary)', marginBottom: '4px' }}>AI ANALYST</div>
                            <p style={{ fontSize: '11px', lineHeight: '1.4' }}>&quot;The Q3 projections show a 40% YoY growth in recurring revenue.&quot;</p>
                        </div>
                    </div>
                </div>
           </div>

           <div className="animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
                <h2 style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>AI <span className="gradient-text">Knowledge Base</span></h2>
                <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: '1.6' }}>
                    Stop repeating yourself in every meeting. Every document you share becomes an intelligent expert. Your viewers can ask specific questions and get instant, context-aware answers derived straight from your content.
                </p>
                <div style={{ display: 'grid', gap: '1rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--success-bg)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center' }}>⚡</div>
                        <div>
                            <span style={{ fontWeight: '700' }}>Instant Answers</span>
                            <p style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>Reduce friction for decision makers with real-time Q&A.</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--accent-glow)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center' }}>🧠</div>
                        <div>
                            <span style={{ fontWeight: '700' }}>Semantic Understanding</span>
                            <p style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>Advanced LLMs process your docs for deep analytical accuracy.</p>
                        </div>
                    </div>
                </div>
           </div>
        </div>
      </section>

      {/* 3. Process Flow Section (Based on Slide 5) */}
      <section style={{ padding: '100px 2rem', textAlign: 'center' }}>
        <div className="container">
            <h2 style={{ fontSize: '3rem', marginBottom: '4rem' }}>How it <span className="gradient-text">Works</span></h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '3rem' }}>
                <div className="animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
                    <div className="step-card">
                        <div className="step-number">1</div>
                        <h3>Upload</h3>
                        <p style={{ color: 'var(--text-tertiary)', fontSize: '14px', marginTop: '1rem' }}>
                            Securely upload your PDFs. Our system automatically indexes content for AI semantic search.
                        </p>
                        <div style={{ marginTop: '2rem', height: '120px', background: 'var(--bg-primary)', borderRadius: '12px', border: '1px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                            📁
                        </div>
                    </div>
                </div>
                <div className="animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                    <div className="step-card">
                        <div className="step-number">2</div>
                        <h3>Configure</h3>
                        <p style={{ color: 'var(--text-tertiary)', fontSize: '14px', marginTop: '1rem' }}>
                            Set your gatekeeping rules. Choose between Email Gate, Passcode, or Expiration dates.
                        </p>
                        <div style={{ marginTop: '2rem', padding: '1rem', background: 'var(--bg-primary)', borderRadius: '12px', textAlign: 'left' }}>
                            <div style={{ height: '8px', width: '100%', background: 'var(--accent-primary)', opacity: 0.2, borderRadius: '4px', marginBottom: '10px' }} />
                            <div style={{ height: '8px', width: '60%', background: 'var(--accent-primary)', opacity: 0.1, borderRadius: '4px' }} />
                        </div>
                    </div>
                </div>
                <div className="animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
                    <div className="step-card">
                        <div className="step-number">3</div>
                        <h3>Analyze</h3>
                        <p style={{ color: 'var(--text-tertiary)', fontSize: '14px', marginTop: '1rem' }}>
                            Get notified when viewers interact. Track page-level analytics and see AI chat logs.
                        </p>
                        <div style={{ marginTop: '2rem', height: '120px', background: 'var(--bg-primary)', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                             <div style={{ width: '40px', height: '60px', background: 'var(--accent-primary)', opacity: 0.3, borderRadius: '4px', margin: '2px' }} />
                             <div style={{ width: '40px', height: '80px', background: 'var(--accent-primary)', opacity: 0.5, borderRadius: '4px', margin: '2px' }} />
                             <div style={{ width: '40px', height: '40px', background: 'var(--accent-primary)', opacity: 0.2, borderRadius: '4px', margin: '2px' }} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* 4. Secure Features Grid (Based on Slide 6) */}
      <section style={{ padding: '100px 2rem', background: 'var(--bg-secondary)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Professional <span className="gradient-text">Security</span></h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '5rem' }}>Enterprise-grade features for businesses of all sizes.</p>
            
            <div className="features-grid">
                <div className="feature-card glass-card">
                    <div className="feature-icon" style={{ background: 'var(--accent-glow)' }}>📧</div>
                    <h3 style={{ marginBottom: '1rem' }}>Email Gating</h3>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Know exactly who is viewing. Capture names and emails before granting access to your sensitive material.</p>
                </div>
                <div className="feature-card glass-card">
                    <div className="feature-icon" style={{ background: 'var(--success-bg)' }}>🔑</div>
                    <h3 style={{ marginBottom: '1rem' }}>Passcode Access</h3>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Add an extra layer of protection. Ensure only intended recipients with the correct passcode can unlock documents.</p>
                </div>
                <div className="feature-card glass-card">
                    <div className="feature-icon" style={{ background: 'var(--danger-bg)' }}>⏳</div>
                    <h3 style={{ marginBottom: '1rem' }}>Auto Expiry</h3>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Control the timeline. Automatically disable sharing links after a specific date or time to prevent leaks.</p>
                </div>
            </div>

            <div style={{ marginTop: '6rem', padding: '4rem', borderRadius: '40px', background: 'var(--accent-gradient)', color: 'white', textAlign: 'center' }}>
                <h2 style={{ color: 'white', fontSize: '3rem', marginBottom: '1rem' }}>Ready to Share Better?</h2>
                <p style={{ opacity: 0.9, marginBottom: '2.5rem', fontSize: '1.25rem' }}>Join the next evolution of document distribution today.</p>
                <Link href="/register" className="btn btn-secondary btn-lg" style={{ background: 'white', color: 'var(--accent-primary)', border: 'none' }}>
                    Create Your First Vault →
                </Link>
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '4rem', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
        <div className="landing-logo" style={{ justifyContent: 'center', marginBottom: '1rem' }}>
          <div className="logo-icon">📄</div> DocsVault
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>© 2026 DocsVault. Built with ❤️ for the AI Era.</p>
        <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginTop: '2rem' }}>
            <Link href="/compare" style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>Compare</Link>
            <Link href="/donate" style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>Donate</Link>
            <Link href="https://github.com/Nikhilkumar25/docvoult" style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>GitHub</Link>
        </div>
      </footer>

      <style jsx>{`
        .container {
          max-width: 1200px;
          margin: 0 auto;
        }
        .hero-badge {
          padding: 0.5rem 1rem;
          border-radius: 99px;
          font-size: 0.875rem;
          font-weight: 600;
        }
        .gradient-text {
          background: var(--accent-gradient);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }
        .feature-card {
            padding: 2.5rem;
            border-radius: 24px;
            text-align: left;
            transition: var(--transition-base);
        }
        .feature-card:hover { transform: translateY(-5px); border-color: var(--accent-primary); }
        .feature-icon {
            width: 56px;
            height: 56px;
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            margin-bottom: 2rem;
        }
        @media (max-width: 1024px) {
          .hero.container { grid-template-columns: 1fr; text-align: center; }
          .hero-visual { display: none; }
          .features-grid { grid-template-columns: 1fr; }
          footer { padding: 2rem; }
        }
      `}</style>
    </div>
  );
}
