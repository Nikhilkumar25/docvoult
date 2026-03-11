'use client';

import Link from 'next/link';
import DocVaultLogo from '@/components/DocVaultLogo';

export default function Home() {
    return (
        <div className="bg-background-light text-slate-900 font-display min-h-screen">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 glass">
                <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
                    <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
                        <DocVaultLogo size={32} />
                    </Link>
                    <div className="flex items-center gap-6">
                        <Link href="/login" className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors hidden sm:block">Login</Link>
                        <Link href="/register" className="bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-black shadow-lg shadow-primary/20 hover:scale-105 transition-transform">Get Started</Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-[160px] pb-24 px-6 max-w-7xl mx-auto overflow-hidden">
                <div className="flex flex-col lg:flex-row gap-16 items-center">
                    <div className="flex flex-col gap-8 flex-1 text-center lg:text-left animate-fadeInUp">
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight text-slate-900">
                            Share Documents. <br className="hidden lg:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">Augmented by AI.</span>
                        </h1>
                        <p className="text-xl text-slate-600 leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium">
                            Experience a secure document sharing platform enhanced with intelligent AI capabilities for instant insights and deep analysis.
                        </p>
                        <div className="flex flex-wrap justify-center lg:justify-start gap-4 mt-2">
                            <Link href="/register" className="bg-primary hover:bg-orange-500 text-white px-8 py-4 rounded-2xl text-lg font-black shadow-xl shadow-primary/30 flex items-center gap-2 transition-all hover:-translate-y-1">
                                Start Sharing <span className="material-symbols-outlined text-xl">arrow_forward</span>
                            </Link>
                            <Link href="/compare" className="border-2 border-slate-200 bg-white text-slate-900 px-8 py-4 rounded-2xl text-lg font-black hover:bg-slate-50 transition-colors">
                                Compare Plans
                            </Link>
                        </div>
                    </div>
                    <div className="flex-1 relative w-full aspect-square max-w-lg mx-auto lg:scale-110">
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary via-orange-400 to-violet-500 rounded-[3rem] rotate-3 opacity-20 blur-3xl"></div>
                        <div className="relative w-full h-full bg-gradient-to-br from-primary via-amber-400 to-violet-600 rounded-[2.5rem] shadow-2xl flex items-center justify-center p-8 overflow-hidden transition-transform duration-700 hover:scale-[1.02]">
                            <div className="w-full h-full border border-white/20 rounded-3xl flex flex-col gap-6 p-6 glass shadow-xl">
                                <div className="h-4 w-1/3 bg-white/50 rounded-full"></div>
                                <div className="h-4 w-full bg-white/30 rounded-full"></div>
                                <div className="h-4 w-full bg-white/30 rounded-full"></div>
                                <div className="h-4 w-2/3 bg-white/30 rounded-full"></div>
                                <div className="mt-auto flex justify-between items-end">
                                    <div className="size-16 rounded-full bg-white/40 shadow-inner"></div>
                                    <div className="h-12 w-32 bg-white rounded-xl shadow-lg"></div>
                                </div>
                            </div>
                            
                            {/* Floating Element */}
                            <div className="absolute top-10 -right-2 bg-white p-4 rounded-2xl shadow-2xl border border-slate-100 hidden md:block">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 bg-green-500/10 text-green-500 rounded-lg flex items-center justify-center">
                                        <span className="material-symbols-outlined">verified</span>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase">Status</p>
                                        <p className="text-sm font-black text-slate-900">Securely Shared</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* AI Knowledge Base Section */}
            <section className="py-24 px-6 bg-white relative">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -mr-40"></div>
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="mb-16 text-center lg:text-left max-w-2xl mx-auto lg:mx-0">
                        <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-black tracking-widest uppercase mb-6 inline-block">Intelligent Analytics</span>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 font-display">Don't Just Read. <span className="text-slate-400">Interact.</span></h2>
                        <p className="text-slate-600 text-lg md:text-xl font-medium">Interact with your documents like never before using our integrated AI chat. Obtain instant insights, trends, and summaries in milliseconds.</p>
                    </div>
                    <div className="relative flex flex-col lg:flex-row gap-12 lg:gap-8 items-center justify-center">
                        {/* Document Mockup */}
                        <div className="w-full lg:w-1/2 bg-background-light p-8 md:p-12 rounded-[2.5rem] border border-slate-100 shadow-lg">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="size-12 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500">
                                    <span className="material-symbols-outlined text-3xl">description</span>
                                </div>
                                <div>
                                    <span className="font-black text-slate-800 text-xl block">Annual_Growth_Report.pdf</span>
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Processed by AI</span>
                                </div>
                            </div>
                            <div className="space-y-5">
                                <div className="h-4 bg-slate-200 rounded-full w-3/4"></div>
                                <div className="h-4 bg-slate-200 rounded-full w-full"></div>
                                <div className="h-4 bg-slate-200 rounded-full w-5/6"></div>
                                <div className="h-4 bg-slate-200 rounded-full w-2/3"></div>
                                <div className="h-48 bg-slate-100 rounded-2xl w-full flex items-center justify-center text-slate-300 mt-8 border-2 border-dashed border-slate-200">
                                    <span className="material-symbols-outlined text-6xl">monitoring</span>
                                </div>
                            </div>
                        </div>
                        {/* Floating AI Chat */}
                        <div className="w-full lg:w-[420px] lg:absolute lg:right-0 lg:top-1/2 lg:-translate-y-1/2 glass p-6 md:p-8 rounded-[2rem] shadow-2xl border-primary/20 z-20">
                            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
                                <div className="size-12 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                                    <span className="material-symbols-outlined text-white">smart_toy</span>
                                </div>
                                <span className="font-black text-lg text-slate-900 tracking-tight">DocsVault Assistant</span>
                            </div>
                            <div className="space-y-4">
                                <div className="bg-slate-50 p-4 rounded-2xl rounded-tl-none text-sm text-slate-700 border border-slate-100 shadow-sm ml-4">
                                    &quot;What are the core growth projections?&quot;
                                </div>
                                <div className="bg-primary/5 p-5 rounded-2xl rounded-tr-none text-sm text-slate-800 border-l-4 border-primary shadow-sm mr-4">
                                    <p className="font-black mb-3 text-primary text-xs uppercase tracking-wider">Extracted Insights</p>
                                    <ul className="space-y-2 font-semibold">
                                        <li className="flex items-center gap-2"><span className="size-1.5 bg-green-500 rounded-full block"></span> Q3 Revenue: <span className="text-green-600">+24% YoY</span></li>
                                        <li className="flex items-center gap-2"><span className="size-1.5 bg-green-500 rounded-full block"></span> New Markets: <span className="text-green-600">12% expansion</span></li>
                                        <li className="flex items-center gap-2"><span className="size-1.5 bg-green-500 rounded-full block"></span> Retention Rate: <span className="text-green-600">98.2%</span></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Workflow Section */}
            <section className="py-24 px-6 bg-background-light border-y border-slate-200">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-black tracking-widest uppercase mb-4 inline-block">Process Flow</span>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">Simple, Secure Workflow</h2>
                        <p className="text-xl text-slate-500 font-medium">Three steps to AI-powered secure document distribution.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Step 1 */}
                        <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-sm hover:shadow-xl transition-shadow duration-500 border border-slate-100 flex flex-col items-center text-center group">
                            <div className="size-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-3xl mb-8 group-hover:scale-110 transition-transform">1</div>
                            <h3 className="text-2xl font-black mb-3">Upload</h3>
                            <p className="text-slate-500 font-medium mb-10">Securely drag and drop your sensitive files up to 10MB.</p>
                            <div className="w-full mt-auto border-2 border-dashed border-slate-200 rounded-2xl py-12 flex flex-col items-center gap-3 bg-slate-50 group-hover:bg-primary/5 transition-colors">
                                <span className="material-symbols-outlined text-4xl text-slate-300 group-hover:text-primary/50">cloud_upload</span>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Drop files here</span>
                            </div>
                        </div>
                        {/* Step 2 */}
                        <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-sm hover:shadow-xl transition-shadow duration-500 border border-slate-100 flex flex-col items-center text-center group">
                            <div className="size-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-3xl mb-8 group-hover:scale-110 transition-transform">2</div>
                            <h3 className="text-2xl font-black mb-3">Configure</h3>
                            <p className="text-slate-500 font-medium mb-10">Granular security controls including Passcodes and Auto-Expiry.</p>
                            <div className="w-full mt-auto space-y-4">
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <span className="text-sm font-black text-slate-700">Email Gate</span>
                                    <div className="w-12 h-6 bg-primary rounded-full relative">
                                        <div className="size-5 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm"></div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <span className="text-sm font-black text-slate-700">Passcode</span>
                                    <div className="w-12 h-6 bg-slate-200 rounded-full relative">
                                        <div className="size-5 bg-white rounded-full absolute left-0.5 top-0.5 shadow-sm"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Step 3 */}
                        <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-sm hover:shadow-xl transition-shadow duration-500 border border-slate-100 flex flex-col items-center text-center group">
                            <div className="size-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-3xl mb-8 group-hover:scale-110 transition-transform">3</div>
                            <h3 className="text-2xl font-black mb-3">Analyze</h3>
                            <p className="text-slate-500 font-medium mb-10">Gain deep insights and track viewer engagement instantly.</p>
                            <div className="w-full h-40 mt-auto bg-slate-50 rounded-2xl flex items-end justify-center gap-3 p-6 border border-slate-100">
                                <div className="w-full bg-primary/20 h-1/2 rounded-t-xl group-hover:h-3/4 transition-all duration-700"></div>
                                <div className="w-full bg-primary h-3/4 rounded-t-xl group-hover:h-2/3 transition-all duration-700"></div>
                                <div className="w-full bg-primary/40 h-1/3 rounded-t-xl group-hover:h-full transition-all duration-700"></div>
                                <div className="w-full bg-primary h-full rounded-t-xl group-hover:h-1/2 transition-all duration-700"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Secure Sharing Redefined */}
            <section className="py-24 px-6 bg-slate-900 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-20"></div>
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center mb-16">
                        <span className="bg-white/10 text-primary px-4 py-1.5 rounded-full text-sm font-black tracking-widest uppercase mb-4 inline-block">Enterprise Security</span>
                        <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Secure Sharing Redefined</h2>
                        <div className="w-24 h-1.5 bg-primary mx-auto rounded-full"></div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-24">
                        <div className="flex flex-col gap-5 p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                            <span className="material-symbols-outlined text-primary text-4xl">mail_lock</span>
                            <div>
                                <h4 className="text-xl font-black text-white mb-3">Email Gates</h4>
                                <p className="text-slate-400 font-medium leading-relaxed">Verify identities before access is granted. Only allow specific domains or email addresses.</p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-5 p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                            <span className="material-symbols-outlined text-primary text-4xl">key</span>
                            <div>
                                <h4 className="text-xl font-black text-white mb-3">Passcode Protection</h4>
                                <p className="text-slate-400 font-medium leading-relaxed">Add an extra layer of security with unique passwords for every single shared document.</p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-5 p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                            <span className="material-symbols-outlined text-primary text-4xl">timer_off</span>
                            <div>
                                <h4 className="text-xl font-black text-white mb-3">Auto Expiry</h4>
                                <p className="text-slate-400 font-medium leading-relaxed">Set your links to self-destruct after a specific time or number of views for maximum control.</p>
                            </div>
                        </div>
                    </div>

                    {/* Trusted By */}
                    <div className="border-t border-white/10 pt-16 pb-8 text-center">
                        <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 mb-12">Trusted by Industry Leaders</p>
                        <div className="flex flex-wrap items-center justify-center gap-12 md:gap-24 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
                            <span className="font-black text-xl lg:text-3xl text-white italic tracking-tighter">FORTUNE 500</span>
                            <span className="font-black text-xl lg:text-3xl text-white italic tracking-tighter">SECURELY</span>
                            <span className="font-black text-xl lg:text-3xl text-white italic tracking-tighter">TECHCORP</span>
                        </div>
                    </div>

                    {/* Final CTA */}
                    <div className="mt-24 relative overflow-hidden bg-gradient-to-br from-primary to-orange-600 rounded-[3rem] p-12 md:p-20 text-center shadow-2xl shadow-primary/20">
                        <div className="relative z-10">
                            <h3 className="text-4xl md:text-5xl font-black text-white mb-8">Ready to secure your documents?</h3>
                            <p className="text-white/90 text-xl mb-12 max-w-2xl mx-auto font-medium">Join thousands of companies using DocsVault for AI-powered sharing and intelligent document distribution.</p>
                            <Link href="/register" className="inline-block bg-white text-primary px-12 py-5 rounded-2xl text-xl font-black shadow-2xl hover:scale-105 active:scale-95 transition-transform">
                                Start Sharing for Free
                            </Link>
                        </div>
                        <div className="absolute top-0 right-0 w-96 h-96 bg-white/20 rounded-full blur-3xl -mr-40 -mt-20"></div>
                        <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/20 rounded-full blur-3xl -ml-40 -mb-20"></div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-16 px-6 bg-white border-t border-slate-100">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <Link href="/" className="flex items-center">
                            <DocVaultLogo size={40} />
                        </Link>
                        <span className="hidden md:block w-px h-6 bg-slate-200 mx-2"></span>
                        <p className="text-slate-400 text-sm font-medium">© 2026 DocsVault Inc. All rights reserved.</p>
                    </div>
                    <div className="flex gap-8 text-slate-400 text-xs font-black uppercase tracking-widest">
                        <Link href="/compare" className="hover:text-primary transition-colors">Compare</Link>
                        <Link href="/donate" className="hover:text-primary transition-colors">Support</Link>
                        <Link href="https://github.com/Nikhilkumar25/docvoult" className="hover:text-primary transition-colors">GitHub</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
