'use client';

import Link from 'next/link';
import DocVaultLogo from '@/components/DocVaultLogo';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-[#FCFBF7] text-slate-900 font-sans selection:bg-orange-100 selection:text-orange-900">
            {/* Header / Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-md border-b border-slate-200/50">
                <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
                    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <DocVaultLogo size={32} />
                        <span className="text-xl font-bold tracking-tight text-slate-900">DocsVault</span>
                    </Link>
                    <div className="flex items-center gap-6">
                        <Link href="/login" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
                            Login
                        </Link>
                        <Link 
                            href="/register" 
                            className="bg-[#f97415] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section - Slide 2 Inspired */}
            <section className="relative pt-[160px] pb-24 overflow-hidden">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="flex-1 text-center lg:text-left animate-fadeInUp">
                            <h1 className="text-5xl lg:text-7xl font-black leading-[1.05] tracking-tight text-slate-900 mb-8">
                                Share Documents. <br />
                                <span className="bg-gradient-to-r from-[#f97415] to-orange-400 bg-clip-text text-transparent">
                                    Augmented by AI.
                                </span>
                            </h1>
                            <p className="text-xl text-slate-600 leading-relaxed max-w-xl mb-10 mx-auto lg:mx-0">
                                Experience a secure document sharing platform enhanced with intelligent AI capabilities for instant insights and deep analysis.
                            </p>
                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                                <Link 
                                    href="/register" 
                                    className="bg-[#f97415] text-white px-8 py-4 rounded-2xl text-lg font-bold shadow-xl shadow-orange-500/30 hover:shadow-orange-500/40 hover:-translate-y-0.5 transition-all flex items-center gap-2"
                                >
                                    Start Sharing <span className="material-symbols-outlined text-xl">arrow_forward</span>
                                </Link>
                                <button className="border-2 border-slate-200 bg-white text-slate-900 px-8 py-4 rounded-2xl text-lg font-bold hover:bg-slate-50 hover:border-slate-300 transition-all">
                                    Compare Plans
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 relative w-full max-w-2xl">
                            <div className="absolute inset-0 bg-gradient-to-tr from-orange-500 via-amber-400 to-violet-500 rounded-[3rem] rotate-3 opacity-15 blur-3xl"></div>
                            <div className="relative aspect-square lg:aspect-[4/3] bg-gradient-to-br from-[#f97415] via-amber-400 to-violet-600 rounded-[2.5rem] shadow-2xl p-1 overflow-hidden transition-transform hover:scale-[1.01] duration-500">
                                <div className="w-full h-full bg-white/20 backdrop-blur-3xl rounded-[2.4rem] p-8 flex flex-col gap-6 border border-white/30">
                                    <div className="h-4 w-1/3 bg-white/60 rounded-full"></div>
                                    <div className="h-4 w-full bg-white/30 rounded-full"></div>
                                    <div className="h-4 w-full bg-white/30 rounded-full"></div>
                                    <div className="h-4 w-2/3 bg-white/30 rounded-full"></div>
                                    <div className="mt-auto flex justify-between items-end">
                                        <div className="size-16 rounded-full bg-white/40 border border-white/50 shadow-inner"></div>
                                        <div className="h-12 w-32 bg-white/90 rounded-2xl shadow-lg"></div>
                                    </div>
                                </div>
                                {/* Floating Element */}
                                <div className="absolute top-10 -right-4 bg-white p-4 rounded-2xl shadow-2xl border border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 bg-green-500/10 text-green-500 rounded-lg flex items-center justify-center">
                                            <span className="material-symbols-outlined">verified</span>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase">Status</p>
                                            <p className="text-sm font-black text-slate-900 text-green-600">Securely Shared</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* AI Knowledge Base Section - Slide 4 Inspired */}
            <section className="py-32 bg-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-orange-50 rounded-full blur-[100px] -mr-48 -mt-24 opacity-50"></div>
                <div className="max-w-7xl mx-auto px-6 relative">
                    <div className="flex flex-col lg:flex-row items-center gap-20">
                        <div className="flex-1 order-2 lg:order-1">
                            {/* Document Mockup */}
                            <div className="relative group">
                                <div className="absolute inset-0 bg-slate-100 rounded-3xl -rotate-2 group-hover:rotate-0 transition-transform duration-500"></div>
                                <div className="relative bg-[#FCFBF7] p-8 rounded-3xl border border-slate-100 shadow-xl">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="size-12 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center">
                                            <span className="material-symbols-outlined text-3xl">description</span>
                                        </div>
                                        <div>
                                            <h4 className="font-black text-slate-900 leading-none">Annual_Report.pdf</h4>
                                            <p className="text-xs text-slate-400 mt-1 font-bold italic">PROCESSED BY DocVault AI</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="h-3 bg-slate-200 rounded-full w-3/4"></div>
                                        <div className="h-3 bg-slate-200 rounded-full w-full"></div>
                                        <div className="h-3 bg-slate-200 rounded-full w-5/6"></div>
                                        <div className="h-40 bg-slate-50 rounded-2xl w-full flex items-center justify-center border border-dashed border-slate-200">
                                            <span className="material-symbols-outlined text-5xl text-slate-200">monitoring</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Overlapping Chat Bubble */}
                                <div className="absolute -bottom-10 -right-6 lg:-right-12 max-w-xs w-full">
                                    <div className="bg-white p-6 rounded-3xl shadow-2xl border border-orange-100">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="size-8 rounded-full bg-[#f97415] flex items-center justify-center shadow-lg shadow-orange-500/20">
                                                <span className="material-symbols-outlined text-white text-sm">smart_toy</span>
                                            </div>
                                            <span className="text-sm font-black text-slate-900 tracking-tight">DocsVault AI</span>
                                        </div>
                                        <div className="space-y-3">
                                            <p className="bg-slate-50 p-3 rounded-2xl rounded-tl-none text-sm text-slate-600 border border-slate-100">
                                                &quot;What are the growth projections?&quot;
                                            </p>
                                            <div className="bg-orange-50 p-3 rounded-2xl rounded-tr-none text-sm text-slate-800 border-l-4 border-[#f97415] border border-orange-100/50">
                                                <p className="font-black mb-1 text-xs uppercase tracking-wider text-orange-600">Core Insights</p>
                                                <ul className="space-y-1 font-medium">
                                                    <li className="flex items-center gap-1.5">• Q3 Revenue <span className="text-green-600">+24%</span></li>
                                                    <li className="flex items-center gap-1.5">• Retention <span className="text-green-600">98.2%</span></li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 order-1 lg:order-2">
                            <span className="bg-orange-100 text-[#f97415] px-4 py-1.5 rounded-full text-sm font-black tracking-widest uppercase mb-6 inline-block">
                                Intelligent Insights
                            </span>
                            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-8 leading-tight">
                                Don't Just Read. <br />
                                <span className="text-slate-400">Interact.</span>
                            </h2>
                            <p className="text-lg text-slate-600 leading-relaxed max-w-lg mb-10">
                                Interact with your documents like never before using our integrated AI chat. Get instant answers, extract trends, and summarize complex reports in seconds.
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-3xl font-black text-[#f97415] mb-1">90%</p>
                                    <p className="text-sm font-bold text-slate-500">Faster Analysis</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-3xl font-black text-slate-900 mb-1">Instant</p>
                                    <p className="text-sm font-bold text-slate-500">Query Responses</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Simple, Secure Workflow - Slide 5 Inspired */}
            <section className="py-32 bg-[#FCFBF7]">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <span className="bg-orange-100 text-[#f97415] px-4 py-1.5 rounded-full text-sm font-black tracking-widest uppercase mb-6 inline-block">
                            Process Flow
                        </span>
                        <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-6 font-mono">Simple, Secure Workflow</h2>
                        <p className="text-slate-500 text-lg">Send files securely in three simple steps, with AI handling the complexity.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Step 1 */}
                        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 group">
                            <div className="size-16 rounded-2xl bg-orange-100 text-[#f97415] flex items-center justify-center font-black text-3xl mb-8 group-hover:scale-110 transition-transform">01</div>
                            <h3 className="text-2xl font-black text-slate-900 mb-4 italic">Upload</h3>
                            <p className="text-slate-500 font-medium mb-10">Securely drag and drop your sensitive files. We support PDF, DOCX, and more.</p>
                            <div className="relative h-40 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50 flex flex-col items-center justify-center gap-3 overflow-hidden">
                                <span className="material-symbols-outlined text-4xl text-slate-300">cloud_upload</span>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Drop Files Here</span>
                                <div className="absolute inset-0 bg-[#f97415]/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 group">
                            <div className="size-16 rounded-2xl bg-orange-100 text-[#f97415] flex items-center justify-center font-black text-3xl mb-8 group-hover:scale-110 transition-transform">02</div>
                            <h3 className="text-2xl font-black text-slate-900 mb-4 italic">Configure</h3>
                            <p className="text-slate-500 font-medium mb-10">Granular security controls for every link. Passcodes, expiry, and gates.</p>
                            <div className="space-y-3">
                                <div className="bg-slate-50 p-4 rounded-2xl flex items-center justify-between">
                                    <span className="text-sm font-black text-slate-600">Email Gate</span>
                                    <div className="w-10 h-5 bg-[#f97415] rounded-full relative">
                                        <div className="size-4 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                                    </div>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-2xl flex items-center justify-between">
                                    <span className="text-sm font-black text-slate-600">Passcode</span>
                                    <div className="w-10 h-5 bg-slate-200 rounded-full relative">
                                        <div className="size-4 bg-white rounded-full absolute left-0.5 top-0.5"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 group">
                            <div className="size-16 rounded-2xl bg-orange-100 text-[#f97415] flex items-center justify-center font-black text-3xl mb-8 group-hover:scale-110 transition-transform">03</div>
                            <h3 className="text-2xl font-black text-slate-900 mb-4 italic">Analyze</h3>
                            <p className="text-slate-500 font-medium mb-10">Track engagement and deep metrics. See who viewed and for how long.</p>
                            <div className="h-40 bg-slate-50 rounded-3xl flex items-end justify-center p-6 gap-2">
                                <div className="w-full bg-orange-200 h-1/2 rounded-xl group-hover:h-3/4 transition-all duration-700"></div>
                                <div className="w-full bg-[#f97415] h-full rounded-xl group-hover:h-2/3 transition-all duration-700"></div>
                                <div className="w-full bg-orange-300 h-2/3 rounded-xl group-hover:h-full transition-all duration-700"></div>
                                <div className="w-full bg-slate-200 h-1/3 rounded-xl group-hover:h-1/2 transition-all duration-700"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Secure Sharing Redefined - Slide 6 Inspired */}
            <section className="py-32 bg-slate-900 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#f97415] to-transparent opacity-20"></div>
                <div className="max-w-7xl mx-auto px-6 relative">
                    <div className="text-center mb-24">
                        <span className="bg-white/10 text-[#f97415] px-4 py-1.5 rounded-full text-sm font-black tracking-widest uppercase mb-6 inline-block">
                            Enterprise Security
                        </span>
                        <h2 className="text-4xl lg:text-6xl font-black text-white mb-8">Secure Sharing Redefined</h2>
                        <div className="w-24 h-1.5 bg-[#f97415] mx-auto rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
                        <div className="p-8 rounded-3xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors group">
                            <span className="material-symbols-outlined text-[#f97415] text-4xl mb-6">mail_lock</span>
                            <h4 className="text-xl font-black text-white mb-4">Email Gates</h4>
                            <p className="text-slate-400 font-medium leading-relaxed italic mb-6">
                                Verify identities before access is granted. Only allow specific domains or email addresses to view your documents.
                            </p>
                            <Link href="#" className="flex items-center gap-2 text-[#f97415] font-black text-xs uppercase tracking-widest group-hover:gap-4 transition-all">
                                Learn more <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </Link>
                        </div>
                        <div className="p-8 rounded-3xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors group">
                            <span className="material-symbols-outlined text-[#f97415] text-4xl mb-6">key</span>
                            <h4 className="text-xl font-black text-white mb-4">Passcode Protection</h4>
                            <p className="text-slate-400 font-medium leading-relaxed italic mb-6">
                                Add an extra layer of security with unique passwords for every shared document. Managed centrally.
                            </p>
                            <Link href="#" className="flex items-center gap-2 text-[#f97415] font-black text-xs uppercase tracking-widest group-hover:gap-4 transition-all">
                                Learn more <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </Link>
                        </div>
                        <div className="p-8 rounded-3xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors group">
                            <span className="material-symbols-outlined text-[#f97415] text-4xl mb-6">timer_off</span>
                            <h4 className="text-xl font-black text-white mb-4">Auto Expiry</h4>
                            <p className="text-slate-400 font-medium leading-relaxed italic mb-6">
                                Set links to self-destruct after a specific time or number of views. Total control over document lifecycle.
                            </p>
                            <Link href="#" className="flex items-center gap-2 text-[#f97415] font-black text-xs uppercase tracking-widest group-hover:gap-4 transition-all">
                                Learn more <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </Link>
                        </div>
                    </div>

                    {/* Trust Bar */}
                    <div className="pt-20 border-t border-white/10 text-center">
                        <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 mb-12">Trusted by Industry Leaders</p>
                        <div className="flex flex-wrap justify-center items-center gap-12 lg:gap-24 opacity-30 grayscale hover:grayscale-0 transition-all duration-1000">
                            {['FORTUNE 500', 'TECHCORP', 'GLOBAL BANK', 'SECURELY', 'INFRASTRUX'].map(brand => (
                                <span key={brand} className="text-xl lg:text-3xl font-black text-white tracking-tighter italic">{brand}</span>
                            ))}
                        </div>
                    </div>

                    {/* Final CTA */}
                    <div className="mt-32 relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-[#f97415] rounded-[3rem] blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                        <div className="relative bg-gradient-to-br from-[#f97415] to-orange-600 rounded-[3rem] p-12 lg:p-20 text-center overflow-hidden">
                            <h3 className="text-4xl lg:text-6xl font-black text-white mb-8">Ready to secure your documents?</h3>
                            <p className="text-white/80 text-lg lg:text-xl font-medium max-w-2xl mx-auto mb-12">
                                Join thousands of companies using DocsVault for AI-powered, high-security document sharing.
                            </p>
                            <Link 
                                href="/register"
                                className="inline-block bg-white text-[#f97415] px-12 py-5 rounded-2xl text-xl font-black shadow-2xl hover:scale-105 active:scale-95 transition-all"
                            >
                                Start Free Trial
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 bg-white border-t border-slate-100 text-center md:text-left">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                        <div className="flex flex-col items-center md:items-start gap-4">
                            <Link href="/" className="flex items-center gap-2">
                                <DocVaultLogo size={40} />
                                <span className="text-2xl font-black tracking-tighter text-slate-900 uppercase">DocsVault</span>
                            </Link>
                            <p className="text-slate-400 font-medium italic">© 2024 DocsVault Inc. All rights reserved.</p>
                        </div>
                        <div className="flex gap-10 font-black text-xs uppercase tracking-widest text-slate-400">
                            <Link href="#" className="hover:text-orange-500 transition-colors">Privacy</Link>
                            <Link href="#" className="hover:text-orange-500 transition-colors">Terms</Link>
                            <Link href="#" className="hover:text-orange-500 transition-colors">Contact</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
