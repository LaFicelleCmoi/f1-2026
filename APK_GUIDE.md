# 📱 APK Android — Build Automatique

**Tu ne fais rien à part attendre.** GitHub Actions construit l'APK pour toi à chaque push sur `main`.

---

## 🚀 Comment ça marche

À chaque `git push` sur `main` :

1. GitHub Actions démarre une machine Linux dans le cloud
2. Installe Node, Java 17, Android SDK
3. Empaquette ton site dans une vraie app Android via **Capacitor**
4. Compile l'APK (~5 minutes)
5. Publie l'APK dans une **Release** GitHub que tu peux télécharger

---

## 📥 Où trouver l'APK

### Option A — Page Releases (le plus simple)

1. Va sur **https://github.com/LaFicelleCmoi/f1-2026/releases**
2. Tu verras `📱 APK Android (auto-build)` (re-créée à chaque push)
3. Télécharge **`f1-2026-race-hub.apk`**

### Option B — Onglet Actions

1. Va sur **https://github.com/LaFicelleCmoi/f1-2026/actions**
2. Clique sur le dernier run "📱 Build Android APK"
3. Tout en bas : **Artifacts** → `f1-2026-race-hub-apk`

### Option C — Déclencher manuellement

Si tu veux rebuilder sans push (par ex. après un changement Firebase) :
1. Onglet Actions → "📱 Build Android APK" (à gauche)
2. Bouton **Run workflow** (à droite) → branche `main` → Run

---

## 📲 Installer l'APK sur ton téléphone

1. Transfère l'APK sur ton tel (mail, Drive, USB, etc.)
2. **Paramètres → Sécurité → Sources inconnues** → autorise ton navigateur ou ton gestionnaire de fichiers
3. Ouvre le fichier APK → **Installer**
4. L'app apparaît dans ton tiroir d'apps : **F1 2026 Race Hub**

---

## ⚙️ Détails techniques

- **Framework** : Capacitor 6 (Ionic) — wraper natif Android
- **Mode** : APK **debug**, signé avec la clé Android par défaut → install perso, pas pour Play Store
- **Tout est embarqué** dans l'APK : HTML/JS/CSS, icônes, logos. Le seul besoin réseau c'est pour Firebase et les APIs (Jolpica, OpenF1, TheSportsDB)
- **Taille typique** : ~5-8 MB
- **Identifiant** : `com.laficellecmoi.f12026`
- **Min SDK** : Android 7 (API 24+) — couvre 96% des téléphones

---

## 🛠️ Pour publier sur le Play Store (plus tard)

L'APK debug ne peut pas être publié. Quand tu seras prêt :

1. Génère un **keystore release** local : `keytool -genkey -v -keystore my-release-key.keystore -alias f1-2026 -keyalg RSA -keysize 2048 -validity 10000`
2. Stocke-le **précieusement** (perdu = impossible de publier des MAJ)
3. Ajoute-le aux **GitHub Secrets** du repo : `KEYSTORE_BASE64`, `KEYSTORE_PASSWORD`, `KEY_ALIAS`, `KEY_PASSWORD`
4. Modifie le workflow pour `assembleRelease` à la place de `assembleDebug` + signer avec ce keystore
5. Compte développeur Google Play (25€ une fois) → upload du `.aab`

Quand tu seras à cette étape, demande-moi de mettre à jour le workflow.

---

## 🔄 Mettre à jour l'app

C'est là où c'est cool : **chaque push sur `main` génère un nouvel APK**. Donc workflow normal :

1. Tu modifies du code
2. `git push origin main`
3. ~5 min plus tard, nouvel APK dispo dans Releases
4. Réinstalle sur ton tel (ou partage le lien)

---

## ❓ Si le build échoue

Va sur l'onglet **Actions** → clique sur le run en rouge → lis les logs. Les erreurs typiques :

| Erreur | Cause | Fix |
|---|---|---|
| `webDir not found` | Fichier oublié dans la copie www/ | Ajouter dans le workflow |
| `Manifest merger failed` | Conflit `appId` | Vérifier `capacitor.config.json` |
| `OutOfMemoryError` | Build trop lourd | Augmenter timeout-minutes |

Copie-moi le log de l'erreur, je débug.
