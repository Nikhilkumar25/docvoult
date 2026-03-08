'use client';

import { useState, useEffect } from 'react';
import { useWorkspace } from '@/context/WorkspaceContext';

export default function WorkspacesPage() {
    const { workspaces, fetchWorkspaces } = useWorkspace();
    const [creating, setCreating] = useState(false);
    const [newName, setNewName] = useState('');
    const [error, setError] = useState('');
    const [memberEmail, setMemberEmail] = useState('');
    const [addingMemberId, setAddingMemberId] = useState(null);
    const [memberError, setMemberError] = useState('');

    const ownedWorkspaces = workspaces.filter(w => w.role === 'owner');
    const memberWorkspaces = workspaces.filter(w => w.role === 'member');

    const handleCreate = async (e) => {
        e.preventDefault();
        setError('');
        setCreating(true);
        try {
            const res = await fetch('/api/workspaces', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newName })
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error);
            } else {
                setNewName('');
                fetchWorkspaces();
            }
        } catch (err) {
            setError('Something went wrong');
        } finally {
            setCreating(false);
        }
    };

    const handleAddMember = async (workspaceId) => {
        setMemberError('');
        try {
            const res = await fetch(`/api/workspaces/${workspaceId}/members`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: memberEmail })
            });
            const data = await res.json();
            if (!res.ok) {
                setMemberError(data.error);
            } else {
                setMemberEmail('');
                setAddingMemberId(null);
                fetchWorkspaces();
            }
        } catch (err) {
            setMemberError('Something went wrong');
        }
    };

    const handleRemoveMember = async (workspaceId, email) => {
        if (!confirm(`Remove ${email} from this workspace?`)) return;
        try {
            await fetch(`/api/workspaces/${workspaceId}/members`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            fetchWorkspaces();
        } catch (err) {
            console.error('Error removing member:', err);
        }
    };

    return (
        <>
            <div className="dashboard-header">
                <div>
                    <h1>Workspaces</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                        Create shared spaces for your team. Max 2 workspaces, 3 members each.
                    </p>
                </div>
            </div>

            {/* Create Workspace */}
            <div className="workspace-section">
                <h2>Your Workspaces ({ownedWorkspaces.length}/2)</h2>
                {ownedWorkspaces.length < 2 && (
                    <form onSubmit={handleCreate} className="workspace-create-form">
                        <input
                            type="text"
                            placeholder="Workspace name..."
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="form-input"
                            required
                        />
                        <button type="submit" className="btn btn-primary" disabled={creating}>
                            {creating ? 'Creating...' : '+ Create'}
                        </button>
                    </form>
                )}
                {error && <p className="form-error">{error}</p>}

                {ownedWorkspaces.length === 0 ? (
                    <div className="empty-state" style={{ padding: '2rem' }}>
                        <div className="empty-icon">👥</div>
                        <p>No workspaces yet. Create one to start collaborating!</p>
                    </div>
                ) : (
                    <div className="workspace-list">
                        {ownedWorkspaces.map(ws => (
                            <div key={ws.id} className="workspace-card">
                                <div className="workspace-card-header">
                                    <h3>👥 {ws.name}</h3>
                                    <span className="badge badge-owner">Owner</span>
                                </div>
                                <div className="workspace-card-stats">
                                    <span>📄 {ws._count?.documents || 0} docs</span>
                                    <span>📁 {ws._count?.folders || 0} folders</span>
                                    <span>👤 {ws.members?.length || 0}/3 members</span>
                                </div>

                                <div className="workspace-members">
                                    <h4>Members</h4>
                                    {ws.members?.length === 0 && (
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No members yet.</p>
                                    )}
                                    {ws.members?.map(m => (
                                        <div key={m.id} className="member-row">
                                            <span>{m.userEmail}</span>
                                            <button
                                                className="btn btn-ghost btn-sm"
                                                onClick={() => handleRemoveMember(ws.id, m.userEmail)}
                                                title="Remove member"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}

                                    {ws.members?.length < 3 && (
                                        addingMemberId === ws.id ? (
                                            <div className="member-add-form">
                                                <input
                                                    type="email"
                                                    placeholder="Member email..."
                                                    value={memberEmail}
                                                    onChange={(e) => setMemberEmail(e.target.value)}
                                                    className="form-input"
                                                />
                                                <button className="btn btn-primary btn-sm" onClick={() => handleAddMember(ws.id)}>Add</button>
                                                <button className="btn btn-ghost btn-sm" onClick={() => { setAddingMemberId(null); setMemberEmail(''); setMemberError(''); }}>Cancel</button>
                                            </div>
                                        ) : (
                                            <button className="btn btn-secondary btn-sm" onClick={() => setAddingMemberId(ws.id)} style={{ marginTop: '0.5rem' }}>
                                                + Invite Member
                                            </button>
                                        )
                                    )}
                                    {memberError && addingMemberId === ws.id && (
                                        <p className="form-error" style={{ marginTop: '0.5rem' }}>{memberError}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Shared With You */}
            {memberWorkspaces.length > 0 && (
                <div className="workspace-section" style={{ marginTop: '2rem' }}>
                    <h2>Shared With You</h2>
                    <div className="workspace-list">
                        {memberWorkspaces.map(ws => (
                            <div key={ws.id} className="workspace-card">
                                <div className="workspace-card-header">
                                    <h3>👥 {ws.name}</h3>
                                    <span className="badge badge-member">Member</span>
                                </div>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                    Owned by {ws.owner?.name || ws.owner?.email || 'Unknown'}
                                </p>
                                <div className="workspace-card-stats">
                                    <span>📄 {ws._count?.documents || 0} docs</span>
                                    <span>📁 {ws._count?.folders || 0} folders</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}
