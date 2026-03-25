'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import AIChatPanel from './AIChatPanel';
import SignaturePad from '@/components/SignaturePad';

const PDFRenderer = dynamic(() => import('./PDFRenderer'), {
    ssr: false,
    loading: () => <div className="loading-spinner"><div className="spinner" /></div>
});

export default function ViewerClient({ initialData, currentUserEmail }) {
    const { slug } = initialData;
    const searchParams = useSearchParams();
    const urlEmail = searchParams.get('email');

    // Initialize state from server-provided data
    const [state, setState] = useState(initialData.isRestored ? 'viewing' : (initialData.requireEmail || initialData.hasPasscode ? 'gate' : 'loading'));
    const [linkInfo, setLinkInfo] = useState(initialData);
    const [documentData, setDocumentData] = useState(initialData.isRestored ? initialData : null);
    const [error, setError] = useState('');

    // Gate form
    const [email, setEmail] = useState(urlEmail || initialData.viewerEmail || currentUserEmail || '');
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
    const [isMobile, setIsMobile] = useState(false);

    // Signature state
    const [signatureRequest, setSignatureRequest] = useState(null);
    const [signatureFields, setSignatureFields] = useState([]);
    const [signatureDataState, setSignatureDataState] = useState(null);
    const [activeAffirmField, setActiveAffirmField] = useState(null);
    const [isAffirming, setIsAffirming] = useState(false);
    const [showSignaturePad, setShowSignaturePad] = useState(false);
    const [isSigned, setIsSigned] = useState(false);

    const canvasRef = useRef(null);
    const pageStartTime = useRef(Date.now());
    const totalStartTime = useRef(Date.now());
    const trackingInterval = useRef(null);

    // Immediate access if possible
    useEffect(() => {
        const effectiveEmail = urlEmail || email || currentUserEmail;
        
        // If we have signature requests in initialData, set the one for the current user
        if (initialData.signatureRequests && effectiveEmail) {
            const targetEmail = effectiveEmail.toLowerCase();
            const pendingRequest = initialData.signatureRequests.find(
                req => req.signerEmail.toLowerCase() === targetEmail && req.status === 'pending'
            );
            if (pendingRequest) {
                setSignatureRequest(pendingRequest);
                setSignatureFields(pendingRequest.fields || []);
            }
        }

        if (urlEmail && !initialData.isRestored && !initialData.hasPasscode) {
             accessDocument({ email: urlEmail, name: name });
        } else if (!initialData.isRestored && !initialData.requireEmail && !initialData.hasPasscode) {
            accessDocument({ email: effectiveEmail });
        } else if (!initialData.isRestored && currentUserEmail && !initialData.hasPasscode) {
            // Bypass gate if they are logged in and no passcode required
            accessDocument({ email: currentUserEmail, name: name });
        }
    }, [initialData, currentUserEmail, urlEmail]);

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
            setLinkInfo(prev => ({ ...prev, ...data }));
            setViewId(data.viewId);
            sessionStorage.setItem(`viewId_${slug}`, data.viewId);
            totalStartTime.current = Date.now();
            pageStartTime.current = Date.now();

            // Check for signature requests
            if (data.signatureRequests && email) {
                const pendingRequest = data.signatureRequests.find(
                    req => req.signerEmail.toLowerCase() === email.toLowerCase() && req.status === 'pending'
                );
                if (pendingRequest) {
                    setSignatureRequest(pendingRequest);
                    setSignatureFields(pendingRequest.fields || []);
                }
            }

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

    const handleSignatureSubmit = async (signatureData) => {
        setSignatureDataState(signatureData);
        setShowSignaturePad(false);
        
        // If they were in the middle of affirming a field, complete it now
        if (activeAffirmField) {
            await affirmField(activeAffirmField.id, signatureData);
            setActiveAffirmField(null);
        } else if (signatureFields.length === 0) {
            // Legacy/No-field mode: old single-signature behavior
            try {
                const res = await fetch(`/api/view/${slug}/sign`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        signatureData,
                        email: email,
                        requestId: signatureRequest.id
                    }),
                });

                if (res.ok) {
                    setIsSigned(true);
                    setSignatureRequest(prev => ({ ...prev, status: 'signed' }));
                    alert('Document signed successfully!');
                } else {
                    const data = await res.json();
                    alert(data.error || 'Failed to submit signature');
                }
            } catch (err) {
                console.error('Signing error:', err);
                alert('Connection error. Please try again.');
            }
        }
    };

    const handleFieldAffirm = async (field) => {
        if (!signatureDataState) {
            setActiveAffirmField(field);
            setShowSignaturePad(true);
            return;
        }
        await affirmField(field.id, signatureDataState);
    };

    const affirmField = async (fieldId, sigData) => {
        setIsAffirming(true);
        try {
            const res = await fetch(`/api/view/${slug}/sign/affirm-field`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fieldId,
                    requestId: signatureRequest.id,
                    signatureData: sigData,
                    email,
                    name
                }),
            });

            const data = await res.json();
            if (res.ok) {
                setSignatureFields(prev => prev.map(f => f.id === fieldId ? { ...f, status: 'affirmed', affirmedAt: new Date() } : f));
                if (data.allAffirmed) {
                    setIsSigned(true);
                    setSignatureRequest(prev => ({ ...prev, status: 'signed' }));
                    alert('All spots signed! Document completed.');
                }
            }
        } catch (err) {
            console.error('Affirmation error:', err);
        } finally {
            setIsAffirming(false);
        }
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

    // Resizing and Mobile Detection
    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            setIsMobile(width <= 768);
            // On mobile, force 100vw. On desktop, keep 800px max or scale.
            setPageWidth(width <= 768 ? width : 800);
        };
        handleResize(); // Safe, runs on client
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

    // --- ENTIRE SEPARATE MOBILE LAYOUT ---
    if (isMobile) {
        return (
            <div className={`viewer-container mobile-view ${state === 'viewing' ? 'active' : ''}`}>
                <div className="mobile-toolbar">
                    <div className="viewer-title">
                        {documentData?.document?.title}
                        {isSigned && <span style={{ marginLeft: '8px', fontSize: '0.7rem', background: 'var(--success)', color: 'white', padding: '2px 6px', borderRadius: '4px' }}>SIGNED</span>}
                    </div>
                    <span className="page-indicator">{pageNumber} / {numPages || '?'}</span>
                </div>

                <div className="viewer-content">
                    <div ref={canvasRef} className="viewer-canvas scroll-mode">
                        <PDFRenderer
                            file={`/api/view/${slug}/file?viewId=${viewId || ''}`}
                            pageNumber={pageNumber}
                            pageWidth={pageWidth}
                            zoom={1.0} // Mobile handles zoom natively or via width
                            layoutMode="scroll" // Force scroll on mobile for natural feel
                            onDocumentLoadSuccess={onDocumentLoadSuccess}
                            numPages={numPages}
                            pageRefs={pageRefs}
                            email={email}
                            name={name}
                            requireWatermark={linkInfo?.requireWatermark}
                            rotate={rotate}
                            signatureFields={signatureFields}
                            onFieldClick={handleFieldAffirm}
                        />
                    </div>
                </div>

                {/* Mobile Bottom Bar */}
                <div className="mobile-bottom-bar">
                    <button className={`mobile-action-btn ${isQuestionsOpen ? 'active' : ''}`} onClick={() => setIsQuestionsOpen(!isQuestionsOpen)}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                        <span>Questions</span>
                        {!linkInfo.enableAI && questions.length > 0 && <span className="badge">{questions.length}</span>}
                    </button>
                    {documentData?.allowDownload && (
                        <a href={documentData.document.fileUrl} download className="mobile-action-btn">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                            <span>Save</span>
                        </a>
                    )}
                </div>

                {/* Mobile Questions Drawer */}
                {isQuestionsOpen && (
                    <div className="mobile-drawer-overlay" onClick={() => setIsQuestionsOpen(false)}>
                        <div className="mobile-drawer" onClick={e => e.stopPropagation()}>
                            <div className="drawer-header">
                                <h3>{linkInfo.enableAI ? 'Questions (AI)' : 'Questions'}</h3>
                                <button className="close-btn" onClick={() => setIsQuestionsOpen(false)}>✕</button>
                            </div>
                            <div className="drawer-body">
                                {linkInfo.enableAI ? (
                                    <AIChatPanel slug={slug} documentTitle={documentData?.document?.title} />
                                ) : (
                                    <>
                                        <div className="comments-list">
                                            {questions.length === 0 ? (
                                                <div className="empty-state">No questions yet. Ask one below!</div>
                                            ) : (
                                                questions.map(q => (
                                                    <div key={q.id} className="comment-item">
                                                        <div className="comment-meta">
                                                            <span className="comment-user">{q.userName}</span>
                                                            {q.pageNumber && <span className="comment-page">P{q.pageNumber}</span>}
                                                        </div>
                                                        <div className="comment-text">{q.text}</div>
                                                        {q.response && (
                                                            <div className="creator-response">
                                                                <div className="response-header">Response:</div>
                                                                <div className="response-text">{q.response}</div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                        <form className="drawer-footer comment-form" onSubmit={handleQuestionSubmit}>
                                            <div style={{ display: 'flex', gap: '8px', zIndex: 1000, background: 'var(--bg-card)' }}>
                                                <input type="text" className="input" placeholder="Ask something..." value={newQuestion} onChange={(e) => setNewQuestion(e.target.value)} />
                                                <button type="submit" className="btn btn-primary btn-sm">Ask</button>
                                            </div>
                                        </form>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // --- DESKTOP LAYOUT ---
    return (
        <div className={`viewer-container ${signatureRequest && signatureRequest.status === 'pending' && !isSigned ? 'has-signature-banner' : ''}`}>
            {/* Signature Banner */}
            {signatureRequest && signatureRequest.status === 'pending' && !isSigned && (
                <div className="signature-banner" style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 2000,
                    background: '#f59e0b',
                    color: 'white',
                    padding: '10px 20px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '20px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.2rem' }}>✍️</span>
                        <span>
                            {signatureFields.length > 0 
                                ? `Please click on the designated areas to sign (${signatureFields.filter(f => f.status === 'affirmed').length} / ${signatureFields.length} completed)`
                                : 'You have a pending signature request for this document.'
                            }
                        </span>
                    </div>
                    {signatureFields.length === 0 && (
                        <button 
                            className="btn" 
                            style={{ 
                                background: 'white', 
                                color: '#f59e0b', 
                                fontWeight: 'bold',
                                padding: '6px 16px',
                                borderRadius: '20px',
                                border: 'none',
                                cursor: 'pointer'
                            }}
                            onClick={() => setShowSignaturePad(true)}
                        >
                            Sign Document
                        </button>
                    )}
                    <style>{`
                        .has-signature-banner .viewer-toolbar { top: 44px !important; }
                        .has-signature-banner .viewer-content { margin-top: 44px !important; }
                        .has-signature-banner .mobile-toolbar { top: 44px !important; }
                        .has-signature-banner .mobile-view .viewer-content { margin-top: 44px !important; }
                    `}</style>
                </div>
            )}

            {/* Signature Pad Modal */}
            {showSignaturePad && (
                <div className="modal-overlay" style={{ zIndex: 3000 }} onClick={() => setShowSignaturePad(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                        <SignaturePad 
                            onSign={handleSignatureSubmit} 
                            onCancel={() => setShowSignaturePad(false)} 
                            signerName={signatureRequest?.signerName || email}
                        />
                    </div>
                </div>
            )}

            <div className="viewer-toolbar desktop-only">
                <div className="viewer-toolbar-left">
                    <div className="viewer-title">
                        {documentData?.document?.title}
                        {isSigned && <span style={{ marginLeft: '12px', fontSize: '0.75rem', background: '#22c55e', color: 'white', padding: '3px 8px', borderRadius: '4px', verticalAlign: 'middle' }}>SIGNED</span>}
                    </div>
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
                        {linkInfo.enableAI ? 'Questions & AI' : `Questions ${questions.length > 0 ? `(${questions.length})` : ''}`}
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
                        name={name}
                        requireWatermark={linkInfo?.requireWatermark}
                        rotate={rotate}
                        signatureFields={signatureFields}
                        onFieldClick={handleFieldAffirm}
                    />
                </div>

                {layoutMode === 'paged' && (
                    <button className="floating-nav right" onClick={() => goToPage(pageNumber + 1)} disabled={pageNumber >= (numPages || 1)}>›</button>
                )}

                {isQuestionsOpen && (
                    <div className="viewer-comments-sidebar">
                        {linkInfo.enableAI ? (
                            <AIChatPanel slug={slug} documentTitle={documentData?.document?.title} />
                        ) : (
                            <>
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
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
