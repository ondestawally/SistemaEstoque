import React, { useState } from 'react';
import { api } from '../services/api';

const ComprasModal = ({ setToast }) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    oc_id: 'OC-001',
    oc_forn: 'F1',
    oc_prod: 'P1',
    oc_qtd: 100,
    oc_val: 50.00
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api.criarPedido(form.oc_id, form.oc_forn, form.oc_prod, form.oc_qtd, form.oc_val);
      setToast({ msg: `✅ Pedido ${data.pedido_id} (${data.status}) de R$ ${data.valor_total} CRIADO!`, type: 'success' });
    } catch (err) {
      setToast({ msg: `❌ ${err.message}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in bg-white rounded-2xl shadow-sm border border-slate-100 p-8 max-w-xl">
        <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
            <span className="bg-brand-100 text-brand-600 w-8 h-8 rounded-lg flex items-center justify-center">🛒</span>
            Emitir Ordem de Compra
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">ID do Pedido</label>
                    <input type="text" value={form.oc_id} onChange={e => setForm({...form, oc_id: e.target.value})} className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-colors" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">ID do Fornecedor</label>
                    <input type="text" value={form.oc_forn} onChange={e => setForm({...form, oc_forn: e.target.value})} className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-colors" required />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ID do Produto</label>
                <input type="text" value={form.oc_prod} onChange={e => setForm({...form, oc_prod: e.target.value})} className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-colors" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Quantidades</label>
                    <input type="number" value={form.oc_qtd} onChange={e => setForm({...form, oc_qtd: parseInt(e.target.value)})} className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-colors" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Valor Un. (R$)</label>
                    <input type="number" step="0.01" value={form.oc_val} onChange={e => setForm({...form, oc_val: parseFloat(e.target.value)})} className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-colors" required />
                </div>
            </div>
            
            <button type="submit" disabled={loading} className="w-full mt-6 bg-brand-600 hover:bg-brand-500 text-white font-medium py-3 rounded-xl shadow-lg shadow-brand-500/30 transition-all transform active:scale-[0.98] disabled:opacity-50">
                {loading ? 'Criando...' : 'Criar Pedido no ERP'}
            </button>
        </form>
    </div>
  );
};

export default ComprasModal;
