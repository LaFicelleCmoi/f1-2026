#!/usr/bin/env node
// ============================================================
// 🤖 Synchro ESPN → Firebase côté serveur (GitHub Actions, toutes les 5 min)
// ============================================================
// Importe dans Firebase chaque session dès qu'ESPN la publie (EL, qualifs,
// sprint, course), sans qu'un admin ait besoin d'ouvrir le site.
// Même logique que le bouton admin : cœur partagé ../espn-sync.js.
//
// Usage :
//   node tools/espn-sync.mjs              # incrémental (week-ends récents)
//   node tools/espn-sync.mjs --full       # toute la saison
//   node tools/espn-sync.mjs --dry-run    # n'écrit rien, affiche les changements
//
// Écriture : compte admin Firebase via variables d'environnement
//   F1_ADMIN_EMAIL, F1_ADMIN_PASSWORD   (secrets GitHub, jamais dans le code)
// Sans ces variables, le script tourne en lecture seule (dry-run).
// Aucune dépendance : Node 18+ (fetch natif).
// ============================================================
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import vm from "node:vm";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const FULL = args.includes("--full");
const email = process.env.F1_ADMIN_EMAIL;
const password = process.env.F1_ADMIN_PASSWORD;
const DRY = args.includes("--dry-run") || !email || !password;
if ((!email || !password) && process.env.GITHUB_ACTIONS) {
    console.log("::warning::Secrets F1_ADMIN_EMAIL / F1_ADMIN_PASSWORD absents : synchro en lecture seule, rien n'est écrit dans Firebase.");
}

// Fenêtre incrémentale : courses de J-4 à J+3 + toute course passée non terminée
const WINDOW_BEFORE_MS = 4 * 86400000;
const WINDOW_AFTER_MS  = 3 * 86400000;

// ── Chargement des scripts du site (mêmes fichiers que le navigateur) ──
const ctx = vm.createContext({ console, URL, URLSearchParams });
const dataFiles = readdirSync(root).filter(f => /^data-\d{4}\.js$/.test(f)).sort();
for (const f of ["seasons.js", "data.js", ...dataFiles, "espn-sync.js"]) {
    vm.runInContext(readFileSync(join(root, f), "utf8"), ctx, { filename: f });
}
const { SEASON_CONFIG, SEASON_DATA, EspnSync } = vm.runInContext(
    "({ SEASON_CONFIG, SEASON_DATA, EspnSync })", ctx);

// Config Firebase publique : lue dans app.js (source unique)
const appJs = readFileSync(join(root, "app.js"), "utf8");
const API_KEY = /apiKey:\s*"([^"]+)"/.exec(appJs)?.[1];
const DB_URL  = /databaseURL:\s*"([^"]+)"/.exec(appJs)?.[1];
if (!API_KEY || !DB_URL) throw new Error("Config Firebase introuvable dans app.js");

async function getJson(url, init) {
    const res = await fetch(url, init);
    if (!res.ok) throw new Error(`${init?.method || "GET"} ${url.split("?")[0]} → HTTP ${res.status} ${await res.text().catch(() => "")}`);
    return res.json();
}

async function signIn() {
    const r = await getJson(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, returnSecureToken: true })
    });
    return r.idToken;
}

// Données Firebase → objets course (données de la saison + champs enregistrés)
const SAVED_FIELDS = ["raceStatus", "sprintStatus", "status", "result", "sprintResult", "schedule",
    "qualiResults", "sprintQualiResults", "fp1Results", "fp2Results", "fp3Results"];
function buildRaces(dataRaces, saved) {
    const list = Array.isArray(saved) ? saved.filter(Boolean) : Object.values(saved || {});
    return dataRaces.map(base => {
        const race = structuredClone(base);
        const found = list.find(s => s.round === race.round);
        if (found) for (const k of SAVED_FIELDS) if (found[k] !== undefined) race[k] = found[k];
        return race;
    });
}

// JSON à clés triées : Firebase renvoie les clés dans l'ordre alphabétique,
// la comparaison ne doit dépendre que des valeurs.
const canon = (v) => JSON.stringify(v ?? null, (k, x) =>
    x && typeof x === "object" && !Array.isArray(x)
        ? Object.fromEntries(Object.keys(x).sort().map(key => [key, x[key]]))
        : x);

// Résumé lisible des changements par course
function diffRounds(before, after) {
    const out = [];
    after.forEach((a, i) => {
        const b = before[i] || {};
        const keys = Object.keys(a).filter(k => canon(a[k]) !== canon(b[k]));
        if (keys.length) out.push(`R${a.round}: ${keys.join(", ")}`);
    });
    return out;
}

let token = null;
let exitCode = 0;
const now = Date.now();

for (const year of Object.keys(SEASON_CONFIG.seasons).map(Number)) {
    if (!SEASON_CONFIG.seasons[year].enabled || !SEASON_DATA[year]) continue;
    const data = SEASON_DATA[year];
    const node = `f1_results_${year}`;
    try {
        const json = await getJson(EspnSync.scoreboardUrl(year), { headers: { "Cache-Control": "no-cache" } });
        const events = EspnSync.seasonEvents(json, year);
        if (!events.length) { console.log(`[${year}] ESPN : aucun événement publié — rien à faire.`); continue; }

        const saved = await getJson(`${DB_URL}/${node}.json`);
        const races = buildRaces(data.races, saved);
        const before = EspnSync.serialize(races);

        // Mode incrémental : week-ends autour d'aujourd'hui + courses passées
        // pas encore terminées dans Firebase. --full : toute la saison.
        const raceDate = new Map(races.map(r => {
            const ev = EspnSync.findEventForRace(r, events);
            const d = ev && Date.parse(EspnSync.getSession(ev, "Race")?.date || ev.date);
            return [r, isNaN(d) ? null : d];
        }));
        const only = FULL ? null : (race) => {
            const d = raceDate.get(race);
            if (d === null || d > now + WINDOW_AFTER_MS) return false;
            return d >= now - WINDOW_BEFORE_MS || race.raceStatus !== "completed";
        };

        const ctxSeason = { drivers: data.drivers, pointsSystem: data.pointsSystem, sprintPoints: data.sprintPoints };
        const res = await EspnSync.syncRaces(races, events, ctxSeason, { only, fetch });
        const after = EspnSync.serialize(races);
        const changes = diffRounds(before, after);

        if (!changes.length) {
            console.log(`[${year}] ✓ Firebase déjà à jour (${res.synced} course(s) vérifiée(s)).`);
            continue;
        }
        console.log(`[${year}] Changements :\n  ${changes.join("\n  ")}`);
        if (DRY) {
            console.log(`[${year}] DRY-RUN : rien n'est écrit${!email || !password ? " (F1_ADMIN_EMAIL / F1_ADMIN_PASSWORD absents)" : ""}.`);
            continue;
        }
        token = token || await signIn();
        await getJson(`${DB_URL}/${node}.json?auth=${token}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(after)
        });
        console.log(`[${year}] ✅ Firebase mis à jour (${changes.length} course(s)).`);
    } catch (e) {
        // Une saison en échec ne bloque pas les autres ; le job sort en erreur
        console.error(`[${year}] ❌ ${e.message}`);
        exitCode = 1;
    }
}
process.exit(exitCode);
