// ============================================================
// WordPlay — Level Data
// ============================================================

const LEVEL_PACKS = [
    {
        group: "Daybreak", pack: "Spark", theme: "sunrise",
        levels: [
            { letters: "ACT", words: ["ACT","CAT"], bonus: [] },
            { letters: "NOW", words: ["NOW","OWN","WON"], bonus: [] },
            { letters: "APT", words: ["APT","PAT","TAP"], bonus: [] },
            { letters: "ARE", words: ["ARE","EAR","ERA"], bonus: [] },
            { letters: "LADY", words: ["LADY","DAY","LAD","LAY"], bonus: [] },
            { letters: "PARK", words: ["PARK","ARK","PAR","RAP"], bonus: [] },
            { letters: "FAIR", words: ["FAIR","AIR","FAR","FIR"], bonus: [] },
            { letters: "DRIP", words: ["DRIP","DIP","RID","RIP"], bonus: [] },
            { letters: "UNTO", words: ["UNTO","NOT","NUT","OUT","TON"], bonus: ["TUN"] },
            { letters: "DENT", words: ["DENT","TEND","DEN","END","NET","TEN"], bonus: [] },
            { letters: "SKILL", words: ["SKILL","SILK","ILL","SKI"], bonus: ["ILLS","SILL","ILK","KILL","KILLS"] },
            { letters: "FORCE", words: ["FORCE","CORE","FORE","FOE","FOR"], bonus: ["REC","COR","ORC","ROE","ORE","REF","FRO"] },
            { letters: "SKEET", words: ["SKEET","SEEK","EEK","SEE","TEE"], bonus: ["EKE","EKES","TSK","SET","TEES"] },
            { letters: "DICED", words: ["DICED","DICE","ICED","DID","ICE"], bonus: ["DIE","DIED"] },
            { letters: "CIGAR", words: ["CIGAR","AIR","ARC","RAG","RIG"], bonus: ["GAR","CIG","CAR","CRAG"] },
            { letters: "NINTH", words: ["NINTH","HINT","THIN","INN","TIN"], bonus: ["NTH","NIT","HIT"] },
            { letters: "SAVED", words: ["SAVED","SAVE","VASE","ADS","SAD"], bonus: ["SEA","DEV"] },
            { letters: "ABBEY", words: ["ABBEY","BABE","BABY","AYE","BAY","BYE"], bonus: ["BEY","YEA","EBB","ABBE"] },
            { letters: "ROLES", words: ["ROLES","LOSE","ROSE","SOLE","SORE","ORE"], bonus: ["ROE","ROLE","LORE","EROS","ORES","ROES","SLOE","LOSER"] },
            { letters: "CONES", words: ["CONES","CONS","NOSE","ONCE","ONE","SON"], bonus: ["COS","CON","EON","ONES","EONS","CONE","SCONE"] },
            { letters: "BACON", words: ["BACON","BAN","BOA","CAB","CAN","NAB"], bonus: ["CON","COB"] },
            { letters: "ALIKE", words: ["ALIKE","LAKE","LEAK","LIKE","ELK","LIE"], bonus: ["ALE","LEA","LEK","KALE","AIL","LEI","ILK"] },
            { letters: "CLONE", words: ["CLONE","CONE","LONE","ONCE","CON","ONE"], bonus: ["EON","NOEL","CEL"] },
            { letters: "SCUBA", words: ["SCUBA","CABS","CUBS","ABS","CAB","CUB"], bonus: ["SAC","SUB","BUS","SCAB"] },
            { letters: "PIANO", words: ["PIANO","PAIN","ION","NAP","PAN","PIN"], bonus: ["NIP","PION"] },
        ]
    },
    {
        group: "Daybreak", pack: "Glow", theme: "sunrise",
        levels: [
            { letters: "SPICE", words: ["SPICE","EPIC","ICES","PIC","PIE","SIP"], bonus: ["ICE","PEC","PICE","SIC","PICS","PECS","SPEC","PIES","EPICS"] },
            { letters: "APPLY", words: ["APPLY","PLAY","APP","LAP","PAL","PAY"], bonus: ["PAP","YAP","LAY","PLY"] },
            { letters: "ALIEN", words: ["ALIEN","LANE","LEAN","LINE","NAIL","LIE"], bonus: ["LEI","NIL","LIEN","LEA","ALE","AIL","ELAN","LAIN"] },
            { letters: "BAKED", words: ["BAKED","BAKE","BEAD","BEAK","BAD","BED"], bonus: ["DAB","DEB","BADE"] },
            { letters: "PORCH", words: ["PORCH","CHOP","CROP","COP","HOP","PRO"], bonus: ["RHO","COR","ORC"] },
            { letters: "TWICE", words: ["TWICE","CITE","ICE","TIE","WET","WIT"], bonus: ["TIC","ETIC"] },
            { letters: "GRAPH", words: ["GRAPH","HARP","GAP","HAG","PAR","RAP"], bonus: ["PAH","RAH","RAG","GAR"] },
            { letters: "SURGE", words: ["SURGE","URGES","SURE","USER","RUG","SUE"], bonus: ["RUGS","RUE","USE","RUSE","RUES","ERG","URGE","REGS","ERGS"] },
            { letters: "CRAWL", words: ["CRAWL","CLAW","ARC","LAW","RAW","WAR"], bonus: ["AWL","CAR","CAW","CRAW"] },
            { letters: "BARN", words: ["BARN","BRAN","BAN","BAR","BRA","NAB","RAN"], bonus: ["ARB"] },
            { letters: "BEAT", words: ["BEAT","BETA","ATE","BAT","BET","EAT","TAB","TEA"], bonus: ["ETA","ABET"] },
            { letters: "TENTH", words: ["TENTH","TENT","THEN","HEN","NET","TEN","THE"], bonus: ["NTH"] },
            { letters: "PEACE", words: ["PEACE","CAPE","PACE","ACE","APE","CAP","PEA"], bonus: ["PEE","PEC"] },
            { letters: "TRACT", words: ["TRACT","CART","ART","CAR","CAT","RAT","TAR"], bonus: ["TART","ACT","TACT","ARC"] },
            { letters: "SIGHT", words: ["SIGHT","SIGH","THIS","HIS","HIT","ITS","SIT"], bonus: ["TIS","HITS","GIT","GITS","GIST"] },
            { letters: "MOVED", words: ["MOVED","DEMO","DOME","DOVE","MODE","MOVE","DOE"], bonus: ["ODE","MOD","MED","DEV"] },
            { letters: "LOTUS", words: ["LOTUS","LOST","LUST","SLOT","SOUL","LOT","OUT"], bonus: ["SOT","SOU","OUTS","OUST","LOTS","LOUT","LOUTS"] },
            { letters: "STYLE", words: ["STYLE","LEST","LETS","SET","SLY","YES","YET"], bonus: ["LYE","LEY","LEYS","LET","STY"] },
            { letters: "MEDIC", words: ["MEDIC","DICE","DIME","ICED","MICE","DIM","MID"], bonus: ["DIE","MED","ICE","EMIC"] },
            { letters: "THERE", words: ["THERE","THREE","HERE","THEE","TREE","HER","THE"], bonus: ["TEE","ERE","ETHER"] },
            { letters: "GLUED", words: ["GLUED","DUEL","GLUE","DUE","DUG","LED","LUG"], bonus: ["ELD","DEL","LUDE","LEG","GEL","LUGE","GELD"] },
            { letters: "CLOUD", words: ["CLOUD","COULD","COLD","LOUD","COD","DOC","DUO"], bonus: ["CUD","OUD","OLD","CLOD"] },
            { letters: "EAGLE", words: ["EAGLE","GLEE","AGE","ALE","GAL","GEL","LAG","LEG"], bonus: ["LEA","EEL","GALE","GEE"] },
            { letters: "URGED", words: ["URGED","DRUG","RUDE","URGE","DUE","DUG","RED","RUG"], bonus: ["ERG","RUE","RUED"] },
            { letters: "NEEDY", words: ["NEEDY","DENY","EYED","NEED","DEN","DYE","END","YEN"], bonus: ["EYE"] },
        ]
    },
    {
        group: "Daybreak", pack: "Warmth", theme: "sunrise",
        levels: [
            { letters: "WEEPY", words: ["WEEPY","WEEP","EWE","EYE","PEW","WEE","YEP","YEW"], bonus: ["PEE"] },
            { letters: "THINK", words: ["THINK","HINT","THIN","HIT","INK","KIN","KIT","TIN"], bonus: ["NIT","NTH","KNIT","KITH"] },
            { letters: "SHOWN", words: ["SHOWN","SHOW","SNOW","HOW","NOW","OWN","WHO","WON"], bonus: ["SON","NOSH","SOW","SOWN","OWNS","NOWS"] },
            { letters: "BLAND", words: ["BLAND","BALD","BAND","LAND","BAD","BAN","LAB","NAB"], bonus: ["AND","LAD","DAB"] },
            { letters: "SWARM", words: ["SWARM","SWAM","WARM","ARM","MAR","RAM","SAW","WAS"], bonus: ["ARMS","RAMS","MARS","RAW","WAR","MAW","WARS","MAWS","WARMS"] },
            { letters: "BASIL", words: ["BASIL","AILS","BAIL","BIAS","SAIL","SLAB","ABS","LAB"], bonus: ["BIS","SIB","LIB","LIBS","LABS","AIL","BAILS"] },
            { letters: "MARRY", words: ["MARRY","ARMY","ARM","MAR","MAY","RAM","RAY","YAM"], bonus: [] },
            { letters: "LOVED", words: ["LOVED","DOLE","DOVE","LOVE","DOE","LED","ODE","OLD"], bonus: ["VOLE","ELD","DEL","LODE","DEV","VELD"] },
            { letters: "ALONG", words: ["ALONG","GOAL","LOAN","LONG","AGO","GAL","LAG","NAG"], bonus: ["LOG","GAOL","NOG","ANGLO"] },
            { letters: "SETUP", words: ["SETUP","UPSET","PEST","STEP","PET","PUT","UPS","USE"], bonus: ["SUE","SET","SUET","PUS","SUP","PETS","SEPT","PUTS"] },
            { letters: "BRUTE", words: ["BRUTE","TUBER","TRUE","TUBE","BET","BUT","RUB","RUT","TUB"], bonus: ["RUE","REB","RUBE","REBUT"] },
            { letters: "SAINT", words: ["SAINT","SATIN","STAIN","TINS","ANT","ITS","SIN","SIT","TAN"], bonus: ["TIS","NIT","TIN","SNIT","NITS","SAT","ANTS","TANS","ANTI","ANTIS"] },
            { letters: "LEASH", words: ["LEASH","HEAL","SALE","SEAL","ALE","ASH","HAS","SEA","SHE"], bonus: ["AHS","LASH","LEA","ALES","HALE","SHALE","HEALS"] },
            { letters: "PEAKS", words: ["PEAKS","SPEAK","PEAK","PEAS","APE","ASK","SAP","SEA","SPA"], bonus: ["ASP","PEA","APSE","APES","SKA","SAKE","SPAKE"] },
            { letters: "DRAIN", words: ["DRAIN","DARN","RAID","RAIN","RIND","AID","AND","RAN","RID"], bonus: ["RAD","AIR","ARID","RAND","DIN","DINAR","NADIR"] },
            { letters: "GRAND", words: ["GRAND","DARN","DRAG","GRAD","RANG","AND","NAG","RAG","RAN"], bonus: ["GAR","RAD","GAD","RAND","DANG"] },
            { letters: "STRAW", words: ["STRAW","STAR","SWAT","WARS","ART","RAT","SAT","SAW","TAR","WAS"], bonus: ["WAR","RAW","WART","TARS","TSAR","RATS","ARTS","WARTS"] },
            { letters: "PITCH", words: ["PITCH","CHIP","ITCH","CHI","HIP","HIT","PHI","PIC","PIT","TIP"], bonus: ["TIC","CHIT","PITH"] },
            { letters: "SOLID", words: ["SOLID","IDOL","SILO","SLID","SOIL","SOLD","LID","OIL","OLD","SOD"], bonus: ["OILS","LIDS","IDOLS"] },
            { letters: "LODGE", words: ["LODGE","GOLD","LODE","DOG","EGO","GEL","GOD","LEG","LOG","OLD"], bonus: ["OGLE","LOGE","ODE","DOE","LED","ELD","DEL","DOLE","DOGE","GELD","OGLED"] },
            { letters: "OWING", words: ["OWING","GOWN","WING","GIN","ION","NOW","OWN","WIG","WIN","WON"], bonus: ["WINO","NOG"] },
            { letters: "DEFER", words: ["DEFER","FREED","DEER","FEED","FREE","REED","REEF","FED","FEE","RED"], bonus: ["REF","ERE"] },
            { letters: "DOUBT", words: ["DOUBT","BOUT","BOD","BUD","BUT","DOT","DUB","DUO","OUT","TUB"], bonus: ["BOT","OUD"] },
            { letters: "SHAKY", words: ["SHAKY","ASHY","ASH","ASK","HAS","HAY","SAY","SHY","SKY","YAK"], bonus: ["KAY","YAH","SKA","AHS","YAKS","SHAY"] },
            { letters: "KILLER", words: ["KRILL","RILE","ILL","IRE"], bonus: ["LEI","LIE","LIER","RILL","RILLE","ELK","LEK","ILK","LIKE","IRK","LIKER","KILL","KILLER"] },
        ]
    },
    {
        group: "Daybreak", pack: "Blush", theme: "sunrise",
        levels: [
            { letters: "FESCUE", words: ["FESCUE","CUE","FEE","SUE","USE"], bonus: ["FEU","FUSE","SEE","FEES","CUES","FECES"] },
            { letters: "FESCUE", words: ["FESCUE","CUE","FEE","SUE","USE"], bonus: ["FEU","FUSE","SEE","FEES","CUES","FECES"] },
            { letters: "FESCUE", words: ["FESCUE","CUE","FEE","SUE","USE"], bonus: ["FEU","FUSE","SEE","FEES","CUES","FECES"] },
            { letters: "FESCUE", words: ["FESCUE","CUE","FEE","SUE","USE"], bonus: ["FEU","FUSE","SEE","FEES","CUES","FECES"] },
            { letters: "FESCUE", words: ["FESCUE","CUE","FEE","SUE","USE"], bonus: ["FEU","FUSE","SEE","FEES","CUES","FECES"] },
            { letters: "FESCUE", words: ["FESCUE","CUE","FEE","SUE","USE"], bonus: ["FEU","FUSE","SEE","FEES","CUES","FECES"] },
            { letters: "FESCUE", words: ["FESCUE","CUE","FEE","SUE","USE"], bonus: ["FEU","FUSE","SEE","FEES","CUES","FECES"] },
            { letters: "FESCUE", words: ["FESCUE","CUE","FEE","SUE","USE"], bonus: ["FEU","FUSE","SEE","FEES","CUES","FECES"] },
            { letters: "FESCUE", words: ["FESCUE","CUE","FEE","SUE","USE"], bonus: ["FEU","FUSE","SEE","FEES","CUES","FECES"] },
            { letters: "FESCUE", words: ["FESCUE","CUE","FEE","SUE","USE"], bonus: ["FEU","FUSE","SEE","FEES","CUES","FECES"] },
            { letters: "FESCUE", words: ["FESCUE","CUE","FEE","SUE","USE"], bonus: ["FEU","FUSE","SEE","FEES","CUES","FECES"] },
            { letters: "FESCUE", words: ["FESCUE","CUE","FEE","SUE","USE"], bonus: ["FEU","FUSE","SEE","FEES","CUES","FECES"] },
            { letters: "FESCUE", words: ["FESCUE","CUE","FEE","SUE","USE"], bonus: ["FEU","FUSE","SEE","FEES","CUES","FECES"] },
            { letters: "CHISEL", words: ["CHISEL","CHILE","SLICE","ISLE","LIES"], bonus: ["ICES","LICE","LICH","LEIS","CHILES"] },
            { letters: "FESCUE", words: ["FESCUE","CUE","FEE","SUE","USE"], bonus: ["FEU","FUSE","SEE","FEES","CUES","FECES"] },
            { letters: "FESCUE", words: ["FESCUE","CUE","FEE","SUE","USE"], bonus: ["FEU","FUSE","SEE","FEES","CUES","FECES"] },
            { letters: "FESCUE", words: ["FESCUE","CUE","FEE","SUE","USE"], bonus: ["FEU","FUSE","SEE","FEES","CUES","FECES"] },
            { letters: "FESCUE", words: ["FESCUE","CUE","FEE","SUE","USE"], bonus: ["FEU","FUSE","SEE","FEES","CUES","FECES"] },
            { letters: "FESCUE", words: ["FESCUE","CUE","FEE","SUE","USE"], bonus: ["FEU","FUSE","SEE","FEES","CUES","FECES"] },
            { letters: "FESCUE", words: ["FESCUE","CUE","FEE","SUE","USE"], bonus: ["FEU","FUSE","SEE","FEES","CUES","FECES"] },
            { letters: "FESCUE", words: ["FESCUE","CUE","FEE","SUE","USE"], bonus: ["FEU","FUSE","SEE","FEES","CUES","FECES"] },
            { letters: "FESCUE", words: ["FESCUE","CUE","FEE","SUE","USE"], bonus: ["FEU","FUSE","SEE","FEES","CUES","FECES"] },
            { letters: "FESCUE", words: ["FESCUE","CUE","FEE","SUE","USE"], bonus: ["FEU","FUSE","SEE","FEES","CUES","FECES"] },
            { letters: "FESCUE", words: ["FESCUE","CUE","FEE","SUE","USE"], bonus: ["FEU","FUSE","SEE","FEES","CUES","FECES"] },
            { letters: "FESCUE", words: ["FESCUE","CUE","FEE","SUE","USE"], bonus: ["FEU","FUSE","SEE","FEES","CUES","FECES"] },
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
