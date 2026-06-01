#!/usr/bin/env node
// ============================================================
// WordPlay — Bee Art Batch Generator
// Uses Flux 2 Pro on fal.ai to generate cute cartoon mascot bees.
// Clone of generate-backgrounds.js. Setup: tools/.env with FAL_KEY=...
// Usage:
//   node tools/generate-bees.js              # generate all missing
//   node tools/generate-bees.js --dry-run    # preview prompts
//   node tools/generate-bees.js --only "worker,monarch"
//   node tools/generate-bees.js --manifest   # rebuild manifest only
// ============================================================
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const { fal } = require("@fal-ai/client");

const PROMPTS_FILE = path.join(__dirname, "bee-prompts.json");
const OUTPUT_DIR = path.join(__dirname, "..", "WordPlay", "wwwroot", "images", "bees");
const MANIFEST_FILE = path.join(OUTPUT_DIR, "bees-manifest.json");
const WEBP_QUALITY = 82;
const IMAGE_SIZE = 384;
const DELAY_MS = 2500;

const PROMPT_TEMPLATE = (desc, palette) =>
    `A cute cartoon mascot bee character, ${desc}, big friendly eyes, soft rounded shapes, ` +
    `${palette} color palette, centered in a small circular vignette of its habitat, ` +
    `charming children's mobile-game collectible sticker illustration, soft clean lighting, no text`;

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function downloadAndConvert(url, outputPath) {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`Download failed: ${resp.status}`);
    const buffer = Buffer.from(await resp.arrayBuffer());
    await sharp(buffer).resize(IMAGE_SIZE, IMAGE_SIZE, { fit: "cover" }).webp({ quality: WEBP_QUALITY }).toFile(outputPath);
}

function buildManifest() {
    const files = fs.readdirSync(OUTPUT_DIR).filter((f) => f.endsWith(".webp"));
    const ids = files.map((f) => f.replace(/\.webp$/, ""));
    fs.writeFileSync(MANIFEST_FILE, JSON.stringify(ids, null, 2));
    console.log(`Manifest written: ${ids.length} bees`);
    return ids;
}

async function main() {
    const args = process.argv.slice(2);
    const dryRun = args.includes("--dry-run");
    const manifestOnly = args.includes("--manifest");
    let onlyKeys = null;
    const onlyIdx = args.indexOf("--only");
    if (onlyIdx !== -1 && args[onlyIdx + 1]) onlyKeys = new Set(args[onlyIdx + 1].split(",").map((s) => s.trim()));

    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    if (manifestOnly) { buildManifest(); return; }

    const prompts = JSON.parse(fs.readFileSync(PROMPTS_FILE, "utf8"));
    const allKeys = Object.keys(prompts);
    const keys = onlyKeys ? allKeys.filter((k) => onlyKeys.has(k)) : allKeys;

    if (!dryRun && !process.env.FAL_KEY) {
        console.error("Error: FAL_KEY not set in tools/.env");
        process.exit(1);
    }
    if (!dryRun) fal.config({ credentials: process.env.FAL_KEY });

    const todo = [];
    let skipped = 0;
    for (const key of keys) {
        if (fs.existsSync(path.join(OUTPUT_DIR, key + ".webp"))) { skipped++; continue; }
        todo.push(key);
    }
    console.log(`Total: ${keys.length}  Exist: ${skipped}  To generate: ${todo.length}`);
    console.log(`Est. cost: ~$${(todo.length * 0.03).toFixed(2)}\n`);

    if (dryRun) {
        for (const key of todo.slice(0, 5)) {
            console.log(`  ${key}:\n    ${PROMPT_TEMPLATE(prompts[key].desc, prompts[key].palette)}\n`);
        }
        return;
    }
    if (todo.length === 0) { console.log("Nothing to generate."); buildManifest(); return; }

    let done = 0, errors = 0;
    for (const key of todo) {
        done++;
        const entry = prompts[key];
        const prompt = PROMPT_TEMPLATE(entry.desc, entry.palette);
        const outputPath = path.join(OUTPUT_DIR, key + ".webp");
        process.stdout.write(`[${done}/${todo.length}] ${key} ... `);
        try {
            const result = await fal.subscribe("fal-ai/flux-2-pro", {
                input: {
                    prompt,
                    image_size: { width: IMAGE_SIZE, height: IMAGE_SIZE },
                    num_images: 1,
                    safety_tolerance: "5",
                },
            });
            const url = result.data.images[0].url;
            await downloadAndConvert(url, outputPath);
            console.log("ok");
        } catch (e) {
            errors++;
            console.log("ERROR: " + e.message);
        }
        if (done < todo.length) await sleep(DELAY_MS);
    }
    console.log(`\nDone. ${done - errors} generated, ${errors} errors.`);
    buildManifest();
}

main();
