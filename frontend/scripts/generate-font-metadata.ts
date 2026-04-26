import fs from 'fs';
import path from 'path';

const fontsDir = path.join(process.cwd(), 'public', 'fonts');
const outputFile = path.join(process.cwd(), 'public', 'fonts-metadata.json');

const getCategory = (subdir: string) => {
    const lower = subdir.toLowerCase();
    if (lower.includes('sindhi')) return 'Sindhi';
    if (lower.includes('urdu')) return 'Urdu';
    if (lower.includes('bahij')) return 'Bahij Nassim';
    return subdir.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

const fonts: { name: string; category: string; file: string; url: string }[] = [];

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

console.log('Scanning for fonts...');
scanDir(fontsDir, '');
fs.writeFileSync(outputFile, JSON.stringify(fonts, null, 2));
console.log(`Successfully generated metadata for ${fonts.length} fonts at ${outputFile}`);
