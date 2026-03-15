import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const Vendas = ({ setToast }) => {
  const [novoCliente, setNovoCliente] = useState({ id: '', razao_social: '', cnpj_cpf: '' });

  const fetchClientes = () => {
    fetch(`${api.baseURL || 'http://localhost:8000'}/api/v1/vendas/clientes/`)
      .then(res => res.json())
      .then(data => setClientes(data))
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
      const res = await fetch(`${api.baseURL || 'http://localhost:8000'}/api/v1/vendas/clientes/`, {
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Cadastro de Cliente */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-xl font-bold mb-4">Novo Cliente</h3>
          <form onSubmit={handleCreateCliente} className="grid grid-cols-2 gap-4">
            <input className="border p-2 rounded-lg" placeholder="ID (ex: CLI-001)" value={novoCliente.id} onChange={e => setNovoCliente({...novoCliente, id: e.target.value})} required />
            <input className="border p-2 rounded-lg" placeholder="CNPJ / CPF" value={novoCliente.cnpj_cpf} onChange={e => setNovoCliente({...novoCliente, cnpj_cpf: e.target.value})} required />
            <input className="border p-2 rounded-lg col-span-2" placeholder="Razão Social" value={novoCliente.razao_social} onChange={e => setNovoCliente({...novoCliente, razao_social: e.target.value})} required />
            <button className="col-span-2 bg-slate-800 text-white py-2 rounded-lg hover:bg-slate-900 transition-colors">Cadastrar Parceiro</button>
          </form>
        </div>

        {/* Novo Pedido */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-xl font-bold mb-4">Gerar Venda</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input type="text" className="border p-2 rounded-lg" value={venda.id} onChange={e => setVenda({...venda, id: e.target.value})} placeholder="ID da Venda" required />
              <select className="border p-2 rounded-lg" value={venda.cliente_id} onChange={e => setVenda({...venda, cliente_id: e.target.value})} required>
                <option value="">Selecione um cliente</option>
                {clientes.map(c => <option key={c.id} value={c.id}>{c.razao_social}</option>)}
              </select>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-brand-600 text-white py-3 rounded-xl font-bold hover:bg-brand-700 transition-colors">
              {loading ? 'Processando...' : 'Confirmar & Lançar Financeiro'}
            </button>
          </form>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-xl font-bold mb-4">Painel de Clientes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clientes.map(c => (
            <div key={c.id} className="p-4 border rounded-xl flex justify-between items-center group hover:border-brand-200 transition-all">
              <div>
                <p className="font-bold text-slate-800">{c.razao_social}</p>
                <p className="text-xs text-slate-500">{c.cnpj_cpf}</p>
              </div>
              <span className="bg-emerald-100 text-emerald-800 text-[9px] px-2 py-1 rounded-full uppercase font-black">Cliente</span>
            </div>
          ))}
        </div>
        {clientes.length === 0 && <p className="text-slate-400 italic text-center py-10">Cadastre seu primeiro cliente para iniciar as vendas.</p>}
      </div>
    </div>
  );
};

export default Vendas;
