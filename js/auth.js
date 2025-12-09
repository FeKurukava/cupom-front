function setSession(token, userType, identifier) {
    if (!identifier) identifier = "";

    const docLimpo = identifier.replace(/\D/g, "");
    const tipo = (userType || "").toUpperCase();

    const usuario = { tipo };

    if (tipo === "ASSOCIADO") {
        usuario.cpf = docLimpo;
    } else if (tipo === "COMERCIANTE") {
        usuario.cnpj = docLimpo;
    }

    localStorage.setItem("authToken", token);
    localStorage.setItem("usuarioLogado", JSON.stringify(usuario));
}

function obterUsuarioLogado() {
    const dados = localStorage.getItem("usuarioLogado");
    if (!dados) return null;

    try {
        return JSON.parse(dados);
    } catch (e) {
        console.error("Erro ao ler usuarioLogado:", e);
        return null;
    }
}

function clearSession() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("usuarioLogado");
}

function redirecionarPeloTipo() {
    const user = obterUsuarioLogado();
    if (!user) return;

    if (user.tipo === "ASSOCIADO") {
        window.location.href = "associado/home.html";
    } else if (user.tipo === "COMERCIANTE") {
        window.location.href = "comerciante/home.html";
    }
}

function checkAuthenticationAndRedirect() {
    if (window.location.protocol === "file:") {
        return;
    }

    const user = obterUsuarioLogado();
    const path = window.location.pathname;

    const isLoginPage =
        path.endsWith("index.html") ||
        path.endsWith("/") ||
        path.endsWith("login.html");

    const isProtectedPage =
        path.includes("/associado/") ||
        path.includes("/comerciante/");

    if (user && isLoginPage) {
        redirecionarPeloTipo();// js/auth.js

// Salva os dados básicos da sessão (token + tipo + cpf/cnpj)
        function setSession(token, userType, identifier) {
            if (!identifier) identifier = "";

            const docLimpo = identifier.replace(/\D/g, ""); // só números
            const tipo = (userType || "").toUpperCase();

            const usuario = { tipo };

            if (tipo === "ASSOCIADO") {
                usuario.cpf = docLimpo;
            } else if (tipo === "COMERCIANTE") {
                usuario.cnpj = docLimpo;
            }

            // guarda token e usuário logado
            localStorage.setItem("authToken", token);
            localStorage.setItem("usuarioLogado", JSON.stringify(usuario));
        }

// Lê o usuário logado do localStorage
        function obterUsuarioLogado() {
            const dados = localStorage.getItem("usuarioLogado");
            if (!dados) return null;

            try {
                return JSON.parse(dados);
            } catch (e) {
                console.error("Erro ao ler usuarioLogado:", e);
                return null;
            }
        }

// Limpa a sessão (para logout)
        function clearSession() {
            localStorage.removeItem("authToken");
            localStorage.removeItem("usuarioLogado");
        }

// Redireciona para a home correta conforme o tipo
        function redirecionarPeloTipo() {
            const user = obterUsuarioLogado();
            if (!user) return;

            if (user.tipo === "ASSOCIADO") {
                // partindo de /frontend/
                window.location.href = "associado/home.html";
            } else if (user.tipo === "COMERCIANTE") {
                window.location.href = "comerciante/home.html";
            }
        }

// Verifica se deve redirecionar ou bloquear acesso
        function checkAuthenticationAndRedirect() {
            // ⚠ IMPORTANTE: quando rodando como arquivo local (file://),
            // não vamos ficar redirecionando, senão atrapalha o desenvolvimento.
            if (window.location.protocol === "file:") {
                return;
            }

            const user = obterUsuarioLogado();
            const path = window.location.pathname;

            const isLoginPage =
                path.endsWith("index.html") ||
                path.endsWith("/") ||
                path.endsWith("login.html");

            const isProtectedPage =
                path.includes("/associado/") ||
                path.includes("/comerciante/");

            // Se está logado e está na página de login/index, manda pra home correta
            if (user && isLoginPage) {
                redirecionarPeloTipo();
                return;
            }

            // Se NÃO está logado e está numa página protegida, volta para login
            if (!user && isProtectedPage) {
                window.location.href = "../login.html";
            }
        }

// Executa a verificação automática em cada página que incluir auth.js
        document.addEventListener("DOMContentLoaded", () => {
            checkAuthenticationAndRedirect();
        });

        return;
    }

    if (!user && isProtectedPage) {
        window.location.href = "../login.html";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    checkAuthenticationAndRedirect();
});
