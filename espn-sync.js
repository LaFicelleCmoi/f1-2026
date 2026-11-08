// ============================================================
// ⚡ SYNCHRO ESPN — cœur partagé navigateur (app.js) + serveur
//    (tools/espn-sync.mjs, lancé par GitHub Actions)
// ============================================================
// Aucune dépendance au DOM ni à Firebase : on lui passe les courses,
// les événements ESPN et le contexte de la saison (pilotes, barèmes).
// Une session est importée DÈS QU'ESPN LA MARQUE TERMINÉE (EL, qualifs,
// sprint, course) — pas besoin d'attendre la fin du week-end.
// ============================================================

const EspnSync = (() => {
    const CORE = "https://sports.core.api.espn.com/v2/sports/racing/leagues/f1";

    const scoreboardUrl = (season) =>
        `https://site.api.espn.com/apis/site/v2/sports/racing/f1/scoreboard?dates=${season}`;

    // ⚠️ Pour une saison pas encore publiée, ESPN renvoie la saison en cours :
    // on ne garde que les événements de l'année demandée (jamais de mélange).
    const seasonEvents = (json, season) =>
        (json?.events || []).filter(ev => String(ev.date || "").startsWith(String(season)));

    // Pays local (FR) → pays du circuit ESPN (circuit.address.country).
    // ⚠️ On matche sur le PAYS DU CIRCUIT, pas sur le nom de l'événement :
    // les noms ESPN contiennent des sponsors ("Qatar Airways Australian GP")
    // qui provoquaient de faux positifs (le GP du Qatar récupérait l'Australie).
    const countryMap = {
        "Australie": "australia", "Chine": "china", "Japon": "japan",
        "Bahreïn": "bahrain", "Arabie Saoudite": "saudi arabia",
        "États-Unis": "usa", "Canada": "canada", "Monaco": "monaco",
        "Espagne": "spain", "Autriche": "austria", "Royaume-Uni": "britain",
        "Belgique": "belgium", "Hongrie": "hungary", "Pays-Bas": "netherlands",
        "Italie": "italy", "Azerbaïdjan": "azerbaijan", "Singapour": "singapore",
        "Malaisie": "malaysia", "Portugal": "portugal", "Turquie": "turkey",
        "Mexique": "mexico", "Brésil": "brazil", "Qatar": "qatar",
        "Émirats Arabes Unis": "united arab emirates"
    };
    // Indices pour départager les pays à plusieurs GP (USA ×3, Espagne ×2)
    const cityKw = {
        "Miami Gardens": ["miami"], "Austin": ["united states", "austin"],
        "Las Vegas": ["vegas"], "Barcelone": ["barcelona", "catalu"],
        "Madrid": ["spanish", "madrid"]
    };

    // Trouve l'événement ESPN d'une course locale. Le pays du circuit DOIT
    // correspondre (score minimum 10) — élimine les collisions de sponsors.
    function findEventForRace(race, events) {
        // hostCountry : pays réel du circuit (GP de Bahreïn couru en Malaisie)
        const wantCountry = countryMap[race.hostCountry || race.country];
        if (!wantCountry) return null;
        const localCity = (race.city || "").toLowerCase();
        let best = null, bestScore = 0;
        for (const ev of events) {
            const addr      = ev.circuit?.address || {};
            const evCountry = (addr.country || "").toLowerCase();
            const evCity    = (addr.city || "").toLowerCase();
            const name      = (ev.shortName || ev.name || "").toLowerCase();
            if (evCountry !== wantCountry) continue;
            let score = 10;
            for (const kw of (cityKw[race.city] || [])) {
                if (name.includes(kw) || evCity.includes(kw)) score += 6;
            }
            if (localCity && evCity && (evCity.includes(localCity) || localCity.includes(evCity))) score += 6;
            if (score > bestScore) { bestScore = score; best = ev; }
        }
        return bestScore >= 10 ? best : null;
    }

    // Minuscules sans accents : « Câmara » (ESPN) = « Camara » (données)
    const fold = (str) => String(str).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    // Nom ESPN ("Kimi Antonelli") → pilote de la saison
    function resolveDriver(fullName, drivers) {
        if (!fullName) return { driver: "", team: "", flag: "" };
        const clean = fullName.trim();
        let m = drivers.find(d => d.driver === clean) || drivers.find(d => fold(d.driver) === fold(clean));
        if (m) return m;
        const parts = fold(clean).split(/\s+/);
        const last = parts[parts.length - 1];
        m = drivers.find(d => fold(d.driver).includes(last));
        if (m) return m;
        m = drivers.find(d => parts.some(p => p.length > 2 && fold(d.driver).includes(p)));
        if (m) return m;
        // Pilote hors liste (remplaçant) : l'écurie viendra d'ESPN (applyTeams)
        return { driver: clean, team: "", flag: "" };
    }

    // Session ESPN → lignes {pos, driver, team, points}
    // kind : "race" | "sprint" | "quali" | "sprintQuali" | "fp"
    function extractSession(competition, kind, ctx) {
        if (!competition || !Array.isArray(competition.competitors)) return [];
        return competition.competitors
            .slice()
            .sort((a, b) => (a.order || 99) - (b.order || 99))
            .map(c => {
                const name = c.athlete?.displayName || c.athlete?.fullName || "";
                const resolved = resolveDriver(name, ctx.drivers);
                const pos = parseInt(c.order) || 0;
                const entry = { pos, driver: resolved.driver, team: resolved.team };
                if (kind === "race")   entry.points = ctx.pointsSystem[pos - 1] || 0;
                if (kind === "sprint") entry.points = ctx.sprintPoints[pos - 1] || 0;
                // espnId temporaire pour l'enrichissement (statut / temps)
                if (c.id) entry._espnId = String(c.id);
                return entry;
            })
            .filter(e => e.driver);
    }

    // Statut DNF/DSQ + tour d'abandon (1 requête par pilote). En place.
    async function enrichStatus(rows, eventId, competitionId, fetchFn) {
        if (!rows?.length || !eventId || !competitionId) return rows;
        const base = `${CORE}/events/${eventId}/competitions/${competitionId}/competitors`;
        await Promise.all(rows.map(async (row) => {
            if (!row._espnId) return;
            try {
                const res = await fetchFn(`${base}/${row._espnId}/status?lang=en`);
                if (!res.ok) return;
                const s = await res.json();
                const name = s?.type?.name || "";
                if (name === "STATUS_RETIRED") {
                    row.status = "dnf";
                    const lap = parseInt(s?.period);
                    if (!isNaN(lap) && lap > 0) row.retiredLap = lap;
                } else if (name === "STATUS_DISQUALIFIED") {
                    row.status = "dsq";
                    row.points = 0; // un DSQ ne marque aucun point
                }
            } catch (e) { /* statut indispo : ligne inchangée */ }
        }));
        rows.forEach(r => { delete r._espnId; });
        return rows;
    }

    // Meilleur tour, écart et nombre de tours des essais (1 requête par pilote)
    async function enrichTimes(rows, eventId, competitionId, fetchFn) {
        if (!rows?.length || !eventId || !competitionId) return rows;
        const base = `${CORE}/events/${eventId}/competitions/${competitionId}/competitors`;
        await Promise.all(rows.map(async (row) => {
            if (!row._espnId) return;
            try {
                const res = await fetchFn(`${base}/${row._espnId}/statistics?lang=en`);
                if (!res.ok) return;
                const st = await res.json();
                const stats = {};
                (st?.splits?.categories || []).forEach(cat =>
                    (cat.stats || []).forEach(s => { stats[s.name] = s.displayValue; })
                );
                if (stats.totalTime && stats.totalTime !== "0.000") row.time = stats.totalTime;
                if (stats.behindTime && row.pos > 1) row.gap = stats.behindTime;
                const laps = parseInt(stats.lapsCompleted);
                if (!isNaN(laps) && laps > 0) row.laps = laps;
            } catch (e) { /* temps indispo : ligne inchangée */ }
        }));
        rows.forEach(r => { delete r._espnId; });
        return rows;
    }

    // Si une requête d'enrichissement a échoué, on garde la valeur déjà
    // connue pour ce pilote : une panne passagère d'ESPN ne doit jamais
    // effacer un DNF ou un temps déjà importé.
    function keepKnown(rows, previous, fields) {
        if (!Array.isArray(previous) || !previous.length) return rows;
        rows.forEach(row => {
            const old = previous.find(p => p.driver === row.driver);
            if (!old) return;
            fields.forEach(f => { if (row[f] === undefined && old[f] !== undefined) row[f] = old[f]; });
        });
        return rows;
    }

    // Écurie réellement pilotée ce week-end, d'après ESPN (vehicle.manufacturer).
    // Indispensable pour les remplacements (ex. 2026 : Lawson chez Red Bull et
    // Tsunoda chez Racing Bulls du R14 au R16) : la liste fixe des pilotes
    // attribuait sinon les points à la mauvaise écurie. Une requête par pilote
    // et par week-end (cache), échec silencieux → on garde l'écurie connue.
    async function applyTeams(rows, ev, competitionId, ctx, fetchFn, previous) {
        if (!rows?.length) return rows;
        ev._teams = ev._teams || {};
        const base = `${CORE}/events/${ev.id}/competitions/${competitionId}/competitors`;
        await Promise.all(rows.map(async (row) => {
            const id = row._espnId;
            if (!id) return;
            if (!(id in ev._teams)) {
                ev._teams[id] = (async () => {
                    try {
                        const res = await fetchFn(`${base}/${id}?lang=en`);
                        if (!res.ok) return null;
                        const m = (await res.json())?.vehicle?.manufacturer;
                        return m ? ((ctx.teamAliases || {})[m] || m) : null;
                    } catch (e) { return null; }
                })();
            }
            const team = await ev._teams[id];
            if (team) row.team = team;
            else {
                const old = Array.isArray(previous) && previous.find(p => p.driver === row.driver);
                if (old?.team) row.team = old.team;
            }
        }));
        return rows;
    }

    const getSession = (ev, abbr) =>
        (ev.competitions || []).find(c => (c.type?.abbreviation || "") === abbr) || null;

    // Session terminée et publiée (ESPN : STATUS_FINAL + classement présent)
    const isSessionFinal = (comp) =>
        !!comp && comp.status?.type?.completed === true && (comp.competitors || []).length > 0;

    // Course terminée avec un vainqueur
    function raceHasResults(ev) {
        const race = getSession(ev, "Race");
        return !!race && (race.competitors || []).some(c => c.winner === true);
    }

    const podiumOf = (rows) => rows.slice(0, 3).map(r => ({ pos: r.pos, driver: r.driver, team: r.team }));

    // Importe toutes les sessions terminées d'une course. Renvoie le nombre
    // de sessions importées. Modifie `race` en place.
    async function syncRace(race, ev, ctx, fetchFn) {
        let imported = 0;
        const sess = (abbr) => { const c = getSession(ev, abbr); return isSessionFinal(c) ? c : null; };

        // Course (+ DNF/DSQ) — seulement avec un vainqueur officiel
        const raceSess = sess("Race");
        if (raceSess && raceHasResults(ev)) {
            const rows = extractSession(raceSess, "race", ctx);
            if (rows.length) {
                await applyTeams(rows, ev, raceSess.id, ctx, fetchFn, race.result?.fullResults);
                await enrichStatus(rows, ev.id, raceSess.id, fetchFn);
                keepKnown(rows, race.result?.fullResults, ["status", "retiredLap"]);
                race.result = { podium: podiumOf(rows), fullResults: rows };
                race.raceStatus = "completed";
                race.status = "completed";
                imported++;
            }
        }
        // Qualifications
        const q = sess("Qual");
        if (q) {
            const rows = extractSession(q, "quali", ctx);
            if (rows.length) {
                await applyTeams(rows, ev, q.id, ctx, fetchFn, race.qualiResults);
                rows.forEach(r => delete r._espnId);
                race.qualiResults = rows;
                imported++;
            }
        }
        // Sprint + qualifs sprint
        const sr = sess("SR");
        if (sr) {
            const rows = extractSession(sr, "sprint", ctx);
            if (rows.length) {
                await applyTeams(rows, ev, sr.id, ctx, fetchFn, race.sprintResult?.fullResults);
                await enrichStatus(rows, ev.id, sr.id, fetchFn);
                keepKnown(rows, race.sprintResult?.fullResults, ["status", "retiredLap"]);
                race.sprintResult = { podium: podiumOf(rows), fullResults: rows };
                race.sprintStatus = "completed";
                imported++;
            }
        }
        const ss = sess("SS");
        if (ss) {
            const rows = extractSession(ss, "sprintQuali", ctx);
            if (rows.length) {
                await applyTeams(rows, ev, ss.id, ctx, fetchFn, race.sprintQualiResults);
                rows.forEach(r => delete r._espnId);
                race.sprintQualiResults = rows;
                imported++;
            }
        }
        // Essais libres (les week-ends sprint n'ont que l'EL1)
        for (const [abbr, key] of [["FP1", "fp1Results"], ["FP2", "fp2Results"], ["FP3", "fp3Results"]]) {
            const fp = sess(abbr);
            if (!fp) continue;
            const rows = extractSession(fp, "fp", ctx);
            if (!rows.length) continue;
            await applyTeams(rows, ev, fp.id, ctx, fetchFn, race[key]);
            await enrichTimes(rows, ev.id, fp.id, fetchFn);
            keepKnown(rows, race[key], ["time", "gap", "laps"]);
            race[key] = rows;
            imported++;
        }
        return imported;
    }

    // Synchronise toute une saison.
    // `ctx` = { drivers, pointsSystem, sprintPoints, teamAliases }.
    // `opts.only(race)` limite les courses traitées (mode incrémental serveur),
    // `opts.onProgress(done, total)` pour l'interface admin.
    async function syncRaces(races, events, ctx, opts = {}) {
        const fetchFn = opts.fetch || fetch;
        let synced = 0, cleaned = 0;

        const targets = races
            .filter(r => !r.cancelled)
            .map(r => ({ race: r, ev: findEventForRace(r, events) }))
            .filter(x => x.ev);

        // 🧹 Nettoyage chirurgical : des RÉSULTATS DE COURSE alors qu'ESPN n'a
        // aucun vainqueur = données erronées (ex. Qatar qui avait hérité de
        // l'Australie). On ne touche ni aux EL/qualifs/sprint, ni au "live".
        races.forEach(race => {
            if (race.cancelled) return;
            const t = targets.find(x => x.race === race);
            if (t && raceHasResults(t.ev)) return;
            const rs = race.raceStatus || race.status || "upcoming";
            if (rs === "live" || !(race.result?.fullResults?.length > 0)) return;
            race.result = null;
            race.raceStatus = "upcoming";
            race.status = "upcoming";
            cleaned++;
        });

        const todo = targets.filter(x => (x.ev.competitions || []).some(isSessionFinal))
                            .filter(x => !opts.only || opts.only(x.race));
        let done = 0;
        for (const { race, ev } of todo) {
            if (await syncRace(race, ev, ctx, fetchFn)) synced++;
            if (opts.onProgress) opts.onProgress(++done, todo.length);
        }
        return { synced, skipped: races.length - synced, cleaned };
    }

    // Format exact écrit dans Firebase (f1_results_AAAA)
    function serialize(races) {
        return races.map(r => ({
            round:              r.round,
            raceStatus:         r.raceStatus         || "upcoming",
            sprintStatus:       r.sprintStatus       || (r.sprint ? "upcoming" : null),
            status:             r.raceStatus         || "upcoming",
            result:             r.result             || null,
            sprintResult:       r.sprintResult       || null,
            schedule:           r.schedule           || null,
            qualiResults:       r.qualiResults       || null,
            sprintQualiResults: r.sprintQualiResults || null,
            fp1Results:         r.fp1Results         || null,
            fp2Results:         r.fp2Results         || null,
            fp3Results:         r.fp3Results         || null
        }));
    }

    return {
        CORE, countryMap, cityKw, scoreboardUrl, seasonEvents, findEventForRace,
        resolveDriver, extractSession, enrichStatus, enrichTimes, applyTeams, getSession,
        isSessionFinal, raceHasResults, syncRace, syncRaces, serialize
    };
})();

// Export pour Node (tools/espn-sync.mjs, tests) — sans effet dans le navigateur
if (typeof module !== "undefined" && module.exports) module.exports = EspnSync;
