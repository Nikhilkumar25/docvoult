'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';

const PDFRenderer = dynamic(() => import('./PDFRenderer'), {
    ssr: false,
    loading: () => <div className="loading-spinner"><div className="spinner" /></div>
});

export default function ViewerClient({ initialData }) {
    const { slug } = initialData;

    // Initialize state from server-provided data
    const [state, setState] = useState(initialData.isRestored ? 'viewing' : (initialData.requireEmail || initialData.hasPasscode ? 'gate' : 'loading'));
    const [linkInfo, setLinkInfo] = useState(initialData);
    const [documentData, setDocumentData] = useState(initialData.isRestored ? initialData : null);
    const [error, setError] = useState('');

    // Gate form
    const [email, setEmail] = useState(initialData.viewerEmail || '');
    const [name, setName] = useState(initialData.viewerName || '');
    const [passcode, setPasscode] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // PDF viewer extensions
    const [numPages, setNumPages] = useState(initialData.document?.pageCount || null);
    const [pageNumber, setPageNumber] = useState(1);
    const [pageWidth, setPageWidth] = useState(800);
    const [zoom, setZoom] = useState(0.8);
    const [layoutMode, setLayoutMode] = useState('paged');
    const [isQuestionsOpen, setIsQuestionsOpen] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [newQuestion, setNewQuestion] = useState('');
    const [askerEmail, setAskerEmail] = useState('');
    const [viewId, setViewId] = useState(initialData.viewId || null);
    const [rotate, setRotate] = useState(0);

    const canvasRef = useRef(null);
    const pageStartTime = useRef(Date.now());
    const totalStartTime = useRef(Date.now());
    const trackingInterval = useRef(null);

    // Immediate access if possible
    useEffect(() => {
        if (!initialData.isRestored && !initialData.requireEmail && !initialData.hasPasscode) {
            accessDocument({});
        }
    }, [initialData]);

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
                    askerEmail: askerEmail || email,
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
        if (!viewId) return;
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

    const toggleFullscreen = () => {
        if (!canvasRef.current) return;
        if (!document.fullscreenElement) {
            canvasRef.current.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

    // Resizing
    useEffect(() => {
        const handleResize = () => setPageWidth(window.innerWidth);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Intersection Observer for scroll
    const pageRefs = useRef({});
    useEffect(() => {
        if (layoutMode !== 'scroll' || state !== 'viewing' || !numPages) return;
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const page = parseInt(entry.target.getAttribute('data-page'));
                    if (page !== pageNumber) {
                        setPageNumber(page);
                        pageStartTime.current = Date.now();
                    }
                }
            });
        }, { threshold: 0.5 });

        Object.values(pageRefs.current).forEach(ref => ref && observer.observe(ref));
        return () => observer.disconnect();
    }, [layoutMode, state, numPages, pageNumber]);

    if (state === 'loading') {
        return <div className="loading-spinner"><div className="spinner" /></div>;
    }

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
                                <input id="gate-passcode" type="password" className="input" value={passcode} onChange={(e) => setPasscode(e.target.value)} required />
                            </div>
                        )}
                        <button type="submit" className="btn btn-primary btn-lg" disabled={submitting} style={{ width: '100%', marginTop: '8px' }}>
                            {submitting ? 'Authenticating...' : 'View Document'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="viewer-container">
            <div className="viewer-toolbar desktop-only">
                <div className="viewer-toolbar-left">
                    <div className="viewer-title">{documentData?.document?.title}</div>
                </div>

                <div className="viewer-actions">
                    <div className="btn-group">
                        <button className={`viewer-action-btn ${layoutMode === 'paged' ? 'active' : ''}`} onClick={() => setLayoutMode('paged')}>Paged</button>
                        <button className={`viewer-action-btn ${layoutMode === 'scroll' ? 'active' : ''}`} onClick={() => setLayoutMode('scroll')}>Scroll</button>
                    </div>
                    <div className="zoom-controls">
                        <button className="viewer-action-btn" onClick={() => setZoom(prev => Math.max(0.3, prev - 0.1))}>−</button>
                        <span className="zoom-level">{Math.round(zoom * 100)}%</span>
                        <button className="viewer-action-btn" onClick={() => setZoom(prev => Math.min(2, prev + 0.1))}>+</button>
                    </div>
                    <button className="viewer-action-btn" onClick={() => setRotate(prev => (prev + 90) % 360)}>Rotate</button>
                    <button className="viewer-action-btn" onClick={toggleFullscreen}>Present</button>
                    <button className={`viewer-action-btn ${isQuestionsOpen ? 'active' : ''}`} onClick={() => setIsQuestionsOpen(!isQuestionsOpen)}>
                        Questions {questions.length > 0 && <span className="comment-count-badge">{questions.length}</span>}
                    </button>
                </div>

                <div className="viewer-toolbar-right">
                    <span className="page-indicator">Page {pageNumber} of {numPages || '?'}</span>
                    {documentData?.allowDownload && <a href={documentData.document.fileUrl} download className="btn btn-primary btn-sm">Download</a>}
                </div>
            </div>

            <div className="viewer-content">
                {layoutMode === 'paged' && (
                    <button className="floating-nav left" onClick={() => goToPage(pageNumber - 1)} disabled={pageNumber <= 1}>‹</button>
                )}

                <div ref={canvasRef} className={`viewer-canvas ${layoutMode === 'scroll' ? 'scroll-mode' : ''}`}>
                    <PDFRenderer
                        file={`/api/view/${slug}/file?viewId=${viewId || ''}`}
                        pageNumber={pageNumber}
                        pageWidth={pageWidth}
                        zoom={zoom}
                        layoutMode={layoutMode}
                        onDocumentLoadSuccess={onDocumentLoadSuccess}
                        numPages={numPages}
                        pageRefs={pageRefs}
                        email={email}
                        requireWatermark={linkInfo?.requireWatermark}
                        rotate={rotate}
                    />
                </div>

                {layoutMode === 'paged' && (
                    <button className="floating-nav right" onClick={() => goToPage(pageNumber + 1)} disabled={pageNumber >= (numPages || 1)}>›</button>
                )}

                {isQuestionsOpen && (
                    <div className="viewer-comments-sidebar">
                        <div className="comments-header">
                            <h3>Questions</h3>
                            <button className="close-btn" onClick={() => setIsQuestionsOpen(false)}>×</button>
                        </div>
                        <div className="comments-list">
                            {questions.map(q => (
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
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <form className="comment-form" onSubmit={handleQuestionSubmit}>
                            <textarea className="input" placeholder="Ask a question..." value={newQuestion} onChange={(e) => setNewQuestion(e.target.value)} rows={3} />
                            <button type="submit" className="btn btn-primary btn-sm" style={{ width: '100%', marginTop: 8 }}>Ask Question</button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
