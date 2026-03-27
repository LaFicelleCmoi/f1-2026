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

## Installation locale

```bash
git clone https://github.com/LaFicelleCmoi/f1-2026.git
cd f1-2026
# Ouvrir index.html dans un navigateur
```

Aucune dependance a installer — le projet fonctionne en vanilla JS.

## Licence

Projet personnel — donnees F1 sous licence FOM/FIA.
