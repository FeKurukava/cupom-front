
(function () {
    "use strict";
    const API_BASE = "http://localhost:8080";

    function cleanNumber(v){ return v ? v.replace(/\D/g, "") : ""; }

    function showAppMessage(text, type = "success", timeout = 4000) {
        const el = document.getElementById("app-message");
        if (!el) return;
        el.className = `app-message ${type}`;
        el.textContent = text;
        el.classList.remove("hidden");
        if (timeout > 0) {
            setTimeout(() => {
                el.classList.add("hidden");
            }, timeout);
        }
    }

    function isValidCPF(strCPF){
        const cpf = cleanNumber(strCPF);
        if(!cpf || cpf.length!==11) return false;
        if(/^(\d)\1+$/.test(cpf)) return false;
        let sum=0, rest;
        for(let i=1;i<=9;i++) sum += parseInt(cpf.substring(i-1,i)) * (11-i);
        rest = (sum*10) % 11;
        if(rest===10 || rest===11) rest=0;
        if(rest !== parseInt(cpf.substring(9,10))) return false;
        sum=0;
        for(let i=1;i<=10;i++) sum += parseInt(cpf.substring(i-1,i)) * (12-i);
        rest = (sum*10) % 11;
        if(rest===10 || rest===11) rest=0;
        if(rest !== parseInt(cpf.substring(10,11))) return false;
        return true;
    }

    function isValidCNPJ(cnpj){
        const v = cleanNumber(cnpj);
        if(!v || v.length!==14) return false;
        if(/^(\d)\1+$/.test(v)) return false;
        const calc = (t) => {
            let mul=2, sum=0;
            for(let i=t;i>=0;i--){
                sum += parseInt(v.charAt(i)) * mul;
                mul = (mul === 9) ? 2 : mul + 1;
            }
            const res = sum % 11;
            return res < 2 ? 0 : 11 - res;
        };
        const d1 = calc(11), d2 = calc(12);
        return d1 === parseInt(v.charAt(12)) && d2 === parseInt(v.charAt(13));
    }

    function isValidEmail(email){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }

    function showError(id,msg){ const el=document.getElementById(id); if(!el) return; el.textContent=msg; el.style.display="block"; }
    function hideError(id){ const el=document.getElementById(id); if(!el) return; el.style.display="none"; }

    function maskCPF_CNPJ(v){
        const val = cleanNumber(v);
        if(val.length <= 11){
            return val.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, (m,a,b,c,d)=> a + (b?'.'+b:'') + (c?'.'+c:'') + (d?'-'+d:''));
        } else {
            return val.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2})/, (m,a,b,c,d,e)=> a + (b?'.'+b:'') + (c?'.'+c:'') + (d?'/'+d:'') + (e?'-'+e:''));
        }
    }
    function maskCEP(v){ return cleanNumber(v).slice(0,8); }
    function maskPhone(v){ return cleanNumber(v).slice(0,15); }

    // Removido fallback genérico; usar apiRequest definido em js/api.js

    function updateFormByTipo(tipo){
        const associado = document.getElementById("associado_fields");
        const comerciante = document.getElementById("comerciante_fields");
        const labelIdent = document.getElementById("label-identificador");
        if(tipo === "associado"){
            associado.classList.remove("hidden");
            comerciante.classList.add("hidden");
            labelIdent.textContent = "CPF";
            const cpfEl = document.getElementById("cpf_cnpj");
            if(cpfEl) cpfEl.placeholder = "CPF (apenas números)";
        } else {
            associado.classList.add("hidden");
            comerciante.classList.remove("hidden");
            labelIdent.textContent = "CNPJ";
            const cpfEl = document.getElementById("cpf_cnpj");
            if(cpfEl) cpfEl.placeholder = "CNPJ (apenas números)";
        }
        ["cpf_error","categoria_error"].forEach(hideError);
    }

    document.addEventListener("DOMContentLoaded", function () {
        try {
            const inputDoc = document.getElementById("cpf_cnpj");
            if(inputDoc){
                inputDoc.addEventListener("input", e=>{
                    const pos = e.target.selectionStart;
                    e.target.value = maskCPF_CNPJ(e.target.value);
                    try { e.target.setSelectionRange(pos, pos); } catch (err) {}
                });
            }
            ["cep","cep_comercio"].forEach(id=>{
                const el=document.getElementById(id);
                if(el) el.addEventListener("input", e=> e.target.value = maskCEP(e.target.value));
            });
            ["celular","tel_comercio"].forEach(id=>{
                const el=document.getElementById(id);
                if(el) el.addEventListener("input", e=> e.target.value = maskPhone(e.target.value));
            });

            document.querySelectorAll('input[name="tipo"]').forEach(r=> r.addEventListener("change", e=> updateFormByTipo(e.target.value)));
            const checked = document.querySelector('input[name="tipo"]:checked');
            if(checked) updateFormByTipo(checked.value);

            (async function loadCategorias(){
                const sel = document.getElementById("categoria");
                if(!sel) return;
                sel.innerHTML = '<option value="">Carregando...</option>';
                try {
                    const data = await apiRequest('/categoria', { method: 'GET' });
                    if(Array.isArray(data) && data.length>0){
                        sel.innerHTML = '<option value="">Selecione uma categoria</option>';
                        data.forEach(c => {
                            const label = c.nome || c.nomeCategoria || c.descricao || c.title || c.nome || c.name || c.descricaoCategoria;
                            sel.innerHTML += `<option value="${c.id}">${label}</option>`;
                        });
                    } else {
                        sel.innerHTML = '<option value="">Selecione uma categoria</option><option value="1">Restaurante</option><option value="2">Loja</option><option value="3">Serviço</option>';
                    }
                } catch (e) {
                    console.warn("loadCategorias erro:", e);
                    sel.innerHTML = '<option value="">Selecione uma categoria</option><option value="1">Restaurante</option><option value="2">Loja</option><option value="3">Serviço</option>';
                }
            })();

            const form = document.getElementById("register-form");
            if(!form) { console.error("register-form não encontrado no DOM."); return; }

            form.addEventListener("submit", async (event) => {
                event.preventDefault();

                const btn = form.querySelector("button[type='submit']");
                const originalBtnText = btn ? btn.innerHTML : "Registrar";

                ["nome_error","email_error","cpf_error","senha_error","confirma_error","terms_error","categoria_error",
                    "dtn_error","end_error","bairro_error","cep_error","cidade_error","uf_error","cel_error",
                    "razao_error","fantasia_error","endcom_error","bairrocom_error","cepcom_error","cidadecom_error","ufcom_error","telcom_error"
                ].forEach(hideError);

                const tipo = document.querySelector('input[name="tipo"]:checked').value;
                const nome = document.getElementById("nome").value.trim();
                const email = document.getElementById("email").value.trim();
                const docRaw = document.getElementById("cpf_cnpj").value.trim();
                const doc = cleanNumber(docRaw);
                const senha = document.getElementById("senha").value;
                const confirma = document.getElementById("confirma_senha").value;
                const terms = document.getElementById("terms").checked;

                if(!nome){ showError("nome_error","Nome obrigatório."); return; }
                if(!isValidEmail(email)){ showError("email_error","E-mail inválido."); return; }
                if(!terms){ showError("terms_error","É necessário concordar com os Termos."); return; }
                if(!senha || senha.length < 6){ showError("senha_error","Senha deve ter no mínimo 6 caracteres."); return; }
                if(senha !== confirma){ showError("confirma_error","Senhas não coincidem."); return; }

                if(btn){ btn.disabled = true; btn.innerHTML = "Registrando..."; btn.style.opacity = "0.9"; }

                try {
                    if(tipo === "associado"){
                        const dtn = document.getElementById("dtn").value;
                        const endereco = document.getElementById("endereco").value.trim();
                        const bairro = document.getElementById("bairro").value.trim();
                        const cep = cleanNumber(document.getElementById("cep").value || "");
                        const cidade = document.getElementById("cidade").value.trim();
                        const uf = document.getElementById("uf").value.trim().toUpperCase();
                        const celular = document.getElementById("celular").value.trim();

                        if(!dtn){ showError("dtn_error","Data de nascimento obrigatória."); throw {userError:true}; }
                        if(!endereco){ showError("end_error","Endereço obrigatório."); throw {userError:true}; }
                        if(!bairro){ showError("bairro_error","Bairro obrigatório."); throw {userError:true}; }
                        if(!cep || cep.length !== 8){ showError("cep_error","CEP inválido (8 dígitos)."); throw {userError:true}; }
                        if(!cidade){ showError("cidade_error","Cidade obrigatória."); throw {userError:true}; }
                        if(!uf || !/^[A-Za-z]{2}$/.test(uf)){ showError("uf_error","UF inválida (2 letras)."); throw {userError:true}; }
                        if(!celular){ showError("cel_error","Celular obrigatório."); throw {userError:true}; }
                        if(!isValidCPF(doc)){ showError("cpf_error","CPF inválido."); throw {userError:true}; }

                        const body = {
                            cpfAssociado: doc,
                            nomAssociado: nome,
                            dtnAssociado: dtn,
                            endAssociado: endereco,
                            baiAssociado: bairro,
                            cepAssociado: cep,
                            cidAssociado: cidade,
                            ufAssociado: uf.toUpperCase(),
                            celAssociado: celular,
                            emailAssociado: email,
                            senAssociado: senha
                        };

                        const res = await apiRequest('/auth/register/associado', {
                            method: 'POST',
                            body: JSON.stringify(body)
                        });
                        console.log("Cadastro associado - resposta:", res);
                        showAppMessage("Cadastro de associado realizado com sucesso!", "success", 2500);
                        setTimeout(() => { window.location.href = "login.html"; }, 1000);

                    } else {
                        const categoria = document.getElementById("categoria").value;
                        const razao = document.getElementById("razao_social").value.trim();
                        const fantasia = document.getElementById("nome_fantasia").value.trim();
                        const endCom = document.getElementById("end_comercio").value.trim();
                        const bairroCom = document.getElementById("bairro_comercio").value.trim();
                        const cepCom = cleanNumber(document.getElementById("cep_comercio").value || "");
                        const cidCom = document.getElementById("cidade_comercio").value.trim();
                        const ufCom = document.getElementById("uf_comercio").value.trim().toUpperCase();
                        const telCom = document.getElementById("tel_comercio").value.trim();

                        if(!categoria){ showError("categoria_error","Selecione uma categoria."); throw {userError:true}; }
                        if(!razao){ showError("razao_error","Razão social obrigatória."); throw {userError:true}; }
                        if(!fantasia){ showError("fantasia_error","Nome fantasia obrigatório."); throw {userError:true}; }
                        if(!endCom){ showError("endcom_error","Endereço do comércio obrigatório."); throw {userError:true}; }
                        if(!bairroCom){ showError("bairrocom_error","Bairro obrigatório."); throw {userError:true}; }
                        if(!cepCom || cepCom.length !== 8){ showError("cepcom_error","CEP inválido (8 dígitos)."); throw {userError:true}; }
                        if(!cidCom){ showError("cidadecom_error","Cidade obrigatória."); throw {userError:true}; }
                        if(!ufCom || !/^[A-Za-z]{2}$/.test(ufCom)){ showError("ufcom_error","UF inválida (2 letras)."); throw {userError:true}; }
                        if(!telCom){ showError("telcom_error","Telefone obrigatório."); throw {userError:true}; }
                        if(!isValidCNPJ(doc)){ showError("cpf_error","CNPJ inválido."); throw {userError:true}; }

                        const body = {
                            cnpjComercio: doc,
                            idCategoria: Number(categoria),
                            razSocialComercio: razao,
                            nomFantasiaComercio: fantasia,
                            endComercio: endCom,
                            baiComercio: bairroCom,
                            cepComercio: cepCom,
                            cidComercio: cidCom,
                            ufComercio: ufCom.toUpperCase(),
                            conComercio: telCom,
                            emailComercio: email,
                            senComercio: senha
                        };

                        const res = await apiRequest('/auth/register/comerciante', {
                            method: 'POST',
                            body: JSON.stringify(body)
                        });
                        console.log("Cadastro comerciante - resposta:", res);
                        showAppMessage("Cadastro de comerciante realizado com sucesso!", "success", 2500);
                        setTimeout(() => { window.location.href = "login.html"; }, 1000);
                    }

                } catch (err) {
                    if (err && err.userError) {
                    } else {
                        console.error("Erro no submit:", err);
                        let msg = "Erro ao realizar cadastro.";
                        if (err && err.body) {
                            if (typeof err.body === "string") msg = err.body;
                            else if (err.body.message) msg = err.body.message;
                            else msg = JSON.stringify(err.body);
                        } else if (err && err.status) {
                            msg = `Erro ${err.status} ao contatar o servidor.`;
                        } else if (err && err.message) {
                            msg = err.message;
                        }
                        showAppMessage(msg, "error", 6000);
                    }
                } finally {
                    if(btn){ btn.disabled = false; btn.innerHTML = originalBtnText; btn.style.opacity = ""; }
                }
            });

        } catch (outerErr) {
            console.error("Erro ao inicializar register.js:", outerErr);
        }
    });

})();
