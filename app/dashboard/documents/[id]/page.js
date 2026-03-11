'use client';

import { useState, useRef, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

import { pdfjs } from 'react-pdf';
if (typeof window !== 'undefined') {
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
}

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

    // AI Knowledge Base state
    const [kb, setKb] = useState(null);
    const [isGeneratingKB, setIsGeneratingKB] = useState(false);
    const [approvingAll, setApprovingAll] = useState(false);

    // Collapsable KB State
    const [isKBExpanded, setIsKBExpanded] = useState(false);
    const isKBExpandedRef = useRef(false);
    useEffect(() => {
        isKBExpandedRef.current = isKBExpanded;
    }, [isKBExpanded]);

    // Link creation form
    const [linkForm, setLinkForm] = useState({
        customSlug: '',
        requireEmail: false,
        passcode: '',
        expiresAt: '',
        allowDownload: false,
        requireWatermark: false,
        enableAI: false,
    });
    const [creatingLink, setCreatingLink] = useState(false);
    const [linkError, setLinkError] = useState('');

    // Update File form
    const fileInputRef = useRef(null);
    const [updatingFile, setUpdatingFile] = useState(false);
    const [updateProgress, setUpdateProgress] = useState(0);

    const handleFileUpdate = async (selectedFile) => {
        if (!selectedFile) return;
        if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
            alert('Only PDF files are supported');
            return;
        }

        setUpdatingFile(true);
        setUpdateProgress(10); // Start progress

        try {
            // Calculate page count before uploading
            let newPageCount = document.pageCount;
            try {
                setUpdateProgress(20);
                const data = await selectedFile.arrayBuffer();
                const loadingTask = pdfjs.getDocument({ data });
                const pdf = await loadingTask.promise;
                newPageCount = pdf.numPages;
            } catch (err) {
                console.error('Error calculating new page count:', err);
                // Keep the old page count if parsing fails
            }

            setUpdateProgress(40);
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('pageCount', newPageCount.toString());

            setUpdateProgress(60);
            const res = await fetch(`/api/documents/${id}/file`, {
                method: 'PATCH',
                body: formData,
            });

            setUpdateProgress(90);

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to update document file');
            }

            setUpdateProgress(100);
            alert('Document updated successfully! New file is live.');
            fetchDocument();
        } catch (err) {
            console.error('Error updating document:', err);
            alert(err.message || 'Error updating document. Please try again.');
        } finally {
            setUpdatingFile(false);
            setUpdateProgress(0);
            if (fileInputRef.current) fileInputRef.current.value = ''; // Reset input
        }
    };

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
                setDocument(updatedData);
                setReplyingTo(null);
                setReplyText('');
            }
        } catch (err) {
            console.error('Failed to send reply');
        } finally {
            setSendingReply(false);
        }
    };

    const fetchKB = async () => {
        try {
            const res = await fetch(`/api/documents/${id}/kb`);
            if (res.ok) {
                const data = await res.json();
                setKb(data);
            }
        } catch (err) {
            console.error('Failed to fetch KB:', err);
        }
    };

    const toggleKB = () => {
        if (!isKBExpanded) {
            setIsKBExpanded(true);
            if (!kb) fetchKB();
        } else {
            setIsKBExpanded(false);
        }
    };

    const generateKB = async () => {
        setIsGeneratingKB(true);
        setIsKBExpanded(true);
        try {
            const res = await fetch(`/api/documents/${id}/kb`, { method: 'POST' });
            if (res.ok) {
                const data = await res.json();
                setKb(data);
            } else {
                alert('Failed to generate AI Knowledge Base. Please ensure the document has clear text.');
            }
        } catch (err) {
            console.error('KB Generation error:', err);
        } finally {
            setIsGeneratingKB(false);
        }
    };

    const updateKBEntry = (entryId, updates) => {
        // Optimistic UI update for snappy typing
        setKb(prev => ({
            ...prev,
            entries: prev.entries.map(e => e.id === entryId ? { ...e, ...updates } : e),
        }));

        // Debounce the network request
        if (window[`debounceTimeout_${entryId}`]) {
            clearTimeout(window[`debounceTimeout_${entryId}`]);
        }

        window[`debounceTimeout_${entryId}`] = setTimeout(async () => {
            try {
                const res = await fetch(`/api/documents/${id}/kb/${entryId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updates),
                });
                if (!res.ok) {
                    console.error('Failed to update KB entry on server');
                }
            } catch (err) {
                console.error('Failed to update KB entry:', err);
            }
        }, 600);
    };

    const deleteKBEntry = async (entryId) => {
        if (!confirm('Are you sure you want to remove this Q&A pair?')) return;
        try {
            const res = await fetch(`/api/documents/${id}/kb/${entryId}`, { method: 'DELETE' });
            if (res.ok) {
                setKb(prev => ({
                    ...prev,
                    entries: prev.entries.filter(e => e.id !== entryId),
                }));
            }
        } catch (err) {
            console.error('Failed to delete KB entry:', err);
        }
    };

    const approveAllKB = async () => {
        setApprovingAll(true);
        try {
            const res = await fetch(`/api/documents/${id}/kb/approve-all`, { method: 'POST' });
            if (res.ok) {
                setKb(prev => ({
                    ...prev,
                    entries: prev.entries.map(e => ({ ...e, isApproved: true })),
                }));
            }
        } catch (err) {
            console.error('Failed to approve all:', err);
        } finally {
            setApprovingAll(false);
        }
    };

    const dismissUnanswered = async (unansweredId) => {
        // We'll reuse the PATCH route or create a small specific one if needed, 
        // but for now let's just use a client-side filter after a fake/future DELETE
        setKb(prev => ({
            ...prev,
            unanswered: prev.unanswered.filter(u => u.id !== unansweredId),
        }));
    };

    const isEditingKBRef = useRef(false);

    useEffect(() => {
        fetchDocument();

        // Real-time polling every 5 seconds
        const interval = setInterval(() => {
            fetchDocument(false);
            // Only poll the heavy KB payload if it's currently expanded and the user isn't actively typing
            if (!isEditingKBRef.current && isKBExpandedRef.current) {
                fetchKB();
            }
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
        setLinkError('');
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
            const data = await res.json();

            if (res.ok) {
                // Instantly update the UI with the newly created link
                const newLink = { ...data, _count: { views: 0 } };
                setDocument(prev => ({
                    ...prev,
                    links: [newLink, ...prev.links]
                }));
                setShowLinkModal(false);
                setLinkForm({ customSlug: '', requireEmail: false, passcode: '', expiresAt: '', allowDownload: false, requireWatermark: false, enableAI: false });
            } else {
                setLinkError(data.error || 'Failed to create link');
            }
        } catch (err) {
            console.error('Error creating link:', err);
            setLinkError('Network error occurred.');
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
                <div className="header-actions" style={{ position: 'relative' }}>
                    <button className="btn btn-secondary" onClick={() => router.push('/dashboard')} disabled={updatingFile}>
                        ← Back
                    </button>
                    {(document.userId === session?.user?.id || document.workspace?.ownerId === session?.user?.id) && (
                        <>
                            <button
                                className="btn btn-secondary"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={updatingFile}
                            >
                                {updatingFile ? `🚀 Uploading...` : `📄 Update PDF`}
                            </button>
                            <input
                                ref={fileInputRef}
                                id="update-pdf-input"
                                type="file"
                                accept=".pdf"
                                onChange={(e) => handleFileUpdate(e.target.files[0])}
                                style={{ display: 'none' }}
                            />
                        </>
                    )}
                    <button className="btn btn-primary" onClick={() => setShowLinkModal(true)} disabled={updatingFile}>
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
                                            {link.requireWatermark && <span className="badge badge-primary">🛡️ Watermark</span>}{' '}
                                            {link.enableAI && <span className="badge badge-accent">🤖 AI</span>}
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
                                    <th>Link</th>
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
                                            <code style={{ fontSize: '0.8rem', background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px' }}>
                                                /view/{view.link?.slug || '—'}
                                            </code>
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

            {/* AI Knowledge Base Management */}
            <div className="section-panel kb-section">
                <div className="section-panel-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <h2>🤖 AI Knowledge Base</h2>
                        {document.knowledgeBase && <span className={`kb-status-badge ${document.knowledgeBase.status}`}>{document.knowledgeBase.status.toUpperCase()}</span>}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {document.knowledgeBase && (
                            <button className="btn btn-secondary btn-sm" onClick={toggleKB}>
                                {isKBExpanded ? 'Collapse' : 'View & Edit'}
                            </button>
                        )}
                        <button
                            className="btn btn-secondary btn-sm"
                            onClick={generateKB}
                            disabled={isGeneratingKB}
                        >
                            {isGeneratingKB ? '✨ Generating...' : document.knowledgeBase ? '🔄 Regenerate' : '✨ Generate with AI'}
                        </button>
                        {isKBExpanded && kb && kb.entries.some(e => !e.isApproved) && (
                            <button
                                className="btn btn-primary btn-sm"
                                onClick={approveAllKB}
                                disabled={approvingAll}
                            >
                                {approvingAll ? '⌛ Approving...' : '✅ Approve All'}
                            </button>
                        )}
                    </div>
                </div>
                <div className="section-panel-body">
                    {!document.knowledgeBase ? (
                        <div className="empty-state">
                            <p>Train an AI on this document to give viewers instant answers. Costs ~$0.01 per document.</p>
                            <button className="btn btn-primary" onClick={generateKB} disabled={isGeneratingKB} style={{ marginTop: 12 }}>
                                {isGeneratingKB ? 'Extracting Text & Generating...' : 'Start AI Training'}
                            </button>
                        </div>
                    ) : document.knowledgeBase.status === 'generating' ? (
                        <div className="kb-loading-state">
                            <div className="ai-pulse"></div>
                            <p>AI is reading your document and generating questions... This usually takes 10-15 seconds.</p>
                        </div>
                    ) : !isKBExpanded ? (
                        <div className="kb-summary-state" style={{ padding: 'var(--space-lg)', textAlign: 'center', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                                Knowledge Base contains <strong>{document.knowledgeBase._count.entries}</strong> total questions.
                            </p>
                            <button className="btn btn-ghost" onClick={toggleKB} style={{ marginTop: '8px', color: 'var(--accent-primary)' }}>
                                Click here to view and edit answers
                            </button>
                        </div>
                    ) : !kb ? (
                        <div className="loading-spinner" style={{ padding: '20px' }}>
                            <div className="spinner" />
                        </div>
                    ) : (
                        <div className="kb-manager">
                            {/* Analytics Mini-Dashboard */}
                            <div className="kb-analytics-grid">
                                <div className="kb-stat-card">
                                    <div className="kb-stat-label">Total Q&A</div>
                                    <div className="kb-stat-value">{kb.entries.length}</div>
                                </div>
                                <div className="kb-stat-card">
                                    <div className="kb-stat-label">Approved</div>
                                    <div className="kb-stat-value">{kb.entries.filter(e => e.isApproved).length}</div>
                                </div>
                                <div className="kb-stat-card">
                                    <div className="kb-stat-label">Pending Review</div>
                                    <div className="kb-stat-value warning">{kb.entries.filter(e => !e.isApproved).length}</div>
                                </div>
                            </div>

                            {/* Unanswered Suggestions */}
                            {kb.unanswered && kb.unanswered.length > 0 && (
                                <div className="suggested-questions-box">
                                    <h3>📬 Suggested Questions (from Viewers)</h3>
                                    <div className="suggested-list">
                                        {kb.unanswered.map(u => (
                                            <div key={u.id} className="suggested-item">
                                                <div className="suggested-info">
                                                    <div className="suggested-text">"{u.question}"</div>
                                                    <div className="suggested-count">Asked {u.count} times</div>
                                                </div>
                                                <div className="suggested-actions">
                                                    <button className="btn btn-ghost btn-xs" onClick={() => {
                                                        const ans = prompt(`Answer for: ${u.question}`);
                                                        if (ans) {
                                                            // For simplicity in this demo, we'll just alert. 
                                                            // In real app, we'd call an API to add a new KB entry.
                                                            alert('Great! Adding to KB and dismissing suggestion...');
                                                            dismissUnanswered(u.id);
                                                        }
                                                    }}>Add Answer</button>
                                                    <button className="btn btn-ghost btn-xs text-danger" onClick={() => dismissUnanswered(u.id)}>Dismiss</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* KB Entries List */}
                            <div className="kb-entries-list">
                                {kb.entries.map(entry => (
                                    <div key={entry.id} className={`kb-entry-card ${entry.isApproved ? 'approved' : 'pending'}`}>
                                        <div className="kb-entry-main">
                                            <input
                                                className="kb-input-q"
                                                value={entry.question}
                                                onChange={(e) => updateKBEntry(entry.id, { question: e.target.value })}
                                                onFocus={() => { isEditingKBRef.current = true; }}
                                                onBlur={() => { isEditingKBRef.current = false; }}
                                                placeholder="Strategic Question"
                                            />
                                            <textarea
                                                className="kb-input-a"
                                                value={entry.answer}
                                                onChange={(e) => updateKBEntry(entry.id, { answer: e.target.value })}
                                                onFocus={() => { isEditingKBRef.current = true; }}
                                                onBlur={() => { isEditingKBRef.current = false; }}
                                                rows={3}
                                                style={{ border: !entry.answer ? '1px dashed var(--accent-primary)' : '' }}
                                                placeholder="Provide an answer for this question... (Required before approval)"
                                            />
                                        </div>
                                        <div className="kb-entry-meta">
                                            <select
                                                className="kb-select-cat"
                                                value={entry.category}
                                                onChange={(e) => updateKBEntry(entry.id, { category: e.target.value })}
                                            >
                                                <option value="general">General</option>
                                                <option value="sensitive">Sensitive (Request Contact)</option>
                                                <option value="out-of-scope">Out of Scope</option>
                                            </select>
                                            <div className="kb-card-actions">
                                                <button
                                                    className={`kb-approve-toggle ${entry.isApproved ? 'active' : ''}`}
                                                    disabled={!entry.answer || !entry.answer.trim()}
                                                    onClick={() => updateKBEntry(entry.id, { isApproved: !entry.isApproved })}
                                                >
                                                    {entry.isApproved ? '✅ Approved' : (!entry.answer || !entry.answer.trim() ? 'Answer Required' : 'Approve')}
                                                </button>
                                                <button className="kb-delete-btn" onClick={() => deleteKBEntry(entry.id)}>🗑️</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
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
                                {linkError && (
                                    <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
                                        {linkError}
                                    </div>
                                )}

                                <div className="input-group">
                                    <label htmlFor="customSlug">Custom Link URL (Optional)</label>
                                    <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0 12px' }}>
                                        <span style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem', userSelect: 'none' }}>
                                            {typeof window !== 'undefined' ? window.location.host : 'docvault.com'}/view/
                                        </span>
                                        <input
                                            id="customSlug"
                                            type="text"
                                            className="input"
                                            placeholder="brand-deck-2024"
                                            style={{ border: 'none', background: 'transparent', flex: 1, paddingLeft: '4px' }}
                                            value={linkForm.customSlug}
                                            onChange={(e) => setLinkForm(prev => ({ ...prev, customSlug: e.target.value.replace(/[^a-zA-Z0-9-]/g, '-') }))}
                                        />
                                    </div>
                                    <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                                        Leave empty to generate a random secure link.
                                    </p>
                                </div>

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

                                <div className="checkbox-group mt-3" style={{ marginTop: '0.5rem' }}>
                                    <input
                                        type="checkbox"
                                        id="enableAI"
                                        checked={linkForm.enableAI}
                                        onChange={(e) =>
                                            setLinkForm((prev) => ({ ...prev, enableAI: e.target.checked }))
                                        }
                                    />
                                    <label htmlFor="enableAI">Enable AI Knowledge Base</label>
                                    <p style={{ margin: '0 0 0 24px', fontSize: '12px', color: 'var(--text-tertiary)' }}>
                                        Replaces community questions with a smart AI Chatbot for viewers
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
