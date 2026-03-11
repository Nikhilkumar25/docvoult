'use client';

export const dynamic = 'force-dynamic';
import Link from 'next/link';
import DocVaultLogo from '@/components/DocVaultLogo';

export default function Home() {
  return (
    <div className="landing">
      <div className="landing-bg" />

      {/* Premium Navigation */}
      <nav className="landing-nav" style={{ justifyContent: 'space-between', padding: '1rem 4rem' }}>
        <Link href="/">
          <DocVaultLogo size={40} />
        </Link>
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

      {/* 3. Process Flow Section (Slide 5 Full Implementation) */}
      <section className="section-padding" style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-primary)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-3xl)' }}>
            <span className="inline-block px-4 py-1.5 mb-6 text-sm font-bold tracking-wider uppercase text-primary bg-primary/10 rounded-full">Process</span>
            <h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: '900', marginBottom: 'var(--space-md)', color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: '1.2' }}>
              Simple, <span style={{ color: 'var(--accent-primary)' }}>Secure</span> Workflow
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', maxWidth: '750px', margin: '0 auto', lineHeight: '1.6' }}>
              Experience the power of AI-driven document management. From secure upload to intelligent insights in minutes.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px' }}>
            {/* Step 01: Upload */}
            <div className="animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
              <div className="step-card" style={{ border: '1px solid var(--border)', padding: '2.5rem', borderRadius: '1.5rem', background: 'white' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                  <span style={{ fontSize: '4rem', fontStyle: 'italic', fontWeight: '900', color: 'var(--accent-primary)', opacity: 0.1 }}>01</span>
                  <div style={{ height: '1px', flex: 1, background: 'var(--border)' }}></div>
                </div>
                <h3 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '1.25rem', color: 'var(--text-primary)' }}>Upload</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '16px', lineHeight: '1.7', marginBottom: '2.5rem' }}>
                  Drag and drop your PDFs into our secure zone to begin the process. We support batch processing for up to 50 files.
                </p>
                
                <div className="mockup-dropzone" style={{ marginTop: 'auto', minHeight: '200px', background: 'var(--bg-secondary)', border: '2px dashed var(--border-accent)', borderRadius: '1rem', padding: '2rem', textAlign: 'center' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '3.5rem', color: 'var(--accent-primary)', marginBottom: '1rem' }}>picture_as_pdf</span>
                  <p style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>Drop your files here</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '4px' }}>PDF, DOCX up to 10MB</p>
                </div>
              </div>
            </div>

            {/* Step 02: Configure */}
            <div className="animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
              <div className="step-card" style={{ border: '1px solid var(--border)', padding: '2.5rem', borderRadius: '1.5rem', background: 'white' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                  <span style={{ fontSize: '4rem', fontStyle: 'italic', fontWeight: '900', color: 'var(--accent-primary)', opacity: 0.1 }}>02</span>
                  <div style={{ height: '1px', flex: 1, background: 'var(--border)' }}></div>
                </div>
                <h3 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '1.25rem', color: 'var(--text-primary)' }}>Configure</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '16px', lineHeight: '1.7', marginBottom: '2.5rem' }}>
                  Set custom security layers like Email Gates, Passcodes, and Expiry dates to keep your data safe.
                </p>

                <div className="glass-card" style={{ marginTop: 'auto', padding: '1.5rem', borderRadius: '1.25rem', border: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
                  <div style={{ display: 'grid', gap: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'white', borderRadius: '10px', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px' }}>alternate_email</span>
                        <span style={{ fontSize: '14px', fontWeight: '600' }}>Email Gate</span>
                      </div>
                      <div style={{ width: '36px', height: '18px', background: 'var(--accent-primary)', borderRadius: '9px', position: 'relative' }}>
                        <div style={{ position: 'absolute', right: '3px', top: '3px', width: '12px', height: '12px', background: 'white', borderRadius: '50%' }}></div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'white', borderRadius: '10px', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px' }}>lock</span>
                        <span style={{ fontSize: '14px', fontWeight: '600' }}>Passcode</span>
                      </div>
                      <div style={{ width: '36px', height: '18px', background: 'var(--border)', borderRadius: '9px', position: 'relative' }}>
                        <div style={{ position: 'absolute', left: '3px', top: '3px', width: '12px', height: '12px', background: 'white', borderRadius: '50%' }}></div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'white', borderRadius: '10px', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px' }}>timer</span>
                        <span style={{ fontSize: '14px', fontWeight: '600' }}>Link Expiry</span>
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: '900', color: 'var(--accent-primary)', background: 'rgba(249, 115, 22, 0.1)', padding: '3px 10px', borderRadius: '5px' }}>7 DAYS</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 03: Analyze */}
            <div className="animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
              <div className="step-card" style={{ border: '1px solid var(--border)', padding: '2.5rem', borderRadius: '1.5rem', background: 'white' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                  <span style={{ fontSize: '4rem', fontStyle: 'italic', fontWeight: '900', color: 'var(--accent-primary)', opacity: 0.1 }}>03</span>
                  <div style={{ height: '1px', flex: 1, background: 'var(--border)' }}></div>
                </div>
                <h3 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '1.25rem', color: 'var(--text-primary)' }}>Analyze</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '16px', lineHeight: '1.7', marginBottom: '2.5rem' }}>
                  Leverage AI to chat with your documents and visualize data through smart, interactive dashboards.
                </p>

                <div className="glass-card" style={{ marginTop: 'auto', background: 'var(--bg-secondary)', padding: '1.5rem', border: '1px solid var(--border)', borderRadius: '1.25rem' }}>
                   <div style={{ display: 'flex', gap: '12px', marginBottom: '1.25rem' }}>
                      <div style={{ flex: 1, height: '44px', background: 'white', border: '1px solid var(--border)', borderRadius: '6px', display: 'flex', alignItems: 'flex-end', gap: '3px', padding: '6px' }}>
                         <div style={{ flex: 1, height: '40%', background: 'var(--accent-primary)', opacity: 0.3 }}></div>
                         <div style={{ flex: 1, height: '75%', background: 'var(--accent-primary)', opacity: 0.5 }}></div>
                         <div style={{ flex: 1, height: '100%', background: 'var(--accent-primary)', opacity: 0.8 }}></div>
                         <div style={{ flex: 1, height: '55%', background: 'var(--accent-primary)', opacity: 0.4 }}></div>
                      </div>
                      <div style={{ width: '28px', height: '28px', background: 'var(--accent-gradient)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(249,115,22,0.3)' }}>
                         <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'white' }}>auto_awesome</span>
                      </div>
                   </div>
                   <div style={{ background: 'white', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                      <p style={{ fontSize: '11px', color: 'var(--text-primary)', fontStyle: 'italic', margin: 0, fontWeight: '500' }}>
                        &quot;Summarize the legal clauses in Section 4.2...&quot;
                      </p>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Secure Features Section (Slide 6 Full Implementation) */}
      <section className="section-padding" style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ maxWidth: '850px', marginBottom: 'var(--space-3xl)' }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest">
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>verified_user</span>
              Enterprise Security
            </div>
            <h2 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: '900', marginBottom: 'var(--space-md)', color: 'var(--text-primary)', letterSpacing: '-0.04em', lineHeight: '1.05' }}>
              Secure Sharing <span style={{ color: 'var(--accent-primary)' }}>Redefined</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.4rem', lineHeight: '1.7', fontWeight: '400' }}>
              Take full control of your document security with our enterprise-grade sharing features, designed for maximum protection and ease of use.
            </p>
          </div>

          <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px', marginBottom: 'var(--space-4xl)' }}>
            {[
              { 
                icon: 'alternate_email', 
                title: 'Email Gates', 
                desc: 'Restrict access to specific email domains or verified addresses to ensure your files never fall into the wrong hands.' 
              },
              { 
                icon: 'password', 
                title: 'Passcode Protection', 
                desc: 'Add an extra layer of security by requiring a unique passcode for recipients to view or download sensitive documents.' 
              },
              { 
                icon: 'timer_off', 
                title: 'Auto Expiry', 
                desc: 'Set your links to automatically expire after a certain time or number of views to maintain strict data lifecycle control.' 
              }
            ].map((feat, i) => (
              <div key={i} className="feature-card" style={{ background: 'white', border: '1px solid var(--border)', padding: '3rem 2.5rem' }}>
                <div style={{ 
                  width: '72px', height: '72px', borderRadius: '1.25rem', background: 'var(--bg-secondary)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', marginBottom: '2rem',
                  boxShadow: '0 10px 20px -5px rgba(249, 115, 22, 0.15)'
                }}>
                   <span className="material-symbols-outlined" style={{ fontSize: '2.5rem' }}>{feat.icon}</span>
                </div>
                <h3 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--text-primary)' }}>{feat.title}</h3>
                <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '2rem' }}>{feat.desc}</p>
                <div className="mt-auto">
                  <a href="#" style={{ fontSize: '15px', fontWeight: '800', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    Learn more <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Social Proof Trust Bar */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--space-4xl)', textAlign: 'center' }}>
            <p style={{ fontSize: '13px', fontWeight: '900', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.3em', marginBottom: 'var(--space-3xl)', opacity: 0.6 }}>
              Trusted by leading organizations
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '4rem', alignItems: 'center' }}>
              {['FORTUNE 500', 'TECHCORP', 'GLOBAL BANK', 'SECURELY', 'INFRASTRUX'].map((name) => (
                <div key={name} className="trust-bar-item" style={{ fontSize: '1.75rem', fontWeight: '900', letterSpacing: '-0.02em' }}>{name}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. CTA Section Updated */}
      <section style={{ padding: '10rem 0', background: 'white' }}>
         <div className="container">
            <div style={{ 
               background: '#090909', 
               borderRadius: '4rem', 
               padding: '8rem 2rem', 
               textAlign: 'center',
               color: 'white',
               position: 'relative',
               overflow: 'hidden',
               boxShadow: '0 50px 100px -20px rgba(0,0,0,0.4)'
            }}>
               <div style={{ position: 'absolute', top: 0, right: 0, width: '500px', height: '500px', background: 'var(--accent-primary)', opacity: 0.15, filter: 'blur(150px)', borderRadius: '50%' }}></div>
               <div style={{ position: 'absolute', bottom: 0, left: 0, width: '300px', height: '300px', background: 'var(--accent-primary)', opacity: 0.05, filter: 'blur(100px)', borderRadius: '50%' }}></div>
               <div style={{ position: 'relative', zIndex: 1 }}>
                  <h2 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: '900', marginBottom: '2.5rem', letterSpacing: '-0.04em', color: 'white', lineHeight: '1.05' }}>Ready to secure your documents?</h2>
                  <p style={{ fontSize: '1.4rem', color: 'rgba(255,255,255,0.7)', maxWidth: '700px', margin: '0 auto 4rem', lineHeight: '1.7' }}>
                     Join 10,000+ professionals who trust DocsVault with their sensitive information and intelligent insights.
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                     <Link href="/register" className="btn btn-primary" style={{ padding: '1.5rem 4rem', fontSize: '1.25rem', fontWeight: '900', borderRadius: '1.5rem' }}>Start Free Trial</Link>
                     <a href="#" className="btn btn-secondary" style={{ 
                        padding: '1.5rem 4rem', fontSize: '1.25rem', fontWeight: '900', borderRadius: '1.5rem',
                        background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'white' 
                     }}>Book a Demo</a>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Footer Updated */}
      <footer className="section-padding" style={{ background: 'var(--bg-primary)', borderTop: '1px solid var(--border)', textAlign: 'center', padding: '6rem 0' }}>
        <div className="container">
          <Link href="/" style={{ display: 'inline-block', marginBottom: '2.5rem' }}>
            <DocVaultLogo size={48} />
          </Link>
          <p style={{ color: 'var(--text-secondary)', fontSize: '16px', marginBottom: '3rem', maxWidth: '400px', margin: '0 auto 3rem' }}>© 2026 DocsVault Inc. Next-generation document distribution and intelligence.</p>
          <div style={{ display: 'flex', gap: '3rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/compare" style={{ fontSize: '14px', color: 'var(--text-tertiary)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Compare</Link>
            <Link href="/donate" style={{ fontSize: '14px', color: 'var(--text-tertiary)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Donate</Link>
            <Link href="https://github.com/Nikhilkumar25/docvoult" style={{ fontSize: '14px', color: 'var(--text-tertiary)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em' }}>GitHub</Link>
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
