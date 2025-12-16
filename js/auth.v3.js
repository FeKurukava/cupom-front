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
    const tipo = String(user.tipo).toUpperCase();

    if (tipo === "ASSOCIADO" && !path.includes("/frontend/associado/")) {
        window.location.href = "/frontend/associado/home.html";
    }

    if (tipo === "COMERCIANTE" && !path.includes("/frontend/comerciante/")) {
        window.location.href = "/frontend/comerciante/home.html";
    }
}


function checkAuthenticationAndRedirect() {
    if (window.location.protocol === "file:") return;

    const user = obterUsuarioLogado();
    const path = window.location.pathname;

    const isLoginPage =
        path.endsWith("index.html") ||
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
        window.location.href = getLoginUrl();
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

function getLoginUrl() {
    if (window.location.protocol === "http:" || window.location.protocol === "https:") {
        return window.location.origin + "/frontend/login.html";
    }
    return "frontend/login.html";
}


function fazerLogout() {
    try {
        sessionStorage.removeItem("usuario");
        sessionStorage.removeItem("token");
    } catch (e) {
    }

    window.location.href = getLoginUrl();
}

document.addEventListener("DOMContentLoaded", function () {
    checkAuthenticationAndRedirect();
});
