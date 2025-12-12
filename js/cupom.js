document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("cupom-form");
    const msg = document.getElementById("mensagem-cupom");

    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const titulo = document.getElementById("titulo-cupom").value.trim();
        const inicio = document.getElementById("inicio-cupom").value;
        const fim = document.getElementById("fim-cupom").value;
        const desconto = document.getElementById("desconto-cupom").value;
        const quantidade = document.getElementById("quantidade-cupom").value;

        if (!titulo || !inicio || !fim || !desconto || !quantidade) {
            msg.textContent = "Preencha todos os campos.";
            msg.style.color = "var(--color-error)";
            return;
        }

        const dataInicio = new Date(inicio);
        const dataFim = new Date(fim);
        if (dataInicio > dataFim) {
            msg.textContent = "A data de início não pode ser maior que a data de término.";
            msg.style.color = "var(--color-error)";
            return;
        }

        const usuario = typeof obterUsuarioLogado === "function" ? obterUsuarioLogado() : null;
        const cnpj = usuario?.cnpj;

        console.log(cnpj, "cnpj")
        if (!cnpj) {
            msg.textContent = "Sessão expirada ou CNPJ não encontrado. Faça login novamente.";
            msg.style.color = "var(--color-error)";
            return;
        }

        try {
            await apiRequest("/cupons", {
                method: "POST",
                body: JSON.stringify({
                    titulo: titulo,
                    dataInicio: inicio,
                    dataFim: fim,
                    percentualDesconto: Number(desconto),
                    quantidade: Number(quantidade),
                    cnpjComercio: cnpj
                })
            });

            msg.textContent = "Cupons gerados com sucesso!";
            msg.style.color = "var(--color-success)";
            form.reset();

        } catch (error) {
            console.error(error);
            msg.textContent = "Erro ao gerar cupom. Verifique os dados e tente novamente.";
            msg.style.color = "var(--color-error)";
        }
    });
});
