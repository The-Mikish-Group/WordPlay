// tools/generate-definitions.js
// Usage: node generate-definitions.js
//
// Reads casual-dict.txt and creates/updates definitions.json.
// Outputs the word list in batches for Claude to define.
// Resume-safe: skips words already in the output file.

const fs = require('fs');
const path = require('path');

const DICT_PATH = path.join(__dirname, 'casual-dict.txt');
const OUT_PATH = path.join(__dirname, '..', 'WordPlay', 'wwwroot', 'data', 'definitions.json');
const BATCH_SIZE = 100;

// Load existing definitions (resume support)
let definitions = {};
if (fs.existsSync(OUT_PATH)) {
    definitions = JSON.parse(fs.readFileSync(OUT_PATH, 'utf8'));
    console.log(`Loaded ${Object.keys(definitions).length} existing definitions.`);
}

// Load word list
const words = fs.readFileSync(DICT_PATH, 'utf8')
    .split('\n')
    .map(w => w.trim().toUpperCase())
    .filter(w => w.length > 0);

console.log(`Dictionary has ${words.length} words.`);

// Find words still needing definitions
const remaining = words.filter(w => !definitions[w]);
console.log(`${remaining.length} words still need definitions.`);

if (remaining.length === 0) {
    console.log('All words defined! Nothing to do.');
    process.exit(0);
}

// Output batches for Claude to process
const batches = [];
for (let i = 0; i < remaining.length; i += BATCH_SIZE) {
    batches.push(remaining.slice(i, i + BATCH_SIZE));
}
console.log(`${batches.length} batches of ~${BATCH_SIZE} words remaining.`);
console.log('\nNext batch of words to define:');
console.log(JSON.stringify(batches[0]));

// Save helper: merge new definitions into file
// Called after Claude provides a batch of definitions
function saveBatch(newDefs) {
    Object.assign(definitions, newDefs);
    fs.writeFileSync(OUT_PATH, JSON.stringify(definitions, null, 0));
    console.log(`Saved. Total: ${Object.keys(definitions).length} / ${words.length}`);
}

// Export for use in interactive sessions
if (typeof module !== 'undefined') {
    module.exports = { definitions, remaining, batches, saveBatch, OUT_PATH };
}
