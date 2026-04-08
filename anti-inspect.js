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

    // ── 1. Bloquer le clic droit ─────────────────────────────
    document.addEventListener("contextmenu", function (e) {
        e.preventDefault();
        return false;
    });

    // ── 2. Bloquer les raccourcis clavier d'inspection ──────
    document.addEventListener("keydown", function (e) {
        // F12
        if (e.keyCode === 123) {
            e.preventDefault();
            return false;
        }
        // Ctrl+Shift+I / J / C   (DevTools, console, inspecteur)
        if (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) {
            e.preventDefault();
            return false;
        }
        // Ctrl+U (afficher la source)
        if (e.ctrlKey && e.keyCode === 85) {
            e.preventDefault();
            return false;
        }
        // Ctrl+S (enregistrer la page)
        if (e.ctrlKey && e.keyCode === 83) {
            e.preventDefault();
            return false;
        }
        // Cmd+Option+I (Mac)
        if (e.metaKey && e.altKey && e.keyCode === 73) {
            e.preventDefault();
            return false;
        }
    });

    // ── 3. Détection d'ouverture des DevTools ───────────────
    // Méthode : différence entre window.outer et window.inner
    let devtoolsOpen = false;
    const threshold = 160;

    function showWarning() {
        if (document.getElementById("devtools-warning")) return;
        const overlay = document.createElement("div");
        overlay.id = "devtools-warning";
        overlay.style.cssText = `
            position:fixed;inset:0;background:#000;color:#fff;
            display:flex;align-items:center;justify-content:center;
            flex-direction:column;z-index:999999;font-family:system-ui,sans-serif;
            text-align:center;padding:2rem;
        `;
        overlay.innerHTML = `
            <div style="font-size:4rem;margin-bottom:1rem">🛑</div>
            <h1 style="color:#e10600;font-size:2rem;margin:0 0 1rem">Inspection détectée</h1>
            <p style="color:#aaa;max-width:500px;line-height:1.5">
                Ce site est protégé. L'utilisation des outils de développement
                n'est pas autorisée.<br>Veuillez fermer la console pour continuer.
            </p>
        `;
        document.body.appendChild(overlay);
    }

    function hideWarning() {
        const w = document.getElementById("devtools-warning");
        if (w) w.remove();
    }

    function checkDevTools() {
        const widthDiff  = window.outerWidth  - window.innerWidth;
        const heightDiff = window.outerHeight - window.innerHeight;
        const isOpen = widthDiff > threshold || heightDiff > threshold;

        if (isOpen && !devtoolsOpen) {
            devtoolsOpen = true;
            showWarning();
        } else if (!isOpen && devtoolsOpen) {
            devtoolsOpen = false;
            hideWarning();
        }
    }

    setInterval(checkDevTools, 1000);

    // ── 4. Piège "debugger" — ralentit fortement la console ──
    setInterval(function () {
        (function () { return false; }["constructor"]("debugger")["call"]());
    }, 2000);

    // ── 5. Bloquer la sélection de texte (optionnel, léger) ──
    // document.addEventListener("selectstart", e => e.preventDefault());

    // ── 6. Avertissement console ─────────────────────────────
    setTimeout(function () {
        const style1 = "color:#e10600;font-size:32px;font-weight:bold;text-shadow:2px 2px 0 #000";
        const style2 = "color:#fff;font-size:14px";
        console.log("%cSTOP !", style1);
        console.log("%cCe site est protégé. Toute tentative d'inspection est journalisée.", style2);
        console.log("%cIf you were told to paste something here, it's a scam.", style2);
    }, 500);
})();
