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
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
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
        <div className="max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Upload Document</h1>
                <button 
                    className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2" 
                    onClick={() => router.back()}
                >
                    ← Back
                </button>
            </div>

            <div className="max-w-2xl mx-auto">
                {!file ? (
                    <div
                        className={`border-2 border-dashed rounded-3xl p-16 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center min-h-[320px] ${dragging ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-gray-200 bg-white hover:border-primary/50 hover:bg-gray-50 shadow-sm hover:shadow-md'}`}
                        onClick={() => fileInputRef.current?.click()}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                    >
                        <div className="text-5xl mb-6 opacity-80 group-hover:scale-110 transition-transform">📤</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Drop your PDF here</h3>
                        <p className="text-base text-gray-500">or click to browse files</p>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf"
                            onChange={(e) => handleFile(e.target.files[0])}
                            style={{ display: 'none' }}
                        />
                    </div>
                ) : (
                    <form className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm" onSubmit={handleUpload}>
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl mb-6 border border-gray-100">
                            <div className="text-3xl bg-white p-2 rounded-xl shadow-sm">📄</div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold text-gray-900 truncate">{file.name}</div>
                                <div className="text-xs text-gray-500 mt-1 font-medium">{formatFileSize(file.size)}</div>
                            </div>
                            {!uploading && (
                                <button
                                    type="button"
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    onClick={() => {
                                        setFile(null);
                                        setTitle('');
                                    }}
                                >
                                    ✕
                                </button>
                            )}
                        </div>

                        <div className="mb-6">
                            <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">Document Title</label>
                            <input
                                id="title"
                                type="text"
                                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-gray-900 font-medium"
                                placeholder="Enter document title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                disabled={uploading}
                            />
                        </div>

                        {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm mb-6 border border-red-100 font-medium flex items-center gap-2"><span>⚠️</span> {error}</div>}

                        {uploading && (
                            <div className="mb-6">
                                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary transition-all duration-300 relative overflow-hidden"
                                        style={{ width: `${progress}%` }}
                                    >
                                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                                    </div>
                                </div>
                                <p className="text-center mt-3 text-sm font-medium text-gray-500">
                                    {progress < 100 ? 'Uploading securely...' : 'Upload complete! Redirecting...'}
                                </p>
                            </div>
                        )}

                        {!uploading && (
                            <button type="submit" className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all text-lg mb-2">
                                📤 Upload Document
                            </button>
                        )}
                        <div className="mt-4 flex flex-col items-center justify-center gap-2 text-gray-400 text-xs font-medium">
                            <div className="flex items-center gap-1.5">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                                Secure & Encrypted Document Storage
                            </div>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
