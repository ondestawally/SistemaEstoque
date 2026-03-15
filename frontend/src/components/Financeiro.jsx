import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const Financeiro = () => {
  const [data, setData] = useState({ resumo: { total_receber: 0, total_pagar: 0, saldo: 0 }, detalhes: [] });
  const BASE_URL = import.meta.env.VITE_API_URL || 'http://192.168.15.72:8000';

  useEffect(() => {
    fetch(`${BASE_URL}/api/v1/financeiro/fluxo-caixa/`)
      .then(res => res.json())
      .then(d => setData(d))
      .catch(err => console.error("Erro ao carregar financeiro", err));
  }, []);

  return (
    <div className="space-y-8 fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl">
          <p className="text-emerald-700 text-sm font-bold uppercase mb-1">Total a Receber</p>
          <p className="text-3xl font-black text-emerald-900">R$ {data.resumo.total_receber.toLocaleString()}</p>
        </div>
        <div className="bg-rose-50 border border-rose-100 p-6 rounded-2xl">
          <p className="text-rose-700 text-sm font-bold uppercase mb-1">Total a Pagar</p>
          <p className="text-3xl font-black text-rose-900">R$ {data.resumo.total_pagar.toLocaleString()}</p>
        </div>
        <div className={`p-6 rounded-2xl border ${data.resumo.saldo >= 0 ? 'bg-indigo-50 border-indigo-100' : 'bg-orange-50 border-orange-100'}`}>
          <p className="text-indigo-700 text-sm font-bold uppercase mb-1">Saldo Projetado</p>
          <p className={`text-3xl font-black ${data.resumo.saldo >= 0 ? 'text-indigo-900' : 'text-orange-900'}`}>R$ {data.resumo.saldo.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
           <h3 className="text-xl font-bold text-slate-800">Lançamentos no Fluxo de Caixa</h3>
        </div>
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
            <tr>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Tipo</th>
              <th className="px-6 py-4">Vencimento</th>
              <th className="px-6 py-4">Valor</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {data.detalhes.map(l => (
              <tr key={l.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900">{l.id}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${l.tipo === 'RECEBER' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                    {l.tipo}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-500">{l.vencimento}</td>
                <td className="px-6 py-4 font-bold text-slate-700">R$ {l.valor.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-300"></span>
                    {l.status}
                  </span>
                </td>
              </tr>
            ))}
            {data.detalhes.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-10 text-center text-slate-400 italic">Nenhum lançamento financeiro registrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Financeiro;
