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
        <div className="workspace-switcher">
            <button
                className="workspace-switcher-btn"
                onClick={() => setOpen(!open)}
            >
                <span className="workspace-icon">{activeData ? '👥' : '👤'}</span>
                <span className="workspace-label">{label}</span>
                <span className="workspace-chevron">{open ? '▲' : '▼'}</span>
            </button>
            {open && (
                <div className="workspace-dropdown">
                    <button
                        className={`workspace-option ${!activeWorkspace ? 'active' : ''}`}
                        onClick={() => { switchWorkspace(null); setOpen(false); }}
                    >
                        <span>👤</span> Personal
                    </button>
                    {workspaces.map(w => (
                        <button
                            key={w.id}
                            className={`workspace-option ${activeWorkspace === w.id ? 'active' : ''}`}
                            onClick={() => { switchWorkspace(w.id); setOpen(false); }}
                        >
                            <span>👥</span>
                            <div>
                                <div>{w.name}</div>
                                <div className="workspace-option-role">{w.role === 'owner' ? 'Owner' : 'Member'}</div>
                            </div>
                        </button>
                    ))}
                    <Link
                        href="/dashboard/workspaces"
                        className="workspace-option workspace-manage"
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
            <div className="loading-spinner" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="spinner" />
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Securing your session...</p>
            </div>
        );
    }

    if (!session) return null;

    const navItems = [
        { href: '/dashboard/analytics', label: 'Dashboard', icon: '📊' },
        { href: '/dashboard', label: 'Documents', icon: '📄' },
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
            <div className="dashboard-layout">
                <aside className="sidebar">
                    <Link href="/dashboard" className="sidebar-logo">
                        <DocVaultLogo size={28} />
                    </Link>

                    <WorkspaceSwitcher />

                    <nav className="sidebar-nav">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`sidebar-link ${pathname === item.href ? 'active' : ''}`}
                            >
                                <span>{item.icon}</span>
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="sidebar-user">
                        <div className="user-avatar">{userInitials}</div>
                        <div className="user-info">
                            <div className="user-name">{session.user?.name}</div>
                            <div className="user-email">{session.user?.email}</div>
                        </div>
                        <button
                            onClick={() => signOut({ callbackUrl: '/' })}
                            className="btn btn-ghost btn-sm"
                            title="Sign out"
                        >
                            ↗
                        </button>
                    </div>
                </aside>

                <main className="dashboard-main">{children}</main>
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
