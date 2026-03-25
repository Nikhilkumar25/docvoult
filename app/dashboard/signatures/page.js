'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useData } from '@/lib/hooks/useData';
import SignaturePreparer from '@/components/Signatures/SignaturePreparer';

function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function timeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return formatDate(date);
}

function StatusBadge({ status }) {
    const config = {
        pending: { label: 'Pending', cls: 'badge-warning' },
        viewed: { label: 'Viewed', cls: 'badge-info' },
        signed: { label: 'Signed', cls: 'badge-success' },
        declined: { label: 'Declined', cls: 'badge-danger' },
        expired: { label: 'Expired', cls: 'badge-danger' },
        revoked: { label: 'Revoked', cls: 'badge-danger' },
    };
    const c = config[status] || { label: status, cls: 'badge-info' };
    return <span className={`badge ${c.cls}`}>{c.label}</span>;
}

function RoleBadge({ role }) {
    if (role === 'signer') return <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>✍️ Signer</span>;
    if (role === 'reviewer') return <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>👁 Reviewer</span>;
    if (role === 'cc') return <span className="badge badge-secondary" style={{ fontSize: '0.65rem' }}>📋 CC</span>;
    return null;
}

export default function SignaturesPage() {
    const { data: session } = useSession();
    const [activeTab, setActiveTab] = useState('inbox');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [expandedRequest, setExpandedRequest] = useState(null);

    const { data: requests = [], isLoading, mutate } = useData(`/api/signatures?tab=${activeTab}`);

    // Create form state
    const [createForm, setCreateForm] = useState({
        documentId: '',
        signerEmail: '',
        signerName: '',
        role: 'signer',
        message: '',
        accessCode: '',
        expiresAt: '',
    });
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState('');
    const [step, setStep] = useState(1);
    const [signatureFields, setSignatureFields] = useState([]);

    // Documents for picker
    const { data: myDocuments = [] } = useData('/api/documents');

    const handleCreate = async (e) => {
        e.preventDefault();
        setCreating(true);
        setCreateError('');

        try {
            const res = await fetch('/api/signatures', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...createForm,
                    expiresAt: createForm.expiresAt || null,
                    accessCode: createForm.accessCode || null,
                    fields: signatureFields
                }),
            });

            const data = await res.json();
            if (res.ok) {
                setShowCreateModal(false);
                setStep(1);
                setSignatureFields([]);
                setCreateForm({ documentId: '', signerEmail: '', signerName: '', role: 'signer', message: '', accessCode: '', expiresAt: '' });
                setActiveTab('sent');
                mutate();
            } else {
                setCreateError(data.error || 'Failed to create signature request');
            }
        } catch (err) {
            setCreateError('Network error. Please try again.');
        } finally {
            setCreating(false);
        }
    };

    const handleAction = async (requestId, action, reason = null) => {
        try {
            const res = await fetch(`/api/signatures/${requestId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, reason }),
            });

            const data = await res.json();

            if (action === 'remind' && data.gmailUrl) {
                window.open(data.gmailUrl, '_blank');
            }

            mutate();
        } catch (err) {
            console.error('Action failed:', err);
        }
    };

    const handleDelete = async (requestId) => {
        if (!confirm('Are you sure you want to cancel this signature request?')) return;

        try {
            await fetch(`/api/signatures/${requestId}`, { method: 'DELETE' });
            mutate();
        } catch (err) {
            console.error('Delete failed:', err);
        }
    };

    const pendingCount = requests.filter(r => r.status === 'pending').length;
    const signedCount = requests.filter(r => r.status === 'signed').length;

    return (
        <>
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <span className="text-3xl">✍️</span>
                        Signatures
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage your document signature requests
                    </p>
                </div>
                <button
                    className="px-5 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-2"
                    onClick={() => setShowCreateModal(true)}
                >
                    <span>📝</span> New Signature Request
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Total</div>
                    <div className="text-2xl font-bold text-gray-900">{requests.length}</div>
                </div>
                <div className="bg-white rounded-2xl border border-amber-100 p-5 shadow-sm">
                    <div className="text-xs font-medium text-amber-400 uppercase tracking-wider mb-1">Pending</div>
                    <div className="text-2xl font-bold text-amber-600">{pendingCount}</div>
                </div>
                <div className="bg-white rounded-2xl border border-green-100 p-5 shadow-sm">
                    <div className="text-xs font-medium text-green-400 uppercase tracking-wider mb-1">Signed</div>
                    <div className="text-2xl font-bold text-green-600">{signedCount}</div>
                </div>
                <div className="bg-white rounded-2xl border border-red-100 p-5 shadow-sm">
                    <div className="text-xs font-medium text-red-400 uppercase tracking-wider mb-1">Action Required</div>
                    <div className="text-2xl font-bold text-red-600">
                        {activeTab === 'inbox' ? pendingCount : requests.filter(r => r.status === 'declined').length}
                    </div>
                </div>
            </div>

            {/* Tab Switcher */}
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 max-w-md">
                <button
                    className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                        activeTab === 'inbox'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => setActiveTab('inbox')}
                >
                    📥 Awaiting My Signature
                </button>
                <button
                    className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                        activeTab === 'sent'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => setActiveTab('sent')}
                >
                    📤 Sent for Signature
                </button>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm animate-pulse">
                            <div className="h-5 w-2/3 bg-gray-200 rounded mb-3" />
                            <div className="h-4 w-1/3 bg-gray-200 rounded mb-2" />
                            <div className="h-4 w-1/4 bg-gray-200 rounded" />
                        </div>
                    ))}
                </div>
            ) : requests.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center p-16 bg-white border border-gray-100 rounded-2xl border-dashed">
                    <div className="text-6xl mb-4 opacity-50">
                        {activeTab === 'inbox' ? '📥' : '📤'}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {activeTab === 'inbox' ? 'No signature requests for you' : 'No signature requests sent'}
                    </h3>
                    <p className="text-sm text-gray-500 max-w-sm mb-6">
                        {activeTab === 'inbox'
                            ? 'When someone requests your signature on a document, it will appear here.'
                            : 'Send a signature request to get documents signed securely.'}
                    </p>
                    {activeTab === 'sent' && (
                        <button
                            className="px-5 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-all shadow-md"
                            onClick={() => setShowCreateModal(true)}
                        >
                            📝 New Signature Request
                        </button>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {requests.map((req) => (
                        <div
                            key={req.id}
                            className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden transition-all hover:border-primary/20 hover:shadow-md"
                        >
                            {/* Main Card Row */}
                            <div className="p-5 flex flex-col md:flex-row md:items-center gap-4">
                                {/* Doc Icon + Info */}
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-xl flex-shrink-0">
                                        📄
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-base font-semibold text-gray-900 truncate flex items-center gap-2">
                                            {req.document?.title || 'Document'}
                                            <RoleBadge role={req.role} />
                                        </h3>
                                        <div className="text-xs text-gray-500 mt-0.5 truncate">
                                            {activeTab === 'inbox' ? (
                                                <>From: {req.document?.user?.name || req.document?.user?.email || 'Unknown'}</>
                                            ) : (
                                                <>To: {req.signerName || req.signerEmail}</>
                                            )}
                                            <span className="mx-2">•</span>
                                            {timeAgo(req.createdAt)}
                                        </div>
                                        {req.message && (
                                            <div className="text-xs text-gray-400 mt-1 italic truncate">
                                                &ldquo;{req.message}&rdquo;
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Status + Meta */}
                                <div className="flex items-center gap-4 flex-shrink-0">
                                    {activeTab === 'sent' && req.viewCount > 0 && (
                                        <div className="text-xs text-gray-400 flex items-center gap-1">
                                            <span>👁</span> {req.viewCount}
                                            {req.lastViewedAt && <span className="ml-1">({timeAgo(req.lastViewedAt)})</span>}
                                        </div>
                                    )}
                                    <StatusBadge status={req.status} />

                                    {/* Actions */}
                                    <div className="flex items-center gap-2">
                                        {activeTab === 'inbox' && req.status === 'pending' && (
                                            <>
                                                <a
                                                    href={`/sign/${req.id}`}
                                                    target="_blank"
                                                    className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-all no-underline shadow-sm flex items-center gap-2"
                                                >
                                                    ✍️ Review & Sign
                                                </a>
                                                <button
                                                    className="px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
                                                    onClick={() => {
                                                        const reason = prompt('Reason for declining (optional):');
                                                        if (reason !== null) handleAction(req.id, 'decline', reason);
                                                    }}
                                                >
                                                    Decline
                                                </button>
                                            </>
                                        )}
                                        {activeTab === 'sent' && req.status === 'pending' && (
                                            <>
                                                <button
                                                    className="px-3 py-2 text-sm text-amber-600 hover:bg-amber-50 rounded-lg transition-colors font-medium flex items-center gap-1.5"
                                                    onClick={() => handleAction(req.id, 'remind')}
                                                >
                                                    📧 Remind
                                                </button>
                                                <button
                                                    className="px-3 py-2 text-sm text-primary hover:bg-primary/5 rounded-lg transition-colors font-medium flex items-center gap-1.5"
                                                    onClick={() => {
                                                        const url = `${window.location.origin}/sign/${req.id}`;
                                                        navigator.clipboard.writeText(url);
                                                        alert('Signing link copied to clipboard!');
                                                    }}
                                                >
                                                    🔗 Copy Link
                                                </button>
                                                <button
                                                    className="px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    onClick={() => handleAction(req.id, 'revoke')}
                                                >
                                                    Revoke
                                                </button>
                                            </>
                                        )}
                                        {activeTab === 'sent' && (req.status === 'pending' || req.status === 'declined' || req.status === 'revoked') && (
                                            <button
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                onClick={() => handleDelete(req.id)}
                                                title="Delete request"
                                            >
                                                🗑️
                                            </button>
                                        )}
                                        {req.status === 'signed' && (
                                            <button
                                                className="px-4 py-2 bg-green-50 text-green-700 text-sm font-semibold rounded-lg hover:bg-green-100 transition-all border border-green-200"
                                                onClick={() => setExpandedRequest(expandedRequest === req.id ? null : req.id)}
                                            >
                                                View Signature
                                            </button>
                                        )}
                                        <button
                                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-xs"
                                            onClick={() => setExpandedRequest(expandedRequest === req.id ? null : req.id)}
                                        >
                                            {expandedRequest === req.id ? '▲' : '▼'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Expanded Activity Log + Signature */}
                            {expandedRequest === req.id && (
                                <div className="border-t border-gray-100 bg-gray-50/50 px-5 py-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                                        <div className="text-xs text-gray-500 space-y-1">
                                            <h4 className="text-xs font-bold text-gray-700 uppercase mb-2">Request Details</h4>
                                            <div><span className="font-semibold text-gray-700">Email:</span> {req.signerEmail}</div>
                                            {req.expiresAt && <div><span className="font-semibold text-gray-700">Expires:</span> {formatDate(req.expiresAt)}</div>}
                                            {req.signedAt && <div><span className="font-semibold text-gray-700">Signed:</span> {formatDate(req.signedAt)}</div>}
                                            {req.declinedAt && <div><span className="font-semibold text-gray-700">Declined:</span> {formatDate(req.declinedAt)}</div>}
                                            {req.declineReason && <div><span className="font-semibold text-gray-700">Reason:</span> {req.declineReason}</div>}
                                            {req.signatures?.[0]?.ipAddress && <div><span className="font-semibold text-gray-700">IP Address:</span> {req.signatures[0].ipAddress}</div>}
                                        </div>

                                        {req.status === 'signed' && req.signatures?.[0]?.signatureData && (
                                            <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center">
                                                <h4 className="text-[10px] font-bold text-gray-400 uppercase mb-2 self-start">Official Signature</h4>
                                                <img 
                                                    src={req.signatures[0].signatureData} 
                                                    alt="Signature" 
                                                    className="max-h-24 w-auto object-contain mb-2"
                                                />
                                                <div className="text-[10px] text-gray-400 font-mono">
                                                    Digitally signed at {formatDate(req.signatures[0].signedAt)}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {req.activities && req.activities.length > 0 && (
                                        <div>
                                            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Activity Log</h4>
                                            <div className="space-y-2">
                                                {req.activities.map((act) => (
                                                    <div key={act.id} className="flex items-start gap-3 text-xs">
                                                        <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{
                                                            background: act.action === 'signed' ? '#22c55e' :
                                                                act.action === 'declined' ? '#ef4444' :
                                                                act.action === 'reminded' ? '#f59e0b' :
                                                                act.action === 'viewed' ? '#3b82f6' :
                                                                '#9ca3af'
                                                        }} />
                                                        <div className="flex-1 min-w-0">
                                                            <span className="font-medium text-gray-700 capitalize">{act.action}</span>
                                                            {act.details && (
                                                                <span className="text-gray-400 ml-1">— {act.details}</span>
                                                            )}
                                                        </div>
                                                        <span className="text-gray-400 flex-shrink-0">{timeAgo(act.createdAt)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {(!req.activities || req.activities.length === 0) && (
                                        <p className="text-xs text-gray-400 italic">No activity recorded yet.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Create Signature Request Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[3000] flex items-center justify-center p-4" onClick={() => {
                    setShowCreateModal(false);
                    setStep(1);
                }}>
                    <div className={`bg-white rounded-2xl shadow-xl w-full animate-in fade-in zoom-in-95 duration-200 overflow-hidden flex flex-col ${step === 2 ? 'h-[90vh] w-[95vw] max-w-5xl' : 'max-w-lg max-h-[90vh]'}`} onClick={e => e.stopPropagation()}>
                        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
                            <h2 className="text-lg font-semibold text-gray-900">
                                {step === 1 ? '📝 New Signature Request' : '✍️ Place Signature Spots'}
                            </h2>
                            <button
                                onClick={() => {
                                    setShowCreateModal(false);
                                    setStep(1);
                                }}
                                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        {step === 1 ? (
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                if (createForm.role === 'signer') setStep(2);
                                else handleCreate();
                            }} className="p-6 overflow-y-auto custom-scrollbar">
                                {createError && (
                                    <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
                                        ⚠️ {createError}
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Select Document *</label>
                                        <select
                                            required
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                            value={createForm.documentId}
                                            onChange={(e) => setCreateForm({ ...createForm, documentId: e.target.value })}
                                        >
                                            <option value="">Choose a document...</option>
                                            {myDocuments.filter(d => d.isOwner).map(doc => (
                                                <option key={doc.id} value={doc.id}>{doc.title} ({doc.fileName})</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Signer Email *</label>
                                            <input
                                                type="email"
                                                required
                                                placeholder="email@example.com"
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                                value={createForm.signerEmail}
                                                onChange={(e) => setCreateForm({ ...createForm, signerEmail: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Signer Name</label>
                                            <input
                                                type="text"
                                                placeholder="Full Name (Optional)"
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                                value={createForm.signerName}
                                                onChange={(e) => setCreateForm({ ...createForm, signerName: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Role</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {['signer', 'reviewer', 'cc'].map((role) => (
                                                <button
                                                    key={role}
                                                    type="button"
                                                    onClick={() => setCreateForm({ ...createForm, role })}
                                                    className={`py-2 px-3 rounded-xl text-sm font-medium border transition-all ${
                                                        createForm.role === role
                                                            ? 'bg-primary/10 border-primary text-primary shadow-sm'
                                                            : 'bg-white border-gray-100 text-gray-600 hover:border-gray-200'
                                                    }`}
                                                >
                                                    {role === 'signer' ? '✍️ Signer' : role === 'reviewer' ? '👁 Reviewer' : '📋 CC'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Message</label>
                                        <textarea
                                            rows={3}
                                            placeholder="Please review and sign this document..."
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                                            value={createForm.message}
                                            onChange={(e) => setCreateForm({ ...createForm, message: e.target.value })}
                                        />
                                    </div>

                                    <details className="group">
                                        <summary className="cursor-pointer text-sm font-semibold text-gray-500 flex items-center gap-1 list-none hover:text-gray-700">
                                            ⚙️ Advanced Options
                                        </summary>
                                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Access Passcode</label>
                                                <input
                                                    type="text"
                                                    placeholder="Optional code"
                                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-primary outline-none"
                                                    value={createForm.accessCode}
                                                    onChange={(e) => setCreateForm({ ...createForm, accessCode: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date</label>
                                                <input
                                                    type="datetime-local"
                                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-primary outline-none text-sm"
                                                    value={createForm.expiresAt}
                                                    onChange={(e) => setCreateForm({ ...createForm, expiresAt: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </details>
                                </div>

                                <div className="flex items-center gap-3 mt-8">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="flex-1 py-3 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={creating || !createForm.documentId || !createForm.signerEmail}
                                        className="flex-[2] py-3 text-sm font-bold text-white bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                                    >
                                        {creating ? (
                                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                        ) : (
                                            <>
                                                {createForm.role === 'signer' ? 'Next: Place Signspots →' : 'Send Request 🚀'}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="flex-1 flex flex-col p-6 min-h-0 bg-gray-50">
                                <div className="flex-1 mb-6 min-h-0">
                                    <SignaturePreparer 
                                        documentUrl={myDocuments.find(d => d.id === createForm.documentId)?.fileUrl}
                                        onFieldsChange={setSignatureFields}
                                        initialFields={signatureFields}
                                    />
                                </div>
                                <div className="flex items-center justify-between gap-4 flex-shrink-0 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                                    <div className="text-sm text-gray-500">
                                        <span className="font-bold text-primary">{signatureFields.length}</span> spots placed
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setStep(1)}
                                            className="px-6 py-3 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
                                        >
                                            ← Back
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleCreate}
                                            disabled={creating || signatureFields.length === 0}
                                            className="px-8 py-3 text-sm font-bold text-white bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                                        >
                                            {creating ? (
                                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                            ) : (
                                                <>Send Request 🚀</>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
