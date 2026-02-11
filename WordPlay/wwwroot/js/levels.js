// ============================================================
// WordPlay — Level Data
// ============================================================

const LEVEL_PACKS = [
    {
        group: "Sunrise", pack: "Rise", theme: "sunrise",
        levels: [
            { letters: "ACT", words: ["CAT", "ACT"], bonus: ["AT"] },
            { letters: "OPT", words: ["POT", "TOP", "OPT"], bonus: ["TO"] },
            { letters: "RAT", words: ["ART", "RAT", "TAR"], bonus: ["AT"] },
            { letters: "WON", words: ["OWN", "NOW", "WON"], bonus: ["ON", "NO"] },
        ]
    },
    {
        group: "Sunrise", pack: "Grow", theme: "sunrise",
        levels: [
            { letters: "AELP", words: ["ALE", "LAP", "PAL", "PEA", "APE", "PALE", "LEAP"], bonus: ["LEA", "PLEA"] },
            { letters: "ADRE", words: ["ARE", "EAR", "ERA", "RED", "READ", "DEAR", "DARE"], bonus: ["RAD"] },
            { letters: "EIST", words: ["SET", "SIT", "TIE", "ITS", "SITE", "TIES"], bonus: [] },
            { letters: "ALST", words: ["SAT", "ALT", "LAST", "SALT", "SLAT"], bonus: ["LAS", "LAT"] },
        ]
    },
    {
        group: "Sunrise", pack: "Shine", theme: "sunrise",
        levels: [
            { letters: "AEGR", words: ["AGE", "ARE", "EAR", "ERA", "GEAR", "RAGE"], bonus: ["GAR", "RAG", "ERG"] },
            { letters: "ORST", words: ["ROT", "SORT", "ROTS", "TORS"], bonus: ["ORT"] },
            { letters: "DLOW", words: ["LOW", "OWL", "OLD", "WOLD"], bonus: [] },
            { letters: "AEKM", words: ["MAKE", "MEEK", "TAME"], bonus: [] },
        ]
    },
    {
        group: "Forest", pack: "Pine", theme: "forest",
        levels: [
            { letters: "ACHR", words: ["ARC", "CAR", "ARCH", "CHAR"], bonus: [] },
            { letters: "EIKL", words: ["ILK", "LIE", "LIKE", "KITE"], bonus: ["LEI", "ELK"] },
            { letters: "ADNS", words: ["AND", "SAD", "SAND", "DANS"], bonus: ["ADS"] },
            { letters: "GINR", words: ["GIN", "RIG", "RING", "GRIN"], bonus: [] },
            { letters: "ABES", words: ["BASE", "EASE", "BEES"], bonus: [] },
            { letters: "CKLO", words: ["LOCK", "CLOCK", "COCK"], bonus: [] },
            { letters: "BELO", words: ["LOB", "OLE", "LOBE", "BOLE"], bonus: [] },
            { letters: "AEHLS", words: ["ASH", "HAS", "SEA", "SHE", "ALE", "HEAL", "SALE", "SEAL", "LEASH"], bonus: ["SHA", "LEA", "HALE", "SHALE"] },
        ]
    },
    {
        group: "Forest", pack: "Dew", theme: "forest",
        levels: [
            { letters: "ABCSU", words: ["CAB", "CUB", "CABS", "CUBS", "SCUBA"], bonus: ["BUS", "SAC", "SUB", "SCAB"] },
            { letters: "ADEGR", words: ["AGE", "RED", "DEAR", "GEAR", "AGED", "GRADE"], bonus: ["RAG", "ERG", "RAD", "DRAG"] },
            { letters: "EORST", words: ["ORE", "TOE", "ROT", "SET", "REST", "ROSE", "SORT", "TORE", "STORE"], bonus: ["RES", "ORT"] },
            { letters: "AILNS", words: ["AIL", "SIN", "NAIL", "SAIL", "SLAIN", "SNAIL"], bonus: ["NIS", "ANI"] },
            { letters: "DELMO", words: ["OLD", "MOLE", "MODE", "DEMO", "MODEL"], bonus: ["ODE", "ELM", "DOE", "LED"] },
            { letters: "ACINP", words: ["CAN", "NAP", "PAN", "PIN", "NIP", "PAIN", "PANIC"], bonus: ["CAP"] },
            { letters: "CEIMN", words: ["ICE", "MEN", "MINE", "MICE", "NICE", "MINCE"], bonus: ["MIC"] },
            { letters: "ACRST", words: ["ARC", "CAR", "CAT", "SAT", "TAR", "CART", "CARS", "CAST", "SCAR", "STAR", "CARTS"], bonus: ["ART", "RAT", "ARS"] },
            { letters: "BDEOR", words: ["BED", "ORE", "RED", "ROD", "BORE", "ROBE", "RODE", "BORED"], bonus: ["DOE", "ODE", "BRO", "ROB"] },
            { letters: "DEILM", words: ["DIM", "MID", "DIME", "MILD", "MILE", "LIMED"], bonus: ["DIE", "MIL", "LID", "LIE", "ELM"] },
            { letters: "AEGMN", words: ["AGE", "MAN", "MEN", "GEM", "NAME", "GAME", "MANE", "MANGE"], bonus: ["GAM", "MAG", "NAG"] },
            { letters: "FHIST", words: ["FIT", "HIS", "HIT", "SIT", "FIST", "FISH", "HITS", "THIS", "SHIFT"], bonus: ["IFS", "ITS"] },
        ]
    },
    {
        group: "Canyon", pack: "Ravine", theme: "canyon",
        levels: [
            { letters: "EGINR", words: ["GIN", "RIG", "IRE", "RING", "GRIN", "REIN", "REIGN"], bonus: ["ERG", "GEN"] },
            { letters: "EFLST", words: ["ELF", "LET", "SET", "FELT", "LEFT", "SELF"], bonus: ["ELS"] },
            { letters: "DEIPR", words: ["DIP", "RID", "RIP", "DRIP", "DIRE", "RIDE", "PIER", "PRIDE"], bonus: ["IRE", "PIE", "RED"] },
            { letters: "CHORT", words: ["HOT", "ROT", "TORCH"], bonus: ["COT", "ORC", "ORT"] },
            { letters: "ADEHL", words: ["ALE", "HAD", "LED", "DALE", "DEAL", "LEAD", "HEAL", "HEAD"], bonus: ["LAD", "ELD"] },
            { letters: "EILNP", words: ["LIE", "PEN", "PIE", "PIN", "LINE", "PINE"], bonus: ["LEI", "LIP", "NIP", "NIL"] },
            { letters: "ABELT", words: ["ATE", "BAT", "BET", "EAT", "BEAT", "BELT", "LATE", "TALE", "TABLE"], bonus: ["ALE", "TAB", "TEA", "BETA", "BALE"] },
            { letters: "FORSW", words: ["FOR", "ROW", "SOW", "ROWS", "FROW"], bonus: [] },
        ]
    },
    {
        group: "Canyon", pack: "Pass", theme: "canyon",
        levels: [
            { letters: "AEGMOR", words: ["AGE", "ERA", "GEM", "ORE", "MORE", "OGRE", "ROAM", "OMEGA"], bonus: ["ARM", "GAM", "MAR", "RAM"] },
            { letters: "ACINOT", words: ["CAN", "COT", "ION", "NOT", "TAN", "TIN", "COIN", "INTO", "COAT", "ACTION"], bonus: ["ANT", "CON", "OAT"] },
            { letters: "BEGLNO", words: ["BOG", "EGO", "LOG", "BONE", "GONE", "LOBE", "LONE", "LONG", "NOBLE", "BELONG"], bonus: ["BEG", "GEL", "GOB", "ONE"] },
            { letters: "DEFLOR", words: ["ELF", "FOR", "OLD", "ORE", "RED", "FORD", "ROLE", "LORE", "OLDER", "FOLDER"], bonus: ["DOE", "FOE", "ROD", "ROE"] },
            { letters: "EHIKRS", words: ["HER", "IRE", "SHE", "SKI", "HEIR", "HIRE", "HIKE", "RISE", "SHIRE", "HIKER", "SHIRK"], bonus: ["HIS", "SIR"] },
            { letters: "CEOPRS", words: ["COP", "ORE", "COPE", "CORE", "CROP", "PORE", "ROPE", "SCOPE", "SCORE", "CORPSE"], bonus: ["ORC", "REC", "SEC"] },
            { letters: "BEGNRU", words: ["BEG", "BUG", "BUN", "GUN", "RUB", "RUG", "RUN", "BURN", "GRUB", "RUNG", "BEGUN"], bonus: ["BUR", "ERG", "GNU", "NUB", "RUE"] },
            { letters: "DGINRW", words: ["DIG", "GIN", "RIG", "WIN", "GRID", "GRIN", "RING", "WIND", "WING", "WRING"], bonus: ["DIN", "RID", "WIG"] },
        ]
    },
    {
        group: "Sky", pack: "Wind", theme: "sky",
        levels: [
            { letters: "ACENOR", words: ["ACE", "CAN", "EAR", "ONE", "ORE", "ACNE", "CANE", "CONE", "CORE", "CRANE", "OCEAN"], bonus: ["ARC", "CON", "ERA", "NOR", "OAR", "RAN"] },
            { letters: "AEFKLS", words: ["ALE", "ELF", "ELK", "SEA", "FAKE", "FLAK", "LAKE", "LEAK", "SAFE", "SAKE", "SALE", "SEAL", "FLAKE"], bonus: ["KEA", "LEA"] },
            { letters: "DEIRST", words: ["DIE", "SET", "SIR", "TIE", "DIET", "DIRE", "DIRT", "REST", "RIDE", "SIDE", "SITE", "TIRE", "TRIED", "STRIDE"], bonus: ["IDS", "IRE", "ITS", "RED", "RID"] },
            { letters: "CEILPS", words: ["ICE", "LIE", "LIP", "PIE", "SIP", "CLIP", "EPIC", "ISLE", "LICE", "PILE", "SLIP", "SLICE", "SPICE", "SPLICE"], bonus: ["CEL", "ELS", "LEI", "SEC", "SIC"] },
            { letters: "AEHOST", words: ["ATE", "EAT", "HAS", "HAT", "HOT", "OAT", "SET", "SHE", "THE", "TOE", "HATE", "HEAT", "HOST", "SHOE", "SHOT", "THOSE"], bonus: ["ASH", "ETA", "HOE", "TEA"] },
            { letters: "ABILMT", words: ["AIM", "BAT", "BIT", "LIT", "BAIL", "BAIT", "LAMB", "LIMB", "MALT", "MAIL", "TAIL"], bonus: ["ALT", "LAM", "MAT", "MIL", "TAB"] },
            { letters: "ABCDER", words: ["ACE", "ARC", "BAR", "BED", "CAR", "RED", "ACRE", "BEAD", "BEAR", "BRED", "CARD", "CARE", "CRAB", "DEAR", "RACE", "BRACE"], bonus: ["BAD", "DAB", "EAR", "ERA", "RAD"] },
            { letters: "GHINST", words: ["GIN", "HIS", "HIT", "ITS", "NIT", "SIN", "SIT", "TIN", "GIST", "HINT", "SHIN", "SING", "THIS", "THING", "NIGHT", "SIGHT"], bonus: ["GIT", "INS", "NIS"] },
        ]
    },
];

// Flatten into a single ordered list
const ALL_LEVELS = [];
let _levelNum = 0;
for (const pack of LEVEL_PACKS) {
    for (const level of pack.levels) {
        _levelNum++;
        ALL_LEVELS.push({
            ...level,
            group: pack.group,
            pack: pack.pack,
            theme: pack.theme,
            levelNumber: _levelNum,
        });
    }
}
