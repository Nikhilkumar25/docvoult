'use client';

import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PDFRenderer({ file, pageNumber, pageWidth, zoom, layoutMode, onDocumentLoadSuccess, numPages, pageRefs, email, requireWatermark, rotate }) {
    return (
        <Document
            file={file}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
                <div className="loading-spinner">
                    <div className="spinner" />
                </div>
            }
        >
            {layoutMode === 'paged' ? (
                <div className="watermarked-page-container">
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
                        <div
                            key={`page_container_${i + 1}`}
                            className="watermarked-page-container"
                            data-page={i + 1}
                            ref={el => pageRefs.current[i + 1] = el}
                        >
                            <Page
                                key={`page_${i + 1}`}
                                pageNumber={i + 1}
                                width={pageWidth * zoom}
                                scale={zoom}
                                rotate={rotate}
                                className="scroll-page"
                                loading={
                                    <div className="skeleton" style={{ width: pageWidth * zoom, height: pageWidth * zoom * 1.4, marginBottom: 20 }} />
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
                    ))}
                </div>
            )}
        </Document>
    );
}
