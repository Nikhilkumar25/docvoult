'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Generate strategic questions from a PDF pitch deck using Gemini Multimodal.
 */
export async function generateQAPairs(pdfBase64, documentTitle) {
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

    const prompt = `You are an expert financial analyst, potential customer, and strategic investor reviewing a pitch deck or business document titled "${documentTitle}".

Analyze the provided document (including all text, charts, graphics, financials, and layout). Generate 20-25 strategic, highly-relevant questions that a viewer would ask after reading this deck. 

DO NOT guess the answers. ONLY generate the questions themselves. Choose insightful questions that challenge or probe into the claims made in the text or charts.

Return your response as a valid JSON array of objects with a single "question" field. Do NOT include any markdown formatting, code blocks, or extra text — just the raw JSON array.

Example format:
[{"question": "What is your projected customer acquisition cost (CAC) for year 2?"}, {"question": "How does this solution integrate with existing legacy systems?"}]`;


    try {
        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: pdfBase64,
                    mimeType: 'application/pdf',
                },
            },
        ]);
        const responseText = result.response.text().trim();

        // Strip markdown code blocks if present
        const cleaned = responseText
            .replace(/^```json\s*/i, '')
            .replace(/^```\s*/i, '')
            .replace(/\s*```$/i, '')
            .trim();

        const pairs = JSON.parse(cleaned);

        if (!Array.isArray(pairs)) throw new Error('Response is not an array');
        return pairs.filter(p => p.question).map(p => ({
            question: String(p.question).trim(),
            answer: '',
        }));
    } catch (error) {
        console.error('Gemini Q&A generation failed:', error);
        throw new Error('Failed to generate Q&A pairs from document');
    }
}

/**
 * Rephrase a pre-approved answer in context of the viewer's specific question.
 */
export async function rephraseAnswer(viewerQuestion, originalQuestion, originalAnswer, documentTitle) {
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

    const prompt = `You are a helpful AI assistant for the document "${documentTitle}".
 
 A viewer asked: "${viewerQuestion}"
 
 The closest matching topic from the document's knowledge base is:
 Q: "${originalQuestion}"
 A: "${originalAnswer}"
 
 Rephrase the answer to directly address the viewer's specific question. 
 
 Guidelines:
 1. Be extremely concise and direct. 
 2. Start with the direct answer.
 3. Add one small, "smart" piece of extra context to keep the viewer interested, but only if it flows naturally.
 4. DO NOT repeat the matching Q/A verbatim.
 5. Maximum 2 natural sentences.`;

    try {
        const result = await model.generateContent(prompt);
        return result.response.text().trim();
    } catch (error) {
        console.error('Gemini rephrase failed:', error);
        // Fallback to original answer
        return originalAnswer;
    }
}

/**
 * Compute embeddings server-side using Gemini's embedding model.
 */
export async function computeEmbedding(text) {
    const model = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });
    try {
        const result = await model.embedContent(text);
        return result.embedding.values;
    } catch (error) {
        console.error('Gemini embedding failed:', error);
        return null;
    }
}

/**
 * Cosine similarity between two vectors.
 */
export async function cosineSimilarity(a, b) {
    if (!a || !b || a.length !== b.length) return 0;
    let dot = 0, magA = 0, magB = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        magA += a[i] * a[i];
        magB += b[i] * b[i];
    }
    return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}
