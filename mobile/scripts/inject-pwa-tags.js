const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'dist', 'index.html');

// Read the generated index.html
let html = fs.readFileSync(indexPath, 'utf8');

// Define the PWA meta tags and links to inject
const pwaTags = `
    <!-- PWA Manifest -->
    <link rel="manifest" href="/manifest.json" />
    
    <!-- Apple iOS Meta Tags -->
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <meta name="apple-mobile-web-app-title" content="MedGuide" />
    <link rel="apple-touch-icon" href="/icon-512.png" />
    
    <!-- PWA Meta Tags -->
    <meta name="application-name" content="MedGuide" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="theme-color" content="#3B82F6" />
`;

// Inject the tags after the title tag
html = html.replace('</title>', '</title>' + pwaTags);

// Write the modified HTML back
fs.writeFileSync(indexPath, html, 'utf8');

console.log('✅ PWA tags injected into index.html');
