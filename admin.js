const ADMIN_PASSWORD = "f1admin2026";

let currentRaceIndex = null;
let racesData = [];

function checkPassword() {
    const input = document.getElementById("password-input").value;
    const error = document.getElementById("login-error");
    if (input === ADMIN_PASSWORD) {
        document.getElementById("login-screen").classList.add("hidden");
        document.getElementById("admin-panel").classList.remove("hidden");
initAdmin();
          }
 else {
        error.textContent = "Mot de passe incorrect.";
    }
}

document.getElementById("password-input").addEventListener("keydown", function(e) {
    if (e.key === "Enter") checkPassword();
});

function logout() {
    document.getElementById("login-screen").classList.remove("hidden");
    document.getElementById("admin-panel").classList.add("hidden");
    document.getElementById("password-input").value = "";
}

function initAdmin() {
    racesData = JSON.parse(JSON.stringify(races));
    const saved = localStorage.getItem("f1_results_2025");
    if (saved) {
        const savedData = JSON.parse(saved);
        racesData = racesData.map(race => {
            const found = savedData.find(r => r.id === race.id);
            return found ? { ...race, ...found } : race;
        });
    }
    renderRaceList();
}

function renderRaceList() {
    const container = document.getElementById("race-list");
    container.innerHTML = "";
    racesData.forEach((race, index) => {
        const btn = document.createElement("button");
        btn.className = "race-list-item" + (index === currentRaceIndex ? " active" : "");
        btn.innerHTML = `
            <span class="item-flag">${race.flag}</span>
            <div class="item-info">
                <div class="item-name">${race.name}</div>
                <div class="item-round">Round ${race.round}</div>
            </div>
            <span class="status-dot ${race.status}"></span>
        `;
        btn.onclick = () => selectRace(index);
        container.appendChild(btn);
    });
}

function selectRace(index) {
    currentRaceIndex = index;
    renderRaceList();
    renderEditor();
}

function renderEditor() {
    const race = racesData[currentRaceIndex];
    document.getElementById("no-selection").classList.add("hidden");
    document.getElementById("race-editor").classList.remove("hidden");
    document.getElementById("editor-flag").textContent = race.flag;
    document.getElementById("editor-name").textContent = race.name;
    document.getElementById("editor-date").textContent = race.date + " — " + race.circuit;
    document.getElementById("race-status").value = race.status;

    const sprintSection = document.getElementById("sprint-section");
    if (race.isSprint) {
        sprintSection.classList.remove("hidden");
        renderSprintRows(race.sprintResult?.fullResults || []);
    } else {
        sprintSection.classList.add("hidden");
    }

    renderRaceRows(race.result?.fullResults || []);
    document.getElementById("save-msg").classList.add("hidden");
}

function updateStatus() {
    if (currentRaceIndex === null) return;
    racesData[currentRaceIndex].status = document.getElementById("race-status").value;
    renderRaceList();
}

function renderRaceRows(data) {
    const container = document.getElementById("race-rows");
    container.innerHTML = `
        <div class="col-header">
            <span>Pos</span>
            <span>Pilote</span>
            <span>Écurie</span>
            <span>Temps</span>
            <span>Points</span>
            <span></span>
        </div>
    `;
    data.forEach((row, i) => {
        container.appendChild(createRow(row, i, "race"));
    });
}

function renderSprintRows(data) {
    const container = document.getElementById("sprint-rows");
    container.innerHTML = `
        <div class="col-header">
            <span>Pos</span>
            <span>Pilote</span>
            <span>Écurie</span>
            <span>Temps</span>
            <span>Points</span>
            <span></span>
        </div>
    `;
    data.forEach((row, i) => {
        container.appendChild(createRow(row, i, "sprint"));
    });
}

function createRow(data, index, type) {
    const div = document.createElement("div");
    div.className = "result-row";
    div.dataset.type = type;
    div.dataset.index = index;
    div.innerHTML = `
        <input type="number" placeholder="Pos" value="${data.pos || ''}" min="1" max="30" />
        <input type="text" placeholder="Nom du pilote" value="${data.driver || ''}" />
        <input type="text" placeholder="Écurie" value="${data.team || ''}" />
        <input type="text" placeholder="Temps / +X.XXX" value="${data.time || ''}" />
        <input type="number" placeholder="Pts" value="${data.points || ''}" min="0" max="26" />
        <button class="btn-remove" onclick="removeRow(this)">✕</button>
    `;
    return div;
}

function addRaceRow() {
    const container = document.getElementById("race-rows");
    const rows = container.querySelectorAll(".result-row");
    const nextPos = rows.length + 1;
    container.appendChild(createRow({ pos: nextPos }, rows.length, "race"));
}

function addSprintRow() {
    const container = document.getElementById("sprint-rows");
    const rows = container.querySelectorAll(".result-row");
    const nextPos = rows.length + 1;
    container.appendChild(createRow({ pos: nextPos }, rows.length, "sprint"));
}

function removeRow(btn) {
    btn.closest(".result-row").remove();
}

function collectRows(containerId) {
    const rows = document.querySelectorAll(`#${containerId} .result-row`);
    const results = [];
    rows.forEach(row => {
        const inputs = row.querySelectorAll("input");
        const pos = parseInt(inputs[0].value);
        const driver = inputs[1].value.trim();
        const team = inputs[2].value.trim();
        const time = inputs[3].value.trim();
        const points = parseInt(inputs[4].value) || 0;
        if (driver) {
            results.push({ pos, driver, team, time, points });
        }
    });
    return results.sort((a, b) => a.pos - b.pos);
}

function buildPodium(fullResults) {
    return fullResults.slice(0, 3).map(r => ({
        pos: r.pos,
        driver: r.driver,
        team: r.team
    }));
}

function saveResults() {
    if (currentRaceIndex === null) return;
    const race = racesData[currentRaceIndex];

    race.status = document.getElementById("race-status").value;

    const raceFullResults = collectRows("race-rows");
    race.result = {
        podium: buildPodium(raceFullResults),
        fullResults: raceFullResults
    };

    if (race.isSprint) {
        const sprintFullResults = collectRows("sprint-rows");
        race.sprintResult = {
            podium: buildPodium(sprintFullResults),
            fullResults: sprintFullResults
        };
    }

    const toSave = racesData.map(r => ({
        id: r.id,
        status: r.status,
        result: r.result,
        sprintResult: r.sprintResult
    }));

    localStorage.setItem("f1_results_2025", JSON.stringify(toSave));

    renderRaceList();
    const msg = document.getElementById("save-msg");
    msg.classList.remove("hidden");
    setTimeout(() => msg.classList.add("hidden"), 3000);
}

function clearResults() {
    if (currentRaceIndex === null) return;
    if (!confirm("Effacer tous les résultats de cette course ?")) return;
    const race = racesData[currentRaceIndex];
    race.result = null;
    race.sprintResult = null;
    race.status = "upcoming";
    renderEditor();
    renderRaceList();
}
sessionStorage.setItem("isAdmin", "true");
