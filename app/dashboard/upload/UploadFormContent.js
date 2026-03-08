'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useWorkspace } from '@/context/WorkspaceContext';

function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

import { pdfjs } from 'react-pdf';
if (typeof window !== 'undefined') {
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

export default function UploadFormContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const folderId = searchParams.get('folderId');
    const { activeWorkspace } = useWorkspace();

    const fileInputRef = useRef(null);
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState('');
    const [pageCount, setPageCount] = useState(1);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState('');
    const [dragging, setDragging] = useState(false);

    const handleFile = async (selectedFile) => {
        if (!selectedFile) return;
        if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
            setError('Only PDF files are supported');
            return;
        }
        setError('');
        setFile(selectedFile);
        if (!title) {
            setTitle(selectedFile.name.replace(/\.pdf$/i, ''));
        }

        // Calculate page count
        try {
            const data = await selectedFile.arrayBuffer();
            const loadingTask = pdfjs.getDocument({ data });
            const pdf = await loadingTask.promise;
            setPageCount(pdf.numPages);
        } catch (err) {
            console.error('Error calculating page count:', err);
            setPageCount(1);
        }
    };

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        handleFile(droppedFile);
    }, []);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setDragging(true);
    }, []);

    const handleDragLeave = useCallback(() => {
        setDragging(false);
    }, []);

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return;

        setUploading(true);
        setProgress(10);
        setError('');

        try {
            setProgress(30);

            const formData = new FormData();
            formData.append('file', file);
            formData.append('title', title);
            formData.append('pageCount', pageCount.toString());
            if (folderId) {
                formData.append('folderId', folderId);
            }
            if (activeWorkspace) {
                formData.append('workspaceId', activeWorkspace);
            }

            setProgress(60);

            const res = await fetch('/api/documents', {
                method: 'POST',
                body: formData,
            });

            setProgress(90);

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Upload failed');
            }

            const doc = await res.json();
            setProgress(100);

            // Redirect to document detail
            setTimeout(() => {
                router.push(`/dashboard/documents/${doc.id}`);
            }, 500);
        } catch (err) {
            setError(err.message);
            setUploading(false);
            setProgress(0);
        }
    };

    return (
        <>
            <div className="dashboard-header">
                <h1>Upload Document</h1>
                <button className="btn btn-secondary" onClick={() => router.back()}>
                    ← Back
                </button>
            </div>

            <div className="upload-area">
                {!file ? (
                    <div
                        className={`upload-dropzone ${dragging ? 'dragging' : ''}`}
                        onClick={() => fileInputRef.current?.click()}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                    >
                        <div className="upload-icon">📤</div>
                        <h3>Drop your PDF here</h3>
                        <p>or click to browse files</p>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf"
                            onChange={(e) => handleFile(e.target.files[0])}
                            style={{ display: 'none' }}
                        />
                    </div>
                ) : (
                    <form className="upload-form" onSubmit={handleUpload}>
                        <div className="upload-file-info">
                            <div className="file-icon">📄</div>
                            <div className="file-details">
                                <div className="file-name">{file.name}</div>
                                <div className="file-size">{formatFileSize(file.size)}</div>
                            </div>
                            {!uploading && (
                                <button
                                    type="button"
                                    className="btn btn-ghost btn-sm"
                                    onClick={() => {
                                        setFile(null);
                                        setTitle('');
                                    }}
                                >
                                    ✕
                                </button>
                            )}
                        </div>

                        <div className="input-group">
                            <label htmlFor="title">Document Title</label>
                            <input
                                id="title"
                                type="text"
                                className="input"
                                placeholder="Enter document title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                disabled={uploading}
                            />
                        </div>

                        {error && <div className="auth-error">{error}</div>}

                        {uploading && (
                            <div className="upload-progress">
                                <div className="progress-bar">
                                    <div
                                        className="progress-fill"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <p style={{ textAlign: 'center', marginTop: 8, color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>
                                    {progress < 100 ? 'Uploading...' : 'Upload complete! Redirecting...'}
                                </p>
                            </div>
                        )}

                        {!uploading && (
                            <button type="submit" className="btn btn-primary btn-lg">
                                📤 Upload Document
                            </button>
                        )}
                        <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--text-tertiary)', fontSize: 'var(--text-xs)' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                            Secure & Encrypted Document Storage
                        </div>
                    </form>
                )}
            </div>
        </>
    );
}
