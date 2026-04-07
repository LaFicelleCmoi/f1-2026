// ============================================================
// 🌐 Internationalization (i18n) — FR / EN
// ============================================================

const translations = {
    fr: {
        // Header
        "header.title": "F1",
        "header.subtitle": "Saison 2026",
        "header.theme_toggle": "Basculer thème clair/sombre",
        "header.stat_completed": "Disputées",
        "header.stat_upcoming": "À venir",
        "header.stat_total": "Total",
        "header.lang_btn": "EN",
        "header.lang_title": "Switch to English",

        // Page title / meta
        "meta.title": "F1 2026 — Suivi de Saison",
        "meta.description": "Suivez la saison F1 2026 en temps réel : résultats, classements, calendrier, sprints.",

        // Countdown
        "countdown.loading": "Chargement du calendrier...",
        "countdown.next_race": "Prochaine course",
        "countdown.days": "jours",
        "countdown.hours": "heures",
        "countdown.minutes": "minutes",
        "countdown.seconds": "secondes",
        "countdown.live": "🔴 EN DIRECT",
        "countdown.season_over": "Saison terminée",

        // Navigation
        "nav.races": "🏎️ Courses",
        "nav.standings": "🏆 Classements",
        "nav.timeline": "📆 Calendrier",
        "nav.sprint": "⚡ Sprint",
        "nav.palmares": "🏅 Palmarès",
        "nav.predictions": "🔮 Prédictions",
        "nav.admin": "⚙️ Administration",

        // Races view
        "races.title": "Calendrier des Courses",
        "races.subtitle": "Saison F1 2026 — 24 Grands Prix",
        "races.progress_label": "Progression de la saison",
        "races.progress_count": "courses",
        "races.filter_status": "Statut",
        "races.filter_all": "Tous",
        "races.filter_all_f": "Toutes",
        "races.filter_completed": "Terminées",
        "races.filter_upcoming": "À venir",
        "races.filter_next": "Prochaine",
        "races.filter_type": "Type",
        "races.filter_sprint": "⚡ Sprint",
        "races.filter_standard": "Standard",
        "races.filter_continent": "Continent",
        "races.continent_all": "🌍 Tous",
        "races.continent_europe": "🇪🇺 Europe",
        "races.continent_americas": "🌎 Amériques",
        "races.continent_asia": "🌏 Asie-Océanie",
        "races.continent_middle_east": "🕌 Moyen-Orient",
        "races.search_placeholder": "🔍 Rechercher pays, circuit...",
        "races.no_match": "Aucune course ne correspond aux filtres.",
        "races.results_coming": "Résultats course à venir",
        "races.new_circuit": "✨ NOUVEAU",
        "races.round": "Course",

        // Standings
        "standings.title": "Classements",
        "standings.subtitle": "Championnat du Monde F1 2026",
        "standings.drivers": "🧑‍🚀 Pilotes",
        "standings.constructors": "🏭 Constructeurs",
        "standings.pos": "Pos",
        "standings.driver": "Pilote",
        "standings.team": "Écurie",
        "standings.points": "Points",

        // Timeline
        "timeline.title": "Calendrier Complet",
        "timeline.subtitle": "Vue chronologique de la saison 2026",

        // Sprint
        "sprint.title": "⚡ Weekends Sprint",
        "sprint.subtitle_count": "Sprints disputés",

        // Palmarès
        "palmares.title": "🏅 Palmarès Saison 2026",
        "palmares.subtitle": "Victoires par équipe et pilotes",
        "palmares.top_teams": "🏭 Meilleures Écuries",
        "palmares.top_drivers": "🧑‍🚀 Meilleurs Pilotes",
        "palmares.wins": "victoires",
        "palmares.no_wins_yet": "Aucune victoire enregistrée pour le moment.",

        // Predictions
        "predictions.title": "🔮 Mes Prédictions",
        "predictions.subtitle": "Pronostiquez le podium de chaque course et mesurez votre score",
        "predictions.score_total": "Score total",
        "predictions.points": "points",
        "predictions.pts": "pts",
        "predictions.completed_races": "courses jouées",
        "predictions.avg": "moyenne",
        "predictions.upcoming": "📅 Courses à venir",
        "predictions.completed": "✅ Courses disputées",
        "predictions.pick_p1": "Sélectionnez P1",
        "predictions.pick_p2": "Sélectionnez P2",
        "predictions.pick_p3": "Sélectionnez P3",
        "predictions.save": "Enregistrer",
        "predictions.edit": "Modifier",
        "predictions.saved": "✅ Enregistré",
        "predictions.no_duplicate": "Vous ne pouvez pas choisir le même pilote deux fois.",
        "predictions.fill_all": "Veuillez sélectionner les 3 pilotes.",
        "predictions.my_prediction": "Ma prédiction",
        "predictions.actual_result": "Résultat réel",
        "predictions.your_score": "Ton score",
        "predictions.no_prediction": "Aucune prédiction enregistrée.",
        "predictions.empty_state": "Aucune course ne nécessite de prédiction pour le moment.",

        // Admin
        "admin.title": "Administration",
        "admin.subtitle": "Gestion des résultats de la saison",
        "admin.select_race": "Sélectionnez une course",
        "admin.click_race": "Cliquez sur une course à gauche pour l'éditer.",
        "admin.sprint_status": "⚡ Statut Sprint",
        "admin.race_status": "🏁 Statut Course",
        "admin.upcoming": "À venir",
        "admin.next_m": "Prochain",
        "admin.next_f": "Prochaine",
        "admin.completed_m": "✓ Terminé",
        "admin.completed_f": "✓ Terminée",
        "admin.cancelled_m": "✕ Annulé",
        "admin.cancelled_f": "✕ Annulée",
        "admin.sprint_results": "⚡ Résultats Sprint",
        "admin.add_row_sprint": "+ Ajouter une ligne au Sprint",
        "admin.sprint_quali": "⚡ Qualifications Sprint",
        "admin.anti_spoil": "(anti-spoil)",
        "admin.anti_spoil_info": "Les résultats seront cachés derrière un bouton anti-spoil dans la modal publique.",
        "admin.add_row_sprint_quali": "+ Ajouter une ligne (Quali Sprint)",
        "admin.race_quali": "🔵 Qualifications Course",
        "admin.add_row_race_quali": "+ Ajouter une ligne (Quali Course)",
        "admin.race_results": "🏆 Résultats de la Course",
        "admin.add_row_race": "+ Ajouter une ligne à la Course",
        "admin.save": "💾 Sauvegarder",
        "admin.save_schedule": "💾 Sauvegarder les horaires",
        "admin.auto_import": "🤖 Import auto (API)",
        "admin.clear_all": "🗑️ Tout effacer",
        "admin.login_title": "Administration",
        "admin.access_reserved": "Accès réservé",
        "admin.email": "Email",
        "admin.password": "Mot de passe",
        "admin.connect": "Connexion",
        "admin.admin_btn": "Admin",

        // Modal
        "modal.tab_info": "Programme",
        "modal.tab_circuit": "Circuit",
        "modal.tab_fp1": "EL1",
        "modal.tab_fp2": "EL2",
        "modal.tab_fp3": "EL3",
        "modal.tab_sq": "Qualifs Sprint",
        "modal.tab_sr": "Sprint",
        "modal.tab_rq": "Qualifications",
        "modal.tab_rc": "Course",
        "modal.schedule_title": "📋 Programme",
        "modal.schedule_edit_hint": "— cliquez sur une heure pour modifier",
        "modal.time": "Temps",
        "modal.gap": "Écart",
        "modal.pos": "Pos",
        "modal.driver": "Pilote",
        "modal.team": "Écurie",
        "modal.points": "Points",
        "modal.points_abbr": "Pts",
        "modal.results_unavailable": "Les résultats seront disponibles après la course.",
        "modal.circuit_layout": "🗺️ Tracé du circuit",
        "modal.circuit_poster": "🏁 Affiche du Grand Prix",
        "modal.circuit_preview": "📸 Aperçu",
        "modal.circuit_unavailable": "Images non disponibles pour ce circuit.",
        "modal.sprint_quali": "Qualifications Sprint",
        "modal.sprint_results": "Résultats Sprint",
        "modal.race_quali": "Qualifications Course",
        "modal.race_results": "Résultats Course",
        "modal.sprint_badge": "⚡ Sprint",
        "modal.new_badge": "✨ Nouveau",
        "modal.admin_badge": "⚙️ Admin",

        // Anti-spoil
        "spoil.locked_text": "Résultats masqués pour éviter le spoil",
        "spoil.reveal": "👁️ Révéler les résultats",
        "spoil.hide": "🙈 Masquer les résultats",
        "spoil.card_locked": "Résultats masqués",
        "spoil.card_reveal": "👁️ Voir",
        "spoil.card_hide": "🙈 Masquer",
        "spoil.anti_spoil": "anti-spoil",

        // Status badges
        "status.completed_f": "Terminée",
        "status.completed_m": "Terminé",
        "status.upcoming": "À venir",
        "status.next_f": "Prochaine",
        "status.next_m": "Prochain",
        "status.cancelled_f": "Annulée",
        "status.cancelled_m": "Annulé",

        // Footer
        "footer.brand": "F1 2026 Race Hub",
        "footer.disclaimer": "Ce site est un projet indépendant réalisé par un fan et n'est en aucun cas affilié, approuvé ou sponsorisé par Formula 1™, Formula One Group, Liberty Media, la FIA ou toute entité associée. Les marques « F1 » et « Formula 1 » sont utilisées uniquement à des fins descriptives et éditoriales. Les données présentées (calendrier, classements, résultats, prédictions, etc.) sont non officielles et peuvent ne pas refléter les mises à jour ou l'exactitude en temps réel.",
        "footer.apis": "Données fournies par Jolpica (Ergast), OpenF1 & TheSportsDB",
        "footer.legal_link": "Mentions légales",
        "footer.contact_link": "Contact",

        // Race card chips
        "card.winner": "🏆",
        "card.pole": "⏱️",

        // Messages
        "msg.no_data": "Aucune donnée disponible.",
        "msg.loading": "Chargement...",
        "msg.saved": "✅ Sauvegardé !",
        "msg.error": "Une erreur est survenue.",

        // Legal page
        "legal.title": "⚖️ Mentions légales & Avertissement",
        "legal.last_updated": "Dernière mise à jour : avril 2026",
        "legal.toc_title": "Sommaire",
        "legal.back": "← Retour à F1 2026 Race Hub",
        "legal.subtitle": "Mentions légales",
    },
    en: {
        // Header
        "header.title": "F1",
        "header.subtitle": "2026 Season",
        "header.theme_toggle": "Toggle light/dark theme",
        "header.stat_completed": "Completed",
        "header.stat_upcoming": "Upcoming",
        "header.stat_total": "Total",
        "header.lang_btn": "FR",
        "header.lang_title": "Passer en français",

        // Page title / meta
        "meta.title": "F1 2026 — Season Tracker",
        "meta.description": "Follow the F1 2026 season in real time: results, standings, calendar, sprints.",

        // Countdown
        "countdown.loading": "Loading calendar...",
        "countdown.next_race": "Next race",
        "countdown.days": "days",
        "countdown.hours": "hours",
        "countdown.minutes": "minutes",
        "countdown.seconds": "seconds",
        "countdown.live": "🔴 LIVE",
        "countdown.season_over": "Season over",

        // Navigation
        "nav.races": "🏎️ Races",
        "nav.standings": "🏆 Standings",
        "nav.timeline": "📆 Calendar",
        "nav.sprint": "⚡ Sprint",
        "nav.palmares": "🏅 Honors",
        "nav.predictions": "🔮 Predictions",
        "nav.admin": "⚙️ Admin",

        // Races view
        "races.title": "Race Calendar",
        "races.subtitle": "F1 2026 Season — 24 Grands Prix",
        "races.progress_label": "Season progress",
        "races.progress_count": "races",
        "races.filter_status": "Status",
        "races.filter_all": "All",
        "races.filter_all_f": "All",
        "races.filter_completed": "Completed",
        "races.filter_upcoming": "Upcoming",
        "races.filter_next": "Next",
        "races.filter_type": "Type",
        "races.filter_sprint": "⚡ Sprint",
        "races.filter_standard": "Standard",
        "races.filter_continent": "Continent",
        "races.continent_all": "🌍 All",
        "races.continent_europe": "🇪🇺 Europe",
        "races.continent_americas": "🌎 Americas",
        "races.continent_asia": "🌏 Asia-Oceania",
        "races.continent_middle_east": "🕌 Middle East",
        "races.search_placeholder": "🔍 Search country, circuit...",
        "races.no_match": "No race matches the filters.",
        "races.results_coming": "Race results coming soon",
        "races.new_circuit": "✨ NEW",
        "races.round": "Round",

        // Standings
        "standings.title": "Standings",
        "standings.subtitle": "F1 2026 World Championship",
        "standings.drivers": "🧑‍🚀 Drivers",
        "standings.constructors": "🏭 Constructors",
        "standings.pos": "Pos",
        "standings.driver": "Driver",
        "standings.team": "Team",
        "standings.points": "Points",

        // Timeline
        "timeline.title": "Full Calendar",
        "timeline.subtitle": "Chronological view of the 2026 season",

        // Sprint
        "sprint.title": "⚡ Sprint Weekends",
        "sprint.subtitle_count": "Sprints completed",

        // Palmarès
        "palmares.title": "🏅 2026 Season Honors",
        "palmares.subtitle": "Wins by team and driver",
        "palmares.top_teams": "🏭 Top Teams",
        "palmares.top_drivers": "🧑‍🚀 Top Drivers",
        "palmares.wins": "wins",
        "palmares.no_wins_yet": "No wins recorded yet.",

        // Predictions
        "predictions.title": "🔮 My Predictions",
        "predictions.subtitle": "Predict the podium for each race and track your score",
        "predictions.score_total": "Total score",
        "predictions.points": "points",
        "predictions.pts": "pts",
        "predictions.completed_races": "races played",
        "predictions.avg": "average",
        "predictions.upcoming": "📅 Upcoming races",
        "predictions.completed": "✅ Completed races",
        "predictions.pick_p1": "Select P1",
        "predictions.pick_p2": "Select P2",
        "predictions.pick_p3": "Select P3",
        "predictions.save": "Save",
        "predictions.edit": "Edit",
        "predictions.saved": "✅ Saved",
        "predictions.no_duplicate": "You can't pick the same driver twice.",
        "predictions.fill_all": "Please select all 3 drivers.",
        "predictions.my_prediction": "My prediction",
        "predictions.actual_result": "Actual result",
        "predictions.your_score": "Your score",
        "predictions.no_prediction": "No prediction saved.",
        "predictions.empty_state": "No race requires a prediction at the moment.",

        // Admin
        "admin.title": "Administration",
        "admin.subtitle": "Manage season results",
        "admin.select_race": "Select a race",
        "admin.click_race": "Click on a race on the left to edit it.",
        "admin.sprint_status": "⚡ Sprint Status",
        "admin.race_status": "🏁 Race Status",
        "admin.upcoming": "Upcoming",
        "admin.next_m": "Next",
        "admin.next_f": "Next",
        "admin.completed_m": "✓ Completed",
        "admin.completed_f": "✓ Completed",
        "admin.cancelled_m": "✕ Cancelled",
        "admin.cancelled_f": "✕ Cancelled",
        "admin.sprint_results": "⚡ Sprint Results",
        "admin.add_row_sprint": "+ Add Sprint row",
        "admin.sprint_quali": "⚡ Sprint Qualifying",
        "admin.anti_spoil": "(anti-spoiler)",
        "admin.anti_spoil_info": "Results will be hidden behind an anti-spoiler button in the public modal.",
        "admin.add_row_sprint_quali": "+ Add row (Sprint Quali)",
        "admin.race_quali": "🔵 Race Qualifying",
        "admin.add_row_race_quali": "+ Add row (Race Quali)",
        "admin.race_results": "🏆 Race Results",
        "admin.add_row_race": "+ Add Race row",
        "admin.save": "💾 Save",
        "admin.save_schedule": "💾 Save schedule",
        "admin.auto_import": "🤖 Auto import (API)",
        "admin.clear_all": "🗑️ Clear all",
        "admin.login_title": "Administration",
        "admin.access_reserved": "Restricted access",
        "admin.email": "Email",
        "admin.password": "Password",
        "admin.connect": "Sign in",
        "admin.admin_btn": "Admin",

        // Modal
        "modal.tab_info": "Schedule",
        "modal.tab_circuit": "Circuit",
        "modal.tab_fp1": "FP1",
        "modal.tab_fp2": "FP2",
        "modal.tab_fp3": "FP3",
        "modal.tab_sq": "Sprint Quali",
        "modal.tab_sr": "Sprint",
        "modal.tab_rq": "Qualifying",
        "modal.tab_rc": "Race",
        "modal.schedule_title": "📋 Schedule",
        "modal.schedule_edit_hint": "— click on a time to edit",
        "modal.time": "Time",
        "modal.gap": "Gap",
        "modal.pos": "Pos",
        "modal.driver": "Driver",
        "modal.team": "Team",
        "modal.points": "Points",
        "modal.points_abbr": "Pts",
        "modal.results_unavailable": "Results will be available after the race.",
        "modal.circuit_layout": "🗺️ Circuit layout",
        "modal.circuit_poster": "🏁 Grand Prix poster",
        "modal.circuit_preview": "📸 Preview",
        "modal.circuit_unavailable": "Images not available for this circuit.",
        "modal.sprint_quali": "Sprint Qualifying",
        "modal.sprint_results": "Sprint Results",
        "modal.race_quali": "Race Qualifying",
        "modal.race_results": "Race Results",
        "modal.sprint_badge": "⚡ Sprint",
        "modal.new_badge": "✨ New",
        "modal.admin_badge": "⚙️ Admin",

        // Anti-spoil
        "spoil.locked_text": "Results hidden to avoid spoilers",
        "spoil.reveal": "👁️ Reveal results",
        "spoil.hide": "🙈 Hide results",
        "spoil.card_locked": "Results hidden",
        "spoil.card_reveal": "👁️ Show",
        "spoil.card_hide": "🙈 Hide",
        "spoil.anti_spoil": "anti-spoiler",

        // Status badges
        "status.completed_f": "Completed",
        "status.completed_m": "Completed",
        "status.upcoming": "Upcoming",
        "status.next_f": "Next",
        "status.next_m": "Next",
        "status.cancelled_f": "Cancelled",
        "status.cancelled_m": "Cancelled",

        // Footer
        "footer.brand": "F1 2026 Race Hub",
        "footer.disclaimer": "This site is an independent, fan-made project and is not affiliated with, endorsed by, or sponsored by Formula 1™, Formula One Group, Liberty Media, the FIA, or any related entities. All trademarks such as \"F1\" and \"Formula 1\" are used solely for descriptive and editorial purposes. Data presented (calendar, standings, results, predictions, etc.) is unofficial and may not reflect real-time updates or accuracy.",
        "footer.apis": "Data provided by Jolpica (Ergast), OpenF1 & TheSportsDB",
        "footer.legal_link": "Legal Notice",
        "footer.contact_link": "Contact",

        // Race card chips
        "card.winner": "🏆",
        "card.pole": "⏱️",

        // Messages
        "msg.no_data": "No data available.",
        "msg.loading": "Loading...",
        "msg.saved": "✅ Saved!",
        "msg.error": "An error occurred.",

        // Legal page
        "legal.title": "⚖️ Legal Notice & Disclaimer",
        "legal.last_updated": "Last updated: April 2026",
        "legal.toc_title": "Contents",
        "legal.back": "← Back to F1 2026 Race Hub",
        "legal.subtitle": "Legal Notice",
    }
};

// Current language state
let currentLang = localStorage.getItem("f1-lang") || "fr";

// Translate a key
function t(key) {
    return (translations[currentLang] && translations[currentLang][key]) ||
           (translations.fr && translations.fr[key]) ||
           key;
}

// Apply translations to all elements with data-i18n attributes
function applyI18n() {
    // Text content
    document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.getAttribute("data-i18n");
        el.textContent = t(key);
    });
    // Placeholder
    document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
        const key = el.getAttribute("data-i18n-placeholder");
        el.placeholder = t(key);
    });
    // Title attribute
    document.querySelectorAll("[data-i18n-title]").forEach(el => {
        const key = el.getAttribute("data-i18n-title");
        el.title = t(key);
    });
    // HTML content (for strings containing inline markup)
    document.querySelectorAll("[data-i18n-html]").forEach(el => {
        const key = el.getAttribute("data-i18n-html");
        el.innerHTML = t(key);
    });
    // Update <html lang>
    document.documentElement.setAttribute("lang", currentLang);
    // Update page title
    const titleKey = document.querySelector("title")?.getAttribute("data-i18n");
    if (titleKey) document.title = t(titleKey);
    // Update language toggle button label
    const langBtn = document.getElementById("lang-toggle");
    if (langBtn) {
        langBtn.textContent = t("header.lang_btn");
        langBtn.title = t("header.lang_title");
    }
}

// Switch language and re-apply
function setLang(lang) {
    if (lang !== "fr" && lang !== "en") return;
    currentLang = lang;
    localStorage.setItem("f1-lang", lang);
    applyI18n();
    // Re-render dynamic app content if app functions are available
    if (typeof renderAllRaces === "function") renderAllRaces();
    if (typeof renderStandings === "function") renderStandings();
    if (typeof renderTimeline === "function") renderTimeline();
    if (typeof renderSprintView === "function") renderSprintView();
    if (typeof renderPalmares === "function") renderPalmares();
    if (typeof renderPredictions === "function") renderPredictions();
    if (typeof updateCountdown === "function") updateCountdown();
    if (typeof renderAdminRaceList === "function") renderAdminRaceList();
}

function toggleLang() {
    setLang(currentLang === "fr" ? "en" : "fr");
}

// Apply on load
document.addEventListener("DOMContentLoaded", applyI18n);
