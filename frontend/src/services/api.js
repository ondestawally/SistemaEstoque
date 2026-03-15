// Em produção, isso virá das variáveis de ambiente do Vercel
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const req = async (path, method = 'GET', body = null) => {
    const token = localStorage.getItem('erp_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    const opts = { method, headers };
    if (body) {
        if (body instanceof FormData) {
            delete headers['Content-Type'];
            opts.body = body;
        } else {
            opts.body = JSON.stringify(body);
        }
    }
    const res = await fetch(`${API_URL}${path}`, opts);
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Erro ${res.status}`);
    }
    return res.json();
};

export const api = {
    // ── Health ──────────────────────────────────────────────
    async getHealth() {
        try {
            const res = await fetch(`${API_URL}/openapi.json`);
            return res.ok;
        } catch (e) { return null; }
    },

    // ── Fornecedores / Clientes / Produtos ───────────────────
    getFornecedores: () => req('/api/v1/erp/fornecedores/'),
    criarFornecedor: (d) => req('/api/v1/erp/fornecedores/', 'POST', d),
    getClientes: () => req('/api/v1/vendas/clientes/'),
    criarCliente: (d) => req('/api/v1/vendas/clientes/', 'POST', d),
    getProdutos: () => req('/api/v1/erp/produtos/'),
    criarProduto: (d) => req('/api/v1/erp/produtos/', 'POST', d),

    // ── ERP (Pedidos de Compra legados) ──────────────────────
    async criarPedido(pedidoId, fornecedorId, produtoId, qtde, vlrUnit) {
        return req('/api/v1/erp/pedidos/', 'POST', {
            pedido_id: pedidoId,
            fornecedor_id: fornecedorId,
            itens: [{ produto_id: produtoId, quantidade: qtde, valor_unitario: vlrUnit.toString() }]
        });
    },

    // ── WMS ──────────────────────────────────────────────────
    async receberMercadoria(pedidoId, dataRecebimento) {
        return req('/api/v1/wms/receber/', 'POST', { pedido_id: pedidoId, data_recebimento: dataRecebimento });
    },

    // ── Vendas ───────────────────────────────────────────────
    getPedidosVenda: () => req('/api/v1/vendas/pedidos/'),
    criarPedidoVenda: (d) => req('/api/v1/vendas/pedidos/', 'POST', d),
    avancarPedidoVenda: (id) => req(`/api/v1/vendas/pedidos/${id}/status`, 'PATCH'),

    // ── Financeiro ───────────────────────────────────────────
    getContasReceber: () => req('/api/v1/financeiro/contas-receber/'),
    getContasPagar: () => req('/api/v1/financeiro/contas-pagar/'),
    getProjecaoCaixa: () => req('/api/v1/financeiro/projecao/'),
    baixarTitulo: (id) => req(`/api/v1/financeiro/titulos/${id}/baixar`, 'PATCH'),

    // ── Dashboard ────────────────────────────────────────────
    getDashboard: () => req('/api/v1/dashboard/stats/'),

    // ── ESTOQUE E CUSTOS ─────────────────────────────────────
    getPosicaoEstoque: () => req('/api/v1/estoque/posicao/'),
    getAlertasEstoque: () => req('/api/v1/estoque/alertas/'),
    getCurvaABC: () => req('/api/v1/estoque/curva-abc/'),
    getAjustesEstoque: () => req('/api/v1/estoque/ajustes/'),
    lancarAjuste: (d) => req('/api/v1/estoque/ajuste/', 'POST', d),
    salvarParametros: (d) => req('/api/v1/estoque/parametros/', 'POST', d),

    // ── COMPRAS WORKFLOW ─────────────────────────────────────
    getSolicitacoes: () => req('/api/v1/compras/solicitacoes/'),
    criarSolicitacao: (d) => req('/api/v1/compras/solicitacoes/', 'POST', d),
    avancarSolicitacao: (id) => req(`/api/v1/compras/solicitacoes/${id}/status`, 'PATCH'),
    getCotacoes: () => req('/api/v1/compras/cotacoes/'),
    criarCotacao: (d) => req('/api/v1/compras/cotacoes/', 'POST', d),
    aprovarCotacao: (id, fornecedorId) => req(`/api/v1/compras/cotacoes/${id}/aprovar?fornecedor_id=${fornecedorId}`, 'PATCH'),
    registrarConferencia: (d) => req('/api/v1/compras/conferencia/', 'POST', d),
    getNfEntrada: () => req('/api/v1/compras/nf-entrada/'),
    registrarNfEntrada: (d) => req('/api/v1/compras/nf-entrada/', 'POST', d),

    // ── FISCAL ───────────────────────────────────────────────
    getRegrasFiscais: () => req('/api/v1/fiscal/regras/'),
    criarRegraFiscal: (d) => req('/api/v1/fiscal/regras/', 'POST', d),
    getLivroFiscal: (tipo) => req(`/api/v1/fiscal/livro/?tipo=${tipo}`),
    getApuracaoFiscal: (mes, ano) => req(`/api/v1/fiscal/apuracao/?mes=${mes}&ano=${ano}`),

    // ── FATURAMENTO ──────────────────────────────────────────
    getPropostas: () => req('/api/v1/faturamento/propostas/'),
    criarProposta: (d) => req('/api/v1/faturamento/propostas/', 'POST', d),
    avancarProposta: (id, status) => req(`/api/v1/faturamento/propostas/${id}/status?novo_status=${status}`, 'PATCH'),
    getNfSaida: () => req('/api/v1/faturamento/nf-saida/'),
    emitirNfSaida: (d) => req('/api/v1/faturamento/nf-saida/', 'POST', d),

    // ── CONTRATOS ────────────────────────────────────────────
    getContratos: () => req('/api/v1/contratos/'),
    criarContrato: (d) => req('/api/v1/contratos/', 'POST', d),
    getContratosVencendo: (dias) => req(`/api/v1/contratos/vencendo/?dias=${dias}`),
    renovarContrato: (id, d) => req(`/api/v1/contratos/${id}/renovar`, 'PATCH', d),

    // ── CONTABILIDADE ────────────────────────────────────────
    getContas: (tipo) => req(`/api/v1/contabilidade/contas/${tipo ? `?tipo=${tipo}` : ''}`),
    criarConta: (d) => req('/api/v1/contabilidade/contas/', 'POST', d),
    getLancamentos: (ini, fim) => req(`/api/v1/contabilidade/lancamentos/?data_ini=${ini || ''}&data_fim=${fim || ''}`),
    criarLancamento: (d) => req('/api/v1/contabilidade/lancamentos/', 'POST', d),
    getBalancete: (ini, fim) => req(`/api/v1/contabilidade/balancete/?data_ini=${ini || ''}&data_fim=${fim || ''}`),

    // ── RH ───────────────────────────────────────────────────
    getCargos: () => req('/api/v1/rh/cargos/'),
    criarCargo: (d) => req('/api/v1/rh/cargos/', 'POST', d),
    getFuncionarios: (status) => req(`/api/v1/rh/funcionarios/${status ? `?status=${status}` : ''}`),
    criarFuncionario: (d) => req('/api/v1/rh/funcionarios/', 'POST', d),
    atualizarStatusFuncionario: (id, status) => req(`/api/v1/rh/funcionarios/${id}/status`, 'PATCH', { status }),
    gerarFolha: (d) => req('/api/v1/rh/folha/', 'POST', d),
    getFolha: (mes, ano) => req(`/api/v1/rh/folha/?${mes ? `mes=${mes}&` : ''}${ano ? `ano=${ano}` : ''}`),
    registrarPonto: (d) => req('/api/v1/rh/ponto/', 'POST', d),
    getPonto: (funcionario_id) => req(`/api/v1/rh/ponto/${funcionario_id ? `?funcionario_id=${funcionario_id}` : ''}`),
    getRHResumo: () => req('/api/v1/rh/resumo/'),

    // ── CONTROLLING ───────────────────────────────────────────
    getCentrosCusto: () => req('/api/v1/controlling/centros-custo/'),
    criarCentroCusto: (d) => req('/api/v1/controlling/centros-custo/', 'POST', d),
    getOrcamento: (ano, centro_custo_id) => req(`/api/v1/controlling/orcamento/?ano=${ano}${centro_custo_id ? `&centro_custo_id=${centro_custo_id}` : ''}`),
    lancarOrcamento: (d) => req('/api/v1/controlling/orcamento/', 'POST', d),
    lancarRealizado: (d) => req('/api/v1/controlling/realizado/', 'POST', d),
    getVariacao: (ano, mes, centro_custo_id) => req(`/api/v1/controlling/variacao/?ano=${ano}${mes ? `&mes=${mes}` : ''}${centro_custo_id ? `&centro_custo_id=${centro_custo_id}` : ''}`),
    getControllingResumo: (ano) => req(`/api/v1/controlling/resumo/?ano=${ano}`),
    
    // ── LOGÍSTICA & EXPEDIÇÃO ────────────────────────────────
    getExpedicaoPendentes: () => req('/api/v1/logistica/expedicao/pendentes'),
    avancarStatusLogistica: (id) => req(`/api/v1/logistica/expedicao/${id}/avancar`, 'POST'),
    despacharPedido: (id, d) => req(`/api/v1/logistica/expedicao/${id}/despachar`, 'POST', d),
    getCurvaABCLogistica: () => req('/api/v1/logistica/curva-abc'),
    getEstoqueCritico: () => req('/api/v1/logistica/estoque-critico'),
    getHistoricoPrecos: (id) => req(`/api/v1/logistica/historico-precos/${id}`),

    // ── CRM & VENDAS ──────────────────────────────────────────
    getLeads: () => req('/api/v1/crm/leads'),
    criarLead: (d) => req('/api/v1/crm/leads', 'POST', d),
    getOportunidades: () => req('/api/v1/crm/oportunidades'),
    criarOportunidade: (d) => req('/api/v1/crm/oportunidades', 'POST', d),
    avancarEtapaCRM: (id, etapa) => req(`/api/v1/crm/oportunidades/${id}/etapa?etapa=${etapa}`, 'PATCH'),
    getFunilVendas: () => req('/api/v1/crm/funil'),
    getVendedores: () => req('/api/v1/crm/vendedores'),

    // ── CONTRATOS ─────────────────────────────────────────────
    getContratos: () => req('/api/v1/contratos'),
    criarContrato: (d) => req('/api/v1/contratos', 'POST', d),
    faturarContrato: (id) => req(`/api/v1/contratos/${id}/faturar`, 'POST'),

    // ── AUTENTICAÇÃO ──────────────────────────────────────────
    async login(username, password) {
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);
        const data = await req('/api/v1/auth/login', 'POST', formData);
        if (data.access_token) {
            localStorage.setItem('erp_token', data.access_token);
            localStorage.setItem('erp_user', JSON.stringify({
                username: data.username,
                role: data.role
            }));
        }
        return data;
    },
    logout() {
        localStorage.removeItem('erp_token');
        localStorage.removeItem('erp_user');
    },
    getMe: () => req('/api/v1/auth/me'),
};
