'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';

function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function formatDuration(seconds) {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (minutes < 60) return `${minutes}m ${secs}s`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export default function DocumentDetailPage({ params }) {
    const resolvedParams = use(params);
    const { id } = resolvedParams;
    const router = useRouter();
    const [document, setDocument] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [copied, setCopied] = useState('');

    // Link creation form
    const [linkForm, setLinkForm] = useState({
        requireEmail: false,
        passcode: '',
        expiresAt: '',
        allowDownload: false,
    });
    const [creatingLink, setCreatingLink] = useState(false);

    useEffect(() => {
        fetchDocument();
    }, [id]);

    const fetchDocument = async () => {
        try {
            const res = await fetch(`/api/documents/${id}`);
            if (!res.ok) {
                router.push('/dashboard');
                return;
            }
            const data = await res.json();
            setDocument(data);
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateLink = async (e) => {
        e.preventDefault();
        setCreatingLink(true);
        try {
            const res = await fetch(`/api/documents/${id}/links`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...linkForm,
                    expiresAt: linkForm.expiresAt || null,
                    passcode: linkForm.passcode || null,
                }),
            });
            if (res.ok) {
                setShowLinkModal(false);
                setLinkForm({ requireEmail: false, passcode: '', expiresAt: '', allowDownload: false });
                fetchDocument();
            }
        } catch (err) {
            console.error('Error creating link:', err);
        } finally {
            setCreatingLink(false);
        }
    };

    const copyLink = (slug) => {
        const url = `${window.location.origin}/view/${slug}`;
        navigator.clipboard.writeText(url);
        setCopied(slug);
        setTimeout(() => setCopied(''), 2500);
    };

    if (loading) {
        return (
            <div className="loading-spinner">
                <div className="spinner" />
            </div>
        );
    }

    if (!document) return null;

    const { analytics } = document;
    const maxPageDuration = Math.max(
        ...Object.values(analytics.pageStats).map((s) => s.totalDuration),
        1
    );

    return (
        <div className="doc-detail">
            {/* Header */}
            <div className="doc-detail-header">
                <div className="doc-info">
                    <h1>{document.title}</h1>
                    <div className="doc-meta">
                        <span>{document.fileName}</span>
                        <span>{formatFileSize(document.fileSize)}</span>
                        <span>{document.pageCount} pages</span>
                        <span>Uploaded {formatDate(document.createdAt)}</span>
                    </div>
                </div>
                <div className="header-actions">
                    <button className="btn btn-secondary" onClick={() => router.push('/dashboard')}>
                        ← Back
                    </button>
                    <button className="btn btn-primary" onClick={() => setShowLinkModal(true)}>
                        🔗 Create Link
                    </button>
                </div>
            </div>

            {/* Analytics Overview */}
            <div className="analytics-overview">
                <div className="analytics-card">
                    <div className="analytics-label">Total Views</div>
                    <div className="analytics-value accent">{analytics.totalViews}</div>
                </div>
                <div className="analytics-card">
                    <div className="analytics-label">Unique Viewers</div>
                    <div className="analytics-value accent">{analytics.uniqueViewers}</div>
                </div>
                <div className="analytics-card">
                    <div className="analytics-label">Avg. View Time</div>
                    <div className="analytics-value accent">{formatDuration(analytics.avgDuration)}</div>
                </div>
                <div className="analytics-card">
                    <div className="analytics-label">Active Links</div>
                    <div className="analytics-value accent">
                        {document.links.filter((l) => l.isActive).length}
                    </div>
                </div>
            </div>

            {/* Page-Level Heatmap */}
            {document.pageCount > 0 && (
                <div className="section-panel">
                    <div className="section-panel-header">
                        <h2>📊 Page Engagement</h2>
                    </div>
                    <div className="section-panel-body">
                        <div className="page-heatmap">
                            {Object.entries(analytics.pageStats).map(([page, stats]) => (
                                <div
                                    key={page}
                                    className={`page-bar ${stats.views > 0 ? 'active' : ''}`}
                                    style={{
                                        height: `${Math.max(
                                            (stats.totalDuration / maxPageDuration) * 100,
                                            stats.views > 0 ? 10 : 3
                                        )}%`,
                                    }}
                                >
                                    <div className="page-bar-tooltip">
                                        Page {page}: {stats.views} views, {formatDuration(stats.totalDuration)}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="page-numbers">
                            {Object.keys(analytics.pageStats).map((page) => (
                                <span key={page}>{page}</span>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Links */}
            <div className="section-panel">
                <div className="section-panel-header">
                    <h2>🔗 Shared Links</h2>
                    <button className="btn btn-primary btn-sm" onClick={() => setShowLinkModal(true)}>
                        + New Link
                    </button>
                </div>
                <div className="section-panel-body">
                    {document.links.length === 0 ? (
                        <div className="empty-state" style={{ padding: 'var(--space-xl)' }}>
                            <p>No links created yet. Create a link to start sharing.</p>
                        </div>
                    ) : (
                        <table className="links-table">
                            <thead>
                                <tr>
                                    <th>Link</th>
                                    <th>Settings</th>
                                    <th>Views</th>
                                    <th>Created</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {document.links.map((link) => (
                                    <tr key={link.id}>
                                        <td>
                                            <div className="link-url">
                                                <code>/view/{link.slug}</code>
                                            </div>
                                        </td>
                                        <td>
                                            {link.requireEmail && <span className="badge badge-info">📧 Email</span>}{' '}
                                            {link.passcode && <span className="badge badge-warning">🔒 Passcode</span>}{' '}
                                            {link.expiresAt && <span className="badge badge-danger">⏱ Expires</span>}{' '}
                                            {link.allowDownload && <span className="badge badge-success">📥 Download</span>}
                                        </td>
                                        <td>{link._count.views}</td>
                                        <td>{formatDate(link.createdAt)}</td>
                                        <td>
                                            <button
                                                className="btn btn-secondary btn-sm"
                                                onClick={() => copyLink(link.slug)}
                                            >
                                                {copied === link.slug ? '✓ Copied!' : '📋 Copy'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Viewers */}
            <div className="section-panel">
                <div className="section-panel-header">
                    <h2>👥 Recent Viewers</h2>
                </div>
                <div className="section-panel-body">
                    {document.views.length === 0 ? (
                        <div className="empty-state" style={{ padding: 'var(--space-xl)' }}>
                            <p>No views yet. Share a link to start tracking viewers.</p>
                        </div>
                    ) : (
                        <table className="viewers-table">
                            <thead>
                                <tr>
                                    <th>Viewer</th>
                                    <th>Pages Viewed</th>
                                    <th>Time Spent</th>
                                    <th>Viewed At</th>
                                </tr>
                            </thead>
                            <tbody>
                                {document.views.map((view) => (
                                    <tr key={view.id}>
                                        <td>
                                            <div className="viewer-email">
                                                <div className="viewer-avatar">
                                                    {view.viewerEmail ? view.viewerEmail[0].toUpperCase() : '?'}
                                                </div>
                                                {view.viewerEmail || 'Anonymous'}
                                            </div>
                                        </td>
                                        <td>
                                            {view.completedPages} / {document.pageCount}
                                        </td>
                                        <td>{formatDuration(view.duration)}</td>
                                        <td>{formatDate(view.startedAt)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Create Link Modal */}
            {showLinkModal && (
                <div className="modal-overlay" onClick={() => setShowLinkModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Create Shareable Link</h2>
                            <button className="modal-close" onClick={() => setShowLinkModal(false)}>
                                ✕
                            </button>
                        </div>
                        <form onSubmit={handleCreateLink}>
                            <div className="modal-body">
                                <div className="checkbox-group">
                                    <input
                                        type="checkbox"
                                        id="requireEmail"
                                        checked={linkForm.requireEmail}
                                        onChange={(e) =>
                                            setLinkForm((prev) => ({ ...prev, requireEmail: e.target.checked }))
                                        }
                                    />
                                    <label htmlFor="requireEmail">Require email to view</label>
                                </div>

                                <div className="input-group">
                                    <label htmlFor="passcode">Passcode (optional)</label>
                                    <input
                                        id="passcode"
                                        type="text"
                                        className="input"
                                        placeholder="Leave empty for no passcode"
                                        value={linkForm.passcode}
                                        onChange={(e) =>
                                            setLinkForm((prev) => ({ ...prev, passcode: e.target.value }))
                                        }
                                    />
                                </div>

                                <div className="input-group">
                                    <label htmlFor="expiresAt">Expiration date (optional)</label>
                                    <input
                                        id="expiresAt"
                                        type="datetime-local"
                                        className="input"
                                        value={linkForm.expiresAt}
                                        onChange={(e) =>
                                            setLinkForm((prev) => ({ ...prev, expiresAt: e.target.value }))
                                        }
                                    />
                                </div>

                                <div className="checkbox-group">
                                    <input
                                        type="checkbox"
                                        id="allowDownload"
                                        checked={linkForm.allowDownload}
                                        onChange={(e) =>
                                            setLinkForm((prev) => ({ ...prev, allowDownload: e.target.checked }))
                                        }
                                    />
                                    <label htmlFor="allowDownload">Allow PDF download</label>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowLinkModal(false)}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={creatingLink}>
                                    {creatingLink ? 'Creating...' : 'Create Link'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {copied && <div className="copied-toast">✓ Link copied to clipboard!</div>}
        </div>
    );
}
