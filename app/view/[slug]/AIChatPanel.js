'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Cosine similarity between two vectors.
 */
function cosineSim(a, b) {
    if (!a || !b || a.length !== b.length) return 0;
    let dot = 0, magA = 0, magB = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        magA += a[i] * a[i];
        magB += b[i] * b[i];
    }
    return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

export default function AIChatPanel({ slug, documentTitle }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [kbReady, setKbReady] = useState(false);
    const [kbEntries, setKbEntries] = useState([]);
    const [embeddings, setEmbeddings] = useState({});
    const [pipelineReady, setPipelineReady] = useState(false);
    const [useServerFallback, setUseServerFallback] = useState(false);
    const [modelLoading, setModelLoading] = useState(true);
    const [kbError, setKbError] = useState(null);
    const messagesEndRef = useRef(null);
    const pipelineRef = useRef(null);

    // Load KB entries on mount
    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(`/api/view/${slug}/kb`);
                if (res.ok) {
                    const data = await res.json();
                    setKbEntries(data.entries || []);
                    setKbReady(true);
                    setMessages([{
                        role: 'assistant',
                        text: `Hi! I'm an AI assistant for "${data.documentTitle || documentTitle}". Ask me anything about this document!`,
                    }]);
                } else {
                    const data = await res.json();
                    setKbError(data.error || 'Knowledge base is not ready yet.');
                }
            } catch (err) {
                console.error('Failed to load KB:', err);
                setKbError('Failed to connect to the AI service.');
            }
        })();
    }, [slug, documentTitle]);

    // Try to load client-side embeddings model
    useEffect(() => {
        if (!kbReady || kbEntries.length === 0) return;

        let cancelled = false;
        const timeout = setTimeout(() => {
            // If model hasn't loaded in 15s, use server fallback
            if (!pipelineRef.current && !cancelled) {
                console.log('Transformers.js timeout — using server fallback');
                setUseServerFallback(true);
                setModelLoading(false);
            }
        }, 15000);

        (async () => {
            try {
                const { pipeline } = await import('@xenova/transformers');
                if (cancelled) return;

                const extractor = await pipeline(
                    'feature-extraction',
                    'Xenova/all-MiniLM-L6-v2',
                    { quantized: true }
                );
                if (cancelled) return;

                pipelineRef.current = extractor;
                setPipelineReady(true);
                clearTimeout(timeout);

                // Pre-compute embeddings for all KB questions
                const embs = {};
                for (const entry of kbEntries) {
                    const result = await extractor(entry.question, {
                        pooling: 'mean',
                        normalize: true,
                    });
                    embs[entry.id] = Array.from(result.data);
                }
                setEmbeddings(embs);
                setModelLoading(false);
            } catch (err) {
                console.error('Client-side model failed:', err);
                if (!cancelled) {
                    setUseServerFallback(true);
                    setModelLoading(false);
                }
            }
        })();

        return () => { cancelled = true; clearTimeout(timeout); };
    }, [kbReady, kbEntries]);

    // Find the best matching entry client-side
    const findBestMatch = useCallback(async (question) => {
        if (useServerFallback) {
            // Use server-side matching
            try {
                const res = await fetch(`/api/view/${slug}/kb/match`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ question }),
                });
                if (res.ok) {
                    const data = await res.json();
                    return data;
                }
            } catch (err) {
                console.error('Server match failed:', err);
            }
            return { matchedEntryId: null, score: 0 };
        }

        if (!pipelineRef.current) return { matchedEntryId: null, score: 0 };

        const result = await pipelineRef.current(question, {
            pooling: 'mean',
            normalize: true,
        });
        const questionEmb = Array.from(result.data);

        let bestId = null;
        let bestScore = 0;
        let bestQuestion = '';

        for (const entry of kbEntries) {
            const entryEmb = embeddings[entry.id];
            if (!entryEmb) continue;

            const score = cosineSim(questionEmb, entryEmb);
            if (score > bestScore) {
                bestScore = score;
                bestId = entry.id;
                bestQuestion = entry.question;
            }
        }

        return {
            matchedEntryId: bestId,
            matchedQuestion: bestQuestion,
            score: bestScore,
            category: kbEntries.find(e => e.id === bestId)?.category,
        };
    }, [useServerFallback, kbEntries, embeddings, slug]);

    // Get suggested follow-ups (2-3 related entries)
    const getSuggestedFollowups = useCallback((matchedId) => {
        if (kbEntries.length === 0) return [];
        
        let pool = kbEntries.filter(e => e.category === 'general');
        if (matchedId) {
            pool = pool.filter(e => e.id !== matchedId);
            const matchedEmb = embeddings[matchedId];
            if (matchedEmb) {
                return pool
                    .map(e => ({
                        id: e.id,
                        question: e.question,
                        score: embeddings[e.id] ? cosineSim(matchedEmb, embeddings[e.id]) : 0,
                    }))
                    .sort((a, b) => b.score - a.score)
                    .slice(0, 2);
            }
        }
        
        // Fallback or no matchedId: just return 2 random/first general questions
        return pool.slice(0, 2).map(e => ({ id: e.id, question: e.question }));
    }, [kbEntries, embeddings]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const question = input.trim();
        if (!question || loading) return;

        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: question }]);
        setLoading(true);

        try {
            const match = await findBestMatch(question);

            if (!match.matchedEntryId || match.score < 0.3) {
                // No match — log unanswered and inform viewer
                fetch(`/api/view/${slug}/kb/unanswered`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ question }),
                }).catch(() => { });

                setMessages(prev => [...prev, {
                    role: 'assistant',
                    text: "I don't have specific info on that yet. You can try a related question below or contact the owner.",
                    followups: getSuggestedFollowups(null)
                }]);
            } else if (match.category === 'sensitive' || match.category === 'out-of-scope') {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    text: 'This topic is outside what I can share. Please contact the document owner directly for this information.',
                }]);
            } else {
                // Get rephrased answer from server
                const res = await fetch(`/api/view/${slug}/kb/answer`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        question,
                        matchedEntryId: match.matchedEntryId,
                    }),
                });

                if (res.ok) {
                    const data = await res.json();
                    const followups = getSuggestedFollowups(match.matchedEntryId);

                    setMessages(prev => [...prev, {
                        role: 'assistant',
                        text: data.answer,
                        followups: followups.length > 0 ? followups : undefined,
                    }]);
                } else {
                    setMessages(prev => [...prev, {
                        role: 'assistant',
                        text: "I'm having trouble generating a response right now. Please try again.",
                    }]);
                }
            }
        } catch (err) {
            console.error('AI chat error:', err);
            setMessages(prev => [...prev, {
                role: 'assistant',
                text: "Something went wrong. Please try again.",
            }]);
        } finally {
            setLoading(false);
        }
    };

    const askFollowup = (question) => {
        setInput(question);
    };

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="ai-chat-panel">
            <div className="ai-chat-header">
                <div className="ai-chat-header-title">
                    <span className="ai-icon">🤖</span>
                    <span>AI Assistant</span>
                </div>
                {modelLoading && (
                    <span className="ai-model-status">
                        {useServerFallback ? '☁️ Server mode' : '⏳ Loading AI...'}
                    </span>
                )}
                {!modelLoading && (
                    <span className="ai-model-status ready">
                        {useServerFallback ? '☁️ Server mode' : '✅ Ready'}
                    </span>
                )}
            </div>

            <div className="ai-chat-messages">
                {kbError && (
                    <div className="ai-chat-error">
                        <span className="error-icon">⚠️</span>
                        <span className="error-text">{kbError}</span>
                    </div>
                )}
                {messages.map((msg, i) => (
                    <div key={i} className={`chat-bubble ${msg.role === 'user' ? 'user' : 'ai'}`}>
                        <div className="msg-text">{msg.text}</div>
                        {msg.followups && msg.followups.length > 0 && (
                            <div className="ai-suggestions">
                                {msg.followups.map((f) => (
                                    <button
                                        key={f.id}
                                        className="ai-suggestion-chip"
                                        onClick={() => askFollowup(f.question)}
                                    >
                                        {f.question.length > 40 ? f.question.substring(0, 37) + '...' : f.question}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
                {loading && (
                    <div className="ai-chat-msg assistant">
                        <div className="ai-typing-indicator">
                            <span></span><span></span><span></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="ai-chat-input-area">
                <form className="ai-chat-input" onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px' }}>
                    <input
                        type="text"
                        className="input"
                        placeholder={modelLoading && !useServerFallback ? 'AI model loading...' : 'Ask about this document...'}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={loading || !kbReady}
                        style={{ flex: 1 }}
                    />
                    <button
                        type="submit"
                        className="btn btn-primary btn-sm"
                        disabled={loading || !kbReady || !input.trim()}
                    >
                        Ask
                    </button>
                </form>
            </div>
        </div>
    );
}
