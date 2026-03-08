'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Dynamically import the form content with SSR disabled to avoid DOMMatrix error during build
const UploadFormContent = dynamic(
    () => import('./UploadFormContent'),
    { ssr: false }
);

export default function UploadPage() {
    return (
        <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Loading upload area...</div>}>
            <UploadFormContent />
        </Suspense>
    );
}

