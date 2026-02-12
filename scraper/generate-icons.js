// Generates PWA icons (192x192 and 512x512) matching the design in generate-icons.html
const { createCanvas } = require("canvas");
const fs = require("fs");
const path = require("path");

const ICONS_DIR = path.join(__dirname, "..", "WordPlay", "wwwroot", "icons");

function generateIcon(size) {
    const c = createCanvas(size, size);
    const ctx = c.getContext("2d");

    // Purple-to-orange gradient background
    const grad = ctx.createLinearGradient(0, 0, size, size);
    grad.addColorStop(0, "#0f0520");
    grad.addColorStop(0.4, "#2d1b4e");
    grad.addColorStop(0.7, "#8b2252");
    grad.addColorStop(1, "#d4622a");

    // Rounded rect
    const r = size * 0.18;
    ctx.beginPath();
    ctx.moveTo(r, 0);
    ctx.lineTo(size - r, 0);
    ctx.quadraticCurveTo(size, 0, size, r);
    ctx.lineTo(size, size - r);
    ctx.quadraticCurveTo(size, size, size - r, size);
    ctx.lineTo(r, size);
    ctx.quadraticCurveTo(0, size, 0, size - r);
    ctx.lineTo(0, r);
    ctx.quadraticCurveTo(0, 0, r, 0);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Gold "W" with shadow
    const fs2 = size * 0.52;
    ctx.font = `bold ${fs2}px Georgia, serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Shadow
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.fillText("W", size / 2 + 2, size / 2 + 4);

    // Glow
    ctx.shadowColor = "#f4a535";
    ctx.shadowBlur = size * 0.08;
    ctx.fillStyle = "#f4a535";
    ctx.fillText("W", size / 2, size / 2);
    ctx.shadowBlur = 0;

    // Small subtitle
    const sf = size * 0.07;
    ctx.font = `${sf}px Georgia, serif`;
    ctx.fillStyle = "rgba(254,243,224,0.5)";
    ctx.fillText("WORDS", size / 2, size * 0.82);

    return c.toBuffer("image/png");
}

// Ensure output directory exists
if (!fs.existsSync(ICONS_DIR)) {
    fs.mkdirSync(ICONS_DIR, { recursive: true });
}

// Generate both sizes
for (const size of [192, 512]) {
    const buf = generateIcon(size);
    const outPath = path.join(ICONS_DIR, `icon-${size}.png`);
    fs.writeFileSync(outPath, buf);
    console.log(`Generated ${outPath} (${buf.length} bytes)`);
}
