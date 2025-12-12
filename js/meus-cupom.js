document.addEventListener('DOMContentLoaded', () => {
    const applyFiltersBtn = document.getElementById('apply-filters-btn');
    const statusFilter = document.getElementById('status-filter');
    const cuponsContainer = document.getElementById('cupons-container');
    const listTitle = document.getElementById('list-title');

    function tituloPorStatus(s) {
        if (s === 'utilizados') return 'Cupons Utilizados';
        if (s === 'vencidos') return 'Cupons Vencidos';
        return 'Cupons Ativos';
    }

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
        return (n).toString().replace('.', ',') + '%';
    }

    async function carregar(status) {
        cuponsContainer.innerHTML = '<p id="loading-message">Carregando seus cupons...</p>';
        const user = typeof obterUsuarioLogado === 'function' ? obterUsuarioLogado() : null;
        const cnpj = user && user.cnpj ? user.cnpj : '';
        if (!cnpj) {
            cuponsContainer.innerHTML = '<p style="text-align:center; margin-top:40px;">Usuário não identificado.</p>';
            return;
        }
        listTitle.textContent = tituloPorStatus(status);
        try {
            const data = await apiRequest(`/comercio/${encodeURIComponent(limparDocumento(cnpj))}?status=${encodeURIComponent(status)}`);
            renderizar(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            const detail = err && (err.body?.message || err.body?.erro || err.body?.detail);
            const msg = detail ? `Erro: ${detail}` : 'Falha ao conectar ao servidor.';
            cuponsContainer.innerHTML = `<p style="text-align:center; color: var(--color-error); margin-top:40px;">${msg}</p>`;
        }
    }

    function renderizar(lista) {
        cuponsContainer.innerHTML = '';
        if (!Array.isArray(lista) || lista.length === 0) {
            cuponsContainer.innerHTML = '<p style="text-align:center; margin-top:40px;">Não há cupons para os filtros selecionados.</p>';
            return;
        }
        lista.forEach(c => {
            const item = document.createElement('div');
            item.className = 'cupom-list-item';
            const periodo = [fmtDate(c.dtaInicioCupom), fmtDate(c.dtaTerminoCupom)].filter(Boolean).join(' - ');
            const info = document.createElement('div');
            info.className = 'cupom-info';
            info.innerHTML = `
                <strong>${c.tituloCupom || ''}</strong>
                <div class="cupom-details">
                    ${periodo ? `Válido: ${periodo}` : ''}
                    ${c.perDescCupom != null ? ` | Desconto: ${fmtPerc(c.perDescCupom)}` : ''}
                    ${c.qntCupom != null ? ` | Quantidade: ${c.qntCupom}` : ''}
                </div>
            `;
            item.appendChild(info);
            if (c.numCupom) {
                const code = document.createElement('span');
                code.className = 'cupom-code-display';
                code.textContent = c.numCupom;
                item.appendChild(code);
            }
            cuponsContainer.appendChild(item);
        });
    }

    applyFiltersBtn.addEventListener('click', () => {
        carregar(statusFilter.value || 'ativos');
    });

    carregar(statusFilter.value || 'ativos');
});