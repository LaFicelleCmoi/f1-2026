# F1 Tracker - Saison 2026

Application web de suivi de la saison de Formule 1 2026 en temps reel.

## Fonctionnalites

- **Calendrier complet** — Toutes les courses de la saison avec statut en direct
- **Classements** — Pilotes et constructeurs avec barres de points animees et couleurs equipe
- **Resultats** — Course, Sprint, Qualifications avec anti-spoiler integre
- **Podium premium** — Affichage style F1 TV avec colonnes en escalier, couronne P1 et barre couleur equipe
- **Timer F1** — Compte a rebours avant la prochaine session (style Starting Grid avec damier)
- **Sprint dedié** — Vue separee pour suivre les week-ends sprint
- **Palmares** — Meilleurs pilotes et meilleures ecuries avec podiums
- **Import automatique** — Resultats importes depuis les APIs F1
- **Administration securisee** — Panel admin protege par Firebase Auth
- **Mode clair / sombre** — Theme toggle avec persistance
- **PWA** — Installable sur mobile comme une application native
- **Responsive** — Adapte a tous les ecrans

## Stack technique

| Technologie | Usage |
|-------------|-------|
| HTML / CSS / JavaScript | Frontend vanilla, zero framework |
| Firebase Realtime Database | Stockage des donnees courses et resultats |
| Firebase Auth | Authentification admin |
| GitHub Pages | Hebergement |

## APIs utilisees

### 1. Ergast API (mirror jolpi.ca)
- **URL de base** : `https://api.jolpi.ca/ergast/f1`
- **Authentification** : Aucune (acces libre)
- **Documentation** : https://ergast.com/mrd/
- **Utilisee pour** : Calendrier, resultats courses/qualifs/sprint, classements pilotes et constructeurs

### 2. OpenF1 API
- **URL de base** : `https://api.openf1.org/v1`
- **Authentification** : Aucune (acces libre)
- **Documentation** : https://openf1.org
- **Utilisee pour** : Resultats essais libres (EL1, EL2, EL3), Sprint Qualifying, donnees temps reel

## Saisons (2026, 2027…)

Le site gère plusieurs saisons sans dupliquer le code. Un sélecteur dans l'en-tête
permet de passer d'une saison à l'autre à tout moment.

| Fichier | Rôle |
|---------|------|
| `seasons.js` | **Configuration centrale** : saison par défaut, saisons disponibles (activables), bascule automatique facultative, mémorisation du choix |
| `data.js` | Référentiel commun (couleurs/logos d'écuries, alias d'API, continents) |
| `data-2026.js`, `data-2027.js` | Données propres à chaque saison (calendrier, pilotes, écuries, barème) |
| `tools/build-season-data.mjs` | Génère `data-AAAA.js` depuis le calendrier officiel (OpenF1) |

- **Choix de la saison** : `?season=AAAA` dans l'URL > choix mémorisé (`localStorage` `f1-season`) > bascule automatique (si activée) > `defaultSeason`.
- **Lien direct** : `index.html?season=2027#standings` (l'onglet est dans le `#`).
- **Données séparées** : résultats Firebase dans `f1_results_AAAA`, prédictions dans `f1-predictions-AAAA`, APIs (Jolpica, ESPN, OpenF1) interrogées pour l'année active. Les résultats 2026 ne sont jamais touchés par une autre saison.
- **Informations non confirmées** : horaires `time: null` → « À confirmer » ; plateau vide → classements et prédictions affichent « Pilotes et écuries à confirmer ». Aucun résultat fictif.

### Mettre à jour 2027 / ajouter une saison

```bash
# Horaires officiels annoncés : régénérer le calendrier avec les heures
node tools/build-season-data.mjs 2027 --with-times
```

- Plateau officialisé : renseigner `drivers` / `constructors` dans `data-2027.js` (et `driverApiIds`, `teamColors`… dans `data.js` pour les nouveaux venus), puis passer `status.drivers` à `"confirmed"`. Le script conserve ces saisies quand il est relancé.
- Nouvelle saison : `node tools/build-season-data.mjs 2028`, ajouter `data-2028.js` dans `index.html`, `sw.js` et `.github/workflows/build-apk.yml`, puis `2028: { enabled: true }` dans `seasons.js`.
- Basculer tout le monde sur une saison : changer `defaultSeason`, ou activer `autoSwitch` avec une date.

### Tests

```bash
node --test tests/*.test.mjs
```

## Installation locale

```bash
git clone https://github.com/LaFicelleCmoi/f1-2026.git
cd f1-2026
# Ouvrir index.html dans un navigateur
```

Aucune dependance a installer — le projet fonctionne en vanilla JS.

## Licence

Projet personnel — donnees F1 sous licence FOM/FIA.
