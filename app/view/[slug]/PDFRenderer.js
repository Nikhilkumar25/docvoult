'use client';

import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { useInView } from 'react-intersection-observer';

// Optimize: Use a more reliable worker source, ideally local but for now a fast CDN with version locking
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

function BetterPage({ pageNumber, ...props }) {
    const { ref, inView } = useInView({
        triggerOnce: true,
        threshold: 0,
        rootMargin: '1000px 0px', // Load pages 1000px before they enter view
    });

    return (
        <div ref={ref} className="watermarked-page-container" data-page={pageNumber} style={{ '--watermark-scale': props.scale || 1 }}>
            {inView ? (
                <Page pageNumber={pageNumber} {...props} />
            ) : (
                <div
                    className="skeleton"
                    style={{
                        width: props.width,
                        height: props.width * 1.414, // Common A4 ratio
                        marginBottom: 20
                    }}
                />
            )}
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
    requireWatermark,
    rotate
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
                    <Page
                        pageNumber={pageNumber}
                        width={pageWidth * zoom}
                        scale={zoom}
                        rotate={rotate}
                        loading={
                            <div className="skeleton" style={{ width: pageWidth * zoom, height: pageWidth * zoom * 1.4 }} />
                        }
                    />
                    {requireWatermark && (
                        <>
                            <div className="page-watermark top">
                                {email || 'Anonymous'} • {new Date().toLocaleString()}
                            </div>
                            <div className="page-watermark bottom">
                                {email || 'Anonymous'} • {new Date().toLocaleString()}
                            </div>
                        </>
                    )}
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
                            requireWatermark={requireWatermark}
                        />
                    ))}
                </div>
            )}
        </Document>
    );
}
