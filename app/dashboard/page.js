'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import FolderCard from '@/components/FolderCard';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useData } from '@/lib/hooks/useData';

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
    const [currentFolderId, setCurrentFolderId] = useState(null);
    const [currentFolder, setCurrentFolder] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const router = useRouter();
    const { activeWorkspace, getActiveWorkspaceData } = useWorkspace();

    const wsParam = activeWorkspace ? `&workspaceId=${activeWorkspace}` : '';
    const folderUrl = currentFolderId ? `/api/folders?parentId=${currentFolderId}${wsParam}` : `/api/folders?x=1${wsParam}`;
    const docUrl = currentFolderId ? `/api/documents?folderId=${currentFolderId}${wsParam}` : `/api/documents?x=1${wsParam}`;

    const { data: folders = [], isLoading: foldersLoading, mutate: mutateFolders } = useData(folderUrl);
    const { data: documents = [], isLoading: docsLoading, mutate: mutateDocs } = useData(docUrl);
    
    const loading = (foldersLoading || docsLoading) && (!folders.length && !documents.length);

    useEffect(() => {
        if (currentFolderId) {
            fetchCurrentFolder();
        } else {
            setCurrentFolder(null);
        }
    }, [currentFolderId, activeWorkspace]);

    const fetchCurrentFolder = async () => {
        try {
            const res = await fetch(`/api/folders/${currentFolderId}`);
            if (res.ok) {
                setCurrentFolder(await res.json());
            }
        } catch (err) {
            console.error('Error fetching current folder:', err);
        }
    };

    const fetchContent = () => {
        mutateFolders();
        mutateDocs();
    };

    const handleCreateFolder = async (e) => {
        e.preventDefault();
        if (!newFolderName.trim()) return;

        try {
            const res = await fetch('/api/folders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newFolderName,
                    parentId: currentFolderId || null,
                    workspaceId: activeWorkspace || null,
                })
            });

            if (res.ok) {
                setIsCreateModalOpen(false);
                setNewFolderName('');
                fetchContent();
            }
        } catch (err) {
            console.error('Error creating folder:', err);
        }
    };

    const handleDeleteFolder = async (folderId) => {
        try {
            const res = await fetch(`/api/folders/${folderId}`, { method: 'DELETE' });
            if (res.ok) fetchContent();
        } catch (err) {
            console.error('Error deleting folder:', err);
        }
    };

    const handleDeleteDoc = async (e, docId) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this document? This cannot be undone.')) return;

        try {
            const res = await fetch(`/api/documents/${docId}`, { method: 'DELETE' });
            if (res.ok) {
                mutateDocs();
            }
        } catch (err) {
            console.error('Error deleting document:', err);
        }
    };

    return (
        <>
            <div className="dashboard-header">
                <div>
                    <h1>
                        {currentFolder ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <button
                                    onClick={() => setCurrentFolderId(currentFolder.parentId || null)}
                                    className="btn btn-secondary btn-sm"
                                    style={{ padding: '4px 8px' }}
                                >
                                    ← Back
                                </button>
                                {currentFolder.name}
                            </span>
                        ) : (
                            <span>
                                {getActiveWorkspaceData()?.name || 'Your Documents'}
                            </span>
                        )}
                    </h1>
                </div>
                <div className="header-actions">
                    <button
                        className="btn btn-secondary"
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        📁 New Folder
                    </button>
                    <Link href={`/dashboard/upload${currentFolderId ? '?folderId=' + currentFolderId : ''}`} className="btn btn-primary">
                        📤 Upload PDF
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
            ) : folders.length === 0 && documents.length === 0 ? (
                <div className="documents-grid" style={{ gridColumn: '1 / -1' }}>
                    <div className="empty-state">
                        <div className="empty-icon">📂</div>
                        <h3>This folder is empty</h3>
                        <p>Create a subfolder or upload a document to get started.</p>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'center' }}>
                            <button className="btn btn-secondary" onClick={() => setIsCreateModalOpen(true)}>
                                📁 New Folder
                            </button>
                            <Link href={`/dashboard/upload${currentFolderId ? '?folderId=' + currentFolderId : ''}`} className="btn btn-primary">
                                📤 Upload PDF
                            </Link>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    {folders.length > 0 && (
                        <div style={{ marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Folders</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                                {folders.map((folder) => (
                                    <FolderCard
                                        key={folder.id}
                                        folder={folder}
                                        onClick={(id) => setCurrentFolderId(id)}
                                        onDelete={handleDeleteFolder}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {documents.length > 0 && (
                        <div>
                            <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Files</h2>
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
                                                onClick={(e) => handleDeleteDoc(e, doc.id)}
                                            >
                                                🗑
                                            </button>
                                        </div>
                                        <h3>{doc.title}</h3>
                                        <div className="doc-filename" style={{ marginTop: '0.5rem' }}>
                                            {doc.fileName} • {formatFileSize(doc.fileSize)}
                                        </div>
                                        <div className="doc-card-stats" style={{ marginTop: '1rem' }}>
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
                        </div>
                    )}
                </>
            )}

            {isCreateModalOpen && (
                <div className="modal-backdrop">
                    <div className="modal-content">
                        <h2>Create New Folder</h2>
                        <form onSubmit={handleCreateFolder}>
                            <div className="form-group" style={{ margin: '1.5rem 0' }}>
                                <label>Folder Name</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={newFolderName}
                                    onChange={(e) => setNewFolderName(e.target.value)}
                                    placeholder="e.g. Q3 Board Meeting"
                                    autoFocus
                                    required
                                />
                            </div>
                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setIsCreateModalOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={!newFolderName.trim()}>
                                    Create Folder
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
