function obterUsuarioLogado() {
    localStorage.clear();
    try {
        const dados = localStorage.getItem("usuario");
        if (dados) return JSON.parse(dados);

        const legado = localStorage.getItem("usuarioLogado");
        return legado ? JSON.parse(legado) : null;
    } catch (e) {
        console.error("Erro ao ler usuário do localStorage:", e);
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

document.addEventListener("DOMContentLoaded", function () {
    checkAuthenticationAndRedirect();
});
