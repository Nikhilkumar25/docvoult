'use client';

import { useState, useEffect, useRef, useCallback, use } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function ViewPage({ params }) {
    const resolvedParams = use(params);
    const slug = resolvedParams.slug;

    const [state, setState] = useState('loading'); // loading, gate, viewing, error
    const [linkInfo, setLinkInfo] = useState(null);
    const [documentData, setDocumentData] = useState(null);
    const [error, setError] = useState('');

    // Gate form
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [passcode, setPasscode] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // PDF viewer
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [viewId, setViewId] = useState(null);
    const [pageWidth, setPageWidth] = useState(800);

    // Tracking
    const pageStartTime = useRef(Date.now());
    const totalStartTime = useRef(Date.now());
    const trackingInterval = useRef(null);

    // Validate link on mount
    useEffect(() => {
        validateLink();
    }, [slug]);

    // Handle resize
    useEffect(() => {
        const handleResize = () => {
            setPageWidth(Math.min(window.innerWidth - 48, 900));
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Track page changes
    useEffect(() => {
        if (state !== 'viewing' || !viewId) return;

        pageStartTime.current = Date.now();

        return () => {
            const duration = Math.round((Date.now() - pageStartTime.current) / 1000);
            const totalDuration = Math.round((Date.now() - totalStartTime.current) / 1000);
            if (duration > 0) {
                trackPageView(pageNumber, duration, totalDuration);
            }
        };
    }, [pageNumber, state, viewId]);

    // Periodic heartbeat tracking
    useEffect(() => {
        if (state !== 'viewing' || !viewId) return;

        trackingInterval.current = setInterval(() => {
            const duration = Math.round((Date.now() - pageStartTime.current) / 1000);
            const totalDuration = Math.round((Date.now() - totalStartTime.current) / 1000);
            trackPageView(pageNumber, duration, totalDuration);
            pageStartTime.current = Date.now();
        }, 10000); // Track every 10 seconds

        return () => {
            if (trackingInterval.current) {
                clearInterval(trackingInterval.current);
            }
        };
    }, [pageNumber, state, viewId]);

    // Track before unload
    useEffect(() => {
        if (state !== 'viewing' || !viewId) return;

        const handleBeforeUnload = () => {
            const duration = Math.round((Date.now() - pageStartTime.current) / 1000);
            const totalDuration = Math.round((Date.now() - totalStartTime.current) / 1000);
            // Use sendBeacon for reliable tracking on page close
            navigator.sendBeacon(
                `/api/view/${slug}/track`,
                JSON.stringify({
                    viewId,
                    pageNumber,
                    duration,
                    totalDuration,
                })
            );
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [pageNumber, state, viewId, slug]);

    const validateLink = async () => {
        try {
            const res = await fetch(`/api/view/${slug}`);
            if (!res.ok) {
                const data = await res.json();
                setError(data.error || 'This link is not available');
                setState('error');
                return;
            }
            const data = await res.json();
            setLinkInfo(data);

            // If no gates required, proceed directly
            if (!data.requireEmail && !data.hasPasscode) {
                await accessDocument({});
            } else {
                setState('gate');
            }
        } catch (err) {
            setError('Failed to load document');
            setState('error');
        }
    };

    const accessDocument = async (formData) => {
        setSubmitting(true);
        try {
            const res = await fetch(`/api/view/${slug}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.error || 'Access denied');
                setSubmitting(false);
                return;
            }

            const data = await res.json();
            setDocumentData(data);
            setViewId(data.viewId);
            totalStartTime.current = Date.now();
            pageStartTime.current = Date.now();
            setState('viewing');
        } catch (err) {
            setError('Failed to access document');
        } finally {
            setSubmitting(false);
        }
    };

    const handleGateSubmit = async (e) => {
        e.preventDefault();
        setError('');
        await accessDocument({ email, name, passcode });
    };

    const trackPageView = useCallback(async (page, duration, totalDuration) => {
        try {
            await fetch(`/api/view/${slug}/track`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    viewId,
                    pageNumber: page,
                    duration,
                    totalDuration,
                }),
            });
        } catch (err) {
            // Silently fail tracking
        }
    }, [slug, viewId]);

    const goToPage = (newPage) => {
        // Track time on current page before navigating
        const duration = Math.round((Date.now() - pageStartTime.current) / 1000);
        const totalDuration = Math.round((Date.now() - totalStartTime.current) / 1000);
        if (duration > 0) {
            trackPageView(pageNumber, duration, totalDuration);
        }
        setPageNumber(newPage);
        pageStartTime.current = Date.now();
    };

    const onDocumentLoadSuccess = ({ numPages: pages }) => {
        setNumPages(pages);
    };

    // Loading state
    if (state === 'loading') {
        return (
            <div className="loading-spinner" style={{ minHeight: '100vh' }}>
                <div className="spinner" />
            </div>
        );
    }

    // Error state
    if (state === 'error') {
        return (
            <div className="error-page">
                <div className="error-content">
                    <div className="error-icon">🚫</div>
                    <h1>Document Unavailable</h1>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    // Gate state (email/passcode required)
    if (state === 'gate') {
        return (
            <div className="viewer-gate">
                <div className="viewer-gate-card">
                    <div className="doc-title">{linkInfo?.document?.title}</div>
                    <div className="doc-subtitle">
                        {linkInfo?.requireEmail && 'Enter your email to view this document'}
                        {linkInfo?.requireEmail && linkInfo?.hasPasscode && ' • '}
                        {linkInfo?.hasPasscode && 'A passcode is required'}
                    </div>

                    {error && <div className="auth-error" style={{ marginBottom: 16 }}>{error}</div>}

                    <form className="gate-form" onSubmit={handleGateSubmit}>
                        {linkInfo?.requireEmail && (
                            <>
                                <div className="input-group">
                                    <label htmlFor="gate-email">Email</label>
                                    <input
                                        id="gate-email"
                                        type="email"
                                        className="input"
                                        placeholder="you@company.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="input-group">
                                    <label htmlFor="gate-name">Name (optional)</label>
                                    <input
                                        id="gate-name"
                                        type="text"
                                        className="input"
                                        placeholder="Your name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                            </>
                        )}

                        {linkInfo?.hasPasscode && (
                            <div className="input-group">
                                <label htmlFor="gate-passcode">Passcode</label>
                                <input
                                    id="gate-passcode"
                                    type="password"
                                    className="input"
                                    placeholder="Enter passcode"
                                    value={passcode}
                                    onChange={(e) => setPasscode(e.target.value)}
                                    required
                                />
                            </div>
                        )}

                        <button type="submit" className="btn btn-primary btn-lg" disabled={submitting} style={{ width: '100%' }}>
                            {submitting ? 'Loading...' : 'View Document'}
                        </button>
                    </form>

                    <p style={{ marginTop: 24, fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                        Powered by DocVault
                    </p>
                </div>
            </div>
        );
    }

    // Viewing state
    return (
        <div className="viewer-container">
            <div className="viewer-toolbar">
                <div className="viewer-title">{documentData?.document?.title}</div>
                <div className="viewer-page-info">
                    <button
                        className="page-nav-btn"
                        onClick={() => goToPage(pageNumber - 1)}
                        disabled={pageNumber <= 1}
                    >
                        ← Prev
                    </button>
                    <span>
                        Page {pageNumber} of {numPages || '...'}
                    </span>
                    <button
                        className="page-nav-btn"
                        onClick={() => goToPage(pageNumber + 1)}
                        disabled={pageNumber >= (numPages || 1)}
                    >
                        Next →
                    </button>
                </div>
                <div>
                    {documentData?.allowDownload && (
                        <a
                            href={documentData.document.fileUrl}
                            download={documentData.document.fileName}
                            className="btn btn-secondary btn-sm"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            📥 Download
                        </a>
                    )}
                </div>
            </div>

            <div className="viewer-canvas">
                <Document
                    file={documentData?.document?.fileUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading={
                        <div className="loading-spinner">
                            <div className="spinner" />
                        </div>
                    }
                >
                    <Page
                        pageNumber={pageNumber}
                        width={pageWidth}
                        loading={
                            <div className="skeleton" style={{ width: pageWidth, height: pageWidth * 1.4 }} />
                        }
                    />
                </Document>
            </div>
        </div>
    );
}
