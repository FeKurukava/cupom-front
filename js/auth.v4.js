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
        path === "/frontend/" ||
        path === "/frontend/login.html" ||
        path.endsWith("/login.html");

    const isAssociadoPage = path.includes("/frontend/associado/");
    const isComerciantePage = path.includes("/frontend/comerciante/");
    const isProtectedPage = isAssociadoPage || isComerciantePage;

    if (isLoginPage) {
        if (user) {
            redirecionarPeloTipo();
        }
        return;
    }

    if (isProtectedPage && !user) {
        window.location.href = getLoginUrl();
        return;
    }

    if (isProtectedPage && user) {
        const tipo = String(user.tipo).toUpperCase();

        if (tipo === "ASSOCIADO" && isComerciantePage) {
            window.location.href = "/frontend/associado/home.html";
            return;
        }

        if (tipo === "COMERCIANTE" && isAssociadoPage) {
            window.location.href = "/frontend/comerciante/home.html";
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
