#!/usr/bin/env node
// ============================================================
// 🛠️ Génère data-AAAA.js depuis OpenF1 (calendrier officiel F1)
// ============================================================
// Usage :
//   node tools/build-season-data.mjs 2027                 # horaires « À confirmer »
//   node tools/build-season-data.mjs 2027 --with-times    # horaires officiels publiés
//
// - Les dates des week-ends et le format (sprint ou non) viennent du flux
//   officiel F1 relayé par OpenF1.
// - Sans --with-times, les horaires sont laissés à null : OpenF1 publie des
//   heures provisoires tant que la F1 affiche « TBC ». Relancer avec
//   --with-times une fois les horaires officiels annoncés.
// - Pilotes et écuries ne sont JAMAIS générés : ils se renseignent à la main
//   dans data-AAAA.js quand le plateau est officialisé.
// Aucune dépendance : Node 18+ (fetch natif).
// ============================================================
import { writeFileSync, existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const year = parseInt(process.argv[2], 10);
const withTimes = process.argv.includes("--with-times");
if (!year) {
    console.error("Usage: node tools/build-season-data.mjs <année> [--with-times]");
    process.exit(1);
}

// Pays OpenF1 → { nom FR, drapeau }
const COUNTRIES = {
    "Australia": ["Australie", "🇦🇺"], "China": ["Chine", "🇨🇳"], "Japan": ["Japon", "🇯🇵"],
    "Bahrain": ["Bahreïn", "🇧🇭"], "Saudi Arabia": ["Arabie Saoudite", "🇸🇦"],
    "United States": ["États-Unis", "🇺🇸"], "Canada": ["Canada", "🇨🇦"], "Monaco": ["Monaco", "🇲🇨"],
    "Spain": ["Espagne", "🇪🇸"], "Austria": ["Autriche", "🇦🇹"], "United Kingdom": ["Royaume-Uni", "🇬🇧"],
    "Great Britain": ["Royaume-Uni", "🇬🇧"], "Belgium": ["Belgique", "🇧🇪"], "Hungary": ["Hongrie", "🇭🇺"],
    "Netherlands": ["Pays-Bas", "🇳🇱"], "Italy": ["Italie", "🇮🇹"], "Azerbaijan": ["Azerbaïdjan", "🇦🇿"],
    "Singapore": ["Singapour", "🇸🇬"], "Mexico": ["Mexique", "🇲🇽"], "Brazil": ["Brésil", "🇧🇷"],
    "Qatar": ["Qatar", "🇶🇦"], "United Arab Emirates": ["Émirats Arabes Unis", "🇦🇪"],
    "Portugal": ["Portugal", "🇵🇹"], "Turkey": ["Turquie", "🇹🇷"], "Türkiye": ["Turquie", "🇹🇷"],
    "Malaysia": ["Malaisie", "🇲🇾"]
};

// Nom de GP OpenF1 → nom FR
const GP_NAMES = {
    "Bahrain Grand Prix": "Grand Prix de Bahreïn", "Saudi Arabian Grand Prix": "Grand Prix d'Arabie Saoudite",
    "Australian Grand Prix": "Grand Prix d'Australie", "Japanese Grand Prix": "Grand Prix du Japon",
    "Chinese Grand Prix": "Grand Prix de Chine", "Miami Grand Prix": "Grand Prix de Miami",
    "Canadian Grand Prix": "Grand Prix du Canada", "Monaco Grand Prix": "Grand Prix de Monaco",
    "Portuguese Grand Prix": "Grand Prix du Portugal", "British Grand Prix": "Grand Prix de Grande-Bretagne",
    "Austrian Grand Prix": "Grand Prix d'Autriche", "Belgian Grand Prix": "Grand Prix de Belgique",
    "Hungarian Grand Prix": "Grand Prix de Hongrie", "Dutch Grand Prix": "Grand Prix des Pays-Bas",
    "Italian Grand Prix": "Grand Prix d'Italie", "Spanish Grand Prix": "Grand Prix d'Espagne",
    "Barcelona Grand Prix": "Grand Prix de Barcelone-Catalogne",
    "Azerbaijan Grand Prix": "Grand Prix d'Azerbaïdjan", "Turkish Grand Prix": "Grand Prix de Turquie",
    "Singapore Grand Prix": "Grand Prix de Singapour", "United States Grand Prix": "Grand Prix des États-Unis",
    "Mexican Grand Prix": "Grand Prix du Mexique", "Mexico City Grand Prix": "Grand Prix du Mexique",
    "São Paulo Grand Prix": "Grand Prix du Brésil", "Las Vegas Grand Prix": "Grand Prix de Las Vegas",
    "Qatar Grand Prix": "Grand Prix du Qatar", "Abu Dhabi Grand Prix": "Grand Prix d'Abu Dhabi"
};

// Nom court OpenF1 → nom complet du circuit (mêmes libellés que data-2026.js)
const CIRCUITS = {
    "Sakhir": "Bahrain International Circuit", "Jeddah": "Jeddah Corniche Circuit",
    "Melbourne": "Albert Park Circuit", "Suzuka": "Suzuka International Racing Course",
    "Shanghai": "Shanghai International Circuit", "Miami": "Miami International Autodrome",
    "Montreal": "Circuit Gilles-Villeneuve", "Monte Carlo": "Circuit de Monaco",
    "Algarve International Circuit": "Autódromo Internacional do Algarve",
    "Silverstone": "Silverstone Circuit", "Spielberg": "Red Bull Ring",
    "Spa-Francorchamps": "Circuit de Spa-Francorchamps", "Hungaroring": "Hungaroring",
    "Zandvoort": "Circuit Zandvoort", "Monza": "Autodromo Nazionale Monza", "Madring": "Madring",
    "Catalunya": "Circuit de Barcelona-Catalunya", "Baku": "Baku City Circuit",
    "Istanbul": "Istanbul Park", "Singapore": "Marina Bay Street Circuit",
    "Austin": "Circuit of the Americas", "Mexico City": "Autodromo Hermanos Rodriguez",
    "Interlagos": "Autodromo José Carlos Pace", "Las Vegas": "Las Vegas Strip Circuit",
    "Lusail": "Lusail International Circuit", "Yas Marina Circuit": "Yas Marina Circuit",
    "Sepang": "Sepang International Circuit"
};

// Ville affichée quand le « location » OpenF1 est un nom de pays
const CITIES = { "Sakhir": "Sakhir" };

// "Spa-Francorchamps" → "spafrancorchamps", "Yas Marina Circuit" → "yasmarinacircuit"
const trackSlug = (shortName) => shortName.normalize("NFD").toLowerCase().replace(/[^a-z]/g, "");

// Session OpenF1 → libellé/type utilisés par l'app
const SESSIONS = {
    "Practice 1": ["Essais Libres 1", "fp"], "Practice 2": ["Essais Libres 2", "fp"],
    "Practice 3": ["Essais Libres 3", "fp"], "Sprint Qualifying": ["Qualifications Sprint", "quali"],
    "Sprint Shootout": ["Qualifications Sprint", "quali"], "Sprint": ["Sprint", "sprint"],
    "Qualifying": ["Qualifications", "quali"], "Race": ["Course", "race"]
};

const MONTHS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août",
    "Septembre", "Octobre", "Novembre", "Décembre"];
const SHORT = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
const DAYS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

// Date locale du circuit (offset "+04:00:00" / "-05:00:00")
function localDate(iso, gmtOffset) {
    const m = /^(-?)(\d{2}):(\d{2})/.exec(gmtOffset || "00:00");
    const sign = m && m[1] === "-" ? -1 : 1;
    const mins = m ? sign * (parseInt(m[2]) * 60 + parseInt(m[3])) : 0;
    return new Date(Date.parse(iso) + mins * 60000);
}

function parisTime(iso) {
    return new Intl.DateTimeFormat("fr-FR", {
        timeZone: "Europe/Paris", hour: "2-digit", minute: "2-digit", hour12: false
    }).format(new Date(iso));
}

function parisDay(iso) {
    const d = new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", weekday: "long" }).format(new Date(iso));
    return d.charAt(0).toUpperCase() + d.slice(1);
}

function fullRange(a, b) {
    const sameMonth = a.getUTCMonth() === b.getUTCMonth();
    return sameMonth
        ? `${a.getUTCDate()} – ${b.getUTCDate()} ${MONTHS[b.getUTCMonth()]} ${b.getUTCFullYear()}`
        : `${a.getUTCDate()} ${SHORT[a.getUTCMonth()]} – ${b.getUTCDate()} ${SHORT[b.getUTCMonth()]} ${b.getUTCFullYear()}`;
}

async function getJson(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
    return res.json();
}

const meetings = (await getJson(`https://api.openf1.org/v1/meetings?year=${year}`))
    .filter(m => !/testing/i.test(m.meeting_name))
    .sort((a, b) => a.date_start.localeCompare(b.date_start));
const sessions = await getJson(`https://api.openf1.org/v1/sessions?year=${year}`);
if (meetings.length === 0) {
    console.error(`Aucun Grand Prix ${year} publié sur OpenF1 pour l'instant.`);
    process.exit(2);
}

const missing = new Set();
const races = meetings.map((m, i) => {
    const country = COUNTRIES[m.country_name] || (missing.add(`pays: ${m.country_name}`), [m.country_name, "🏁"]);
    const name = GP_NAMES[m.meeting_name] || (missing.add(`GP: ${m.meeting_name}`), m.meeting_name);
    const circuit = CIRCUITS[m.circuit_short_name] || (missing.add(`circuit: ${m.circuit_short_name}`), m.circuit_short_name);
    const own = sessions
        .filter(s => s.meeting_key === m.meeting_key && SESSIONS[s.session_name])
        .sort((a, b) => a.date_start.localeCompare(b.date_start));
    const raceSession = own.find(s => s.session_name === "Race");
    // Jours : heure de Paris si horaires officiels, sinon date locale du circuit
    const schedule = own.map(s => {
        const [label, type] = SESSIONS[s.session_name];
        const day = withTimes ? parisDay(s.date_start) : DAYS[localDate(s.date_start, m.gmt_offset).getUTCDay()];
        return { day, name: label, time: withTimes ? parisTime(s.date_start) : null, type };
    });
    const start = localDate(m.date_start, m.gmt_offset);
    const end = localDate(m.date_end, m.gmt_offset);
    const raceDay = raceSession ? localDate(raceSession.date_start, m.gmt_offset) : end;
    return {
        round: i + 1,
        name,
        country: country[0],
        flag: country[1],
        circuit,
        city: CITIES[m.circuit_short_name] || m.location,
        // Tracé officiel F1 (fond des cartes) : …/{année}track{track}blackoutline.svg
        track: trackSlug(m.circuit_short_name),
        dates: {
            full: fullRange(start, end),
            race: `${raceDay.getUTCDate()} ${MONTHS[raceDay.getUTCMonth()]} ${raceDay.getUTCFullYear()}`
        },
        sprint: own.some(s => s.session_name === "Sprint"),
        status: m.is_cancelled ? "cancelled" : "upcoming",
        isNew: false,
        ...(m.is_cancelled ? { cancelled: true } : {}),
        result: null,
        schedule
    };
});

const sportsDbNames = Object.fromEntries(meetings.map((m, i) => [i + 1, m.meeting_name]));

// Conserve pilotes / écuries / barème déjà saisis à la main si le fichier existe
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outFile = join(root, `data-${year}.js`);
let manual = { drivers: [], constructors: [], pointsSystem: null, sprintPoints: null, statusDrivers: "unknown", statusPoints: "unconfirmed", driversAsOf: null };
if (existsSync(outFile)) {
    let captured = null;
    const fn = new Function("registerSeasonData", readFileSync(outFile, "utf8"));
    fn((y, d) => { captured = d; });
    if (captured) {
        manual = {
            drivers: captured.drivers || [],
            constructors: captured.constructors || [],
            pointsSystem: captured.pointsSystem,
            sprintPoints: captured.sprintPoints,
            statusDrivers: captured.status?.drivers || "unknown",
            statusPoints: captured.status?.points || "unconfirmed",
            driversAsOf: captured.status?.driversAsOf || null
        };
    }
}

// Sérialisation au format de data-2026.js (clés nues, une session par ligne)
const lit = (v) => JSON.stringify(v).replace(/"([a-zA-Z_]\w*)":/g, "$1: ").replace(/,(?=[a-z"{\d])/g, ", ");
const raceBlock = (r) => {
    const { schedule, dates, ...rest } = r;
    const head = Object.entries(rest).map(([k, v]) => `${k}: ${lit(v)}`);
    return `        {
            ${head.slice(0, 4).join(", ")},
            ${head.slice(4, 7).join(", ")},
            dates: ${lit(dates)},
            ${head.slice(7).join(", ")},
            schedule: [
${schedule.map(e => "                " + lit(e)).join(",\n")}
            ]
        }`;
};
const list = (arr) => arr.length ? "[\n" + arr.map(x => "        " + lit(x)).join(",\n") + "\n    ]" : "[]";
const out = `// ============================================================
// 🏁 SAISON ${year} — généré par tools/build-season-data.mjs (OpenF1)
// ============================================================
// Calendrier et format sprint : officiels (flux F1 via OpenF1).
// Horaires : ${withTimes ? "officiels (heure de Paris)" : "à confirmer (time: null) — relancer avec --with-times à l'annonce"}.
// Pilotes / écuries : à saisir à la main dès l'officialisation du plateau
// (laisser vide tant que ce n'est pas confirmé — l'app affiche « À confirmer »).
// Résultats : Firebase, nœud f1_results_${year} (séparé des autres saisons).
registerSeasonData(${year}, {
    status: {
        calendar: "confirmed",
        sessionTimes: "${withTimes ? "confirmed" : "unconfirmed"}",
        drivers: "${manual.statusDrivers}",${manual.driversAsOf ? `
        driversAsOf: "${manual.driversAsOf}",` : ""}
        points: "${manual.statusPoints}"
    },

    // Barème : celui de la saison précédente par défaut, à vérifier dans le
    // règlement sportif ${year}. Sans effet tant qu'aucun résultat n'existe.
    pointsSystem: ${lit(manual.pointsSystem || [25, 18, 15, 12, 10, 8, 6, 4, 2, 1])},
    sprintPoints: ${lit(manual.sprintPoints || [8, 7, 6, 5, 4, 3, 2, 1])},

    drivers: ${list(manual.drivers)},
    constructors: ${list(manual.constructors)},

    races: [
${races.map(raceBlock).join(",\n")}
    ],

    // TheSportsDB : round → nom de recherche (images)
    sportsDbNames: {
${Object.entries(sportsDbNames).map(([k, v]) => `        ${k}: ${JSON.stringify(v)}`).join(",\n")}
    }
});
`;
writeFileSync(outFile, out);
console.log(`✅ data-${year}.js : ${races.length} GP, ${races.filter(r => r.sprint).length} sprints, horaires ${withTimes ? "officiels" : "à confirmer"}`);
if (missing.size) console.warn("⚠️ Libellés non traduits (à compléter dans le script) :", [...missing].join(", "));
