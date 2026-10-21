// Tests sans dépendance : node --test tests/
// Vérifient la résolution de la saison active et l'intégrité des données
// de chaque saison (séparation, pas de résultat fictif, champs attendus).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const root = new URL("..", import.meta.url);
const src = (f) => readFileSync(new URL(f, root), "utf8");

// Charge seasons.js + données dans un contexte isolé, avec URL et
// localStorage simulés.
function load({ search = "", stored = null, now } = {}) {
    const store = new Map(stored ? [["f1-season", stored]] : []);
    const ctx = {
        location: { search, href: "https://example.test/index.html" + search },
        localStorage: {
            getItem: (k) => (store.has(k) ? store.get(k) : null),
            setItem: (k, v) => store.set(k, String(v))
        },
        URLSearchParams, URL,
        Date: now ? class extends Date { static now() { return now; } } : Date
    };
    vm.createContext(ctx);
    const code = ["seasons.js", "data.js", "data-2026.js", "data-2027.js"].map(src).join("\n;\n")
        + "\n;({ SEASON_CONFIG, SEASON_DATA, SeasonManager, ACTIVE_SEASON, countryContinent })";
    return { ...vm.runInContext(code, ctx), store };
}

test("démarre sur la saison par défaut sans préférence", () => {
    const { ACTIVE_SEASON, SEASON_CONFIG } = load();
    assert.equal(ACTIVE_SEASON, SEASON_CONFIG.defaultSeason);
    assert.equal(ACTIVE_SEASON, 2026);
});

test("priorité : ?season= > préférence mémorisée > défaut", () => {
    assert.equal(load({ stored: "2027" }).ACTIVE_SEASON, 2027);
    assert.equal(load({ search: "?season=2026", stored: "2027" }).ACTIVE_SEASON, 2026);
    assert.equal(load({ search: "?season=2027" }).ACTIVE_SEASON, 2027);
});

test("saison invalide ou inconnue → repli sur le défaut", () => {
    assert.equal(load({ search: "?season=1999" }).ACTIVE_SEASON, 2026);
    assert.equal(load({ search: "?season=abc", stored: "nope" }).ACTIVE_SEASON, 2026);
});

test("une saison désactivée est refusée et masquée", () => {
    const { SeasonManager, SEASON_CONFIG } = load();
    SEASON_CONFIG.seasons[2027].enabled = false;
    assert.equal(SeasonManager.resolve({ url: "2027", stored: null }), 2026);
    assert.deepEqual([...SeasonManager.available()], [2026]);
    SEASON_CONFIG.seasons[2027].enabled = true;
});

test("bascule automatique : facultative et sans effet si désactivée", () => {
    const { SeasonManager, SEASON_CONFIG } = load();
    const after = Date.parse("2027-02-01T00:00:00Z");
    const before = Date.parse("2026-12-01T00:00:00Z");
    // Désactivée (config livrée) : jamais de 2027 imposé
    assert.equal(SeasonManager.resolve({ url: null, stored: null, now: after }), 2026);
    // Activée : seulement après la date, et jamais au-dessus d'un choix explicite
    SEASON_CONFIG.autoSwitch.enabled = true;
    assert.equal(SeasonManager.resolve({ url: null, stored: null, now: before }), 2026);
    assert.equal(SeasonManager.resolve({ url: null, stored: null, now: after }), 2027);
    assert.equal(SeasonManager.resolve({ url: null, stored: "2026", now: after }), 2026);
    SEASON_CONFIG.autoSwitch.enabled = false;
});

test("persistance du choix et nœuds séparés par saison", () => {
    const ctx = load({ search: "?season=2027" });
    assert.equal(ctx.SeasonManager.firebaseNode(), "f1_results_2027");
    assert.equal(ctx.SeasonManager.predictionsKey(), "f1-predictions-2027");
    assert.equal(load().SeasonManager.firebaseNode(), "f1_results_2026");
});

test("chaque saison activée a ses données enregistrées", () => {
    const { SEASON_DATA, SeasonManager } = load();
    for (const y of SeasonManager.available()) {
        assert.ok(SEASON_DATA[y], `data-${y}.js manquant`);
        assert.ok(Array.isArray(SEASON_DATA[y].races));
    }
    // Pas d'objet partagé entre saisons (aucun mélange possible)
    assert.notEqual(SEASON_DATA[2026].races, SEASON_DATA[2027].races);
});

const FR_DATE = /^\d{1,2} (Janvier|Février|Mars|Avril|Mai|Juin|Juillet|Août|Septembre|Octobre|Novembre|Décembre) (\d{4})$/;

for (const year of [2026, 2027]) {
    test(`intégrité du calendrier ${year}`, () => {
        const { SEASON_DATA, countryContinent } = load();
        const d = SEASON_DATA[year];
        const rounds = new Set();
        for (const r of d.races) {
            assert.ok(!rounds.has(r.round), `round ${r.round} en double`);
            rounds.add(r.round);
            assert.ok(r.name && r.country && r.circuit && r.flag, `R${r.round} incomplet`);
            assert.ok(countryContinent[r.hostCountry || r.country], `continent manquant : ${r.country}`);
            const m = FR_DATE.exec(r.dates.race);
            assert.ok(m, `date illisible R${r.round} : ${r.dates.race}`);
            assert.equal(Number(m[2]), year, `R${r.round} n'est pas en ${year}`);
            for (const s of r.schedule) {
                assert.ok(s.time === null || /^\d{2}:\d{2}$/.test(s.time), `horaire invalide R${r.round}`);
            }
            assert.equal(r.sprint, r.schedule.some(s => s.type === "sprint"), `format sprint incohérent R${r.round}`);
        }
        assert.ok(Array.isArray(d.pointsSystem) && d.pointsSystem.length > 0);
    });
}

test("2027 : aucun résultat inventé, plateau = confirmés uniquement", () => {
    const { SEASON_DATA } = load();
    const d = SEASON_DATA[2027];
    assert.equal(d.races.length, 24);
    assert.ok(d.races.every(r => r.result === null && r.status === "upcoming"));
    // Plateau partiel : chaque pilote dans une écurie engagée, 2 max par écurie
    const teams = new Set(d.constructors.map(c => c.team));
    const perTeam = {};
    for (const p of d.drivers) {
        assert.ok(teams.has(p.team), `${p.driver} : écurie ${p.team} non engagée`);
        perTeam[p.team] = (perTeam[p.team] || 0) + 1;
        assert.ok(perTeam[p.team] <= 2, `plus de 2 pilotes chez ${p.team}`);
    }
    assert.equal(new Set(d.drivers.map(p => p.driver)).size, d.drivers.length, "pilote en double");
    if (d.drivers.length < d.constructors.length * 2) {
        assert.equal(d.status.drivers, "partial", "plateau incomplet : status.drivers doit valoir partial");
    }
    assert.equal(d.status.sessionTimes, "unconfirmed");
    assert.ok(d.races.every(r => r.schedule.every(s => s.time === null)));
});

test("2026 : calendrier historique conservé", () => {
    const { SEASON_DATA } = load();
    const d = SEASON_DATA[2026];
    assert.equal(d.races.length, 24);
    assert.equal(d.drivers.length, 22);
    assert.equal(d.status.sessionTimes, "confirmed");
    assert.ok(d.races.find(r => r.round === 4 && r.hostCountry === "Malaisie"));
});
