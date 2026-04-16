// ============================================================
// 🔥 FIREBASE CONFIG
// ============================================================
const firebaseConfig = {
    apiKey: "AIzaSyDb0jXg9-2OTgLs4Xb3YwN_Jz-kPGH-Qw4",
    authDomain: "f1-calandar.firebaseapp.com",
    databaseURL: "https://f1-calandar-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "f1-calandar",
    storageBucket: "f1-calandar.firebasestorage.app",
    messagingSenderId: "532076146213",
    appId: "1:532076146213:web:b4ca657fe3d143da32d9cc"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const auth = firebase.auth();

// ============================================================
// 🖼️ TheSportsDB — Images GP (poster, map, thumb)
// ============================================================
const SPORTSDB_BASE = "https://www.thesportsdb.com/api/v1/json/3";
const sportsDbCache = {};

async function fetchSportsDbImages(round) {
    if (sportsDbCache[round]) return sportsDbCache[round];
    const cached = sessionStorage.getItem(`sportsdb-${round}`);
    if (cached) { sportsDbCache[round] = JSON.parse(cached); return sportsDbCache[round]; }
    const name = sportsDbNames[round];
    if (!name) return null;
    try {
        // Try 2026 first, fallback to 2024 for images
        for (const year of [2026, 2025, 2024]) {
            const res = await fetch(`${SPORTSDB_BASE}/searchevents.php?e=${encodeURIComponent(name)}&s=${year}`);
            const json = await res.json();
            const events = json?.event || [];
            const gp = events.find(e =>
                e.strLeague === "Formula 1" &&
                !e.strEvent.includes("Practice") &&
                !e.strEvent.includes("Qualifying") &&
                !e.strEvent.includes("Sprint")
            );
            if (gp && (gp.strPoster || gp.strMap || gp.strThumb)) {
                const data = {
                    poster: gp.strPoster || null,
                    map: gp.strMap || null,
                    thumb: gp.strThumb || null,
                    banner: gp.strBanner || null
                };
                sportsDbCache[round] = data;
                sessionStorage.setItem(`sportsdb-${round}`, JSON.stringify(data));
                return data;
            }
        }
    } catch { /* silent */ }
    return null;
}

// Preload all images at startup (non-blocking)
function preloadSportsDbImages() {
    races.forEach(race => fetchSportsDbImages(race.round));
}

// ============================================================
// 🎨 THEME CLAIR / SOMBRE
// ============================================================
function initTheme() {
    const saved = localStorage.getItem("f1-theme");
    if (saved) {
        document.documentElement.setAttribute("data-theme", saved);
    } else if (window.matchMedia("(prefers-color-scheme: light)").matches) {
        document.documentElement.setAttribute("data-theme", "light");
    }
    updateThemeIcon();
}
function toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("f1-theme", next);
    updateThemeIcon();
    // Mettre a jour le meta theme-color
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = next === "light" ? "#e8e8e8" : "#e10600";
}
function updateThemeIcon() {
    const btn = document.getElementById("theme-toggle");
    if (!btn) return;
    btn.textContent = document.documentElement.getAttribute("data-theme") === "light" ? "☀️" : "🌙";
}
initTheme();

// ============================================================
// ⏱️ COUNTDOWN TIMER
// ============================================================
const FRENCH_MONTHS = {
    "Janvier":0,"Février":1,"Mars":2,"Avril":3,"Mai":4,"Juin":5,
    "Juillet":6,"Août":7,"Septembre":8,"Octobre":9,"Novembre":10,"Décembre":11
};

function parseFrenchDate(str) {
    if (!str) return null;
    const parts = str.trim().split(/\s+/);
    if (parts.length < 3) return null;
    const day = parseInt(parts[0]);
    const month = FRENCH_MONTHS[parts[1]];
    const year = parseInt(parts[2]);
    if (month === undefined || isNaN(day) || isNaN(year)) return null;
    return new Date(year, month, day);
}

function getSessionDateTime(race, entry) {
    const raceDate = parseFrenchDate(race.dates?.race);
    if (!raceDate) return null;

    const hasDimanche = race.schedule.some(s => s.day === "Dimanche");
    const offsets = hasDimanche
        ? { "Mercredi":-4, "Jeudi":-3, "Vendredi":-2, "Samedi":-1, "Dimanche":0 }
        : { "Mercredi":-3, "Jeudi":-2, "Vendredi":-1, "Samedi":0 };

    const dayOffset = offsets[entry.day] ?? 0;
    const [h, m] = (entry.time || "0:0").split(":").map(Number);
    const dt = new Date(raceDate);
    dt.setDate(dt.getDate() + dayOffset);
    dt.setHours(h, m, 0, 0);
    return dt;
}

function getNextSession() {
    const now = new Date();
    let closest = null, closestRace = null, closestEntry = null;

    for (const race of races) {
        const rs = race.raceStatus || race.status || "upcoming";
        if (rs === "completed" || rs === "cancelled") continue;
        if (!race.schedule) continue;

        for (const entry of race.schedule) {
            const dt = getSessionDateTime(race, entry);
            if (!dt || dt <= now) continue;
            if (!closest || dt < closest) {
                closest = dt;
                closestRace = race;
                closestEntry = entry;
            }
        }
    }
    return { date: closest, race: closestRace, session: closestEntry };
}

function updateCountdown() {
    const el = document.getElementById("countdown-text");
    if (!el) return;

    const next = getNextSession();
    if (!next.date) {
        el.innerHTML = `🏁 <strong>${t("countdown.season_over")}</strong>`;
        return;
    }

    const now = new Date();
    const diff = next.date - now;

    if (diff <= 0) {
        el.innerHTML = `<strong>${t("countdown.live")}</strong> — ${next.session.name} ${next.race.flag} ${next.race.country}`;
        return;
    }

    const days  = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins  = Math.floor((diff % 3600000) / 60000);
    const secs  = Math.floor((diff % 60000) / 1000);

    const shortName = next.race.name.replace("Grand Prix ", "GP ");

    const dPad = String(days).padStart(2,"0");
    const hPad = String(hours).padStart(2,"0");
    const mPad = String(mins).padStart(2,"0");
    const sPad = String(secs).padStart(2,"0");

    el.innerHTML = `
        <div class="sg-board">
            <div class="sg-speed-lines"></div>
            <div class="sg-content">
                <div class="sg-left">
                    <div class="sg-info">
                        <span class="sg-label">GRID</span>
                        <span class="sg-session">${next.session.name}</span>
                    </div>
                </div>
                <div class="sg-timer">
                    ${days > 0 ? `<span class="sg-digit">${dPad}</span><span class="sg-colon">:</span>` : ''}
                    <span class="sg-digit">${hPad}</span><span class="sg-colon">:</span>
                    <span class="sg-digit">${mPad}</span><span class="sg-colon">:</span>
                    <span class="sg-digit sg-digit-sec">${sPad}</span>
                </div>
                <div class="sg-right">
                    <span class="sg-gp">${next.race.flag} ${shortName}</span>
                </div>
            </div>
        </div>`;
}

// ============================================================
// VARIABLES GLOBALES
// ============================================================
let isAdmin = false;
let adminCurrentRace = null;
let activeFilters = { status: "all", type: "all", continent: "all", search: "" };

// ============================================================
// 🔐 FIREBASE AUTH
// ============================================================
auth.onAuthStateChanged(user => {
    isAdmin = !!user;
    const adminTab = document.getElementById("admin-tab");
    const btnToggle = document.getElementById("btn-toggle-admin");
    if (isAdmin) {
        if (adminTab) adminTab.style.display = "block";
        if (btnToggle) {
            btnToggle.textContent = currentLang === "fr" ? "Déconnexion Admin" : "Sign out Admin";
            btnToggle.style.color = "var(--red)";
        }
        renderAdminRaceList();
    } else {
        if (adminTab) adminTab.style.display = "none";
        if (btnToggle) {
            btnToggle.textContent = t("admin.admin_btn");
            btnToggle.style.color = "#555";
        }
        // Si on est sur l'onglet admin, revenir aux courses
        const adminView = document.getElementById("view-admin");
        if (adminView && adminView.classList.contains("active")) {
            switchView("races");
        }
    }
});

// Skeleton de chargement
(function showSkeleton() {
    const grid = document.getElementById("races-grid");
    if (grid && !grid.innerHTML.trim()) {
        grid.innerHTML = Array(8).fill('<div class="skeleton"></div>').join('');
    }
})();

// ============================================================
// 🔥 CHARGEMENT FIREBASE (remplace localStorage)
// ============================================================
db.ref('f1_results_2026').on('value', snapshot => {
    const savedData = snapshot.val();
    if (savedData && Array.isArray(savedData)) {
        races.forEach(race => {
            const found = savedData.find(r => r.round === race.round);
            if (found) {
                race.raceStatus        = found.raceStatus        || "upcoming";
                race.sprintStatus      = found.sprintStatus      || (race.sprint ? "upcoming" : null);
                race.status            = found.raceStatus        || found.status || "upcoming";
                race.result            = found.result            || null;
                race.sprintResult      = found.sprintResult      || null;
                race.qualiResults      = found.qualiResults      || null;
                race.sprintQualiResults = found.sprintQualiResults || null;
                race.fp1Results        = found.fp1Results        || null;
                race.fp2Results        = found.fp2Results        || null;
                race.fp3Results        = found.fp3Results        || null;
                // Horaires modifiés en admin : on ne prend que les "time" de Firebase,
                // les jours et noms de sessions restent ceux de data.js (source de vérité)
                if (found.schedule && race.schedule) {
                    found.schedule.forEach((fs, i) => {
                        if (race.schedule[i] && fs.time) {
                            race.schedule[i].time = fs.time;
                        }
                    });
                }
            } else {
                race.raceStatus   = "upcoming";
                race.sprintStatus = race.sprint ? "upcoming" : null;
                race.status       = "upcoming";
            }
        });
    }
    renderAllRaces();
    renderStandings();
    renderTimeline();
    renderSprintView();
    renderPalmares();
    renderPredictions();
    updateStats();
    updateCountdown();
    // Stats graphiques : ne s'exécute que si la vue est active (Chart.js a besoin d'un canvas visible)
    if (document.getElementById("view-stats")?.classList.contains("active")) renderStats();
    if (isAdmin) renderAdminRaceList();

    // Auto-sync : importer les résultats manquants en arrière-plan
    autoSyncResults();
});

// ============================================================
// 💾 SAUVEGARDE FIREBASE (remplace localStorage.setItem)
// ============================================================
function saveToFirebase() {
    const toSave = races.map(r => ({
        round:             r.round,
        raceStatus:        r.raceStatus        || "upcoming",
        sprintStatus:      r.sprintStatus      || (r.sprint ? "upcoming" : null),
        status:            r.raceStatus        || "upcoming",
        result:            r.result            || null,
        sprintResult:      r.sprintResult      || null,
        schedule:          r.schedule          || null,
        qualiResults:      r.qualiResults      || null,
        sprintQualiResults: r.sprintQualiResults || null,
        fp1Results:        r.fp1Results        || null,
        fp2Results:        r.fp2Results        || null,
        fp3Results:        r.fp3Results        || null
    }));
    db.ref('f1_results_2026').set(toSave);
}

// --------------------------------------------------------
// FONCTIONS DE BASE DU SITE
// --------------------------------------------------------

function getPodiumIcon(pos) {
    if (pos === 1) return "🥇";
    if (pos === 2) return "🥈";
    if (pos === 3) return "🥉";
    return pos;
}

function getPodiumColor(pos) {
    if (pos === 1) return "gold";
    if (pos === 2) return "silver";
    if (pos === 3) return "bronze";
    return "";
}

function getStatusClass(status) {
    if (status === "completed")  return "completed";
    if (status === "next")       return "next";
    if (status === "cancelled")  return "cancelled";
    return "upcoming";
}

function getBadgeClass(status) {
    if (status === "completed")  return "badge-done";
    if (status === "next")       return "badge-next";
    if (status === "cancelled")  return "badge-cancelled";
    return "badge-upcoming";
}

function getBadgeLabel(status) {
    if (status === "completed")  return "✓ " + t("status.completed_f");
    if (status === "next")       return "▶ " + t("status.next_f");
    if (status === "cancelled")  return "✕ " + t("status.cancelled_f");
    return t("status.upcoming");
}

function renderAllRaces() {
    const grid = document.getElementById("races-grid");
    if (!grid) return;
    let html = "";

    const filtered = races.filter(race => {
        const rs = race.raceStatus || race.status || "upcoming";
        if (activeFilters.status !== "all" && rs !== activeFilters.status) return false;
        if (activeFilters.type === "sprint" && !race.sprint) return false;
        if (activeFilters.type === "standard" && race.sprint) return false;
        if (activeFilters.continent !== "all") {
            const cont = countryContinent[race.country] || "";
            if (cont !== activeFilters.continent) return false;
        }
        if (activeFilters.search) {
            const q = activeFilters.search.toLowerCase();
            if (!(race.name + race.country + race.circuit + race.city).toLowerCase().includes(q)) return false;
        }
        return true;
    });

    // Barre de progression
    const doneCount = races.filter(r => (r.raceStatus || r.status || "upcoming") === "completed").length;
    const totalCount = races.length;
    const pctDone = totalCount > 0 ? (doneCount / totalCount) * 100 : 0;
    const progressDone = document.getElementById("progress-done");
    const progressTotal = document.getElementById("progress-total");
    const progressFill = document.getElementById("progress-fill");
    if (progressDone) progressDone.textContent = doneCount;
    if (progressTotal) progressTotal.textContent = totalCount;
    if (progressFill) progressFill.style.width = pctDone + "%";

    filtered.forEach(race => {
        const index = races.indexOf(race);
        const rs = race.raceStatus   || race.status || "upcoming";
        const ss = race.sprintStatus || "upcoming";

        // Statut global de la carte = raceStatus
        const statusClass = getStatusClass(rs);

        let badgesHTML = "";
        if (race.sprint) {
            badgesHTML += `<span class="sprint-tag" style="background:${ss === 'completed' ? 'rgba(34,197,94,0.15)' : ss === 'cancelled' ? 'rgba(239,68,68,0.1)' : ss === 'next' ? 'rgba(124,58,237,0.25)' : 'rgba(124,58,237,0.15)'}; color:${ss === 'completed' ? 'var(--green)' : ss === 'cancelled' ? '#ef4444' : 'var(--sprint-light)'}; border-color:${ss === 'completed' ? 'rgba(34,197,94,0.3)' : ss === 'cancelled' ? 'rgba(239,68,68,0.3)' : 'rgba(124,58,237,0.3)'}">
                ⚡ Sprint ${ss === 'completed' ? '✓' : ss === 'cancelled' ? '✕' : ss === 'next' ? '▶' : ''}
            </span>`;
        }
        if (race.isNew) badgesHTML += `<span class="new-tag">✨ NOUVEAU</span>`;
        badgesHTML += `<span class="badge ${getBadgeClass(rs)}">🏁 Course ${getBadgeLabel(rs)}</span>`;

        // Extraire vainqueur et pole man automatiquement
        const winner  = (rs === "completed" && race.result && race.result.fullResults)
            ? race.result.fullResults.find(r => r.pos === 1) : null;
        const poleMan = (race.qualiResults && race.qualiResults.length > 0)
            ? race.qualiResults[0] : null;

        let podiumHTML = "";
        if (rs === "completed" && race.result && race.result.podium) {
            const sortedPodium = [...race.result.podium].sort((a, b) => a.pos - b.pos);
            podiumHTML = `
                <div class="race-result">
                    <div class="podium-stage">
                        ${sortedPodium.map(p => {
                            const color = teamColors[p.team] || "#666";
                            const logo = teamLogos[p.team] || "";
                            const posLabel = p.pos === 1 ? "1ST" : p.pos === 2 ? "2ND" : "3RD";
                            return `
                            <div class="podium-card podium-p${p.pos}" style="--team-color:${color}">
                                <div class="podium-crown">${p.pos === 1 ? '👑' : ''}</div>
                                <div class="podium-position">${posLabel}</div>
                                ${logo ? `<img class="podium-team-logo" src="${logo}" alt="${p.team}" onerror="this.style.display='none'">` : ''}
                                <div class="podium-team-bar"></div>
                                <div class="podium-driver-name">${p.driver || '-'}</div>
                                <div class="podium-team-name">${p.team || '-'}</div>
                                <div class="podium-pillar">
                                    <span class="podium-pillar-num">${p.pos}</span>
                                </div>
                            </div>`;
                        }).join("")}
                    </div>
                </div>`;
        } else {
            podiumHTML = `<div class="no-result">${t("races.results_coming")}</div>`;
        }

        // Badges vainqueur / pole
        let statsHTML = "";
        if (winner || poleMan) {
            statsHTML = `<div class="race-stats-row">`;
            if (winner) {
                const wTeamColor = teamColors[winner.team] || "#666";
                statsHTML += `<div class="race-stat-chip"><span class="stat-color-dot" style="background:${wTeamColor}"></span><span class="stat-label">🏆</span><span class="stat-value">${winner.driver.split(' ').pop()}</span></div>`;
            }
            if (poleMan) {
                const pTeamColor = teamColors[poleMan.team] || "#666";
                statsHTML += `<div class="race-stat-chip"><span class="stat-color-dot" style="background:${pTeamColor}"></span><span class="stat-label">⏱️</span><span class="stat-value">${poleMan.driver.split(' ').pop()}</span></div>`;
            }
            statsHTML += `</div>`;
        }

        const dateFull = (race.dates && race.dates.full) ? race.dates.full : "";

        // TheSportsDB image for card background
        const cardImages = sportsDbCache[race.round];
        const cardBgImg = cardImages?.thumb || cardImages?.poster || null;

        html += `
            <div class="race-card ${statusClass}${race.isNew ? ' race-card-new' : ''}${rs === 'next' ? ' race-card-next' : ''}" onclick="openModal(${index})"${cardBgImg ? ` data-bg="${cardBgImg}"` : ''}>
                ${cardBgImg ? `<div class="race-card-bg" style="background-image:url('${cardBgImg}')"></div>` : ''}
                <div class="race-card-header">
                    <span class="race-round">R${race.round}</span>
                    <div class="race-badges">${badgesHTML}</div>
                </div>
                <div class="race-card-body">
                    <div class="race-flag-name">
                        <span class="race-flag flag-wave">${race.flag}</span>
                        <div>
                            <div class="race-name">${race.name}</div>
                            <div class="race-country">${race.country} — ${race.city}</div>
                        </div>
                    </div>
                    <div class="race-info-row"><span>📅</span><span>${dateFull}</span></div>
                    <div class="race-info-row"><span>🏟️</span><span>${race.circuit}</span></div>
                    ${(statsHTML || podiumHTML !== `<div class="no-result">${t("races.results_coming")}</div>`) ? `
                    <div class="card-spoil-wrapper ${sessionStorage.getItem('card-spoil-' + index) === 'true' ? 'revealed' : ''}" id="card-spoil-${index}">
                        <div class="card-spoil-overlay" onclick="event.stopPropagation()">
                            <span class="card-spoil-icon">🔒</span>
                            <span class="card-spoil-text">${t("spoil.card_locked")}</span>
                            <button class="card-spoil-btn" onclick="event.stopPropagation(); revealCardSpoil(${index})">${t("spoil.card_reveal")}</button>
                        </div>
                        <div class="card-spoil-content">
                            ${statsHTML}
                            ${podiumHTML}
                            <button class="card-spoil-hide-btn" onclick="event.stopPropagation(); hideCardSpoil(${index})">${t("spoil.card_hide")}</button>
                        </div>
                    </div>` : podiumHTML}
                </div>
            </div>`;
    });

    if (filtered.length === 0) {
        html = `<div class="no-data-box" style="grid-column:1/-1"><div style="font-size:3rem">🔍</div><p>${t("races.no_match")}</p></div>`;
    }
    grid.innerHTML = html;
}

function renderStandings() {
    const driversMap      = {};
    const constructorsMap = {};

    drivers.forEach(d => { driversMap[d.driver]       = { driver: d.driver, team: d.team, flag: d.flag, points: 0 }; });
    constructors.forEach(c => { constructorsMap[c.team] = { team: c.team,   flag: c.flag, points: 0 }; });

    races.forEach(race => {
        const rs = race.raceStatus || race.status || "upcoming";
        const ss = race.sprintStatus || "upcoming";

        // Points course : uniquement si course terminée
        if (rs === "completed" && race.result && race.result.fullResults) {
            race.result.fullResults.forEach(entry => {
                if (driversMap[entry.driver])      driversMap[entry.driver].points      += entry.points || 0;
                if (constructorsMap[entry.team])   constructorsMap[entry.team].points   += entry.points || 0;
            });
        }

        // Points sprint : indépendant du statut course
        if (ss === "completed" && race.sprintResult && race.sprintResult.fullResults) {
            race.sprintResult.fullResults.forEach(entry => {
                if (driversMap[entry.driver])      driversMap[entry.driver].points      += entry.points || 0;
                if (constructorsMap[entry.team])   constructorsMap[entry.team].points   += entry.points || 0;
            });
        }
    });

    const sortedDrivers       = Object.values(driversMap).sort((a, b) => b.points - a.points);
    const sortedConstructors  = Object.values(constructorsMap).sort((a, b) => b.points - a.points);
    const medalColors         = ["#ffd700", "#c0c0c0", "#cd7f32"];

    const maxDriverPts = sortedDrivers[0]?.points || 1;
    const maxConstrPts = sortedConstructors[0]?.points || 1;

    document.getElementById("drivers-standings").innerHTML = `
        <thead><tr><th>#</th><th colspan="2">${t("standings.driver")}</th><th>${t("standings.team")}</th><th>${t("standings.points")}</th></tr></thead>
        <tbody>
            ${sortedDrivers.map((d, i) => {
                const color = teamColors[d.team] || "#666";
                const pct = maxDriverPts > 0 ? (d.points / maxDriverPts * 100) : 0;
                const posClass = i < 3 ? `standing-top standing-p${i+1}` : '';
                const medalIcon = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '';
                return `
                <tr class="standing-row ${posClass}" style="--row-delay:${i * 45}ms">
                    <td class="standing-pos">${medalIcon || (i + 1)}</td>
                    <td class="standing-color-cell"><span class="standing-color-bar" style="background:${color};box-shadow:0 0 8px ${color}55"></span></td>
                    <td class="standing-driver">${d.flag} ${d.driver}</td>
                    <td class="standing-team" style="color:${color}">${d.team}</td>
                    <td class="standing-points-cell">
                        <div class="standing-points-bar-wrap">
                            <div class="standing-points-bar" data-pct="${pct}" style="width:0%;background:linear-gradient(90deg,${color}cc,${color});box-shadow:0 0 6px ${color}66"></div>
                        </div>
                        <span class="standing-pts-value" data-pts="${d.points}">0</span>
                    </td>
                </tr>`;
            }).join("")}
        </tbody>`;

    document.getElementById("constructors-standings").innerHTML = `
        <thead><tr><th>#</th><th colspan="2">${t("standings.team")}</th><th>${t("standings.points")}</th></tr></thead>
        <tbody>
            ${sortedConstructors.map((c, i) => {
                const color = teamColors[c.team] || "#666";
                const pct = maxConstrPts > 0 ? (c.points / maxConstrPts * 100) : 0;
                const posClass = i < 3 ? `standing-top standing-p${i+1}` : '';
                const medalIcon = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '';
                return `
                <tr class="standing-row ${posClass}" style="--row-delay:${i * 45}ms">
                    <td class="standing-pos">${medalIcon || (i + 1)}</td>
                    <td class="standing-color-cell"><span class="standing-color-bar" style="background:${color};box-shadow:0 0 8px ${color}55"></span></td>
                    <td class="standing-driver">${c.flag} ${c.team}</td>
                    <td class="standing-points-cell">
                        <div class="standing-points-bar-wrap">
                            <div class="standing-points-bar" data-pct="${pct}" style="width:0%;background:linear-gradient(90deg,${color}cc,${color});box-shadow:0 0 6px ${color}66"></div>
                        </div>
                        <span class="standing-pts-value" data-pts="${c.points}">0</span>
                    </td>
                </tr>`;
            }).join("")}
        </tbody>`;

    // Animation des barres et compteurs
    animateStandings();
}

function animateStandings() {
    const duration = 900;
    const easeOut = t => 1 - Math.pow(1 - t, 3);

    const rows = document.querySelectorAll(".standing-row");
    rows.forEach((row, i) => {
        const delay = i * 45;
        // Apparition de la ligne
        row.style.opacity = "0";
        row.style.transform = "translateX(-12px)";
        setTimeout(() => {
            row.style.transition = "opacity 0.4s ease, transform 0.4s ease";
            row.style.opacity = "1";
            row.style.transform = "translateX(0)";
        }, delay);

        // Animation barre + compteur
        const bar = row.querySelector(".standing-points-bar");
        const pts = row.querySelector(".standing-pts-value");
        if (!bar || !pts) return;

        const targetPct = parseFloat(bar.dataset.pct) || 0;
        const targetPts = parseInt(pts.dataset.pts) || 0;

        setTimeout(() => {
            const start = performance.now();
            function step(now) {
                const elapsed = now - start;
                const progress = Math.min(elapsed / duration, 1);
                const eased = easeOut(progress);

                bar.style.width = (targetPct * eased) + "%";
                pts.textContent = Math.round(targetPts * eased);

                if (progress < 1) requestAnimationFrame(step);
                else {
                    bar.style.width = targetPct + "%";
                    pts.textContent = targetPts;
                }
            }
            requestAnimationFrame(step);
        }, delay + 150);
    });
}

function renderTimeline() {
    var monthKeys = ["Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
    var months = {};

    races.forEach(function(race) {
        var key = "Décembre";
        for (var i = 0; i < monthKeys.length; i++) {
            var m = monthKeys[i];
            if (race.dates && race.dates.race && race.dates.race.indexOf(m) !== -1) {
                key = m; break;
            }
        }
        if (!months[key]) months[key] = [];
        months[key].push(race);
    });

    var html = "";
    monthKeys.forEach(function(m) {
        if (months[m]) {
            html += '<div class="timeline-month"><div class="timeline-month-label">📆 ' + m + ' 2026</div>';
            months[m].forEach(function(race) {
                var dateRace = (race.dates && race.dates.race) ? race.dates.race : "";
                var rs = race.raceStatus || race.status || "upcoming";
                var ss = race.sprintStatus || "upcoming";
                var sprintBadge = race.sprint
                    ? '<span class="sprint-tag" style="background:' + (ss === 'completed' ? 'rgba(34,197,94,0.15)' : ss === 'cancelled' ? 'rgba(239,68,68,0.1)' : 'rgba(124,58,237,0.15)') + '; color:' + (ss === 'completed' ? 'var(--green)' : ss === 'cancelled' ? '#ef4444' : 'var(--sprint-light)') + '; border-color:' + (ss === 'completed' ? 'rgba(34,197,94,0.3)' : ss === 'cancelled' ? 'rgba(239,68,68,0.3)' : 'rgba(124,58,237,0.3)') + '">⚡ Sprint ' + (ss === 'completed' ? '✓' : ss === 'cancelled' ? '✕' : ss === 'next' ? '▶' : '') + '</span>'
                    : "";
                html += '<div class="timeline-race-item ' + getStatusClass(rs) + '" onclick="openModal(' + (race.round - 1) + ')">' +
                    '<div class="timeline-race-left"><span class="timeline-flag">' + race.flag + '</span>' +
                    '<div><div class="timeline-race-name">' + race.name + '</div>' +
                    '<div class="timeline-race-date">Round ' + race.round + ' — ' + dateRace + '</div></div></div>' +
                    '<div class="timeline-race-right">' +
                    sprintBadge +
                    (race.isNew ? '<span class="new-tag">✨ NOUVEAU</span>' : "") +
                    '<span class="badge ' + getBadgeClass(rs) + '">🏁 ' + getBadgeLabel(rs) + '</span>' +
                    '</div></div>';
            });
            html += '</div>';
        }
    });
    document.getElementById("timeline-content").innerHTML = html;
}

function renderPalmares() {
    const container = document.getElementById("palmares-content");
    if (!container) return;

    // Calculer les stats par équipe
    const teamStats = {};
    constructors.forEach(c => {
        teamStats[c.team] = { team: c.team, flag: c.flag, wins: 0, podiums: 0, poles: 0, winRaces: [] };
    });

    // Calculer les stats par pilote
    const driverStats = {};
    drivers.forEach(d => {
        driverStats[d.driver] = { driver: d.driver, team: d.team, flag: d.flag, wins: 0, podiums: 0, poles: 0, winRaces: [] };
    });

    races.forEach(race => {
        const rs = race.raceStatus || race.status || "upcoming";
        if (rs !== "completed" || !race.result || !race.result.fullResults) return;

        race.result.fullResults.forEach(r => {
            if (r.pos <= 3) {
                if (teamStats[r.team]) teamStats[r.team].podiums++;
                if (driverStats[r.driver]) driverStats[r.driver].podiums++;
            }
            if (r.pos === 1) {
                if (teamStats[r.team]) { teamStats[r.team].wins++; teamStats[r.team].winRaces.push(race.name); }
                if (driverStats[r.driver]) { driverStats[r.driver].wins++; driverStats[r.driver].winRaces.push(race.name); }
            }
        });

        // Poles
        if (race.qualiResults && race.qualiResults.length > 0) {
            const pole = race.qualiResults[0];
            if (teamStats[pole.team]) teamStats[pole.team].poles++;
            if (driverStats[pole.driver]) driverStats[pole.driver].poles++;
        }
    });

    // Trier par victoires puis podiums
    const sortedTeams = Object.values(teamStats).filter(tm => tm.wins > 0 || tm.podiums > 0).sort((a, b) => b.wins - a.wins || b.podiums - a.podiums);
    const sortedDrivers = Object.values(driverStats).filter(d => d.wins > 0 || d.podiums > 0).sort((a, b) => b.wins - a.wins || b.podiums - a.podiums);

    // Podium des 3 meilleures équipes
    let teamPodiumHTML = "";
    if (sortedTeams.length >= 1) {
        const top3 = sortedTeams.slice(0, 3);
        // Remplir jusqu'à 3
        while (top3.length < 3) top3.push({ team: "-", flag: "", wins: 0, podiums: 0, poles: 0, winRaces: [] });

        teamPodiumHTML = `
        <div class="palmares-section">
            <h3 class="palmares-title">${t("palmares.top_teams")}</h3>
            <div class="podium-stage">
                ${top3.map((tm, i) => {
                    const pos = i + 1;
                    const color = teamColors[tm.team] || "#666";
                    const logo = teamLogos[tm.team] || "";
                    const posLabel = pos === 1 ? "1ST" : pos === 2 ? "2ND" : "3RD";
                    const winLabel = tm.wins > 1 ? t("palmares.wins") : t("palmares.wins").replace(/s$/, "");
                    return `
                    <div class="podium-card podium-p${pos}" style="--team-color:${color}">
                        <div class="podium-crown">${pos === 1 ? '👑' : ''}</div>
                        <div class="podium-position">${posLabel}</div>
                        ${logo ? `<img class="podium-team-logo" src="${logo}" alt="${tm.team}" onerror="this.style.display='none'">` : ''}
                        <div class="podium-team-bar"></div>
                        <div class="podium-driver-name">${tm.team || '-'}</div>
                        <div class="podium-team-name">${tm.wins} ${winLabel} — ${tm.podiums} podium${tm.podiums > 1 ? 's' : ''}</div>
                        <div class="podium-pillar">
                            <span class="podium-pillar-num">${tm.wins}</span>
                        </div>
                    </div>`;
                }).join("")}
            </div>
        </div>`;
    }

    // Podium des 3 meilleurs pilotes
    let driverPodiumHTML = "";
    if (sortedDrivers.length >= 1) {
        const top3d = sortedDrivers.slice(0, 3);
        while (top3d.length < 3) top3d.push({ driver: "-", team: "", flag: "", wins: 0, podiums: 0, poles: 0, winRaces: [] });

        driverPodiumHTML = `
        <div class="palmares-section">
            <h3 class="palmares-title">${t("palmares.top_drivers")}</h3>
            <div class="podium-stage">
                ${top3d.map((d, i) => {
                    const pos = i + 1;
                    const color = teamColors[d.team] || "#666";
                    const logo = teamLogos[d.team] || "";
                    const posLabel = pos === 1 ? "1ST" : pos === 2 ? "2ND" : "3RD";
                    const winLabel = d.wins > 1 ? t("palmares.wins") : t("palmares.wins").replace(/s$/, "");
                    return `
                    <div class="podium-card podium-p${pos}" style="--team-color:${color}">
                        <div class="podium-crown">${pos === 1 ? '👑' : ''}</div>
                        <div class="podium-position">${posLabel}</div>
                        ${logo ? `<img class="podium-team-logo" src="${logo}" alt="${d.team}" onerror="this.style.display='none'">` : ''}
                        <div class="podium-team-bar"></div>
                        <div class="podium-driver-name">${d.flag} ${d.driver || '-'}</div>
                        <div class="podium-team-name">${d.wins} ${winLabel} — ${d.podiums} podium${d.podiums > 1 ? 's' : ''}</div>
                        <div class="podium-pillar">
                            <span class="podium-pillar-num">${d.wins}</span>
                        </div>
                    </div>`;
                }).join("")}
            </div>
        </div>`;
    }

    // Tableaux détaillés
    let teamTableHTML = "";
    if (sortedTeams.length > 0) {
        teamTableHTML = `
        <div class="palmares-section">
            <h3 class="palmares-title">📊 ${t("standings.team")}</h3>
            <table class="standings-table palmares-table">
                <thead><tr><th>#</th><th>${t("standings.team")}</th><th>🏆 ${t("palmares.wins")}</th><th>🥇 Podiums</th><th>⚡ Poles</th></tr></thead>
                <tbody>
                    ${sortedTeams.map((tm, i) => {
                        const color = teamColors[tm.team] || "#666";
                        return `<tr>
                            <td style="font-weight:800;color:var(--muted)">${i + 1}</td>
                            <td><span style="display:inline-block;width:4px;height:14px;border-radius:2px;background:${color};margin-right:8px;vertical-align:middle"></span>${tm.flag} ${tm.team}</td>
                            <td style="font-weight:800;color:var(--gold)">${tm.wins}</td>
                            <td style="font-weight:700;color:var(--silver)">${tm.podiums}</td>
                            <td style="color:var(--muted)">${tm.poles}</td>
                        </tr>`;
                    }).join("")}
                </tbody>
            </table>
        </div>`;
    }

    let driverTableHTML = "";
    if (sortedDrivers.length > 0) {
        driverTableHTML = `
        <div class="palmares-section">
            <h3 class="palmares-title">📊 ${t("standings.driver")}</h3>
            <table class="standings-table palmares-table">
                <thead><tr><th>#</th><th>${t("standings.driver")}</th><th>${t("standings.team")}</th><th>🏆 ${t("palmares.wins")}</th><th>🥇 Pod.</th><th>⚡ Poles</th></tr></thead>
                <tbody>
                    ${sortedDrivers.map((d, i) => {
                        const color = teamColors[d.team] || "#666";
                        return `<tr>
                            <td style="font-weight:800;color:var(--muted)">${i + 1}</td>
                            <td style="font-weight:700">${d.flag} ${d.driver}</td>
                            <td><span style="display:inline-block;width:4px;height:14px;border-radius:2px;background:${color};margin-right:6px;vertical-align:middle"></span><span style="color:var(--muted);font-size:0.82rem">${d.team}</span></td>
                            <td style="font-weight:800;color:var(--gold)">${d.wins}</td>
                            <td style="font-weight:700;color:var(--silver)">${d.podiums}</td>
                            <td style="color:var(--muted)">${d.poles}</td>
                        </tr>`;
                    }).join("")}
                </tbody>
            </table>
        </div>`;
    }

    // Si aucune course terminée
    if (sortedTeams.length === 0 && sortedDrivers.length === 0) {
        container.innerHTML = `<div class="no-data-box"><div style="font-size:3rem">🏁</div><p>${t("palmares.no_wins_yet")}</p></div>`;
        return;
    }

    container.innerHTML = `<div class="palmares-podiums-row">${teamPodiumHTML}${driverPodiumHTML}</div><div class="palmares-tables-row">${teamTableHTML}${driverTableHTML}</div>`;
}

// ============================================================
// 📊 STATISTIQUES — Chart.js
// ============================================================
let chartDrivers = null;
let chartConstructors = null;
let chartRadar = null;
let statsDriverMode = "top10";

function computeCumulativePoints() {
    const completed = races.filter(r => {
        const rs = r.raceStatus || r.status || "upcoming";
        return rs === "completed" && r.result && r.result.fullResults;
    }).sort((a, b) => a.round - b.round);

    const driverSeries = {};
    const constructorSeries = {};
    drivers.forEach(d => { driverSeries[d.driver] = { team: d.team, values: [] }; });
    constructors.forEach(c => { constructorSeries[c.team] = { values: [] }; });

    const labels = [];
    const driverRunning = {};
    const constructorRunning = {};
    drivers.forEach(d => driverRunning[d.driver] = 0);
    constructors.forEach(c => constructorRunning[c.team] = 0);

    completed.forEach(race => {
        // Cumul course
        race.result.fullResults.forEach(e => {
            if (driverRunning[e.driver] !== undefined) driverRunning[e.driver] += e.points || 0;
            if (constructorRunning[e.team] !== undefined) constructorRunning[e.team] += e.points || 0;
        });
        // Cumul sprint (si applicable)
        const ss = race.sprintStatus || "upcoming";
        if (ss === "completed" && race.sprintResult && race.sprintResult.fullResults) {
            race.sprintResult.fullResults.forEach(e => {
                if (driverRunning[e.driver] !== undefined) driverRunning[e.driver] += e.points || 0;
                if (constructorRunning[e.team] !== undefined) constructorRunning[e.team] += e.points || 0;
            });
        }
        labels.push(`R${race.round} ${race.flag}`);
        Object.keys(driverSeries).forEach(d => driverSeries[d].values.push(driverRunning[d]));
        Object.keys(constructorSeries).forEach(c => constructorSeries[c].values.push(constructorRunning[c]));
    });

    return { labels, driverSeries, constructorSeries, completedCount: completed.length };
}

function computeDriverRadar(driverName) {
    let wins = 0, podiums = 0, poles = 0, top5 = 0, top10 = 0, sprintWins = 0;
    races.forEach(race => {
        const rs = race.raceStatus || race.status || "upcoming";
        if (rs !== "completed") return;
        if (race.result && race.result.fullResults) {
            const entry = race.result.fullResults.find(e => e.driver === driverName);
            if (entry) {
                if (entry.pos === 1) wins++;
                if (entry.pos <= 3) podiums++;
                if (entry.pos <= 5) top5++;
                if (entry.pos <= 10) top10++;
            }
        }
        if (race.qualiResults && race.qualiResults[0]?.driver === driverName) poles++;
        if (race.sprintResult && race.sprintResult.fullResults) {
            const se = race.sprintResult.fullResults.find(e => e.driver === driverName);
            if (se && se.pos === 1) sprintWins++;
        }
    });
    return { wins, podiums, poles, top5, top10, sprintWins };
}

function renderStats() {
    if (typeof Chart === "undefined") return;
    const { labels, driverSeries, constructorSeries, completedCount } = computeCumulativePoints();

    const emptyEl = document.getElementById("stats-empty");
    const contentEl = document.getElementById("stats-content");
    if (!emptyEl || !contentEl) return;

    if (completedCount === 0) {
        emptyEl.style.display = "block";
        contentEl.style.display = "none";
        return;
    }
    emptyEl.style.display = "none";
    contentEl.style.display = "";

    const textColor   = getComputedStyle(document.documentElement).getPropertyValue("--text").trim()   || "#eee";
    const mutedColor  = getComputedStyle(document.documentElement).getPropertyValue("--muted").trim()  || "#888";
    const borderColor = getComputedStyle(document.documentElement).getPropertyValue("--border").trim() || "#333";

    const commonOpts = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
            legend: {
                position: "bottom",
                labels: { color: textColor, boxWidth: 12, font: { size: 11 } }
            },
            tooltip: {
                backgroundColor: "rgba(0,0,0,0.9)",
                titleColor: "#fff",
                bodyColor: "#eee",
                borderColor: borderColor,
                borderWidth: 1
            }
        },
        scales: {
            x: { ticks: { color: mutedColor }, grid: { color: borderColor } },
            y: { ticks: { color: mutedColor }, grid: { color: borderColor }, beginAtZero: true }
        }
    };

    // ── Chart 1 : évolution pilotes ──
    // Trier par points finaux pour sélectionner le top N
    const sortedDrivers = Object.entries(driverSeries)
        .map(([name, s]) => ({ name, team: s.team, values: s.values, last: s.values[s.values.length - 1] || 0 }))
        .sort((a, b) => b.last - a.last);

    const driversToShow = statsDriverMode === "top10" ? sortedDrivers.slice(0, 10) : sortedDrivers.filter(d => d.last > 0);

    const driverDatasets = driversToShow.map(d => ({
        label: d.name,
        data: d.values,
        borderColor: teamColors[d.team] || "#888",
        backgroundColor: (teamColors[d.team] || "#888") + "22",
        borderWidth: 2,
        tension: 0.25,
        pointRadius: 2,
        pointHoverRadius: 5
    }));

    if (chartDrivers) chartDrivers.destroy();
    const ctx1 = document.getElementById("chart-drivers");
    if (ctx1) {
        chartDrivers = new Chart(ctx1, {
            type: "line",
            data: { labels, datasets: driverDatasets },
            options: commonOpts
        });
    }

    // ── Chart 2 : évolution constructeurs ──
    const sortedConstructors = Object.entries(constructorSeries)
        .map(([name, s]) => ({ name, values: s.values, last: s.values[s.values.length - 1] || 0 }))
        .sort((a, b) => b.last - a.last);

    const constructorDatasets = sortedConstructors.filter(c => c.last > 0).map(c => ({
        label: c.name,
        data: c.values,
        borderColor: teamColors[c.name] || "#888",
        backgroundColor: (teamColors[c.name] || "#888") + "33",
        borderWidth: 2.5,
        tension: 0.25,
        pointRadius: 2,
        pointHoverRadius: 5,
        fill: false
    }));

    if (chartConstructors) chartConstructors.destroy();
    const ctx2 = document.getElementById("chart-constructors");
    if (ctx2) {
        chartConstructors = new Chart(ctx2, {
            type: "line",
            data: { labels, datasets: constructorDatasets },
            options: commonOpts
        });
    }

    // ── Chart 3 : radar pilote ──
    const select = document.getElementById("radar-driver-select");
    if (select) {
        // Peupler si vide
        if (select.options.length === 0) {
            sortedDrivers.forEach(d => {
                const opt = document.createElement("option");
                opt.value = d.name;
                opt.textContent = `${d.name} — ${d.last} pts`;
                select.appendChild(opt);
            });
            select.addEventListener("change", renderStats);
        }
        const selectedDriver = select.value || sortedDrivers[0]?.name;
        if (selectedDriver) {
            const r = computeDriverRadar(selectedDriver);
            const driverObj = drivers.find(d => d.driver === selectedDriver);
            const color = teamColors[driverObj?.team] || "#e10600";
            const radarLabels = [
                t("stats.radar_wins"),
                t("stats.radar_podiums"),
                t("stats.radar_poles"),
                t("stats.radar_top5"),
                t("stats.radar_top10"),
                t("stats.radar_sprint_wins")
            ];
            if (chartRadar) chartRadar.destroy();
            const ctx3 = document.getElementById("chart-radar");
            if (ctx3) {
                chartRadar = new Chart(ctx3, {
                    type: "radar",
                    data: {
                        labels: radarLabels,
                        datasets: [{
                            label: selectedDriver,
                            data: [r.wins, r.podiums, r.poles, r.top5, r.top10, r.sprintWins],
                            borderColor: color,
                            backgroundColor: color + "44",
                            borderWidth: 2,
                            pointBackgroundColor: color,
                            pointRadius: 4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { labels: { color: textColor } },
                            tooltip: commonOpts.plugins.tooltip
                        },
                        scales: {
                            r: {
                                angleLines: { color: borderColor },
                                grid: { color: borderColor },
                                pointLabels: { color: textColor, font: { size: 11 } },
                                ticks: { color: mutedColor, backdropColor: "transparent", stepSize: 1 },
                                beginAtZero: true
                            }
                        }
                    }
                });
            }
        }
    }
}

function renderSprintView() {
    const sprintRaces  = races.filter(r => r.sprint);
    const doneSprints  = sprintRaces.filter(r => (r.sprintStatus || "upcoming") === "completed");

    document.getElementById("sprint-done-count").textContent  = doneSprints.length;
    document.getElementById("sprint-total-count").textContent = sprintRaces.length;

    let html = "";
    sprintRaces.forEach(race => {
        const ss = race.sprintStatus || "upcoming";
        const hasResult = ss === "completed" && race.sprintResult && race.sprintResult.podium;
        const sortedSprintPodium = hasResult ? [...race.sprintResult.podium].sort((a, b) => a.pos - b.pos) : [];
        let podiumHTML = hasResult ? `
            <div class="race-result">
                <div class="podium-stage">
                    ${sortedSprintPodium.map(p => {
                        const color = teamColors[p.team] || "#666";
                        const logo = teamLogos[p.team] || "";
                        const posLabel = p.pos === 1 ? "1ST" : p.pos === 2 ? "2ND" : "3RD";
                        return `
                        <div class="podium-card podium-p${p.pos}" style="--team-color:${color}">
                            <div class="podium-crown">${p.pos === 1 ? '👑' : ''}</div>
                            <div class="podium-position">${posLabel}</div>
                            ${logo ? `<img class="podium-team-logo" src="${logo}" alt="${p.team}" onerror="this.style.display='none'">` : ''}
                            <div class="podium-team-bar"></div>
                            <div class="podium-driver-name">${p.driver || '-'}</div>
                            <div class="podium-team-name">${p.team || '-'}</div>
                            <div class="podium-pillar">
                                <span class="podium-pillar-num">${p.pos}</span>
                            </div>
                        </div>`;
                    }).join("")}
                </div>
            </div>` : `<div class="no-result">${t("races.results_coming")}</div>`;

        const dateFull = (race.dates && race.dates.full) ? race.dates.full : "";

        html += `
            <div class="race-card sprint-card" onclick="openModal(${race.round - 1})">
                <div class="race-card-header">
                    <span class="race-round sprint-round">R${race.round} ⚡</span>
                    <span class="badge ${getBadgeClass(ss)}">${getBadgeLabel(ss)}</span>
                </div>
                <div class="race-card-body">
                    <div class="race-flag-name">
                        <span class="race-flag flag-wave">${race.flag}</span>
                        <div>
                            <div class="race-name">${race.name}</div>
                            <div class="race-country">${race.country} — ${race.city}</div>
                        </div>
                    </div>
                    <div class="race-info-row"><span>📅</span><span>${dateFull}</span></div>
                    <div class="race-info-row"><span>🏟️</span><span>${race.circuit}</span></div>
                    ${podiumHTML}
                </div>
            </div>`;
    });
    document.getElementById("sprint-grid").innerHTML = html;
}

function updateStats() {
    const completed  = races.filter(r => (r.raceStatus || r.status) === "completed").length;
    const cancelled  = races.filter(r => (r.raceStatus || r.status) === "cancelled").length;
    const upcoming   = races.filter(r => {
        const rs = r.raceStatus || r.status || "upcoming";
        return rs === "upcoming" || rs === "next";
    }).length;
    document.getElementById("stat-completed").textContent = completed;
    document.getElementById("stat-upcoming").textContent  = upcoming;
    document.getElementById("stat-total").textContent     = races.length;
}

function openModal(index) {
    const race    = races[index];
    const overlay = document.getElementById("modal-overlay");
    const content = document.getElementById("modal-content");

    // Programme : éditable si admin, lecture seule sinon
    const scheduleHTML = race.schedule ? race.schedule.map((s, i) => {
        let itemClass = "schedule-item";
        if (s.type === "race")   itemClass += " highlight";
        if (s.type === "sprint") itemClass += " sprint-session";

        // ── Mode admin : heure éditable ──
        if (isAdmin) {
            return `<div class="${itemClass}" style="flex-direction:column; align-items:stretch; gap:0.25rem;">
                <div style="display:flex; align-items:center; gap:0.5rem;">
                    <span class="schedule-day" style="min-width:80px; font-size:0.78rem; color:var(--muted); font-weight:700;">${s.day}</span>
                    <span class="schedule-name" style="flex:1;">${s.name}</span>
                    <input type="text" value="${s.time}" data-schedule-index="${i}" placeholder="HH:MM"
                        style="width:80px; padding:0.3rem 0.5rem; background:rgba(0,0,0,0.4);
                            border:1px solid var(--red); color:var(--red); border-radius:6px;
                            font-weight:800; font-size:0.9rem; text-align:center; outline:none;"
                        oninput="updateScheduleTime(${index}, ${i}, this.value)">
                </div>
            </div>`;
        }

        // ── Mode visiteur : lecture seule ──
        return `<div class="${itemClass}">
            <span class="schedule-day">${s.day}</span>
            <span class="schedule-name">${s.name}</span>
            <span class="schedule-time">${s.time}</span>
        </div>`;
    }).join("") : "";

    const rs = race.raceStatus || race.status || "upcoming";
    const ss = race.sprintStatus || "upcoming";

    // ── Helper : tableau de qualifications (réutilisé) ──
    function buildQualiTable(qualiData) {
        return `<table class="full-results-table">
            <thead><tr><th>${t("modal.pos")}</th><th>${t("modal.driver")}</th><th>${t("modal.team")}</th></tr></thead>
            <tbody>
                ${qualiData.map((q, qi) => `
                    <tr class="${qi < 3 ? 'podium-row-' + (qi+1) : ''}">
                        <td class="pos-medal ${getPodiumColor(qi+1)}">${qi < 3 ? getPodiumIcon(qi+1) : qi+1}</td>
                        <td style="font-weight:600">${q.driver}</td>
                        <td style="color:var(--muted);font-size:0.82rem">${q.team}</td>
                    </tr>`).join("")}
            </tbody>
        </table>`;
    }

    // ── Helper : section anti-spoil ──
    function buildSpoilSection(title, icon, tableHTML, spoilId) {
        const wasRevealed = sessionStorage.getItem(spoilId) === "true";
        return `
            <div class="modal-section">
                <div class="modal-section-title">${icon} ${title} <span style="font-size:0.7rem;font-weight:400;color:var(--muted);margin-left:0.5rem;">${t("spoil.anti_spoil")}</span></div>
                <div class="spoil-wrapper ${wasRevealed ? 'revealed' : ''}" id="${spoilId}">
                    <div class="spoil-overlay">
                        <div class="spoil-overlay-icon">🔒</div>
                        <div class="spoil-overlay-text">${t("spoil.locked_text")}</div>
                        <button class="spoil-btn spoil-btn-reveal" onclick="revealSpoil('${spoilId}')">${t("spoil.reveal")}</button>
                    </div>
                    <div class="spoil-blur">
                        ${tableHTML}
                    </div>
                    <button class="spoil-btn-hide" onclick="hideSpoil('${spoilId}')">${t("spoil.hide")}</button>
                </div>
            </div>`;
    }

    // ── Helper : section déroulante (accordion) ──
    function buildDropdownSection(title, icon, tableHTML, dropdownId) {
        const wasOpen = sessionStorage.getItem(dropdownId) === "true";
        return `
            <div class="modal-section">
                <div class="dropdown-header ${wasOpen ? 'open' : ''}" onclick="toggleDropdown('${dropdownId}')">
                    <span>${icon} ${title}</span>
                    <span class="dropdown-chevron">${wasOpen ? '▲' : '▼'}</span>
                </div>
                <div class="dropdown-content" id="${dropdownId}" style="${wasOpen ? '' : 'display:none;'}">
                    ${tableHTML}
                </div>
            </div>`;
    }

    let resultsHTML = "";

    // ── Qualifications Sprint (menu déroulant) ──
    if (race.sprint && race.sprintQualiResults && race.sprintQualiResults.length > 0) {
        const sqTable = buildQualiTable(race.sprintQualiResults);
        resultsHTML += buildSpoilSection(t("modal.sprint_quali"), "⚡", sqTable, `spoil-sq-${index}`);
    }

    // ── Résultats Sprint (anti-spoil) ──
    if (ss === "completed" && race.sprintResult && race.sprintResult.fullResults) {
        const sprintTable = `<table class="full-results-table">
            <thead><tr><th>${t("modal.pos")}</th><th>${t("modal.driver")}</th><th>${t("modal.team")}</th><th>${t("modal.points")}</th></tr></thead>
            <tbody>
                ${race.sprintResult.fullResults.map((entry, idx) => `
                    <tr class="${idx < 3 ? 'podium-row-' + (idx+1) : ''}">
                        <td class="pos-medal ${getPodiumColor(idx+1)}">${idx < 3 ? getPodiumIcon(idx+1) : idx+1}</td>
                        <td>${entry.driver}</td>
                        <td style="color:var(--muted)">${entry.team}</td>
                        <td class="points-cell">${entry.points}</td>
                    </tr>`).join("")}
            </tbody>
        </table>`;
        resultsHTML += buildSpoilSection(t("modal.sprint_results"), "⚡", sprintTable, `spoil-sr-${index}`);
    }

    // ── Qualifications Course (menu déroulant) ──
    if (race.qualiResults && race.qualiResults.length > 0) {
        const rqTable = buildQualiTable(race.qualiResults);
        resultsHTML += buildSpoilSection(t("modal.race_quali"), "🏁", rqTable, `spoil-rq-${index}`);
    }

    // ── Résultats Course (anti-spoil) ──
    if (rs === "completed" && race.result && race.result.fullResults) {
        const raceTable = `<table class="full-results-table">
            <thead><tr><th>${t("modal.pos")}</th><th>${t("modal.driver")}</th><th>${t("modal.team")}</th><th>${t("modal.points")}</th></tr></thead>
            <tbody>
                ${race.result.fullResults.map((entry, idx) => `
                    <tr class="${idx < 3 ? 'podium-row-' + (idx+1) : ''}">
                        <td class="pos-medal ${getPodiumColor(idx+1)}">${idx < 3 ? getPodiumIcon(idx+1) : idx+1}</td>
                        <td>${entry.driver}</td>
                        <td style="color:var(--muted)">${entry.team}</td>
                        <td class="points-cell">${entry.points}</td>
                    </tr>`).join("")}
            </tbody>
        </table>`;
        resultsHTML += buildSpoilSection(t("modal.race_results"), "🏁", raceTable, `spoil-rc-${index}`);
    }

    if (resultsHTML === "") {
        resultsHTML = `<div class="modal-section"><div class="no-data-box"><div style="font-size:3rem">🏎️</div><p>${t("modal.results_unavailable")}</p></div></div>`;
    }

    const dateFull = (race.dates && race.dates.full) ? race.dates.full : "";
    const teamColor = (() => {
        const winner = race.result?.fullResults?.find(r => r.pos === 1);
        return winner ? (teamColors[winner.team] || "var(--red)") : "var(--red)";
    })();

    // ── Image circuit (TheSportsDB) ──
    const sdbImages = sportsDbCache[race.round] || null;

    // ── Onglets disponibles ──
    const tabs = [];
    tabs.push({ id: "info",    icon: "📋", label: t("modal.tab_info") });
    if (sdbImages && (sdbImages.map || sdbImages.poster)) tabs.push({ id: "circuit", icon: "🗺️", label: t("modal.tab_circuit") });

    // Essais Libres
    if (race.fp1Results?.length > 0) tabs.push({ id: "fp1", icon: "🔧", label: t("modal.tab_fp1") });
    if (!race.sprint) {
        if (race.fp2Results?.length > 0) tabs.push({ id: "fp2", icon: "🔧", label: t("modal.tab_fp2") });
        if (race.fp3Results?.length > 0) tabs.push({ id: "fp3", icon: "🔧", label: t("modal.tab_fp3") });
    }

    // Sprint weekend
    if (race.sprint) {
        if (race.sprintQualiResults?.length > 0)  tabs.push({ id: "sq",  icon: "⚡", label: t("modal.tab_sq") });
        if (ss === "completed" && race.sprintResult?.fullResults?.length > 0)
            tabs.push({ id: "sr", icon: "⚡", label: t("modal.tab_sr") });
    }
    if (race.qualiResults?.length > 0)  tabs.push({ id: "rq",  icon: "🏁", label: t("modal.tab_rq") });
    if (rs === "completed" && race.result?.fullResults?.length > 0)
        tabs.push({ id: "rc", icon: "🏆", label: t("modal.tab_rc") });

    // Onglet actif par défaut : dernier disponible (résultats) ou infos
    const defaultTab = tabs[tabs.length - 1]?.id || "info";

    // ── Contenu de chaque onglet ──
    // Helper : tableau d'essais libres (avec temps + écart)
    function buildFPTable(fpData, sessionLabel) {
        const tbl = `<table class="full-results-table">
            <thead><tr><th>${t("modal.pos")}</th><th>${t("modal.driver")}</th><th>${t("modal.team")}</th><th>${t("modal.time")}</th><th>${t("modal.gap")}</th></tr></thead>
            <tbody>
                ${fpData.map((e, i) => `
                    <tr class="${i < 3 ? 'podium-row-' + (i+1) : ''}">
                        <td class="pos-medal ${getPodiumColor(i+1)}">${i < 3 ? getPodiumIcon(i+1) : i+1}</td>
                        <td style="font-weight:600">${e.driver}</td>
                        <td style="color:var(--muted);font-size:0.82rem">${e.team}</td>
                        <td style="color:var(--red);font-weight:700;font-family:monospace">${e.time || '-'}</td>
                        <td style="color:var(--muted);font-family:monospace;font-size:0.8rem">${e.gap || ''}</td>
                    </tr>`).join("")}
            </tbody>
        </table>`;
        return tbl;
    }

    function tabContent(tabId) {
        switch(tabId) {
            case "info": return `
                <div class="modal-tab-pane">
                    <div class="modal-section-title">${t("modal.schedule_title")}${isAdmin ? ` <span style="color:var(--red);font-size:0.75rem;font-weight:normal;">${t("modal.schedule_edit_hint")}</span>` : ''}</div>
                    <div class="schedule-grid">${scheduleHTML}</div>
                    ${isAdmin ? `<button onclick="saveSchedule(${index})" class="modal-save-btn">${t("admin.save_schedule")}</button>` : ""}
                </div>`;
            case "circuit": {
                const mapImg = sdbImages?.map || null;
                const posterImg = sdbImages?.poster || null;
                const thumbImg = sdbImages?.thumb || null;
                return `<div class="modal-tab-pane circuit-tab">
                    ${mapImg ? `
                        <div class="circuit-map-section">
                            <div class="circuit-map-title">${t("modal.circuit_layout")}</div>
                            <div class="circuit-map-wrapper">
                                <img src="${mapImg}" alt="Circuit ${race.name}" class="circuit-map-img" loading="lazy" onerror="this.parentElement.style.display='none'">
                            </div>
                        </div>` : ''}
                    ${posterImg ? `
                        <div class="circuit-poster-section">
                            <div class="circuit-map-title">${t("modal.circuit_poster")}</div>
                            <div class="circuit-poster-wrapper">
                                <img src="${posterImg}" alt="Poster ${race.name}" class="circuit-poster-img" loading="lazy" onerror="this.parentElement.style.display='none'">
                            </div>
                        </div>` : ''}
                    ${thumbImg && !posterImg ? `
                        <div class="circuit-poster-section">
                            <div class="circuit-map-title">${t("modal.circuit_preview")}</div>
                            <div class="circuit-poster-wrapper">
                                <img src="${thumbImg}" alt="${race.name}" class="circuit-poster-img" loading="lazy" onerror="this.parentElement.style.display='none'">
                            </div>
                        </div>` : ''}
                    ${!mapImg && !posterImg && !thumbImg ? `<div class="no-data-box"><div style="font-size:3rem">🗺️</div><p>${t("modal.circuit_unavailable")}</p></div>` : ''}
                </div>`;
            }
            case "fp1": return `<div class="modal-tab-pane">${buildFPTable(race.fp1Results, "Essais Libres 1")}</div>`;
            case "fp2": return `<div class="modal-tab-pane">${buildFPTable(race.fp2Results, "Essais Libres 2")}</div>`;
            case "fp3": return `<div class="modal-tab-pane">${buildFPTable(race.fp3Results, "Essais Libres 3")}</div>`;
            case "sq": {
                const tbl = buildQualiTable(race.sprintQualiResults);
                return `<div class="modal-tab-pane">${buildSpoilSection(t("modal.sprint_quali"),"⚡",tbl,`spoil-sq-${index}`)}</div>`;
            }
            case "sr": {
                const tbl = `<table class="full-results-table">
                    <thead><tr><th>${t("modal.pos")}</th><th>${t("modal.driver")}</th><th>${t("modal.team")}</th><th>${t("modal.points_abbr")}</th></tr></thead>
                    <tbody>${race.sprintResult.fullResults.map((e,i)=>`
                        <tr class="${i<3?'podium-row-'+(i+1):''}">
                            <td class="pos-medal ${getPodiumColor(i+1)}">${i<3?getPodiumIcon(i+1):i+1}</td>
                            <td style="font-weight:600">${e.driver}</td>
                            <td style="color:var(--muted);font-size:0.82rem">${e.team}</td>
                            <td class="points-cell">${e.points}</td>
                        </tr>`).join("")}
                    </tbody></table>`;
                return `<div class="modal-tab-pane">${buildSpoilSection(t("modal.sprint_results"),"⚡",tbl,`spoil-sr-${index}`)}</div>`;
            }
            case "rq": {
                const tbl = buildQualiTable(race.qualiResults);
                return `<div class="modal-tab-pane">${buildSpoilSection(t("modal.race_quali"),"🏁",tbl,`spoil-rq-${index}`)}</div>`;
            }
            case "rc": {
                const tbl = `<table class="full-results-table">
                    <thead><tr><th>${t("modal.pos")}</th><th>${t("modal.driver")}</th><th>${t("modal.team")}</th><th>${t("modal.points_abbr")}</th></tr></thead>
                    <tbody>${race.result.fullResults.map((e,i)=>`
                        <tr class="${i<3?'podium-row-'+(i+1):''}">
                            <td class="pos-medal ${getPodiumColor(i+1)}">${i<3?getPodiumIcon(i+1):i+1}</td>
                            <td style="font-weight:600">${e.driver}</td>
                            <td style="color:var(--muted);font-size:0.82rem">${e.team}</td>
                            <td class="points-cell">${e.points}</td>
                        </tr>`).join("")}
                    </tbody></table>`;
                return `<div class="modal-tab-pane">${buildSpoilSection(t("modal.race_results"),"🏆",tbl,`spoil-rc-${index}`)}</div>`;
            }
            default: return "";
        }
    }

    content.innerHTML = `
        <div class="modal-header" style="--hero-color:${teamColor}">
            <div class="modal-hero-bar"></div>
            <div class="modal-header-row">
                <div class="modal-title-block">
                    <span class="modal-flag">${race.flag}</span>
                    <div>
                        <div class="modal-race-name">${race.name}</div>
                        <div class="modal-meta">
                            <span>📅 ${dateFull}</span>
                            <span>🏟️ ${race.circuit}</span>
                            <span>🏁 R${race.round}</span>
                            ${race.sprint ? `<span class="modal-meta-sprint">${t("modal.sprint_badge")}</span>` : ""}
                            ${race.isNew ? `<span class="modal-meta-new">${t("modal.new_badge")}</span>` : ""}
                            ${isAdmin ? `<span style="color:var(--red);font-size:0.72rem;">${t("modal.admin_badge")}</span>` : ""}
                        </div>
                    </div>
                </div>
                <button class="modal-close" onclick="closeModal()">✕</button>
            </div>
        </div>

        <div class="modal-tabs">
            ${tabs.map(tab => `
                <button class="modal-tab-btn ${tab.id === defaultTab ? 'active' : ''}"
                        data-tab="${tab.id}"
                        onclick="switchModalTab('${tab.id}', this)">
                    ${tab.icon} ${tab.label}
                </button>`).join("")}
        </div>

        <div class="modal-body" id="modal-tab-body">
            ${tabContent(defaultTab)}
        </div>`;

    // Stocker le renderer pour switchModalTab
    const body = document.getElementById("modal-tab-body");
    if (body) body._tabRenderer = tabContent;
    overlay.classList.add("open");
}

// Switch onglet modal
function switchModalTab(tabId, btnEl) {
    // Stocker le contexte de l'onglet courant (tabContent a besoin de la closure de openModal)
    // On re-génère le contenu via l'attribut data sur le body
    const body = document.getElementById("modal-tab-body");
    if (!body) return;
    // Activer le bon bouton
    document.querySelectorAll(".modal-tab-btn").forEach(b => b.classList.remove("active"));
    if (btnEl) btnEl.classList.add("active");
    // Le contenu est généré dans openModal — on stocke la fn sur le DOM
    if (body._tabRenderer) {
        body.innerHTML = body._tabRenderer(tabId);
    }
}

// Met à jour l'horaire en mémoire en temps réel
function updateScheduleTime(raceIndex, schedIndex, value) {
    if (races[raceIndex] && races[raceIndex].schedule && races[raceIndex].schedule[schedIndex]) {
        races[raceIndex].schedule[schedIndex].time = value;
    }
}

// Sauvegarde les horaires sur Firebase
function saveSchedule(raceIndex) {
    saveToFirebase();
    // Feedback visuel
    const btn = document.querySelector("#modal-content button[onclick^='saveSchedule']");
    if (btn) {
        btn.textContent = t("msg.saved");
        btn.style.background = "var(--green)";
        setTimeout(() => {
            btn.textContent = t("admin.save_schedule");
            btn.style.background = "var(--red)";
        }, 2000);
    }
}

function closeModal() {
    document.getElementById("modal-overlay").classList.remove("open");
}

// Anti-spoil cartes page d'accueil
function revealCardSpoil(index) {
    const wrapper = document.getElementById(`card-spoil-${index}`);
    if (!wrapper) return;
    wrapper.classList.add("revealed");
    sessionStorage.setItem(`card-spoil-${index}`, "true");
}
function hideCardSpoil(index) {
    const wrapper = document.getElementById(`card-spoil-${index}`);
    if (!wrapper) return;
    wrapper.classList.remove("revealed");
    sessionStorage.removeItem(`card-spoil-${index}`);
}

// Anti-spoil : reveal / hide avec mémorisation sessionStorage
function revealSpoil(spoilId) {
    const wrapper = document.getElementById(spoilId);
    if (!wrapper) return;
    wrapper.classList.add("revealed");
    sessionStorage.setItem(spoilId, "true");
}

function hideSpoil(spoilId) {
    const wrapper = document.getElementById(spoilId);
    if (!wrapper) return;
    wrapper.classList.remove("revealed");
    sessionStorage.removeItem(spoilId);
}

function toggleDropdown(dropdownId) {
    const content = document.getElementById(dropdownId);
    if (!content) return;
    const header = content.previousElementSibling;
    const chevron = header.querySelector(".dropdown-chevron");
    const isOpen = content.style.display !== "none";
    content.style.display = isOpen ? "none" : "block";
    header.classList.toggle("open", !isOpen);
    if (chevron) chevron.textContent = isOpen ? "▼" : "▲";
    if (isOpen) {
        sessionStorage.removeItem(dropdownId);
    } else {
        sessionStorage.setItem(dropdownId, "true");
    }
}

function switchView(view) {
    document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
    document.querySelectorAll(".nav-tab").forEach(nt => nt.classList.remove("active"));
    const target = document.getElementById("view-" + view);
    void target.offsetWidth;
    target.classList.add("active");
    const activeTab = document.querySelector("[data-view='" + view + "']");
    if (activeTab) activeTab.classList.add("active");
    // Re-déclencher animation classements à chaque visite de l'onglet
    if (view === "standings") setTimeout(animateStandings, 80);
    if (view === "stats") setTimeout(renderStats, 80);
}

// --------------------------------------------------------
// ADMINISTRATION
// --------------------------------------------------------

function showAdminLogin() {
    if (isAdmin) {
        auth.signOut();
    } else {
        document.getElementById("admin-login-overlay").classList.add("open");
        document.getElementById("admin-error").style.display = "none";
        setTimeout(() => document.getElementById("admin-email").focus(), 100);
    }
}

function loginAdmin() {
    const email = document.getElementById("admin-email").value;
    const pwd   = document.getElementById("admin-pwd").value;
    const errEl = document.getElementById("admin-error");
    errEl.style.display = "none";

    auth.signInWithEmailAndPassword(email, pwd)
        .then(() => {
            document.getElementById("admin-login-overlay").classList.remove("open");
        })
        .catch(err => {
            errEl.textContent = "Email ou mot de passe incorrect";
            errEl.style.display = "block";
        });
}

document.getElementById("admin-pwd")?.addEventListener("keydown", e => { if (e.key === "Enter") loginAdmin(); });
document.getElementById("admin-email")?.addEventListener("keydown", e => { if (e.key === "Enter") document.getElementById("admin-pwd").focus(); });

function renderAdminRaceList() {
    const container = document.getElementById("admin-race-list");
    if (!container) return;
    container.innerHTML = "";
    races.forEach((race, index) => {
        const btn      = document.createElement("button");
        const isActive = index === adminCurrentRace;
        btn.style = `display:flex; align-items:center; gap:1rem; padding:0.75rem 1rem;
            background:${isActive ? 'var(--card2)' : 'transparent'};
            border:none; border-left:3px solid ${isActive ? 'var(--red)' : 'transparent'};
            border-bottom:1px solid var(--border); color:white; cursor:pointer;
            text-align:left; transition:background 0.2s; width:100%;`;
        btn.onmouseover = () => { if (!isActive) btn.style.background = "rgba(255,255,255,0.03)"; };
        btn.onmouseout  = () => { if (!isActive) btn.style.background = "transparent"; };
        const rs = race.raceStatus || race.status || "upcoming";
        const ss = race.sprintStatus || "upcoming";
        btn.innerHTML = `
            <span style="font-size:1.5rem">${race.flag}</span>
            <div style="flex:1">
                <div style="font-weight:600; font-size:0.9rem">${race.name}</div>
                <div style="font-size:0.75rem; color:var(--muted); display:flex; gap:0.5rem; margin-top:0.2rem;">
                    <span>🏁 ${rs === 'completed' ? `<span style="color:var(--green)">${t("admin.completed_m")}</span>` : rs === 'next' ? `<span style="color:var(--red)">${t("admin.next_m")}</span>` : rs === 'cancelled' ? `<span style="color:#ef4444">${t("admin.cancelled_m")}</span>` : t("admin.upcoming")}</span>
                    ${race.sprint ? `<span>⚡ ${ss === 'completed' ? `<span style="color:var(--green)">${t("admin.completed_m")}</span>` : ss === 'next' ? `<span style="color:var(--sprint-light)">${t("admin.next_m")}</span>` : ss === 'cancelled' ? `<span style="color:#ef4444">${t("admin.cancelled_m")}</span>` : t("admin.upcoming")}</span>` : ''}
                </div>
            </div>
            <span style="width:8px; height:8px; border-radius:50%;
                background:${rs === 'completed' ? 'var(--green)' : rs === 'next' ? 'var(--red)' : rs === 'cancelled' ? '#ef4444' : 'var(--border)'}">
            </span>`;
        btn.onclick = () => selectAdminRace(index);
        container.appendChild(btn);
    });
}

function selectAdminRace(index) {
    adminCurrentRace = index;
    renderAdminRaceList();
    const race = races[index];

    document.getElementById("admin-no-selection").style.display = "none";
    document.getElementById("admin-editor").style.display       = "block";

    document.getElementById("edit-flag").textContent = race.flag;
    document.getElementById("edit-name").textContent = race.name;

    const dateFull = (race.dates && race.dates.full) ? race.dates.full : "";
    document.getElementById("edit-date").textContent = dateFull + " — " + race.circuit;

    // Statut Course
    document.getElementById("edit-status").value = race.raceStatus || race.status || "upcoming";

    // Statut Sprint dans le header
    const sprintHeaderEl = document.getElementById("edit-sprint-status-header");
    if (race.sprint) {
        sprintHeaderEl.style.display = "block";
        document.getElementById("edit-sprint-status").value = race.sprintStatus || "upcoming";
        document.getElementById("edit-sprint-section").style.display = "block";
        document.getElementById("edit-sprint-quali-section").style.display = "block";

        const oldWrap = document.querySelector("#edit-sprint-section > div[data-sprint-status-wrap]");
        if (oldWrap) oldWrap.remove();

        const sResults = (race.sprintResult && race.sprintResult.fullResults) ? race.sprintResult.fullResults : [];
        renderAdminRows(sResults, "edit-sprint-rows", "sprint");

        const sqResults = race.sprintQualiResults || [];
        renderAdminQualiRows(sqResults, "edit-sprint-quali-rows");
    } else {
        sprintHeaderEl.style.display = "none";
        document.getElementById("edit-sprint-section").style.display = "none";
        document.getElementById("edit-sprint-quali-section").style.display = "none";
    }

    const rResults = (race.result && race.result.fullResults) ? race.result.fullResults : [];
    renderAdminRows(rResults, "edit-race-rows", "race");

    const rqResults = race.qualiResults || [];
    renderAdminQualiRows(rqResults, "edit-race-quali-rows");
}

function renderAdminRows(data, containerId, type) {
    const container = document.getElementById(containerId);
    container.innerHTML = `
        <div style="display:grid; grid-template-columns: 50px 1.5fr 1fr 60px 30px; gap:0.5rem;
            padding:0 0.5rem; margin-bottom:0.5rem; font-size:0.75rem; font-weight:bold;
            color:var(--muted); text-transform:uppercase;">
            <span>${t("modal.pos")}</span><span>${t("modal.driver")}</span><span>${t("modal.team")}</span><span>${t("modal.points_abbr")}</span><span></span>
        </div>`;
    data.forEach(row => container.appendChild(createAdminRow(row, type)));
}

function updateAdminPoints(posInput, type) {
    const pos      = parseInt(posInput.value);
    const row      = posInput.closest('.admin-row');
    const ptsInput = row.querySelector('.pts-input');
    if (!ptsInput) return;
    if (isNaN(pos) || pos < 1) { ptsInput.value = 0; return; }
    const ptsSystem = (type === "sprint") ? sprintPoints : pointsSystem;
    ptsInput.value  = ptsSystem[pos - 1] !== undefined ? ptsSystem[pos - 1] : 0;
}

// ── F1 Driver Picker (custom dropdown groupé par équipe) ──
function createF1Picker(selectedDriver, onSelect) {
    const wrapper = document.createElement("div");
    wrapper.className = "f1-picker";

    // Bouton principal
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "f1-picker-btn";

    let locked = false;

    function lockPicker() {
        locked = true;
        wrapper.classList.add("f1-picker-locked");
    }
    function unlockPicker() {
        locked = false;
        wrapper.classList.remove("f1-picker-locked");
    }

    function updateBtn(driverName) {
        const d = drivers.find(x => x.driver === driverName);
        if (d) {
            const color = teamColors[d.team] || "#666";
            btn.innerHTML = `
                <span class="f1-color-bar" style="background:${color}"></span>
                <span class="f1-picker-flag">${d.flag}</span>
                <span class="f1-picker-label">${d.driver}</span>
                <span class="f1-picker-team">${d.team}</span>`;
            lockPicker();
        } else {
            btn.innerHTML = `
                <span class="f1-color-bar" style="background:#444"></span>
                <span class="f1-picker-label" style="color:var(--muted)">Sélectionner un pilote...</span>
                <span class="f1-picker-chevron">▼</span>`;
            unlockPicker();
        }
    }
    updateBtn(selectedDriver);

    // Bouton éditer (déverrouiller)
    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "f1-picker-edit";
    editBtn.innerHTML = "✏️";
    editBtn.title = "Modifier le pilote";
    editBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        unlockPicker();
        refreshDisabled();
        wrapper.classList.add("open");
    });

    // Dropdown
    const dropdown = document.createElement("div");
    dropdown.className = "f1-picker-dropdown";

    // Option vide
    const emptyOpt = document.createElement("div");
    emptyOpt.className = "f1-picker-option";
    emptyOpt.innerHTML = `<span class="f1-opt-name" style="color:var(--muted)">— Aucun —</span>`;
    emptyOpt.addEventListener("click", () => {
        wrapper.classList.remove("open");
        updateBtn("");
        onSelect("", "");
    });
    dropdown.appendChild(emptyOpt);

    // Grouper pilotes par équipe
    const teams = {};
    drivers.forEach(d => {
        if (!teams[d.team]) teams[d.team] = [];
        teams[d.team].push(d);
    });

    Object.keys(teams).forEach(team => {
        const color = teamColors[team] || "#666";

        // Label du groupe
        const groupLabel = document.createElement("div");
        groupLabel.className = "f1-picker-group-label";
        groupLabel.innerHTML = `<span class="f1-picker-group-bar" style="background:${color}"></span>${team}`;
        dropdown.appendChild(groupLabel);

        // Pilotes du groupe
        teams[team].forEach(d => {
            const opt = document.createElement("div");
            opt.className = "f1-picker-option" + (d.driver === selectedDriver ? " selected" : "");
            opt.style.borderLeftColor = color;
            opt.innerHTML = `<span class="f1-opt-flag">${d.flag}</span><span class="f1-opt-name">${d.driver}</span>`;
            opt.addEventListener("click", () => {
                if (opt.classList.contains("f1-picker-disabled")) return;
                wrapper.classList.remove("open");
                dropdown.querySelectorAll(".f1-picker-option").forEach(o => o.classList.remove("selected"));
                opt.classList.add("selected");
                updateBtn(d.driver);
                onSelect(d.driver, d.team);
            });
            dropdown.appendChild(opt);
        });
    });

    // Désactiver les pilotes déjà pris dans le même conteneur
    function refreshDisabled() {
        const container = wrapper.closest(".admin-rows, #edit-race-rows, #edit-sprint-rows, #edit-race-quali-rows, #edit-sprint-quali-rows");
        const taken = [];
        if (container) {
            container.querySelectorAll(".driver-select").forEach(input => {
                if (input !== hidden && input.value) taken.push(input.value);
            });
        }
        dropdown.querySelectorAll(".f1-picker-option").forEach(optEl => {
            const nameEl = optEl.querySelector(".f1-opt-name");
            if (!nameEl) return;
            const name = nameEl.textContent;
            if (name === "— Aucun —") return;
            if (taken.includes(name)) {
                optEl.classList.add("f1-picker-disabled");
            } else {
                optEl.classList.remove("f1-picker-disabled");
            }
        });
    }

    // Toggle
    btn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (locked) return;
        refreshDisabled();
        document.querySelectorAll(".f1-picker.open").forEach(p => { if (p !== wrapper) p.classList.remove("open"); });
        wrapper.classList.toggle("open");
    });

    wrapper.appendChild(btn);
    wrapper.appendChild(editBtn);
    wrapper.appendChild(dropdown);

    // Hidden input pour compatibilité avec extractData
    const hidden = document.createElement("input");
    hidden.type = "hidden";
    hidden.className = "driver-select";
    hidden.value = selectedDriver || "";
    wrapper.appendChild(hidden);

    return wrapper;
}

// Fermer tous les pickers si on clique ailleurs
document.addEventListener("click", () => {
    document.querySelectorAll(".f1-picker.open").forEach(p => p.classList.remove("open"));
});

function createAdminRow(data = {}, type = "race") {
    const div = document.createElement("div");
    div.className = "admin-row";
    div.style = "display:grid; grid-template-columns: 50px 1.5fr 1fr 60px 30px; gap:0.5rem; margin-bottom:0.5rem; align-items:center;";
    const maxPts = (type === "sprint") ? 8 : 25;

    // POS
    const posInput = document.createElement("input");
    posInput.type        = "number";
    posInput.className   = "pos-input";
    posInput.placeholder = "#";
    posInput.value       = data.pos || "";
    posInput.style       = "width:100%; padding:0.5rem; background:var(--card2); border:1px solid var(--border); color:white; border-radius:6px; outline:none;";

    // ÉCURIE (readonly, auto-remplie)
    const teamInput = document.createElement("input");
    teamInput.type        = "text";
    teamInput.className   = "team-input";
    teamInput.placeholder = "Écurie";
    teamInput.value       = data.team || "";
    teamInput.readOnly    = true;
    teamInput.style       = "width:100%; padding:0.5rem; background:var(--dark); border:1px solid var(--border); color:var(--muted); border-radius:6px; outline:none; cursor:not-allowed;";

    // PILOTE (F1 Picker)
    const picker = createF1Picker(data.driver || "", (driverName, teamName) => {
        teamInput.value = teamName;
        picker.querySelector(".driver-select").value = driverName;
    });

    // POINTS
    const ptsInput = document.createElement("input");
    ptsInput.type        = "number";
    ptsInput.className   = "pts-input";
    ptsInput.placeholder = "Pts";
    ptsInput.value       = data.points !== undefined ? data.points : "";
    ptsInput.min         = "0";
    ptsInput.max         = String(maxPts);
    ptsInput.style       = "width:100%; padding:0.5rem; background:var(--card2); border:1px solid var(--border); color:white; border-radius:6px; outline:none;";

    // SUPPRIMER
    const delBtn = document.createElement("button");
    delBtn.textContent = "✕";
    delBtn.style       = "background:transparent; border:none; color:var(--muted); font-size:1.1rem; cursor:pointer; padding:0.2rem;";

    // === EVENT LISTENERS ===
    posInput.addEventListener("input", () => updateAdminPoints(posInput, type));
    delBtn.addEventListener("click", () => div.remove());

    div.appendChild(posInput);
    div.appendChild(picker);
    div.appendChild(teamInput);
    div.appendChild(ptsInput);
    div.appendChild(delBtn);

    // Calcul initial si pos déjà remplie
    if (data.pos) updateAdminPoints(posInput, type);

    return div;
}

function addAdminRow(type) {
    const containerId = type === 'sprint' ? 'edit-sprint-rows' : 'edit-race-rows';
    const container   = document.getElementById(containerId);
    const nextPos     = container.querySelectorAll('.admin-row').length + 1;
    container.appendChild(createAdminRow({ pos: nextPos }, type));
}

// ── QUALIFICATIONS ──────────────────────────────────────────

function renderAdminQualiRows(data, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = `
        <div style="display:grid; grid-template-columns: 50px 1.5fr 1fr 30px; gap:0.5rem;
            padding:0 0.5rem; margin-bottom:0.5rem; font-size:0.75rem; font-weight:bold;
            color:var(--muted); text-transform:uppercase;">
            <span>Pos</span><span>Pilote</span><span>Écurie</span><span></span>
        </div>`;
    data.forEach(row => container.appendChild(createAdminQualiRow(row)));
}

function createAdminQualiRow(data = {}) {
    const div = document.createElement("div");
    div.className = "admin-row";
    div.style = "display:grid; grid-template-columns: 50px 1.5fr 1fr 30px; gap:0.5rem; margin-bottom:0.5rem; align-items:center;";

    const posInput = document.createElement("input");
    posInput.type = "number"; posInput.className = "pos-input"; posInput.placeholder = "#";
    posInput.value = data.pos || "";
    posInput.style = "width:100%; padding:0.5rem; background:var(--card2); border:1px solid var(--border); color:white; border-radius:6px; outline:none;";

    const teamInput = document.createElement("input");
    teamInput.type = "text"; teamInput.className = "team-input"; teamInput.placeholder = "Écurie";
    teamInput.value = data.team || ""; teamInput.readOnly = true;
    teamInput.style = "width:100%; padding:0.5rem; background:var(--dark); border:1px solid var(--border); color:var(--muted); border-radius:6px; outline:none; cursor:not-allowed;";

    // F1 Picker
    const picker = createF1Picker(data.driver || "", (driverName, teamName) => {
        teamInput.value = teamName;
        picker.querySelector(".driver-select").value = driverName;
    });

    const delBtn = document.createElement("button");
    delBtn.textContent = "✕";
    delBtn.style = "background:transparent; border:none; color:var(--muted); font-size:1.1rem; cursor:pointer; padding:0.2rem;";

    delBtn.addEventListener("click", () => div.remove());

    div.appendChild(posInput);
    div.appendChild(picker);
    div.appendChild(teamInput);
    div.appendChild(delBtn);
    return div;
}

function addAdminQualiRow(type) {
    const containerId = type === 'sprint' ? 'edit-sprint-quali-rows' : 'edit-race-quali-rows';
    const container   = document.getElementById(containerId);
    const nextPos     = container.querySelectorAll('.admin-row').length + 1;
    container.appendChild(createAdminQualiRow({ pos: nextPos }));
}

// ============================================================
// 🤖 IMPORT AUTOMATIQUE DEPUIS API F1 (Jolpica / Ergast)
// ============================================================
const API_BASE = "https://api.jolpi.ca/ergast/f1/2026";
const OPENF1_BASE = "https://api.openf1.org/v1";

function resolveTeam(apiName) {
    return teamAliases[apiName] || apiName;
}

function resolveDriver(givenName, familyName) {
    const fullApi = `${givenName} ${familyName}`;
    // Correspondance exacte
    const exact = drivers.find(d => d.driver === fullApi);
    if (exact) return exact;
    // Correspondance par nom de famille
    const byLast = drivers.find(d => d.driver.includes(familyName));
    if (byLast) return byLast;
    // Retour brut
    return { driver: fullApi, team: "", flag: "" };
}

async function fetchRaceResults(round) {
    const res = await fetch(`${API_BASE}/${round}/results.json?limit=30`);
    const json = await res.json();
    const results = json?.MRData?.RaceTable?.Races?.[0]?.Results || [];
    return results.map(r => {
        const d = resolveDriver(r.Driver.givenName, r.Driver.familyName);
        return {
            pos: parseInt(r.position),
            driver: d.driver,
            team: resolveTeam(r.Constructor.name),
            points: parseInt(r.points) || 0
        };
    });
}

async function fetchQualifying(round) {
    const res = await fetch(`${API_BASE}/${round}/qualifying.json?limit=30`);
    const json = await res.json();
    const results = json?.MRData?.RaceTable?.Races?.[0]?.QualifyingResults || [];
    return results.map(r => {
        const d = resolveDriver(r.Driver.givenName, r.Driver.familyName);
        return {
            pos: parseInt(r.position),
            driver: d.driver,
            team: resolveTeam(r.Constructor.name)
        };
    });
}

async function fetchSprintResults(round) {
    const res = await fetch(`${API_BASE}/${round}/sprint.json?limit=30`);
    const json = await res.json();
    const results = json?.MRData?.RaceTable?.Races?.[0]?.SprintResults || [];
    return results.map(r => {
        const d = resolveDriver(r.Driver.givenName, r.Driver.familyName);
        return {
            pos: parseInt(r.position),
            driver: d.driver,
            team: resolveTeam(r.Constructor.name),
            points: parseInt(r.points) || 0
        };
    });
}

// ── Mapping pays FR → EN pour OpenF1 ──
const countryNameMap = {
    "Australie": "Australia",
    "Chine": "China",
    "Japon": "Japan",
    "Bahreïn": "Bahrain",
    "Arabie Saoudite": "Saudi Arabia",
    "États-Unis": "United States",
    "Canada": "Canada",
    "Monaco": "Monaco",
    "Espagne": "Spain",
    "Autriche": "Austria",
    "Royaume-Uni": "Great Britain",
    "Belgique": "Belgium",
    "Hongrie": "Hungary",
    "Pays-Bas": "Netherlands",
    "Italie": "Italy",
    "Azerbaïdjan": "Azerbaijan",
    "Singapour": "Singapore",
    "Mexique": "Mexico",
    "Brésil": "Brazil",
    "Qatar": "Qatar",
    "Émirats Arabes Unis": "United Arab Emirates"
};

// ── Fetch Essais Libres via OpenF1 API ──
async function fetchPracticeResults(sessionName, countryName, year = 2026) {
    // Traduire le nom du pays FR → EN
    const englishCountry = countryNameMap[countryName] || countryName;

    // sessionName : "Practice 1", "Practice 2", "Practice 3"
    const res = await fetch(`${OPENF1_BASE}/sessions?session_name=${encodeURIComponent(sessionName)}&country_name=${encodeURIComponent(englishCountry)}&year=${year}`);
    const sessions = await res.json();
    if (!Array.isArray(sessions) || sessions.length === 0) return [];
    const sessionKey = sessions[0].session_key;
    if (!sessionKey) return [];

    // Récupérer les laps de la session et prendre le meilleur temps par pilote
    const lapsRes = await fetch(`${OPENF1_BASE}/laps?session_key=${sessionKey}`);
    const laps = await lapsRes.json();
    if (!Array.isArray(laps) || laps.length === 0) return [];

    // Grouper par driver_number, trouver le meilleur tour
    const bestByDriver = {};
    laps.forEach(lap => {
        if (!lap.lap_duration || lap.lap_duration <= 0) return;
        const num = lap.driver_number;
        if (!bestByDriver[num] || lap.lap_duration < bestByDriver[num].lap_duration) {
            bestByDriver[num] = lap;
        }
    });

    // Récupérer les infos pilotes
    const driversRes = await fetch(`${OPENF1_BASE}/drivers?session_key=${sessionKey}`);
    const driversData = await driversRes.json();
    if (!Array.isArray(driversData) || driversData.length === 0) return [];
    const driverMap = {};
    driversData.forEach(d => { driverMap[d.driver_number] = d; });

    // Construire le classement trié par temps
    const results = Object.entries(bestByDriver)
        .map(([num, lap]) => {
            const dInfo = driverMap[num];
            if (!dInfo) return null;
            const fullName = `${dInfo.first_name} ${dInfo.last_name}`;
            const resolved = resolveDriver(dInfo.first_name, dInfo.last_name);
            const teamName = resolveTeam(dInfo.team_name || "");
            const mins = Math.floor(lap.lap_duration / 60);
            const secs = (lap.lap_duration % 60).toFixed(3);
            const timeStr = mins > 0 ? `${mins}:${secs.padStart(6, '0')}` : secs;
            return {
                pos: 0,
                driver: resolved.driver,
                team: teamName,
                time: timeStr,
                lapDuration: lap.lap_duration
            };
        })
        .filter(Boolean)
        .sort((a, b) => a.lapDuration - b.lapDuration);

    // Attribuer les positions et calculer l'écart au leader
    const leaderTime = results[0]?.lapDuration || 0;
    results.forEach((r, i) => {
        r.pos = i + 1;
        if (i === 0) {
            r.gap = "";
        } else {
            r.gap = "+" + (r.lapDuration - leaderTime).toFixed(3) + "s";
        }
        delete r.lapDuration;
    });

    return results;
}

// Bouton import : remplit le formulaire admin avec les données API
async function autoImportResults() {
    if (adminCurrentRace === null) return;
    const race  = races[adminCurrentRace];
    const round = race.round;
    const btn   = document.getElementById("btn-auto-import");
    if (btn) { btn.disabled = true; btn.textContent = "⏳ Import en cours..."; }

    let importedAny = false;
    const errors = [];

    try {
        // 1. Résultats Course
        try {
            const raceData = await fetchRaceResults(round);
            if (raceData.length > 0) {
                renderAdminRows(raceData, "edit-race-rows", "race");
                document.getElementById("edit-status").value = "completed";
                importedAny = true;
            }
        } catch (e) { errors.push("Course: " + e.message); }

        // 2. Qualifications Course
        try {
            const qualiData = await fetchQualifying(round);
            if (qualiData.length > 0) {
                renderAdminQualiRows(qualiData, "edit-race-quali-rows");
                importedAny = true;
            }
        } catch (e) { errors.push("Qualifications: " + e.message); }

        // 3. Sprint (si weekend sprint)
        if (race.sprint) {
            try {
                const sprintData = await fetchSprintResults(round);
                if (sprintData.length > 0) {
                    renderAdminRows(sprintData, "edit-sprint-rows", "sprint");
                    document.getElementById("edit-sprint-status").value = "completed";
                    importedAny = true;
                }
            } catch (e) { errors.push("Sprint: " + e.message); }
        }

        // 4. Essais Libres (OpenF1 API) — sauvegarde via saveToFirebase
        try {
            const countryName = race.country;
            if (race.sprint) {
                // Sprint weekend : EL1 seulement
                try {
                    const fp1 = await fetchPracticeResults("Practice 1", countryName);
                    if (fp1.length > 0) {
                        race.fp1Results = fp1;
                        importedAny = true;
                    }
                } catch (e) { errors.push("EL1: " + e.message); }
            } else {
                // Weekend normal : EL1, EL2, EL3
                for (const [key, sessionName] of [["fp1Results", "Practice 1"], ["fp2Results", "Practice 2"], ["fp3Results", "Practice 3"]]) {
                    try {
                        const fpData = await fetchPracticeResults(sessionName, countryName);
                        if (fpData.length > 0) {
                            race[key] = fpData;
                            importedAny = true;
                        }
                    } catch (e) { errors.push(sessionName + ": " + e.message); }
                }
            }
        } catch (e) { errors.push("Essais Libres: " + e.message); }

    } catch (e) {
        errors.push("Erreur générale: " + e.message);
    }

    // Sauvegarder les EL en base même si l'admin ne clique pas Sauvegarder
    if (importedAny) saveToFirebase();

    if (btn) {
        btn.disabled = false;
        if (importedAny) {
            btn.textContent = "✅ Importé !";
            btn.style.background = "var(--green)";
            btn.style.borderColor = "var(--green)";
            setTimeout(() => {
                btn.textContent = "🤖 Import auto (API)";
                btn.style.background = "";
                btn.style.borderColor = "";
            }, 3000);
        } else {
            btn.textContent = "❌ Aucune donnée trouvée";
            btn.style.background = "#ef4444";
            btn.style.borderColor = "#ef4444";
            setTimeout(() => {
                btn.textContent = "🤖 Import auto (API)";
                btn.style.background = "";
                btn.style.borderColor = "";
            }, 3000);
        }
    }

    if (errors.length > 0) {
        console.warn("Import API — erreurs:", errors);
    }

    if (importedAny) {
        alert(`✅ Import réussi !\n\nN'oubliez pas de cliquer "💾 Sauvegarder" pour enregistrer.${errors.length ? '\n\n⚠️ Certaines données n\'ont pas pu être importées:\n' + errors.join('\n') : ''}`);
    }
}

// ============================================================
// 🔄 AUTO-SYNC — Import automatique au chargement
// ============================================================
// Vérifie chaque course passée : si les résultats manquent,
// tente un import silencieux depuis l'API.
let autoSyncDone = false;

async function autoSyncResults() {
    if (autoSyncDone) return;
    autoSyncDone = true;

    const now = new Date();
    // Marge : on attend 4h après la course avant d'importer
    // (les APIs mettent du temps à publier les résultats)
    const DELAY_MS = 4 * 60 * 60 * 1000;

    const toSync = races.filter(race => {
        const raceDate = parseFrenchDate(race.dates?.race);
        if (!raceDate) return false;
        // Course passée depuis > 4h
        if (now - raceDate < DELAY_MS) return false;
        const rs = race.raceStatus || race.status || "upcoming";
        // Course pas encore marquée "completed" OU résultats manquants
        return rs !== "completed" || !race.result || !race.result.fullResults || race.result.fullResults.length === 0;
    });

    if (toSync.length === 0) return;

    console.log(`🔄 Auto-sync: ${toSync.length} course(s) à vérifier...`);
    let synced = 0;

    for (const race of toSync) {
        const round = race.round;
        try {
            // 1. Résultats Course
            const raceData = await fetchRaceResults(round);
            if (raceData.length > 0) {
                race.result = {
                    podium:      raceData.slice(0, 3).map(r => ({ pos: r.pos, driver: r.driver, team: r.team })),
                    fullResults: raceData
                };
                race.raceStatus = "completed";
                race.status     = "completed";
                synced++;
            } else {
                // Pas encore de résultats disponibles sur l'API
                continue;
            }

            // 2. Qualifications Course
            try {
                const qualiData = await fetchQualifying(round);
                if (qualiData.length > 0) race.qualiResults = qualiData;
            } catch (e) { /* silencieux */ }

            // 3. Sprint (si applicable)
            if (race.sprint) {
                try {
                    const sprintData = await fetchSprintResults(round);
                    if (sprintData.length > 0) {
                        race.sprintResult = {
                            podium:      sprintData.slice(0, 3).map(r => ({ pos: r.pos, driver: r.driver, team: r.team })),
                            fullResults: sprintData
                        };
                        race.sprintStatus = "completed";
                    }
                } catch (e) { /* silencieux */ }
            }

            // 4. Essais Libres (OpenF1)
            try {
                const countryName = race.country;
                if (race.sprint) {
                    const fp1 = await fetchPracticeResults("Practice 1", countryName);
                    if (fp1.length > 0) race.fp1Results = fp1;
                } else {
                    for (const [key, sessionName] of [["fp1Results", "Practice 1"], ["fp2Results", "Practice 2"], ["fp3Results", "Practice 3"]]) {
                        try {
                            const fpData = await fetchPracticeResults(sessionName, countryName);
                            if (fpData.length > 0) race[key] = fpData;
                        } catch (e) { /* silencieux */ }
                    }
                }
            } catch (e) { /* silencieux */ }

        } catch (e) {
            console.warn(`Auto-sync R${round}: ${e.message}`);
        }
    }

    if (synced > 0) {
        console.log(`✅ Auto-sync: ${synced} course(s) importée(s)`);
        saveToFirebase();
        renderAllRaces();
        renderStandings();
        renderTimeline();
        renderSprintView();
        renderPalmares();
        renderPredictions();
        updateStats();
        if (isAdmin) renderAdminRaceList();
    }
}

function saveAdminResults() {
    if (adminCurrentRace === null) return;
    const race      = races[adminCurrentRace];
    race.raceStatus = document.getElementById("edit-status").value;
    race.status     = race.raceStatus;

    if (race.sprint) {
        const sprintStatusEl = document.getElementById("edit-sprint-status");
        race.sprintStatus = sprintStatusEl ? sprintStatusEl.value : "upcoming";
    }

    const extractData = (containerId) => {
        const rows = [];
        document.querySelectorAll(`#${containerId} .admin-row`).forEach(row => {
            const pos    = parseInt(row.querySelector(".pos-input").value) || 0;
            const driver = row.querySelector(".driver-select").value;
            const team   = row.querySelector(".team-input").value;
            const points = row.querySelector(".pts-input") ? (parseInt(row.querySelector(".pts-input").value) || 0) : undefined;
            if (driver) {
                const entry = { pos, driver, team };
                if (points !== undefined) entry.points = points;
                rows.push(entry);
            }
        });
        return rows.sort((a, b) => a.pos - b.pos);
    };

    const raceResults = extractData("edit-race-rows");
    race.result = raceResults.length ? {
        podium:      raceResults.slice(0, 3).map(r => ({ pos: r.pos, driver: r.driver, team: r.team })),
        fullResults: raceResults
    } : null;

    if (race.sprint) {
        const sprintResults = extractData("edit-sprint-rows");
        race.sprintResult = sprintResults.length ? {
            podium:      sprintResults.slice(0, 3).map(r => ({ pos: r.pos, driver: r.driver, team: r.team })),
            fullResults: sprintResults
        } : null;
        race.sprintQualiResults = extractData("edit-sprint-quali-rows");
        if (!race.sprintQualiResults.length) race.sprintQualiResults = null;
    }

    race.qualiResults = extractData("edit-race-quali-rows");
    if (!race.qualiResults.length) race.qualiResults = null;

    saveToFirebase();
    renderAllRaces();
    renderStandings();
    renderTimeline();
    renderSprintView();
    renderPalmares();
    updateStats();
    renderAdminRaceList();
    alert("✅ Résultats sauvegardés sur Firebase !");
}

function clearAdminResults() {
    if (adminCurrentRace === null) return;
    if (!confirm("Attention : Voulez-vous vraiment effacer tous les résultats de cette course ?")) return;
    const race               = races[adminCurrentRace];
    race.raceStatus          = "upcoming";
    race.sprintStatus        = race.sprint ? "upcoming" : null;
    race.status              = "upcoming";
    race.result              = null;
    race.sprintResult        = null;
    race.qualiResults        = null;
    race.sprintQualiResults  = null;
    saveAdminResults();
    selectAdminRace(adminCurrentRace);
}

// ============================================================
// 🔮 PRÉDICTIONS
// ============================================================

function getPredictions() {
    try {
        return JSON.parse(localStorage.getItem("f1-predictions-2026")) || {};
    } catch { return {}; }
}

function savePrediction(round, p1, p2, p3) {
    const preds = getPredictions();
    preds[round] = { p1, p2, p3, savedAt: Date.now() };
    localStorage.setItem("f1-predictions-2026", JSON.stringify(preds));
}

function calcPredictionScore(pred, result) {
    if (!pred || !result || !result.podium || result.podium.length < 3) return null;
    const actual = result.podium.map(p => p.driver);
    let score = 0;
    // Position exacte : 3 pts
    if (pred.p1 === actual[0]) score += 3;
    if (pred.p2 === actual[1]) score += 3;
    if (pred.p3 === actual[2]) score += 3;
    // Bonne personne, mauvaise position : 1 pt
    if (pred.p1 !== actual[0] && actual.includes(pred.p1)) score += 1;
    if (pred.p2 !== actual[1] && actual.includes(pred.p2)) score += 1;
    if (pred.p3 !== actual[2] && actual.includes(pred.p3)) score += 1;
    return score; // max 9
}

function renderPredictions() {
    const container = document.getElementById("predictions-content");
    const banner = document.getElementById("predictions-score-banner");
    if (!container) return;

    const preds = getPredictions();
    const driverNames = drivers.map(d => d.driver).sort();

    // Score global
    let totalScore = 0, totalMax = 0, completedPreds = 0;
    races.forEach(race => {
        const rs = race.raceStatus || race.status || "upcoming";
        const pred = preds[race.round];
        if (rs === "completed" && pred && race.result) {
            const s = calcPredictionScore(pred, race.result);
            if (s !== null) { totalScore += s; totalMax += 9; completedPreds++; }
        }
    });

    if (completedPreds > 0) {
        const pct = Math.round((totalScore / totalMax) * 100);
        banner.innerHTML = `
            <div class="pred-score-card">
                <div class="pred-score-number">${totalScore}<span class="pred-score-max">/${totalMax}</span></div>
                <div class="pred-score-label">${t("predictions.score_total")}</div>
            </div>
            <div class="pred-score-card">
                <div class="pred-score-number">${pct}<span class="pred-score-max">%</span></div>
                <div class="pred-score-label">${t("predictions.avg")}</div>
            </div>
            <div class="pred-score-card">
                <div class="pred-score-number">${completedPreds}</div>
                <div class="pred-score-label">${t("predictions.completed_races")}</div>
            </div>
        `;
    } else {
        banner.innerHTML = "";
    }

    // Séparer upcoming et completed
    const upcoming = [];
    const completed = [];
    races.forEach(race => {
        const rs = race.raceStatus || race.status || "upcoming";
        if (rs === "completed") completed.push(race);
        else upcoming.push(race);
    });

    let html = "";

    // ── Courses à venir (formulaire de prédiction) ──
    if (upcoming.length > 0) {
        html += `<h3 class="pred-section-title">${t("predictions.upcoming")}</h3>`;
        html += `<div class="pred-grid">`;
        upcoming.forEach(race => {
            const pred = preds[race.round];
            const hasPred = pred && pred.p1;
            html += `
                <div class="pred-card ${hasPred ? 'pred-card--saved' : ''}">
                    <div class="pred-card-header">
                        <span class="pred-flag">${race.flag}</span>
                        <div>
                            <div class="pred-race-name">${race.name}</div>
                            <div class="pred-race-date">${race.dates.race}</div>
                        </div>
                    </div>
                    <div class="pred-form">
                        <div class="pred-row">
                            <span class="pred-pos pred-pos-1">P1</span>
                            <select class="pred-select" id="pred-${race.round}-p1">
                                <option value="">— —</option>
                                ${driverNames.map(d => `<option value="${d}" ${pred?.p1 === d ? 'selected' : ''}>${d}</option>`).join("")}
                            </select>
                        </div>
                        <div class="pred-row">
                            <span class="pred-pos pred-pos-2">P2</span>
                            <select class="pred-select" id="pred-${race.round}-p2">
                                <option value="">— —</option>
                                ${driverNames.map(d => `<option value="${d}" ${pred?.p2 === d ? 'selected' : ''}>${d}</option>`).join("")}
                            </select>
                        </div>
                        <div class="pred-row">
                            <span class="pred-pos pred-pos-3">P3</span>
                            <select class="pred-select" id="pred-${race.round}-p3">
                                <option value="">— —</option>
                                ${driverNames.map(d => `<option value="${d}" ${pred?.p3 === d ? 'selected' : ''}>${d}</option>`).join("")}
                            </select>
                        </div>
                        <button class="pred-save-btn" onclick="savePredictionFromUI(${race.round})">
                            ${hasPred ? '✏️ ' + t("predictions.edit") : '💾 ' + t("predictions.save")}
                        </button>
                    </div>
                </div>
            `;
        });
        html += `</div>`;
    }

    // ── Courses terminées (résultat vs prédiction) ──
    if (completed.length > 0) {
        html += `<h3 class="pred-section-title">${t("predictions.completed")}</h3>`;
        html += `<div class="pred-grid">`;
        completed.forEach(race => {
            const pred = preds[race.round];
            const score = calcPredictionScore(pred, race.result);
            const actual = race.result?.podium || [];

            html += `<div class="pred-card pred-card--result">`;
            html += `
                <div class="pred-card-header">
                    <span class="pred-flag">${race.flag}</span>
                    <div>
                        <div class="pred-race-name">${race.name}</div>
                        <div class="pred-race-date">${race.dates.race}</div>
                    </div>
                    ${score !== null ? `<div class="pred-badge">${score}/9</div>` : ''}
                </div>
            `;

            if (!pred || !pred.p1) {
                html += `<div class="pred-no-prediction">${t("predictions.no_prediction")}</div>`;
            } else {
                const positions = [
                    { label: "P1", pred: pred.p1, actual: actual[0]?.driver },
                    { label: "P2", pred: pred.p2, actual: actual[1]?.driver },
                    { label: "P3", pred: pred.p3, actual: actual[2]?.driver }
                ];
                html += `<div class="pred-comparison">`;
                positions.forEach(pos => {
                    const exact = pos.pred === pos.actual;
                    const inPodium = !exact && actual.some(a => a.driver === pos.pred);
                    const cls = exact ? 'pred-exact' : inPodium ? 'pred-partial' : 'pred-wrong';
                    const icon = exact ? '✅' : inPodium ? '🔄' : '❌';
                    const pts = exact ? '+3' : inPodium ? '+1' : '0';
                    html += `
                        <div class="pred-compare-row ${cls}">
                            <span class="pred-pos pred-pos-${pos.label.charAt(1)}">${pos.label}</span>
                            <div class="pred-compare-detail">
                                <span class="pred-compare-pred">${pos.pred}</span>
                                ${!exact ? `<span class="pred-compare-actual">${t("predictions.actual_result")}: ${pos.actual || '?'}</span>` : ''}
                            </div>
                            <span class="pred-compare-icon">${icon} ${pts}</span>
                        </div>
                    `;
                });
                html += `</div>`;
            }
            html += `</div>`;
        });
        html += `</div>`;
    }

    if (upcoming.length === 0 && completed.length === 0) {
        html = `<div style="text-align:center; color:var(--muted); padding:4rem 0;"><span style="font-size:3rem;">🔮</span><p style="margin-top:1rem;">${t("predictions.empty_state")}</p></div>`;
    }

    container.innerHTML = html;
}

function savePredictionFromUI(round) {
    const p1 = document.getElementById(`pred-${round}-p1`)?.value;
    const p2 = document.getElementById(`pred-${round}-p2`)?.value;
    const p3 = document.getElementById(`pred-${round}-p3`)?.value;
    if (!p1 || !p2 || !p3) {
        alert(t("predictions.fill_all"));
        return;
    }
    if (p1 === p2 || p1 === p3 || p2 === p3) {
        alert(t("predictions.no_duplicate"));
        return;
    }
    savePrediction(round, p1, p2, p3);
    renderPredictions();
}

// --------------------------------------------------------
// DÉMARRAGE DU SITE
// --------------------------------------------------------
window.onload = function () {
    document.querySelectorAll(".nav-tab").forEach(tab => {
        tab.addEventListener("click", () => switchView(tab.dataset.view));
    });

    document.getElementById("header-home").addEventListener("click", () => switchView("races"));

    document.querySelectorAll(".modal-overlay").forEach(overlay => {
        overlay.addEventListener("click", function (e) {
            if (e.target === this) this.classList.remove("open");
        });
    });

    document.addEventListener("keydown", e => {
        if (e.key === "Escape") document.querySelectorAll(".modal-overlay").forEach(m => m.classList.remove("open"));
    });

    // Theme toggle
    document.getElementById("theme-toggle")?.addEventListener("click", toggleTheme);

    // Countdown ticker
    setInterval(updateCountdown, 1000);

    // Filtres courses
    document.querySelectorAll("#filter-status .filter-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll("#filter-status .filter-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            activeFilters.status = btn.dataset.filter;
            renderAllRaces();
        });
    });
    document.querySelectorAll("#filter-type .filter-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll("#filter-type .filter-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            activeFilters.type = btn.dataset.filter;
            renderAllRaces();
        });
    });
    document.querySelectorAll("#filter-continent .filter-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll("#filter-continent .filter-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            activeFilters.continent = btn.dataset.filter;
            renderAllRaces();
        });
    });
    const searchInput = document.getElementById("filter-search");
    if (searchInput) searchInput.addEventListener("input", e => { activeFilters.search = e.target.value; renderAllRaces(); });

    // Stats — toggle top10 / all (pilotes)
    document.querySelectorAll(".stats-toggle[data-driver-mode]").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".stats-toggle[data-driver-mode]").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            statsDriverMode = btn.dataset.driverMode;
            renderStats();
        });
    });

    // Preload TheSportsDB images
    preloadSportsDbImages();

    // PWA Service Worker
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("sw.js").catch(() => {});
    }
};