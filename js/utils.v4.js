function limparDocumento(cpfCnpj) {
    if (cpfCnpj == null) return null;
    return cpfCnpj.replace(/[^0-9]/g, '');
}

function maskCPF_CNPJ(value){
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
}
window.maskCPF_CNPJ = maskCPF_CNPJ;


function maskPhoneNumber(value) {
    if (!value) return "";
    let v = value.replace(/\D/g, "");

    if (v.length >= 11) {
        v = v.slice(0, 11);
        return v.replace(/^(\d{2})(\d)(\d{4})(\d{4})$/, "($1) $2$3-$4");
    }

    if (v.length >= 10) {
        v = v.slice(0, 10);
        return v.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
    }

    if (v.length >= 6) {
        return v.replace(/^(\d{2})(\d{4,5})/, "($1) $2");
    }

    if (v.length >= 3) {
        return v.replace(/^(\d{2})(\d)/, "($1) $2");
    }

    if (v.length >= 1) {
        return v.replace(/^(\d*)/, "($1");
    }

    return v;
}

window.maskPhoneNumber = maskPhoneNumber;

