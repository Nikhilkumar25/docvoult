import Link from 'next/link';
import DocVaultLogo from '@/components/DocVaultLogo';

export const metadata = {
    title: 'DocsVault vs Papermark | Superior Document Sharing Analytics',
    description: 'Compare DocsVault and Papermark. See how our AI-powered document analytics help you achieve better conversion rates than basic open-source alternatives.',
    keywords: 'Papermark alternative, open source docsend, document sharing analytics, DocsVault vs Papermark',
};

export default function PapermarkCompare() {
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
                    <h1 className="text-5xl md:text-6xl font-black mb-6">DocsVault vs Papermark</h1>
                    <p className="text-xl text-slate-600 font-medium">Why settle for just sharing when you can increase your pitch deck conversion rates?</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
                    <div className="bg-white p-10 rounded-[2.5rem] border-4 border-primary shadow-2xl">
                        <h2 className="text-3xl font-black mb-6 flex items-center gap-3">
                            <span className="size-8 bg-primary text-white rounded-lg flex items-center justify-center text-sm">DV</span>
                            DocsVault
                        </h2>
                        <ul className="space-y-4">
                            <li className="flex items-center gap-2 font-bold text-slate-700">✅ Integrated AI Analytics Assistant</li>
                            <li className="flex items-center gap-2 font-bold text-slate-700">✅ Dynamic Conversion tracking</li>
                            <li className="flex items-center gap-2 font-bold text-slate-700">✅ Premium Glassmorphism UI</li>
                            <li className="flex items-center gap-2 font-bold text-slate-700">✅ Advanced Security (Passcodes/Gates)</li>
                        </ul>
                        <Link href="/register" className="mt-8 block text-center bg-primary text-white py-4 rounded-2xl font-black">Get Started Free</Link>
                    </div>

                    <div className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-200 opacity-80">
                        <h2 className="text-3xl font-black mb-6 text-slate-500">Papermark</h2>
                        <ul className="space-y-4">
                            <li className="flex items-center gap-2 font-bold text-slate-500">❌ Basic Open Source metrics</li>
                            <li className="flex items-center gap-2 font-bold text-slate-500">❌ No AI Interaction layer</li>
                            <li className="flex items-center gap-2 font-bold text-slate-500">❌ Limited conversion optimization</li>
                            <li className="flex items-center gap-2 font-bold text-slate-500">❌ Minimalist, sometimes lacking, UI</li>
                        </ul>
                    </div>
                </div>

                <section className="bg-slate-900 text-white p-12 rounded-[3rem] shadow-2xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl"></div>
                    <h2 className="text-4xl font-black mb-8">The Smart Choice for Pitch Decks</h2>
                    <div className="prose prose-invert max-w-none font-medium text-slate-300 leading-relaxed">
                        <p>While <strong>Papermark</strong> offers a solid open-source foundation for <strong>document sharing</strong>, it focuses primarily on the plumbing of storage and delivery. <strong>DocsVault</strong> is built for the result: <strong>Conversion</strong>.</p>
                        <p>Our platform uses <strong>AI to analyze investor intent</strong>. When someone views your pitch deck, the AI helps guide them through the most impactful sections, answering questions in real-time. This isn't just a <strong>DocSend alternative</strong>; it's a leap forward in how business documents are consumed.</p>
                    </div>
                </section>
            </main>
        </div>
    );
}
