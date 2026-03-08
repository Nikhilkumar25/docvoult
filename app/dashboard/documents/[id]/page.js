'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

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
    const { id } = use(params);
    const router = useRouter();
    const { data: session } = useSession();
    const [document, setDocument] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [copied, setCopied] = useState('');
    const [replyingTo, setReplyingTo] = useState(null); // The comment object being replied to
    const [replyText, setReplyText] = useState('');
    const [sendingReply, setSendingReply] = useState(false);

    // Link creation form
    const [linkForm, setLinkForm] = useState({
        requireEmail: false,
        passcode: '',
        expiresAt: '',
        allowDownload: false,
        requireWatermark: false,
    });
    const [creatingLink, setCreatingLink] = useState(false);

    const handleReplySubmit = async (e) => {
        e.preventDefault();
        if (!replyText.trim() || !replyingTo) return;

        setSendingReply(true);
        try {
            const res = await fetch(`/api/documents/${id}/comments/${replyingTo.id}/reply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: replyText }),
            });

            if (res.ok) {
                // Construct Gmail URL
                const to = replyingTo.askerEmail || '';
                const activeLink = document.links?.find(l => l.isActive) || document.links?.[0];
                const docUrl = activeLink ? `${window.location.origin}/view/${activeLink.slug}` : window.location.origin;

                const subject = encodeURIComponent(`Regarding your question on ${document.title}`);
                const body = encodeURIComponent(
                    `Hello ${replyingTo.userName},\n\n` +
                    `Regarding your question on page ${replyingTo.pageNumber}: "${replyingTo.text}"\n\n` +
                    `RESPONSE:\n${replyText}\n\n` +
                    `View the document here: ${docUrl}\n\n` +
                    `Best regards,\n${session?.user?.name || 'Document Owner'}`
                );
                const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${subject}&body=${body}`;

                // Open Gmail
                window.open(gmailUrl, '_blank');

                // Refresh document data to show the reply
                const updatedRes = await fetch(`/api/documents/${id}`);
                const updatedData = await updatedRes.json();
                setDocumentData(updatedData);
                setReplyingTo(null);
                setReplyText('');
            }
        } catch (err) {
            console.error('Failed to send reply');
        } finally {
            setSendingReply(false);
        }
    };

    useEffect(() => {
        fetchDocument();

        // Real-time polling every 5 seconds
        const interval = setInterval(() => {
            fetchDocument(false); // pass false to avoid showing loading spinner again
        }, 5000);

        return () => clearInterval(interval);
    }, [id]);

    const fetchDocument = async (showLoader = true) => {
        if (showLoader) setLoading(true);
        try {
            const res = await fetch(`/api/documents/${id}`);
            if (!res.ok) {
                if (showLoader) router.push('/dashboard');
                return;
            }
            const data = await res.json();
            setDocument(data);
        } catch (err) {
            console.error('Error:', err);
        } finally {
            if (showLoader) setLoading(false);
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
                setLinkForm({ requireEmail: false, passcode: '', expiresAt: '', allowDownload: false, requireWatermark: false });
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
                                            {link.allowDownload && <span className="badge badge-success">📥 Download</span>}{' '}
                                            {link.requireWatermark && <span className="badge badge-primary">🛡️ Watermark</span>}
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

            {/* Page Engagement Stats */}
            <div className="section-panel">
                <div className="section-panel-header">
                    <h2>📊 Page Engagement</h2>
                </div>
                <div className="section-panel-body">
                    <table className="viewers-table">
                        <thead>
                            <tr>
                                <th>Page Number</th>
                                <th>Total Views</th>
                                <th>Avg. Time Spent</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(document.analytics.pageStats)
                                .sort(([a], [b]) => parseInt(a) - parseInt(b))
                                .map(([page, stats]) => (
                                    <tr key={page}>
                                        <td style={{ fontWeight: 600 }}>Page {page}</td>
                                        <td>{stats.views}</td>
                                        <td>
                                            {stats.views > 0
                                                ? formatDuration(Math.round(stats.totalDuration / stats.views))
                                                : '0s'}
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
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

            {/* Questions Section */}
            <div className="section-panel">
                <div className="section-panel-header">
                    <h2>💬 Questions & Inquiries</h2>
                </div>
                <div className="section-panel-body">
                    {document.comments.length === 0 ? (
                        <div className="empty-state" style={{ padding: 'var(--space-xl)' }}>
                            <p>No questions from viewers yet.</p>
                        </div>
                    ) : (
                        <div className="comments-grid" style={{ display: 'grid', gap: '1rem' }}>
                            {document.comments.map((comment) => (
                                <div key={comment.id} className="comment-card" style={{
                                    padding: '1.25rem',
                                    background: 'var(--bg-secondary)',
                                    border: '1px solid var(--border)',
                                    borderRadius: 'var(--radius-md)',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                        <div>
                                            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{comment.userName}</span>
                                            {comment.askerEmail && (
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginLeft: '8px' }}>
                                                    ({comment.askerEmail})
                                                </span>
                                            )}
                                        </div>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>{formatDate(comment.createdAt)}</span>
                                    </div>
                                    <div style={{ color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.5' }}>{comment.text}</div>

                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        {comment.pageNumber && (
                                            <div style={{
                                                fontSize: '0.75rem',
                                                background: 'var(--bg-tertiary)',
                                                padding: '2px 8px',
                                                borderRadius: '4px',
                                                color: 'var(--text-secondary)'
                                            }}>
                                                Page {comment.pageNumber}
                                            </div>
                                        )}

                                        {!comment.response ? (
                                            <button
                                                className="btn btn-ghost btn-xs"
                                                onClick={() => setReplyingTo(comment)}
                                                style={{ color: 'var(--accent-primary)', padding: '4px 8px', fontSize: '0.75rem', fontWeight: 600 }}
                                            >
                                                Reply & Email
                                            </button>
                                        ) : (
                                            <div style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                                Replied
                                            </div>
                                        )}
                                    </div>

                                    {comment.response && (
                                        <div style={{
                                            marginTop: '1rem',
                                            padding: '1rem',
                                            background: 'var(--bg-tertiary)',
                                            borderRadius: 'var(--radius-sm)',
                                            borderLeft: '3px solid var(--accent-primary)'
                                        }}>
                                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                Your Response:
                                            </div>
                                            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                                                {comment.response}
                                            </div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: '6px' }}>
                                                Sent on {formatDate(comment.responseAt)}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
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

                                <div className="checkbox-group mt-3">
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

                                <div className="checkbox-group mt-3" style={{ marginTop: '0.5rem' }}>
                                    <input
                                        type="checkbox"
                                        id="requireWatermark"
                                        checked={linkForm.requireWatermark}
                                        onChange={(e) =>
                                            setLinkForm((prev) => ({ ...prev, requireWatermark: e.target.checked }))
                                        }
                                    />
                                    <label htmlFor="requireWatermark">Apply Security Watermark</label>
                                    <p style={{ margin: '0 0 0 24px', fontSize: '12px', color: 'var(--text-tertiary)' }}>
                                        Overlays viewer's IP/Email to deter screenshots and sharing
                                    </p>
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

            {/* Reply Modal */}
            {replyingTo && (
                <div className="modal-overlay" onClick={() => setReplyingTo(null)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Reply to {replyingTo.userName}</h2>
                            <button className="modal-close" onClick={() => setReplyingTo(null)}>
                                ✕
                            </button>
                        </div>
                        <form onSubmit={handleReplySubmit}>
                            <div className="modal-body">
                                <div style={{
                                    padding: '0.75rem',
                                    background: 'var(--bg-tertiary)',
                                    borderRadius: 'var(--radius-sm)',
                                    marginBottom: '1rem',
                                    fontSize: '0.875rem',
                                    color: 'var(--text-secondary)'
                                }}>
                                    <strong>Question on Page {replyingTo.pageNumber}:</strong>
                                    <p style={{ margin: '4px 0 0 0' }}>"{replyingTo.text}"</p>
                                </div>

                                <div className="input-group">
                                    <label htmlFor="replyText">Your Response</label>
                                    <textarea
                                        id="replyText"
                                        className="input"
                                        rows={4}
                                        placeholder="Type your response here..."
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        required
                                        autoFocus
                                    />
                                    <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '8px' }}>
                                        An email will be sent to <strong>{replyingTo.askerEmail || replyingTo.userName}</strong> with your response.
                                    </p>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setReplyingTo(null)}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={sendingReply}>
                                    {sendingReply ? 'Sending...' : 'Send Reply & Email'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
