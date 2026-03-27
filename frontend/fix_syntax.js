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

const badStr1 = '"${process.env.NEXT_PUBLIC_API_URL || \\"http://localhost:3001\\"}"';
const badStr1Alt = '"${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}"';

files.forEach(f => {
    let orig = fs.readFileSync(f, 'utf8');
    let content = orig;

    content = content.split('"${process.env.NEXT_PUBLIC_API_URL || \\"http://localhost:3001\\"}"').join('"http://localhost:3001"');
    content = content.split('"${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}"').join('"http://localhost:3001"');
    content = content.split("'${process.env.NEXT_PUBLIC_API_URL || \"http://localhost:3001\"}'").join("'http://localhost:3001'");

    if (content !== orig) {
        fs.writeFileSync(f, content);
        changedCount++;
        console.log("Fixed " + f);
    }
});

console.log("Successfully fixed " + changedCount + " files.");
