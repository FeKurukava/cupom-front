document.addEventListener('DOMContentLoaded', () => {
    const categorySelect = document.getElementById('category-filter');
    const searchBtn = document.getElementById('search-btn');
    const comerciosContainer = document.getElementById('comercios-container');
    const cuponsContainer = document.getElementById('cupons-container');
    const cuponsTitle = document.getElementById('cupons-title');
    let ultimoComercio = { cnpj: null, nome: null };

    function fmtDate(v) {
        if (!v) return '';
        if (Array.isArray(v) && v.length >= 3) {
            const y = v[0];
            const m = v[1];
            const d = v[2];
            return String(d).padStart(2, '0') + '/' + String(m).padStart(2, '0') + '/' + y;
        }
        const d = new Date(v);
        return isNaN(d.getTime()) ? '' : d.toLocaleDateString('pt-BR');
    }

    function fmtPerc(v) {
        if (v === null || v === undefined) return '';
        const n = Number(v);
        if (isNaN(n)) return '';
        return n.toString().replace('.', ',') + '%';
    }

    async function loadCategorias() {
        if (!categorySelect) return;
        categorySelect.innerHTML = '<option value="">Carregando categorias...</option>';
        try {
            const data = await apiRequest('/categoria', { method: 'GET' });
            if (Array.isArray(data) && data.length > 0) {
                categorySelect.innerHTML = '<option value="">Pesquisar por Categoria do Comércio</option>';
                data.forEach(c => {
                    const label = c.nome || c.nomeCategoria || c.descricao || c.title || c.name || c.descricaoCategoria || `Categoria ${c.id}`;
                    const id = c.id != null ? c.id : (c.codigo || c.code || label);
                    categorySelect.innerHTML += `<option value="${id}">${label}</option>`;
                });
            } else {
                categorySelect.innerHTML = '<option value="">Pesquisar por Categoria do Comércio</option>';
            }
        } catch (e) {
            console.warn('Falha ao carregar categorias:', e);
            categorySelect.innerHTML = '<option value="">Pesquisar por Categoria do Comércio</option>';
        }
    }

    async function carregarComercios() {
        if (!comerciosContainer) return;
        comerciosContainer.innerHTML = '<p style="text-align:center; padding: 20px;">Carregando comércios...</p>';
        try {
            const lista = await apiRequest('/associado/comercios', { method: 'GET' });
            renderComercios(Array.isArray(lista) ? lista : []);
        } catch (err) {
            console.error(err);
            const detail = err && (err.body?.message || err.body?.erro || err.body?.detail);
            const msg = detail ? `Erro: ${detail}` : 'Falha ao conectar ao servidor.';
            comerciosContainer.innerHTML = `<p style="text-align:center; color: var(--color-error); padding: 20px;">${msg}</p>`;
        }
    }

    function renderComercios(lista) {
        comerciosContainer.innerHTML = '';
        if (!Array.isArray(lista) || lista.length === 0) {
            comerciosContainer.innerHTML = '<p style="text-align:center; padding: 20px;">Nenhum comércio encontrado.</p>';
            return;
        }
        const wrap = document.createElement('div');
        lista.forEach(c => {
            const nome = c.nomFantasiaComercio || c.razSocialComercio || 'Comércio';
            const cidadeUf = [c.cidComercio, c.ufComercio].filter(Boolean).join(' / ');
            const cnpj = c.cnpjComercio || '';

            const item = document.createElement('div');
            item.className = 'cupom-list-item';
            item.style.cursor = 'pointer';
            item.innerHTML = `
                <div>
                    <strong>${nome}</strong>
                    <div style="font-size: .9em; color: #555;">${cidadeUf || ''}</div>
                    <div style="font-size: .85em; color: #777;">CNPJ: ${cnpj}</div>
                </div>
                <button class="btn btn-secondary">Ver cupons</button>
            `;
            item.addEventListener('click', () => {
                carregarCuponsPorComercio(cnpj, nome);
            });
            wrap.appendChild(item);
        });
        comerciosContainer.appendChild(wrap);
    }

    async function carregarCuponsPorComercio(cnpj, nome) {
        if (!cuponsContainer) return;
        const cnpjClean = typeof limparDocumento === 'function' ? limparDocumento(cnpj) : (cnpj || '').replace(/\D/g, '');
        ultimoComercio = { cnpj, nome };
        if (cuponsTitle) {
            cuponsTitle.style.display = '';
            cuponsTitle.textContent = nome ? `Cupons de ${nome}` : 'Cupons do Comércio';
        }
        cuponsContainer.innerHTML = '<p style="text-align:center; padding: 20px;">Carregando cupons...</p>';
        try {
            const data = await apiRequest(`/associado/comercios/${encodeURIComponent(cnpjClean)}/cupons?status=ATIVOS`, { method: 'GET' });
            renderCupons(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            const detail = err && (err.body?.message || err.body?.erro || err.body?.detail);
            const msg = detail ? `Erro: ${detail}` : 'Falha ao conectar ao servidor.';
            cuponsContainer.innerHTML = `<p style=\"text-align:center; color: var(--color-error); padding: 20px;\">${msg}</p>`;
        }
    }

    async function reservarCupom(numCupom, btn) {
        if (!numCupom) return;
        try {
            if (btn) btn.disabled = true;
            const user = typeof obterUsuarioLogado === 'function' ? obterUsuarioLogado() : null;
            const cpf = user && user.cpf ? (typeof limparDocumento === 'function' ? limparDocumento(user.cpf) : String(user.cpf).replace(/\D/g, '')) : '';
            if (!cpf || cpf.length !== 11) {
                alert('Não foi possível identificar seu CPF. Faça login novamente.');
                return;
            }
            await apiRequest('/associado/reservar-cupom', {
                method: 'POST',
                body: JSON.stringify({ cpfAssociado: cpf, numCupom })
            });
            if (ultimoComercio && ultimoComercio.cnpj) {
                await carregarCuponsPorComercio(ultimoComercio.cnpj, ultimoComercio.nome);
            }
        } catch (err) {
            console.error(err);
            const detail = err && (err.body?.message || err.body?.erro || err.body?.detail);
            alert(detail ? `Erro ao reservar: ${detail}` : 'Falha ao reservar o cupom.');
        } finally {
            if (btn) btn.disabled = false;
        }
    }

    function renderCupons(lista) {
        cuponsContainer.innerHTML = '';
        if (!Array.isArray(lista) || lista.length === 0) {
            cuponsContainer.innerHTML = '<p style="text-align:center; padding: 20px;">Nenhum cupom disponível para este comércio.</p>';
            return;
        }
        lista.forEach(c => {
            const periodo = [fmtDate(c.dtaInicioCupom), fmtDate(c.dtaTerminoCupom)].filter(Boolean).join(' - ');
            const item = document.createElement('div');
            item.className = 'cupom-list-item';

            const left = document.createElement('div');
            left.className = 'cupom-info';
            left.innerHTML = `
                <strong>${c.tituloCupom || ''}</strong>
                <div class="cupom-details">
                    ${periodo ? `Válido: ${periodo}` : ''}
                    ${c.perDescCupom != null ? ` | Desconto: ${fmtPerc(c.perDescCupom)}` : ''}
                </div>
            `;
            item.appendChild(left);

            const right = document.createElement('div');
            right.style.display = 'flex';
            right.style.gap = '8px';
            right.style.alignItems = 'center';

            if (c.numCupom) {
                const code = document.createElement('span');
                code.className = 'cupom-code-display';
                code.textContent = c.numCupom;
                right.appendChild(code);

                const btn = document.createElement('button');
                btn.className = 'btn btn-primary';
                btn.textContent = 'Reservar';
                btn.addEventListener('click', (ev) => {
                    ev.stopPropagation();
                    reservarCupom(c.numCupom, btn);
                });
                right.appendChild(btn);
            }

            item.appendChild(right);
            cuponsContainer.appendChild(item);
        });
    }

    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            carregarComercios();
        });
    }

    loadCategorias();
    carregarComercios();
});