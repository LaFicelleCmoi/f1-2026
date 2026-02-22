let isAdmin = sessionStorage.getItem("isAdmin") === "true";
let adminCurrentRace = null;

// SYNCHRONISATION SÉCURISÉE
try {
    const savedDataStr = localStorage.getItem("f1_results_2026");
    if (savedDataStr) {
        const savedData = JSON.parse(savedDataStr);
        if (Array.isArray(savedData)) {
            races.forEach(race => {
                const found = savedData.find(r => r.round === race.round);
                if (found) {
                    race.status = found.status || "upcoming";
                    race.sprintStatus = found.sprintStatus || "upcoming"; 
                    race.result = found.result || null;
                    race.sprintResult = found.sprintResult || null;
                }
            });
        }
    }
} catch (e) {
    console.error("Erreur avec la sauvegarde locale :", e);
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
        const statusClass = getStatusClass(race.status); 
        const badgeClass = getBadgeClass(race.status);
        const badgeLabel = getBadgeLabel(race.status);

        let podiumHTML = "";
        if (race.status === "completed" && race.result && race.result.podium) {
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
            podiumHTML = `<div class="no-result">Résultats à venir</div>`;
        }

        const dateFull = (race.dates && race.dates.full) ? race.dates.full : "";

        html += `
            <div class="race-card ${statusClass}" onclick="openModal(${index})">
                <div class="race-card-header">
                    <span class="race-round">R${race.round}</span>
                    <div class="race-badges">
                        ${race.sprint ? '<span class="sprint-tag">⚡ Sprint</span>' : ""}
                        ${race.isNew ? '<span class="new-tag">🆕</span>' : ""}
                        <span class="badge ${badgeClass}">${badgeLabel}</span>
                    </div>
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
    const driversMap = {};
    const constructorsMap = {};

    drivers.forEach(d => { driversMap[d.driver] = { driver: d.driver, team: d.team, flag: d.flag, points: 0 }; });
    constructors.forEach(c => { constructorsMap[c.team] = { team: c.team, flag: c.flag, points: 0 }; });

    races.forEach(race => {
        if (race.status === "completed" && race.result && race.result.fullResults) {
            race.result.fullResults.forEach(entry => {
                if (driversMap[entry.driver]) driversMap[entry.driver].points += entry.points || 0;
                if (constructorsMap[entry.team]) constructorsMap[entry.team].points += entry.points || 0;
            });
        }
        if (race.sprintStatus === "completed" && race.sprintResult && race.sprintResult.fullResults) {
            race.sprintResult.fullResults.forEach(entry => {
                if (driversMap[entry.driver]) driversMap[entry.driver].points += entry.points || 0;
                if (constructorsMap[entry.team]) constructorsMap[entry.team].points += entry.points || 0;
            });
        }
    });

    const sortedDrivers = Object.values(driversMap).sort((a, b) => b.points - a.points);
    const sortedConstructors = Object.values(constructorsMap).sort((a, b) => b.points - a.points);
    const medalColors = ["#ffd700", "#c0c0c0", "#cd7f32"];

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
    const monthKeys = ["Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
    const months = {};

    races.forEach(race => {
        let key = "Décembre";
        for (let i = 0; i < monthKeys.length; i++) {
            let m = monthKeys[i];
            if (race.dates && race.dates.race && race.dates.race.indexOf(m) !== -1) { 
                key = m; 
                break; 
            }
        }
        if (!months[key]) months[key] = [];
        months[key].push(race);
    });

    let html = "";
    monthKeys.forEach(m => {
        if (months[m]) {
            html += `<div class="timeline-month"><div class="timeline-month-label">📆 ${m} 2026</div>`;
            months[m].forEach(race => {
                const dateRace = (race.dates && race.dates.race) ? race.dates.race : "";
                html += `
                    <div class="timeline-race-item ${getStatusClass(race.status)}" onclick="openModal(${race.round - 1})">
                        <div class="timeline-race-left">
                            <span class="timeline-flag">${race.flag}</span>
                            <div>
                                <div class="timeline-race-name">${race.name}</div>
                                <div class="timeline-race-date">Round ${race.round} — ${dateRace}</div>
                            </div>
                        </div>
                        <div class="timeline-race-right">
                            ${race.sprint ? '<span class="sprint-tag">⚡ Sprint</span>' : ""}
                            ${race.isNew ? '<span class="new-tag">🆕</span>' : ""}
                            <span class="badge ${getBadgeClass(race.status)}">${getBadgeLabel(race.status)}</span>
                        </div>
                    </div>`;
            });
            html += `</div>`;
        }
    });
    document.getElementById("timeline-content").innerHTML = html;
}

function renderSprintView() {
    const sprintRaces = races.filter(r => r.sprint);
    const doneSprints = sprintRaces.filter(r => r.sprintStatus === "completed");

    document.getElementById("sprint-done-count").textContent = doneSprints.length;
    document.getElementById("sprint-total-count").textContent = sprintRaces.length;

    let html = "";
    sprintRaces.forEach(race => {
        const actualStatus = race.sprintStatus || "upcoming";
        const hasResult = actualStatus === "completed" && race.sprintResult && race.sprintResult.podium;
        
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
            <div class="race-card sprint-card ${getStatusClass(actualStatus)}" onclick="openModal(${race.round - 1})">
                <div class="race-card-header">
                    <span class="race-round sprint-round">R${race.round} ⚡</span>
                    <span class="badge ${getBadgeClass(actualStatus)}">${getBadgeLabel(actualStatus)}</span>
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
    const completed = races.filter(r => r.status === "completed").length;
    const upcoming = races.filter(r => r.status === "upcoming" || r.status === "next").length;
    document.getElementById("stat-completed").textContent = completed;
    document.getElementById("stat-upcoming").textContent = upcoming;
    document.getElementById("stat-total").textContent = races.length;
}

function openModal(index) {
    const race = races[index];
    const overlay = document.getElementById("modal-overlay");
    const content = document.getElementById("modal-content");

    const scheduleHTML = race.schedule ? race.schedule.map(s => {
        let itemClass = "schedule-item";
        if (s.type === "race") itemClass += " highlight";
        if (s.type === "sprint") itemClass += " sprint-session";
        return `<div class="${itemClass}"><span class="schedule-day">${s.day}</span><span class="schedule-name">${s.name}</span><span class="schedule-time">${s.time}</span></div>`;
    }).join("") : "";

    let resultsHTML = "";
    
    // Résultats Sprint (Si terminé)
    if (race.sprint && race.sprintStatus === "completed" && race.sprintResult && race.sprintResult.fullResults) {
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

    // Résultats Course (Si terminée)
    if (race.status === "completed" && race.result && race.result.fullResults) {
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
    
    if (resultsHTML === "") {
        resultsHTML = `<div class="modal-section"><div class="no-data-box"><div style="font-size:3rem">🏎️</div><p>Les résultats seront disponibles une fois l'événement terminé.</p></div></div>`;
    }

    const dateFull = (race.dates && race.dates.full) ? race.dates.full : "";

    content.innerHTML = `
        <div class="modal-header">
            <div class="modal-title-block">
                <span class="modal-flag">${race.flag}</span>
                <div>
                    <div class="modal-race-name">${race.name}</div>
                    <div class="modal-meta">
                        <span>📅 ${dateFull}</span><span>🏟️ ${race.circuit}</span><span>🏁 Round ${race.round}</span>
                        ${race.sprint ? '<span style="color:var(--sprint-light)">⚡ Sprint</span>' : ""}
                    </div>
                </div>
            </div>
            <button class="modal-close" onclick="closeModal()">✕</button>
        </div>
        <div class="modal-body">
            <div class="modal-section"><div class="modal-section-title">📋 Programme</div><div class="schedule-grid">${scheduleHTML}</div></div>
            ${resultsHTML}
        </div>`;
    overlay.classList.add("open");
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
// FONCTIONNALITES D'ADMINISTRATION INTEGREES
// --------------------------------------------------------

if (isAdmin) {
    const adminTab = document.getElementById("admin-tab");
    const btnToggle = document.getElementById("btn-toggle-admin");
    if (adminTab) adminTab.style.display = "block";
    if (btnToggle) {
        btnToggle.textContent = "Déconnexion Admin";
        btnToggle.style.color = "var(--red)";
    }
    renderAdminRaceList();
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
    if(!container) return;
    container.innerHTML = "";
    races.forEach((race, index) => {
        const btn = document.createElement("button");
        const isActive = index === adminCurrentRace;
        btn.style = `display:flex; align-items:center; gap:1rem; padding:0.75rem 1rem; background:${isActive ? 'var(--card2)' : 'transparent'}; border:none; border-left:3px solid ${isActive ? 'var(--red)' : 'transparent'}; border-bottom:1px solid var(--border); color:white; cursor:pointer; text-align:left; transition:background 0.2s; width:100%;`;
        btn.onmouseover = () => { if(!isActive) btn.style.background = "rgba(255,255,255,0.03)"; };
        btn.onmouseout = () => { if(!isActive) btn.style.background = "transparent"; };
        btn.innerHTML = `
            <span style="font-size:1.5rem">${race.flag}</span>
            <div style="flex:1">
                <div style="font-weight:600; font-size:0.9rem">${race.name}</div>
                <div style="font-size:0.75rem; color:var(--muted)">Round ${race.round}</div>
            </div>
            <span style="width:8px; height:8px; border-radius:50%; background:${race.status === 'completed' ? 'var(--green)' : race.status === 'next' ? 'var(--red)' : 'var(--border)'}"></span>
        `;
        btn.onclick = () => selectAdminRace(index);
        container.appendChild(btn);
    });
}

function selectAdminRace(index) {
    adminCurrentRace = index;
    renderAdminRaceList();
    const race = races[index];
    
    document.getElementById("admin-no-selection").style.display = "none";
    document.getElementById("admin-editor").style.display = "block";
    
    document.getElementById("edit-flag").textContent = race.flag;
    document.getElementById("edit-name").textContent = race.name;
    
    const dateFull = (race.dates && race.dates.full) ? race.dates.full : "";
    document.getElementById("edit-date").textContent = dateFull + " — " + race.circuit;
    document.getElementById("edit-status").value = race.status;

    // Gestion de l'affichage du statut Sprint (Injection dynamique)
    const sprintSection = document.getElementById("edit-sprint-section");
    if (race.sprint) {
        sprintSection.style.display = "block";
        
        let sprintHeader = document.getElementById("edit-sprint-header");
        if (!sprintHeader) {
            const h3 = sprintSection.querySelector("h3");
            if (h3) {
                h3.outerHTML = `
                    <div id="edit-sprint-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; flex-wrap:wrap; gap:1rem;">
                        <h3 style="color:var(--sprint-light); margin:0; font-size:1rem; display:flex; align-items:center; gap:0.5rem;">⚡ Résultats Sprint</h3>
                        <div style="display:flex; align-items:center; gap:0.5rem;">
                            <label style="font-size:0.8rem; color:var(--muted); font-weight:bold;">Statut Sprint</label>
                            <select id="edit-sprint-status" style="background:var(--card2); color:var(--text); border:1px solid var(--border); padding:0.4rem 0.6rem; border-radius:6px; outline:none;">
                                <option value="upcoming">À venir</option>
                                <option value="next">Prochain</option>
                                <option value="completed">Terminé</option>
                            </select>
                        </div>
                    </div>
                `;
            }
        }
        
        document.getElementById("edit-sprint-status").value = race.sprintStatus || "upcoming";

        const sResults = (race.sprintResult && race.sprintResult.fullResults) ? race.sprintResult.fullResults : [];
        renderAdminRows(sResults, "edit-sprint-rows", "sprint");
    } else {
        sprintSection.style.display = "none";
    }

    const rResults = (race.result && race.result.fullResults) ? race.result.fullResults : [];
    renderAdminRows(rResults, "edit-race-rows", "race");
}

function renderAdminRows(data, containerId, type) {
    const container = document.getElementById(containerId);
    container.innerHTML = `
        <div style="display:grid; grid-template-columns: 50px 1.5fr 1fr 100px 60px 30px; gap:0.5rem; padding:0 0.5rem; margin-bottom:0.5rem; font-size:0.75rem; font-weight:bold; color:var(--muted); text-transform:uppercase;">
            <span>Pos</span><span>Pilote</span><span>Écurie</span><span>Temps</span><span>Pts</span><span></span>
        </div>
    `;
    data.forEach(row => container.appendChild(createAdminRow(row, type)));
}

// L'attribution des points automatique (avec blocage au delà de la position 10 ou 8)
function updateAdminPoints(input, type) {
    const pos = parseInt(input.value);
    const row = input.parentElement;
    const ptsInput = row.querySelector('.pts-input');
    
    if (isNaN(pos) || pos < 1) {
        ptsInput.value = 0;
        return;
    }
    
    const racePoints = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
    const sprintPoints = [8, 7, 6, 5, 4, 3, 2, 1];
    const ptsSystem = (type === "sprint") ? sprintPoints : racePoints;
    
    ptsInput.value = ptsSystem[pos - 1] || 0; // 0 point si on est au delà des places payantes
}

function createAdminRow(data = {}, type = "race") {
    const div = document.createElement("div");
    div.className = "admin-row";
    div.style = "display:grid; grid-template-columns: 50px 1.5fr 1fr 100px 60px 30px; gap:0.5rem; margin-bottom:0.5rem; align-items:center;";
    
    const maxPts = (type === "sprint") ? 8 : 25;

    let driverOptions = `<option value="">Pilote...</option>`;
    drivers.forEach(d => {
        const selected = (data.driver === d.driver) ? "selected" : "";
        driverOptions += `<option value="${d.driver}" data-team="${d.team}" ${selected}>${d.driver}</option>`;
    });

    // Écurie remise en "readonly" avec curseur interdit
    div.innerHTML = `
        <input type="number" class="pos-input" placeholder="#" value="${data.pos || ''}" oninput="updateAdminPoints(this, '${type}')" min="1" max="22" style="width:100%; padding:0.5rem; background:var(--card2); border:1px solid var(--border); color:white; border-radius:6px; outline:none;">
        <select class="driver-select" onchange="this.parentElement.querySelector('.team-input').value = this.options[this.selectedIndex].getAttribute('data-team') || ''" style="width:100%; padding:0.5rem; background:var(--card2); border:1px solid var(--border); color:white; border-radius:6px; outline:none;">
            ${driverOptions}
        </select>
        <input type="text" class="team-input" placeholder="Écurie" value="${data.team || ''}" readonly style="width:100%; padding:0.5rem; background:var(--dark); border:1px solid var(--border); color:var(--muted); border-radius:6px; outline:none; cursor:not-allowed;">
        <input type="text" class="time-input" placeholder="Temps" value="${data.time || ''}" style="width:100%; padding:0.5rem; background:var(--card2); border:1px solid var(--border); color:white; border-radius:6px; outline:none;">
        <input type="number" class="pts-input" placeholder="Pts" value="${data.points !== undefined ? data.points : ''}" min="0" max="${maxPts}" style="width:100%; padding:0.5rem; background:var(--card2); border:1px solid var(--border); color:white; border-radius:6px; outline:none;">
        <button onclick="this.parentElement.remove()" style="background:transparent; border:none; color:var(--muted); font-size:1.1rem; cursor:pointer; padding:0.2rem;">✕</button>
    `;
    return div;
}

function addAdminRow(type) {
    const containerId = type === 'sprint' ? 'edit-sprint-rows' : 'edit-race-rows';
    const container = document.getElementById(containerId);
    const currentRowsCount = container.querySelectorAll('.admin-row').length;
    
    // Blocage à 22 pilotes maximum
    if (currentRowsCount >= 22) {
        alert("Vous avez atteint la limite de 22 pilotes.");
        return;
    }
    
    const nextPos = currentRowsCount + 1;
    container.appendChild(createAdminRow({pos: nextPos}, type));
}

function saveAdminResults() {
    if (adminCurrentRace === null) return;
    const race = races[adminCurrentRace];
    race.status = document.getElementById("edit-status").value;

    if (race.sprint) {
        const sprintStatusEl = document.getElementById("edit-sprint-status");
        if (sprintStatusEl) race.sprintStatus = sprintStatusEl.value;
    }

    const extractData = (containerId) => {
        const rows = [];
        document.querySelectorAll(`#${containerId} .admin-row`).forEach(row => {
            const pos = parseInt(row.querySelector(".pos-input").value) || 0;
            const driver = row.querySelector(".driver-select").value;
            const team = row.querySelector(".team-input").value;
            const time = row.querySelector(".time-input").value.trim();
            const points = parseInt(row.querySelector(".pts-input").value) || 0;
            if (driver) rows.push({ pos, driver, team, time, points });
        });
        return rows.sort((a,b) => a.pos - b.pos);
    };

    const raceResults = extractData("edit-race-rows");
    race.result = raceResults.length ? {
        podium: raceResults.slice(0,3).map(r => ({pos: r.pos, driver: r.driver, team: r.team})),
        fullResults: raceResults
    } : null;

    if (race.sprint) {
        const sprintResults = extractData("edit-sprint-rows");
        race.sprintResult = sprintResults.length ? {
            podium: sprintResults.slice(0,3).map(r => ({pos: r.pos, driver: r.driver, team: r.team})),
            fullResults: sprintResults
        } : null;
    }

    const toSave = races.map(r => ({
        round: r.round,
        status: r.status,
        sprintStatus: r.sprintStatus,
        result: r.result,
        sprintResult: r.sprintResult
    }));
    localStorage.setItem("f1_results_2026", JSON.stringify(toSave));

    renderAllRaces();
    renderStandings();
    renderTimeline();
    renderSprintView();
    updateStats();
    renderAdminRaceList();

    alert("✅ Résultats sauvegardés et mis à jour !");
}

function clearAdminResults() {
    if (adminCurrentRace === null) return;
    if (!confirm("Attention : Voulez-vous vraiment effacer tous les résultats de cette course ?")) return;
    const race = races[adminCurrentRace];
    race.status = "upcoming";
    race.sprintStatus = "upcoming";
    race.result = null;
    race.sprintResult = null;
    saveAdminResults();
    selectAdminRace(adminCurrentRace);
}

// --------------------------------------------------------
// DÉMARRAGE DU SITE
// --------------------------------------------------------
window.onload = function() {
    document.querySelectorAll(".nav-tab").forEach(tab => {
        tab.addEventListener("click", () => switchView(tab.dataset.view));
    });

    document.querySelectorAll(".modal-overlay").forEach(overlay => {
        overlay.addEventListener("click", function(e) {
            if (e.target === this) this.classList.remove("open");
        });
    });

    document.addEventListener("keydown", e => {
        if (e.key === "Escape") document.querySelectorAll(".modal-overlay").forEach(m => m.classList.remove("open"));
    });

    renderAllRaces();
    renderStandings();
    renderTimeline();
    renderSprintView();
    updateStats();
};