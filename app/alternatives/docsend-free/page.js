'use client';

import Link from 'next/link';
import DocVaultLogo from '@/components/DocVaultLogo';

export default function DocSendFreeAlternative() {
    const faqs = [
        {
            q: "Is there a free version of DocSend?",
            a: "DocSend does not offer a forever-free version for analytics. Most founders search for a 'DocSend for free' solution and find DocsVault, which provides core tracking, AI analytics, and secure sharing for free."
        },
        {
            q: "What is the best free alternative to DocSend?",
            a: "DocsVault is widely considered the best free alternative to DocSend because it includes AI-powered document interaction—a feature DocSend doesn't offer even on paid plans."
        },
        {
            q: "Can I share pitch decks for free with analytics?",
            a: "Yes. DocsVault allows you to upload, secure, and share pitch decks with slide-by-slide analytics at no cost, making it the perfect choice for pre-seed and seed-stage founders."
        }
    ];

    return (
        <div className="bg-background-light text-slate-900 font-display min-h-screen">
            {/* Metadata via JSON-LD for Client Page */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "FAQPage",
                        "mainEntity": faqs.map(faq => ({
                            "@type": "Question",
                            "name": faq.q,
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": faq.a
                            }
                        }))
                    })
                }}
            />

            <nav className="fixed top-0 left-0 right-0 z-50 glass">
                <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
                    <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
                        <DocVaultLogo size={32} />
                    </Link>
                    <Link href="/register" className="bg-primary text-white px-5 py-2 rounded-xl text-sm font-black">Get Started Free</Link>
                </div>
            </nav>

            <main className="pt-32 pb-24 px-6 max-w-5xl mx-auto">
                <div className="text-center mb-16">
                    <span className="bg-green-100 text-green-600 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-4 inline-block">100% Free Forever</span>
                    <h1 className="text-5xl md:text-7xl font-black mb-6 leading-[1.1] text-slate-900">
                        Stop Searching for <br/><span className="text-primary underline decoration-slate-200">DocSend for Free</span>
                    </h1>
                    <p className="text-xl text-slate-600 font-medium max-w-2xl mx-auto">
                        Get advanced document analytics, AI-powered insights, and secure sharing without the $100/mo price tag. Experience DocsVault.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20 text-center">
                    <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100">
                        <span className="material-symbols-outlined text-primary text-4xl mb-4">analytics</span>
                        <h3 className="font-black mb-2">Free Analytics</h3>
                        <p className="text-sm text-slate-500">Know exactly when your pitch deck is opened and which slides are read.</p>
                    </div>
                    <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100">
                        <span className="material-symbols-outlined text-primary text-4xl mb-4">smart_toy</span>
                        <h3 className="font-black mb-2">AI-Powered</h3>
                        <p className="text-sm text-slate-500">Investors can ask questions to your deck directly. Better conversion rates.</p>
                    </div>
                    <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100">
                        <span className="material-symbols-outlined text-primary text-4xl mb-4">security</span>
                        <h3 className="font-black mb-2">Secure Gates</h3>
                        <p className="text-sm text-slate-500">Passcodes and email verification included at no cost. Total control.</p>
                    </div>
                </div>

                <div className="bg-slate-900 rounded-[3rem] p-12 md:p-20 text-white mb-20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl"></div>
                    <h2 className="text-4xl font-black mb-8">The Smarter Way to Fundraise</h2>
                    <p className="text-xl text-slate-300 font-medium leading-relaxed mb-8">
                        Traditional tools like DocSend charge founders premium prices for basic link tracking. We believe the future of document sharing is <strong>interactive</strong> and <strong>accessible</strong>.
                    </p>
                    <ul className="space-y-4 font-bold text-slate-100">
                        <li className="flex items-center gap-3">✅ Unlimited Documents</li>
                        <li className="flex items-center gap-3">✅ Unlimited Links & Tracking</li>
                        <li className="flex items-center gap-3">✅ Free AI-Knowledge Base for every PDF</li>
                    </ul>
                </div>

                <section>
                    <h2 className="text-3xl font-black mb-12 text-center">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        {faqs.map((faq, i) => (
                            <div key={i} className="bg-white p-8 rounded-2xl border border-slate-100">
                                <h3 className="font-black text-lg mb-2">{faq.q}</h3>
                                <p className="text-slate-600 font-medium">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <div className="mt-20 text-center">
                    <Link href="/register" className="inline-block bg-primary text-white px-12 py-5 rounded-2xl text-xl font-black shadow-2xl hover:scale-105 transition-transform">
                        Launch Your Free Deck Now
                    </Link>
                </div>
            </main>

            <footer className="py-12 border-t border-slate-100 text-center">
                <p className="text-slate-400 font-bold text-sm">© 2026 DocsVault. The #1 Free DocSend Alternative.</p>
            </footer>
        </div>
    );
}
