import { Request, Response } from 'express';

interface BookResult {
    id: string;
    title: string;
    author: string;
    year?: string | number;
    cover_url?: string;
    source_name: string;
    source_url: string;
    language?: string;
    is_public_domain: boolean;
}

// Simple in-memory cache
const cache = new Map<string, { data: BookResult[], timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

export const searchBooksHandler = async (req: Request, res: Response) => {
    const query = req.query.q as string;
    if (!query) {
        return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    // Check cache
    const cached = cache.get(query);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return res.json(cached.data);
    }

    try {
        const results: BookResult[] = [];

        // Parallel fetching from multiple sources
        const [olResults, iaResults, slResults, ssResults, iqResults] = await Promise.all([
            fetchOpenLibrary(query),
            fetchInternetArchive(query),
            fetchSindhLibrary(query),
            fetchSindhSalamat(query),
            fetchIqbalLibrary(query)
        ]);

        // Merge results (alternating for diversity, prioritizing local/Sindhi sources)
        const maxLength = Math.max(olResults.length, iaResults.length, slResults.length, ssResults.length, iqResults.length);
        for (let i = 0; i < maxLength; i++) {
            if (slResults[i]) results.push(slResults[i]);
            if (ssResults[i]) results.push(ssResults[i]);
            if (iqResults[i]) results.push(iqResults[i]);
            if (olResults[i]) results.push(olResults[i]);
            if (iaResults[i]) results.push(iaResults[i]);
        }

        // Cache the result
        cache.set(query, { data: results, timestamp: Date.now() });

        res.json(results);
    } catch (error) {
        console.error('Library search error:', error);
        res.status(500).json({ error: 'Failed to fetch library results' });
    }
};

async function fetchOpenLibrary(query: string): Promise<BookResult[]> {
    try {
        const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=10`);
        const data = await response.json();
        return (data.docs || []).map((doc: any) => ({
            id: `ol-${doc.key}`,
            title: doc.title,
            author: doc.author_name ? doc.author_name[0] : 'Unknown',
            year: doc.first_publish_year,
            cover_url: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : null,
            source_name: 'Open Library',
            source_url: `https://openlibrary.org${doc.key}`,
            language: doc.language ? doc.language[0] : 'en',
            is_public_domain: true
        }));
    } catch (e) {
        console.error('OL Error:', e);
        return [];
    }
}

async function fetchInternetArchive(query: string): Promise<BookResult[]> {
    try {
        // Broad search across Archive.org with focus on query
        const q = `(${query}) AND mediatype:texts`;
        const response = await fetch(`https://archive.org/advancedsearch.php?q=${encodeURIComponent(q)}&fl[]=identifier&fl[]=title&fl[]=creator&fl[]=year&fl[]=language&output=json&rows=10`);
        const data = await response.json();
        return (data.response.docs || []).map((doc: any) => ({
            id: `ia-${doc.identifier}`,
            title: doc.title || 'Untitled',
            author: doc.creator ? (Array.isArray(doc.creator) ? doc.creator[0] : doc.creator) : 'Unknown',
            year: doc.year,
            cover_url: `https://archive.org/services/img/${doc.identifier}`,
            source_name: 'Internet Archive',
            source_url: `https://archive.org/details/${doc.identifier}`,
            language: doc.language ? (Array.isArray(doc.language) ? doc.language[0] : doc.language) : 'unknown',
            is_public_domain: true
        }));
    } catch (e) {
        return [];
    }
}

async function fetchSindhLibrary(query: string): Promise<BookResult[]> {
    try {
        const targetUrl = `https://lib.sindh.org/kitaab?q=${encodeURIComponent(query)}`;
        const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`);
        const data = await res.json();
        const html = data.contents;

        const books: BookResult[] = [];
        const regex = /<a[^>]*href=\"(\/kitaab\/detail\/[^\"]+)\"[^>]*>([\s\S]*?)<\/a>/gi;
        let match;
        while ((match = regex.exec(html)) !== null) {
            const href = match[1];
            const inner = match[2];
            const imgMatch = inner.match(/<img[^>]*src=\"([^\"]+)\"[^>]*>/i);
            let text = inner.replace(/<[^>]*>?/gm, '').trim();

            if (imgMatch) {
                books.push({
                    id: `sl-${href}`,
                    title: text.split('\n')[0].trim() || 'Sindhi Book',
                    author: 'Sindh Library',
                    source_name: 'Sindh Library',
                    source_url: 'https://lib.sindh.org' + href,
                    cover_url: 'https://lib.sindh.org' + imgMatch[1],
                    is_public_domain: true
                });
            }
        }
        return books.slice(0, 10);
    } catch (e) {
        return [];
    }
}

async function fetchSindhSalamat(query: string): Promise<BookResult[]> {
    try {
        const targetUrl = `https://books.sindhsalamat.com/books/search?q=${encodeURIComponent(query)}`;
        const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`);
        const data = await res.json();
        const html = data.contents;
        const books: BookResult[] = [];
        const regex = /<a[^>]*href=\"(https:\/\/books\.sindhsalamat\.com\/book\/[^\"]+)\"[^>]*>([\s\S]*?)<\/a>/gi;
        let match;
        while ((match = regex.exec(html)) !== null) {
            const href = match[1];
            const inner = match[2];
            const imgMatch = inner.match(/<img[^>]*src=\"([^\"]+)\"[^>]*>/i);
            const titleMatch = inner.match(/<h[2-6][^>]*>([\s\S]*?)<\/h[2-6]>/i);

            if (imgMatch) {
                books.push({
                    id: `ss-${href}`,
                    title: titleMatch ? titleMatch[1].replace(/<[^>]*>?/gm, '').trim() : 'Sindhi Book',
                    author: 'Sindh Salamat',
                    source_name: 'Sindh Salamat',
                    source_url: href,
                    cover_url: imgMatch[1],
                    is_public_domain: true
                });
            }
        }
        return books.slice(0, 8);
    } catch (e) {
        return [];
    }
}

async function fetchIqbalLibrary(query: string): Promise<BookResult[]> {
    try {
        const targetUrl = `https://iqbalcyberlibrary.net/en/listperiodicals/iqbaliyatur.php?search=${encodeURIComponent(query)}`;
        const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`);
        const data = await res.json();
        const html = data.contents;
        const books: BookResult[] = [];

        // Simple heuristic for Iqbal Cyber Library row processing
        const regex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
        let match;
        while ((match = regex.exec(html)) !== null) {
            const row = match[1];
            if (row.includes('href="/en/')) {
                const linkMatch = row.match(/href=\"([^\"]+)\"/i);
                const titleMatch = row.match(/<td[^>]*>([\s\S]*?)<\/td>/i);
                if (linkMatch && titleMatch) {
                    books.push({
                        id: `iq-${linkMatch[1]}`,
                        title: titleMatch[1].replace(/<[^>]*>?/gm, '').trim(),
                        author: 'Iqbal Cyber Library',
                        source_name: 'Iqbal Library',
                        source_url: 'https://iqbalcyberlibrary.net' + linkMatch[1],
                        is_public_domain: true
                    });
                }
            }
        }
        return books.slice(0, 8);
    } catch (e) {
        return [];
    }
}
