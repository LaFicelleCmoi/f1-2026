// Tests sans dépendance : node --test tests/
// Vérifient la détection mathématique du champion du monde (champion.js).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const ctx = {};
vm.createContext(ctx);
vm.runInContext(readFileSync(new URL("../champion.js", import.meta.url), "utf8") + "\n;globalThis.computeChampion = computeChampion;", ctx);
const { computeChampion } = ctx;

const PTS = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
// Course terminée : A gagne, B 2e (ou l'inverse)
const done = (round, winner = "A", second = "B", extra = {}) => ({
    round, name: `GP ${round}`, flag: "🏁", dates: { race: `${round} Mars 2026` },
    raceStatus: "completed",
    result: { fullResults: [
        { driver: winner, team: "T1", pos: 1, points: 25 },
        { driver: second, team: "T2", pos: 2, points: 18 }
    ] },
    qualiResults: [{ driver: winner, pos: 1 }],
    ...extra
});
const upcoming = (round, extra = {}) => ({ round, name: `GP ${round}`, flag: "🏳️", raceStatus: "upcoming", ...extra });

test("pas de champion tant que le titre est mathématiquement jouable", () => {
    // 3 victoires de A : écart 21, 2 courses restantes = 50 pts possibles
    const races = [done(1), done(2), done(3), upcoming(4), upcoming(5)];
    assert.equal(computeChampion({ races, pointsSystem: PTS }), null);
});

test("champion dès que l'écart dépasse les points restants", () => {
    // Écart 7 par course ; 10 courses gagnées = 70 d'avance, 2 restantes = 50 max
    const races = [...Array.from({ length: 10 }, (_, i) => done(i + 1)), upcoming(11), upcoming(12)];
    const c = computeChampion({ races, pointsSystem: PTS });
    assert.equal(c.driver, "A");
    assert.equal(c.points, 250);
    assert.equal(c.gap, 70);
    assert.equal(c.wins, 10);
    assert.equal(c.poles, 10);
    assert.equal(c.racesLeftAtClinch, 2);
    assert.equal(c.seasonOver, false);
});

test("détecte la course exacte où le titre est assuré", () => {
    // Après la course 8 : écart 56 > 2 restantes ×25 = 50 → titre au GP 8.
    // Après la course 7 : écart 49 < 3 restantes ×25 = 75.
    const races = [...Array.from({ length: 8 }, (_, i) => done(i + 1)), upcoming(9), upcoming(10)];
    assert.equal(computeChampion({ races, pointsSystem: PTS }).clinchRace.round, 8);
});

test("les sprints restants comptent dans les points encore distribuables", () => {
    // Écart 56, 2 courses restantes dont 1 sprint → 58 possibles : pas encore champion
    const races = [...Array.from({ length: 8 }, (_, i) => done(i + 1)), upcoming(9, { sprint: true }), upcoming(10)];
    assert.equal(computeChampion({ races, pointsSystem: PTS, sprintPoints: [8] }), null);
});

test("les courses annulées ne comptent pas comme restantes", () => {
    const races = [...Array.from({ length: 8 }, (_, i) => done(i + 1)),
        upcoming(9), upcoming(10), upcoming(11, { cancelled: true, raceStatus: "cancelled" })];
    assert.equal(computeChampion({ races, pointsSystem: PTS }).driver, "A");
});

test("égalité possible = pas encore champion", () => {
    // Écart exactement égal aux points restants : rien n'est joué
    const races = [done(1), done(2), done(3), done(4), done(5), done(6), done(7), done(8), done(9), done(10),
        upcoming(11), upcoming(12), { ...upcoming(13) }];
    // 70 d'avance, 3 courses = 75 → non
    assert.equal(computeChampion({ races, pointsSystem: PTS }), null);
});

test("fin de saison : seasonOver et titre à la dernière course", () => {
    const races = [done(1), done(2, "B", "A"), done(3)];
    const c = computeChampion({ races, pointsSystem: PTS });
    assert.equal(c.driver, "A");
    assert.equal(c.seasonOver, true);
    assert.equal(c.racesLeftAtClinch, 0);
});
