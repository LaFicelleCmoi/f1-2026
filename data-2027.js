// ============================================================
// 🏁 SAISON 2027 — généré par tools/build-season-data.mjs (OpenF1)
// ============================================================
// Calendrier et format sprint : officiels (flux F1 via OpenF1).
// Horaires : à confirmer (time: null) — relancer avec --with-times à l'annonce.
// Pilotes / écuries : à saisir à la main dès l'officialisation du plateau
// (laisser vide tant que ce n'est pas confirmé — l'app affiche « À confirmer »).
// Résultats : Firebase, nœud f1_results_2027 (séparé des autres saisons).
registerSeasonData(2027, {
    status: {
        calendar: "confirmed",
        sessionTimes: "unconfirmed",
        drivers: "unknown",
        points: "unconfirmed"
    },

    // Barème : celui de la saison précédente par défaut, à vérifier dans le
    // règlement sportif 2027. Sans effet tant qu'aucun résultat n'existe.
    pointsSystem: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1],
    sprintPoints: [8, 7, 6, 5, 4, 3, 2, 1],

    drivers: [],
    constructors: [],

    races: [
        {
            round: 1, name: "Grand Prix de Bahreïn", country: "Bahreïn", flag: "🇧🇭",
            circuit: "Bahrain International Circuit", city: "Sakhir", track: "sakhir",
            dates: {full: "12 – 14 Mars 2027", race: "14 Mars 2027"},
            sprint: true, status: "upcoming", isNew: false, result: null,
            schedule: [
                {day: "Vendredi", name: "Essais Libres 1", time: null, type: "fp"},
                {day: "Vendredi", name: "Qualifications Sprint", time: null, type: "quali"},
                {day: "Samedi", name: "Sprint", time: null, type: "sprint"},
                {day: "Samedi", name: "Qualifications", time: null, type: "quali"},
                {day: "Dimanche", name: "Course", time: null, type: "race"}
            ]
        },
        {
            round: 2, name: "Grand Prix d'Arabie Saoudite", country: "Arabie Saoudite", flag: "🇸🇦",
            circuit: "Jeddah Corniche Circuit", city: "Jeddah", track: "jeddah",
            dates: {full: "19 – 21 Mars 2027", race: "21 Mars 2027"},
            sprint: false, status: "upcoming", isNew: false, result: null,
            schedule: [
                {day: "Vendredi", name: "Essais Libres 1", time: null, type: "fp"},
                {day: "Vendredi", name: "Essais Libres 2", time: null, type: "fp"},
                {day: "Samedi", name: "Essais Libres 3", time: null, type: "fp"},
                {day: "Samedi", name: "Qualifications", time: null, type: "quali"},
                {day: "Dimanche", name: "Course", time: null, type: "race"}
            ]
        },
        {
            round: 3, name: "Grand Prix d'Australie", country: "Australie", flag: "🇦🇺",
            circuit: "Albert Park Circuit", city: "Melbourne", track: "melbourne",
            dates: {full: "2 – 4 Avril 2027", race: "4 Avril 2027"},
            sprint: true, status: "upcoming", isNew: false, result: null,
            schedule: [
                {day: "Vendredi", name: "Essais Libres 1", time: null, type: "fp"},
                {day: "Vendredi", name: "Qualifications Sprint", time: null, type: "quali"},
                {day: "Samedi", name: "Sprint", time: null, type: "sprint"},
                {day: "Samedi", name: "Qualifications", time: null, type: "quali"},
                {day: "Dimanche", name: "Course", time: null, type: "race"}
            ]
        },
        {
            round: 4, name: "Grand Prix du Japon", country: "Japon", flag: "🇯🇵",
            circuit: "Suzuka International Racing Course", city: "Suzuka", track: "suzuka",
            dates: {full: "9 – 11 Avril 2027", race: "11 Avril 2027"},
            sprint: true, status: "upcoming", isNew: false, result: null,
            schedule: [
                {day: "Vendredi", name: "Essais Libres 1", time: null, type: "fp"},
                {day: "Vendredi", name: "Qualifications Sprint", time: null, type: "quali"},
                {day: "Samedi", name: "Sprint", time: null, type: "sprint"},
                {day: "Samedi", name: "Qualifications", time: null, type: "quali"},
                {day: "Dimanche", name: "Course", time: null, type: "race"}
            ]
        },
        {
            round: 5, name: "Grand Prix de Chine", country: "Chine", flag: "🇨🇳",
            circuit: "Shanghai International Circuit", city: "Shanghai", track: "shanghai",
            dates: {full: "16 – 18 Avril 2027", race: "18 Avril 2027"},
            sprint: false, status: "upcoming", isNew: false, result: null,
            schedule: [
                {day: "Vendredi", name: "Essais Libres 1", time: null, type: "fp"},
                {day: "Vendredi", name: "Essais Libres 2", time: null, type: "fp"},
                {day: "Samedi", name: "Essais Libres 3", time: null, type: "fp"},
                {day: "Samedi", name: "Qualifications", time: null, type: "quali"},
                {day: "Dimanche", name: "Course", time: null, type: "race"}
            ]
        },
        {
            round: 6, name: "Grand Prix de Miami", country: "États-Unis", flag: "🇺🇸",
            circuit: "Miami International Autodrome", city: "Miami Gardens", track: "miami",
            dates: {full: "30 Avr – 2 Mai 2027", race: "2 Mai 2027"},
            sprint: false, status: "upcoming", isNew: false, result: null,
            schedule: [
                {day: "Vendredi", name: "Essais Libres 1", time: null, type: "fp"},
                {day: "Vendredi", name: "Essais Libres 2", time: null, type: "fp"},
                {day: "Samedi", name: "Essais Libres 3", time: null, type: "fp"},
                {day: "Samedi", name: "Qualifications", time: null, type: "quali"},
                {day: "Dimanche", name: "Course", time: null, type: "race"}
            ]
        },
        {
            round: 7, name: "Grand Prix du Canada", country: "Canada", flag: "🇨🇦",
            circuit: "Circuit Gilles-Villeneuve", city: "Montréal", track: "montreal",
            dates: {full: "21 – 23 Mai 2027", race: "23 Mai 2027"},
            sprint: true, status: "upcoming", isNew: false, result: null,
            schedule: [
                {day: "Vendredi", name: "Essais Libres 1", time: null, type: "fp"},
                {day: "Vendredi", name: "Qualifications Sprint", time: null, type: "quali"},
                {day: "Samedi", name: "Sprint", time: null, type: "sprint"},
                {day: "Samedi", name: "Qualifications", time: null, type: "quali"},
                {day: "Dimanche", name: "Course", time: null, type: "race"}
            ]
        },
        {
            round: 8, name: "Grand Prix de Monaco", country: "Monaco", flag: "🇲🇨",
            circuit: "Circuit de Monaco", city: "Monte Carlo", track: "montecarlo",
            dates: {full: "4 – 6 Juin 2027", race: "6 Juin 2027"},
            sprint: true, status: "upcoming", isNew: false, result: null,
            schedule: [
                {day: "Vendredi", name: "Essais Libres 1", time: null, type: "fp"},
                {day: "Vendredi", name: "Qualifications Sprint", time: null, type: "quali"},
                {day: "Samedi", name: "Sprint", time: null, type: "sprint"},
                {day: "Samedi", name: "Qualifications", time: null, type: "quali"},
                {day: "Dimanche", name: "Course", time: null, type: "race"}
            ]
        },
        {
            round: 9, name: "Grand Prix du Portugal", country: "Portugal", flag: "🇵🇹",
            circuit: "Autódromo Internacional do Algarve", city: "Portimão", track: "algarveinternationalcircuit",
            dates: {full: "18 – 20 Juin 2027", race: "20 Juin 2027"},
            sprint: false, status: "upcoming", isNew: false, result: null,
            schedule: [
                {day: "Vendredi", name: "Essais Libres 1", time: null, type: "fp"},
                {day: "Vendredi", name: "Essais Libres 2", time: null, type: "fp"},
                {day: "Samedi", name: "Essais Libres 3", time: null, type: "fp"},
                {day: "Samedi", name: "Qualifications", time: null, type: "quali"},
                {day: "Dimanche", name: "Course", time: null, type: "race"}
            ]
        },
        {
            round: 10, name: "Grand Prix de Grande-Bretagne", country: "Royaume-Uni", flag: "🇬🇧",
            circuit: "Silverstone Circuit", city: "Silverstone", track: "silverstone",
            dates: {full: "2 – 4 Juillet 2027", race: "4 Juillet 2027"},
            sprint: true, status: "upcoming", isNew: false, result: null,
            schedule: [
                {day: "Vendredi", name: "Essais Libres 1", time: null, type: "fp"},
                {day: "Vendredi", name: "Qualifications Sprint", time: null, type: "quali"},
                {day: "Samedi", name: "Sprint", time: null, type: "sprint"},
                {day: "Samedi", name: "Qualifications", time: null, type: "quali"},
                {day: "Dimanche", name: "Course", time: null, type: "race"}
            ]
        },
        {
            round: 11, name: "Grand Prix d'Autriche", country: "Autriche", flag: "🇦🇹",
            circuit: "Red Bull Ring", city: "Spielberg", track: "spielberg",
            dates: {full: "9 – 11 Juillet 2027", race: "11 Juillet 2027"},
            sprint: false, status: "upcoming", isNew: false, result: null,
            schedule: [
                {day: "Vendredi", name: "Essais Libres 1", time: null, type: "fp"},
                {day: "Vendredi", name: "Essais Libres 2", time: null, type: "fp"},
                {day: "Samedi", name: "Essais Libres 3", time: null, type: "fp"},
                {day: "Samedi", name: "Qualifications", time: null, type: "quali"},
                {day: "Dimanche", name: "Course", time: null, type: "race"}
            ]
        },
        {
            round: 12, name: "Grand Prix de Belgique", country: "Belgique", flag: "🇧🇪",
            circuit: "Circuit de Spa-Francorchamps", city: "Spa-Francorchamps", track: "spafrancorchamps",
            dates: {full: "23 – 25 Juillet 2027", race: "25 Juillet 2027"},
            sprint: false, status: "upcoming", isNew: false, result: null,
            schedule: [
                {day: "Vendredi", name: "Essais Libres 1", time: null, type: "fp"},
                {day: "Vendredi", name: "Essais Libres 2", time: null, type: "fp"},
                {day: "Samedi", name: "Essais Libres 3", time: null, type: "fp"},
                {day: "Samedi", name: "Qualifications", time: null, type: "quali"},
                {day: "Dimanche", name: "Course", time: null, type: "race"}
            ]
        },
        {
            round: 13, name: "Grand Prix de Hongrie", country: "Hongrie", flag: "🇭🇺",
            circuit: "Hungaroring", city: "Budapest", track: "hungaroring",
            dates: {full: "30 Juil – 1 Août 2027", race: "1 Août 2027"},
            sprint: false, status: "upcoming", isNew: false, result: null,
            schedule: [
                {day: "Vendredi", name: "Essais Libres 1", time: null, type: "fp"},
                {day: "Vendredi", name: "Essais Libres 2", time: null, type: "fp"},
                {day: "Samedi", name: "Essais Libres 3", time: null, type: "fp"},
                {day: "Samedi", name: "Qualifications", time: null, type: "quali"},
                {day: "Dimanche", name: "Course", time: null, type: "race"}
            ]
        },
        {
            round: 14, name: "Grand Prix d'Italie", country: "Italie", flag: "🇮🇹",
            circuit: "Autodromo Nazionale Monza", city: "Monza", track: "monza",
            dates: {full: "3 – 5 Septembre 2027", race: "5 Septembre 2027"},
            sprint: true, status: "upcoming", isNew: false, result: null,
            schedule: [
                {day: "Vendredi", name: "Essais Libres 1", time: null, type: "fp"},
                {day: "Vendredi", name: "Qualifications Sprint", time: null, type: "quali"},
                {day: "Samedi", name: "Sprint", time: null, type: "sprint"},
                {day: "Samedi", name: "Qualifications", time: null, type: "quali"},
                {day: "Dimanche", name: "Course", time: null, type: "race"}
            ]
        },
        {
            round: 15, name: "Grand Prix d'Espagne", country: "Espagne", flag: "🇪🇸",
            circuit: "Madring", city: "Madrid", track: "madring",
            dates: {full: "10 – 12 Septembre 2027", race: "12 Septembre 2027"},
            sprint: false, status: "upcoming", isNew: false, result: null,
            schedule: [
                {day: "Vendredi", name: "Essais Libres 1", time: null, type: "fp"},
                {day: "Vendredi", name: "Essais Libres 2", time: null, type: "fp"},
                {day: "Samedi", name: "Essais Libres 3", time: null, type: "fp"},
                {day: "Samedi", name: "Qualifications", time: null, type: "quali"},
                {day: "Dimanche", name: "Course", time: null, type: "race"}
            ]
        },
        {
            round: 16, name: "Grand Prix d'Azerbaïdjan", country: "Azerbaïdjan", flag: "🇦🇿",
            circuit: "Baku City Circuit", city: "Baku", track: "baku",
            dates: {full: "24 – 26 Septembre 2027", race: "26 Septembre 2027"},
            sprint: false, status: "upcoming", isNew: false, result: null,
            schedule: [
                {day: "Vendredi", name: "Essais Libres 1", time: null, type: "fp"},
                {day: "Vendredi", name: "Essais Libres 2", time: null, type: "fp"},
                {day: "Samedi", name: "Essais Libres 3", time: null, type: "fp"},
                {day: "Samedi", name: "Qualifications", time: null, type: "quali"},
                {day: "Dimanche", name: "Course", time: null, type: "race"}
            ]
        },
        {
            round: 17, name: "Grand Prix de Turquie", country: "Turquie", flag: "🇹🇷",
            circuit: "Istanbul Park", city: "Istanbul", track: "istanbul",
            dates: {full: "1 – 3 Octobre 2027", race: "3 Octobre 2027"},
            sprint: false, status: "upcoming", isNew: false, result: null,
            schedule: [
                {day: "Vendredi", name: "Essais Libres 1", time: null, type: "fp"},
                {day: "Vendredi", name: "Essais Libres 2", time: null, type: "fp"},
                {day: "Samedi", name: "Essais Libres 3", time: null, type: "fp"},
                {day: "Samedi", name: "Qualifications", time: null, type: "quali"},
                {day: "Dimanche", name: "Course", time: null, type: "race"}
            ]
        },
        {
            round: 18, name: "Grand Prix de Singapour", country: "Singapour", flag: "🇸🇬",
            circuit: "Marina Bay Street Circuit", city: "Marina Bay", track: "singapore",
            dates: {full: "8 – 10 Octobre 2027", race: "10 Octobre 2027"},
            sprint: false, status: "upcoming", isNew: false, result: null,
            schedule: [
                {day: "Vendredi", name: "Essais Libres 1", time: null, type: "fp"},
                {day: "Vendredi", name: "Essais Libres 2", time: null, type: "fp"},
                {day: "Samedi", name: "Essais Libres 3", time: null, type: "fp"},
                {day: "Samedi", name: "Qualifications", time: null, type: "quali"},
                {day: "Dimanche", name: "Course", time: null, type: "race"}
            ]
        },
        {
            round: 19, name: "Grand Prix des États-Unis", country: "États-Unis", flag: "🇺🇸",
            circuit: "Circuit of the Americas", city: "Austin", track: "austin",
            dates: {full: "22 – 24 Octobre 2027", race: "24 Octobre 2027"},
            sprint: false, status: "upcoming", isNew: false, result: null,
            schedule: [
                {day: "Vendredi", name: "Essais Libres 1", time: null, type: "fp"},
                {day: "Vendredi", name: "Essais Libres 2", time: null, type: "fp"},
                {day: "Samedi", name: "Essais Libres 3", time: null, type: "fp"},
                {day: "Samedi", name: "Qualifications", time: null, type: "quali"},
                {day: "Dimanche", name: "Course", time: null, type: "race"}
            ]
        },
        {
            round: 20, name: "Grand Prix du Mexique", country: "Mexique", flag: "🇲🇽",
            circuit: "Autodromo Hermanos Rodriguez", city: "Mexico City", track: "mexicocity",
            dates: {full: "29 – 31 Octobre 2027", race: "31 Octobre 2027"},
            sprint: false, status: "upcoming", isNew: false, result: null,
            schedule: [
                {day: "Vendredi", name: "Essais Libres 1", time: null, type: "fp"},
                {day: "Vendredi", name: "Essais Libres 2", time: null, type: "fp"},
                {day: "Samedi", name: "Essais Libres 3", time: null, type: "fp"},
                {day: "Samedi", name: "Qualifications", time: null, type: "quali"},
                {day: "Dimanche", name: "Course", time: null, type: "race"}
            ]
        },
        {
            round: 21, name: "Grand Prix du Brésil", country: "Brésil", flag: "🇧🇷",
            circuit: "Autodromo José Carlos Pace", city: "São Paulo", track: "interlagos",
            dates: {full: "5 – 7 Novembre 2027", race: "7 Novembre 2027"},
            sprint: true, status: "upcoming", isNew: false, result: null,
            schedule: [
                {day: "Vendredi", name: "Essais Libres 1", time: null, type: "fp"},
                {day: "Vendredi", name: "Qualifications Sprint", time: null, type: "quali"},
                {day: "Samedi", name: "Sprint", time: null, type: "sprint"},
                {day: "Samedi", name: "Qualifications", time: null, type: "quali"},
                {day: "Dimanche", name: "Course", time: null, type: "race"}
            ]
        },
        {
            round: 22, name: "Grand Prix de Las Vegas", country: "États-Unis", flag: "🇺🇸",
            circuit: "Las Vegas Strip Circuit", city: "Las Vegas", track: "lasvegas",
            dates: {full: "18 – 20 Novembre 2027", race: "20 Novembre 2027"},
            sprint: false, status: "upcoming", isNew: false, result: null,
            schedule: [
                {day: "Jeudi", name: "Essais Libres 1", time: null, type: "fp"},
                {day: "Jeudi", name: "Essais Libres 2", time: null, type: "fp"},
                {day: "Vendredi", name: "Essais Libres 3", time: null, type: "fp"},
                {day: "Vendredi", name: "Qualifications", time: null, type: "quali"},
                {day: "Samedi", name: "Course", time: null, type: "race"}
            ]
        },
        {
            round: 23, name: "Grand Prix du Qatar", country: "Qatar", flag: "🇶🇦",
            circuit: "Lusail International Circuit", city: "Lusail", track: "lusail",
            dates: {full: "3 – 5 Décembre 2027", race: "5 Décembre 2027"},
            sprint: true, status: "upcoming", isNew: false, result: null,
            schedule: [
                {day: "Vendredi", name: "Essais Libres 1", time: null, type: "fp"},
                {day: "Vendredi", name: "Qualifications Sprint", time: null, type: "quali"},
                {day: "Samedi", name: "Sprint", time: null, type: "sprint"},
                {day: "Samedi", name: "Qualifications", time: null, type: "quali"},
                {day: "Dimanche", name: "Course", time: null, type: "race"}
            ]
        },
        {
            round: 24, name: "Grand Prix d'Abu Dhabi", country: "Émirats Arabes Unis", flag: "🇦🇪",
            circuit: "Yas Marina Circuit", city: "Yas Marina", track: "yasmarinacircuit",
            dates: {full: "10 – 12 Décembre 2027", race: "12 Décembre 2027"},
            sprint: true, status: "upcoming", isNew: false, result: null,
            schedule: [
                {day: "Vendredi", name: "Essais Libres 1", time: null, type: "fp"},
                {day: "Vendredi", name: "Qualifications Sprint", time: null, type: "quali"},
                {day: "Samedi", name: "Sprint", time: null, type: "sprint"},
                {day: "Samedi", name: "Qualifications", time: null, type: "quali"},
                {day: "Dimanche", name: "Course", time: null, type: "race"}
            ]
        }
    ],

    // TheSportsDB : round → nom de recherche (images)
    sportsDbNames: {
        1: "Bahrain Grand Prix",
        2: "Saudi Arabian Grand Prix",
        3: "Australian Grand Prix",
        4: "Japanese Grand Prix",
        5: "Chinese Grand Prix",
        6: "Miami Grand Prix",
        7: "Canadian Grand Prix",
        8: "Monaco Grand Prix",
        9: "Portuguese Grand Prix",
        10: "British Grand Prix",
        11: "Austrian Grand Prix",
        12: "Belgian Grand Prix",
        13: "Hungarian Grand Prix",
        14: "Italian Grand Prix",
        15: "Spanish Grand Prix",
        16: "Azerbaijan Grand Prix",
        17: "Turkish Grand Prix",
        18: "Singapore Grand Prix",
        19: "United States Grand Prix",
        20: "Mexican Grand Prix",
        21: "São Paulo Grand Prix",
        22: "Las Vegas Grand Prix",
        23: "Qatar Grand Prix",
        24: "Abu Dhabi Grand Prix"
    }
});
