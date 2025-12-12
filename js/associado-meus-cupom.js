document.addEventListener('DOMContentLoaded', () => {
    const statusSelect = document.getElementById('status-filter-associado');
    const applyBtn = document.getElementById('apply-status-associado');
    const listContainer = document.getElementById('associado-cupons-list');

    function mapStatus(v) {
        const s = String(v || '').toLowerCase();
        if (s === 'utilizados') return 'UTILIZADOS';
        if (s === 'vencidos') return 'VENCIDOS';
        return 'ATIVOS';
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
        return n.toString().replace('.', ',') + '%';
    }

    async function carregar(statusLower) {
        if (!listContainer) return;
        listContainer.innerHTML = '<p style="text-align:center; padding: 30px;">Carregando seus cupons...</p>';

        const user = typeof obterUsuarioLogado === 'function' ? obterUsuarioLogado() : null;
        const cpf = user && user.cpf ? (typeof limparDocumento === 'function' ? limparDocumento(user.cpf) : String(user.cpf).replace(/\D/g, '')) : '';
        if (!cpf || cpf.length !== 11) {
            listContainer.innerHTML = '<p style="text-align:center; color: var(--color-error); padding: 30px;">Não foi possível identificar seu CPF. Faça login novamente.</p>';
            return;
        }

        const status = mapStatus(statusLower);
        try {
            const data = await apiRequest(`/associado/meus-cupons?cpf=${encodeURIComponent(cpf)}&status=${encodeURIComponent(status)}`, { method: 'GET' });
            renderList(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            const detail = err && (err.body?.message || err.body?.erro || err.body?.detail);
            const msg = detail ? `Erro: ${detail}` : 'Falha ao conectar ao servidor.';
            listContainer.innerHTML = `<p style="text-align:center; color: var(--color-error); padding: 30px;">${msg}</p>`;
        }
    }

    function renderList(lista) {
        listContainer.innerHTML = '';
        if (!Array.isArray(lista) || lista.length === 0) {
            listContainer.innerHTML = '<p style="text-align: center; color: var(--color-text-dark); padding: 40px;">Nenhum cupom reservado encontrado para o filtro selecionado.</p>';
            return;
        }
        lista.forEach(c => {
            const item = document.createElement('div');
            item.className = 'cupom-list-item';

            const periodo = [fmtDate(c.dtaInicioCupom), fmtDate(c.dtaTerminoCupom)].filter(Boolean).join(' - ');

            const left = document.createElement('div');
            left.className = 'cupom-info';
            left.innerHTML = `
                <strong>${c.tituloCupom || ''}</strong>
                <div class="cupom-details">
                    ${periodo ? `Válido: ${periodo}` : ''}
                    ${c.perDescCupom != null ? ` | Desconto: ${fmtPerc(c.perDescCupom)}` : ''}
                </div>
            `;

            const right = document.createElement('div');
            right.style.display = 'flex';
            right.style.alignItems = 'center';
            right.style.gap = '8px';
            if (c.numCupom) {
                const code = document.createElement('span');
                code.className = 'hash-code';
                code.textContent = c.numCupom;
                right.appendChild(code);
            }

            item.appendChild(left);
            item.appendChild(right);
            listContainer.appendChild(item);
        });
    }

    if (applyBtn) {
        applyBtn.addEventListener('click', () => {
            const v = statusSelect ? statusSelect.value : 'ativos';
            carregar(v);
        });
    }

    carregar(statusSelect ? statusSelect.value : 'ativos');
});
