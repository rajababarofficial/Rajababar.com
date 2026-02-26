const fs = require('fs');
const cheerio = require('cheerio');
const html = fs.readFileSync('sindh.html', 'utf-8');
const $ = cheerio.load(html);
const books = [];
$('a').each((i, el) => {
    const href = $(el).attr('href');
    if (href && href.includes('/kitaab/') && $(el).find('img').length > 0) {
        books.push({
            title: $(el).text().trim(),
            href,
            img: $(el).find('img').attr('src')
        });
    }
});
console.log(books.slice(0, 5));
