import fs from 'fs';
import path from 'path';

// --- Configuration ---
const HOSTNAME = 'https://rajababar.com';
const PUBLIC_DIR = path.join(process.cwd(), 'public');
const SITEMAP_FILE = path.join(PUBLIC_DIR, 'sitemap.xml');

// Static routes
const STATIC_ROUTES = [
    '',
    '/about',
    '/library',
    '/sindh-library',
    '/archive-library',
    '/projects',
    '/tools',
    '/tools/pdf-metadata',
    '/downloads',
    '/contact',
    '/auth',
    '/dashboard',
];

async function generateSitemap() {
    console.log('--- Generating Sitemap ---');
    let urlCount = 0;
    const lastmod = new Date().toISOString().split('T')[0];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // 1. Add Static Routes
    STATIC_ROUTES.forEach(route => {
        xml += `  <url>\n`;
        xml += `    <loc>${HOSTNAME}${route}</loc>\n`;
        xml += `    <lastmod>${lastmod}</lastmod>\n`;
        xml += `    <changefreq>${route === '' ? 'daily' : 'weekly'}</changefreq>\n`;
        xml += `    <priority>${route === '' ? '1.0' : '0.8'}</priority>\n`;
        xml += `  </url>\n`;
        urlCount++;
    });

    // 2. Add Sindh Library Books from CSV
    try {
        const sindhCsvPath = path.join(PUBLIC_DIR, 'lib.sindh.org', 'lib.sindh.org-BookList-Feb-26-2026 09.15.25.csv');
        if (fs.existsSync(sindhCsvPath)) {
            const data = fs.readFileSync(sindhCsvPath, 'utf-8');
            const lines = data.split(/\r?\n/).slice(1);
            lines.forEach(line => {
                if (line.trim()) {
                    const columns = line.split(',');
                    const id = columns[0]?.trim();
                    if (id && !isNaN(Number(id))) {
                        xml += `  <url>\n`;
                        xml += `    <loc>${HOSTNAME}/library/${id}</loc>\n`;
                        xml += `    <lastmod>${lastmod}</lastmod>\n`;
                        xml += `    <changefreq>monthly</changefreq>\n`;
                        xml += `    <priority>0.6</priority>\n`;
                        xml += `  </url>\n`;
                        urlCount++;
                    }
                }
            });
        }
    } catch (err) {
        console.warn('Error reading Sindh Library CSV:', err);
    }

    // 3. Add Archive.org Books from CSV
    try {
        const archiveCsvPath = path.join(PUBLIC_DIR, 'archive.org', 'sindh-library.csv');
        if (fs.existsSync(archiveCsvPath)) {
            const data = fs.readFileSync(archiveCsvPath, 'utf-8');
            const lines = data.split(/\r?\n/).slice(1);
            lines.forEach(line => {
                if (line.trim()) {
                    const columns = line.split(',');
                    const id = columns[0]?.trim(); // Identifier column
                    if (id && id.length > 2) {
                        xml += `  <url>\n`;
                        xml += `    <loc>${HOSTNAME}/archive-library/${id}</loc>\n`;
                        xml += `    <lastmod>${lastmod}</lastmod>\n`;
                        xml += `    <changefreq>monthly</changefreq>\n`;
                        xml += `    <priority>0.6</priority>\n`;
                        xml += `  </url>\n`;
                        urlCount++;
                    }
                }
            });
        }
    } catch (err) {
        console.warn('Error reading Archive.org CSV:', err);
    }

    xml += `</urlset>`;

    fs.writeFileSync(SITEMAP_FILE, xml);
    console.log(`Successfully generated sitemap with ${urlCount} URLs at ${SITEMAP_FILE}`);
}

generateSitemap().catch(console.error);
