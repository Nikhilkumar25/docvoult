'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

function formatFileSize(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatDuration(seconds) {
    if (!seconds || seconds < 1) return '0s';
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (minutes < 60) return `${minutes}m ${secs}s`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
}

function timeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const ACTIVITY_ICONS = {
    signup: '👤',
    upload: '📄',
    view: '👁️',
};

const ACTIVITY_COLORS = {
    signup: 'var(--success)',
    upload: 'var(--accent-primary)',
    view: 'var(--warning)',
};

export default function AdminDashboard() {
    const { data: session } = useSession();
    const router = useRouter();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
        if (session && session.user?.email !== adminEmail) {
            router.push('/dashboard');
            return;
        }
        fetchStats();
    }, [session]);

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/admin/stats');
            if (res.status === 403) {
                router.push('/dashboard');
                return;
            }
            if (!res.ok) throw new Error('Failed to load');
            setData(await res.json());
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-spinner" style={{ minHeight: '60vh' }}>
                <div className="spinner" />
                <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>Loading platform analytics...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '4rem', textAlign: 'center' }}>
                <p style={{ color: 'var(--danger)' }}>Error: {error}</p>
            </div>
        );
    }

    if (!data) return null;

    const { kpis, linkFeatures, ai, signupsByMonth, topUsers, activityFeed } = data;

    const maxSignups = Math.max(...Object.values(signupsByMonth), 1);

    const kpiCards = [
        { label: 'Total Users', value: kpis.totalUsers, icon: '👥', color: '#6366F1' },
        { label: 'Documents', value: kpis.totalDocuments, icon: '📄', color: '#F97316' },
        { label: 'Links Created', value: kpis.totalLinks, icon: '🔗', color: '#8B5CF6' },
        { label: 'Total Views', value: kpis.totalViews, icon: '👁️', color: '#10B981' },
        { label: 'Unique Viewers', value: kpis.uniqueViewers, icon: '🌍', color: '#06B6D4' },
        { label: 'AI KBs Active', value: kpis.totalKBs, icon: '🤖', color: '#EC4899' },
        { label: 'Storage Used', value: formatFileSize(kpis.totalFileSize), icon: '💾', color: '#F59E0B' },
        { label: 'Avg. Engagement', value: formatDuration(kpis.avgEngagement), icon: '⏱️', color: '#14B8A6' },
    ];

    const linkFeatureBars = [
        { label: 'AI Enabled', count: linkFeatures.ai, color: '#EC4899' },
        { label: 'Watermark', count: linkFeatures.watermark, color: '#8B5CF6' },
        { label: 'Email Gated', count: linkFeatures.email, color: '#06B6D4' },
        { label: 'Passcode', count: linkFeatures.passcode, color: '#F59E0B' },
    ];

    return (
        <div className="admin-dashboard">
            {/* Header */}
            <div className="admin-header">
                <div>
                    <h1>🛡️ Platform Admin</h1>
                    <p>Monitor DocsVault performance, users, and feature adoption.</p>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={fetchStats}>
                    🔄 Refresh
                </button>
            </div>

            {/* KPI Grid */}
            <div className="admin-kpi-grid">
                {kpiCards.map((kpi, i) => (
                    <div key={i} className="admin-kpi-card" style={{ '--kpi-color': kpi.color }}>
                        <div className="admin-kpi-icon">{kpi.icon}</div>
                        <div className="admin-kpi-value">{kpi.value}</div>
                        <div className="admin-kpi-label">{kpi.label}</div>
                    </div>
                ))}
            </div>

            {/* Two-column layout */}
            <div className="admin-grid-2col">
                {/* Growth Chart */}
                <div className="admin-panel">
                    <h2>📈 User Signups (Last 6 Months)</h2>
                    {Object.keys(signupsByMonth).length === 0 ? (
                        <div className="admin-empty">No signup data yet</div>
                    ) : (
                        <div className="admin-growth-chart">
                            {Object.entries(signupsByMonth).map(([month, count]) => (
                                <div key={month} className="admin-bar-col">
                                    <div className="admin-bar-value">{count}</div>
                                    <div
                                        className="admin-bar"
                                        style={{ height: `${Math.max((count / maxSignups) * 100, 8)}%` }}
                                    />
                                    <div className="admin-bar-label">{month.split('-')[1]}/{month.split('-')[0].slice(2)}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* AI Feature Panel */}
                <div className="admin-panel">
                    <h2>🤖 AI Feature Usage</h2>
                    <div className="admin-ai-stats">
                        <div className="admin-ai-row">
                            <span>Knowledge Bases Generated</span>
                            <strong>{ai.totalKBs}</strong>
                        </div>
                        <div className="admin-ai-row">
                            <span>KBs Ready / Live</span>
                            <strong>{ai.kbReady}</strong>
                        </div>
                        <div className="admin-ai-row">
                            <span>Total Q&A Entries</span>
                            <strong>{ai.totalEntries}</strong>
                        </div>
                        <div className="admin-ai-row">
                            <span>Approved Entries</span>
                            <strong style={{ color: 'var(--success)' }}>{ai.approvedEntries}</strong>
                        </div>
                        <div className="admin-ai-row">
                            <span>Unanswered Questions</span>
                            <strong style={{ color: 'var(--danger)' }}>{ai.unanswered}</strong>
                        </div>
                        <div className="admin-ai-row highlight">
                            <span>Approval Rate</span>
                            <strong>{ai.approvalRate}%</strong>
                        </div>
                    </div>
                </div>
            </div>

            {/* Link Features Breakdown + Comments */}
            <div className="admin-grid-2col">
                <div className="admin-panel">
                    <h2>🔗 Link Feature Adoption</h2>
                    <div className="admin-link-features">
                        <div className="admin-link-total">
                            <span className="admin-link-total-val">{linkFeatures.total}</span>
                            <span className="admin-link-total-label">Total Links</span>
                        </div>
                        <div className="admin-feature-bars">
                            {linkFeatureBars.map((feat, i) => (
                                <div key={i} className="admin-feature-row">
                                    <div className="admin-feature-label">
                                        <span>{feat.label}</span>
                                        <span>{feat.count}</span>
                                    </div>
                                    <div className="admin-feature-track">
                                        <div
                                            className="admin-feature-fill"
                                            style={{
                                                width: `${linkFeatures.total > 0 ? Math.max((feat.count / linkFeatures.total) * 100, 2) : 0}%`,
                                                background: feat.color,
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="admin-panel">
                    <h2>💬 Community Stats</h2>
                    <div className="admin-ai-stats">
                        <div className="admin-ai-row">
                            <span>Total Questions / Comments</span>
                            <strong>{kpis.totalComments}</strong>
                        </div>
                        <div className="admin-ai-row">
                            <span>Total Document Views</span>
                            <strong>{kpis.totalViews}</strong>
                        </div>
                        <div className="admin-ai-row">
                            <span>Avg Engagement per View</span>
                            <strong>{formatDuration(kpis.avgEngagement)}</strong>
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Users Table */}
            <div className="admin-panel admin-full-width">
                <h2>🏆 Top Users</h2>
                <div className="admin-table-wrap">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>User</th>
                                <th>Email</th>
                                <th>Documents</th>
                                <th>Views Received</th>
                                <th>AI KBs</th>
                                <th>Joined</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topUsers.map((user, i) => (
                                <tr key={user.id}>
                                    <td>
                                        <span className="admin-rank">{i + 1}</span>
                                    </td>
                                    <td>
                                        <div className="admin-user-cell">
                                            <div className="admin-user-avatar">{user.name?.[0]?.toUpperCase() || '?'}</div>
                                            <span>{user.name}</span>
                                        </div>
                                    </td>
                                    <td className="admin-email-cell">{user.email}</td>
                                    <td><strong>{user.documents}</strong></td>
                                    <td>{user.viewsReceived}</td>
                                    <td>{user.kbCount}</td>
                                    <td className="admin-date-cell">{timeAgo(user.createdAt)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Recent Activity Feed */}
            <div className="admin-panel admin-full-width">
                <h2>📡 Recent Activity</h2>
                <div className="admin-activity-feed">
                    {activityFeed.length === 0 ? (
                        <div className="admin-empty">No recent activity</div>
                    ) : (
                        activityFeed.map((event, i) => (
                            <div key={i} className="admin-activity-item">
                                <div
                                    className="admin-activity-dot"
                                    style={{ background: ACTIVITY_COLORS[event.type] }}
                                >
                                    {ACTIVITY_ICONS[event.type]}
                                </div>
                                <div className="admin-activity-content">
                                    <div className="admin-activity-label">{event.label}</div>
                                    <div className="admin-activity-detail">{event.detail}</div>
                                </div>
                                <div className="admin-activity-time">{timeAgo(event.timestamp)}</div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
