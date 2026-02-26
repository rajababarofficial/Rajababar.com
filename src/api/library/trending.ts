import { Request, Response } from 'express';

// Reusing types
import { searchBooksHandler } from './search';

export const trendingBooksHandler = async (req: Request, res: Response) => {
    try {
        // Return a mix of trending topics
        const [progBooks, sciBooks, histBooks] = await Promise.all([
            fetchOLBySubject('programming', 4),
            fetchOLBySubject('science', 4),
            fetchOLBySubject('history', 4)
        ]);

        // Also include some Sindhi books
        const slBooks = await fetchSindhLibraryTrending();

        const trending = [
            ...slBooks,
            ...progBooks,
            ...sciBooks,
            ...histBooks
        ];

        res.json(trending);
    } catch (error) {
        console.error('Trending error:', error);
        res.status(500).json({ error: 'Failed to fetch trending books' });
    }
};

async function fetchOLBySubject(subject: string, limit: number) {
    try {
        const response = await fetch(`https://openlibrary.org/subjects/${subject}.json?limit=${limit}`);
        const data = await response.json();
        return (data.works || []).map((work: any) => ({
            id: `ol-${work.key}`,
            title: work.title,
            author: work.authors ? work.authors[0].name : 'Unknown',
            year: work.first_publish_year,
            cover_url: work.cover_id ? `https://covers.openlibrary.org/b/id/${work.cover_id}-M.jpg` : null,
            source_name: 'Open Library',
            source_url: `https://openlibrary.org${work.key}`,
            is_public_domain: true
        }));
    } catch (e) {
        return [];
    }
}

async function fetchSindhLibraryTrending() {
    try {
        const targetUrl = 'https://lib.sindh.org/kitaab';
        const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`);
        const data = await res.json();
        const html = data.contents;

        const books: any[] = [];
        const regex = /<a[^>]*href=\"(\/kitaab\/detail\/[^\"]+)\"[^>]*>([\s\S]*?)<\/a>/gi;
        let match;
        let count = 0;
        while ((match = regex.exec(html)) !== null && count < 6) {
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
                count++;
            }
        }
        return books;
    } catch (e) {
        return [];
    }
}
