'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

function formatDuration(seconds) {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (minutes < 60) return `${minutes}m ${secs}s`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

export default function AnalyticsDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const res = await fetch('/api/analytics');
            if (res.ok) {
                const json = await res.json();
                setData(json);
            }
        } catch (err) {
            console.error('Error fetching analytics:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-spinner">
                <div className="spinner" />
            </div>
        );
    }

    if (!data) return <div>Error loading analytics</div>;

    const { summary, topDocuments, recentQuestions } = data;

    return (
        <div className="analytics-page">
            <div className="dashboard-header">
                <h1>Master Dashboard</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Overall analytics and insights across all your documents.</p>
            </div>

            {/* Summary Cards */}
            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <div className="stat-card" style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                    <div className="stat-label" style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Total Documents</div>
                    <div className="stat-value" style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{summary.totalDocuments}</div>
                </div>
                <div className="stat-card" style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                    <div className="stat-label" style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Total Views</div>
                    <div className="stat-value" style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{summary.totalViews}</div>
                </div>
                <div className="stat-card" style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                    <div className="stat-label" style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Avg. Engagement</div>
                    <div className="stat-value" style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{formatDuration(summary.avgDuration)}</div>
                </div>
                <div className="stat-card" style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', borderLeft: '4px solid var(--accent-primary)' }}>
                    <div className="stat-label" style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Pending Questions</div>
                    <div className="stat-value" style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>{summary.unansweredQuestions}</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
                {/* Top Documents Table */}
                <div className="card-panel">
                    <h2 style={{ marginBottom: '1.5rem' }}>Top Documents</h2>
                    <div className="table-responsive">
                        <table className="engagement-table">
                            <thead>
                                <tr>
                                    <th>Document</th>
                                    <th>Views</th>
                                    <th>Questions</th>
                                    <th>Avg. Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topDocuments.map(doc => (
                                    <tr key={doc.id} onClick={() => router.push(`/dashboard/documents/${doc.id}`)} style={{ cursor: 'pointer' }}>
                                        <td>{doc.title}</td>
                                        <td>{doc.views}</td>
                                        <td>{doc.questions}</td>
                                        <td>{formatDuration(doc.avgDuration)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Recent Inquiries */}
                <div className="card-panel">
                    <h2 style={{ marginBottom: '1.5rem' }}>Recent Inquiries</h2>
                    <div className="recent-questions-list">
                        {recentQuestions.length === 0 ? (
                            <div className="empty-state-small">No recent questions.</div>
                        ) : (
                            recentQuestions.map(q => (
                                <div key={q.id} className="mini-q-card" onClick={() => router.push(`/dashboard/documents/${q.documentId}`)} style={{ cursor: 'pointer', padding: '12px', borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}>
                                    <div style={{ fontSize: '10px', color: 'var(--accent-primary)', textTransform: 'uppercase', marginBottom: '4px' }}>{q.documentTitle}</div>
                                    <div style={{ fontSize: '14px', marginBottom: '4px' }} className="truncate-text">{q.text}</div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-tertiary)' }}>
                                        <span>{q.userName}</span>
                                        <span>{formatDate(q.createdAt)}</span>
                                    </div>
                                    {!q.response && <div style={{ fontSize: '10px', color: 'var(--danger)', marginTop: '4px' }}>● Unanswered</div>}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <style jsx>{`
                .card-panel {
                    background: var(--bg-card);
                    padding: 2rem;
                    border-radius: var(--radius-lg);
                    border: 1px solid var(--border);
                    box-shadow: var(--shadow-sm);
                }
                .engagement-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .engagement-table th {
                    text-align: left;
                    padding: 12px;
                    border-bottom: 2px solid var(--border);
                    color: var(--text-tertiary);
                    font-size: 0.75rem;
                    text-transform: uppercase;
                }
                .engagement-table td {
                    padding: 12px;
                    border-bottom: 1px solid var(--border);
                    font-size: 0.875rem;
                }
                .mini-q-card:hover {
                    background: var(--bg-primary);
                }
                .truncate-text {
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
            `}</style>
        </div>
    );
}
