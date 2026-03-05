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

// ============================================================
// VARIABLES GLOBALES
// ============================================================
let isAdmin = sessionStorage.getItem("isAdmin") === "true";
let adminCurrentRace = null;

// ============================================================
// 🔥 CHARGEMENT FIREBASE (remplace localStorage)
// ============================================================
db.ref('f1_results_2026').on('value', snapshot => {
    const savedData = snapshot.val();
    if (savedData && Array.isArray(savedData)) {
        races.forEach(race => {
            const found = savedData.find(r => r.round === race.round);
            if (found) {
                race.raceStatus   = found.raceStatus   || "upcoming";
                race.sprintStatus = found.sprintStatus || (race.sprint ? "upcoming" : null);
                race.status       = found.raceStatus   || found.status || "upcoming";
                race.result       = found.result       || null;
                race.sprintResult = found.sprintResult || null;
                // Horaires modifiés par l'admin
                if (found.schedule) race.schedule = found.schedule;
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
    updateStats();
    if (isAdmin) renderAdminRaceList();
});

// ============================================================
// 💾 SAUVEGARDE FIREBASE (remplace localStorage.setItem)
// ============================================================
function saveToFirebase() {
    const toSave = races.map(r => ({
        round:        r.round,
        raceStatus:   r.raceStatus   || "upcoming",
        sprintStatus: r.sprintStatus || (r.sprint ? "upcoming" : null),
        status:       r.raceStatus   || "upcoming",
        result:       r.result       || null,
        sprintResult: r.sprintResult || null,
        schedule:     r.schedule     || null
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
    if (status === "completed") return "completed";
    if (status === "next") return "next";
    return "upcoming";
}

function getBadgeClass(status) {
    if (status === "completed") return "badge-done";
    if (status === "next") return "badge-next";
    return "badge-upcoming";
}

function getBadgeLabel(status) {
    if (status === "completed") return "✓ Terminé";
    if (status === "next") return "▶ Prochain";
    return "À venir";
}

function renderAllRaces() {
    const grid = document.getElementById("races-grid");
    if (!grid) return;
    let html = "";

    races.forEach((race, index) => {
        const rs = race.raceStatus   || race.status || "upcoming";
        const ss = race.sprintStatus || "upcoming";

        // Statut global de la carte = raceStatus
        const statusClass = getStatusClass(rs);

        let badgesHTML = "";
        if (race.sprint) {
            badgesHTML += `<span class="sprint-tag" style="background:${ss === 'completed' ? 'rgba(34,197,94,0.15)' : ss === 'next' ? 'rgba(124,58,237,0.25)' : 'rgba(124,58,237,0.15)'}; color:${ss === 'completed' ? 'var(--green)' : 'var(--sprint-light)'}; border-color:${ss === 'completed' ? 'rgba(34,197,94,0.3)' : 'rgba(124,58,237,0.3)'}">
                ⚡ Sprint ${ss === 'completed' ? '✓' : ss === 'next' ? '▶' : ''}
            </span>`;
        }
        if (race.isNew) badgesHTML += `<span class="new-tag">🆕</span>`;
        badgesHTML += `<span class="badge ${getBadgeClass(rs)}">🏁 Course ${getBadgeLabel(rs)}</span>`;

        let podiumHTML = "";
        if (rs === "completed" && race.result && race.result.podium) {
            podiumHTML = `
                <div class="race-result">
                    <div class="podium">
                        ${race.result.podium.map((p, i) => `
                            <div class="podium-item">
                                <div class="podium-pos ${getPodiumColor(i+1)}">${getPodiumIcon(i+1)}</div>
                                <div class="podium-driver">${p.driver || '-'}</div>
                                <div class="podium-team">${p.team || '-'}</div>
                            </div>
                        `).join("")}
                    </div>
                </div>`;
        } else {
            podiumHTML = `<div class="no-result">Résultats course à venir</div>`;
        }

        const dateFull = (race.dates && race.dates.full) ? race.dates.full : "";

        html += `
            <div class="race-card ${statusClass}" onclick="openModal(${index})">
                <div class="race-card-header">
                    <span class="race-round">R${race.round}</span>
                    <div class="race-badges">${badgesHTML}</div>
                </div>
                <div class="race-card-body">
                    <div class="race-flag-name">
                        <span class="race-flag">${race.flag}</span>
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
    grid.innerHTML = html;
}

function renderStandings() {
    const driversMap      = {};
    const constructorsMap = {};

    drivers.forEach(d => { driversMap[d.driver]       = { driver: d.driver, team: d.team, flag: d.flag, points: 0 }; });
    constructors.forEach(c => { constructorsMap[c.team] = { team: c.team,   flag: c.flag, points: 0 }; });

    races.forEach(race => {
        const rs = race.raceStatus || race.status || "upcoming";
        if (rs === "completed") {
            if (race.result && race.result.fullResults) {
                race.result.fullResults.forEach(entry => {
                    if (driversMap[entry.driver])      driversMap[entry.driver].points      += entry.points || 0;
                    if (constructorsMap[entry.team])   constructorsMap[entry.team].points   += entry.points || 0;
                });
            }
            if (race.sprintResult && race.sprintResult.fullResults) {
                race.sprintResult.fullResults.forEach(entry => {
                    if (driversMap[entry.driver])      driversMap[entry.driver].points      += entry.points || 0;
                    if (constructorsMap[entry.team])   constructorsMap[entry.team].points   += entry.points || 0;
                });
            }
        }
    });

    const sortedDrivers       = Object.values(driversMap).sort((a, b) => b.points - a.points);
    const sortedConstructors  = Object.values(constructorsMap).sort((a, b) => b.points - a.points);
    const medalColors         = ["#ffd700", "#c0c0c0", "#cd7f32"];

    document.getElementById("drivers-standings").innerHTML = `
        <thead><tr><th>#</th><th>Pilote</th><th>Écurie</th><th>Points</th></tr></thead>
        <tbody>
            ${sortedDrivers.map((d, i) => `
                <tr>
                    <td style="font-weight:900;color:${medalColors[i] || "var(--text)"}">${i + 1}</td>
                    <td>${d.flag} ${d.driver}</td>
                    <td style="color:var(--muted);font-size:0.8rem">${d.team}</td>
                    <td class="points-cell">${d.points} pts</td>
                </tr>`).join("")}
        </tbody>`;

    document.getElementById("constructors-standings").innerHTML = `
        <thead><tr><th>#</th><th>Écurie</th><th>Points</th></tr></thead>
        <tbody>
            ${sortedConstructors.map((c, i) => `
                <tr>
                    <td style="font-weight:900;color:${medalColors[i] || "var(--text)"}">${i + 1}</td>
                    <td>${c.flag} ${c.team}</td>
                    <td class="points-cell">${c.points} pts</td>
                </tr>`).join("")}
        </tbody>`;
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
                    ? '<span class="sprint-tag" style="background:' + (ss === 'completed' ? 'rgba(34,197,94,0.15)' : 'rgba(124,58,237,0.15)') + '; color:' + (ss === 'completed' ? 'var(--green)' : 'var(--sprint-light)') + '; border-color:' + (ss === 'completed' ? 'rgba(34,197,94,0.3)' : 'rgba(124,58,237,0.3)') + '">⚡ Sprint ' + (ss === 'completed' ? '✓' : ss === 'next' ? '▶' : '') + '</span>'
                    : "";
                html += '<div class="timeline-race-item ' + getStatusClass(rs) + '" onclick="openModal(' + (race.round - 1) + ')">' +
                    '<div class="timeline-race-left"><span class="timeline-flag">' + race.flag + '</span>' +
                    '<div><div class="timeline-race-name">' + race.name + '</div>' +
                    '<div class="timeline-race-date">Round ' + race.round + ' — ' + dateRace + '</div></div></div>' +
                    '<div class="timeline-race-right">' +
                    sprintBadge +
                    (race.isNew ? '<span class="new-tag">🆕</span>' : "") +
                    '<span class="badge ' + getBadgeClass(rs) + '">🏁 ' + getBadgeLabel(rs) + '</span>' +
                    '</div></div>';
            });
            html += '</div>';
        }
    });
    document.getElementById("timeline-content").innerHTML = html;
}

function renderSprintView() {
    const sprintRaces  = races.filter(r => r.sprint);
    const doneSprints  = sprintRaces.filter(r => r.status === "completed");

    document.getElementById("sprint-done-count").textContent  = doneSprints.length;
    document.getElementById("sprint-total-count").textContent = sprintRaces.length;

    let html = "";
    sprintRaces.forEach(race => {
        const ss = race.sprintStatus || "upcoming";
        const hasResult = ss === "completed" && race.sprintResult && race.sprintResult.podium;
        let podiumHTML = hasResult ? `
            <div class="race-result">
                <div class="podium">
                    ${race.sprintResult.podium.map((p, i) => `
                        <div class="podium-item">
                            <div class="podium-pos ${getPodiumColor(i+1)}">${getPodiumIcon(i+1)}</div>
                            <div class="podium-driver">${p.driver || '-'}</div>
                            <div class="podium-team">${p.team || '-'}</div>
                        </div>
                    `).join("")}
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
                        <span class="race-flag">${race.flag}</span>
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
    const completed = races.filter(r => (r.raceStatus || r.status) === "completed").length;
    const upcoming  = races.filter(r => {
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

        if (isAdmin) {
            return `<div class="${itemClass}" style="gap:0.5rem;">
                <span class="schedule-day" style="min-width:80px; font-size:0.78rem; color:var(--muted); font-weight:700;">${s.day}</span>
                <span class="schedule-name" style="flex:1;">${s.name}</span>
                <input
                    type="text"
                    value="${s.time}"
                    data-schedule-index="${i}"
                    placeholder="HH:MM"
                    style="width:80px; padding:0.3rem 0.5rem; background:rgba(0,0,0,0.4);
                        border:1px solid var(--red); color:var(--red); border-radius:6px;
                        font-weight:800; font-size:0.9rem; text-align:center; outline:none;"
                    oninput="updateScheduleTime(${index}, ${i}, this.value)"
                >
            </div>`;
        } else {
            return `<div class="${itemClass}">
                <span class="schedule-day">${s.day}</span>
                <span class="schedule-name">${s.name}</span>
                <span class="schedule-time">${s.time}</span>
            </div>`;
        }
    }).join("") : "";

    const rs = race.raceStatus || race.status || "upcoming";
    const ss = race.sprintStatus || "upcoming";

    let resultsHTML = "";
    if (rs === "completed") {
        if (race.result && race.result.fullResults) {
            resultsHTML += `
                <div class="modal-section">
                    <div class="modal-section-title">🏁 Résultats Course</div>
                    <table class="full-results-table">
                        <thead><tr><th>Pos</th><th>Pilote</th><th>Écurie</th><th>Temps</th><th>Points</th></tr></thead>
                        <tbody>
                            ${race.result.fullResults.map((entry, idx) => `
                                <tr>
                                    <td class="pos-medal ${getPodiumColor(idx+1)}">${idx < 3 ? getPodiumIcon(idx+1) : idx+1}</td>
                                    <td>${entry.driver}</td>
                                    <td style="color:var(--muted)">${entry.team}</td>
                                    <td style="color:var(--muted)">${entry.time || '-'}</td>
                                    <td class="points-cell">${entry.points}</td>
                                </tr>`).join("")}
                        </tbody>
                    </table>
                </div>`;
        }
    }
    if (ss === "completed") {
        if (race.sprintResult && race.sprintResult.fullResults) {
            resultsHTML += `
                <div class="modal-section">
                    <div class="modal-section-title">⚡ Résultats Sprint</div>
                    <table class="full-results-table">
                        <thead><tr><th>Pos</th><th>Pilote</th><th>Écurie</th><th>Temps</th><th>Points</th></tr></thead>
                        <tbody>
                            ${race.sprintResult.fullResults.map((entry, idx) => `
                                <tr>
                                    <td class="pos-medal ${getPodiumColor(idx+1)}">${idx < 3 ? getPodiumIcon(idx+1) : idx+1}</td>
                                    <td>${entry.driver}</td>
                                    <td style="color:var(--muted)">${entry.team}</td>
                                    <td style="color:var(--muted)">${entry.time || '-'}</td>
                                    <td class="points-cell">${entry.points}</td>
                                </tr>`).join("")}
                        </tbody>
                    </table>
                </div>`;
        }
    }

    if (resultsHTML === "") {
        resultsHTML = `<div class="modal-section"><div class="no-data-box"><div style="font-size:3rem">🏎️</div><p>Les résultats seront disponibles après la course.</p></div></div>`;
    }

    const dateFull = (race.dates && race.dates.full) ? race.dates.full : "";

    // Bouton sauvegarder horaires visible uniquement en admin
    const saveScheduleBtn = isAdmin ? `
        <button onclick="saveSchedule(${index})"
            style="margin-top:0.75rem; padding:0.5rem 1.2rem; background:var(--red);
                border:none; color:white; border-radius:8px; font-weight:bold;
                cursor:pointer; font-size:0.85rem;">
            💾 Sauvegarder les horaires
        </button>` : "";

    content.innerHTML = `
        <div class="modal-header">
            <div class="modal-title-block">
                <span class="modal-flag">${race.flag}</span>
                <div>
                    <div class="modal-race-name">${race.name}</div>
                    <div class="modal-meta">
                        <span>📅 ${dateFull}</span>
                        <span>🏟️ ${race.circuit}</span>
                        <span>🏁 Round ${race.round}</span>
                        ${race.sprint ? '<span style="color:var(--sprint-light)">⚡ Sprint</span>' : ""}
                        ${isAdmin ? '<span style="color:var(--red); font-size:0.75rem;">⚙️ Mode Admin</span>' : ""}
                    </div>
                </div>
            </div>
            <button class="modal-close" onclick="closeModal()">✕</button>
        </div>
        <div class="modal-body">
            <div class="modal-section">
                <div class="modal-section-title">📋 Programme${isAdmin ? ' <span style="color:var(--red);font-size:0.75rem;font-weight:normal;">— cliquez sur une heure pour modifier</span>' : ''}</div>
                <div class="schedule-grid">${scheduleHTML}</div>
                ${saveScheduleBtn}
            </div>
            ${resultsHTML}
        </div>`;
    overlay.classList.add("open");
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

function switchView(view) {
    document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
    document.querySelectorAll(".nav-tab").forEach(t => t.classList.remove("active"));
    document.getElementById("view-" + view).classList.add("active");
    const activeTab = document.querySelector("[data-view='" + view + "']");
    if (activeTab) activeTab.classList.add("active");
}

// --------------------------------------------------------
// ADMINISTRATION
// --------------------------------------------------------

if (isAdmin) {
    const adminTab = document.getElementById("admin-tab");
    const btnToggle = document.getElementById("btn-toggle-admin");
    if (adminTab)   adminTab.style.display = "block";
    if (btnToggle) {
        btnToggle.textContent   = "Déconnexion Admin";
        btnToggle.style.color   = "var(--red)";
    }
}

function showAdminLogin() {
    if (isAdmin) {
        sessionStorage.removeItem("isAdmin");
        location.reload();
    } else {
        document.getElementById("admin-login-overlay").classList.add("open");
        setTimeout(() => document.getElementById("admin-pwd").focus(), 100);
    }
}

function loginAdmin() {
    const pwd = document.getElementById("admin-pwd").value;
    if (pwd === "f1admin2026") {
        sessionStorage.setItem("isAdmin", "true");
        location.reload();
    } else {
        document.getElementById("admin-error").style.display = "block";
    }
}

const pwdInput = document.getElementById("admin-pwd");
if (pwdInput) {
    pwdInput.addEventListener("keydown", function(e) {
        if (e.key === "Enter") loginAdmin();
    });
}

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
                    <span>🏁 ${rs === 'completed' ? '<span style="color:var(--green)">Terminé</span>' : rs === 'next' ? '<span style="color:var(--red)">Prochain</span>' : 'À venir'}</span>
                    ${race.sprint ? `<span>⚡ ${ss === 'completed' ? '<span style="color:var(--green)">Terminé</span>' : ss === 'next' ? '<span style="color:var(--sprint-light)">Prochain</span>' : 'À venir'}</span>` : ''}
                </div>
            </div>
            <span style="width:8px; height:8px; border-radius:50%;
                background:${rs === 'completed' ? 'var(--green)' : rs === 'next' ? 'var(--red)' : 'var(--border)'}">
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

        // Supprimer l'ancien select Sprint injecté dynamiquement s'il existe
        const oldWrap = document.querySelector("#edit-sprint-section > div[data-sprint-status-wrap]");
        if (oldWrap) oldWrap.remove();

        const sResults = (race.sprintResult && race.sprintResult.fullResults) ? race.sprintResult.fullResults : [];
        renderAdminRows(sResults, "edit-sprint-rows", "sprint");
    } else {
        sprintHeaderEl.style.display = "none";
        document.getElementById("edit-sprint-section").style.display = "none";
    }

    const rResults = (race.result && race.result.fullResults) ? race.result.fullResults : [];
    renderAdminRows(rResults, "edit-race-rows", "race");
}

// Fonction pour mettre à jour les listes de pilotes et empêcher les doublons
function updateAllDriverSelects(container) {
    if (!container) return;
    
    // 1. On récupère tous les selects de ce conteneur (Course ou Sprint)
    const allSelects = Array.from(container.querySelectorAll('.driver-select'));
    
    // 2. On liste tous les pilotes actuellement sélectionnés
    const selectedDrivers = allSelects.map(sel => sel.value).filter(val => val !== "");

    // 3. On met à jour les options de chaque select
    allSelects.forEach(select => {
        const currentValue = select.value;
        
        // On vide le select
        select.innerHTML = `<option value="">Pilote...</option>`;
        
        // On recrée les options
        drivers.forEach(d => {
            // Le pilote est ajouté SI il n'est pas déjà pris OU SI c'est celui sélectionné dans cette ligne précise
            if (!selectedDrivers.includes(d.driver) || d.driver === currentValue) {
                const isSelected = (d.driver === currentValue) ? "selected" : "";
                select.insertAdjacentHTML('beforeend', `<option value="${d.driver}" data-team="${d.team}" ${isSelected}>${d.driver}</option>`);
            }
        });
    });
}

function renderAdminRows(data, containerId, type) {
    const container = document.getElementById(containerId);
    container.innerHTML = `
        <div style="display:grid; grid-template-columns: 50px 1.5fr 1fr 100px 60px 30px; gap:0.5rem;
            padding:0 0.5rem; margin-bottom:0.5rem; font-size:0.75rem; font-weight:bold;
            color:var(--muted); text-transform:uppercase;">
            <span>Pos</span><span>Pilote</span><span>Écurie</span><span>Temps</span><span>Pts</span><span></span>
        </div>`;
        
    data.forEach(row => container.appendChild(createAdminRow(row, type)));
    
    // On met à jour les listes pour cacher les pilotes déjà affichés
    updateAllDriverSelects(container);
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

function createAdminRow(data = {}, type = "race") {
    const div = document.createElement("div");
    div.className = "admin-row";
    div.style = "display:grid; grid-template-columns: 50px 1.5fr 1fr 100px 60px 30px; gap:0.5rem; margin-bottom:0.5rem; align-items:center;";
    const maxPts = (type === "sprint") ? 8 : 25;

    // POS
    const posInput = document.createElement("input");
    posInput.type        = "number";
    posInput.className   = "pos-input";
    posInput.placeholder = "#";
    posInput.value       = data.pos || "";
    posInput.style       = "width:100%; padding:0.5rem; background:var(--card2); border:1px solid var(--border); color:white; border-radius:6px; outline:none;";

    // PILOTE
    const driverSelect = document.createElement("select");
    driverSelect.className = "driver-select";
    driverSelect.style     = "width:100%; padding:0.5rem; background:var(--card2); border:1px solid var(--border); color:white; border-radius:6px; outline:none;";
    let driverOptions = `<option value="">Pilote...</option>`;
    drivers.forEach(d => {
        const selected = data.driver === d.driver ? "selected" : "";
        driverOptions += `<option value="${d.driver}" data-team="${d.team}" ${selected}>${d.driver}</option>`;
    });
    driverSelect.innerHTML = driverOptions;

    // ÉCURIE (readonly, auto-remplie)
    const teamInput = document.createElement("input");
    teamInput.type        = "text";
    teamInput.className   = "team-input";
    teamInput.placeholder = "Écurie";
    teamInput.value       = data.team || "";
    teamInput.readOnly    = true;
    teamInput.style       = "width:100%; padding:0.5rem; background:var(--dark); border:1px solid var(--border); color:var(--muted); border-radius:6px; outline:none; cursor:not-allowed;";

    // TEMPS
    const timeInput = document.createElement("input");
    timeInput.type        = "text";
    timeInput.className   = "time-input";
    timeInput.placeholder = "Temps";
    timeInput.value       = data.time || "";
    timeInput.style       = "width:100%; padding:0.5rem; background:var(--card2); border:1px solid var(--border); color:white; border-radius:6px; outline:none;";

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
    
    // Auto-points dès que la position change
    posInput.addEventListener("input", () => updateAdminPoints(posInput, type));

    // Auto-écurie ET mise à jour des disponibilités dès que le pilote change
    driverSelect.addEventListener("change", () => {
        const opt = driverSelect.options[driverSelect.selectedIndex];
        // S'assurer qu'une vraie option est sélectionnée
        teamInput.value = (opt && opt.value !== "") ? (opt.getAttribute("data-team") || "") : "";
        // Mettre à jour les autres selecteurs
        updateAllDriverSelects(div.parentElement);
    });

    // Supprimer la ligne ET libérer le pilote
    delBtn.addEventListener("click", () => {
        const parent = div.parentElement;
        div.remove();
        updateAllDriverSelects(parent);
    });

    div.appendChild(posInput);
    div.appendChild(driverSelect);
    div.appendChild(teamInput);
    div.appendChild(timeInput);
    div.appendChild(ptsInput);
    div.appendChild(delBtn);

    // Calcul initial si pos déjà remplie
    if (data.pos) updateAdminPoints(posInput, type);

    return div;
}

function addAdminRow(type) {
    const containerId = type === 'sprint' ? 'edit-sprint-rows' : 'edit-race-rows';
    const container   = document.getElementById(containerId);
    
    // --- NOUVEAU : Blocage à 22 pilotes maximum ---
    const currentRows = container.querySelectorAll('.admin-row').length;
    if (currentRows >= 22) {
        alert("Vous avez atteint la limite de 22 pilotes maximum pour cette session.");
        return;
    }

    const nextPos = currentRows + 1;
    container.appendChild(createAdminRow({ pos: nextPos }, type));
    
    // Mettre à jour les listes (au cas où on ajoute une ligne vide, 
    // elle ne doit pas proposer les pilotes déjà pris au-dessus)
    updateAllDriverSelects(container);
}

function saveAdminResults() {
    if (adminCurrentRace === null) return;
    const race      = races[adminCurrentRace];
    race.raceStatus = document.getElementById("edit-status").value;
    race.status     = race.raceStatus; // rétrocompatibilité

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
            const time   = row.querySelector(".time-input").value.trim();
            const points = parseInt(row.querySelector(".pts-input").value) || 0;
            if (driver) rows.push({ pos, driver, team, time, points });
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
    }

    saveToFirebase();

    renderAllRaces();
    renderStandings();
    renderTimeline();
    renderSprintView();
    updateStats();
    renderAdminRaceList();

    alert("✅ Résultats sauvegardés sur Firebase !");
}

function clearAdminResults() {
    if (adminCurrentRace === null) return;
    if (!confirm("Attention : Voulez-vous vraiment effacer tous les résultats de cette course ?")) return;
    const race        = races[adminCurrentRace];
    race.raceStatus   = "upcoming";
    race.sprintStatus = race.sprint ? "upcoming" : null;
    race.status       = "upcoming";
    race.result       = null;
    race.sprintResult = null;
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

    document.querySelectorAll(".modal-overlay").forEach(overlay => {
        overlay.addEventListener("click", function (e) {
            if (e.target === this) this.classList.remove("open");
        });
    });

    document.addEventListener("keydown", e => {
        if (e.key === "Escape") document.querySelectorAll(".modal-overlay").forEach(m => m.classList.remove("open"));
    });
};