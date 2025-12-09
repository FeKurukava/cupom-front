// js/register.js

document.getElementById("register-form").addEventListener("submit", async (event) => {
    event.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const doc = document.getElementById("cpf_cnpj").value.replace(/\D/g, "");
    const senha = document.getElementById("senha").value.trim();
    const confirma = document.getElementById("confirma_senha").value.trim();

    if (senha !== confirma) {
        alert("As senhas não coincidem.");
        return;
    }

    if (doc.length !== 11 && doc.length !== 14) {
        alert("CPF ou CNPJ inválido.");
        return;
    }

    const body =
        doc.length === 11
            ? { cpfAssociado: doc, emailAssociado: email, nomAssociado: nome, senAssociado: senha }
            : { cnpjComercio: doc, emailComercio: email, nomComercio: nome, senComercio: senha };

    const endpoint =
        doc.length === 11
            ? "/auth/register/associado"
            : "/auth/register/comerciante";

    try {
        const response = await apiRequest(endpoint, {
            method: "POST",
            body: JSON.stringify(body),
        });

        alert("Cadastro realizado com sucesso!");
        window.location.href = "login.html";

    } catch (err) {
        console.error(err);
        alert(err.body || "Erro ao realizar cadastro.");
    }
});
