function obterUsuarioLogado() {
    try {
        const dados = sessionStorage.getItem("usuario");
        return dados ? JSON.parse(dados) : null;
    } catch (e) {
        console.error("Erro ao ler usuário do sessionStorage:", e);
        return null;
    }
}

function redirecionarPeloTipo() {
    const user = obterUsuarioLogado();
    if (!user) return;

    const path = window.location.pathname;
    const base = path.includes("/frontend/") ? "" : "frontend/";

    if (String(user.tipo).toUpperCase() === "ASSOCIADO") {
        window.location.href = base + "associado/home.html";
    } else if (String(user.tipo).toUpperCase() === "COMERCIANTE") {
        window.location.href = base + "comerciante/home.html";
    }
}

function checkAuthenticationAndRedirect() {
    if (window.location.protocol === "file:") return;

    const user = obterUsuarioLogado();
    const path = window.location.pathname;

    const isLoginPage =
        path.endsWith("index.html") ||
        path.endsWith("/") ||
        path.endsWith("/frontend/login.html") ||
        path.endsWith("login.html");

    const isProtectedPage =
        path.includes("/frontend/associado/") ||
        path.includes("/frontend/comerciante/");

    if (user && isLoginPage) {
        redirecionarPeloTipo();
        return;
    }

    if (!user && isProtectedPage) {
        window.location.href = "../login.html";
        return;
    }

    if (user && isProtectedPage) {
        const tipo = String(user.tipo).toUpperCase();
        const emAssociado = path.includes("/frontend/associado/");
        const emComerciante = path.includes("/frontend/comerciante/");

        if (tipo === "ASSOCIADO" && emComerciante) {
            window.location.href = "../associado/home.html";
            return;
        }
        if (tipo === "COMERCIANTE" && emAssociado) {
            window.location.href = "../comerciante/home.html";
            return;
        }
    }
}

function fazerLogout() {
    try {
        sessionStorage.removeItem("usuario");
        sessionStorage.removeItem("token");
    } catch (e) {
    }

    const path = window.location.pathname;
    const isInsideFrontend = path.includes("/frontend/");
    const isInsideProtected = path.includes("/frontend/associado/") || path.includes("/frontend/comerciante/");

    if (isInsideProtected) {
        window.location.href = "../login.html";
        return;
    }
    if (isInsideFrontend) {
        window.location.href = "login.html";
        return;
    }
    window.location.href = "frontend/login.html";
}

document.addEventListener("DOMContentLoaded", function () {
    checkAuthenticationAndRedirect();
});
