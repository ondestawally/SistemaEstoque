import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const Vendas = ({ setToast }) => {
  const [clientes, setClientes] = useState([]);
  const [venda, setVenda] = useState({ id: '', cliente_id: '', itens: [{ produto_id: 'PROD-001', quantidade: 1, valor_unitario: 100 }] });
  const [loading, setLoading] = useState(false);
  const [novoCliente, setNovoCliente] = useState({ id: '', razao_social: '', cnpj_cpf: '' });

  const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const fetchClientes = () => {
    fetch(`${BASE_URL}/api/v1/vendas/clientes/`)
      .then(res => res.json())
      .then(data => setClientes(Array.isArray(data) ? data : []))
      .catch(err => console.error("Erro ao carregar clientes", err));
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  const handleCreateCliente = async (e) => {
    e.preventDefault();
    try {
      // Usamos o repository diretamente ou criamos um endpoint POST no router? 
      // Vou adicionar um endpoint POST /vendas/clientes no robust_routers.py depois.
      // Por enquanto, vamos assumir que existe.
      const res = await fetch(`${BASE_URL}/api/v1/vendas/clientes/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoCliente)
      });
      if (res.ok) {
        setToast({ type: 'success', msg: 'Cliente cadastrado!' });
        setNovoCliente({ id: '', razao_social: '', cnpj_cpf: '' });
        fetchClientes();
      }
    } catch (err) {
      setToast({ type: 'error', msg: 'Erro ao cadastrar cliente' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${api.baseURL || 'http://localhost:8000'}/api/v1/vendas/pedidos/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(venda)
      });
      const data = await res.json();
      if (res.ok) {
        setToast({ type: 'success', msg: data.message });
        setVenda({ id: '', cliente_id: '', itens: [{ produto_id: 'PROD-001', quantidade: 1, valor_unitario: 100 }] });
      } else {
        setToast({ type: 'error', msg: data.detail || 'Erro ao processar venda' });
      }
    } catch (err) {
      setToast({ type: 'error', msg: 'Falha na conexão com servidor' });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8 fade-in">
      <div className="max-w-xl mx-auto">
        {/* Novo Pedido */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <span className="bg-brand-100 text-brand-600 w-8 h-8 rounded-lg flex items-center justify-center">💰</span>
            Gerar Venda
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ID da Venda</label>
                <input type="text" className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-brand-500 transition-all" value={venda.id} onChange={e => setVenda({...venda, id: e.target.value})} placeholder="VENDA-001" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Selecione o Cliente</label>
                <select className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-brand-500 transition-all" value={venda.cliente_id} onChange={e => setVenda({...venda, cliente_id: e.target.value})} required>
                  <option value="">Selecione um cliente</option>
                  {clientes.map(c => <option key={c.id} value={c.id}>{c.razao_social}</option>)}
                </select>
              </div>
              <div className="text-xs text-slate-400">
                Pode cadastrar novos clientes na aba 🤝 Parceiros.
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full mt-6 bg-brand-600 text-white py-3 rounded-xl font-bold hover:bg-brand-700 shadow-lg shadow-brand-500/20 active:scale-[0.98] transition-all">
              {loading ? 'Processando...' : 'Confirmar & Lançar Financeiro'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Vendas;
