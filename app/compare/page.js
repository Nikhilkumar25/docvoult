'use client';

import Link from 'next/link';

export default function ComparePage() {
    const comparisonData = [
        { feature: 'AI Knowledge Base', docvault: '✅ Included (Free)', docsend: '❌ No', papermark: '⚠️ Limited' },
        { feature: 'Analytics Depth', docvault: '✅ Page-level + Heatmap', docsend: '✅ Yes', papermark: '✅ Yes' },
        { feature: 'Document Limits', docvault: '✅ Unlimited', docsend: '⚠️ Tiered (Limited)', papermark: '⚠️ Tiered' },
        { feature: 'User Seats', docvault: '✅ Unlimited', docsend: '❌ Paid per seat', papermark: '⚠️ Limited' },
        { feature: 'Instant Navigation', docvault: '✅ <15ms experience', docsend: '⚠️ Standard', papermark: '⚠️ Standard' },
        { feature: 'Email Gate/Passcode', docvault: '✅ Included', docsend: '✅ Yes', papermark: '✅ Yes' },
        { feature: 'Pricing', docvault: '🚀 Pay What You Want', docsend: '💸 $10 - $250+/mo', papermark: '💸 $10 - $100+/mo' },
    ];

    return (
        <div className="landing" style={{ minHeight: '100vh', padding: '4rem 2rem' }}>
            <div className="landing-bg" />
            
            <nav className="landing-nav" style={{ justifyContent: 'center', background: 'transparent', border: 'none', position: 'relative' }}>
                <Link href="/" className="landing-logo">
                    <div className="logo-icon">📄</div> DocsVault
                </Link>
            </nav>

            <div style={{ maxWidth: '900px', margin: '4rem auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
                <h1 style={{ fontSize: '3.5rem', marginBottom: '1.5rem' }}>DocsVault vs <span className="gradient-text">The Giants</span></h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '4rem' }}>
                    Why docsVault is the preferred choice for high-performance teams and individual builders.
                </p>

                <div className="glass-card" style={{ borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.05)' }}>
                                <th style={{ padding: '1.5rem', color: 'var(--text-tertiary)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Feature</th>
                                <th style={{ padding: '1.5rem', borderBottom: '1px solid rgba(249,115,22,0.3)', color: 'var(--accent-primary)' }}>DocsVault</th>
                                <th style={{ padding: '1.5rem', color: 'var(--text-tertiary)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>DocSend</th>
                                <th style={{ padding: '1.5rem', color: 'var(--text-tertiary)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Papermark</th>
                            </tr>
                        </thead>
                        <tbody>
                            {comparisonData.map((row, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '1.25rem', fontWeight: '600' }}>{row.feature}</td>
                                    <td style={{ padding: '1.25rem', background: 'rgba(249,115,22,0.02)', fontWeight: '700' }}>{row.docvault}</td>
                                    <td style={{ padding: '1.25rem', color: 'var(--text-secondary)' }}>{row.docsend}</td>
                                    <td style={{ padding: '1.25rem', color: 'var(--text-secondary)' }}>{row.papermark}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div style={{ marginTop: '5rem' }}>
                    <div className="glass-card" style={{ padding: '3rem', borderRadius: '32px' }}>
                        <h2 style={{ marginBottom: '1rem' }}>Ready to experience the future?</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem' }}>Join hundreds of teams switching to a faster, AI-enabled sharing platform.</p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
                            <Link href="/register" className="btn btn-primary btn-lg">Get Started Free</Link>
                            <Link href="/" className="btn btn-secondary btn-lg">Back to Home</Link>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .gradient-text {
                    background: linear-gradient(135deg, #F97316 0%, #FB923C 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                @media (max-width: 768px) {
                    table { font-size: 12px; }
                    th, td { padding: 10px !important; }
                    h1 { font-size: 2.5rem !important; }
                }
            `}</style>
        </div>
    );
}
