'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

function timeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return formatDate(date);
}

export default function DashboardPage() {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            const res = await fetch('/api/documents');
            if (res.ok) {
                const data = await res.json();
                setDocuments(data);
            }
        } catch (err) {
            console.error('Error fetching documents:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (e, docId) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this document? This cannot be undone.')) return;

        try {
            const res = await fetch(`/api/documents/${docId}`, { method: 'DELETE' });
            if (res.ok) {
                setDocuments((prev) => prev.filter((d) => d.id !== docId));
            }
        } catch (err) {
            console.error('Error deleting document:', err);
        }
    };

    return (
        <>
            <div className="dashboard-header">
                <h1>Your Documents</h1>
                <div className="header-actions">
                    <Link href="/dashboard/upload" className="btn btn-primary">
                        📤 Upload Document
                    </Link>
                </div>
            </div>

            {loading ? (
                <div className="documents-grid">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="doc-card">
                            <div className="skeleton" style={{ height: 48, width: 48, marginBottom: 16 }} />
                            <div className="skeleton" style={{ height: 20, width: '70%', marginBottom: 8 }} />
                            <div className="skeleton" style={{ height: 14, width: '50%', marginBottom: 16 }} />
                            <div className="skeleton" style={{ height: 40, width: '100%' }} />
                        </div>
                    ))}
                </div>
            ) : documents.length === 0 ? (
                <div className="documents-grid">
                    <div className="empty-state">
                        <div className="empty-icon">📄</div>
                        <h3>No documents yet</h3>
                        <p>Upload your first PDF to start sharing with analytics tracking.</p>
                        <Link href="/dashboard/upload" className="btn btn-primary">
                            📤 Upload Your First Document
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="documents-grid">
                    {documents.map((doc) => (
                        <div
                            key={doc.id}
                            className="doc-card"
                            onClick={() => router.push(`/dashboard/documents/${doc.id}`)}
                        >
                            <div className="doc-card-header">
                                <div className="doc-card-icon">📄</div>
                                <button
                                    className="btn btn-danger btn-sm"
                                    onClick={(e) => handleDelete(e, doc.id)}
                                >
                                    🗑
                                </button>
                            </div>
                            <h3>{doc.title}</h3>
                            <div className="doc-filename">
                                {doc.fileName} • {formatFileSize(doc.fileSize)} • {doc.pageCount} pages
                            </div>
                            <div className="doc-card-stats">
                                <div className="doc-stat">
                                    <span className="stat-value">{doc.totalViews}</span>
                                    <span className="stat-label">Views</span>
                                </div>
                                <div className="doc-stat">
                                    <span className="stat-value">{doc.totalLinks}</span>
                                    <span className="stat-label">Links</span>
                                </div>
                                <div className="doc-stat">
                                    <span className="stat-value">
                                        {doc.lastViewedAt ? timeAgo(doc.lastViewedAt) : '—'}
                                    </span>
                                    <span className="stat-label">Last View</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}
