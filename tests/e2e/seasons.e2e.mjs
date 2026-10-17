// Test navigateur FACULTATIF des saisons (scénarios 1 à 10 du cahier des charges).
// Prérequis hors projet (aucune dépendance ajoutée au dépôt) :
//   npm i --no-save playwright-core && npx playwright install chromium-headless-shell
//   python3 -m http.server 8765 --bind 127.0.0.1   # depuis la racine du dépôt
//   node tests/e2e/seasons.e2e.mjs
// Variables : E2E_BASE (URL de index.html), CHROME_PATH (navigateur à utiliser).
let chromium;
try { ({ chromium } = await import("playwright-core")); }
catch (e) { console.log("playwright-core absent — test e2e ignoré (voir l'en-tête du fichier)."); process.exit(0); }
const BASE = process.env.E2E_BASE || "http://127.0.0.1:8765/index.html";
const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
const results = [];
const ok = (name, cond, extra = "") => { results.push([cond ? "PASS" : "FAIL", name, extra]); };

async function newPage(opts = {}) {
    const ctx = await browser.newContext({ viewport: opts.viewport || { width: 1280, height: 900 }, serviceWorkers: "block" });
    const page = await ctx.newPage();
    page.errors = [];
    page.on("pageerror", e => page.errors.push(e.message));
    page.on("console", m => { if (m.type() === "error" && !/CORS|Failed to load resource|ERR_FAILED/.test(m.text())) page.errors.push("console: " + m.text()); });
    if (opts.blockApis) await page.route(/jolpi\.ca|espn\.com|openf1\.org|thesportsdb\.com/, r => r.abort());
    return { ctx, page };
}
const info = (page) => page.evaluate(() => ({
    season: ACTIVE_SEASON,
    select: document.getElementById("season-select")?.value,
    options: [...document.querySelectorAll("#season-select option")].map(o => o.value),
    subtitle: document.querySelector(".season-title")?.textContent,
    cards: document.querySelectorAll("#races-grid .race-card").length,
    firstCard: document.querySelector("#races-grid .race-card .race-name, #races-grid .race-card h3")?.textContent,
    activeView: document.querySelector(".view.active")?.id,
    notice: document.getElementById("season-notice")?.hidden ? "" : document.getElementById("season-notice")?.textContent,
    countdown: document.getElementById("countdown-text")?.textContent.replace(/\s+/g, " ").trim().slice(0, 140),
    stored: localStorage.getItem("f1-season"),
    title: document.title,
    racesSub: document.querySelector('[data-i18n="races.subtitle"]')?.textContent
}));

// 1. Démarrage sur la saison par défaut
let { ctx, page } = await newPage();
await page.goto(BASE); await page.waitForTimeout(2500);
let i = await info(page);
ok("1. défaut = 2026", i.season === 2026 && i.select === "2026" && i.cards === 24, JSON.stringify(i));
const completed2026 = await page.evaluate(() => races.filter(r => (r.raceStatus || r.status) === "completed").length);
const standings2026 = await page.evaluate(() => document.querySelector("#view-standings")?.innerText.slice(0, 200));
ok("6a. résultats 2026 chargés", completed2026 > 0, "completed=" + completed2026);

// 4. navigation entre onglets conserve la saison + hash
await page.click("[data-view='standings']");
ok("4a. onglet standings → hash", page.url().endsWith("#standings"), page.url());

// 2. Passage 2026 → 2027
page.errors.length = 0;
await Promise.all([page.waitForNavigation(), page.selectOption("#season-select", "2027")]);
await page.waitForTimeout(2500);
i = await info(page);
ok("2. bascule 2027", i.season === 2027 && i.select === "2027" && i.cards === 24 && /season=2027/.test(page.url()), JSON.stringify(i));
ok("4b. onglet conservé après bascule", i.activeView === "view-standings", i.activeView);
ok("5a. préférence mémorisée", i.stored === "2027");
ok("7a. pas d'erreur JS en 2027", page.errors.length === 0, page.errors.join(" | "));
const s2027 = await page.evaluate(() => ({
    completed: races.filter(r => (r.raceStatus || r.status) === "completed").length,
    anyResult: races.some(r => r.result),
    drivers: drivers.length
}));
ok("7b. aucun résultat fictif 2027", s2027.completed === 0 && !s2027.anyResult, JSON.stringify(s2027));
for (const v of ["races", "standings", "timeline", "sprint", "palmares", "stats", "predictions"]) {
    await page.click(`[data-view='${v}']`); await page.waitForTimeout(400);
}
ok("7c. tous les onglets 2027 sans crash", page.errors.length === 0, page.errors.join(" | "));
await page.click("[data-view='timeline']");
await page.click(".timeline-race-item >> nth=8"); await page.waitForTimeout(300);
await page.click("#modal-content >> text=Programme"); await page.waitForTimeout(300);
const modal = await page.evaluate(() => document.getElementById("modal-content")?.textContent);
ok("7d. fiche GP 2027 (horaires à confirmer)", /Portugal/.test(modal) && /confirmer/i.test(modal), modal.replace(/\s+/g, " ").slice(0, 160));
await page.keyboard.press("Escape");

// 5. Rechargement conserve la préférence (même sans ?season)
await page.goto(BASE); await page.waitForTimeout(1500);
i = await info(page);
ok("5b. rechargement sans param → 2027 mémorisé", i.season === 2027, JSON.stringify({ s: i.season }));

// 3. Retour 2027 → 2026
await Promise.all([page.waitForNavigation(), page.selectOption("#season-select", "2026")]);
await page.waitForTimeout(2500);
i = await info(page);
const completedBack = await page.evaluate(() => races.filter(r => (r.raceStatus || r.status) === "completed").length);
ok("3. retour 2026", i.season === 2026 && i.stored === "2026", JSON.stringify({ s: i.season, st: i.stored }));
ok("6b. résultats 2026 intacts après aller-retour", completedBack === completed2026, `${completedBack} vs ${completed2026}`);
// Bug corrigé : la frise ouvre la bonne fiche (round ≠ index)
await page.click("[data-view='timeline']");
const tl = await page.evaluate(() => {
    const items = [...document.querySelectorAll(".timeline-race-item")];
    const it = items.find(x => /Singapour/.test(x.textContent));
    it.click();
    return document.getElementById("modal-content")?.innerText.slice(0, 200);
});
ok("bug frise round≠index corrigé (Singapour)", /Singapour/.test(tl), tl.replace(/\s+/g, " ").slice(0, 80));
await ctx.close();

// 9. Routes directes / paramètres d'URL
({ ctx, page } = await newPage());
await page.goto(BASE + "?season=2027#timeline"); await page.waitForTimeout(1500);
i = await info(page);
ok("9a. ?season=2027#timeline", i.season === 2027 && i.activeView === "view-timeline", JSON.stringify({ s: i.season, v: i.activeView }));
ok("9b. param URL ne modifie pas la préférence", i.stored === null, String(i.stored));
await page.goto(BASE + "?season=1999#nimporte"); await page.waitForTimeout(1500);
i = await info(page);
ok("9c. saison invalide → défaut, vue invalide ignorée", i.season === 2026 && i.activeView === "view-races" && page.errors.length === 0, JSON.stringify({ s: i.season, v: i.activeView, e: page.errors }));
await page.goto(BASE + "#admin"); await page.waitForTimeout(800);
i = await info(page);
ok("9d. #admin non ouvert sans connexion", i.activeView === "view-races", i.activeView);
await ctx.close();

// 8. Erreur d'API (Jolpica/ESPN/OpenF1 coupés)
({ ctx, page } = await newPage({ blockApis: true }));
await page.goto(BASE + "?season=2027"); await page.waitForTimeout(2500);
for (const v of ["standings", "stats", "races"]) { await page.click(`[data-view='${v}']`); await page.waitForTimeout(300); }
const pageErr = page.errors.filter(e => !e.startsWith("console:"));
i = await info(page);
ok("8. APIs indisponibles : pas d'exception non gérée", pageErr.length === 0 && i.cards === 24, pageErr.join(" | "));
await ctx.close();

// 10. Mobile + clavier
({ ctx, page } = await newPage({ viewport: { width: 375, height: 740 } }));
await page.goto(BASE); await page.waitForTimeout(1500);
const mob = await page.evaluate(() => {
    const r = document.getElementById("season-select").getBoundingClientRect();
    return { visible: r.width > 0 && r.height > 0, inView: r.right <= innerWidth, overflow: document.documentElement.scrollWidth > innerWidth };
});
ok("10a. sélecteur visible sur mobile, pas de scroll horizontal", mob.visible && mob.inView && !mob.overflow, JSON.stringify(mob));
await page.focus("#season-select");
await Promise.all([page.waitForNavigation(), page.keyboard.press("ArrowDown")]);
await page.waitForTimeout(1500);
i = await info(page);
ok("10b. clavier (flèche) change la saison", i.season === 2027, String(i.season));
await ctx.close();

({ ctx, page } = await newPage());
await page.goto(BASE + "?season=2027"); await page.waitForTimeout(2000);
await page.evaluate(() => setLang("en")); await page.waitForTimeout(300);
i = await info(page);
ok("i18n EN 2027", /2027 Season/.test(i.subtitle) && /TBC|confirmed/.test(i.notice + i.countdown), JSON.stringify({ sub: i.subtitle, n: i.notice, c: i.countdown }));
await page.evaluate(() => setLang("fr"));
await ctx.close();

await browser.close();
for (const r of results) console.log(r[0], r[1], r[0] === "FAIL" || process.env.V ? r[2] : "");
const failed = results.filter(r => r[0] === "FAIL").length;
console.log(failed ? `❌ ${failed} échec(s)` : "✅ Tous les scénarios passent");
process.exit(failed ? 1 : 0);
