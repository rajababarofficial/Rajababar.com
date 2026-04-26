import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
    title?: string;
    description?: string;
    canonical?: string;
    type?: string;
    image?: string;
}

export default function SEO({
    title,
    description,
    canonical,
    type = 'website',
    image = 'https://rajababar.com/og-image.jpg'
}: SEOProps) {
    const location = useLocation();
    const baseUrl = 'https://rajababar.com';

    const siteTitle = 'Raja Babar';
    const fullTitle = title ? `${title} - ${siteTitle}` : siteTitle;
    const defaultDescription = 'Discover Raja Babar\'s free software tools, premium Sindhi fonts, and the digital Sindh Library.';
    const currentUrl = `${baseUrl}${location.pathname}`;

    useEffect(() => {
        // Update Title
        document.title = fullTitle;

        // Update Meta Description
        const updateMeta = (name: string, content: string, attr: string = 'name') => {
            let element = document.querySelector(`meta[${attr}="${name}"]`);
            if (element) {
                element.setAttribute('content', content);
            } else {
                element = document.createElement('meta');
                element.setAttribute(attr, name);
                element.setAttribute('content', content);
                document.head.appendChild(element);
            }
        };

        updateMeta('description', description || defaultDescription);
        updateMeta('og:title', fullTitle, 'property');
        updateMeta('og:description', description || defaultDescription, 'property');
        updateMeta('og:url', currentUrl, 'property');
        updateMeta('og:type', type, 'property');
        updateMeta('og:image', image, 'property');
        updateMeta('twitter:title', fullTitle);
        updateMeta('twitter:description', description || defaultDescription);
        updateMeta('twitter:image', image);

        // Update Canonical
        let canonicalTag = document.querySelector('link[rel="canonical"]');
        const finalCanonical = canonical || currentUrl;
        if (canonicalTag) {
            canonicalTag.setAttribute('href', finalCanonical);
        } else {
            canonicalTag = document.createElement('link');
            canonicalTag.setAttribute('rel', 'canonical');
            canonicalTag.setAttribute('href', finalCanonical);
            document.head.appendChild(canonicalTag);
        }

    }, [fullTitle, description, currentUrl, type, image, canonical, defaultDescription]);

    return null; // This component doesn't render anything
}
