'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useData } from '@/lib/hooks/useData';

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
    signup: '#10B981', // green
    upload: '#F97316', // orange
    view: '#F59E0B',   // yellow/warning
};

export default function AdminDashboard() {
    const { data: session } = useSession();
    const router = useRouter();

    const { data: stats, isLoading, error, mutate } = useData('/api/admin/stats', {
        enabled: !!session?.user?.isAdmin
    });

    useEffect(() => {
        if (session && !session.user?.isAdmin) {
            router.push('/dashboard');
        }
    }, [session]);

    if (!session || (isLoading && !stats)) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="w-10 h-10 border-4 border-gray-200 border-t-primary rounded-full animate-spin" />
                <p className="text-sm text-gray-500">Loading platform analytics...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-16 text-center">
                <p className="text-red-500 font-medium bg-red-50 inline-block px-4 py-2 rounded-lg border border-red-100">Error: {error}</p>
            </div>
        );
    }

    if (!stats) return null;

    const { kpis, linkFeatures, ai, signupsByMonth, topUsers, activityFeed } = stats;

    const maxSignups = Math.max(...Object.values(signupsByMonth), 1);

    const kpiCards = [
        { label: 'Total Users', value: kpis.totalUsers, icon: '👥', color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
        { label: 'Documents', value: kpis.totalDocuments, icon: '📄', color: 'bg-orange-50 text-orange-500 border-orange-100' },
        { label: 'Links Created', value: kpis.totalLinks, icon: '🔗', color: 'bg-purple-50 text-purple-600 border-purple-100' },
        { label: 'Total Views', value: kpis.totalViews, icon: '👁️', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
        { label: 'Total Page Swipes', value: kpis.totalPageViews, icon: '📜', color: 'bg-blue-50 text-blue-600 border-blue-100' },
        { label: 'Unique Viewers', value: kpis.uniqueViewers, icon: '🌍', color: 'bg-cyan-50 text-cyan-600 border-cyan-100' },
        { label: 'AI KBs Active', value: kpis.totalKBs, icon: '🤖', color: 'bg-pink-50 text-pink-600 border-pink-100' },
        { label: 'Storage Used', value: formatFileSize(kpis.totalFileSize), icon: '💾', color: 'bg-yellow-50 text-yellow-600 border-yellow-100' },
    ];

    const linkFeatureBars = [
        { label: 'AI Enabled', count: linkFeatures.ai, color: '#EC4899' },
        { label: 'Watermark', count: linkFeatures.watermark, color: '#8B5CF6' },
        { label: 'Email Gated', count: linkFeatures.email, color: '#06B6D4' },
        { label: 'Passcode', count: linkFeatures.passcode, color: '#F59E0B' },
    ];

    return (
        <div className="max-w-7xl mx-auto pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">🛡️ Platform Admin</h1>
                    <p className="text-sm font-medium text-gray-500">Monitor DocsVault performance, users, and feature adoption.</p>
                </div>
                <button 
                    className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2"
                    onClick={() => mutate()}
                >
                    🔄 Refresh
                </button>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {kpiCards.map((kpi, i) => (
                    <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between min-h-[120px]">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl border mb-2 ${kpi.color}`}>
                            {kpi.icon}
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900 leading-tight mb-1">{kpi.value}</div>
                            <div className="text-[11px] uppercase tracking-wider font-semibold text-gray-500">{kpi.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Two-column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Growth Chart */}
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">📈 User Signups (Last 6 Months)</h2>
                    {Object.keys(signupsByMonth).length === 0 ? (
                        <div className="text-center py-12 text-sm text-gray-400 font-medium border-2 border-dashed border-gray-100 rounded-xl">No signup data yet</div>
                    ) : (
                        <div className="flex items-end justify-between h-[200px] gap-2 pt-8">
                            {Object.entries(signupsByMonth).map(([month, count]) => (
                                <div key={month} className="flex-1 flex flex-col justify-end items-center group relative h-full">
                                    <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg z-10">{count}</div>
                                    <div
                                        className="w-full max-w-[40px] bg-primary/20 group-hover:bg-primary transition-colors duration-300 rounded-t-md border-b-0 border border-primary/10"
                                        style={{ height: `${Math.max((count / maxSignups) * 100, 8)}%` }}
                                    />
                                    <div className="mt-3 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">{month.split('-')[1]}/{month.split('-')[0].slice(2)}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* AI Feature Panel */}
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">🤖 AI Feature Usage</h2>
                    <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-center p-3 rounded-xl bg-gray-50/50">
                            <span className="text-sm font-medium text-gray-600">Knowledge Bases Generated</span>
                            <strong className="text-gray-900">{ai.totalKBs}</strong>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-xl bg-gray-50/50">
                            <span className="text-sm font-medium text-gray-600">KBs Ready / Live</span>
                            <strong className="text-gray-900">{ai.kbReady}</strong>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-xl bg-gray-50/50">
                            <span className="text-sm font-medium text-gray-600">Failed AI Training</span>
                            <strong className={ai.failedKBs > 0 ? "text-red-500" : "text-gray-900"}>{ai.failedKBs}</strong>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-xl bg-gray-50/50 border-t border-gray-100 mt-2">
                            <span className="text-sm font-medium text-gray-600">Total Q&A Entries</span>
                            <strong className="text-gray-900">{ai.totalEntries}</strong>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-xl bg-green-50/50 border border-green-100/50">
                            <span className="text-sm font-medium text-green-700">Approved Entries</span>
                            <strong className="text-green-600">{ai.approvedEntries}</strong>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-xl bg-red-50/50 border border-red-100/50">
                            <span className="text-sm font-medium text-red-700">Unanswered Questions</span>
                            <strong className="text-red-600">{ai.unanswered}</strong>
                        </div>
                        <div className="flex justify-between items-center p-4 rounded-xl bg-indigo-50 border border-indigo-100 mt-2">
                            <span className="text-sm font-bold text-indigo-900">Approval Rate</span>
                            <strong className="text-indigo-600 text-lg">{ai.approvalRate}%</strong>
                        </div>
                    </div>
                </div>
            </div>

            {/* Link Features Breakdown + Comments */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">🔗 Link Feature Adoption</h2>
                    <div>
                        <div className="flex flex-col items-center justify-center p-6 bg-purple-50 rounded-xl mb-6 border border-purple-100 text-center">
                            <span className="text-3xl font-bold text-purple-700 leading-tight">{linkFeatures.total}</span>
                            <span className="text-xs font-semibold text-purple-600 uppercase tracking-widest mt-1">Total Links</span>
                        </div>
                        <div className="flex flex-col gap-5">
                            {linkFeatureBars.map((feat, i) => (
                                <div key={i}>
                                    <div className="flex justify-between text-sm font-medium mb-2">
                                        <span className="text-gray-600">{feat.label}</span>
                                        <span className="text-gray-900">{feat.count}</span>
                                    </div>
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-500 delay-100"
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

                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">💬 Community Stats</h2>
                    <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-center p-4 rounded-xl bg-blue-50/50 border border-blue-100/50">
                            <span className="text-sm font-medium text-blue-800">Total Questions / Comments</span>
                            <strong className="text-blue-600 text-lg">{kpis.totalComments}</strong>
                        </div>
                        <div className="flex justify-between items-center p-4 rounded-xl bg-orange-50/50 border border-orange-100/50 mt-2">
                            <span className="text-sm font-medium text-orange-800">Total Document Views</span>
                            <strong className="text-orange-600 text-lg">{kpis.totalViews}</strong>
                        </div>
                        <div className="flex justify-between items-center p-4 rounded-xl bg-emerald-50/50 border border-emerald-100/50 mt-2">
                            <span className="text-sm font-medium text-emerald-800">Avg Engagement per View</span>
                            <strong className="text-emerald-600 text-lg">{formatDuration(kpis.avgEngagement)}</strong>
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Users Table */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm mb-8 w-full overflow-hidden">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">🏆 Top Users</h2>
                <div className="overflow-x-auto -mx-6 px-6">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead>
                            <tr className="border-b-2 border-gray-100">
                                <th className="py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider w-12">#</th>
                                <th className="py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">User</th>
                                <th className="py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Email</th>
                                <th className="py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Documents</th>
                                <th className="py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Views Received</th>
                                <th className="py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">AI KBs</th>
                                <th className="py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Joined</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topUsers.map((user, i) => (
                                <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                    <td className="py-3 px-4">
                                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-xs font-bold text-gray-600">{i + 1}</span>
                                    </td>
                                    <td className="py-3 px-4 text-sm font-semibold text-gray-900">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-orange-400 text-white flex items-center justify-center font-bold text-xs shadow-sm flex-shrink-0">
                                                {user.name?.[0]?.toUpperCase() || '?'}
                                            </div>
                                            <span className="truncate max-w-[150px]">{user.name}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-sm text-gray-500 font-medium truncate max-w-[200px]">{user.email}</td>
                                    <td className="py-3 px-4 text-sm font-bold text-gray-900 text-right">{user.documents}</td>
                                    <td className="py-3 px-4 text-sm font-medium text-gray-600 text-right">{user.viewsReceived}</td>
                                    <td className="py-3 px-4 text-sm font-medium text-gray-600 text-right">{user.kbCount}</td>
                                    <td className="py-3 px-4 text-xs font-medium text-gray-400 text-right whitespace-nowrap">{timeAgo(user.createdAt)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Recent Activity Feed */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm w-full">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">📡 Recent Activity</h2>
                <div className="flex flex-col gap-4">
                    {activityFeed.length === 0 ? (
                        <div className="text-center py-8 text-sm text-gray-400 font-medium border-2 border-dashed border-gray-100 rounded-xl">No recent activity</div>
                    ) : (
                        activityFeed.map((event, i) => (
                            <div key={i} className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 bg-opacity-15 shadow-sm"
                                    style={{ 
                                        backgroundColor: `${ACTIVITY_COLORS[event.type]}20`,
                                        color: ACTIVITY_COLORS[event.type],
                                        borderColor: `${ACTIVITY_COLORS[event.type]}40`,
                                        borderWidth: '1px'
                                    }}
                                >
                                    {ACTIVITY_ICONS[event.type]}
                                </div>
                                <div className="flex-1 min-w-0 pt-0.5">
                                    <div className="text-sm font-bold text-gray-900 mb-0.5 truncate">{event.label}</div>
                                    <div className="text-xs text-gray-500 font-medium truncate">{event.detail}</div>
                                </div>
                                <div className="text-xs font-semibold text-gray-400 whitespace-nowrap pt-1 bg-gray-50 px-2 py-1 rounded-md">{timeAgo(event.timestamp)}</div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
