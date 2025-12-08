document.addEventListener('DOMContentLoaded', () => {
    
    const filterBtn = document.getElementById('filter-icon-btn');
    const filterDropdown = document.getElementById('filter-dropdown');
    const applyFiltersBtn = document.getElementById('apply-filters-btn');
    const statusFilter = document.getElementById('status-filter');
    const cuponsContainer = document.getElementById('cupons-list-container');
    
    
    filterBtn.addEventListener('click', () => {
        const isVisible = filterDropdown.style.display !== 'none';
        filterDropdown.style.display = isVisible ? 'none' : 'block';
    });

    
    const loadAndRenderCupons = async (statusFilterValue = 'ativos') => {
        cuponsContainer.innerHTML = '<p>Buscando cupons...</p>';
        

        try {
            
            const cuponsData = [
                { status: 'Ativo', tit_cupom: 'Desconto de Natal', comercio: 'Panificadora Delícia', num_cupom: 'XYZ123456789', data_reserva: '05/12/2025' },
                { status: 'Ativo', tit_cupom: '50% em Doces', comercio: 'Chocolateria Glamour', num_cupom: 'ABC098765432', data_reserva: '01/12/2025' },
                { status: 'Utilizado', tit_cupom: 'Corte de Cabelo', comercio: 'Barbearia Clássica', data_reserva: '20/11/2025', data_uso: '22/11/2025' },
                { status: 'Vencido', tit_cupom: 'Lavagem de Carro', comercio: 'Lava Rápido Pingo', data_reserva: '10/10/2025', data_vencimento: '30/11/2025' },
            ];
            
            const grupos = {
                'Ativos': cuponsData.filter(c => c.status === 'Ativo'),
                'Encerrados': cuponsData.filter(c => c.status !== 'Ativo'),
            };

            cuponsContainer.innerHTML = ''; 

            if (grupos.Ativos.length > 0) {
                renderGroup('Cupons Ativos (A Utilizar)', grupos.Ativos, 'active');
            }

            if (grupos.Encerrados.length > 0) {
                renderGroup('Cupons Encerrados (Utilizados e Vencidos)', grupos.Encerrados, 'closed');
            }

            if (grupos.Ativos.length === 0 && grupos.Encerrados.length === 0) {
                 cuponsContainer.innerHTML = '<p style="text-align: center; color: var(--color-text-dark); margin-top: 50px;">Não possui cupons.</p>';
            }

        } catch (error) {
            cuponsContainer.innerHTML = `<p class="message-error" style="text-align: center; color: var(--color-error); margin-top: 50px;">Erro ao carregar cupons: ${error.message}</p>`;
        }
    };

    
    const renderGroup = (title, list, status) => {
        const section = document.createElement('section');
        section.classList.add('cupom-group-section', `${status}-group`);
        section.innerHTML = `<h2>${title}</h2>`;
        
        list.forEach(cupom => {
             const item = document.createElement('div');
             item.classList.add('cupom-list-item');
             item.innerHTML = `
                 <div class="cupom-info">
                     <strong>${cupom.tit_cupom}</strong>
                     <div class="cupom-details">
                         Comerciante: ${cupom.comercio} | Reservado em: ${cupom.data_reserva}
                     </div>
                 </div>
                 ${cupom.num_cupom ? `<span class="cupom-code-display">${cupom.num_cupom}</span>` : ''}
                 ${cupom.data_uso ? `<span class="cupom-details">Usado em: ${cupom.data_uso}</span>` : ''}
                 ${cupom.data_vencimento ? `<span class="cupom-details" style="color: var(--color-error);">Vencido em: ${cupom.data_vencimento}</span>` : ''}
             `;
             section.appendChild(item);
        });
        cuponsContainer.appendChild(section);
    };

    
    loadAndRenderCupons(statusFilter.value); 

    applyFiltersBtn.addEventListener('click', () => {
        filterDropdown.style.display = 'none'; 
        loadAndRenderCupons(statusFilter.value);
    });
});