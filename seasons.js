// ============================================================
// 🗓️ SAISONS — configuration centrale + sélection de la saison active
// ============================================================
// Seul endroit où l'on décide QUELLE saison est affichée. Le reste du code
// lit ACTIVE_SEASON / SeasonManager et ne teste jamais une année en dur.
//
// Ajouter une saison :
//   1. créer data-AAAA.js (registerSeasonData(AAAA, {...})) — voir
//      tools/build-season-data.mjs pour le générer depuis OpenF1 ;
//   2. l'inclure dans index.html (+ sw.js / build-apk.yml) ;
//   3. l'ajouter ci-dessous dans SEASON_CONFIG.seasons.
// ============================================================

const SEASON_CONFIG = {
    // Saison affichée quand le visiteur n'a rien choisi
    defaultSeason: 2026,

    // Saisons proposées dans le sélecteur. enabled:false = masquée et refusée
    // (même via ?season=), sans supprimer ses données.
    seasons: {
        2026: { enabled: true },
        2027: { enabled: true }
    },

    // Bascule automatique FACULTATIVE : à partir de `from`, les visiteurs
    // SANS préférence enregistrée arrivent sur `season`. Désactivée par défaut.
    autoSwitch: {
        enabled: false,
        season: 2027,
        from: "2027-01-01T00:00:00Z"
    },

    // Mémoriser le choix du visiteur entre les visites (localStorage)
    persist: true
};

const SEASON_STORAGE_KEY = "f1-season";

// Registre des données par saison, rempli par data-AAAA.js
const SEASON_DATA = {};

function registerSeasonData(year, data) {
    SEASON_DATA[year] = data;
}

const SeasonManager = (() => {
    const isEnabled = (year) => !!(SEASON_CONFIG.seasons[year] && SEASON_CONFIG.seasons[year].enabled);

    const available = () => Object.keys(SEASON_CONFIG.seasons)
        .map(Number)
        .filter(isEnabled)
        .sort((a, b) => a - b);

    const parse = (value) => {
        const year = parseInt(value, 10);
        return isEnabled(year) ? year : null;
    };

    const readStored = () => {
        if (!SEASON_CONFIG.persist) return null;
        try { return parse(localStorage.getItem(SEASON_STORAGE_KEY)); } catch (e) { return null; }
    };

    const readUrl = () => {
        try { return parse(new URLSearchParams(location.search).get("season")); } catch (e) { return null; }
    };

    const autoSeason = (now) => {
        const a = SEASON_CONFIG.autoSwitch;
        if (!a || !a.enabled || !isEnabled(a.season)) return null;
        const from = Date.parse(a.from);
        return !isNaN(from) && now >= from ? a.season : null;
    };

    // Priorité : ?season= (lien direct) > choix mémorisé > bascule auto > défaut
    function resolve(opts = {}) {
        const now = opts.now !== undefined ? opts.now : Date.now();
        const url    = opts.url    !== undefined ? parse(opts.url)    : readUrl();
        const stored = opts.stored !== undefined ? parse(opts.stored) : readStored();
        return url || stored || autoSeason(now)
            || parse(SEASON_CONFIG.defaultSeason)
            || available()[0];
    }

    const active = resolve();

    // Change de saison : mémorise le choix puis recharge la page avec
    // ?season=AAAA en conservant l'onglet (#vue). Le rechargement garantit
    // qu'aucun cache, écouteur Firebase ou graphique de l'ancienne saison
    // ne survit — les données de deux saisons ne se mélangent jamais.
    function setSeason(value) {
        const year = parse(value);
        if (!year) return false;
        if (SEASON_CONFIG.persist) {
            try { localStorage.setItem(SEASON_STORAGE_KEY, String(year)); } catch (e) {}
        }
        if (year === active) return true;
        const url = new URL(location.href);
        url.searchParams.set("season", String(year));
        location.assign(url.toString());
        return true;
    }

    return {
        active,
        available,
        isEnabled,
        resolve,
        setSeason,
        data: () => SEASON_DATA[active] || null,
        // Nœud Firebase propre à chaque saison (2026 garde son nœud historique)
        firebaseNode: () => "f1_results_" + active,
        predictionsKey: () => "f1-predictions-" + active
    };
})();

const ACTIVE_SEASON = SeasonManager.active;

// Variables injectées dans les traductions ({season}, {raceCount})
function i18nVars() {
    let raceCount = "";
    try { raceCount = races.length; } catch (e) {}
    return { season: ACTIVE_SEASON, raceCount };
}

// Export pour les tests Node (sans effet dans le navigateur)
if (typeof module !== "undefined" && module.exports) {
    module.exports = { SEASON_CONFIG, SEASON_DATA, SeasonManager, registerSeasonData };
}
