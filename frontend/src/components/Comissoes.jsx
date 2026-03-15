import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function Comissoes({ setToast }) {
  const [vendedores, setVendedores] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const v = await api.getVendedores();
      setVendedores(v);
    } catch (e) { setToast?.({ type: 'error', msg: 'Erro ao carregar vendedores' }); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Comissões & Performance</h2>
          <p className="text-slate-500 text-sm mt-1">Acompanhamento e Repasse de Vendedores</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {vendedores.map(v => (
            <div key={v.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:border-brand-500 transition-all group">
                <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600 font-bold text-xl">
                        {v.nome[0]}
                    </div>
                    <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-bold">Ativo</span>
                </div>
                <h4 className="font-bold text-slate-800">{v.nome}</h4>
                <p className="text-xs text-slate-400 mb-4">{v.email}</p>
                <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Comissão Base</span>
                        <span className="font-bold text-slate-800">{v.comissao_percentual}%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Vendas (Mês)</span>
                        <span className="font-bold text-slate-800">R$ 0,00</span>
                    </div>
                    <div className="pt-2 mt-2 border-t border-slate-50 flex justify-between items-center text-sm">
                        <span className="font-medium text-slate-500 italic">Total a Pagar</span>
                        <span className="font-bold text-emerald-600">R$ 0,00</span>
                    </div>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
}
