function salvarUsuarioLogado(dados) {
    localStorage.setItem("usuario", JSON.stringify(dados));
}

function obterUsuarioLogado() {
    try {
        return JSON.parse(localStorage.getItem("usuario"));
    } catch {
        return null;
    }
}

function fazerLogout() {
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
    window.location.href = "login.html";
}

function limparDocumento(cpfCnpj) {
    if (cpfCnpj == null) return null;
    return cpfCnpj.replace(/[^0-9]/g, '');
}