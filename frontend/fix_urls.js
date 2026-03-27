const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) { 
            results.push(file);
        }
    });
    return results;
}

const files = walk('./src');
let changedCount = 0;

files.forEach(f => {
    // Skip api.ts and page.tsx since they are already configured correctly
    if (f.includes('api.ts') || f.endsWith('app\\page.tsx') || f.endsWith('app/page.tsx')) {
        return;
    }

    let orig = fs.readFileSync(f, 'utf8');
    let content = orig;

    // 1. Replace "http://localhost:3001" or 'http://localhost:3001'
    content = content.replace(/["']http:\/\/localhost:3001([^"']*)["']/g, '`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}$1`');

    // 2. Replace http://localhost:3001 inside template literals `http://localhost:3001/...`
    content = content.replace(/http:\/\/localhost:3001/g, '${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}');

    if (content !== orig) {
        fs.writeFileSync(f, content);
        changedCount++;
        console.log(`Updated ${f}`);
    }
});

console.log(`\nSuccessfully updated ${changedCount} files.`);
