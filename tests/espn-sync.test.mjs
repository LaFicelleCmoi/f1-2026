// Tests du cœur de synchro ESPN (espn-sync.js) avec de fausses données ESPN :
// aucun appel réseau. node --test tests/*.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const EspnSync = require("../espn-sync.js");

const ctx = {
    drivers: [
        { driver: "Max Verstappen", team: "Red Bull Racing", flag: "" },
        { driver: "Lando Norris", team: "McLaren", flag: "" },
        { driver: "Andrea Kimi Antonelli", team: "Mercedes", flag: "" }
    ],
    pointsSystem: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1],
    sprintPoints: [8, 7, 6, 5, 4, 3, 2, 1]
};

const final = { type: { completed: true, name: "STATUS_FINAL" } };
const scheduled = { type: { completed: false, name: "STATUS_SCHEDULED" } };
const competitors = (names, winnerFirst = false) => names.map((n, i) => ({
    id: String(100 + i), order: i + 1, winner: winnerFirst && i === 0, athlete: { displayName: n }
}));

// Week-end au Brésil : EL1 terminée, qualifs et course à venir
const brazilEvent = (sessions) => ({
    id: "E1", date: "2026-11-06T15:30Z",
    circuit: { address: { country: "Brazil", city: "São Paulo" } },
    competitions: sessions
});
const brazilRace = () => ({
    round: 21, name: "Grand Prix du Brésil", country: "Brésil", city: "São Paulo",
    sprint: false, status: "upcoming", raceStatus: "upcoming", result: null
});

// Faux fetch ESPN : temps des essais / statut d'abandon
const fakeFetch = (opts = {}) => async (url) => {
    if (opts.fail) return { ok: false, json: async () => ({}) };
    if (url.includes("/statistics")) {
        return { ok: true, json: async () => ({ splits: { categories: [{ stats: [
            { name: "totalTime", displayValue: "1:10.123" }, { name: "lapsCompleted", displayValue: "24" }
        ] }] } }) };
    }
    if (url.includes("/status")) {
        const retired = url.includes("/competitors/102/");
        return { ok: true, json: async () => ({ type: { name: retired ? "STATUS_RETIRED" : "STATUS_FINAL" }, period: 40 }) };
    }
    return { ok: false, json: async () => ({}) };
};

test("une séance terminée est importée sans attendre la course", async () => {
    const race = brazilRace();
    const ev = brazilEvent([
        { id: "C1", type: { abbreviation: "FP1" }, status: final, competitors: competitors(["Lando Norris", "Max Verstappen"]) },
        { id: "C2", type: { abbreviation: "Qual" }, status: scheduled, competitors: [] },
        { id: "C3", type: { abbreviation: "Race" }, status: scheduled, competitors: [] }
    ]);
    const res = await EspnSync.syncRaces([race], [ev], ctx, { fetch: fakeFetch() });
    assert.equal(res.synced, 1);
    assert.equal(race.fp1Results.length, 2);
    assert.equal(race.fp1Results[0].driver, "Lando Norris");
    assert.equal(race.fp1Results[0].time, "1:10.123");
    assert.equal(race.fp1Results[0]._espnId, undefined, "champ technique nettoyé");
    assert.equal(race.result, null, "pas de résultat de course inventé");
    assert.equal(race.raceStatus, "upcoming");
});

test("course terminée : résultat, points, DNF et statut completed", async () => {
    const race = brazilRace();
    const ev = brazilEvent([
        { id: "R", type: { abbreviation: "Race" }, status: final,
          competitors: competitors(["Max Verstappen", "Lando Norris", "Kimi Antonelli"], true) }
    ]);
    await EspnSync.syncRaces([race], [ev], ctx, { fetch: fakeFetch() });
    assert.equal(race.raceStatus, "completed");
    assert.deepEqual(race.result.fullResults.map(r => r.points), [25, 18, 15]);
    assert.equal(race.result.fullResults[2].driver, "Andrea Kimi Antonelli", "nom ESPN résolu");
    assert.equal(race.result.fullResults[2].status, "dnf");
    assert.equal(race.result.fullResults[2].retiredLap, 40);
    assert.equal(race.result.podium.length, 3);
});

test("panne d'ESPN pendant l'enrichissement : les données connues sont gardées", async () => {
    const race = brazilRace();
    race.result = { podium: [], fullResults: [{ pos: 3, driver: "Andrea Kimi Antonelli", status: "dnf", retiredLap: 40 }] };
    race.fp1Results = [{ pos: 1, driver: "Lando Norris", time: "1:10.123", laps: 24 }];
    const ev = brazilEvent([
        { id: "C1", type: { abbreviation: "FP1" }, status: final, competitors: competitors(["Lando Norris"]) },
        { id: "R", type: { abbreviation: "Race" }, status: final,
          competitors: competitors(["Max Verstappen", "Lando Norris", "Kimi Antonelli"], true) }
    ]);
    await EspnSync.syncRaces([race], [ev], ctx, { fetch: fakeFetch({ fail: true }) });
    assert.equal(race.result.fullResults[2].status, "dnf");
    assert.equal(race.fp1Results[0].time, "1:10.123");
});

test("résultats sans vainqueur côté ESPN : nettoyés ; course annulée : intacte", async () => {
    const wrong = brazilRace();
    wrong.raceStatus = "completed";
    wrong.result = { podium: [], fullResults: [{ pos: 1, driver: "Lando Norris" }] };
    const cancelled = { round: 5, name: "GP annulé", country: "Arabie Saoudite", cancelled: true,
                        raceStatus: "cancelled", result: null };
    const ev = brazilEvent([{ id: "R", type: { abbreviation: "Race" }, status: scheduled, competitors: [] }]);
    const res = await EspnSync.syncRaces([wrong, cancelled], [ev], ctx, { fetch: fakeFetch() });
    assert.equal(res.cleaned, 1);
    assert.equal(wrong.result, null);
    assert.equal(wrong.raceStatus, "upcoming");
    assert.equal(cancelled.raceStatus, "cancelled");
});

test("écurie réelle du week-end lue chez ESPN (remplacements, remplaçants)", async () => {
    // Cas réel 2026 R14-R16 : Lawson (Racing Bulls dans la liste) pilote la Red Bull
    const drivers = [...ctx.drivers, { driver: "Liam Lawson", team: "Racing Bulls", flag: "" }];
    const vehicles = { "100": "Red Bull", "101": "Racing Bulls" };
    const teamFetch = async (url) => {
        const m = /competitors\/(\d+)\?lang/.exec(url);
        if (m) return { ok: true, json: async () => ({ vehicle: { manufacturer: vehicles[m[1]] } }) };
        return fakeFetch()(url);
    };
    const race = brazilRace();
    const ev = brazilEvent([{ id: "R", type: { abbreviation: "Race" }, status: final,
        competitors: competitors(["Liam Lawson", "Yuki Tsunoda"], true) }]);
    await EspnSync.syncRaces([race], [ev], { ...ctx, drivers, teamAliases: { "Red Bull": "Red Bull Racing" } }, { fetch: teamFetch });
    assert.equal(race.result.fullResults[0].team, "Red Bull Racing", "Lawson compté chez Red Bull ce week-end");
    assert.equal(race.result.fullResults[1].driver, "Yuki Tsunoda", "remplaçant gardé sous son nom ESPN");
    assert.equal(race.result.fullResults[1].team, "Racing Bulls", "écurie du remplaçant fournie par ESPN");
});

test("écurie ESPN indisponible : on garde l'écurie déjà connue", async () => {
    const race = brazilRace();
    race.result = { podium: [], fullResults: [{ pos: 1, driver: "Rafael Câmara", team: "Haas" }] };
    const ev = brazilEvent([{ id: "R", type: { abbreviation: "Race" }, status: final,
        competitors: competitors(["Rafael Câmara"], true) }]);
    await EspnSync.syncRaces([race], [ev], ctx, { fetch: fakeFetch({ fail: true }) });
    assert.equal(race.result.fullResults[0].team, "Haas");
});

test("noms comparés sans accents (« Câmara » ESPN = « Camara » local)", () => {
    const drivers = [{ driver: "Rafael Camara", team: "Haas", flag: "" }];
    assert.equal(EspnSync.resolveDriver("Rafael Câmara", drivers).driver, "Rafael Camara");
    assert.equal(EspnSync.resolveDriver("Rafael Câmara", drivers).team, "Haas");
});

test("filtre incrémental `only` respecté", async () => {
    const race = brazilRace();
    const ev = brazilEvent([{ id: "C1", type: { abbreviation: "FP1" }, status: final, competitors: competitors(["Lando Norris"]) }]);
    await EspnSync.syncRaces([race], [ev], ctx, { fetch: fakeFetch(), only: () => false });
    assert.equal(race.fp1Results, undefined);
});

test("saison : ESPN renvoyant une autre année est filtré", () => {
    const json = { events: [{ date: "2026-03-06T04:30Z" }, { date: "2027-03-12T08:00Z" }] };
    assert.equal(EspnSync.seasonEvents(json, 2027).length, 1);
    assert.equal(EspnSync.seasonEvents(json, 2028).length, 0);
});

test("format Firebase stable", () => {
    const [row] = EspnSync.serialize([{ round: 1, sprint: true }]);
    assert.deepEqual(Object.keys(row), ["round", "raceStatus", "sprintStatus", "status", "result",
        "sprintResult", "schedule", "qualiResults", "sprintQualiResults", "fp1Results", "fp2Results", "fp3Results"]);
    assert.equal(row.raceStatus, "upcoming");
    assert.equal(row.sprintStatus, "upcoming");
});
