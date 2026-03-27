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
        el.innerHTML = "🏁 <strong>Saison 2026 terminée</strong>";
        return;
    }

    const now = new Date();
    const diff = next.date - now;

    if (diff <= 0) {
        el.innerHTML = `🔴 <strong>EN COURS</strong> — ${next.session.name} ${next.race.flag} ${next.race.country}`;
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
            btnToggle.textContent = "Déconnexion Admin";
            btnToggle.style.color = "var(--red)";
        }
        renderAdminRaceList();
    } else {
        if (adminTab) adminTab.style.display = "none";
        if (btnToggle) {
            btnToggle.textContent = "Admin";
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
    updateStats();
    updateCountdown();
    if (isAdmin) renderAdminRaceList();
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
    if (status === "completed")  return "✓ Terminé";
    if (status === "next")       return "▶ Prochain";
    if (status === "cancelled")  return "✕ Annulé";
    return "À venir";
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
            podiumHTML = `<div class="no-result">Résultats course à venir</div>`;
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

        html += `
            <div class="race-card ${statusClass}${race.isNew ? ' race-card-new' : ''}${rs === 'next' ? ' race-card-next' : ''}" onclick="openModal(${index})">
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
                    ${(statsHTML || podiumHTML !== `<div class="no-result">Résultats course à venir</div>`) ? `
                    <div class="card-spoil-wrapper ${sessionStorage.getItem('card-spoil-' + index) === 'true' ? 'revealed' : ''}" id="card-spoil-${index}">
                        <div class="card-spoil-overlay" onclick="event.stopPropagation()">
                            <span class="card-spoil-icon">🔒</span>
                            <span class="card-spoil-text">Résultats masqués</span>
                            <button class="card-spoil-btn" onclick="event.stopPropagation(); revealCardSpoil(${index})">👁️ Voir</button>
                        </div>
                        <div class="card-spoil-content">
                            ${statsHTML}
                            ${podiumHTML}
                            <button class="card-spoil-hide-btn" onclick="event.stopPropagation(); hideCardSpoil(${index})">🙈 Masquer</button>
                        </div>
                    </div>` : podiumHTML}
                </div>
            </div>`;
    });

    if (filtered.length === 0) {
        html = '<div class="no-data-box" style="grid-column:1/-1"><div style="font-size:3rem">🔍</div><p>Aucune course ne correspond aux filtres.</p></div>';
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
        <thead><tr><th>#</th><th colspan="2">Pilote</th><th>Écurie</th><th>Points</th></tr></thead>
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
        <thead><tr><th>#</th><th colspan="2">Écurie</th><th>Points</th></tr></thead>
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
    const sortedTeams = Object.values(teamStats).filter(t => t.wins > 0 || t.podiums > 0).sort((a, b) => b.wins - a.wins || b.podiums - a.podiums);
    const sortedDrivers = Object.values(driverStats).filter(d => d.wins > 0 || d.podiums > 0).sort((a, b) => b.wins - a.wins || b.podiums - a.podiums);

    // Podium des 3 meilleures équipes
    let teamPodiumHTML = "";
    if (sortedTeams.length >= 1) {
        const top3 = sortedTeams.slice(0, 3);
        // Remplir jusqu'à 3
        while (top3.length < 3) top3.push({ team: "-", flag: "", wins: 0, podiums: 0, poles: 0, winRaces: [] });

        teamPodiumHTML = `
        <div class="palmares-section">
            <h3 class="palmares-title">🏭 Meilleures Écuries</h3>
            <div class="podium-stage">
                ${top3.map((t, i) => {
                    const pos = i + 1;
                    const color = teamColors[t.team] || "#666";
                    const logo = teamLogos[t.team] || "";
                    const posLabel = pos === 1 ? "1ST" : pos === 2 ? "2ND" : "3RD";
                    return `
                    <div class="podium-card podium-p${pos}" style="--team-color:${color}">
                        <div class="podium-crown">${pos === 1 ? '👑' : ''}</div>
                        <div class="podium-position">${posLabel}</div>
                        ${logo ? `<img class="podium-team-logo" src="${logo}" alt="${t.team}" onerror="this.style.display='none'">` : ''}
                        <div class="podium-team-bar"></div>
                        <div class="podium-driver-name">${t.team || '-'}</div>
                        <div class="podium-team-name">${t.wins} victoire${t.wins > 1 ? 's' : ''} — ${t.podiums} podium${t.podiums > 1 ? 's' : ''}</div>
                        <div class="podium-pillar">
                            <span class="podium-pillar-num">${t.wins}</span>
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
            <h3 class="palmares-title">🧑‍🚀 Meilleurs Pilotes</h3>
            <div class="podium-stage">
                ${top3d.map((d, i) => {
                    const pos = i + 1;
                    const color = teamColors[d.team] || "#666";
                    const logo = teamLogos[d.team] || "";
                    const posLabel = pos === 1 ? "1ST" : pos === 2 ? "2ND" : "3RD";
                    return `
                    <div class="podium-card podium-p${pos}" style="--team-color:${color}">
                        <div class="podium-crown">${pos === 1 ? '👑' : ''}</div>
                        <div class="podium-position">${posLabel}</div>
                        ${logo ? `<img class="podium-team-logo" src="${logo}" alt="${d.team}" onerror="this.style.display='none'">` : ''}
                        <div class="podium-team-bar"></div>
                        <div class="podium-driver-name">${d.flag} ${d.driver || '-'}</div>
                        <div class="podium-team-name">${d.wins} victoire${d.wins > 1 ? 's' : ''} — ${d.podiums} podium${d.podiums > 1 ? 's' : ''}</div>
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
            <h3 class="palmares-title">📊 Détail par Écurie</h3>
            <table class="standings-table palmares-table">
                <thead><tr><th>#</th><th>Écurie</th><th>🏆 Victoires</th><th>🥇 Podiums</th><th>⚡ Poles</th></tr></thead>
                <tbody>
                    ${sortedTeams.map((t, i) => {
                        const color = teamColors[t.team] || "#666";
                        return `<tr>
                            <td style="font-weight:800;color:var(--muted)">${i + 1}</td>
                            <td><span style="display:inline-block;width:4px;height:14px;border-radius:2px;background:${color};margin-right:8px;vertical-align:middle"></span>${t.flag} ${t.team}</td>
                            <td style="font-weight:800;color:var(--gold)">${t.wins}</td>
                            <td style="font-weight:700;color:var(--silver)">${t.podiums}</td>
                            <td style="color:var(--muted)">${t.poles}</td>
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
            <h3 class="palmares-title">📊 Détail par Pilote</h3>
            <table class="standings-table palmares-table">
                <thead><tr><th>#</th><th>Pilote</th><th>Écurie</th><th>🏆 Vict.</th><th>🥇 Pod.</th><th>⚡ Poles</th></tr></thead>
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
        container.innerHTML = `<div class="no-data-box"><div style="font-size:3rem">🏁</div><p>Aucune course terminée pour le moment.</p><p style="color:var(--muted);font-size:0.85rem">Les statistiques apparaîtront après la première course.</p></div>`;
        return;
    }

    container.innerHTML = `<div class="palmares-podiums-row">${teamPodiumHTML}${driverPodiumHTML}</div><div class="palmares-tables-row">${teamTableHTML}${driverTableHTML}</div>`;
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
            </div>` : `<div class="no-result">Résultats Sprint à venir</div>`;

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
            <thead><tr><th>Pos</th><th>Pilote</th><th>Écurie</th></tr></thead>
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
                <div class="modal-section-title">${icon} ${title} <span style="font-size:0.7rem;font-weight:400;color:var(--muted);margin-left:0.5rem;">anti-spoil</span></div>
                <div class="spoil-wrapper ${wasRevealed ? 'revealed' : ''}" id="${spoilId}">
                    <div class="spoil-overlay">
                        <div class="spoil-overlay-icon">🔒</div>
                        <div class="spoil-overlay-text">Résultats masqués pour éviter le spoil</div>
                        <button class="spoil-btn spoil-btn-reveal" onclick="revealSpoil('${spoilId}')">👁️ Révéler les résultats</button>
                    </div>
                    <div class="spoil-blur">
                        ${tableHTML}
                    </div>
                    <button class="spoil-btn-hide" onclick="hideSpoil('${spoilId}')">🙈 Masquer les résultats</button>
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
        resultsHTML += buildSpoilSection("Qualifications Sprint", "⚡", sqTable, `spoil-sq-${index}`);
    }

    // ── Résultats Sprint (anti-spoil) ──
    if (ss === "completed" && race.sprintResult && race.sprintResult.fullResults) {
        const sprintTable = `<table class="full-results-table">
            <thead><tr><th>Pos</th><th>Pilote</th><th>Écurie</th><th>Points</th></tr></thead>
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
        resultsHTML += buildSpoilSection("Résultats Sprint", "⚡", sprintTable, `spoil-sr-${index}`);
    }

    // ── Qualifications Course (menu déroulant) ──
    if (race.qualiResults && race.qualiResults.length > 0) {
        const rqTable = buildQualiTable(race.qualiResults);
        resultsHTML += buildSpoilSection("Qualifications Course", "🏁", rqTable, `spoil-rq-${index}`);
    }

    // ── Résultats Course (anti-spoil) ──
    if (rs === "completed" && race.result && race.result.fullResults) {
        const raceTable = `<table class="full-results-table">
            <thead><tr><th>Pos</th><th>Pilote</th><th>Écurie</th><th>Points</th></tr></thead>
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
        resultsHTML += buildSpoilSection("Résultats Course", "🏁", raceTable, `spoil-rc-${index}`);
    }

    if (resultsHTML === "") {
        resultsHTML = `<div class="modal-section"><div class="no-data-box"><div style="font-size:3rem">🏎️</div><p>Les résultats seront disponibles après la course.</p></div></div>`;
    }

    const dateFull = (race.dates && race.dates.full) ? race.dates.full : "";
    const teamColor = (() => {
        const winner = race.result?.fullResults?.find(r => r.pos === 1);
        return winner ? (teamColors[winner.team] || "var(--red)") : "var(--red)";
    })();

    // ── Onglets disponibles ──
    const tabs = [];
    tabs.push({ id: "info",    icon: "📋", label: "Programme" });

    // Essais Libres
    if (race.fp1Results?.length > 0) tabs.push({ id: "fp1", icon: "🔧", label: "EL1" });
    if (!race.sprint) {
        if (race.fp2Results?.length > 0) tabs.push({ id: "fp2", icon: "🔧", label: "EL2" });
        if (race.fp3Results?.length > 0) tabs.push({ id: "fp3", icon: "🔧", label: "EL3" });
    }

    // Sprint weekend
    if (race.sprint) {
        if (race.sprintQualiResults?.length > 0)  tabs.push({ id: "sq",  icon: "⚡", label: "Qualifs Sprint" });
        if (ss === "completed" && race.sprintResult?.fullResults?.length > 0)
            tabs.push({ id: "sr", icon: "⚡", label: "Sprint" });
    }
    if (race.qualiResults?.length > 0)  tabs.push({ id: "rq",  icon: "🏁", label: "Qualifications" });
    if (rs === "completed" && race.result?.fullResults?.length > 0)
        tabs.push({ id: "rc", icon: "🏆", label: "Course" });

    // Onglet actif par défaut : dernier disponible (résultats) ou infos
    const defaultTab = tabs[tabs.length - 1]?.id || "info";

    // ── Contenu de chaque onglet ──
    // Helper : tableau d'essais libres (avec temps + écart)
    function buildFPTable(fpData, sessionLabel) {
        const t = `<table class="full-results-table">
            <thead><tr><th>Pos</th><th>Pilote</th><th>Écurie</th><th>Temps</th><th>Écart</th></tr></thead>
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
        return t;
    }

    function tabContent(tabId) {
        switch(tabId) {
            case "info": return `
                <div class="modal-tab-pane">
                    <div class="modal-section-title">📋 Programme${isAdmin ? ' <span style="color:var(--red);font-size:0.75rem;font-weight:normal;">— cliquez sur une heure pour modifier</span>' : ''}</div>
                    <div class="schedule-grid">${scheduleHTML}</div>
                    ${isAdmin ? `<button onclick="saveSchedule(${index})" class="modal-save-btn">💾 Sauvegarder les horaires</button>` : ""}
                </div>`;
            case "fp1": return `<div class="modal-tab-pane">${buildFPTable(race.fp1Results, "Essais Libres 1")}</div>`;
            case "fp2": return `<div class="modal-tab-pane">${buildFPTable(race.fp2Results, "Essais Libres 2")}</div>`;
            case "fp3": return `<div class="modal-tab-pane">${buildFPTable(race.fp3Results, "Essais Libres 3")}</div>`;
            case "sq": {
                const t = buildQualiTable(race.sprintQualiResults);
                return `<div class="modal-tab-pane">${buildSpoilSection("Qualifications Sprint","⚡",t,`spoil-sq-${index}`)}</div>`;
            }
            case "sr": {
                const t = `<table class="full-results-table">
                    <thead><tr><th>Pos</th><th>Pilote</th><th>Écurie</th><th>Pts</th></tr></thead>
                    <tbody>${race.sprintResult.fullResults.map((e,i)=>`
                        <tr class="${i<3?'podium-row-'+(i+1):''}">
                            <td class="pos-medal ${getPodiumColor(i+1)}">${i<3?getPodiumIcon(i+1):i+1}</td>
                            <td style="font-weight:600">${e.driver}</td>
                            <td style="color:var(--muted);font-size:0.82rem">${e.team}</td>
                            <td class="points-cell">${e.points}</td>
                        </tr>`).join("")}
                    </tbody></table>`;
                return `<div class="modal-tab-pane">${buildSpoilSection("Résultats Sprint","⚡",t,`spoil-sr-${index}`)}</div>`;
            }
            case "rq": {
                const t = buildQualiTable(race.qualiResults);
                return `<div class="modal-tab-pane">${buildSpoilSection("Qualifications Course","🏁",t,`spoil-rq-${index}`)}</div>`;
            }
            case "rc": {
                const t = `<table class="full-results-table">
                    <thead><tr><th>Pos</th><th>Pilote</th><th>Écurie</th><th>Pts</th></tr></thead>
                    <tbody>${race.result.fullResults.map((e,i)=>`
                        <tr class="${i<3?'podium-row-'+(i+1):''}">
                            <td class="pos-medal ${getPodiumColor(i+1)}">${i<3?getPodiumIcon(i+1):i+1}</td>
                            <td style="font-weight:600">${e.driver}</td>
                            <td style="color:var(--muted);font-size:0.82rem">${e.team}</td>
                            <td class="points-cell">${e.points}</td>
                        </tr>`).join("")}
                    </tbody></table>`;
                return `<div class="modal-tab-pane">${buildSpoilSection("Résultats Course","🏆",t,`spoil-rc-${index}`)}</div>`;
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
                            ${race.sprint ? '<span class="modal-meta-sprint">⚡ Sprint</span>' : ""}
                            ${race.isNew ? '<span class="modal-meta-new">✨ Nouveau</span>' : ""}
                            ${isAdmin ? '<span style="color:var(--red);font-size:0.72rem;">⚙️ Admin</span>' : ""}
                        </div>
                    </div>
                </div>
                <button class="modal-close" onclick="closeModal()">✕</button>
            </div>
        </div>

        <div class="modal-tabs">
            ${tabs.map(t => `
                <button class="modal-tab-btn ${t.id === defaultTab ? 'active' : ''}"
                        data-tab="${t.id}"
                        onclick="switchModalTab('${t.id}', this)">
                    ${t.icon} ${t.label}
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
        btn.textContent = "✅ Sauvegardé !";
        btn.style.background = "var(--green)";
        setTimeout(() => {
            btn.textContent = "💾 Sauvegarder les horaires";
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
    document.querySelectorAll(".nav-tab").forEach(t => t.classList.remove("active"));
    const target = document.getElementById("view-" + view);
    void target.offsetWidth;
    target.classList.add("active");
    const activeTab = document.querySelector("[data-view='" + view + "']");
    if (activeTab) activeTab.classList.add("active");
    // Re-déclencher animation classements à chaque visite de l'onglet
    if (view === "standings") setTimeout(animateStandings, 80);
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
                    <span>🏁 ${rs === 'completed' ? '<span style="color:var(--green)">Terminé</span>' : rs === 'next' ? '<span style="color:var(--red)">Prochain</span>' : rs === 'cancelled' ? '<span style="color:#ef4444">✕ Annulé</span>' : 'À venir'}</span>
                    ${race.sprint ? `<span>⚡ ${ss === 'completed' ? '<span style="color:var(--green)">Terminé</span>' : ss === 'next' ? '<span style="color:var(--sprint-light)">Prochain</span>' : ss === 'cancelled' ? '<span style="color:#ef4444">✕ Annulé</span>' : 'À venir'}</span>` : ''}
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
            <span>Pos</span><span>Pilote</span><span>Écurie</span><span>Pts</span><span></span>
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

// ── Fetch Essais Libres via OpenF1 API ──
async function fetchPracticeResults(sessionName, countryName, year = 2026) {
    // sessionName : "Practice 1", "Practice 2", "Practice 3"
    const res = await fetch(`${OPENF1_BASE}/sessions?session_name=${encodeURIComponent(sessionName)}&country_name=${encodeURIComponent(countryName)}&year=${year}`);
    const sessions = await res.json();
    if (!sessions || sessions.length === 0) return [];
    const sessionKey = sessions[0].session_key;

    // Récupérer les laps de la session et prendre le meilleur temps par pilote
    const lapsRes = await fetch(`${OPENF1_BASE}/laps?session_key=${sessionKey}`);
    const laps = await lapsRes.json();
    if (!laps || laps.length === 0) return [];

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

        // 4. Essais Libres (OpenF1 API) — sauvegarde directe en base
        try {
            const countryName = race.country;
            if (race.sprint) {
                // Sprint weekend : EL1 seulement
                try {
                    const fp1 = await fetchPracticeResults("Practice 1", countryName);
                    if (fp1.length > 0) {
                        race.fp1Results = fp1;
                        await db.ref(`races/${adminCurrentRace}/fp1Results`).set(fp1);
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
                            await db.ref(`races/${adminCurrentRace}/${key}`).set(fpData);
                            importedAny = true;
                        }
                    } catch (e) { errors.push(sessionName + ": " + e.message); }
                }
            }
        } catch (e) { errors.push("Essais Libres: " + e.message); }

    } catch (e) {
        errors.push("Erreur générale: " + e.message);
    }

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

    // PWA Service Worker
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("sw.js").catch(() => {});
    }
};