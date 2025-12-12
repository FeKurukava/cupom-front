document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("register-use-btn");
  const input = document.getElementById("cupom-code");
  if (!btn || !input) return;
  btn.addEventListener("click", async () => {
    const code = (input.value || "").trim();
    if (!code) {
      alert("Informe o código do cupom.");
      input.focus();
      return;
    }
    btn.disabled = true;
    try {
      await apiRequest(`/comercio/usar-cupom?numCupom=${encodeURIComponent(code)}`, {
        method: "POST"
      });
      alert("Uso do cupom registrado.");
      input.value = "";
    } catch (e) {
      const msg = (e && (e.body?.message || e.body?.error || e.body?.detail)) || "Falha ao conectar ao servidor.";
      alert(msg);
    } finally {
      btn.disabled = false;
    }
  });
});
