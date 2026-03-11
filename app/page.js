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

      {/* 1. Vibrant Hero Section */}
      <section className="hero section-padding" style={{ 
        paddingTop: '180px', 
        minHeight: '90vh',
        display: 'flex',
        alignItems: 'center'
      }}>
        <div className="container">
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)',
            gap: 'var(--space-3xl)',
            alignItems: 'center'
          }}>
            <div className="animate-fadeInUp">
              <div className="hero-badge" style={{ 
                background: 'rgba(249,115,22,0.08)', 
                border: '1px solid var(--border-accent)',
                color: 'var(--accent-primary)',
                marginBottom: 'var(--space-lg)',
                display: 'inline-flex',
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-full)',
                fontSize: 'var(--text-xs)',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                ✨ The Future of Document Distribution
              </div>
              <h1 style={{ 
                fontSize: 'clamp(3rem, 5vw, 5.5rem)', 
                fontWeight: '900', 
                lineHeight: '1.05', 
                marginBottom: 'var(--space-xl)',
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em'
              }}>
                Share Documents. <br />
                <span className="gradient-text-vibrant">Augmented by AI.</span>
              </h1>
              <p style={{ 
                fontSize: 'var(--text-lg)', 
                color: 'var(--text-secondary)', 
                marginBottom: 'var(--space-2xl)',
                maxWidth: '560px',
                lineHeight: '1.6'
              }}>
                Securely distribute your high-stakes documents with intelligent Q&A for your viewers. Track engagement, gate access, and answer viewer questions automatically using our local AI Knowledge Base.
              </p>
              <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
                <Link href="/register" className="btn btn-primary btn-lg" style={{ padding: '1.25rem 2.5rem' }}>
                  Get Started Free
                </Link>
                <Link href="/compare" className="btn btn-secondary btn-lg" style={{ padding: '1.25rem 2.5rem' }}>
                  Compare Features →
                </Link>
              </div>
            </div>

            <div className="hero-visual animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
              <div className="hero-vibrant-gradient" />
              <div className="mockup-window" style={{ width: '100%', maxWidth: '540px' }}>
                <div className="mockup-header">
                  <div className="dot" /> <div className="dot" /> <div className="dot" />
                </div>
                <div style={{ padding: 'var(--space-xl)', textAlign: 'center' }}>
                  <div className="animate-float" style={{ fontSize: '4rem', marginBottom: 'var(--space-md)' }}>📄✨</div>
                  <h3 style={{ color: 'var(--text-primary)', marginBottom: 'var(--space-xs)' }}>AI-Enabled Dashboard</h3>
                  <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>Instant Semantic indexing processing...</p>
                  
                  <div style={{ 
                    marginTop: 'var(--space-xl)', 
                    height: '140px', 
                    background: 'var(--bg-tertiary)', 
                    borderRadius: 'var(--radius-lg)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    padding: 'var(--space-md)'
                  }}>
                    <div style={{ height: '8px', width: '80%', background: 'var(--accent-primary)', opacity: 0.2, borderRadius: '4px' }} />
                    <div style={{ height: '8px', width: '60%', background: 'var(--accent-primary)', opacity: 0.1, borderRadius: '4px' }} />
                    <span className="text-glow" style={{ fontSize: '10px', fontWeight: '700', color: 'var(--accent-primary)', marginTop: '8px' }}>NEURAL ENGINE ACTIVE</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. AI Knowledge Base Section */}
      <section className="section-padding" style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', 
            gap: 'var(--space-3xl)', 
            alignItems: 'center' 
          }}>
            <div className="mockup-window animate-fadeInUp">
              <div className="mockup-header">
                <div className="dot" /> <div className="dot" /> <div className="dot" />
                <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginLeft: 'auto', fontWeight: '500' }}>view.docvault.xyz/pitch-deck-2026</span>
              </div>
              <div style={{ padding: 'var(--space-lg)', background: 'var(--bg-primary)' }}>
                <div style={{ height: '360px', background: 'white', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', fontWeight: '700', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px' }}>Quarterly_Financial_Report.pdf</span>
                    <span style={{ fontSize: '10px', color: 'var(--success)', fontWeight: '700' }}>AI READY</span>
                  </div>
                  <div style={{ padding: '1.5rem' }}>
                    <div style={{ height: '12px', background: 'var(--bg-tertiary)', width: '70%', marginBottom: '12px', borderRadius: '4px' }} />
                    <div style={{ height: '12px', background: 'var(--bg-tertiary)', width: '90%', marginBottom: '12px', borderRadius: '4px' }} />
                    <div style={{ height: '12px', background: 'var(--bg-tertiary)', width: '50%', marginBottom: '12px', borderRadius: '4px' }} />
                    <div style={{ height: '12px', background: 'var(--bg-tertiary)', width: '80%', marginBottom: '12px', borderRadius: '4px' }} />
                  </div>
                  {/* Floating AI Chat Mockup */}
                  <div className="glass-card animate-float" style={{ 
                    position: 'absolute', 
                    bottom: '24px', 
                    right: '24px', 
                    width: '280px',
                    padding: 'var(--space-md)',
                    borderRadius: 'var(--radius-xl)',
                    border: '1px solid var(--border-accent)',
                    boxShadow: 'var(--shadow-lg)',
                    zIndex: 2
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }} />
                      <span style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-primary)', textTransform: 'uppercase' }}>DocsVault AI</span>
                    </div>
                    <p style={{ fontSize: '12px', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
                      &quot;Based on page 14, the projected revenue for FY27 is <strong>$4.2M</strong>, representing a 22% increase.&quot;
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
              <h2 style={{ fontSize: 'var(--text-5xl)', fontWeight: '800', marginBottom: 'var(--space-lg)', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                Your Documents, <br />
                <span className="gradient-text">Now Intelligent.</span>
              </h2>
              <p style={{ fontSize: 'var(--text-lg)', color: 'var(--text-secondary)', marginBottom: 'var(--space-2xl)', lineHeight: '1.7' }}>
                Every document you share becomes an instant knowledge base. Viewers can ask any complex question and get accurate, context-aware answers derived straight from your content—no manual FAQ needed.
              </p>
              
              <div style={{ display: 'grid', gap: 'var(--space-lg)' }}>
                {[
                  { icon: '⚡', title: 'Zero-Latency Responses', desc: 'Queries are answered instantly using our edge-optimized AI engine.' },
                  { icon: '🔒', title: 'Private & Secure', desc: 'Your data is processed locally and never used to train public models.' }
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'flex-start' }}>
                    <div style={{ 
                      minWidth: '48px', height: '48px', borderRadius: '12px', background: 'var(--bg-tertiary)', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' 
                    }}>{item.icon}</div>
                    <div>
                      <h4 style={{ color: 'var(--text-primary)', marginBottom: '2px' }}>{item.title}</h4>
                      <p style={{ fontSize: '14px', color: 'var(--text-tertiary)' }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Process Flow Section */}
      <section className="section-padding" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 'var(--text-5xl)', fontWeight: '800', marginBottom: 'var(--space-md)', color: 'var(--text-primary)' }}>
            Seamless <span className="gradient-text">Workflow</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto var(--space-3xl)' }}>
            From upload to analytics, DocsVault streamlines your document distribution in three simple steps.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-2xl)' }}>
            {[
              { id: '01', title: 'Upload & Index', desc: 'Drag and drop your PDFs. We instantly index the text for semantic AI search.', icon: '📤' },
              { id: '02', title: 'Set Rules', desc: 'Secure with Email Gates, Passcodes, or Auto-Expiry to control access.', icon: '⚙️' },
              { id: '03', title: 'Distribute & Track', desc: 'Share your link and watch real-time page-level analytics and AI logs.', icon: '📊' }
            ].map((step, i) => (
              <div key={i} className="animate-fadeInUp" style={{ animationDelay: `${0.1 * (i+1)}s` }}>
                <div className="step-card" style={{ textAlign: 'left' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
                    <span style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--accent-primary)', opacity: 0.1 }}>{step.id}</span>
                    <div style={{ fontSize: '2rem' }}>{step.icon}</div>
                  </div>
                  <h3 style={{ marginBottom: 'var(--space-sm)' }}>{step.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6' }}>{step.desc}</p>
                  
                  <div style={{ marginTop: 'auto', paddingTop: 'var(--space-xl)' }}>
                    <div style={{ height: '4px', width: '100%', background: 'var(--bg-tertiary)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: i === 0 ? '30%' : i === 1 ? '60%' : '100%', background: 'var(--accent-primary)' }} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Secure Features Grid */}
      <section className="section-padding" style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 'var(--text-5xl)', fontWeight: '800', marginBottom: 'var(--space-md)', color: 'var(--text-primary)' }}>
            Enterprise <span className="gradient-text">Security</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-3xl)' }}>Professional grade controls for every shared link.</p>
          
          <div className="features-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: 'var(--space-xl)' 
          }}>
            {[
              { icon: '📧', title: 'Email Gating', desc: 'Require viewers to provide their identity. Perfect for lead generation and tracking.', bg: 'var(--accent-glow)' },
              { icon: '🔑', title: 'Secure Passcode', desc: 'Add a secondary layer of protection with customizable access codes.', bg: 'var(--success-bg)' },
              { icon: '⏳', title: 'Auto-Expiry', desc: 'Links vanish after a set date or view count. Ideal for time-sensitive deals.', bg: 'var(--danger-bg)' }
            ].map((feat, i) => (
              <div key={i} className="feature-card glass-card" style={{ textAlign: 'left' }}>
                <div style={{ 
                  width: '56px', height: '56px', borderRadius: '16px', background: feat.bg, 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', marginBottom: 'var(--space-lg)'
                }}>{feat.icon}</div>
                <h3 style={{ marginBottom: 'var(--space-sm)' }}>{feat.title}</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{feat.desc}</p>
              </div>
            ))}
          </div>

          <div className="animate-fadeInUp" style={{ 
            marginTop: '8rem', 
            padding: 'var(--space-3xl)', 
            borderRadius: '48px', 
            background: 'var(--accent-gradient)', 
            color: 'white',
            boxShadow: '0 20px 40px rgba(249, 115, 22, 0.2)'
          }}>
            <h2 style={{ color: 'white', fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: '900', marginBottom: 'var(--space-lg)' }}>
              Ready to Upgrade Your <br /> Document Experience?
            </h2>
            <p style={{ opacity: 0.9, marginBottom: '2.5rem', fontSize: 'var(--text-lg)', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
              Join forward-thinking teams using AI to simplify distribution and maximize engagement.
            </p>
            <Link href="/register" className="btn btn-secondary btn-lg" style={{ 
              background: 'white', color: 'var(--accent-primary)', border: 'none', 
              padding: '1.25rem 3rem', fontWeight: '800', boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
            }}>
              Get Started for Free →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="section-padding" style={{ background: 'var(--bg-primary)', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
        <div className="container">
          <div className="landing-logo" style={{ justifyContent: 'center', marginBottom: 'var(--space-md)' }}>
            <div className="logo-icon">📄</div> DocsVault
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>© 2026 DocsVault. Next-generation document distribution.</p>
          <div style={{ display: 'flex', gap: 'var(--space-xl)', justifyContent: 'center', marginTop: 'var(--space-xl)' }}>
            <Link href="/compare" style={{ fontSize: '13px', color: 'var(--text-tertiary)', fontWeight: '600' }}>Compare</Link>
            <Link href="/donate" style={{ fontSize: '13px', color: 'var(--text-tertiary)', fontWeight: '600' }}>Donate</Link>
            <Link href="https://github.com/Nikhilkumar25/docvoult" style={{ fontSize: '13px', color: 'var(--text-tertiary)', fontWeight: '600' }}>GitHub</Link>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .hero-badge {
          padding: 0.5rem 1rem;
          border-radius: 99px;
          font-weight: 600;
        }
        .gradient-text {
          background: var(--accent-gradient);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        @media (max-width: 1024px) {
          .hero .container > div { grid-template-columns: 1fr !important; text-align: center !important; }
          .hero-visual { display: none !important; }
          .hero h1 { font-size: 3.5rem !important; }
          .hero p { margin: 0 auto 2rem !important; }
          .hero-actions { justify-content: center !important; }
          
          section[style*="grid-template-columns: minmax(0, 1fr)"] { grid-template-columns: 1fr !important; text-align: center !important; }
          div[style*="grid-template-columns: repeat(3, 1fr)"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
