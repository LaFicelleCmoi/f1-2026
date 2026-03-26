const pointsSystem = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
const sprintPoints = [8, 7, 6, 5, 4, 3, 2, 1];

const drivers = [
    { driver: "Lando Norris", team: "McLaren", flag: "🇬🇧" },
    { driver: "Oscar Piastri", team: "McLaren", flag: "🇦🇺" },
    { driver: "George Russell", team: "Mercedes", flag: "🇬🇧" },
    { driver: "Andrea Kimi Antonelli", team: "Mercedes", flag: "🇮🇹" },
    { driver: "Max Verstappen", team: "Red Bull Racing", flag: "🇳🇱" },
    { driver: "Isack Hadjar", team: "Red Bull Racing", flag: "🇫🇷" },
    { driver: "Charles Leclerc", team: "Ferrari", flag: "🇲🇨" },
    { driver: "Lewis Hamilton", team: "Ferrari", flag: "🇬🇧" },
    { driver: "Carlos Sainz", team: "Williams", flag: "🇪🇸" },
    { driver: "Alex Albon", team: "Williams", flag: "🇹🇭" },
    { driver: "Liam Lawson", team: "Racing Bulls", flag: "🇳🇿" },
    { driver: "Arvid Lindblad", team: "Racing Bulls", flag: "🇸🇪" },
    { driver: "Fernando Alonso", team: "Aston Martin", flag: "🇪🇸" },
    { driver: "Lance Stroll", team: "Aston Martin", flag: "🇨🇦" },
    { driver: "Esteban Ocon", team: "Haas", flag: "🇫🇷" },
    { driver: "Oliver Bearman", team: "Haas", flag: "🇬🇧" },
    { driver: "Nico Hülkenberg", team: "Audi", flag: "🇩🇪" },
    { driver: "Gabriel Bortoleto", team: "Audi", flag: "🇧🇷" },
    { driver: "Pierre Gasly", team: "Alpine", flag: "🇫🇷" },
    { driver: "Franco Colapinto", team: "Alpine", flag: "🇦🇷" },
    { driver: "Sergio Pérez", team: "Cadillac", flag: "🇲🇽" },
    { driver: "Valtteri Bottas", team: "Cadillac", flag: "🇫🇮" }
];

const teamColors = {
    "McLaren":          "#ff8000",
    "Mercedes":         "#27f4d2",
    "Red Bull Racing":  "#3671c6",
    "Ferrari":          "#e8002d",
    "Williams":         "#64c4ff",
    "Racing Bulls":     "#6692ff",
    "Aston Martin":     "#229971",
    "Haas":             "#b6babd",
    "Audi":             "#990000",
    "Alpine":           "#ff87bc",
    "Cadillac":         "#1d1d1b"
};

const teamLogos = {
    "McLaren":          "https://media.formula1.com/content/dam/fom-website/teams/2025/mclaren-logo.png",
    "Mercedes":         "https://media.formula1.com/content/dam/fom-website/teams/2025/mercedes-logo.png",
    "Red Bull Racing":  "https://media.formula1.com/content/dam/fom-website/teams/2025/red-bull-racing-logo.png",
    "Ferrari":          "https://media.formula1.com/content/dam/fom-website/teams/2025/ferrari-logo.png",
    "Williams":         "https://media.formula1.com/content/dam/fom-website/teams/2025/williams-logo.png",
    "Racing Bulls":     "https://media.formula1.com/content/dam/fom-website/teams/2025/racing-bulls-logo.png",
    "Aston Martin":     "https://media.formula1.com/content/dam/fom-website/teams/2025/aston-martin-logo.png",
    "Haas":             "https://media.formula1.com/content/dam/fom-website/teams/2025/haas-logo.png",
    "Audi":             "logos/audi.svg",
    "Alpine":           "https://media.formula1.com/content/dam/fom-website/teams/2025/alpine-logo.png",
    "Cadillac":         "logos/cadillac.svg"
};

// Mapping API constructor names → local names
const teamAliases = {
    "McLaren":           "McLaren",
    "Mercedes":          "Mercedes",
    "Red Bull":          "Red Bull Racing",
    "red_bull":          "Red Bull Racing",
    "Ferrari":           "Ferrari",
    "Williams":          "Williams",
    "RB F1 Team":        "Racing Bulls",
    "Racing Bulls":      "Racing Bulls",
    "rb":                "Racing Bulls",
    "AlphaTauri":        "Racing Bulls",
    "Aston Martin":      "Aston Martin",
    "Haas F1 Team":      "Haas",
    "Haas":              "Haas",
    "Sauber":            "Audi",
    "Kick Sauber":       "Audi",
    "Audi":              "Audi",
    "Alpine F1 Team":    "Alpine",
    "Alpine":            "Alpine",
    "Cadillac F1 Team":  "Cadillac",
    "Cadillac":          "Cadillac",
    "Andretti":          "Cadillac"
};

const constructors = [
    { team: "McLaren", flag: "🇬🇧" },
    { team: "Mercedes", flag: "🇩🇪" },
    { team: "Red Bull Racing", flag: "🇦🇹" },
    { team: "Ferrari", flag: "🇮🇹" },
    { team: "Williams", flag: "🇬🇧" },
    { team: "Racing Bulls", flag: "🇮🇹" },
    { team: "Aston Martin", flag: "🇬🇧" },
    { team: "Haas", flag: "🇺🇸" },
    { team: "Audi", flag: "🇩🇪" },
    { team: "Alpine", flag: "🇫🇷" },
    { team: "Cadillac", flag: "🇺🇸" }
];

const countryContinent = {
    "Australie": "Asie-Océanie", "Chine": "Asie-Océanie", "Japon": "Asie-Océanie",
    "Singapour": "Asie-Océanie", "Bahreïn": "Moyen-Orient", "Arabie Saoudite": "Moyen-Orient",
    "Qatar": "Moyen-Orient", "Émirats Arabes Unis": "Moyen-Orient", "Azerbaïdjan": "Moyen-Orient",
    "États-Unis": "Amériques", "Canada": "Amériques", "Mexique": "Amériques", "Brésil": "Amériques",
    "Monaco": "Europe", "Espagne": "Europe", "Autriche": "Europe", "Royaume-Uni": "Europe",
    "Belgique": "Europe", "Hongrie": "Europe", "Pays-Bas": "Europe", "Italie": "Europe"
};

const races = [
    {
        round: 1, name: "Grand Prix d'Australie", country: "Australie", flag: "🇦🇺",
        circuit: "Albert Park Circuit", city: "Melbourne",
        dates: { full: "6 – 8 Mars 2026", race: "8 Mars 2026" },
        sprint: false, status: "upcoming", isNew: false,
        result: null,
        schedule: [
            { day: "Vendredi", name: "Essais Libres 1", time: "02:30", type: "fp" },
            { day: "Vendredi", name: "Essais Libres 2", time: "06:00", type: "fp" },
            { day: "Samedi", name: "Essais Libres 3", time: "02:30", type: "fp" },
            { day: "Samedi", name: "Qualifications", time: "06:00", type: "quali" },
            { day: "Dimanche", name: "Course", time: "05:00", type: "race" }
        ]
    },
    {
        round: 2, name: "Grand Prix de Chine", country: "Chine", flag: "🇨🇳",
        circuit: "Shanghai International Circuit", city: "Shanghai",
        dates: { full: "13 – 15 Mars 2026", race: "15 Mars 2026" },
        sprint: true, status: "upcoming", isNew: false,
        result: null,
        schedule: [
            { day: "Vendredi", name: "Essais Libres 1", time: "04:30", type: "fp" },
            { day: "Vendredi", name: "Qualifications Sprint", time: "08:30", type: "quali" },
            { day: "Samedi", name: "Sprint", time: "04:00", type: "sprint" },
            { day: "Samedi", name: "Qualifications", time: "08:00", type: "quali" },
            { day: "Dimanche", name: "Course", time: "07:00", type: "race" }
        ]
    },
    {
        round: 3, name: "Grand Prix du Japon", country: "Japon", flag: "🇯🇵",
        circuit: "Suzuka International Racing Course", city: "Suzuka",
        dates: { full: "27 – 29 Mars 2026", race: "29 Mars 2026" },
        sprint: false, status: "upcoming", isNew: false,
        result: null,
        schedule: [
            { day: "Vendredi", name: "Essais Libres 1", time: "03:30", type: "fp" },
            { day: "Vendredi", name: "Essais Libres 2", time: "07:00", type: "fp" },
            { day: "Samedi", name: "Essais Libres 3", time: "03:30", type: "fp" },
            { day: "Samedi", name: "Qualifications", time: "07:00", type: "quali" },
            { day: "Dimanche", name: "Course", time: "06:00", type: "race" }
        ]
    },
    {
        round: 4, name: "Grand Prix de Bahreïn", country: "Bahreïn", flag: "🇧🇭",
        circuit: "Bahrain International Circuit", city: "Sakhir",
        dates: { full: "10 – 12 Avril 2026", race: "12 Avril 2026" },
        sprint: false, status: "upcoming", isNew: false,
        result: null,
        schedule: [
            { day: "Vendredi", name: "Essais Libres 1", time: "13:30", type: "fp" },
            { day: "Vendredi", name: "Essais Libres 2", time: "17:00", type: "fp" },
            { day: "Samedi", name: "Essais Libres 3", time: "13:30", type: "fp" },
            { day: "Samedi", name: "Qualifications", time: "17:00", type: "quali" },
            { day: "Dimanche", name: "Course", time: "16:00", type: "race" }
        ]
    },
    {
        round: 5, name: "Grand Prix d'Arabie Saoudite", country: "Arabie Saoudite", flag: "🇸🇦",
        circuit: "Jeddah Corniche Circuit", city: "Jeddah",
        dates: { full: "17 – 19 Avril 2026", race: "19 Avril 2026" },
        sprint: false, status: "upcoming", isNew: false,
        result: null,
        schedule: [
            { day: "Vendredi", name: "Essais Libres 1", time: "15:30", type: "fp" },
            { day: "Vendredi", name: "Essais Libres 2", time: "19:00", type: "fp" },
            { day: "Samedi", name: "Essais Libres 3", time: "15:30", type: "fp" },
            { day: "Samedi", name: "Qualifications", time: "19:00", type: "quali" },
            { day: "Dimanche", name: "Course", time: "19:00", type: "race" }
        ]
    },
    {
        round: 6, name: "Grand Prix de Miami", country: "États-Unis", flag: "🇺🇸",
        circuit: "Miami International Autodrome", city: "Miami Gardens",
        dates: { full: "1 – 3 Mai 2026", race: "3 Mai 2026" },
        sprint: true, status: "upcoming", isNew: false,
        result: null,
        schedule: [
            { day: "Vendredi", name: "Essais Libres 1", time: "18:30", type: "fp" },
            { day: "Vendredi", name: "Qualifications Sprint", time: "22:30", type: "quali" },
            { day: "Samedi", name: "Sprint", time: "17:00", type: "sprint" },
            { day: "Samedi", name: "Qualifications", time: "21:00", type: "quali" },
            { day: "Dimanche", name: "Course", time: "21:00", type: "race" }
        ]
    },
    {
        round: 7, name: "Grand Prix du Canada", country: "Canada", flag: "🇨🇦",
        circuit: "Circuit Gilles-Villeneuve", city: "Montréal",
        dates: { full: "22 – 24 Mai 2026", race: "24 Mai 2026" },
        sprint: true, status: "upcoming", isNew: false,
        result: null,
        schedule: [
            { day: "Vendredi", name: "Essais Libres 1", time: "18:30", type: "fp" },
            { day: "Vendredi", name: "Qualifications Sprint", time: "22:30", type: "quali" },
            { day: "Samedi", name: "Sprint", time: "17:00", type: "sprint" },
            { day: "Samedi", name: "Qualifications", time: "21:00", type: "quali" },
            { day: "Dimanche", name: "Course", time: "19:00", type: "race" }
        ]
    },
    {
        round: 8, name: "Grand Prix de Monaco", country: "Monaco", flag: "🇲🇨",
        circuit: "Circuit de Monaco", city: "Monte-Carlo",
        dates: { full: "5 – 7 Juin 2026", race: "7 Juin 2026" },
        sprint: false, status: "upcoming", isNew: false,
        result: null,
        schedule: [
            { day: "Vendredi", name: "Essais Libres 1", time: "12:30", type: "fp" },
            { day: "Vendredi", name: "Essais Libres 2", time: "16:00", type: "fp" },
            { day: "Samedi", name: "Essais Libres 3", time: "11:30", type: "fp" },
            { day: "Samedi", name: "Qualifications", time: "15:00", type: "quali" },
            { day: "Dimanche", name: "Course", time: "15:00", type: "race" }
        ]
    },
    {
        round: 9, name: "Grand Prix Automobile de Barcelone-Catalogne", country: "Espagne", flag: "🇪🇸",
        circuit: "Circuit de Barcelona-Catalunya", city: "Barcelone",
        dates: { full: "12 – 14 Juin 2026", race: "14 Juin 2026" },
        sprint: false, status: "upcoming", isNew: false,
        result: null,
        schedule: [
            { day: "Vendredi", name: "Essais Libres 1", time: "12:30", type: "fp" },
            { day: "Vendredi", name: "Essais Libres 2", time: "16:00", type: "fp" },
            { day: "Samedi", name: "Essais Libres 3", time: "11:30", type: "fp" },
            { day: "Samedi", name: "Qualifications", time: "15:00", type: "quali" },
            { day: "Dimanche", name: "Course", time: "15:00", type: "race" }
        ]
    },
    {
        round: 10, name: "Grand Prix d'Autriche", country: "Autriche", flag: "🇦🇹",
        circuit: "Red Bull Ring", city: "Spielberg",
        dates: { full: "26 – 28 Juin 2026", race: "28 Juin 2026" },
        sprint: false, status: "upcoming", isNew: false,
        result: null,
        schedule: [
            { day: "Vendredi", name: "Essais Libres 1", time: "12:30", type: "fp" },
            { day: "Vendredi", name: "Essais Libres 2", time: "16:00", type: "fp" },
            { day: "Samedi", name: "Essais Libres 3", time: "11:30", type: "fp" },
            { day: "Samedi", name: "Qualifications", time: "15:00", type: "quali" },
            { day: "Dimanche", name: "Course", time: "15:00", type: "race" }
        ]
    },
    {
        round: 11, name: "Grand Prix de Grande-Bretagne", country: "Royaume-Uni", flag: "🇬🇧",
        circuit: "Silverstone Circuit", city: "Silverstone",
        dates: { full: "3 – 5 Juillet 2026", race: "5 Juillet 2026" },
        sprint: true, status: "upcoming", isNew: false,
        result: null,
        schedule: [
            { day: "Vendredi", name: "Essais Libres 1", time: "12:30", type: "fp" },
            { day: "Vendredi", name: "Qualifications Sprint", time: "16:30", type: "quali" },
            { day: "Samedi", name: "Sprint", time: "12:00", type: "sprint" },
            { day: "Samedi", name: "Qualifications", time: "16:00", type: "quali" },
            { day: "Dimanche", name: "Course", time: "15:00", type: "race" }
        ]
    },
    {
        round: 12, name: "Grand Prix de Belgique", country: "Belgique", flag: "🇧🇪",
        circuit: "Circuit de Spa-Francorchamps", city: "Spa",
        dates: { full: "17 – 19 Juillet 2026", race: "19 Juillet 2026" },
        sprint: false, status: "upcoming", isNew: false,
        result: null,
        schedule: [
            { day: "Vendredi", name: "Essais Libres 1", time: "12:30", type: "fp" },
            { day: "Vendredi", name: "Essais Libres 2", time: "16:00", type: "fp" },
            { day: "Samedi", name: "Essais Libres 3", time: "11:30", type: "fp" },
            { day: "Samedi", name: "Qualifications", time: "15:00", type: "quali" },
            { day: "Dimanche", name: "Course", time: "15:00", type: "race" }
        ]
    },
    {
        round: 13, name: "Grand Prix de Hongrie", country: "Hongrie", flag: "🇭🇺",
        circuit: "Hungaroring", city: "Budapest",
        dates: { full: "24 – 26 Juillet 2026", race: "26 Juillet 2026" },
        sprint: false, status: "upcoming", isNew: false,
        result: null,
        schedule: [
            { day: "Vendredi", name: "Essais Libres 1", time: "12:30", type: "fp" },
            { day: "Vendredi", name: "Essais Libres 2", time: "16:00", type: "fp" },
            { day: "Samedi", name: "Essais Libres 3", time: "11:30", type: "fp" },
            { day: "Samedi", name: "Qualifications", time: "15:00", type: "quali" },
            { day: "Dimanche", name: "Course", time: "15:00", type: "race" }
        ]
    },
    {
        round: 14, name: "Grand Prix des Pays-Bas", country: "Pays-Bas", flag: "🇳🇱",
        circuit: "Circuit Zandvoort", city: "Zandvoort",
        dates: { full: "21 – 23 Août 2026", race: "23 Août 2026" },
        sprint: true, status: "upcoming", isNew: false,
        result: null,
        schedule: [
            { day: "Vendredi", name: "Essais Libres 1", time: "11:30", type: "fp" },
            { day: "Vendredi", name: "Qualifications Sprint", time: "15:30", type: "quali" },
            { day: "Samedi", name: "Sprint", time: "11:00", type: "sprint" },
            { day: "Samedi", name: "Qualifications", time: "15:00", type: "quali" },
            { day: "Dimanche", name: "Course", time: "15:00", type: "race" }
        ]
    },
    {
        round: 15, name: "Grand Prix d'Italie", country: "Italie", flag: "🇮🇹",
        circuit: "Autodromo Nazionale Monza", city: "Monza",
        dates: { full: "4 – 6 Septembre 2026", race: "6 Septembre 2026" },
        sprint: false, status: "upcoming", isNew: false,
        result: null,
        schedule: [
            { day: "Vendredi", name: "Essais Libres 1", time: "12:30", type: "fp" },
            { day: "Vendredi", name: "Essais Libres 2", time: "16:00", type: "fp" },
            { day: "Samedi", name: "Essais Libres 3", time: "11:30", type: "fp" },
            { day: "Samedi", name: "Qualifications", time: "15:00", type: "quali" },
            { day: "Dimanche", name: "Course", time: "15:00", type: "race" }
        ]
    },
    {
        round: 16, name: "Grand Prix d'Espagne", country: "Espagne", flag: "🇪🇸",
        circuit: "Circuito del Jarama", city: "Madrid",
        dates: { full: "11 – 13 Septembre 2026", race: "13 Septembre 2026" },
        sprint: false, status: "upcoming", isNew: true,
        result: null,
        schedule: [
            { day: "Vendredi", name: "Essais Libres 1", time: "12:30", type: "fp" },
            { day: "Vendredi", name: "Essais Libres 2", time: "16:00", type: "fp" },
            { day: "Samedi", name: "Essais Libres 3", time: "11:30", type: "fp" },
            { day: "Samedi", name: "Qualifications", time: "15:00", type: "quali" },
            { day: "Dimanche", name: "Course", time: "15:00", type: "race" }
        ]
    },
    {
        round: 17, name: "Grand Prix d'Azerbaïdjan", country: "Azerbaïdjan", flag: "🇦🇿",
        circuit: "Baku City Circuit", city: "Bakou",
        dates: { full: "24 – 26 Septembre 2026", race: "26 Septembre 2026" },
        sprint: false, status: "upcoming", isNew: false,
        result: null,
        schedule: [
            { day: "Jeudi", name: "Essais Libres 1", time: "10:30", type: "fp" },
            { day: "Jeudi", name: "Essais Libres 2", time: "14:00", type: "fp" },
            { day: "Vendredi", name: "Essais Libres 3", time: "10:30", type: "fp" },
            { day: "Vendredi", name: "Qualifications", time: "14:00", type: "quali" },
            { day: "Samedi", name: "Course", time: "13:00", type: "race" }
        ]
    },
    {
        round: 18, name: "Grand Prix de Singapour", country: "Singapour", flag: "🇸🇬",
        circuit: "Marina Bay Street Circuit", city: "Singapour",
        dates: { full: "2 – 4 Octobre 2026", race: "4 Octobre 2026" },
        sprint: true, status: "upcoming", isNew: false,
        result: null,
        schedule: [
            { day: "Vendredi", name: "Essais Libres 1", time: "10:30", type: "fp" },
            { day: "Vendredi", name: "Qualifications Sprint", time: "14:30", type: "quali" },
            { day: "Samedi", name: "Sprint", time: "10:00", type: "sprint" },
            { day: "Samedi", name: "Qualifications", time: "14:00", type: "quali" },
            { day: "Dimanche", name: "Course", time: "13:00", type: "race" }
        ]
    },
    {
        round: 19, name: "Grand Prix des États-Unis", country: "États-Unis", flag: "🇺🇸",
        circuit: "Circuit of the Americas", city: "Austin",
        dates: { full: "16 – 18 Octobre 2026", race: "18 Octobre 2026" },
        sprint: false, status: "upcoming", isNew: false,
        result: null,
        schedule: [
            { day: "Vendredi", name: "Essais Libres 1", time: "19:30", type: "fp" },
            { day: "Vendredi", name: "Essais Libres 2", time: "23:00", type: "fp" },
            { day: "Samedi", name: "Essais Libres 3", time: "19:30", type: "fp" },
            { day: "Samedi", name: "Qualifications", time: "23:00", type: "quali" },
            { day: "Dimanche", name: "Course", time: "21:00", type: "race" }
        ]
    },
    {
        round: 20, name: "Grand Prix du Mexique", country: "Mexique", flag: "🇲🇽",
        circuit: "Autodromo Hermanos Rodriguez", city: "Mexico",
        dates: { full: "30 Oct – 1 Nov 2026", race: "1 Novembre 2026" },
        sprint: false, status: "upcoming", isNew: false,
        result: null,
        schedule: [
            { day: "Vendredi", name: "Essais Libres 1", time: "19:30", type: "fp" },
            { day: "Vendredi", name: "Essais Libres 2", time: "23:00", type: "fp" },
            { day: "Samedi", name: "Essais Libres 3", time: "18:30", type: "fp" },
            { day: "Samedi", name: "Qualifications", time: "22:00", type: "quali" },
            { day: "Dimanche", name: "Course", time: "21:00", type: "race" }
        ]
    },
    {
        round: 21, name: "Grand Prix du Brésil", country: "Brésil", flag: "🇧🇷",
        circuit: "Autodromo José Carlos Pace", city: "São Paulo",
        dates: { full: "6 – 8 Novembre 2026", race: "8 Novembre 2026" },
        sprint: false, status: "upcoming", isNew: false,
        result: null,
        schedule: [
            { day: "Vendredi", name: "Essais Libres 1", time: "14:30", type: "fp" },
            { day: "Vendredi", name: "Essais Libres 2", time: "18:00", type: "fp" },
            { day: "Samedi", name: "Essais Libres 3", time: "13:30", type: "fp" },
            { day: "Samedi", name: "Qualifications", time: "17:00", type: "quali" },
            { day: "Dimanche", name: "Course", time: "18:00", type: "race" }
        ]
    },
    {
        round: 22, name: "Grand Prix de Las Vegas", country: "États-Unis", flag: "🇺🇸",
        circuit: "Las Vegas Strip Circuit", city: "Las Vegas",
        dates: { full: "19 – 21 Novembre 2026", race: "21 Novembre 2026" },
        sprint: false, status: "upcoming", isNew: false,
        result: null,
        schedule: [
            { day: "Vendredi", name: "Essais Libres 1", time: "04:30", type: "fp" },
            { day: "Vendredi", name: "Essais Libres 2", time: "08:00", type: "fp" },
            { day: "Samedi", name: "Essais Libres 3", time: "04:30", type: "fp" },
            { day: "Samedi", name: "Qualifications", time: "08:00", type: "quali" },
            { day: "Dimanche", name: "Course", time: "07:00", type: "race" }
        ]
    },
    {
        round: 23, name: "Grand Prix du Qatar", country: "Qatar", flag: "🇶🇦",
        circuit: "Lusail International Circuit", city: "Lusail",
        dates: { full: "27 – 29 Novembre 2026", race: "29 Novembre 2026" },
        sprint: false, status: "upcoming", isNew: false,
        result: null,
        schedule: [
            { day: "Vendredi", name: "Essais Libres 1", time: "13:30", type: "fp" },
            { day: "Vendredi", name: "Essais Libres 2", time: "17:00", type: "fp" },
            { day: "Samedi", name: "Essais Libres 3", time: "13:30", type: "fp" },
            { day: "Samedi", name: "Qualifications", time: "17:00", type: "quali" },
            { day: "Dimanche", name: "Course", time: "16:00", type: "race" }
        ]
    },
    {
        round: 24, name: "Grand Prix d'Abu Dhabi", country: "Émirats Arabes Unis", flag: "🇦🇪",
        circuit: "Yas Marina Circuit", city: "Abu Dhabi",
        dates: { full: "4 – 6 Décembre 2026", race: "6 Décembre 2026" },
        sprint: false, status: "upcoming", isNew: false,
        result: null,
        schedule: [
            { day: "Vendredi", name: "Essais Libres 1", time: "11:30", type: "fp" },
            { day: "Vendredi", name: "Essais Libres 2", time: "15:00", type: "fp" },
            { day: "Samedi", name: "Essais Libres 3", time: "11:30", type: "fp" },
            { day: "Samedi", name: "Qualifications", time: "15:00", type: "quali" },
            { day: "Dimanche", name: "Course", time: "13:00", type: "race" }
        ]
    }
];