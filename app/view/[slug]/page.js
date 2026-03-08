'use client';

import { useState, useEffect, useRef, useCallback, use } from 'react';
import dynamic from 'next/dynamic';

const PDFRenderer = dynamic(() => import('./PDFRenderer'), {
    ssr: false,
    loading: () => <div className="loading-spinner"><div className="spinner" /></div>
});

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

    // PDF viewer extensions
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [pageWidth, setPageWidth] = useState(800);
    const [zoom, setZoom] = useState(0.8); // Default to 80%
    const [layoutMode, setLayoutMode] = useState('paged'); // paged, scroll
    const [isQuestionsOpen, setIsQuestionsOpen] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [newQuestion, setNewQuestion] = useState('');
    const [askerEmail, setAskerEmail] = useState('');
    const [viewId, setViewId] = useState(null);
    const [rotate, setRotate] = useState(0);

    const canvasRef = useRef(null);
    const pageStartTime = useRef(Date.now());
    const totalStartTime = useRef(Date.now());
    const trackingInterval = useRef(null);

    // Check for existing session on mount
    useEffect(() => {
        validateLink();
    }, [slug]);

    // Fetch questions if link is valid
    useEffect(() => {
        if (state === 'viewing' && (viewId || linkInfo?.userId)) {
            fetchQuestions();
        }
    }, [state, slug, viewId]);

    const fetchQuestions = async () => {
        try {
            const query = viewId ? `?viewId=${viewId}` : '';
            const res = await fetch(`/api/view/${slug}/comments${query}`);
            if (res.ok) {
                const data = await res.json();
                setQuestions(data);
            }
        } catch (err) {
            console.error('Failed to fetch questions');
        }
    };

    const handleQuestionSubmit = async (e) => {
        e.preventDefault();
        if (!newQuestion.trim()) return;

        try {
            const res = await fetch(`/api/view/${slug}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: newQuestion,
                    userName: name || email || 'Anonymous',
                    askerEmail: askerEmail || email, // Prioritize gate email if provided
                    pageNumber: pageNumber,
                    viewId
                }),
            });

            if (res.ok) {
                const question = await res.json();
                setQuestions([question, ...questions]);
                setNewQuestion('');
                setError('');
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to post question');
            }
        } catch (err) {
            console.error('Failed to post question');
            setError('Connection error. Please try again.');
        }
    };

    const toggleFullscreen = () => {
        if (!canvasRef.current) return;
        if (!document.fullscreenElement) {
            canvasRef.current.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    // Handle resize
    useEffect(() => {
        const handleResize = () => {
            setPageWidth(window.innerWidth);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Track page changes
    useEffect(() => {
        if (state !== 'viewing' || !viewId || layoutMode === 'scroll') return;

        pageStartTime.current = Date.now();

        return () => {
            const duration = Math.round((Date.now() - pageStartTime.current) / 1000);
            const totalDuration = Math.round((Date.now() - totalStartTime.current) / 1000);
            if (duration > 0) {
                trackPageView(pageNumber, duration, totalDuration);
            }
        };
    }, [pageNumber, state, viewId, layoutMode]);

    // Intersection Observer for scroll tracking
    const observer = useRef(null);
    const pageRefs = useRef({});

    useEffect(() => {
        if (layoutMode !== 'scroll' || state !== 'viewing' || !numPages) return;

        observer.current = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const page = parseInt(entry.target.getAttribute('data-page'));
                    if (page !== pageNumber) {
                        // Track time spent on the previous page before switching
                        const duration = Math.round((Date.now() - pageStartTime.current) / 1000);
                        const totalDuration = Math.round((Date.now() - totalStartTime.current) / 1000);
                        if (duration > 0) {
                            trackPageView(pageNumber, duration, totalDuration);
                        }

                        setPageNumber(page);
                        pageStartTime.current = Date.now();
                    }
                }
            });
        }, { threshold: 0.5 });

        // Observe all pages
        Object.values(pageRefs.current).forEach(ref => {
            if (ref) observer.current.observe(ref);
        });

        return () => {
            if (observer.current) observer.current.disconnect();
        };
    }, [layoutMode, state, numPages, pageNumber]);

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
                    pageNumber: pageNumber,
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
            const savedViewId = sessionStorage.getItem(`viewId_${slug}`);
            // Check if it's literally the string "null"
            const query = (savedViewId && savedViewId !== 'null') ? `?viewId=${savedViewId}` : '';
            const res = await fetch(`/api/view/${slug}${query}`);
            if (!res.ok) {
                const data = await res.json();
                setError(data.error || 'This link is not available');
                setState('error');
                return;
            }
            const data = await res.json();
            setLinkInfo(data);

            if (data.isRestored) {
                setDocumentData(data);
                setViewId(data.viewId);
                setEmail(data.viewerEmail || '');
                setName(data.viewerName || '');
                setState('viewing');
                return;
            }

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
            sessionStorage.setItem(`viewId_${slug}`, data.viewId);
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

                        <button type="submit" className="btn btn-primary btn-lg" disabled={submitting} style={{ width: '100%', marginTop: '8px' }}>
                            {submitting ? 'Authenticating...' : 'View Document'}
                        </button>
                    </form>

                    <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--success)', fontSize: 'var(--text-xs)', fontWeight: 500 }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                            End-to-End Encrypted Link
                        </div>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', margin: 0 }}>
                            Powered by DocVault
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Viewing state
    return (
        <div className="viewer-container">
            {/* Mobile Header Overlays */}
            <div className="mobile-only mobile-overlay-info">
                <div className="overlay-badge">
                    {pageNumber} / {numPages || '?'}
                </div>
                <div className="overlay-badge" onClick={() => setLayoutMode(prev => prev === 'paged' ? 'scroll' : 'paged')}>
                    {layoutMode === 'paged' ? 'Paged' : 'Scroll'}
                </div>
            </div>

            {/* Desktop Toolbar */}
            <div className="viewer-toolbar desktop-only">
                <div className="viewer-toolbar-left">
                    <div className="viewer-title">{documentData?.document?.title}</div>
                </div>

                <div className="viewer-actions">
                    <div className="btn-group">
                        <button
                            className={`viewer-action-btn ${layoutMode === 'paged' ? 'active' : ''}`}
                            onClick={() => setLayoutMode('paged')}
                            title="Single Page"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                            <span>Paged</span>
                        </button>
                        <button
                            className={`viewer-action-btn ${layoutMode === 'scroll' ? 'active' : ''}`}
                            onClick={() => setLayoutMode('scroll')}
                            title="Scrolling View"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21a9 9 0 0 0 9-9V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v7a9 9 0 0 0 9 9z"></path></svg>
                            <span>Scroll</span>
                        </button>
                    </div>

                    <div className="divider" />

                    <div className="zoom-controls">
                        <button className="viewer-action-btn" onClick={() => setZoom(prev => Math.max(0.3, prev - 0.1))} title="Zoom Out">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
                        </button>
                        <span className="zoom-level">{Math.round(zoom * 100)}%</span>
                        <button className="viewer-action-btn" onClick={() => setZoom(prev => Math.min(2, prev + 0.1))} title="Zoom In">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
                        </button>
                    </div>

                    <div className="divider" />

                    <button className="viewer-action-btn" onClick={() => setRotate(prev => (prev + 90) % 360)} title="Rotate">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6"></path><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
                        <span>Rotate</span>
                    </button>

                    <button className="viewer-action-btn" onClick={toggleFullscreen} title="Present">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>
                        <span>Present</span>
                    </button>

                    <button
                        className={`viewer-action-btn ${isQuestionsOpen ? 'active' : ''}`}
                        onClick={() => setIsQuestionsOpen(!isQuestionsOpen)}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                        <span>Questions</span>
                        {questions.length > 0 && <span className="comment-count-badge">{questions.length}</span>}
                    </button>
                </div>

                <div className="viewer-toolbar-right">
                    <span className="page-indicator desktop-only" style={{ marginRight: '1rem', color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>
                        Page {pageNumber} of {numPages || '?'}
                    </span>
                    {documentData?.allowDownload && (
                        <a
                            href={documentData.document.fileUrl}
                            download={documentData.document.fileName}
                            className="btn btn-primary btn-sm"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Download
                        </a>
                    )}
                </div>
            </div>

            {/* Mobile Toolbar (Simplified) */}
            <div className="viewer-toolbar mobile-only">
                <button className="btn btn-secondary btn-sm" onClick={() => setRotate(prev => (prev + 90) % 360)}>
                    🔄
                </button>
                <div className="btn-group">
                    <button className="btn btn-secondary btn-sm" onClick={() => setZoom(prev => Math.max(0.3, prev - 0.1))}>−</button>
                    <span className="zoom-level" style={{ padding: '0 8px' }}>{Math.round(zoom * 100)}%</span>
                    <button className="btn btn-secondary btn-sm" onClick={() => setZoom(prev => Math.min(2, prev + 0.1))}>+</button>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={toggleFullscreen}>
                    ⛶
                </button>
            </div>

            <div className="viewer-content">
                {layoutMode === 'paged' && (
                    <button
                        className="floating-nav left"
                        onClick={() => goToPage(pageNumber - 1)}
                        disabled={pageNumber <= 1}
                        title="Previous Page"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    </button>
                )}

                <div
                    ref={canvasRef}
                    className={`viewer-canvas ${layoutMode === 'scroll' ? 'scroll-mode' : ''}`}
                    style={{ position: 'relative' }}
                >
                    <PDFRenderer
                        file={documentData?.document?.fileUrl}
                        pageNumber={pageNumber}
                        pageWidth={pageWidth}
                        zoom={zoom}
                        layoutMode={layoutMode}
                        onDocumentLoadSuccess={onDocumentLoadSuccess}
                        numPages={numPages}
                        pageRefs={pageRefs}
                        email={linkInfo?.requireEmail ? email : linkInfo?.viewerEmail}
                        requireWatermark={linkInfo?.requireWatermark}
                        rotate={rotate}
                    />
                </div>

                {layoutMode === 'paged' && (
                    <button
                        className="floating-nav right"
                        onClick={() => goToPage(pageNumber + 1)}
                        disabled={pageNumber >= (numPages || 1)}
                        title="Next Page"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </button>
                )}

                {isQuestionsOpen && (
                    <div className="viewer-comments-sidebar">
                        <div className="comments-header">
                            <h3>Questions</h3>
                            <button className="close-btn" onClick={() => setIsQuestionsOpen(false)}>×</button>
                        </div>

                        <div className="comments-list">
                            {questions.length === 0 ? (
                                <div className="empty-comments">No questions yet. Ask anything about this page.</div>
                            ) : (
                                questions.map(q => (
                                    <div key={q.id} className="comment-item">
                                        <div className="comment-meta">
                                            <span className="comment-user">{q.userName}</span>
                                            {q.pageNumber && <span className="comment-page">Page {q.pageNumber}</span>}
                                        </div>
                                        <div className="comment-text">{q.text}</div>

                                        {q.response && (
                                            <div className="creator-response">
                                                <div className="response-header">Creator Answered:</div>
                                                <div className="response-text">{q.response}</div>
                                                <div className="comment-date">{new Date(q.responseAt).toLocaleString()}</div>
                                            </div>
                                        )}

                                        {!q.response && <div className="comment-date">{new Date(q.createdAt).toLocaleString()}</div>}
                                    </div>
                                ))
                            )}
                        </div>

                        <form className="comment-form" onSubmit={handleQuestionSubmit}>
                            {!email && (
                                <input
                                    type="email"
                                    className="input"
                                    placeholder="Your email (for replies)"
                                    value={askerEmail}
                                    onChange={(e) => setAskerEmail(e.target.value)}
                                    style={{ marginBottom: 8 }}
                                />
                            )}
                            <textarea
                                className="input"
                                placeholder="Ask a question..."
                                value={newQuestion}
                                onChange={(e) => setNewQuestion(e.target.value)}
                                rows={3}
                            />
                            <button type="submit" className="btn btn-primary btn-sm" style={{ width: '100%', marginTop: 8 }}>
                                Ask Question
                            </button>
                            {error && (
                                <p style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '8px', textAlign: 'center' }}>
                                    {error}
                                </p>
                            )}
                            <p style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginTop: 8, textAlign: 'center' }}>
                                Your question is visible only to you and the document owner.
                            </p>
                        </form>
                    </div>
                )}
            </div>
            {/* Mobile Question FAB */}
            <button
                className="mobile-only question-fab"
                onClick={() => setIsQuestionsOpen(true)}
                style={{
                    position: 'fixed',
                    bottom: '80px', // Raised to prevent overlap with bottom toolbar
                    right: '20px',
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    background: 'var(--accent-primary)',
                    color: 'white',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    zIndex: 100,
                    display: isQuestionsOpen ? 'none' : 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px'
                }}
            >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            </button>
        </div>
    );
}
