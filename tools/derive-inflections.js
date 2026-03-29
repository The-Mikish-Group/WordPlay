// tools/derive-inflections.js
// Derives definitions for inflected forms (plurals, past tenses, etc.)
// from base words already in definitions.json.
// Run after fetch-definitions.js completes to fill gaps.

const fs = require('fs');
const path = require('path');

const OUT_PATH = path.join(__dirname, '..', 'WordPlay', 'wwwroot', 'data', 'definitions.json');
const FAILED_PATH = path.join(__dirname, 'failed-words.txt');

let defs = JSON.parse(fs.readFileSync(OUT_PATH, 'utf8'));
const failed = fs.readFileSync(FAILED_PATH, 'utf8').split('\n').map(w => w.trim()).filter(w => w.length > 0);

console.log(`Existing definitions: ${Object.keys(defs).length}`);
console.log(`Failed words to derive: ${failed.length}`);

// Build lowercase lookup for existing defs
const hasWord = (w) => !!defs[w];

const suffixRules = [
    // Plural / third person -S
    { suffix: 'S', derive: (base, word) => {
        const bp = defs[base]?.p || '';
        if (bp.includes('noun')) return { p: 'noun', d: [`Plural of ${base.toLowerCase()}`] };
        if (bp.includes('verb')) return { p: 'verb', d: [`Third person singular of ${base.toLowerCase()}`] };
        return { p: bp, d: [`Plural or inflected form of ${base.toLowerCase()}`] };
    }},
    // -ES plural
    { suffix: 'ES', derive: (base, word) => {
        const bp = defs[base]?.p || '';
        if (bp.includes('noun')) return { p: 'noun', d: [`Plural of ${base.toLowerCase()}`] };
        if (bp.includes('verb')) return { p: 'verb', d: [`Third person singular of ${base.toLowerCase()}`] };
        return { p: bp, d: [`Plural or inflected form of ${base.toLowerCase()}`] };
    }},
    // -ED past tense
    { suffix: 'ED', derive: (base) => ({ p: 'verb', d: [`Past tense of ${base.toLowerCase()}`] }) },
    // -ING present participle
    { suffix: 'ING', derive: (base) => ({ p: 'verb', d: [`Present participle of ${base.toLowerCase()}`] }) },
    // -ER comparative / agent noun
    { suffix: 'ER', derive: (base) => {
        const bp = defs[base]?.p || '';
        if (bp.includes('adj')) return { p: 'adj', d: [`Comparative form of ${base.toLowerCase()}`] };
        return { p: 'noun', d: [`One who ${base.toLowerCase()}s`] };
    }},
    // -ERS plural agent
    { suffix: 'ERS', derive: (base) => ({ p: 'noun', d: [`Plural of ${base.toLowerCase()}er; those who ${base.toLowerCase()}`] }) },
    // -EST superlative
    { suffix: 'EST', derive: (base) => ({ p: 'adj', d: [`Superlative form of ${base.toLowerCase()}`] }) },
    // -LY adverb
    { suffix: 'LY', derive: (base) => ({ p: 'adv', d: [`In a ${base.toLowerCase()} manner`] }) },
    // -NESS noun from adj
    { suffix: 'NESS', derive: (base) => ({ p: 'noun', d: [`The state or quality of being ${base.toLowerCase()}`] }) },
    // -MENT noun from verb
    { suffix: 'MENT', derive: (base) => ({ p: 'noun', d: [`The act or result of ${base.toLowerCase()}ing`] }) },
    // -TION / -SION noun
    { suffix: 'TION', derive: (base) => ({ p: 'noun', d: [`The act or process of ${base.toLowerCase()}ing`] }) },
    // -ABLE / -IBLE
    { suffix: 'ABLE', derive: (base) => ({ p: 'adj', d: [`Capable of being ${base.toLowerCase()}ed`] }) },
    // -IER comparative
    { suffix: 'IER', derive: (base) => ({ p: 'adj', d: [`Comparative form of ${base.toLowerCase()}y`] }) },
    // -IEST superlative
    { suffix: 'IEST', derive: (base) => ({ p: 'adj', d: [`Superlative form of ${base.toLowerCase()}y`] }) },
];

// Special patterns: doubled consonant + suffix (e.g., STOPPED -> STOP + P + ED)
const doubledConsonantBases = (word, suffix) => {
    const stem = word.slice(0, -suffix.length);
    if (stem.length >= 2 && stem[stem.length - 1] === stem[stem.length - 2]) {
        return stem.slice(0, -1); // remove doubled consonant
    }
    return null;
};

// E-dropping patterns (e.g., MAKING -> MAKE - E + ING)
const eDropBases = (word, suffix) => {
    const stem = word.slice(0, -suffix.length);
    return stem + 'E';
};

let derived = 0;
const stillFailed = [];

for (const word of failed) {
    if (defs[word]) continue; // already defined somehow

    let found = false;
    for (const rule of suffixRules) {
        if (!word.endsWith(rule.suffix)) continue;
        const base = word.slice(0, -rule.suffix.length);

        // Direct base match
        if (base.length >= 2 && hasWord(base)) {
            defs[word] = rule.derive(base, word);
            derived++;
            found = true;
            break;
        }
        // Doubled consonant (STOPPING -> STOP)
        const dcBase = doubledConsonantBases(word, rule.suffix);
        if (dcBase && dcBase.length >= 2 && hasWord(dcBase)) {
            defs[word] = rule.derive(dcBase, word);
            derived++;
            found = true;
            break;
        }
        // E-drop (MAKING -> MAKE)
        const eBase = eDropBases(word, rule.suffix);
        if (eBase.length >= 3 && hasWord(eBase)) {
            defs[word] = rule.derive(eBase, word);
            derived++;
            found = true;
            break;
        }
    }

    // Special: -IED -> -Y (CARRIED -> CARRY)
    if (!found && word.endsWith('IED')) {
        const yBase = word.slice(0, -3) + 'Y';
        if (hasWord(yBase)) {
            defs[word] = { p: 'verb', d: [`Past tense of ${yBase.toLowerCase()}`] };
            derived++;
            found = true;
        }
    }
    // Special: -IES -> -Y (CARRIES -> CARRY)
    if (!found && word.endsWith('IES')) {
        const yBase = word.slice(0, -3) + 'Y';
        if (hasWord(yBase)) {
            const bp = defs[yBase]?.p || '';
            if (bp.includes('noun')) defs[word] = { p: 'noun', d: [`Plural of ${yBase.toLowerCase()}`] };
            else defs[word] = { p: 'verb', d: [`Third person singular of ${yBase.toLowerCase()}`] };
            derived++;
            found = true;
        }
    }
    // Special: -YING -> -Y (CARRYING -> CARRY... wait, that's already ING)
    // Special: -ATION -> -ATE (CREATION -> CREATE)
    if (!found && word.endsWith('ATION')) {
        const ateBase = word.slice(0, -5) + 'ATE';
        if (hasWord(ateBase)) {
            defs[word] = { p: 'noun', d: [`The act or result of ${ateBase.toLowerCase().slice(0, -1)}ing`] };
            derived++;
            found = true;
        }
    }

    if (!found) {
        stillFailed.push(word);
    }
}

fs.writeFileSync(OUT_PATH, JSON.stringify(defs));
fs.writeFileSync(path.join(__dirname, 'still-failed-words.txt'), stillFailed.join('\n'));

console.log(`\nDerived ${derived} inflected definitions`);
console.log(`Total definitions now: ${Object.keys(defs).length}`);
console.log(`Still undefined: ${stillFailed.length}`);
console.log(`Saved to still-failed-words.txt`);
