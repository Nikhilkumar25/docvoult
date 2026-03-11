const CACHE_TTL_MS = 2500; // 2.5 seconds cache

if (!globalThis.__inMemoryCache) {
    globalThis.__inMemoryCache = new Map();
}
const cache = globalThis.__inMemoryCache;

/**
 * Gets data from an in-memory application cache.
 * Extremely fast, 0ms latency for hits.
 * @param {string} key Unique cache key
 * @param {Function} fetcher Async function returning the data if cache misses
 * @param {number} ttlMs Time to live in milliseconds (default 2500ms)
 */
export async function getCached(key, fetcher, ttlMs = CACHE_TTL_MS) {
    const now = Date.now();
    const cached = cache.get(key);

    // Return cached data if fresh
    if (cached && (now - cached.timestamp < ttlMs)) {
        return cached.data;
    }

    // Cache miss, execute fetcher
    const data = await fetcher();

    // Store in cache
    cache.set(key, { data, timestamp: now });

    // Passive cleanup: if cache grows too large, clear old entries
    if (cache.size > 2000) {
        const oldestAllowed = Date.now() - 60000; // 1 minute
        for (const [k, v] of cache.entries()) {
            if (v.timestamp < oldestAllowed) {
                cache.delete(k);
            }
        }
    }

    return data;
}

export function invalidateCachePrefix(prefix) {
    for (const key of cache.keys()) {
        if (typeof key === 'string' && key.startsWith(prefix)) {
            cache.delete(key);
        }
    }
}
