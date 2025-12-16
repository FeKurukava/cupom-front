function obterUsuarioLogado() {
try {
const dados = sessionStorage.getItem("usuario");
return dados ? JSON.parse(dados) : null;
} catch {
return null;
}
}

function salvarUsuarioLogado(dados) {
sessionStorage.setItem("usuario", JSON.stringify(dados));
}

function fazerLogout() {
try {
sessionStorage.removeItem("usuario");
sessionStorage.removeItem("token");
} catch (e) {}

window.location.href = "/frontend/login.html";
}
