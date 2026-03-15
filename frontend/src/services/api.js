// Em produção, isso virá das variáveis de ambiente do Vercel
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const api = {
    async getHealth() {
        try {
            const res = await fetch(`${API_URL}/openapi.json`);
            return res.ok;
        } catch (e) {
            console.error("Health check failed", e);
            return null;
        }
    },
    
    async criarPedido(pedidoId, fornecedorId, produtoId, qtde, vlrUnit) {
        const payload = {
            pedido_id: pedidoId,
            fornecedor_id: fornecedorId,
            itens: [
                {
                    produto_id: produtoId,
                    quantidade: qtde,
                    valor_unitario: vlrUnit.toString()
                }
            ]
        };
        
        const res = await fetch(`${API_URL}/api/v1/erp/pedidos/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || "Erro ao criar pedido");
        }
        return res.json();
    },

    async getClientes() {
        const res = await fetch(`${API_URL}/api/v1/vendas/clientes/`);
        return res.json();
    },
    async criarCliente(cliente) {
        const res = await fetch(`${API_URL}/api/v1/vendas/clientes/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cliente)
        });
        return res.json();
    },
    async getFornecedores() {
        const res = await fetch(`${API_URL}/api/v1/erp/fornecedores/`);
        return res.json();
    },
    async criarFornecedor(fornecedor) {
        const res = await fetch(`${API_URL}/api/v1/erp/fornecedores/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(fornecedor)
        });
        return res.json();
    },
    async getProdutos() {
        const res = await fetch(`${API_URL}/api/v1/erp/produtos/`);
        return res.json();
    },
    async criarProduto(produto) {
        const res = await fetch(`${API_URL}/api/v1/erp/produtos/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(produto)
        });
        return res.json();
    },
    async receberMercadoria(pedidoId, dataRecebimento) {
        const payload = {
            pedido_id: pedidoId,
            data_recebimento: dataRecebimento
        };

        const res = await fetch(`${API_URL}/api/v1/wms/receber/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || "Erro ao receber mercadoria");
        }
        return res.json();
    }
};
