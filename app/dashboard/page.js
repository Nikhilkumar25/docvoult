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
    
    const loading = (foldersLoading || docsLoading) && (!folders?.length && !documents?.length);

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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {currentFolder ? (
                            <span className="flex items-center gap-3">
                                <button
                                    onClick={() => setCurrentFolderId(currentFolder.parentId || null)}
                                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors flex items-center gap-1"
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
                <div className="flex items-center gap-3">
                    <button
                        className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2"
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        📁 New Folder
                    </button>
                    <Link href={`/dashboard/upload${currentFolderId ? '?folderId=' + currentFolderId : ''}`} className="px-4 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-2 no-underline">
                        📤 Upload PDF
                    </Link>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm animate-pulse">
                            <div className="h-12 w-12 bg-gray-200 rounded-xl mb-4" />
                            <div className="h-5 w-3/4 bg-gray-200 rounded mb-2" />
                            <div className="h-3 w-1/2 bg-gray-200 rounded mb-4" />
                            <div className="h-10 w-full bg-gray-200 rounded" />
                        </div>
                    ))}
                </div>
            ) : (folders?.length === 0 && documents?.length === 0) ? (
                <div className="col-span-full">
                    <div className="flex flex-col items-center justify-center text-center p-16 bg-white border border-gray-100 rounded-2xl border-dashed">
                        <div className="text-6xl mb-4 opacity-50">📂</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">This folder is empty</h3>
                        <p className="text-sm text-gray-500 max-w-sm mb-8">Create a subfolder or upload a document to get started.</p>
                        <div className="flex flex-wrap gap-4 justify-center">
                            <button className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2" onClick={() => setIsCreateModalOpen(true)}>
                                📁 New Folder
                            </button>
                            <Link href={`/dashboard/upload${currentFolderId ? '?folderId=' + currentFolderId : ''}`} className="px-5 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-2 no-underline">
                                📤 Upload PDF
                            </Link>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    {folders?.length > 0 && (
                        <div className="mb-10">
                            <h2 className="text-lg font-semibold mb-4 text-gray-500 px-1">Folders</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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

                    {documents?.length > 0 && (
                        <div>
                            <h2 className="text-lg font-semibold mb-4 text-gray-500 px-1">Files</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {documents.map((doc) => (
                                    <div
                                        key={doc.id}
                                        className="group relative bg-white border border-gray-100 rounded-2xl p-6 transition-all duration-300 cursor-pointer overflow-hidden hover:-translate-y-1 hover:border-primary/30 hover:shadow-premium-hover shadow-sm"
                                        onClick={() => router.push(`/dashboard/documents/${doc.id}`)}
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-primary text-xl group-hover:scale-110 transition-transform duration-300">📄</div>
                                            {doc.isOwner && (
                                                <button
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                                    onClick={(e) => handleDeleteDoc(e, doc.id)}
                                                    title="Delete File"
                                                >
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M3 6h18" strokeLinecap="round" strokeLinejoin="round" />
                                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                        <h3 className="text-base font-semibold text-gray-900 mb-1 truncate flex items-center gap-2">
                                            {doc.title}
                                            {doc.isSignatureRequired && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 uppercase tracking-wider">
                                                    ✍️ Sign Required
                                                </span>
                                            )}
                                        </h3>
                                        <div className="text-xs text-gray-500 mb-6 truncate">
                                            {doc.fileName} • {formatFileSize(doc.fileSize)}
                                        </div>
                                        {doc.isOwner && (
                                            <div className="flex gap-6 pt-4 border-t border-gray-100 mt-auto">
                                                <div className="flex flex-col">
                                                    <span className="text-lg font-bold text-gray-900">{doc.totalViews}</span>
                                                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Views</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-lg font-bold text-gray-900">{doc.totalLinks}</span>
                                                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Links</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-lg font-bold text-gray-900">
                                                        {doc.lastViewedAt ? timeAgo(doc.lastViewedAt) : '—'}
                                                    </span>
                                                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Last View</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}

            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[3000] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-5 border-b border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-900">Create New Folder</h2>
                        </div>
                        <form onSubmit={handleCreateFolder} className="p-6">
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Folder Name</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-gray-900"
                                    value={newFolderName}
                                    onChange={(e) => setNewFolderName(e.target.value)}
                                    placeholder="e.g. Q3 Board Meeting"
                                    autoFocus
                                    required
                                />
                            </div>
                            <div className="flex items-center gap-3 pt-4">
                                <button
                                    type="button"
                                    className="flex-1 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                                    onClick={() => setIsCreateModalOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="flex-1 px-4 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed" 
                                    disabled={!newFolderName.trim()}
                                >
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
