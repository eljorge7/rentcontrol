const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, 'public', 'icons');
if (!fs.existsSync(iconsDir)){
    fs.mkdirSync(iconsDir, { recursive: true });
}

async function createIcon(size) {
    // Canvas Indigo
    const image = await new Jimp(size, size, '#4f46e5');
    
    // Si quisieramos texto
    try {
        const font = await Jimp.loadFont(size > 200 ? Jimp.FONT_SANS_128_WHITE : Jimp.FONT_SANS_64_WHITE);
        const text = 'RC';
        const textWidth = Jimp.measureText(font, text);
        const textHeight = Jimp.measureTextHeight(font, text, size);
        
        image.print(font, (size - textWidth)/2, (size - textHeight)/2, text);
    } catch(e) {
        // Ignorar si falla el font load
    }

    const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);
    await image.writeAsync(outputPath);
    console.log(`Generated: ${outputPath}`);
}

async function main() {
    await createIcon(192);
    await createIcon(512);
    console.log('Iconos de PWA generados con éxito.');
}

main().catch(console.error);
