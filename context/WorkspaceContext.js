'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const WorkspaceContext = createContext();

export function WorkspaceProvider({ children }) {
    const [workspaces, setWorkspaces] = useState([]);
    const [activeWorkspace, setActiveWorkspace] = useState(null); // null = personal
    const [loading, setLoading] = useState(true);

    const fetchWorkspaces = async () => {
        try {
            const res = await fetch('/api/workspaces');
            if (res.ok) {
                const data = await res.json();
                setWorkspaces(data);
            }
        } catch (err) {
            console.error('Error fetching workspaces:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWorkspaces();
    }, []);

    // Persist active workspace in sessionStorage
    useEffect(() => {
        const saved = sessionStorage.getItem('activeWorkspaceId');
        if (saved && saved !== 'null') {
            setActiveWorkspace(saved);
        }
    }, []);

    const switchWorkspace = (workspaceId) => {
        setActiveWorkspace(workspaceId);
        sessionStorage.setItem('activeWorkspaceId', workspaceId || 'null');
    };

    const getActiveWorkspaceData = () => {
        return workspaces.find(w => w.id === activeWorkspace) || null;
    };

    return (
        <WorkspaceContext.Provider value={{
            workspaces,
            activeWorkspace,
            switchWorkspace,
            getActiveWorkspaceData,
            fetchWorkspaces,
            loading
        }}>
            {children}
        </WorkspaceContext.Provider>
    );
}

export function useWorkspace() {
    const ctx = useContext(WorkspaceContext);
    if (!ctx) throw new Error('useWorkspace must be used within a WorkspaceProvider');
    return ctx;
}
