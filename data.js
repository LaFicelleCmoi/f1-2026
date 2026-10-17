// ============================================================
// 📚 RÉFÉRENTIEL COMMUN À TOUTES LES SAISONS
// ============================================================
// Couleurs/logos d'écuries, alias d'API, identifiants Jolpica des pilotes,
// continents. Les données propres à une saison (calendrier, pilotes, écuries
// engagées, barème) sont dans data-AAAA.js.

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

// Mapping pilote actuel → identifiant API Jolpica/Ergast (pour stats carrière)
const driverApiIds = {
    "Lando Norris":            "norris",
    "Oscar Piastri":           "piastri",
    "George Russell":          "russell",
    "Andrea Kimi Antonelli":   "antonelli",
    "Max Verstappen":          "max_verstappen",
    "Isack Hadjar":            "hadjar",
    "Charles Leclerc":         "leclerc",
    "Lewis Hamilton":          "hamilton",
    "Carlos Sainz":            "sainz",
    "Alex Albon":              "albon",
    "Liam Lawson":             "lawson",
    "Arvid Lindblad":          "lindblad",
    "Fernando Alonso":         "alonso",
    "Lance Stroll":            "stroll",
    "Esteban Ocon":            "ocon",
    "Oliver Bearman":          "bearman",
    "Nico Hülkenberg":         "hulkenberg",
    "Gabriel Bortoleto":       "bortoleto",
    "Pierre Gasly":            "gasly",
    "Franco Colapinto":        "colapinto",
    "Sergio Pérez":            "perez",
    "Valtteri Bottas":         "bottas"
};

const countryContinent = {
    "Australie": "Asie-Océanie", "Chine": "Asie-Océanie", "Japon": "Asie-Océanie",
    "Singapour": "Asie-Océanie", "Malaisie": "Asie-Océanie", "Turquie": "Europe", "Bahreïn": "Moyen-Orient", "Arabie Saoudite": "Moyen-Orient",
    "Qatar": "Moyen-Orient", "Émirats Arabes Unis": "Moyen-Orient", "Azerbaïdjan": "Moyen-Orient",
    "États-Unis": "Amériques", "Canada": "Amériques", "Mexique": "Amériques", "Brésil": "Amériques",
    "Monaco": "Europe", "Espagne": "Europe", "Autriche": "Europe", "Royaume-Uni": "Europe",
    "Belgique": "Europe", "Hongrie": "Europe", "Pays-Bas": "Europe", "Italie": "Europe",
    "Portugal": "Europe"
};

