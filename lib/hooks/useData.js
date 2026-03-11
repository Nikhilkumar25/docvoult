'use client';

import { useState, useEffect } from 'react';

// Global cache object that persists across page navigations in the SPA
const globalCache = new Map();

/**
 * useData - A Stale-While-Revalidate (SWR) style hook for instant dashboard navigation.
 * @param {string} url - The API endpoint to fetch data from.
 * @param {object} options - Configuration options (interval, fallback data, etc).
 */
export function useData(url, options = {}) {
    const { 
        initialData = undefined, 
        refreshInterval = 30000, // 30s background refresh by default
        enabled = true 
    } = options;

    // Use cached data for immediate initial state
    const [data, setData] = useState(() => {
        if (!url) return initialData;
        return globalCache.get(url) || initialData;
    });
    
    const [isLoading, setIsLoading] = useState(!globalCache.has(url));
    const [error, setError] = useState(null);

    const fetchData = async (silent = false) => {
        if (!url || !enabled) return;
        
        if (!silent && !globalCache.has(url)) setIsLoading(true);
        
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const json = await res.json();
            
            // Comparison to avoid unnecessary re-renders if data hasn't changed
            const currentCached = globalCache.get(url);
            if (JSON.stringify(currentCached) !== JSON.stringify(json)) {
                setData(json);
                globalCache.set(url, json);
            }
            
            setError(null);
        } catch (err) {
            console.error(`Error fetching ${url}:`, err);
            setError(err);
        } finally {
            if (!silent) setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!enabled || !url) return;

        // Fetch immediately on mount (background refresh if cached)
        fetchData(globalCache.has(url));

        // Setup background refresh
        let interval;
        if (refreshInterval > 0) {
            interval = setInterval(() => fetchData(true), refreshInterval);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [url, enabled]);

    // Manual refresh function
    const mutate = () => fetchData(false);

    return { 
        data, 
        isLoading, 
        error, 
        mutate,
        isStale: globalCache.has(url)
    };
}
