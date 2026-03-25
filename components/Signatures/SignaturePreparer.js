'use client';

import React, { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

export default function SignaturePreparer({ documentUrl, onFieldsChange, initialFields = [] }) {
    const [pdf, setPdf] = useState(null);
    const [numPages, setNumPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [fields, setFields] = useState(initialFields);
    const [loading, setLoading] = useState(true);
    const canvasRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        const loadPdf = async () => {
            try {
                const loadingTask = pdfjsLib.getDocument(documentUrl);
                const pdfInstance = await loadingTask.promise;
                setPdf(pdfInstance);
                setNumPages(pdfInstance.numPages);
                setLoading(false);
            } catch (error) {
                console.error('Error loading PDF:', error);
                setLoading(false);
            }
        };
        loadPdf();
    }, [documentUrl]);

    useEffect(() => {
        if (!pdf || !canvasRef.current) return;

        const renderPage = async () => {
            const page = await pdf.getPage(currentPage);
            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            canvas.height = viewport.height;
            canvas.width = viewport.width;

            const renderContext = {
                canvasContext: context,
                viewport: viewport,
            };
            await page.render(renderContext).promise;
        };

        renderPage();
    }, [pdf, currentPage]);

    const handleCanvasClick = (e) => {
        if (!canvasRef.current) return;

        const rect = canvasRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        const newField = {
            id: Math.random().toString(36).substr(2, 9),
            pageNumber: currentPage,
            x,
            y,
            type: 'signature',
            width: 120,
            height: 60
        };

        const updatedFields = [...fields, newField];
        setFields(updatedFields);
        onFieldsChange(updatedFields);
    };

    const removeField = (id) => {
        const updatedFields = fields.filter(f => f.id !== id);
        setFields(updatedFields);
        onFieldsChange(updatedFields);
    };

    return (
        <div className="flex flex-col h-full bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
            {/* Toolbar */}
            <div className="bg-white px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-1 hover:bg-gray-100 disabled:opacity-30 rounded"
                    >
                        ◀️
                    </button>
                    <span className="text-sm font-medium">Page {currentPage} of {numPages}</span>
                    <button 
                        onClick={() => setCurrentPage(p => Math.min(numPages, p + 1))}
                        disabled={currentPage === numPages}
                        className="p-1 hover:bg-gray-100 disabled:opacity-30 rounded"
                    >
                        ▶️
                    </button>
                </div>
                <div className="text-xs text-gray-500 italic">
                    Click on the document to place a signature spot
                </div>
            </div>

            {/* Viewer Section */}
            <div className="flex-1 overflow-auto p-8 flex justify-center bg-gray-200/50" ref={containerRef}>
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <div className="relative shadow-2xl bg-white">
                        <canvas 
                            ref={canvasRef} 
                            onClick={handleCanvasClick}
                            className="cursor-crosshair block"
                        />
                        {/* Fields Overlay */}
                        {fields.filter(f => f.pageNumber === currentPage).map(field => (
                            <div 
                                key={field.id}
                                className="absolute bg-primary/20 border-2 border-primary rounded group cursor-move flex items-center justify-center pointer-events-none"
                                style={{
                                    left: `${field.x}%`,
                                    top: `${field.y}%`,
                                    width: `${field.width}px`,
                                    height: `${field.height}px`,
                                    transform: 'translate(-50%, -50%)'
                                }}
                            >
                                <div className="text-[10px] font-bold text-primary bg-white/80 px-1 rounded pointer-events-auto flex items-center gap-1 shadow-sm">
                                    ✍️ Signer
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeField(field.id);
                                        }}
                                        className="ml-1 text-red-500 hover:text-red-700 font-bold"
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            {/* Legend */}
            <div className="bg-white p-3 border-t border-gray-200 text-[10px] text-gray-400">
                Placement: {fields.length} signature spot(s) defined.
            </div>
        </div>
    );
}
