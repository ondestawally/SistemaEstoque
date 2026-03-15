import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const Parceiros = ({ setToast }) => {
  const [clientes, setClientes] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('clientes'); // 'clientes' ou 'fornecedores'

  const [form, setForm] = useState({ id: '', razao_social: '', cnpj_cpf: '' });

  const fetchData = async () => {
    try {
      const [c, f] = await Promise.all([api.getClientes(), api.getFornecedores()]);
      setClientes(Array.isArray(c) ? c : []);
      setFornecedores(Array.isArray(f) ? f : []);
    } catch (err) {
      console.error("Erro ao carregar parceiros", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (tab === 'clientes') {
        await api.criarCliente(form);
        setToast({ type: 'success', msg: 'Cliente cadastrado com sucesso!' });
      } else {
        await api.criarFornecedor({ ...form, cnpj: form.cnpj_cpf });
        setToast({ type: 'success', msg: 'Fornecedor cadastrado com sucesso!' });
      }
      setForm({ id: '', razao_social: '', cnpj_cpf: '' });
      fetchData();
    } catch (err) {
      setToast({ type: 'error', msg: 'Erro ao cadastrar parceiro' });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8 fade-in">
      <div className="flex gap-4 border-b border-slate-200">
        <button onClick={() => setTab('clientes')} className={`pb-2 px-4 font-bold transition-all ${tab === 'clientes' ? 'border-b-2 border-brand-500 text-brand-600' : 'text-slate-400'}`}>Clientes</button>
        <button onClick={() => setTab('fornecedores')} className={`pb-2 px-4 font-bold transition-all ${tab === 'fornecedores' ? 'border-b-2 border-brand-500 text-brand-600' : 'text-slate-400'}`}>Fornecedores</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-fit sticky top-4">
          <h3 className="text-xl font-bold mb-4">Novo {tab === 'clientes' ? 'Cliente' : 'Fornecedor'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input className="w-full border p-3 rounded-xl bg-slate-50 focus:bg-white transition-all" placeholder="ID (ex: CLI-001)" value={form.id} onChange={e => setForm({...form, id: e.target.value})} required />
            <input className="w-full border p-3 rounded-xl bg-slate-50 focus:bg-white transition-all" placeholder="CNPJ / CPF" value={form.cnpj_cpf} onChange={e => setForm({...form, cnpj_cpf: e.target.value})} required />
            <input className="w-full border p-3 rounded-xl bg-slate-50 focus:bg-white transition-all" placeholder="Razão Social" value={form.razao_social} onChange={e => setForm({...form, razao_social: e.target.value})} required />
            <button disabled={loading} className="w-full bg-slate-800 text-white py-3 rounded-xl font-bold hover:bg-slate-900 transition-all shadow-lg active:scale-95 disabled:opacity-50">
              {loading ? 'Processando...' : `Cadastrar ${tab === 'clientes' ? 'Cliente' : 'Fornecedor'}`}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xl font-bold">Listagem de {tab === 'clientes' ? 'Clientes' : 'Fornecedores'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(tab === 'clientes' ? clientes : fornecedores).map(p => (
              <div key={p.id} className="p-4 bg-white border border-slate-100 rounded-2xl flex justify-between items-center group hover:border-brand-200 hover:shadow-md transition-all">
                <div>
                  <p className="font-bold text-slate-800">{p.razao_social}</p>
                  <p className="text-xs text-slate-500">{p.id} • {p.cnpj_cpf || p.cnpj}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-brand-50 group-hover:text-brand-500 transition-colors">
                   {tab === 'clientes' ? '👤' : '🏢'}
                </div>
              </div>
            ))}
            {(tab === 'clientes' ? clientes : fornecedores).length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-400 italic">Nenhum {tab === 'clientes' ? 'cliente' : 'fornecedor'} cadastrado.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Parceiros;
