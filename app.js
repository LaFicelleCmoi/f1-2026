const isAdmin = sessionStorage.getItem("isAdmin") === "true";

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
                                <div class="podium-driver">${p.driver}</div>
                                <div class="podium-team">${p.team}</div>
                            </div>
                        `).join("")}
                    </div>
                </div>`;
        } else {
            podiumHTML = `<div class="no-result">Résultats à venir</div>`;
        }

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
                    <div class="race-info-row"><span>📅</span><span>${race.dates.full}</span></div>
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

    drivers.forEach(d => {
        driversMap[d.driver] = { driver: d.driver, team: d.team, flag: d.flag, points: 0 };
    });

    constructors.forEach(c => {
        constructorsMap[c.team] = { team: c.team, flag: c.flag, points: 0 };
    });

    races.forEach(race => {
        if (race.status === "completed" && race.result) {
            if (race.result.fullResults) {
                race.result.fullResults.forEach((entry, idx) => {
                    const pts = pointsSystem[idx] || 0;
                    const bonus = entry.fastestLap && idx < 10 ? 1 : 0;
                    if (driversMap[entry.driver]) driversMap[entry.driver].points += pts + bonus;
                    if (constructorsMap[entry.team]) constructorsMap[entry.team].points += pts + bonus;
                });
            }
            if (race.result.sprintResults) {
                race.result.sprintResults.forEach((entry, idx) => {
                    if (driversMap[entry.driver]) driversMap[entry.driver].points += sprintPoints[idx] || 0;
                    if (constructorsMap[entry.team]) constructorsMap[entry.team].points += sprintPoints[idx] || 0;
                });
            }
        }
    });

    const sortedDrivers = Object.values(driversMap).sort((a, b) => b.points - a.points);
    const sortedConstructors = Object.values(constructorsMap).sort((a, b) => b.points - a.points);
    const medalColors = ["#ffd700", "#c0c0c0", "#cd7f32"];

    const driversHTML = sortedDrivers.map((d, i) => `
        <tr>
            <td style="font-weight:900;color:${medalColors[i] || "var(--text)"}">${i + 1}</td>
            <td>${d.flag} ${d.driver}</td>
            <td style="color:var(--muted);font-size:0.8rem">${d.team}</td>
            <td class="points-cell">${d.points} pts</td>
        </tr>`).join("");

    const constructorsHTML = sortedConstructors.map((c, i) => `
        <tr>
            <td style="font-weight:900;color:${medalColors[i] || "var(--text)"}">${i + 1}</td>
            <td>${c.flag} ${c.team}</td>
            <td class="points-cell">${c.points} pts</td>
        </tr>`).join("");

    document.getElementById("drivers-standings").innerHTML = `
        <thead><tr><th>#</th><th>Pilote</th><th>Écurie</th><th>Points</th></tr></thead>
        <tbody>${driversHTML}</tbody>`;

    document.getElementById("constructors-standings").innerHTML = `
        <thead><tr><th>#</th><th>Écurie</th><th>Points</th></tr></thead>
        <tbody>${constructorsHTML}</tbody>`;
}

function renderTimeline() {
    const monthKeys = ["Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
    const months = {};

    races.forEach(race => {
        let key = "Décembre 2026";
        for (const m of monthKeys) {
            if (race.dates.full.includes(m)) {
                key = m + " 2026";
                break;
            }
        }
        if (!months[key]) months[key] = [];
        months[key].push(race);
    });

    let html = "";
    for (const [month, monthRaces] of Object.entries(months)) {
        html += `<div class="timeline-month">
            <div class="timeline-month-label">📆 ${month}</div>`;
        monthRaces.forEach(race => {
            html += `
                <div class="timeline-race-item ${getStatusClass(race.status)}" onclick="openModal(${race.round - 1})">
                    <div class="timeline-race-left">
                        <span class="timeline-flag">${race.flag}</span>
                        <div>
                            <div class="timeline-race-name">${race.name}</div>
                            <div class="timeline-race-date">Round ${race.round} — ${race.dates.race}</div>
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

    document.getElementById("timeline-content").innerHTML = html;
}

function renderSprintView() {
    const sprintRaces = races.filter(r => r.sprint);
    const doneSprints = sprintRaces.filter(r => r.status === "completed");

    document.getElementById("sprint-done-count").textContent = doneSprints.length;
    document.getElementById("sprint-total-count").textContent = sprintRaces.length;

    let html = "";
    sprintRaces.forEach(race => {
        const hasResult = race.status === "completed" && race.result && race.result.sprintResults;

        let podiumHTML = "";
        if (hasResult) {
            podiumHTML = `
                <div class="race-result">
                    <div class="podium">
                        ${race.result.sprintResults.slice(0, 3).map((p, i) => `
                            <div class="podium-item">
                                <div class="podium-pos ${getPodiumColor(i+1)}">${getPodiumIcon(i+1)}</div>
                                <div class="podium-driver">${p.driver}</div>
                                <div class="podium-team">${p.team}</div>
                            </div>
                        `).join("")}
                    </div>
                </div>`;
        } else {
            podiumHTML = `<div class="no-result">Résultats Sprint à venir</div>`;
        }

        html += `
            <div class="race-card sprint-card" onclick="openModal(${race.round - 1})">
                <div class="race-card-header">
                    <span class="race-round sprint-round">R${race.round} ⚡</span>
                    <span class="badge ${getBadgeClass(race.status)}">${getBadgeLabel(race.status)}</span>
                </div>
                <div class="race-card-body">
                    <div class="race-flag-name">
                        <span class="race-flag">${race.flag}</span>
                        <div>
                            <div class="race-name">${race.name}</div>
                            <div class="race-country">${race.country} — ${race.city}</div>
                        </div>
                    </div>
                    <div class="race-info-row"><span>📅</span><span>${race.dates.full}</span></div>
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

    const scheduleHTML = race.schedule.map(s => {
        let itemClass = "schedule-item";
        if (s.type === "race") itemClass += " highlight";
        if (s.type === "sprint") itemClass += " sprint-session";
        return `
            <div class="${itemClass}">
                <span class="schedule-day">${s.day}</span>
                <span class="schedule-name">${s.name}</span>
                <span class="schedule-time">${s.time}</span>
            </div>`;
    }).join("");

    let resultsHTML = "";
    if (race.status === "completed" && race.result) {
        if (race.result.fullResults) {
            resultsHTML += `
                <div class="modal-section">
                    <div class="modal-section-title">🏁 Résultats Course</div>
                    <table class="full-results-table">
                        <thead><tr><th>Pos</th><th>Pilote</th><th>Écurie</th><th>Points</th></tr></thead>
                        <tbody>
                            ${race.result.fullResults.map((entry, idx) => `
                                <tr>
                                    <td class="pos-medal ${getPodiumColor(idx+1)}">${idx < 3 ? getPodiumIcon(idx+1) : idx+1}</td>
                                    <td>${entry.flag} ${entry.driver} ${entry.fastestLap ? '<span class="fastest-lap">⚡</span>' : ""}</td>
                                    <td style="color:var(--muted)">${entry.team}</td>
                                    <td class="points-cell">${(pointsSystem[idx] || 0) + (entry.fastestLap && idx < 10 ? 1 : 0)}</td>
                                </tr>`).join("")}
                        </tbody>
                    </table>
                </div>`;
        }
        if (race.result.sprintResults) {
            resultsHTML += `
                <div class="modal-section">
                    <div class="modal-section-title">⚡ Résultats Sprint</div>
                    <table class="full-results-table">
                        <thead><tr><th>Pos</th><th>Pilote</th><th>Écurie</th><th>Points</th></tr></thead>
                        <tbody>
                            ${race.result.sprintResults.map((entry, idx) => `
                                <tr>
                                    <td class="pos-medal ${getPodiumColor(idx+1)}">${idx < 3 ? getPodiumIcon(idx+1) : idx+1}</td>
                                    <td>${entry.flag} ${entry.driver}</td>
                                    <td style="color:var(--muted)">${entry.team}</td>
                                    <td class="points-cell">${sprintPoints[idx] || 0}</td>
                                </tr>`).join("")}
                        </tbody>
                    </table>
                </div>`;
        }
    } else {
        resultsHTML = `
            <div class="modal-section">
                <div class="no-data-box">
                    <div style="font-size:3rem">🏎️</div>
                    <p>Les résultats seront disponibles après la course.</p>
                </div>
            </div>`;
    }

    content.innerHTML = `
        <div class="modal-header">
            <div class="modal-title-block">
                <span class="modal-flag">${race.flag}</span>
                <div>
                    <div class="modal-race-name">${race.name}</div>
                    <div class="modal-meta">
                        <span>📅 ${race.dates.full}</span>
                        <span>🏟️ ${race.circuit}</span>
                        <span>🏁 Round ${race.round}</span>
                        ${race.sprint ? '<span style="color:var(--sprint-light)">⚡ Weekend Sprint</span>' : ""}
                        ${race.isNew ? '<span style="color:#f59e0b">🆕 Nouveau Grand Prix</span>' : ""}
                    </div>
                </div>
            </div>
            <button class="modal-close" onclick="closeModal()">✕</button>
        </div>
        <div class="modal-body">
            <div class="modal-section">
                <div class="modal-section-title">📋 Programme du Weekend</div>
                <div class="schedule-grid">${scheduleHTML}</div>
            </div>
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
    document.querySelector("[data-view='" + view + "']").classList.add("active");
}

document.querySelectorAll(".nav-tab").forEach(tab => {
    tab.addEventListener("click", () => switchView(tab.dataset.view));
});

document.getElementById("modal-overlay").addEventListener("click", function(e) {
    if (e.target === this) closeModal();
});

document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeModal();
});

renderAllRaces();
renderStandings();
renderTimeline();
renderSprintView();
updateStats();
