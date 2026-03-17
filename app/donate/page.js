'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

const TIERS = [
    {
        label: "Starter",
        amount: "₹100",
        usd: "~$1.20",
        icon: "🌱",
        description: "Covers hosting for 100 documents for a day.",
        highlight: false
    },
    {
        label: "Supporter",
        amount: "₹500",
        usd: "~$6.00",
        icon: "🚀",
        description: "Helps us build faster. Most popular choice.",
        highlight: true
    },
    {
        label: "Believer",
        amount: "₹2000",
        usd: "~$24.00",
        icon: "💎",
        description: "Elite support for the future of secure sharing.",
        highlight: false
    }
];

const IMPACT_ITEMS = [
    { icon: "🛡️", text: "End-to-end encryption for all shared documents." },
    { icon: "⚡", text: "Instant AI responses with zero hallucinations." },
    { icon: "🔒", text: "Privacy-first infrastructure (no data selling, ever)." },
    { icon: "🌱", text: "Help stay independent from big-tech VC pressure." }
];

export default function DonatePage() {
    const razorpayRef = useRef(null);
    const [selectedTier, setSelectedTier] = useState(1);

    useEffect(() => {
        // Dynamically load the Razorpay payment button script
        if (razorpayRef.current && !razorpayRef.current.querySelector('script')) {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/payment-button.js';
            script.setAttribute('data-payment_button_id', 'pl_SPxB9jq5Rhqw38');
            script.async = true;
            razorpayRef.current.appendChild(script);
        }
    }, []);

    return (
        <div className="landing" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <div className="landing-bg" />
            
            <nav className="landing-nav" style={{ background: 'transparent', border: 'none', position: 'absolute', top: 0 }}>
                <Link href="/" className="landing-logo">
                    <div className="logo-icon">📄</div> DocsVault
                </Link>
            </nav>

            <div style={{ maxWidth: '700px', width: '100%', textAlign: 'center', position: 'relative', zIndex: 1, paddingTop: '2rem' }}>
                
                {/* Hero */}
                <div className="hero-badge animate-float" style={{ 
                    marginBottom: '2rem',
                    background: 'rgba(249,115,22,0.05)',
                    border: '1px solid rgba(249,115,22,0.1)',
                    color: 'var(--accent-primary)'
                }}>
                    ❤️ March Fundraiser — Help us hit $10
                </div>
                
                <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                    Support <span className="gradient-text">DocsVault</span>
                </h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', fontSize: '1.1rem', lineHeight: '1.7' }}>
                    DocsVault is built and maintained by a small indie team. Every rupee helps keep the servers on 
                    and the features shipping. We are completely ad-free and privacy-first.
                </p>

                {/* Contribution Tiers */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2.5rem' }}>
                    {TIERS.map((tier, i) => (
                        <button 
                            key={i} 
                            onClick={() => setSelectedTier(i)}
                            style={{
                                background: selectedTier === i 
                                    ? `linear-gradient(135deg, rgba(249,115,22,0.12), rgba(251,146,60,0.08))` 
                                    : 'rgba(255,255,255,0.6)',
                                border: selectedTier === i 
                                    ? '2px solid rgba(249,115,22,0.5)' 
                                    : '2px solid rgba(0,0,0,0.06)',
                                borderRadius: '20px',
                                padding: '1.5rem 1rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                textAlign: 'center',
                                position: 'relative',
                            }}
                        >
                            {tier.highlight && (
                                <div style={{
                                    position: 'absolute',
                                    top: '-10px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    background: 'linear-gradient(135deg, #F97316, #FB923C)',
                                    color: 'white',
                                    fontSize: '10px',
                                    fontWeight: '700',
                                    padding: '2px 10px',
                                    borderRadius: '20px',
                                    letterSpacing: '0.05em',
                                    whiteSpace: 'nowrap',
                                }}>
                                    POPULAR
                                </div>
                            )}
                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{tier.icon}</div>
                            <div style={{ fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{tier.label}</div>
                            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--accent-primary)', marginBottom: '0.25rem' }}>{tier.amount}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginBottom: '0.5rem' }}>{tier.usd}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{tier.description}</div>
                        </button>
                    ))}
                </div>

                {/* Payment Card */}
                <div className="glass-card" style={{ padding: '2.5rem', borderRadius: '32px', textAlign: 'center', marginBottom: '2.5rem' }}>
                    <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                        {TIERS[selectedTier].icon} Contribute as a {TIERS[selectedTier].label}
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.75rem', fontSize: '14px' }}>
                        Click the button below — choose any amount you like in the payment window. 
                        Suggested: <strong>{TIERS[selectedTier].amount}</strong>.
                    </p>

                    {/* Razorpay Payment Button */}
                    <form 
                        ref={razorpayRef} 
                        id="razorpay-button-container"
                        style={{ 
                            display: 'flex', 
                            justifyContent: 'center', 
                            alignItems: 'center',
                            minHeight: '50px',
                            marginBottom: '1.25rem'
                        }}
                    >
                        {/* Razorpay script will inject the button here */}
                    </form>
                    
                    <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-tertiary)' }}>
                        Secure payment powered by Razorpay. No account needed.
                    </p>
                </div>

                {/* What Your Support Enables */}
                <div className="glass-card" style={{ padding: '2rem', borderRadius: '24px', textAlign: 'left', marginBottom: '2.5rem' }}>
                    <h4 style={{ marginBottom: '1.25rem', color: 'var(--text-primary)', textAlign: 'center' }}>
                        What your support enables
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {IMPACT_ITEMS.map((item, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>{item.icon}</span>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.5' }}>{item.text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ marginTop: '1.5rem' }}>
                    <Link href="/" style={{ color: 'var(--text-tertiary)', fontSize: '14px' }}>
                        ← Back to Home
                    </Link>
                </div>
            </div>

            <style jsx>{`
                .gradient-text {
                    background: linear-gradient(135deg, #F97316 0%, #FB923C 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                @media (max-width: 600px) {
                    h1 { font-size: 2.2rem !important; }
                    div[style*="grid-template-columns"] {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </div>
    );
}
