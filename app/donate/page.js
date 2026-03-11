'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DonatePage() {
    const [currency, setCurrency] = useState('USD');
    const [price, setPrice] = useState('9.99');
    const [symbol, setSymbol] = useState('$');

    useEffect(() => {
        // Simple heuristic for currency detection based on locale
        const locale = navigator.language || 'en-US';
        if (locale.includes('IN') || Intl.DateTimeFormat().resolvedOptions().timeZone === 'Asia/Kolkata') {
            setCurrency('INR');
            setPrice('499');
            setSymbol('₹');
        } else {
            setCurrency('USD');
            setPrice('9.99');
            setSymbol('$');
        }
    }, []);

    const donationOptions = currency === 'INR' 
        ? ['99', '499', '999', '2499'] 
        : ['5', '10', '25', '50'];

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

                <div className="glass-card" style={{ padding: '3rem', borderRadius: '32px', textAlign: 'left' }}>
                    <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Choose your contribution</h3>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '2.5rem' }}>
                        {donationOptions.map((opt) => (
                            <button 
                                key={opt} 
                                className={`btn ${price === opt ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => setPrice(opt)}
                                style={{ padding: '1.5rem', fontSize: '1.25rem' }}
                            >
                                {symbol}{opt}
                            </button>
                        ))}
                    </div>

                    <div style={{ padding: '1.5rem', background: 'var(--bg-tertiary)', borderRadius: '16px', border: '1px solid var(--border)', marginBottom: '2.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Selected Amount</span>
                            <span style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--accent-primary)' }}>{symbol}{price}</span>
                        </div>
                        <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                            Detected region: {currency === 'INR' ? 'India (INR)' : 'International (USD)'}
                        </p>
                    </div>

                    {/* Razorpay Placeholder */}
                    <button className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                        Proceed to Pay {symbol}{price}
                    </button>
                    
                    <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '12px', color: 'var(--text-tertiary)' }}>
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
