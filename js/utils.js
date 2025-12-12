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

export const maskCPF_CNPJ = (value) => {
    if (!value) return '';
    const numbers = String(value).replace(/\D/g, '');

    if (numbers.length <= 11) {
        return numbers
            .replace(/^(\d{3})(\d)/, '$1.$2')
            .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
            .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4')
            .slice(0, 14); // CPF: 000.000.000-00
    }

    return numbers
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3/$4')
        .replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, '$1.$2.$3/$4-$5')
        .slice(0, 18); // CNPJ: 00.000.000/0000-00
};