const fs = require('fs');
const html = fs.readFileSync('sindh.html', 'utf-8');

const books = [];
const regex = /<a[^>]*href=\"(\/kitaab\/[^\"]+)\"[^>]*>([\s\S]*?)<\/a>/gi;
let match;
while ((match = regex.exec(html)) !== null) {
    const href = match[1];
    const inner = match[2];
    const imgMatch = inner.match(/<img[^>]*src=\"([^\"]+)\"[^>]*>/i);
    const titleMatch = inner.match(/<h[2-5][^>]*>([\s\S]*?)<\/h[2-5]>/i) || inner.match(/<h[2-5][^>]*class=\"card-title\"[^>]*>([\s\S]*?)<\/h[2-5]>/i);

    // Removing html tags from inner
    let text = inner.replace(/<[^>]*>?/gm, '').trim();

    if (imgMatch) {
        books.push({
            title: text.split('\n')[0].trim() || 'Sindhi Book',
            href: 'https://lib.sindh.org' + href,
            img: 'https://lib.sindh.org' + imgMatch[1]
        });
    }
}

console.log(JSON.stringify(books.slice(0, 3), null, 2));
