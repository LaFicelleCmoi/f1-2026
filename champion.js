// ============================================================
// 🏆 CHAMPION DU MONDE — détection automatique + célébration
// ============================================================
// Le titre est détecté à partir des résultats (Firebase) : dès que l'écart
// entre le leader et son premier poursuivant dépasse le maximum de points
// encore distribuables (courses + sprints restants, courses annulées
// exclues), le leader est champion. Rien n'est codé en dur pour le classement.
//
// Affichage : bandeau doré permanent + célébration plein écran (feux
// d'artifice, chiffres animés, records) montrée automatiquement une fois
// par saison, puis à la demande via le bandeau.

// Informations éditoriales facultatives par pilote (numéro, date de naissance,
// faits marquants). Sans entrée, la célébration fonctionne quand même.
const CHAMPION_META = {
    "Andrea Kimi Antonelli": {
        number: 12,
        firstName: "Andrea Kimi",
        lastName: "Antonelli",
        birthDate: "2006-08-25",
        facts: ["champ.italian"]
    }
};

// Record du plus jeune champion avant 2026 : Sebastian Vettel
// (né le 3 juillet 1987, titré le 14 novembre 2010).
const YOUNGEST_CHAMPION_DAYS = (Date.UTC(2010, 10, 14) - Date.UTC(1987, 6, 3)) / 864e5;

const CHAMP_COLORS = ["#27f4d2", "#ffffff", "#c9d1d9", "#ffd700", "#009246", "#ce2b37", "#27f4d2"];

// ── Calcul (pur, testable) ───────────────────────────────────
function computeChampion({ races = [], pointsSystem = [], sprintPoints = [] } = {}) {
    const P1 = pointsSystem[0] || 25;
    const S1 = sprintPoints[0] || 8;
    const isCancelled = r => r.cancelled === true || r.raceStatus === "cancelled";
    const done = s => s === "completed";
    const active = races.filter(r => !isCancelled(r));

    const pts = {};
    const add = list => (list || []).forEach(e => { pts[e.driver] = (pts[e.driver] || 0) + (e.points || 0); });
    const ranking = () => Object.entries(pts).sort((a, b) => b[1] - a[1]);

    let clinch = null;
    active.forEach((race, i) => {
        if (done(race.sprintStatus)) add(race.sprintResult?.fullResults);
        if (!done(race.raceStatus || race.status)) return;
        add(race.result?.fullResults);
        if (clinch) return;
        const after = active.slice(i + 1);
        const maxLeft = after.reduce((s, r) => s + P1 + (r.sprint ? S1 : 0), 0);
        const [first, second] = ranking();
        if (first && first[1] > (second ? second[1] : 0) + maxLeft) {
            clinch = { driver: first[0], race, racesLeft: after.length };
        }
    });
    if (!clinch) return null;

    const [leader, runnerUp] = ranking();
    if (!leader || leader[0] !== clinch.driver) return null; // garde-fou données incohérentes

    const name = clinch.driver;
    let wins = 0, podiums = 0, poles = 0, team = null;
    const winRaces = [];
    active.forEach(race => {
        if (!done(race.raceStatus || race.status)) return;
        const e = race.result?.fullResults?.find(x => x.driver === name);
        if (e) {
            team = e.team || team;
            if (!e.status && e.pos === 1) { wins++; winRaces.push({ round: race.round, flag: race.flag, name: race.name }); }
            if (!e.status && e.pos <= 3) podiums++;
        }
        if (race.qualiResults?.[0]?.driver === name) poles++;
    });

    return {
        driver: name,
        team,
        points: leader[1],
        runnerUp: runnerUp ? { driver: runnerUp[0], points: runnerUp[1] } : null,
        gap: leader[1] - (runnerUp ? runnerUp[1] : 0),
        wins, podiums, poles, winRaces,
        clinchRace: { round: clinch.race.round, name: clinch.race.name, flag: clinch.race.flag, date: clinch.race.dates?.race || null },
        racesLeftAtClinch: clinch.racesLeft,
        seasonOver: active.every(r => done(r.raceStatus || r.status))
    };
}

// Champion de la saison affichée (null tant que le titre n'est pas assuré)
function getChampion() {
    if (typeof races === "undefined") return null;
    return computeChampion({ races, pointsSystem, sprintPoints });
}

// ── Utilitaires d'affichage ──────────────────────────────────
function champEsc(s) {
    return String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function champMeta(c) {
    const meta = CHAMPION_META[c.driver] || {};
    const parts = c.driver.split(" ");
    const info = (typeof drivers !== "undefined" ? drivers : []).find(d => d.driver === c.driver) || {};
    return {
        number: meta.number ?? info.number ?? null,
        firstName: meta.firstName || parts.slice(0, -1).join(" "),
        lastName: meta.lastName || parts[parts.length - 1],
        birthDate: meta.birthDate || null,
        facts: meta.facts || [],
        flag: info.flag || "",
        team: c.team || info.team || ""
    };
}

// Âge au moment du titre : { y, d, totalDays }
function champAgeAt(birthIso, date) {
    if (!birthIso || !date) return null;
    const [by, bm, bd] = birthIso.split("-").map(Number);
    const at = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
    let y = date.getFullYear() - by;
    let lastBirthday = Date.UTC(date.getFullYear(), bm - 1, bd);
    if (lastBirthday > at) { y--; lastBirthday = Date.UTC(date.getFullYear() - 1, bm - 1, bd); }
    return { y, d: Math.round((at - lastBirthday) / 864e5), totalDays: Math.round((at - Date.UTC(by, bm - 1, bd)) / 864e5) };
}

function champFacts(c, m) {
    const facts = [];
    facts.push(c.racesLeftAtClinch > 0
        ? t("champ.clinched", { race: `${c.clinchRace.flag} ${c.clinchRace.name}`, left: c.racesLeftAtClinch })
        : t("champ.clinched_final", { race: `${c.clinchRace.flag} ${c.clinchRace.name}` }));
    const date = c.clinchRace.date && typeof parseFrenchDate === "function" ? parseFrenchDate(c.clinchRace.date) : null;
    const age = champAgeAt(m.birthDate, date);
    if (age && age.totalDays < YOUNGEST_CHAMPION_DAYS) {
        facts.push(t("champ.youngest", { age: t("champ.age", { y: age.y, d: age.d }) }));
    }
    m.facts.forEach(k => facts.push(t(k)));
    return facts;
}

const champReducedMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

// ── Bandeau permanent ────────────────────────────────────────
function renderChampion() {
    const banner = document.getElementById("champion-banner");
    const c = getChampion();
    if (!banner) return;
    if (!c) { banner.hidden = true; banner.innerHTML = ""; return; }
    const m = champMeta(c);
    const color = (typeof teamColors !== "undefined" && teamColors[m.team]) || "#27f4d2";
    banner.hidden = false;
    banner.style.setProperty("--champ-team", color);
    banner.innerHTML = `
        <button type="button" class="champion-banner-btn" onclick="openChampionCelebration()">
            <span class="champion-banner-trophy" aria-hidden="true">🏆</span>
            <span class="champion-banner-title">${champEsc(t("champ.banner", { season: ACTIVE_SEASON }))}</span>
            <span class="champion-banner-name">${m.flag} ${champEsc(c.driver)} <em>· ${champEsc(m.team)}</em></span>
            <span class="champion-banner-cta">${champEsc(t("champ.banner_cta"))} ▶</span>
        </button>`;

    // Célébration automatique : une seule fois par saison et par champion
    const key = `f1-champion-seen-${ACTIVE_SEASON}`;
    let seen = null;
    try { seen = localStorage.getItem(key); } catch (e) {}
    if (seen !== c.driver && !renderChampion.autoShown) {
        renderChampion.autoShown = true;
        try { localStorage.setItem(key, c.driver); } catch (e) {}
        setTimeout(openChampionCelebration, 700);
    }
}

// ── Célébration plein écran ──────────────────────────────────
let champFx = null;

function openChampionCelebration() {
    const c = getChampion();
    if (!c || document.getElementById("champ-overlay")) return;
    const m = champMeta(c);
    const color = (typeof teamColors !== "undefined" && teamColors[m.team]) || "#27f4d2";
    const stats = [
        ["points", c.points], ["wins", c.wins], ["podiums", c.podiums], ["poles", c.poles], ["gap", c.gap]
    ];

    const el = document.createElement("div");
    el.id = "champ-overlay";
    el.className = "champ-overlay";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-modal", "true");
    el.setAttribute("aria-label", t("champ.dialog_label", { season: ACTIVE_SEASON }));
    el.style.setProperty("--champ-team", color);
    el.innerHTML = `
        <div class="champ-rays" aria-hidden="true"></div>
        <canvas class="champ-fx" aria-hidden="true"></canvas>
        <button type="button" class="champ-close" aria-label="${champEsc(t("champ.close"))}">✕</button>
        <div class="champ-stage">
            ${m.number != null ? `<div class="champ-number" aria-hidden="true">${champEsc(m.number)}</div>` : ""}
            <div class="champ-trophy" aria-hidden="true">🏆</div>
            <div class="champ-kicker">${champEsc(t("champ.kicker"))}</div>
            <div class="champ-year">${champEsc(ACTIVE_SEASON)}</div>
            <h2 class="champ-name">
                <span class="champ-first">${champEsc(m.firstName)}</span>
                <span class="champ-last" data-text="${champEsc(m.lastName)}">${champEsc(m.lastName)}</span>
            </h2>
            <div class="champ-team">
                <span class="champ-tricolore" aria-hidden="true"></span>
                <span class="champ-flag">${m.flag}</span>
                <span>${champEsc(m.team)}</span>
                ${m.number != null ? `<span class="champ-num-chip">#${champEsc(m.number)}</span>` : ""}
            </div>
            <div class="champ-stats">
                ${stats.map(([k, v], i) => `
                    <div class="champ-stat" style="--i:${i}">
                        <span class="champ-stat-value" data-count="${Number(v) || 0}">${Number(v) || 0}</span>
                        <span class="champ-stat-label">${champEsc(t("champ.stat_" + k))}</span>
                    </div>`).join("")}
            </div>
            <ul class="champ-facts">
                ${champFacts(c, m).map((f, i) => `<li style="--i:${i}">${champEsc(f)}</li>`).join("")}
            </ul>
            ${c.winRaces.length ? `
            <div class="champ-road">
                <div class="champ-road-title">${champEsc(t("champ.wins_road", { n: c.wins }))}</div>
                <div class="champ-road-flags">
                    ${c.winRaces.map((w, i) => `<span class="champ-road-chip" style="--i:${i}" title="${champEsc(w.name)}">${w.flag}</span>`).join("")}
                </div>
            </div>` : ""}
            <div class="champ-actions">
                <button type="button" class="champ-btn champ-btn-gold" data-act="again">${champEsc(t("champ.again"))}</button>
                <button type="button" class="champ-btn" data-act="standings">${champEsc(t("champ.to_standings"))}</button>
            </div>
        </div>`;
    document.body.appendChild(el);
    document.body.classList.add("champ-open");

    const lastFocus = document.activeElement;
    const close = () => {
        champFx?.stop(); champFx = null;
        document.removeEventListener("keydown", onKey);
        el.classList.add("champ-leaving");
        document.body.classList.remove("champ-open");
        setTimeout(() => el.remove(), champReducedMotion() ? 0 : 350);
        lastFocus?.focus?.();
    };
    const onKey = e => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", onKey);
    el.querySelector(".champ-close").addEventListener("click", close);
    el.addEventListener("click", e => { if (e.target === el) close(); });
    el.querySelector('[data-act="again"]').addEventListener("click", () => champFx?.finale());
    el.querySelector('[data-act="standings"]').addEventListener("click", () => {
        close();
        if (typeof switchView === "function") switchView("standings");
    });

    requestAnimationFrame(() => el.classList.add("champ-in"));
    el.querySelector(".champ-close").focus({ preventScroll: true });

    if (!champReducedMotion()) {
        champCountUp(el);
        champFx = champFireworks(el.querySelector(".champ-fx"), [color, ...CHAMP_COLORS]);
    }
}

// Chiffres qui défilent jusqu'à leur valeur finale
function champCountUp(root) {
    root.querySelectorAll("[data-count]").forEach((node, i) => {
        const target = Number(node.dataset.count) || 0;
        const start = performance.now() + 900 + i * 120;
        const dur = 1600;
        node.textContent = "0";
        const step = now => {
            if (!node.isConnected) return;
            const p = Math.min(1, Math.max(0, (now - start) / dur));
            node.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
            if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    });
}

// ── Feux d'artifice + confettis (canvas) ─────────────────────
function champFireworks(canvas, palette) {
    const ctx = canvas.getContext("2d");
    const MAX = 1400;
    let W = 0, H = 0, raf = 0, running = true, lastLaunch = 0, intensity = 1;
    const parts = [];
    const rand = (a, b) => a + Math.random() * (b - a);
    const pick = () => palette[(Math.random() * palette.length) | 0];

    const resize = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        W = canvas.clientWidth; H = canvas.clientHeight;
        canvas.width = W * dpr; canvas.height = H * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const rocket = () => parts.push({
        kind: "rocket", x: rand(W * 0.12, W * 0.88), y: H + 10,
        vx: rand(-0.6, 0.6), vy: -rand(H * 0.0105, H * 0.0135) - 6,
        color: pick(), life: 1
    });

    const burst = (x, y, color) => {
        const n = Math.min(110, MAX - parts.length);
        const ring = Math.random() < 0.35;
        const speed = rand(3.2, 5.6);
        for (let i = 0; i < n; i++) {
            const a = (i / n) * Math.PI * 2 + rand(-0.05, 0.05);
            const s = ring ? speed : speed * Math.sqrt(Math.random());
            parts.push({
                kind: "spark", x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s,
                color: Math.random() < 0.15 ? "#ffffff" : color,
                life: 1, decay: rand(0.010, 0.018), size: rand(1.4, 2.6)
            });
        }
    };

    const confetti = count => {
        for (let i = 0; i < count && parts.length < MAX; i++) {
            parts.push({
                kind: "confetti", x: rand(0, W), y: rand(-H * 0.6, -10),
                vx: rand(-1, 1), vy: rand(1.5, 3.5), rot: rand(0, Math.PI), vr: rand(-0.2, 0.2),
                w: rand(6, 11), h: rand(3, 6), color: pick(), life: 1, sway: rand(0, Math.PI * 2)
            });
        }
    };

    const frame = now => {
        if (!running) return;
        raf = requestAnimationFrame(frame);
        if (document.hidden) return;

        // Cadence de lancement : intense au début, puis bouquet régulier
        const gap = 260 + 900 * (1 - intensity);
        if (now - lastLaunch > gap) {
            lastLaunch = now;
            rocket();
            if (intensity > 0.6) rocket();
        }
        intensity = Math.max(0, intensity - 0.0016);

        ctx.globalCompositeOperation = "source-over";
        ctx.clearRect(0, 0, W, H);
        ctx.globalCompositeOperation = "lighter";

        for (let i = parts.length - 1; i >= 0; i--) {
            const p = parts[i];
            if (p.kind === "rocket") {
                p.x += p.vx; p.y += p.vy; p.vy += 0.16;
                ctx.fillStyle = p.color;
                ctx.beginPath(); ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = "rgba(255,220,150,0.5)";
                ctx.fillRect(p.x - 0.8, p.y, 1.6, 10);
                if (p.vy >= -1) { burst(p.x, p.y, p.color); parts.splice(i, 1); }
            } else if (p.kind === "spark") {
                p.x += p.vx; p.y += p.vy; p.vx *= 0.975; p.vy = p.vy * 0.975 + 0.05;
                p.life -= p.decay;
                if (p.life <= 0) { parts.splice(i, 1); continue; }
                ctx.globalAlpha = p.life;
                ctx.fillStyle = p.color;
                ctx.beginPath(); ctx.arc(p.x, p.y, p.size * (0.5 + p.life * 0.5), 0, Math.PI * 2); ctx.fill();
            } else {
                p.sway += 0.05; p.x += p.vx + Math.sin(p.sway) * 0.6; p.y += p.vy; p.rot += p.vr;
                if (p.y > H + 20) { parts.splice(i, 1); continue; }
                ctx.globalCompositeOperation = "source-over";
                ctx.globalAlpha = 0.95;
                ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
                ctx.fillStyle = p.color; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.rot * 2)));
                ctx.restore();
                ctx.globalCompositeOperation = "lighter";
            }
            ctx.globalAlpha = 1;
        }
    };

    confetti(220);
    raf = requestAnimationFrame(frame);

    return {
        stop() { running = false; cancelAnimationFrame(raf); window.removeEventListener("resize", resize); },
        finale() {
            intensity = 1;
            for (let i = 0; i < 6; i++) setTimeout(() => running && rocket(), i * 120);
            confetti(160);
        }
    };
}
