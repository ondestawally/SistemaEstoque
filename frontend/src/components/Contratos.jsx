import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const STATUS_COLORS = {
  ATIVO: 'bg-emerald-100 text-emerald-700',
  VENCIDO: 'bg-rose-100 text-rose-700',
  RENOVADO: 'bg-blue-100 text-blue-700',
  ENCERRADO: 'bg-slate-100 text-slate-600',
};

const diasParaVencer = (dataFim) => {
  const hoje = new Date();
  const fim = new Date(dataFim);
  const diff = Math.ceil((fim - hoje) / (1000 * 60 * 60 * 24));
  return diff;
};

const alertaBadge = (dias) => {
  if (dias < 0) return 'bg-rose-500 text-white';
  if (dias <= 30) return 'bg-rose-100 text-rose-700';
  if (dias <= 60) return 'bg-amber-100 text-amber-700';
  if (dias <= 90) return 'bg-yellow-100 text-yellow-700';
  return '';
};

export default function Contratos({ setToast }) {
  const [contratos, setContratos] = useState([]);
  const [vencendo, setVencendo] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showNovo, setShowNovo] = useState(false);
  const [filtro, setFiltro] = useState(90);

  const [contForm, setContForm] = useState({
    tipo: 'FORNECEDOR', parceiro_id: '', parceiro_nome: '', objeto: '',
    valor_mensal: '', data_inicio: '', data_fim: '', numero_contrato: '', condicao_pagamento: '', observacao: ''
  });

  const load = async () => {
    setLoading(true);
    try {
      const [c, v] = await Promise.all([api.getContratos(), api.getContratosVencendo(filtro)]);
      setContratos(c); setVencendo(v);
    } catch (e) { setToast?.({ type: 'error', msg: e.message }); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const submitContrato = async (e) => {
    e.preventDefault();
    try {
      await api.criarContrato({ id: `CT-${Date.now()}`, ...contForm, valor_mensal: parseFloat(contForm.valor_mensal) || 0 });
      setToast?.({ type: 'success', msg: 'Contrato cadastrado!' });
      setShowNovo(false);
      await load();
    } catch (e) { setToast?.({ type: 'error', msg: e.message }); }
  };

  const renovar = async (id) => {
    const novaData = prompt('Nova data de fim (YYYY-MM-DD):');
    if (!novaData) return;
    try {
      await api.renovarContrato(id, { nova_data_fim: novaData });
      setToast?.({ type: 'success', msg: 'Contrato renovado!' });
      await load();
    } catch (e) { setToast?.({ type: 'error', msg: e.message }); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gestão de Contratos</h2>
          <p className="text-slate-500 text-sm mt-1">Ciclo de vida · Alertas de Vencimento · Renovação</p>
        </div>
        <button onClick={() => setShowNovo(true)} className="bg-brand-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-brand-700 transition-all shadow-sm">+ Contrato</button>
      </div>

      {/* Alertas de Vencimento */}
      {vencendo.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-amber-800">⚠ Contratos Vencendo em {filtro} dias ({vencendo.length})</h3>
            <div className="flex gap-2">
              {[30, 60, 90].map(d => (
                <button key={d} onClick={() => { setFiltro(d); }} className={`text-xs px-2 py-1 rounded-lg ${filtro === d ? 'bg-amber-500 text-white' : 'bg-white text-amber-700 border border-amber-300'}`}>{d}d</button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            {vencendo.slice(0, 3).map(c => {
              const dias = diasParaVencer(c.data_fim);
              return (
                <div key={c.id} className="bg-white rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-800">{c.parceiro_nome} — {c.numero_contrato || c.id}</p>
                    <p className="text-sm text-slate-500">Vence: {c.data_fim}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${alertaBadge(dias)}`}>
                    {dias < 0 ? 'VENCIDO' : `${dias}d`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {loading && <div className="text-center py-8 text-slate-400">Carregando...</div>}

      {/* Lista completa */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>{['Parceiro', 'Tipo', 'Objeto', 'Valor/Mês', 'Início', 'Fim', 'Status', 'Ação'].map(h => <th key={h} className="px-4 py-3 text-left font-semibold text-slate-600">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {contratos.length === 0 && !loading && <tr><td colSpan={8} className="px-4 py-6 text-center text-slate-400">Nenhum contrato cadastrado</td></tr>}
            {contratos.map(c => {
              const dias = diasParaVencer(c.data_fim);
              return (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{c.parceiro_nome}</td>
                  <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600">{c.tipo}</span></td>
                  <td className="px-4 py-3 max-w-xs truncate">{c.objeto}</td>
                  <td className="px-4 py-3">R$ {parseFloat(c.valor_mensal || 0).toFixed(2)}</td>
                  <td className="px-4 py-3">{c.data_inicio}</td>
                  <td className="px-4 py-3">
                    <span className={`font-medium ${dias <= 30 ? 'text-rose-600' : dias <= 60 ? 'text-amber-600' : 'text-slate-600'}`}>{c.data_fim}</span>
                  </td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${STATUS_COLORS[c.status] || ''}`}>{c.status}</span></td>
                  <td className="px-4 py-3">
                    {c.status === 'ATIVO' && <button onClick={() => renovar(c.id)} className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-1 rounded-lg hover:bg-blue-100">Renovar</button>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal Novo Contrato */}
      {showNovo && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">Novo Contrato</h3>
            <form onSubmit={submitContrato} className="space-y-3">
              <select required className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={contForm.tipo} onChange={e => setContForm(f => ({ ...f, tipo: e.target.value }))}>
                <option value="FORNECEDOR">Fornecedor</option>
                <option value="CLIENTE">Cliente</option>
                <option value="SERVICO">Serviço</option>
              </select>
              <div className="grid grid-cols-2 gap-3">
                <input required placeholder="ID do Parceiro" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={contForm.parceiro_id} onChange={e => setContForm(f => ({ ...f, parceiro_id: e.target.value }))} />
                <input required placeholder="Nome do Parceiro" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={contForm.parceiro_nome} onChange={e => setContForm(f => ({ ...f, parceiro_nome: e.target.value }))} />
              </div>
              <textarea required placeholder="Objeto do contrato" rows={2} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={contForm.objeto} onChange={e => setContForm(f => ({ ...f, objeto: e.target.value }))} />
              <div className="grid grid-cols-3 gap-3">
                <input type="number" step="0.01" min="0" placeholder="Valor/Mês R$" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={contForm.valor_mensal} onChange={e => setContForm(f => ({ ...f, valor_mensal: e.target.value }))} />
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Início</label>
                  <input required type="date" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={contForm.data_inicio} onChange={e => setContForm(f => ({ ...f, data_inicio: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Fim</label>
                  <input required type="date" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={contForm.data_fim} onChange={e => setContForm(f => ({ ...f, data_fim: e.target.value }))} />
                </div>
              </div>
              <input placeholder="Número do Contrato (opcional)" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={contForm.numero_contrato} onChange={e => setContForm(f => ({ ...f, numero_contrato: e.target.value }))} />
              <textarea placeholder="Observação" rows={2} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={contForm.observacao} onChange={e => setContForm(f => ({ ...f, observacao: e.target.value }))} />
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowNovo(false)} className="flex-1 border border-slate-300 text-slate-700 py-2 rounded-xl font-medium hover:bg-slate-50">Cancelar</button>
                <button type="submit" className="flex-1 bg-brand-600 text-white py-2 rounded-xl font-medium hover:bg-brand-700">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
