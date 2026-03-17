export const metadata = {
    title: 'DocsVault vs DocSend | The Smarter Pitch Deck Alternative',
    description: 'Compare DocsVault and DocSend. Discover why DocsVault is the smarter way to share pitch decks with AI-powered analytics and better conversion rates.',
    keywords: 'DocSend alternative, pitch deck sharing, investor analytics, DocsVault vs DocSend',
};

export default function DocSendCompare() {
    return (
        <div className="bg-background-light text-slate-900 font-display min-h-screen">
            <nav className="fixed top-0 left-0 right-0 z-50 glass">
                <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
                    <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
                        <DocVaultLogo size={32} />
                    </Link>
                </div>
            </nav>

            <main className="pt-32 pb-24 px-6 max-w-5xl mx-auto">
                <header className="text-center mb-16">
                    <h1 className="text-5xl md:text-6xl font-black mb-6">DocsVault vs DocSend</h1>
                    <p className="text-xl text-slate-600 font-medium">The smarter way to share pitch decks and documents for better conversion rates.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
                    <div className="bg-white p-10 rounded-[2.5rem] border-4 border-primary shadow-2xl">
                        <h2 className="text-3xl font-black mb-6 flex items-center gap-3">
                            <span className="size-8 bg-primary text-white rounded-lg flex items-center justify-center text-sm">DV</span>
                            DocsVault
                        </h2>
                        <ul className="space-y-4">
                            <li className="flex items-center gap-2 font-bold text-slate-700">✅ AI-Powered Document Q&A</li>
                            <li className="flex items-center gap-2 font-bold text-slate-700">✅ Real-time Conversion Insights</li>
                            <li className="flex items-center gap-2 font-bold text-slate-700">✅ Unlimited Tiers & Custom Branding</li>
                            <li className="flex items-center gap-2 font-bold text-slate-700">✅ Highly Affordable / Self-Sustaining</li>
                        </ul>
                        <Link href="/register" className="mt-8 block text-center bg-primary text-white py-4 rounded-2xl font-black">Switch to DocsVault</Link>
                    </div>

                    <div className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-200 opacity-60">
                        <h2 className="text-3xl font-black mb-6 text-slate-400">DocSend</h2>
                        <ul className="space-y-4">
                            <li className="flex items-center gap-2 font-bold text-slate-400">❌ Expensive Enterprise Tiers</li>
                            <li className="flex items-center gap-2 font-bold text-slate-400">❌ Basic Analytics only</li>
                            <li className="flex items-center gap-2 font-bold text-slate-400">❌ No AI Interaction capability</li>
                            <li className="flex items-center gap-2 font-bold text-slate-400">❌ Rigid, aging interface</li>
                        </ul>
                    </div>
                </div>

                <section className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-xl">
                    <h2 className="text-4xl font-black mb-8 text-center">Why Founders Choose DocsVault</h2>
                    <div className="prose prose-slate max-w-none font-medium text-slate-600 leading-relaxed">
                        <p>When sharing a <strong>pitch deck</strong>, every second counts. DocSend tells you someone opened the link, but DocsVault tells you what they were thinking. Our integrated <strong>AI Document Assistant</strong> allows investors to ask questions directly on your deck, increasing conversion rates by 40% compared to traditional static sharing.</p>
                        <p>DocsVault isn't just a document sharing tool; it's a <strong>conversion engine</strong> designed for the modern startup ecosystem.</p>
                    </div>
                </section>
            </main>
        </div>
    );
}
