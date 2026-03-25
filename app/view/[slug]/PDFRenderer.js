'use client';

import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { useInView } from 'react-intersection-observer';

// Optimize: Use a more reliable worker source, ideally local but for now a fast CDN with version locking
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

function BetterPage({ pageNumber, signatureFields = [], onFieldClick, ...props }) {
    const { ref, inView } = useInView({
        triggerOnce: true,
        threshold: 0,
        rootMargin: '1000px 0px',
    });

    const pageFields = signatureFields.filter(f => f.pageNumber === pageNumber);

    return (
        <div ref={ref} className="watermarked-page-container" data-page={pageNumber} style={{ '--watermark-scale': props.scale || 1, position: 'relative' }}>
            {inView ? (
                <Page pageNumber={pageNumber} {...props} />
            ) : (
                <div
                    className="skeleton"
                    style={{
                        width: props.width,
                        height: props.width * 1.414,
                        marginBottom: 20
                    }}
                />
            )}
            
            {/* Signature Fields Overlay */}
            {inView && pageFields.map(field => (
                <div 
                    key={field.id}
                    className={`absolute border-2 transition-all group flex flex-col items-center justify-center p-1
                        ${field.status === 'affirmed' 
                            ? 'border-green-500 bg-green-50/30' 
                            : 'border-orange-400 bg-orange-50/50 cursor-pointer hover:bg-orange-100 hover:scale-105 active:scale-95 shadow-sm'}`}
                    style={{
                        left: `${field.x}%`,
                        top: `${field.y}%`,
                        width: `${field.width || 120}px`,
                        height: `${field.height || 60}px`,
                        transform: 'translate(-50%, -50%)',
                        zIndex: 10
                    }}
                    onClick={() => field.status === 'pending' && onFieldClick?.(field)}
                >
                    {field.status === 'affirmed' ? (
                        <div className="flex flex-col items-center justify-center text-center w-full h-full overflow-hidden">
                            <span className="text-[10px] text-green-700 font-bold leading-none">✅ SIGNED</span>
                            <div className="mt-1 flex flex-col items-center text-[7px] text-gray-600 font-mono leading-tight">
                                <span className="truncate max-w-full font-bold">{props.name || 'Signer'}</span>
                                <span className="opacity-70">{new Date(field.affirmedAt).toLocaleString()}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center text-orange-600 animate-pulse">
                            <span className="text-lg">✍️</span>
                            <span className="text-[9px] font-bold uppercase tracking-wider">Click to Sign</span>
                        </div>
                    )}
                </div>
            ))}

            {props.requireWatermark && inView && (
                <>
                    <div className="page-watermark top">
                        {props.email || 'Anonymous'} • {new Date().toLocaleString()}
                    </div>
                    <div className="page-watermark bottom">
                        {props.email || 'Anonymous'} • {new Date().toLocaleString()}
                    </div>
                </>
            )}
        </div>
    );
}

const options = {
    cMapUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/cmaps/',
    cMapPacked: true,
    standardFontDataUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/standard_fonts/',
};

export default function PDFRenderer({
    file,
    pageNumber,
    pageWidth,
    zoom,
    layoutMode,
    onDocumentLoadSuccess,
    onDocumentLoadError,
    numPages,
    pageRefs,
    email,
    name,
    requireWatermark,
    rotate,
    signatureFields = [],
    onFieldClick
}) {
    return (
        <Document
            file={file}
            options={options}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={
                <div className="loading-spinner">
                    <div className="spinner" />
                    <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading Document...</p>
                </div>
            }
            error={
                <div className="error-message p-md">
                    <div className="alert alert-danger">
                        Failed to load PDF. The document might be unavailable or private.
                    </div>
                </div>
            }
        >
            {layoutMode === 'paged' ? (
                <div className="watermarked-page-container" style={{ '--watermark-scale': zoom }}>
                    <BetterPage
                        pageNumber={pageNumber}
                        width={pageWidth * zoom}
                        scale={zoom}
                        rotate={rotate}
                        email={email}
                        name={name}
                        requireWatermark={requireWatermark}
                        signatureFields={signatureFields}
                        onFieldClick={onFieldClick}
                    />
                </div>
            ) : (
                <div className="scroll-mode-container">
                    {Array.from({ length: numPages || 0 }).map((_, i) => (
                        <BetterPage
                            key={`page_container_${i + 1}`}
                            pageNumber={i + 1}
                            width={pageWidth * zoom}
                            scale={zoom}
                            rotate={rotate}
                            className="scroll-page"
                            email={email}
                            name={name}
                            requireWatermark={requireWatermark}
                            signatureFields={signatureFields}
                            onFieldClick={onFieldClick}
                        />
                    ))}
                </div>
            )}
        </Document>
    );
}
