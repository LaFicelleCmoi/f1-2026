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
        "nav.legends": "👑 Légendes",
        "nav.stats": "📊 Statistiques",
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

        // Stats
        "stats.title": "📊 Statistiques & Graphiques",
        "stats.subtitle": "Évolution de la saison et performance des pilotes",
        "stats.empty": "Les graphiques apparaîtront après la première course.",
        "stats.drivers_evolution": "📈 Évolution — Pilotes",
        "stats.constructors_evolution": "📈 Évolution — Constructeurs",
        "stats.driver_radar": "🎯 Radar pilote",
        "stats.top10": "Top 10",
        "stats.all": "Tous",
        "stats.radar_wins": "Victoires",
        "stats.radar_podiums": "Podiums",
        "stats.radar_poles": "Poles",
        "stats.radar_top5": "Top 5",
        "stats.radar_top10": "Top 10",
        "stats.radar_sprint_wins": "Victoires Sprint",

        // Profile (pilote / écurie)
        "profile.best_finish": "Meilleur rang",
        "profile.starts": "Départs",
        "profile.vs_teammate": "Face au coéquipier",
        "profile.history": "Historique course par course",
        "profile.lineup": "Line-up",
        "profile.gp": "Grand Prix",
        "profile.quali_short": "Q",
        "profile.race_short": "C",
        "profile.no_history": "Aucune donnée de course pour le moment.",

        // Légendes
        "legends.title": "👑 Légendes de la F1",
        "legends.subtitle": "Pilotes mythiques — carrière complète via l'API",
        "legends.full_stats": "Stats complètes",
        "legends.loading": "Chargement de la carrière...",
        "legends.error": "Impossible de charger les données. Réessayez plus tard.",
        "legends.titles": "Titres",
        "legends.starts": "Courses",
        "legends.top_seasons": "Meilleures saisons",
        "legends.all_seasons": "Toutes les saisons",
        "legends.season": "Saison",
        "legends.born": "né le",
        "legends.source": "Données :",

        // Legal page
        "legal.page_title": "Mentions légales — F1 2026 Race Hub",
        "legal.title": "⚖️ Mentions légales & Avertissement",
        "legal.last_updated": "Dernière mise à jour : avril 2026",
        "legal.toc_title": "Sommaire",
        "legal.back": "← Retour à F1 2026 Race Hub",
        "legal.subtitle": "Mentions légales",
        "legal.toc_1": "1. Nature du projet",
        "legal.toc_2": "2. Absence d'affiliation",
        "legal.toc_3": "3. Marques & propriété intellectuelle",
        "legal.toc_4": "4. Usage nominatif loyal",
        "legal.toc_5": "5. Sources de données & licences",
        "legal.toc_6": "6. Images de tiers",
        "legal.toc_7": "7. Absence de garantie / limitation de responsabilité",
        "legal.toc_8": "8. Statut non commercial",
        "legal.toc_9": "9. Vie privée & collecte de données",
        "legal.toc_10": "10. Avis de retrait DMCA",
        "legal.toc_11": "11. Modifications",
        "legal.toc_12": "12. Droit applicable",
        "legal.toc_13": "13. Contact",

        "legal.s1_title": "1. Nature du projet",
        "legal.s1_p1": "F1 2026 Race Hub (ci-après « le Site ») est un projet personnel, indépendant, non commercial et créé par un fan, à des fins exclusivement éducatives, informatives et récréatives. Le Site existe uniquement pour permettre aux passionnés de Formule 1 de consulter des informations non officielles relatives à la saison 2026.",
        "legal.s1_p2": "Le Site ne vend aucun produit, ne propose aucun service payant, n'affiche aucune publicité et ne génère aucun revenu, direct ou indirect.",

        "legal.s2_title": "2. Absence d'affiliation",
        "legal.s2_p1": "<strong>Le Site N'EST PAS affilié, approuvé, sponsorisé, autorisé ou de quelque manière que ce soit officiellement lié à :</strong>",
        "legal.s2_li5": "Fédération Internationale de l'Automobile (FIA)",
        "legal.s2_li6": "Toute écurie, pilote, circuit, diffuseur, sponsor ou partenaire de Formule 1",
        "legal.s2_li7": "Toute filiale, société affiliée, société mère ou entité liée à ce qui précède",
        "legal.s2_p2": "Le site officiel de la Formule 1 est <strong>www.formula1.com</strong>. Le site officiel de la FIA est <strong>www.fia.com</strong>. Toute référence à ces entités sur ce Site est faite uniquement à des fins d'identification et de description.",

        "legal.s3_title": "3. Marques & propriété intellectuelle",
        "legal.s3_p1": "Toutes les marques, marques de service, dénominations commerciales, logos et signes distinctifs mentionnés sur le Site — y compris, sans s'y limiter, « F1® », « FORMULA 1® », « FORMULA ONE® », « GRAND PRIX® », « FIA® », le logo F1, les noms d'écuries, les logos d'écuries, les noms de pilotes, les noms de circuits et les noms d'événements — sont la propriété de leurs détenteurs respectifs.",
        "legal.s3_p2": "Formula 1, F1, FORMULA ONE, GRAND PRIX, PADDOCK CLUB et les marques associées sont des marques déposées de Formula One Licensing B.V. FIA, Formula 1 World Championship et les marques associées sont des marques déposées de la Fédération Internationale de l'Automobile.",
        "legal.s3_p3": "Les noms d'écuries (Ferrari, Mercedes, McLaren, Red Bull, Williams, Aston Martin, Alpine, Haas, Audi, Cadillac, Racing Bulls, Kick Sauber, etc.) et leurs logos sont la propriété de leurs équipes respectives et de leurs sociétés mères.",
        "legal.s3_p4": "Aucune revendication de propriété sur ces marques n'est faite par le Site ou son auteur.",

        "legal.s4_title": "4. Usage nominatif loyal",
        "legal.s4_p1": "Les références aux marques sur le Site sont faites en application de la doctrine de l'<strong>usage nominatif loyal</strong>, qui permet d'utiliser une marque pour identifier les biens, services, équipes, pilotes ou événements de son titulaire, à condition que :",
        "legal.s4_li1": "Le produit, service ou entité concerné ne puisse être facilement identifié sans utiliser la marque ;",
        "legal.s4_li2": "Seule la portion de la marque raisonnablement nécessaire à son identification soit utilisée ;",
        "legal.s4_li3": "Aucune suggestion de parrainage ou d'approbation par le titulaire de la marque ne soit faite.",
        "legal.s4_p2": "Le Site n'utilise aucune marque d'une manière susceptible de créer une confusion quant à la source, au parrainage, à l'affiliation ou à l'approbation.",

        "legal.s5_title": "5. Sources de données & licences",
        "legal.s5_p1": "Les données sportives affichées sur le Site (calendrier des courses, résultats, classements, séances d'essais, etc.) sont obtenues à partir d'API tierces accessibles publiquement :",
        "legal.s5_li1": "<strong>Jolpica F1 API</strong> (successeur de l'API Ergast Developer) — données initialement publiées sous licence Creative Commons Attribution 4.0 (CC BY 4.0). Source : <em>api.jolpi.ca/ergast</em>",
        "legal.s5_li2": "<strong>OpenF1 API</strong> — données F1 temps réel et historiques en open source. Source : <em>api.openf1.org</em>",
        "legal.s5_li3": "<strong>TheSportsDB</strong> — base de données sportives ouverte maintenue par la communauté (offre gratuite, clé d'API « 3 »). Source : <em>www.thesportsdb.com</em>",
        "legal.s5_p2": "Toutes les données sont récupérées dans le respect des conditions d'utilisation de chaque fournisseur. Le Site se contente d'afficher ces données publiques et n'ajoute aucune information sportive propriétaire.",
        "legal.s5_p3": "L'exactitude, l'exhaustivité et l'actualité des données ne sont <strong>pas garanties</strong>. Le Site ne propose aucune diffusion en direct, aucun chronométrage live, aucun contenu audiovisuel et aucune information exclusive appartenant à Formula One Group ou à ses licenciés.",

        "legal.s6_title": "6. Images de tiers",
        "legal.s6_p1": "Les plans de circuits, affiches d'événements et miniatures affichés sur le Site sont récupérés dynamiquement via l'API publique de TheSportsDB. Ces images sont contribuées par la communauté et hébergées par TheSportsDB. Le Site ne stocke, ne reproduit et ne redistribue pas ces images — il les intègre simplement par lien hypertexte.",
        "legal.s6_p2": "Les logos d'écuries affichés sur le Site sont soit (a) récupérés via des API publiques, soit (b) des représentations graphiques simplifiées créées à des fins d'identification dans le cadre de l'usage nominatif loyal.",
        "legal.s6_p3": "Si vous êtes le titulaire des droits sur une image et souhaitez qu'elle soit retirée, veuillez consulter la section 10 (Avis de retrait DMCA) ci-dessous.",

        "legal.s7_title": "7. Absence de garantie / limitation de responsabilité",
        "legal.s7_p1": "LE SITE EST FOURNI « EN L'ÉTAT » ET « TEL QUE DISPONIBLE », SANS GARANTIE D'AUCUNE SORTE, EXPRESSE OU IMPLICITE, NOTAMMENT SANS GARANTIE DE QUALITÉ MARCHANDE, D'ADÉQUATION À UN USAGE PARTICULIER, D'EXACTITUDE, D'EXHAUSTIVITÉ, DE FIABILITÉ OU D'ABSENCE DE CONTREFAÇON.",
        "legal.s7_p2": "L'auteur ne déclare pas que les informations du Site sont exactes, à jour, complètes ou exemptes d'erreurs. Les utilisateurs s'appuient sur ces informations à leurs propres risques.",
        "legal.s7_p3": "DANS LA MESURE MAXIMALE PERMISE PAR LA LOI APPLICABLE, L'AUTEUR NE POURRA EN AUCUN CAS ÊTRE TENU RESPONSABLE DE TOUT DOMMAGE DIRECT, INDIRECT, ACCESSOIRE, SPÉCIAL, CONSÉCUTIF OU PUNITIF DÉCOULANT DE OU LIÉ À L'UTILISATION DU SITE OU À L'IMPOSSIBILITÉ DE L'UTILISER.",

        "legal.s8_title": "8. Statut non commercial",
        "legal.s8_p1": "Le Site est strictement non commercial. Il :",
        "legal.s8_li1": "Ne facture aucun abonnement, frais ou paiement de quelque nature que ce soit ;",
        "legal.s8_li2": "N'affiche aucune publicité, contenu sponsorisé ou lien d'affiliation ;",
        "legal.s8_li3": "Ne collecte aucun don ;",
        "legal.s8_li4": "Ne vend aucun produit dérivé ni service ;",
        "legal.s8_li5": "Ne génère aucun revenu, direct ou indirect.",
        "legal.s8_p2": "Le Site est hébergé sur une infrastructure gratuite (GitHub Pages / Netlify) à des fins de démonstration et d'apprentissage.",

        "legal.s9_title": "9. Vie privée & collecte de données",
        "legal.s9_p1": "Le Site ne collecte <strong>aucune donnée personnelle</strong> auprès des visiteurs. Il n'y a aucun suivi analytique, aucun cookie publicitaire, aucun profilage utilisateur et aucune transmission d'informations personnelles à des tiers.",
        "legal.s9_p2": "Le Site utilise les mécanismes de stockage du navigateur suivants à des fins purement fonctionnelles :",
        "legal.s9_li1": "<strong>localStorage</strong> : enregistre la préférence de thème (sombre/clair) et les pronostics saisis par l'utilisateur (stockés localement sur l'appareil de l'utilisateur uniquement) ;",
        "legal.s9_li2": "<strong>sessionStorage</strong> : enregistre l'état temporaire de l'interface (préférences anti-spoiler, cache d'images d'API) pour la durée de la session de navigation.",
        "legal.s9_p3": "Une zone d'administration optionnelle utilise Firebase Authentication (Google). Elle est réservée au propriétaire du Site et n'affecte pas les visiteurs réguliers. Les données affichées publiquement (horaires, résultats) sont stockées dans Firebase Realtime Database et sont en lecture seule pour les visiteurs.",

        "legal.s10_title": "10. Avis de retrait DMCA",
        "legal.s10_p1": "Si vous êtes titulaire de droits (ou son représentant autorisé) et estimez qu'un contenu affiché sur le Site porte atteinte à vos droits de propriété intellectuelle, marques ou autres droits, <strong>veuillez contacter immédiatement l'auteur</strong>. L'auteur s'engage à retirer rapidement tout contenu sur réception d'une notification de bonne foi.",
        "legal.s10_p2": "Pour déposer un avis de retrait, veuillez envoyer un e-mail à l'adresse de contact ci-dessous (Section 13) contenant :",
        "legal.s10_li1": "Vos nom complet et coordonnées ;",
        "legal.s10_li2": "Une description de l'œuvre protégée ou de la marque dont la contrefaçon est alléguée ;",
        "legal.s10_li3": "L'URL exacte où le contenu prétendument contrefaisant se trouve ;",
        "legal.s10_li4": "Une déclaration selon laquelle vous estimez de bonne foi que l'usage n'est pas autorisé ;",
        "legal.s10_li5": "Une déclaration, sous peine de parjure, que les informations sont exactes et que vous êtes le titulaire des droits ou habilité à agir en son nom ;",
        "legal.s10_li6": "Votre signature physique ou électronique.",
        "legal.s10_p3": "<strong>Engagement : l'auteur répondra et donnera suite à toute demande de retrait valide dans un délai de 48 heures à compter de la réception.</strong>",

        "legal.s11_title": "11. Modifications",
        "legal.s11_p1": "L'auteur se réserve le droit de modifier, suspendre ou interrompre le Site à tout moment, sans préavis et sans responsabilité envers aucun utilisateur. Les présentes mentions légales peuvent être mises à jour à tout moment ; la poursuite de l'utilisation du Site après toute modification constitue l'acceptation des mentions révisées.",

        "legal.s12_title": "12. Droit applicable",
        "legal.s12_p1": "Les présentes mentions légales sont régies et interprétées conformément aux lois de la République française. Tout litige découlant de l'utilisation du Site sera soumis à la compétence exclusive des tribunaux français compétents.",

        "legal.s13_title": "13. Contact",
        "legal.s13_p1": "Pour toute question juridique, demande de retrait ou question générale concernant le Site, veuillez contacter :",
        "legal.s13_p2": "<strong>E-mail :</strong> <a href=\"mailto:fifaseize9@gmail.com?subject=F1%202026%20Race%20Hub%20-%20Legal%20Inquiry\">fifaseize9@gmail.com</a>",
        "legal.s13_p3": "Veuillez utiliser l'objet « F1 2026 Race Hub — Legal Inquiry » pour un traitement plus rapide.",
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
        "nav.legends": "👑 Legends",
        "nav.stats": "📊 Stats",
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

        // Stats
        "stats.title": "📊 Stats & Charts",
        "stats.subtitle": "Season evolution and driver performance",
        "stats.empty": "Charts will appear after the first race.",
        "stats.drivers_evolution": "📈 Evolution — Drivers",
        "stats.constructors_evolution": "📈 Evolution — Constructors",
        "stats.driver_radar": "🎯 Driver radar",
        "stats.top10": "Top 10",
        "stats.all": "All",
        "stats.radar_wins": "Wins",
        "stats.radar_podiums": "Podiums",
        "stats.radar_poles": "Poles",
        "stats.radar_top5": "Top 5",
        "stats.radar_top10": "Top 10",
        "stats.radar_sprint_wins": "Sprint Wins",

        // Profile (driver / team)
        "profile.best_finish": "Best finish",
        "profile.starts": "Starts",
        "profile.vs_teammate": "Teammate battle",
        "profile.history": "Race by race history",
        "profile.lineup": "Line-up",
        "profile.gp": "Grand Prix",
        "profile.quali_short": "Q",
        "profile.race_short": "R",
        "profile.no_history": "No race data yet.",

        // Legends
        "legends.title": "👑 F1 Legends",
        "legends.subtitle": "Iconic drivers — full career via the API",
        "legends.full_stats": "Full stats",
        "legends.loading": "Loading career data...",
        "legends.error": "Unable to load data. Try again later.",
        "legends.titles": "Titles",
        "legends.starts": "Races",
        "legends.top_seasons": "Best seasons",
        "legends.all_seasons": "All seasons",
        "legends.season": "Season",
        "legends.born": "born",
        "legends.source": "Data:",

        // Legal page
        "legal.page_title": "Legal Notice — F1 2026 Race Hub",
        "legal.title": "⚖️ Legal Notice & Disclaimer",
        "legal.last_updated": "Last updated: April 2026",
        "legal.toc_title": "Contents",
        "legal.back": "← Back to F1 2026 Race Hub",
        "legal.subtitle": "Legal Notice",
        "legal.toc_1": "1. Nature of the Project",
        "legal.toc_2": "2. Disclaimer of Affiliation",
        "legal.toc_3": "3. Trademarks & Intellectual Property",
        "legal.toc_4": "4. Nominative Fair Use",
        "legal.toc_5": "5. Data Sources & Licenses",
        "legal.toc_6": "6. Third-Party Images",
        "legal.toc_7": "7. No Warranty / Limitation of Liability",
        "legal.toc_8": "8. Non-Commercial Status",
        "legal.toc_9": "9. Privacy & Data Collection",
        "legal.toc_10": "10. DMCA / Takedown Notice",
        "legal.toc_11": "11. Modifications",
        "legal.toc_12": "12. Governing Law",
        "legal.toc_13": "13. Contact",

        "legal.s1_title": "1. Nature of the Project",
        "legal.s1_p1": "F1 2026 Race Hub (hereinafter \"the Site\") is a personal, independent, non-commercial, fan-made project created by a private individual for educational, informational, and recreational purposes only. The Site exists solely to allow fans of Formula 1 motor racing to consult unofficial information related to the 2026 season.",
        "legal.s1_p2": "The Site does not sell any product, does not offer any paid service, does not display any advertising, and does not generate any revenue, directly or indirectly.",

        "legal.s2_title": "2. Disclaimer of Affiliation",
        "legal.s2_p1": "<strong>The Site is NOT affiliated with, endorsed by, sponsored by, authorized by, or in any way officially connected to:</strong>",
        "legal.s2_li5": "Fédération Internationale de l'Automobile (FIA)",
        "legal.s2_li6": "Any Formula 1 team, driver, circuit, broadcaster, sponsor, or partner",
        "legal.s2_li7": "Any subsidiary, affiliate, parent company, or related entity of the above",
        "legal.s2_p2": "The official Formula 1 website is <strong>www.formula1.com</strong>. The official FIA website is <strong>www.fia.com</strong>. Any reference to these entities on this Site is made solely for identification and descriptive purposes.",

        "legal.s3_title": "3. Trademarks & Intellectual Property",
        "legal.s3_p1": "All trademarks, service marks, trade names, logos, and brand identifiers referenced on the Site — including but not limited to \"F1®\", \"FORMULA 1®\", \"FORMULA ONE®\", \"GRAND PRIX®\", \"FIA®\", the F1 logo, team names, team logos, driver names, circuit names, and event names — are the property of their respective owners.",
        "legal.s3_p2": "Formula 1, F1, FORMULA ONE, GRAND PRIX, PADDOCK CLUB, and related marks are trademarks of Formula One Licensing B.V. FIA, Formula 1 World Championship, and related marks are trademarks of the Fédération Internationale de l'Automobile.",
        "legal.s3_p3": "Team names (Ferrari, Mercedes, McLaren, Red Bull, Williams, Aston Martin, Alpine, Haas, Audi, Cadillac, Racing Bulls, Kick Sauber, etc.) and team logos are the property of their respective teams and parent companies.",
        "legal.s3_p4": "No claim of ownership over any of these marks is made by the Site or its author.",

        "legal.s4_title": "4. Nominative Fair Use",
        "legal.s4_p1": "References to trademarks on the Site are made under the doctrine of <strong>nominative fair use</strong>, which permits the use of a trademark to identify the goods, services, teams, drivers, or events of the trademark owner, provided that:",
        "legal.s4_li1": "The product, service, or entity in question cannot be readily identified without using the trademark;",
        "legal.s4_li2": "Only so much of the mark is used as is reasonably necessary to identify it;",
        "legal.s4_li3": "No suggestion of sponsorship or endorsement by the trademark owner is made.",
        "legal.s4_p2": "The Site does not use any trademarks in a manner that would cause confusion as to source, sponsorship, affiliation, or endorsement.",

        "legal.s5_title": "5. Data Sources & Licenses",
        "legal.s5_p1": "Sporting data displayed on the Site (race calendar, results, classifications, practice sessions, etc.) is obtained from publicly accessible third-party APIs:",
        "legal.s5_li1": "<strong>Jolpica F1 API</strong> (successor to the Ergast Developer API) — data originally licensed under Creative Commons Attribution 4.0 (CC BY 4.0). Source: <em>api.jolpi.ca/ergast</em>",
        "legal.s5_li2": "<strong>OpenF1 API</strong> — open-source real-time and historical F1 data. Source: <em>api.openf1.org</em>",
        "legal.s5_li3": "<strong>TheSportsDB</strong> — community-maintained open sports database (free tier, API key \"3\"). Source: <em>www.thesportsdb.com</em>",
        "legal.s5_p2": "All data is retrieved in compliance with the respective terms of service of each provider. The Site merely displays this publicly available data and adds no proprietary sporting information.",
        "legal.s5_p3": "Data accuracy, completeness, and timeliness are <strong>not guaranteed</strong>. The Site provides no real-time broadcast, no live timing, no audiovisual content, and no exclusive information belonging to Formula One Group or its licensees.",

        "legal.s6_title": "6. Third-Party Images",
        "legal.s6_p1": "Circuit maps, event posters, and thumbnail images displayed on the Site are retrieved dynamically from TheSportsDB's public API. These images are community-contributed and hosted by TheSportsDB. The Site does not store, reproduce, or redistribute these images — it merely embeds them via hyperlink.",
        "legal.s6_p2": "Team logos displayed on the Site are either (a) retrieved from public APIs, or (b) simplified graphical representations created for identification purposes under nominative fair use.",
        "legal.s6_p3": "If you are the rights holder of any image and wish for it to be removed, please see Section 10 (DMCA / Takedown Notice) below.",

        "legal.s7_title": "7. No Warranty / Limitation of Liability",
        "legal.s7_p1": "THE SITE IS PROVIDED \"AS IS\" AND \"AS AVAILABLE\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, ACCURACY, COMPLETENESS, RELIABILITY, OR NON-INFRINGEMENT.",
        "legal.s7_p2": "The author makes no representation that the information on the Site is accurate, up-to-date, complete, or free of errors. Users rely on the information at their own risk.",
        "legal.s7_p3": "TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, THE AUTHOR SHALL NOT BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR IN CONNECTION WITH THE USE OF, OR INABILITY TO USE, THE SITE OR ITS CONTENT.",

        "legal.s8_title": "8. Non-Commercial Status",
        "legal.s8_p1": "The Site is strictly non-commercial. It:",
        "legal.s8_li1": "Charges no subscription, fee, or payment of any kind;",
        "legal.s8_li2": "Displays no advertising, sponsored content, or affiliate links;",
        "legal.s8_li3": "Collects no donations;",
        "legal.s8_li4": "Sells no merchandise or services;",
        "legal.s8_li5": "Generates no revenue, directly or indirectly.",
        "legal.s8_p2": "The Site is hosted on free-tier infrastructure (GitHub Pages / Netlify) for demonstration and learning purposes.",

        "legal.s9_title": "9. Privacy & Data Collection",
        "legal.s9_p1": "The Site collects <strong>no personal data</strong> from visitors. There is no analytics tracking, no advertising cookies, no user profiling, and no transmission of personal information to third parties.",
        "legal.s9_p2": "The Site uses the following browser storage mechanisms for functional purposes only:",
        "legal.s9_li1": "<strong>localStorage</strong>: stores theme preference (dark/light) and user-entered predictions (stored locally on the user's device only);",
        "legal.s9_li2": "<strong>sessionStorage</strong>: stores temporary UI state (anti-spoiler preferences, API image cache) for the duration of the browsing session.",
        "legal.s9_p3": "An optional administrator area uses Firebase Authentication (Google). This is reserved for the Site's owner and does not affect regular visitors. Data displayed publicly (race schedules, results) is stored in Firebase Realtime Database and is read-only for visitors.",

        "legal.s10_title": "10. DMCA / Takedown Notice",
        "legal.s10_p1": "If you are a rights holder (or authorized representative) and believe that any content displayed on the Site infringes your intellectual property rights, trademarks, or other rights, <strong>please contact the author immediately</strong>. The author is committed to promptly removing any content upon receipt of a good-faith notice.",
        "legal.s10_p2": "To file a takedown notice, please send an email to the contact address below (Section 13) containing:",
        "legal.s10_li1": "Your full name and contact information;",
        "legal.s10_li2": "A description of the copyrighted work or trademark claimed to be infringed;",
        "legal.s10_li3": "The exact URL(s) where the allegedly infringing material is located;",
        "legal.s10_li4": "A statement that you have a good-faith belief that the use is not authorized;",
        "legal.s10_li5": "A statement, under penalty of perjury, that the information is accurate and that you are the rights holder or authorized to act on their behalf;",
        "legal.s10_li6": "Your physical or electronic signature.",
        "legal.s10_p3": "<strong>Commitment: the author will respond to and comply with any valid takedown request within 48 hours of receipt.</strong>",

        "legal.s11_title": "11. Modifications",
        "legal.s11_p1": "The author reserves the right to modify, suspend, or discontinue the Site at any time, without prior notice and without liability to any user. This legal notice may be updated at any time; continued use of the Site after any modification constitutes acceptance of the revised notice.",

        "legal.s12_title": "12. Governing Law",
        "legal.s12_p1": "This legal notice is governed by and construed in accordance with the laws of the French Republic. Any dispute arising from the use of the Site shall be submitted to the exclusive jurisdiction of the competent French courts.",

        "legal.s13_title": "13. Contact",
        "legal.s13_p1": "For any legal inquiry, takedown request, or general question regarding the Site, please contact:",
        "legal.s13_p2": "<strong>Email:</strong> <a href=\"mailto:fifaseize9@gmail.com?subject=F1%202026%20Race%20Hub%20-%20Legal%20Inquiry\">fifaseize9@gmail.com</a>",
        "legal.s13_p3": "Please use the subject line \"F1 2026 Race Hub — Legal Inquiry\" for faster processing.",
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
    if (typeof renderStats === "function" && document.getElementById("view-stats")?.classList.contains("active")) renderStats();
    if (typeof renderPredictions === "function") renderPredictions();
    if (typeof updateCountdown === "function") updateCountdown();
    if (typeof renderAdminRaceList === "function") renderAdminRaceList();
}

function toggleLang() {
    setLang(currentLang === "fr" ? "en" : "fr");
}

// Apply on load
document.addEventListener("DOMContentLoaded", applyI18n);
