import { IncomingMessage, ServerResponse } from 'http';
import path from 'path';
import fs from 'fs';

export default function handler(req: IncomingMessage, res: ServerResponse) {
    // In Vercel, the directory structure is different. 
    // Public files are merged into the root or available in a specific way.
    // We'll try common paths.
    const possiblePaths = [
        path.join(process.cwd(), 'public', 'fonts'),
        path.join(process.cwd(), 'fonts'),
        '/var/task/public/fonts'
    ];

    let fontsDir = '';
    for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
            fontsDir = p;
            break;
        }
    }

    if (!fontsDir) {
        // If we can't find it, we might need to hardcode some or return empty
        return res.end(JSON.stringify([]));
    }

    let fonts: { name: string; category: string; file: string; url: string }[] = [];

    const getCategory = (subdir: string) => {
        const lower = subdir.toLowerCase();
        if (lower.includes('sindhi')) return 'Sindhi';
        if (lower.includes('urdu')) return 'Urdu';
        if (lower.includes('bahij')) return 'Bahij Nassim';
        return subdir.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    };

    const scanDir = (dir: string, baseRelativePath: string) => {
        if (!fs.existsSync(dir)) return;

        const items = fs.readdirSync(dir, { withFileTypes: true });
        items.forEach(item => {
            if (item.isDirectory()) {
                scanDir(path.join(dir, item.name), path.join(baseRelativePath, item.name));
            } else if (item.isFile()) {
                const extension = path.extname(item.name).toLowerCase();
                if (['.ttf', '.otf', '.woff', '.woff2'].includes(extension)) {
                    const parentDirName = path.basename(dir);
                    const category = getCategory(parentDirName);

                    const webPath = path.join('fonts', baseRelativePath, item.name).replace(/\\/g, '/');
                    fonts.push({
                        name: item.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
                        category: category,
                        file: item.name,
                        url: `/${webPath}`
                    });
                }
            }
        });
    };

    scanDir(fontsDir, '');

    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(JSON.stringify(fonts));
}
