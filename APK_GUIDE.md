# 📱 Générer un APK Android — F1 2026 Race Hub

Le site est une **PWA complète** (manifest + Service Worker + display standalone). Il y a 3 méthodes pour en faire un APK Android, classées de la plus simple à la plus avancée.

---

## ✅ Prérequis communs

1. **Le site doit être déployé en HTTPS** (Firebase Hosting, Cloudflare Pages, etc.)
2. **Générer les icônes PNG** :
   - Ouvre `tools/generate-icons.html` dans ton navigateur (depuis le projet, pas en `file://`)
   - Clique sur les 3 boutons de téléchargement
   - Place `icon-192.png`, `icon-512.png`, `icon-maskable.png` dans `icons/`
   - Commit + push
3. Vérifie que `manifest.json` est bien servi avec `Content-Type: application/manifest+json` (Cloudflare Pages le fait par défaut)

---

## 🥇 Méthode 1 : PWABuilder (recommandée — 5 min, sans installation)

**Avantage :** zéro install, web tool gratuit Microsoft, génère un APK signé prêt pour le Play Store.

### Étapes :

1. Va sur **https://www.pwabuilder.com/**
2. Colle l'URL de ton site déployé (ex : `https://f1-calandar.web.app`)
3. Clique **Start**
4. PWABuilder analyse ton manifeste/SW et donne un score
   - Si des warnings apparaissent → corrige (icônes manquantes, etc.)
5. Clique **Package for Stores** → **Android**
6. Renseigne :
   - **Package ID** : `com.tonusername.f1race2026` (format reverse DNS)
   - **App name** : `F1 2026 Race Hub`
   - **Launcher name** : `F1 2026`
   - **Display mode** : `Standalone`
   - **Signing key** : `Generate new` (PWABuilder fait tout)
7. Clique **Download**
8. Tu reçois un ZIP contenant :
   - `app-release-signed.apk` ← l'APK installable
   - `app-release-bundle.aab` ← pour le Play Store
   - `signing.keystore` + `key info` ← **GARDE-LE PRÉCIEUSEMENT** (perdu = impossible de mettre à jour l'app)

### Installer l'APK sur ton téléphone

1. Sur Android, **Paramètres → Sécurité → Sources inconnues** → activer pour ton navigateur
2. Transfère l'APK (mail, USB, Google Drive)
3. Ouvre le fichier → installer

⚠️ **Limite TWA** : l'APK ouvre ton site dans une WebView Chrome. Il faut donc qu'Internet fonctionne. Le SW assure le mode offline pour le contenu déjà chargé.

---

## 🥈 Méthode 2 : Bubblewrap (CLI Google, plus de contrôle)

**Avantage :** local, scriptable, version la plus récente du moteur TWA.

### Prérequis

- Node.js ≥ 14
- JDK 17 (Java) — `sudo apt install openjdk-17-jdk` sur Linux/WSL
- Android SDK (Bubblewrap installe automatiquement Android SDK Command Line Tools)

### Commandes

```bash
# Installer une fois
npm install -g @bubblewrap/cli

# Initialiser depuis ton manifest
bubblewrap init --manifest=https://TON-DOMAINE/manifest.json

# Construire l'APK
bubblewrap build
```

Bubblewrap pose des questions interactives (package ID, key store, etc.) puis sort un APK signé dans `app-release-signed.apk`.

Pour MAJ ensuite :
```bash
bubblewrap update
bubblewrap build
```

---

## 🥉 Méthode 3 : Capacitor (bundle hors ligne complet)

**Avantage :** les fichiers sont **embarqués dans l'APK** → fonctionne sans connexion (sauf Firebase et APIs).
**Désavantage :** chaque MAJ du site = nouvelle build APK à distribuer.

### Setup

```bash
npm install -g @ionic/cli
npm init -y
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "F1 2026" com.tonusername.f1race2026 --web-dir=.
npx cap add android
npx cap copy
npx cap open android
```

→ Android Studio s'ouvre, tu cliques **Build → Build APK**.

---

## 🔐 Validation Digital Asset Links (TWA)

Pour que l'APK TWA n'affiche pas la barre URL Chrome (mode "fullscreen véritable"), il faut associer le domaine au package ID :

1. PWABuilder te donne le contenu de `assetlinks.json`
2. Crée le fichier `.well-known/assetlinks.json` à la racine de ton hosting
3. Vérifie qu'il est accessible via `https://TON-DOMAINE/.well-known/assetlinks.json`
4. Réinstalle l'APK → le bandeau Chrome disparaît

---

## 🛡️ Adaptations déjà faites pour l'APK

- ✅ **anti-inspect.js** désactivé en mode standalone (sinon faux positifs dans la WebView)
- ✅ **manifest.json** : `display_override`, `id`, `scope`, `categories`, `shortcuts`
- ✅ **Service Worker** : stratégie réseau-first pour HTML, stale-while-revalidate pour le reste
- ✅ Pass-through pour Firebase, Jolpica, OpenF1, TheSportsDB, Chart.js CDN

---

## 📋 Checklist avant de générer l'APK

- [ ] Site déployé en HTTPS
- [ ] `manifest.json` accessible publiquement
- [ ] Les 3 PNG d'icônes (`icon-192.png`, `icon-512.png`, `icon-maskable.png`) sont dans `icons/`
- [ ] Le SW s'installe correctement (DevTools → Application → Service Workers : *activated*)
- [ ] Score Lighthouse PWA ≥ 80 (`chrome://lighthouse` → audit PWA)

Quand tout est ✅, lance PWABuilder.
