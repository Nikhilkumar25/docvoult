'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Providers from '@/components/Providers';
import { WorkspaceProvider, useWorkspace } from '@/context/WorkspaceContext';
import DocVaultLogo from '@/components/DocVaultLogo';

function WorkspaceSwitcher() {
    const { workspaces, activeWorkspace, switchWorkspace } = useWorkspace();
    const [open, setOpen] = useState(false);

    const activeData = workspaces.find(w => w.id === activeWorkspace);
    const label = activeData ? activeData.name : 'Personal';

    return (
        <div className="relative mb-0 px-3">
            <button
                className="w-full flex items-center justify-between p-3 bg-black/5 hover:bg-black/10 border border-black/5 rounded-xl text-gray-600 transition-colors"
                onClick={() => setOpen(!open)}
            >
                <span className="mr-2">{activeData ? '👥' : '👤'}</span>
                <span className="flex-1 text-left font-medium text-sm">{label}</span>
                <span className="text-xs text-gray-400">{open ? '▲' : '▼'}</span>
            </button>
            {open && (
                <div className="absolute top-[calc(100%+4px)] left-3 right-3 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden flex flex-col">
                    <button
                        className={`flex items-center gap-3 w-full p-3 bg-transparent border-b border-gray-100 text-gray-800 text-left hover:bg-gray-50 transition-colors ${!activeWorkspace ? 'bg-primary/5 text-primary font-semibold' : ''}`}
                        onClick={() => { switchWorkspace(null); setOpen(false); }}
                    >
                        <span>👤</span> Personal
                    </button>
                    {workspaces.map(w => (
                        <button
                            key={w.id}
                            className={`flex items-center gap-3 w-full p-3 bg-transparent border-b border-gray-100 text-gray-800 text-left hover:bg-gray-50 transition-colors ${activeWorkspace === w.id ? 'bg-primary/5 text-primary font-semibold' : ''}`}
                            onClick={() => { switchWorkspace(w.id); setOpen(false); }}
                        >
                            <span>👥</span>
                            <div>
                                <div>{w.name}</div>
                                <div className="text-xs text-gray-500 font-normal mt-[2px]">{w.role === 'owner' ? 'Owner' : 'Member'}</div>
                            </div>
                        </button>
                    ))}
                    <Link
                        href="/dashboard/workspaces"
                        className="flex items-center gap-3 w-full p-3 border-none text-gray-600 text-sm justify-center bg-gray-50 font-medium hover:bg-gray-100 hover:text-gray-900 transition-colors no-underline"
                        onClick={() => setOpen(false)}
                    >
                        ⚙️ Manage Workspaces
                    </Link>
                </div>
            )}
        </div>
    );
}

function DashboardShell({ children }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        // Close sidebar when navigating on mobile
        setSidebarOpen(false);
    }, [pathname]);

    useEffect(() => {
        if (sidebarOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [sidebarOpen]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (status === 'loading') {
                console.warn('Dashboard loading timed out, redirecting...');
                router.push('/');
            }
        }, 5000);

        if (status === 'unauthenticated') {
            router.push('/login');
        }

        return () => clearTimeout(timer);
    }, [status, router]);

    if (status === 'loading') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-16 gap-4">
                <div className="w-10 h-10 border-4 border-gray-200 border-t-primary rounded-full animate-spin" />
                <p className="text-sm text-gray-500">Securing your session...</p>
            </div>
        );
    }

    if (!session) return null;

    const navItems = [
        { href: '/dashboard/analytics', label: 'Dashboard', icon: '📊' },
        { href: '/dashboard', label: 'Documents', icon: '📄' },
        { href: '/dashboard/signatures', label: 'Signatures', icon: '✍️' },
        { href: '/dashboard/upload', label: 'Upload', icon: '📤' },
    ];

    const isAdmin = session.user?.isAdmin;
    if (isAdmin) {
        navItems.push({ href: '/dashboard/admin', label: 'Admin', icon: '🛡️' });
    }

    navItems.push({ href: '/donate', label: 'Support Us', icon: '💖' });

    const userInitials = session.user?.name
        ? session.user.name.split(' ').map((n) => n[0]).join('').toUpperCase()
        : '?';

    return (
        <WorkspaceProvider>
            <div className="flex min-h-screen bg-background-light">
                {/* Mobile Header */}
                <header className="md:hidden flex fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-xl border-b border-black/5 z-[900] items-center justify-between px-4">
                    <button 
                        className="bg-transparent border-none text-2xl text-gray-900 cursor-pointer p-1 flex items-center justify-center w-10 h-10 hover:bg-black/5 rounded-lg transition-colors"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        {sidebarOpen ? '✕' : '☰'}
                    </button>
                    <Link href="/dashboard" className="flex items-center no-underline">
                        <DocVaultLogo size={24} />
                    </Link>
                    <div className="w-8 h-8 bg-gradient-to-br from-[#FB923C] to-[#F97316] rounded-full flex items-center justify-center font-bold text-[10px] text-white">
                        {userInitials}
                    </div>
                </header>

                {/* Mobile Overlay */}
                {sidebarOpen && (
                    <div 
                        className="md:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-[1900] transition-opacity" 
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <aside className={`fixed md:w-[280px] w-[300px] bg-white/95 backdrop-blur-2xl border-r border-black/5 flex flex-col top-0 bottom-0 left-0 z-[2000] transition-transform duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] ${sidebarOpen ? 'translate-x-0 shadow-[20px_0_80px_rgba(0,0,0,0.1)]' : '-translate-x-full md:translate-x-0'}`}>
                    <div className="p-8 pb-6 border-b border-black/5 mb-6 md:p-6 md:pb-5">
                        <Link href="/dashboard" className="flex items-center gap-3 no-underline">
                            <div className="bg-white p-2 rounded-xl shadow-[0_4px_12px_rgba(249,112,21,0.1)]">
                                <DocVaultLogo size={32} />
                            </div>
                        </Link>
                    </div>

                    <WorkspaceSwitcher />

                    <nav className="flex flex-col gap-1.5 flex-1 px-3 py-6">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-[15px] font-medium transition-all duration-200 no-underline ${
                                        isActive 
                                        ? 'bg-primary text-white shadow-[0_8px_16px_rgba(249,112,21,0.2)]' 
                                        : 'text-gray-600 hover:bg-black/5 hover:text-gray-900'
                                    }`}
                                >
                                    <span className="text-xl">{item.icon}</span>
                                    <span>{item.label}</span>
                                </Link>
                            )
                        })}
                    </nav>

                    <div className="p-6 border-t border-black/5 mt-auto">
                        <div className="flex items-center gap-3 p-3 bg-black/[0.02] rounded-[16px] w-full">
                            <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center font-bold">
                                {userInitials}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold text-gray-900 truncate">{session.user?.name}</div>
                                <div className="text-xs text-gray-500 truncate">{session.user?.email}</div>
                            </div>
                            <button
                                onClick={() => signOut({ callbackUrl: '/' })}
                                className="bg-transparent border-none text-lg cursor-pointer p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                                title="Sign out"
                            >
                                🚪
                            </button>
                        </div>
                    </div>
                </aside>

                <main className="flex-1 md:ml-[280px] px-4 pt-24 pb-12 md:px-8 md:py-8 max-w-7xl mx-auto w-full min-w-0">
                    {children}
                    
                    {/* Premium Mobile FAB */}
                    <Link href="/dashboard/upload" className="md:hidden flex fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-[20px] items-center justify-center text-3xl font-light shadow-[0_12px_24px_rgba(249,112,21,0.4)] z-[1800] no-underline transition-transform active:scale-90 active:rotate-45">
                        <span>+</span>
                    </Link>
                </main>
            </div>
        </WorkspaceProvider>
    );
}

export default function DashboardLayout({ children }) {
    return (
        <Providers>
            <DashboardShell>{children}</DashboardShell>
        </Providers>
    );
}
