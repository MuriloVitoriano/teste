// Variável global para armazenar os dados do CC atualmente carregado
let inventarioData = [];

// ====================================================================
// FUNÇÃO DE CARREGAMENTO INICIAL (ÍNDICE)
// ====================================================================

// 1. Carrega o arquivo de índice para saber quais CCs existem
async function carregarIndiceCC() {
    try {
        const response = await fetch('cc_index.json');
        
        if (!response.ok) {
            throw new Error(`Erro ao carregar o índice: ${response.status}`);
        }
        
        const centrosDeCustoDisponiveis = await response.json();
        
        // Ordena e popula o seletor
        centrosDeCustoDisponiveis.sort((a, b) => a - b); 
        popularCentrosDeCusto(centrosDeCustoDisponiveis);
        
        // Exibe a mensagem inicial para o usuário selecionar
        document.getElementById('resultadoBody').innerHTML = '<tr><td colspan="5">Selecione um Centro de Custo para carregar o inventário.</td></tr>';

    } catch (error) {
        console.error("Erro fatal ao carregar o índice de Centros de Custo:", error);
        document.getElementById('resultadoBody').innerHTML = '<tr><td colspan="5" style="color: red;">Erro ao carregar o índice de CCs. Verifique o console e o arquivo cc_index.json.</td></tr>';
    }
}

// 2. Popula o seletor no HTML
function popularCentrosDeCusto(centros) {
    const centroCustoSelect = document.getElementById('centroCustoSelect');
    centroCustoSelect.innerHTML = '<option value="">Selecione um CC</option>'; // Limpa e adiciona a opção inicial
    
    centros.forEach(cc => {
        const option = document.createElement('option');
        option.value = cc;
        option.textContent = cc;
        centroCustoSelect.appendChild(option);
    });
}

// ====================================================================
// FUNÇÃO DE CARREGAMENTO DINÂMICO
// ====================================================================

// 3. Carrega o inventário APENAS do Centro de Custo selecionado
async function carregarInventarioPorCC(centroCusto) {
    const resultadoBody = document.getElementById('resultadoBody');
    
    if (!centroCusto) {
        inventarioData = [];
        resultadoBody.innerHTML = '<tr><td colspan="5">Selecione um Centro de Custo.</td></tr>';
        return;
    }

    const path = `por_centro_custo/${centroCusto}.json`;
    resultadoBody.innerHTML = '<tr><td colspan="5">Carregando inventário do CC ' + centroCusto + '...</td></tr>';
    
    try {
        const response = await fetch(path);
        
        if (!response.ok) {
            throw new Error(`Arquivo não encontrado para o CC ${centroCusto}: ${response.status}`);
        }
        
        // Atualiza a variável global com os dados do CC selecionado
        inventarioData = await response.json(); 
        
        // Após carregar, aplica os filtros (se houver busca por equipamento)
        aplicarFiltros(); 
        
    } catch (error) {
        console.error(`Erro ao carregar o arquivo ${path}:`, error);
        resultadoBody.innerHTML = `<tr><td colspan="5" style="color: red;">Erro ao carregar o inventário para o CC ${centroCusto}. Arquivo ${path} não encontrado.</td></tr>`;
        inventarioData = []; 
    }
}

// ====================================================================
// FUNÇÃO DE FILTRAGEM E EXIBIÇÃO
// ====================================================================

function aplicarFiltros() {
    
    const termoBuscaEquipamento = document.getElementById('buscaEquipamentoInput').value.toLowerCase();
    const resultadoBody = document.getElementById('resultadoBody');
    resultadoBody.innerHTML = ''; // Limpa antes de exibir

    // Se nenhum dado foi carregado, exibe mensagem
    if (inventarioData.length === 0) {
        resultadoBody.innerHTML = '<tr><td colspan="5">Nenhum inventário carregado. Selecione um Centro de Custo.</td></tr>';
        return;
    }

    // Filtra apenas pelo nome do equipamento nos dados carregados
    let resultadosFiltrados = inventarioData.filter(item => {
        return item["Equipamentos"].toLowerCase().includes(termoBuscaEquipamento);
    });

    // Exibe os novos resultados na tabela
    if (resultadosFiltrados.length === 0) {
        const row = resultadoBody.insertRow();
        row.innerHTML = '<td colspan="5">Nenhum equipamento encontrado com o termo de busca.</td>';
        return;
    }

    resultadosFiltrados.forEach(item => {
        const row = resultadoBody.insertRow();
        row.insertCell().textContent = item["Centro de Custo"]; 
        row.insertCell().textContent = item["Inventarios"];
        row.insertCell().textContent = item["Equipamentos"];
        row.insertCell().textContent = item["Area"];
        row.insertCell().textContent = item["cdinventarios"];
    });
}

// ====================================================================
// INICIALIZAÇÃO E EVENT LISTENERS
// ====================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Listener para o seletor: carrega o JSON específico
    document.getElementById('centroCustoSelect').addEventListener('change', (event) => {
        carregarInventarioPorCC(event.target.value);
    });

    // Listener para a busca: filtra os dados JÁ carregados
    document.getElementById('buscaEquipamentoInput').addEventListener('input', aplicarFiltros);

    // Inicia o carregamento do índice de Centros de Custo
    carregarIndiceCC();
});