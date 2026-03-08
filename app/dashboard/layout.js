'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import Providers from '@/components/Providers';

function DashboardShell({ children }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Fallback for stuck loading status
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

    const userInitials = session.user?.name
        ? session.user.name.split(' ').map((n) => n[0]).join('').toUpperCase()
        : '?';

    return (
        <div className="dashboard-layout">
            <aside className="sidebar">
                <Link href="/dashboard" className="sidebar-logo">
                    <div className="logo-icon">📄</div>
                    DocVault
                </Link>

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
    );
}

export default function DashboardLayout({ children }) {
    return (
        <Providers>
            <DashboardShell>{children}</DashboardShell>
        </Providers>
    );
}
