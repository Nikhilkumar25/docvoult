'use client';

import { useRef, useEffect, useState } from 'react';

export default function SignaturePad({ onSign, onCancel, signerName }) {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasContent, setHasContent] = useState(false);
    const [agreed, setAgreed] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Set display size
        const resize = () => {
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * window.devicePixelRatio;
            canvas.height = rect.height * window.devicePixelRatio;
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
            // Re-apply styles after resize
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2.5;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            if (!hasContent) {
                drawPlaceholder(ctx, rect.width, rect.height);
            }
        };

        window.addEventListener('resize', resize);
        resize();

        return () => window.removeEventListener('resize', resize);
    }, []);

    const drawPlaceholder = (ctx, w, h) => {
        ctx.clearRect(0, 0, w, h);
        ctx.font = '14px Inter, system-ui, sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.textAlign = 'center';
        ctx.fillText('Sign here using mouse or touch', w / 2, h / 2 + 5);
    };

    const startDrawing = (e) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        
        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        const y = (e.clientY || e.touches[0].clientY) - rect.top;

        if (!hasContent) {
            ctx.clearRect(0, 0, rect.width, rect.height);
            setHasContent(true);
        }

        ctx.beginPath();
        ctx.moveTo(x, y);
        setIsDrawing(true);
    };

    const draw = (e) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();

        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        const y = (e.clientY || e.touches[0].clientY) - rect.top;

        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clear = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        drawPlaceholder(ctx, rect.width, rect.height);
        setHasContent(false);
    };

    const handleSign = async () => {
        if (!hasContent) {
            alert('Please provide a signature');
            return;
        }
        if (!agreed) {
            alert('Please agree to the electronic signature terms');
            return;
        }

        setSubmitting(true);
        try {
            const canvas = canvasRef.current;
            // Trim whitespace before saving? For now just take the whole thing
            const signatureData = canvas.toDataURL('image/png');
            await onSign(signatureData);
        } catch (error) {
            console.error('Signing failed:', error);
            alert('Failed to save signature. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="signature-pad-container" style={{
            background: 'var(--bg-card)',
            padding: '2rem',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            border: '1px solid var(--border)',
            maxWidth: '500px',
            width: '100%',
            margin: '0 auto'
        }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                Sign Document
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginBottom: '1.5rem' }}>
                Please provide your signature below to legally execute this contract.
            </p>

            <div style={{
                position: 'relative',
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1rem',
                cursor: 'crosshair',
                touchAction: 'none'
            }}>
                <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    style={{
                        width: '100%',
                        height: '200px',
                        display: 'block'
                    }}
                />
                <button 
                    onClick={clear}
                    style={{
                        position: 'absolute',
                        bottom: '8px',
                        right: '8px',
                        padding: '4px 8px',
                        fontSize: '0.75rem',
                        background: '#f1f5f9',
                        border: '1px solid #e2e8f0',
                        borderRadius: '4px',
                        color: '#475569',
                        cursor: 'pointer'
                    }}
                >
                    Clear
                </button>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <input 
                    type="checkbox" 
                    id="consent" 
                    checked={agreed} 
                    onChange={(e) => setAgreed(e.target.checked)}
                    style={{ marginTop: '3px' }}
                />
                <label htmlFor="consent" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4, cursor: 'pointer' }}>
                    I agree to be legally bound by this document and understand that this electronic signature is as legally binding as a handwritten one.
                </label>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                    className="btn btn-secondary" 
                    onClick={onCancel} 
                    disabled={submitting}
                    style={{ flex: 1 }}
                >
                    Cancel
                </button>
                <button 
                    className="btn btn-primary" 
                    onClick={handleSign} 
                    disabled={submitting || !agreed || !hasContent}
                    style={{ flex: 1 }}
                >
                    {submitting ? 'Signing...' : 'Confirm Signature'}
                </button>
            </div>

            {signerName && (
                <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                    Signing as: <span style={{ fontWeight: 600 }}>{signerName}</span>
                </div>
            )}
        </div>
    );
}
