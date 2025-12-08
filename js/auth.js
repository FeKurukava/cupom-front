document.getElementById("formLogin")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = document.getElementById("id").value;
    const senha = document.getElementById("senha").value;

    const result = await apiPost("/auth/login", { id, senha });

    if (result.tipo === "ASSOCIADO") {
        localStorage.setItem("user", JSON.stringify(result));
        window.location.href = "associado/home.html";
    } else {
        localStorage.setItem("user", JSON.stringify(result));
        window.location.href = "comerciante/home.html";
    }
});
