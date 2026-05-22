// ============================================================
// 🛡️ Anti-inspection (dissuasif uniquement — pas une vraie sécurité)
// ============================================================
// NOTE : ces protections sont contournables (désactiver JS, proxy,
// view-source:). Elles servent à décourager les curieux occasionnels.
// Aucune donnée sensible ne doit dépendre de ce script.

(function () {
    "use strict";

    // Désactivé sur localhost pour ne pas bloquer le développement
    if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
        return;
    }

    // Désactivé dans une PWA / TWA installée (Android APK, iOS standalone, desktop installé)
    const isStandalone =
        (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) ||
        (window.matchMedia && window.matchMedia("(display-mode: minimal-ui)").matches) ||
        window.navigator.standalone === true ||
        document.referrer.startsWith("android-app://");
    if (isStandalone) return;

    // Désactivable via ?dev=1 OU flag sessionStorage (persistant pendant la session)
    try {
        const params = new URLSearchParams(location.search);
        if (params.get("dev") === "1") {
            sessionStorage.setItem("f1-dev-mode", "1");
        }
        if (sessionStorage.getItem("f1-dev-mode") === "1") {
            console.log("%c🛠 Mode dev — anti-inspect désactivé", "color:#0a0;font-weight:bold;font-size:14px");
            return;
        }
    } catch (e) {}

    // Flag central : peut être basculé à true plus tard quand l'admin est détecté
    let bypassed = false;

    // ── 1. Bloquer le clic droit ─────────────────────────────
    document.addEventListener("contextmenu", function (e) {
        if (bypassed) return;
        e.preventDefault();
        return false;
    });

    // ── 2. Bloquer les raccourcis clavier d'inspection ──────
    document.addEventListener("keydown", function (e) {
        if (bypassed) return;
        if (e.keyCode === 123) { e.preventDefault(); return false; }
        if (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) {
            e.preventDefault(); return false;
        }
        if (e.ctrlKey && e.keyCode === 85) { e.preventDefault(); return false; }
        if (e.ctrlKey && e.keyCode === 83) { e.preventDefault(); return false; }
        if (e.metaKey && e.altKey && e.keyCode === 73) { e.preventDefault(); return false; }
    });

    // ── 3. Détection d'ouverture des DevTools ───────────────
    let devtoolsOpen = false;
    const threshold = 160;
    let devToolsInterval = null;
    let debuggerInterval = null;

    function showWarning() {
        if (document.getElementById("devtools-warning")) return;
        const overlay = document.createElement("div");
        overlay.id = "devtools-warning";
        overlay.style.cssText = "position:fixed;inset:0;background:#000;color:#fff;display:flex;align-items:center;justify-content:center;flex-direction:column;z-index:999999;font-family:system-ui,sans-serif;text-align:center;padding:2rem;";
        overlay.innerHTML = `
            <div style="font-size:4rem;margin-bottom:1rem">🛑</div>
            <h1 style="color:#e10600;font-size:2rem;margin:0 0 1rem">Inspection détectée</h1>
            <p style="color:#aaa;max-width:500px;line-height:1.5">
                Ce site est protégé. L'utilisation des outils de développement
                n'est pas autorisée.<br>Veuillez fermer la console pour continuer.
            </p>
            <p style="color:#666;font-size:0.85rem;margin-top:2rem">
                Si vous êtes l'admin : ajoutez <code>?dev=1</code> à l'URL pour désactiver.
            </p>
        `;
        document.body.appendChild(overlay);
    }
    function hideWarning() {
        const w = document.getElementById("devtools-warning");
        if (w) w.remove();
    }
    function checkDevTools() {
        if (bypassed) return;
        const widthDiff  = window.outerWidth  - window.innerWidth;
        const heightDiff = window.outerHeight - window.innerHeight;
        const isOpen = widthDiff > threshold || heightDiff > threshold;
        if (isOpen && !devtoolsOpen) { devtoolsOpen = true; showWarning(); }
        else if (!isOpen && devtoolsOpen) { devtoolsOpen = false; hideWarning(); }
    }
    devToolsInterval = setInterval(checkDevTools, 1000);

    // ── 4. Piège "debugger" ─────────────────────────────────
    debuggerInterval = setInterval(function () {
        if (bypassed) return;
        (function () { return false; }["constructor"]("debugger")["call"]());
    }, 2000);

    // ── 5. Avertissement console ────────────────────────────
    setTimeout(function () {
        if (bypassed) return;
        console.log("%cSTOP !", "color:#e10600;font-size:32px;font-weight:bold;text-shadow:2px 2px 0 #000");
        console.log("%cSi vous êtes l'admin et vous bloquez vous-même : ajoutez ?dev=1 à l'URL.", "color:#ffa;font-size:14px");
    }, 500);

    // ── 6. Auto-bypass quand l'admin Firebase se connecte ───
    // Vérifie périodiquement la variable globale isAdmin (settée par app.js)
    const adminWatch = setInterval(function () {
        if (typeof window.isAdmin !== "undefined" && window.isAdmin === true) {
            bypassed = true;
            sessionStorage.setItem("f1-dev-mode", "1"); // persiste pour cette session
            clearInterval(devToolsInterval);
            clearInterval(debuggerInterval);
            hideWarning();
            console.log("%c🛠 Admin connecté — anti-inspect désactivé", "color:#0f0;font-weight:bold;font-size:14px");
            clearInterval(adminWatch);
        }
    }, 1000);
})();
