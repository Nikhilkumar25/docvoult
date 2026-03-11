'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';

export default function DonatePage() {
    const razorpayRef = useRef(null);

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

            <div style={{ maxWidth: '600px', width: '100%', textAlign: 'center', position: 'relative', zIndex: 1 }}>
                <div className="hero-badge animate-float" style={{ 
                    marginBottom: '2rem',
                    background: 'rgba(249,115,22,0.05)',
                    border: '1px solid rgba(249,115,22,0.1)',
                    color: 'var(--accent-primary)'
                }}>
                    ❤️ Support Open Innovation
                </div>
                
                <h1 style={{ fontSize: '3rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Support <span className="gradient-text">DocsVault</span></h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem' }}>
                    We are committed to building the best document sharing experience. Your support helps us keep the servers running and the features flowing.
                </p>

                <div className="glass-card" style={{ padding: '3rem', borderRadius: '32px', textAlign: 'center' }}>
                    <h3 style={{ marginBottom: '0.75rem', color: 'var(--text-primary)' }}>Make a Contribution</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '14px' }}>
                        Every contribution helps us build a better platform for everyone.
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
                            marginBottom: '1.5rem'
                        }}
                    >
                        {/* Razorpay script will inject the button here */}
                    </form>
                    
                    <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-tertiary)' }}>
                        Secure payment powered by Razorpay.
                    </p>
                </div>

                <div style={{ marginTop: '3rem' }}>
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
            `}</style>
        </div>
    );
}
