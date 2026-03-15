import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const Produtos = ({ setToast }) => {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ id: '', nome: '', descricao: '', codigo_barras: '' });

  const fetchProdutos = async () => {
    try {
      const data = await api.getProdutos();
      setProdutos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erro ao carregar produtos', err);
    }
  };

  useEffect(() => { fetchProdutos(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.criarProduto(form);
      setToast({ type: 'success', msg: `Produto ${form.nome} cadastrado!` });
      setForm({ id: '', nome: '', descricao: '', codigo_barras: '' });
      fetchProdutos();
    } catch (err) {
      setToast({ type: 'error', msg: 'Erro ao cadastrar produto' });
    }
    setLoading(false);
  };

  const filtered = produtos.filter(p =>
    p.nome?.toLowerCase().includes(search.toLowerCase()) ||
    p.id?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Form */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-fit sticky top-4">
          <h3 className="text-xl font-bold mb-5 flex items-center gap-2">
            <span className="bg-indigo-100 text-indigo-600 w-8 h-8 rounded-lg flex items-center justify-center">📦</span>
            Novo Produto
          </h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">ID do Produto</label>
              <input
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:bg-white transition-all text-sm"
                placeholder="ex: PROD-001"
                value={form.id}
                onChange={e => setForm({ ...form, id: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">Nome</label>
              <input
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:bg-white transition-all text-sm"
                placeholder="Nome do produto"
                value={form.nome}
                onChange={e => setForm({ ...form, nome: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">Descrição</label>
              <textarea
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:bg-white transition-all text-sm resize-none"
                placeholder="Descrição opcional"
                rows={2}
                value={form.descricao}
                onChange={e => setForm({ ...form, descricao: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">Código de Barras</label>
              <input
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:bg-white transition-all text-sm"
                placeholder="EAN-13 opcional"
                value={form.codigo_barras}
                onChange={e => setForm({ ...form, codigo_barras: e.target.value })}
              />
            </div>
            <button
              disabled={loading}
              className="w-full mt-2 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loading ? 'Cadastrando...' : 'Cadastrar Produto'}
            </button>
          </form>
        </div>

        {/* Product List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold text-slate-800 flex-1">Catálogo de Produtos</h3>
            <input
              className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-sm focus:ring-2 focus:ring-brand-400 transition-all w-40"
              placeholder="🔍 Buscar..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {filtered.length === 0 ? (
            <div className="py-16 text-center text-slate-400 italic">
              {search ? 'Nenhum produto encontrado.' : 'Cadastre seu primeiro produto.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map(p => (
                <div key={p.id} className="p-5 bg-white border border-slate-100 rounded-2xl hover:border-indigo-200 hover:shadow-md transition-all group">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 truncate">{p.nome}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{p.id}</p>
                      {p.descricao && <p className="text-xs text-slate-500 mt-1 line-clamp-1">{p.descricao}</p>}
                    </div>
                    <span className={`shrink-0 text-[10px] px-2 py-1 rounded-full font-bold uppercase ${p.ativo ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {p.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  {p.codigo_barras && (
                    <p className="text-[10px] font-mono text-slate-400 mt-2 bg-slate-50 px-2 py-1 rounded-lg">🏷️ {p.codigo_barras}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Produtos;
