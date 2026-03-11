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
                    <div style={{ display: 'flex', gap: '4px' }}>
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} style={{ 
                                width: '12px', height: '24px', background: 'var(--accent-primary)', 
                                opacity: 0.1 + (i * 0.15), borderRadius: '2px',
                                animation: 'pulse 1.5s infinite ease-in-out',
                                animationDelay: `${i * 0.1}s`
                            }} />
                        ))}
                    </div>
                    <span className="text-glow" style={{ fontSize: '10px', fontWeight: '800', color: 'var(--accent-primary)', marginTop: '8px', letterSpacing: '0.1em' }}>NEURAL SYNCING ACTIVE</span>
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
                  <div style={{ padding: '1.5rem', fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                    <p style={{ marginBottom: '1rem', fontWeight: '700', color: 'var(--text-primary)', fontSize: '13px' }}>Executive Summary</p>
                    <p style={{ marginBottom: '0.8rem' }}>
                      Our market expansion strategy for FY27 focuses on three key pillars: localized distribution, AI-driven automation, and enterprise-grade security protocols. 
                      <span style={{ background: 'rgba(249, 115, 22, 0.1)', borderBottom: '1px dashed var(--accent-primary)', padding: '0 2px' }}>
                        We project a 40% YoY growth in recurring revenue
                      </span> as we transition to a full SaaS model.
                    </p>
                    <p>
                      Strategic partnerships with global logistics leaders will facilitate a 15ms reduction in cross-border document latency, ensuring a seamless user experience for our international client base.
                    </p>
                  </div>
                  {/* Floating AI Chat Mockup */}
                  <div className="glass-card animate-float" style={{ 
                    position: 'absolute', 
                    bottom: '24px', 
                    right: '24px', 
                    width: '300px',
                    padding: 'var(--space-md)',
                    borderRadius: 'var(--radius-xl)',
                    border: '1px solid var(--border-accent)',
                    boxShadow: 'var(--shadow-lg)',
                    zIndex: 2
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>🤖</div>
                      <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-primary)' }}>DocsVault Assistant</span>
                    </div>
                    <div style={{ display: 'grid', gap: '10px' }}>
                        <div style={{ background: 'var(--bg-tertiary)', padding: '8px 12px', borderRadius: '12px 12px 0 12px', marginLeft: 'auto', maxWidth: '85%' }}>
                            <p style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>What is the growth projection?</p>
                        </div>
                        <div style={{ background: 'rgba(249, 115, 22, 0.05)', padding: '8px 12px', borderRadius: '12px 12px 12px 0', border: '1px solid rgba(249, 115, 22, 0.1)', maxWidth: '90%' }}>
                            <p style={{ fontSize: '10px', lineHeight: '1.4', color: 'var(--text-primary)' }}>
                                Based on the Executive Summary, revenue is projected to grow by <strong>40% year-over-year</strong>.
                            </p>
                        </div>
                    </div>
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
              { id: '01', title: 'Upload', desc: 'Share your PDF and the system automatically indexes it for semantic AI search.', icon: '📤' },
              { id: '02', title: 'Analyze', desc: 'The AI processes the content and is ready to answer any viewer questions.', icon: '🧠' },
              { id: '03', title: 'Track', desc: 'See who viewed your documents and what they asked in real-time.', icon: '📊' }
            ].map((step, i) => (
              <div key={i} className="animate-fadeInUp" style={{ animationDelay: `${0.1 * (i+1)}s` }}>
                <div className="step-card" style={{ textAlign: 'left', minHeight: '360px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
                    <span style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--accent-primary)', opacity: 0.1 }}>{step.id}</span>
                    <div style={{ fontSize: '2rem' }}>{step.icon}</div>
                  </div>
                  <h3 style={{ marginBottom: 'var(--space-sm)' }}>{step.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6', marginBottom: '1.5rem' }}>{step.desc}</p>
                  
                    <div style={{ marginTop: 'auto' }}>
                        {i === 0 && (
                            <div style={{ height: '120px', background: 'var(--bg-primary)', borderRadius: '12px', border: '1px dashed var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <div style={{ fontSize: '24px' }}>📄</div>
                                <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-tertiary)' }}>DROP PDF HERE</span>
                            </div>
                        )}
                        {i === 1 && (
                            <div style={{ display: 'grid', gap: '8px', background: 'var(--bg-primary)', padding: '12px', borderRadius: '12px' }}>
                                <div style={{ height: '8px', width: '90%', background: 'var(--accent-primary)', opacity: 0.2, borderRadius: '4px' }} />
                                <div style={{ height: '8px', width: '70%', background: 'var(--accent-primary)', opacity: 0.1, borderRadius: '4px' }} />
                                <div style={{ height: '8px', width: '40%', background: 'var(--accent-primary)', opacity: 0.15, borderRadius: '4px' }} />
                                <div className="text-glow" style={{ fontSize: '8px', fontWeight: '800', color: 'var(--accent-primary)', marginTop: '4px' }}>AI INDEXING...</div>
                            </div>
                        )}
                        {i === 2 && (
                            <div style={{ height: '120px', background: 'var(--bg-primary)', borderRadius: '12px', border: '1px solid var(--border)', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ width: '40%', height: '6px', background: 'var(--text-tertiary)', opacity: 0.2, borderRadius: '3px' }} />
                                    <div style={{ width: '20px', height: '10px', background: 'var(--success-bg)', borderRadius: '5px' }} />
                                </div>
                                <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: '4px' }}>
                                    <div style={{ flex: 1, height: '40%', background: 'var(--accent-primary)', opacity: 0.2, borderRadius: '2px' }} />
                                    <div style={{ flex: 1, height: '100%', background: 'var(--accent-primary)', opacity: 0.6, borderRadius: '2px' }} />
                                    <div style={{ flex: 1, height: '60%', background: 'var(--accent-primary)', opacity: 0.4, borderRadius: '2px' }} />
                                </div>
                            </div>
                        )}
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
              { icon: '📧', title: 'Email Gate', desc: 'Capture leads by requiring an email address before they view your document.', bg: 'var(--accent-glow)' },
              { icon: '🔑', title: 'Passcode Protect', desc: 'Sensitive documents deserve an extra layer of protection. Control who gets in.', bg: 'var(--success-bg)' },
              { icon: '⏳', title: 'Expiry Dates', desc: 'Ensure your links are only active for as long as you want. Full temporal control.', bg: 'var(--danger-bg)' }
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
