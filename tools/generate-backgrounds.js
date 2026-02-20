#!/usr/bin/env node
// ============================================================
// WordPlay — Background Image Batch Generator
// Uses Flux 2 Pro on fal.ai to generate scenic backgrounds
// ============================================================
//
// Setup:
//   npm install @fal-ai/client dotenv sharp
//   Create tools/.env with: FAL_KEY=your_api_key_here
//
// Usage:
//   node tools/generate-backgrounds.js              # generate all missing
//   node tools/generate-backgrounds.js --dry-run    # preview without generating
//   node tools/generate-backgrounds.js --only "Sunrise|Rise,Forest|Pine"  # specific entries
//   node tools/generate-backgrounds.js --manifest   # rebuild manifest only
//

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

// Load environment variables from tools/.env
require("dotenv").config({ path: path.join(__dirname, ".env") });

const { fal } = require("@fal-ai/client");

// ---- CONFIG ----
const PROMPTS_FILE = path.join(__dirname, "image-prompts.json");
const OUTPUT_DIR = path.join(__dirname, "..", "WordPlay", "wwwroot", "images", "bg");
const MANIFEST_FILE = path.join(OUTPUT_DIR, "bg-manifest.json");
const WEBP_QUALITY = 78;
const IMAGE_WIDTH = 720;
const IMAGE_HEIGHT = 1280;
const DELAY_MS = 2500; // delay between API calls (rate limiting)

const PROMPT_TEMPLATE = (desc, colors) =>
    `A serene ${desc}, ${colors} color tones, portrait orientation, ` +
    `soft atmospheric lighting, scenic nature photography style, ` +
    `no text no people no animals, suitable as a blurred mobile game background`;

// ---- HELPERS ----
function keyToFilename(key) {
    return key.toLowerCase().replace(/\|/g, "-").replace(/\s+/g, "-");
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function downloadAndConvert(url, outputPath) {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`Download failed: ${resp.status}`);
    const buffer = Buffer.from(await resp.arrayBuffer());

    await sharp(buffer)
        .resize(IMAGE_WIDTH, IMAGE_HEIGHT, { fit: "cover" })
        .webp({ quality: WEBP_QUALITY })
        .toFile(outputPath);
}

function buildManifest() {
    const files = fs.readdirSync(OUTPUT_DIR).filter((f) => f.endsWith(".webp"));
    const keys = files.map((f) => f.replace(/\.webp$/, ""));
    fs.writeFileSync(MANIFEST_FILE, JSON.stringify(keys, null, 2));
    console.log(`Manifest written: ${keys.length} images`);
    return keys;
}

// ---- MAIN ----
async function main() {
    const args = process.argv.slice(2);
    const dryRun = args.includes("--dry-run");
    const manifestOnly = args.includes("--manifest");

    // Parse --only filter
    let onlyKeys = null;
    const onlyIdx = args.indexOf("--only");
    if (onlyIdx !== -1 && args[onlyIdx + 1]) {
        onlyKeys = new Set(args[onlyIdx + 1].split(",").map((s) => s.trim()));
    }

    // Ensure output directory exists
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });

    // Manifest-only mode
    if (manifestOnly) {
        buildManifest();
        return;
    }

    // Load prompts
    const prompts = JSON.parse(fs.readFileSync(PROMPTS_FILE, "utf8"));
    const allKeys = Object.keys(prompts);
    const keys = onlyKeys
        ? allKeys.filter((k) => onlyKeys.has(k))
        : allKeys;

    // Check API key
    if (!dryRun && !process.env.FAL_KEY) {
        console.error("Error: FAL_KEY not set in tools/.env");
        console.error("Create tools/.env with: FAL_KEY=your_api_key_here");
        process.exit(1);
    }

    if (!dryRun) {
        fal.config({ credentials: process.env.FAL_KEY });
    }

    // Filter out already-generated images
    const todo = [];
    let skipped = 0;
    for (const key of keys) {
        const filename = keyToFilename(key) + ".webp";
        const outputPath = path.join(OUTPUT_DIR, filename);
        if (fs.existsSync(outputPath)) {
            skipped++;
            continue;
        }
        todo.push(key);
    }

    console.log(`Total entries: ${keys.length}`);
    console.log(`Already exist: ${skipped}`);
    console.log(`To generate:   ${todo.length}`);
    console.log(`Est. cost:     ~$${(todo.length * 0.03).toFixed(2)}`);
    console.log();

    if (dryRun) {
        console.log("DRY RUN — sample prompts:");
        for (const key of todo.slice(0, 5)) {
            const entry = prompts[key];
            const prompt = PROMPT_TEMPLATE(entry.desc, entry.colors);
            console.log(`  ${key}:`);
            console.log(`    ${prompt}`);
            console.log();
        }
        return;
    }

    if (todo.length === 0) {
        console.log("Nothing to generate. All images exist.");
        buildManifest();
        return;
    }

    // Generate images
    let done = 0;
    let errors = 0;
    for (const key of todo) {
        done++;
        const entry = prompts[key];
        const prompt = PROMPT_TEMPLATE(entry.desc, entry.colors);
        const filename = keyToFilename(key) + ".webp";
        const outputPath = path.join(OUTPUT_DIR, filename);

        process.stdout.write(
            `[${done}/${todo.length}] ${key} ... `
        );

        try {
            const result = await fal.subscribe("fal-ai/flux-2-pro", {
                input: {
                    prompt,
                    image_size: { width: IMAGE_WIDTH, height: IMAGE_HEIGHT },
                    num_images: 1,
                    safety_tolerance: "5",
                },
            });

            const imageUrl = result.data.images[0].url;
            await downloadAndConvert(imageUrl, outputPath);
            console.log("OK");
        } catch (err) {
            errors++;
            console.log(`FAILED: ${err.message}`);
        }

        // Rate limit
        if (done < todo.length) {
            await sleep(DELAY_MS);
        }
    }

    console.log();
    console.log(`Done: ${done - errors} generated, ${errors} errors`);

    // Build manifest
    buildManifest();
}

main().catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
});
