import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const STATUS_COLORS = {
  RASCUNHO: 'bg-slate-100 text-slate-600',
  ENVIADA: 'bg-amber-100 text-amber-700',
  ACEITA: 'bg-emerald-100 text-emerald-700',
  RECUSADA: 'bg-rose-100 text-rose-700',
  EMITIDA: 'bg-blue-100 text-blue-700',
};

export default function Faturamento({ setToast }) {
  const [activeTab, setActiveTab] = useState('propostas');
  const [propostas, setPropostas] = useState([]);
  const [nfSaida, setNfSaida] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [pedidosVenda, setPedidosVenda] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showProposta, setShowProposta] = useState(false);
  const [showNF, setShowNF] = useState(false);

  const [propForm, setPropForm] = useState({ cliente_id: '', validade: '', desconto_global_pct: 0, condicao_pagamento: '30 dias', observacao: '' });
  const [nfForm, setNfForm] = useState({ pedido_venda_id: '', numero_nf: '', serie: '1', valor_total: '', valor_icms: 0, valor_pis: 0, valor_cofins: 0, valor_ipi: 0 });

  const load = async (tab) => {
    setLoading(true);
    try {
      const [c, pv] = await Promise.all([api.getClientes(), api.getPedidosVenda()]);
      setClientes(c); setPedidosVenda(pv);
      if (tab === 'propostas') setPropostas(await api.getPropostas());
      if (tab === 'nf') setNfSaida(await api.getNfSaida());
    } catch (e) { setToast?.({ type: 'error', msg: e.message }); }
    setLoading(false);
  };

  useEffect(() => { load(activeTab); }, [activeTab]);

  const submitProposta = async (e) => {
    e.preventDefault();
    try {
      await api.criarProposta({ id: `PROP-${Date.now()}`, ...propForm, valor_total: 0, itens: [] });
      setToast?.({ type: 'success', msg: 'Proposta criada!' });
      setShowProposta(false); setPropForm({ cliente_id: '', validade: '', desconto_global_pct: 0, condicao_pagamento: '30 dias', observacao: '' });
      setPropostas(await api.getPropostas());
    } catch (e) { setToast?.({ type: 'error', msg: e.message }); }
  };

  const avancarProposta = async (id, status) => {
    try {
      await api.avancarProposta(id, status);
      setToast?.({ type: 'success', msg: `Proposta → ${status}` });
      setPropostas(await api.getPropostas());
    } catch (e) { setToast?.({ type: 'error', msg: e.message }); }
  };

  const submitNF = async (e) => {
    e.preventDefault();
    try {
      await api.emitirNfSaida({ id: `NFS-${Date.now()}`, ...nfForm, valor_total: parseFloat(nfForm.valor_total) });
      setToast?.({ type: 'success', msg: 'NF de saída emitida!' });
      setShowNF(false); setNfSaida(await api.getNfSaida());
    } catch (e) { setToast?.({ type: 'error', msg: e.message }); }
  };

  const tabs = [
    { id: 'propostas', label: '📄 Propostas Comerciais' },
    { id: 'nf', label: '🧾 NF de Saída' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Faturamento</h2>
          <p className="text-slate-500 text-sm mt-1">Proposta Comercial → Pedido de Venda → NF de Saída</p>
        </div>
        {activeTab === 'propostas' && <button onClick={() => setShowProposta(true)} className="bg-brand-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-brand-700 transition-all shadow-sm">+ Proposta</button>}
        {activeTab === 'nf' && <button onClick={() => setShowNF(true)} className="bg-brand-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-brand-700 transition-all shadow-sm">+ Emitir NF</button>}
      </div>

      <div className="flex gap-2 border-b border-slate-200">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 rounded-t-lg font-medium text-sm transition-all ${activeTab === t.id ? 'bg-white border border-b-white border-slate-200 text-brand-600 -mb-px' : 'text-slate-500 hover:text-slate-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading && <div className="text-center py-8 text-slate-400">Carregando...</div>}

      {/* PROPOSTAS */}
      {activeTab === 'propostas' && !loading && (
        <div className="space-y-3">
          {propostas.length === 0 && <div className="bg-slate-50 border rounded-2xl p-8 text-center text-slate-400">Nenhuma proposta criada</div>}
          {propostas.map(p => (
            <div key={p.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-slate-800">{p.id}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${STATUS_COLORS[p.status] || ''}`}>{p.status}</span>
                  </div>
                  <p className="text-sm text-slate-500">Cliente: {p.cliente_id} · Validade: {p.validade} · Condição: {p.condicao_pagamento}</p>
                  <p className="text-sm font-semibold text-slate-700 mt-1">Valor: R$ {parseFloat(p.valor_total || 0).toFixed(2)} · Desconto: {p.desconto_global_pct}%</p>
                </div>
                <div className="flex gap-2 ml-3 flex-shrink-0">
                  {p.status === 'RASCUNHO' && <button onClick={() => avancarProposta(p.id, 'ENVIADA')} className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-1 rounded-lg hover:bg-amber-100">Enviar</button>}
                  {p.status === 'ENVIADA' && <>
                    <button onClick={() => avancarProposta(p.id, 'ACEITA')} className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1 rounded-lg hover:bg-emerald-100">Aceitar</button>
                    <button onClick={() => avancarProposta(p.id, 'RECUSADA')} className="text-xs bg-rose-50 text-rose-700 border border-rose-200 px-2 py-1 rounded-lg hover:bg-rose-100">Recusar</button>
                  </>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* NF SAÍDA */}
      {activeTab === 'nf' && !loading && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>{['NF Número', 'Série', 'Pedido Venda', 'Valor Total', 'ICMS', 'Data Emissão', 'Status'].map(h => <th key={h} className="px-4 py-3 text-left font-semibold text-slate-600">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {nfSaida.length === 0 && <tr><td colSpan={7} className="px-4 py-6 text-center text-slate-400">Nenhuma NF de saída emitida</td></tr>}
              {nfSaida.map(n => (
                <tr key={n.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono font-medium">{n.numero_nf}</td>
                  <td className="px-4 py-3">{n.serie}</td>
                  <td className="px-4 py-3">{n.pedido_venda_id}</td>
                  <td className="px-4 py-3 font-semibold">R$ {parseFloat(n.valor_total || 0).toFixed(2)}</td>
                  <td className="px-4 py-3">R$ {parseFloat(n.valor_icms || 0).toFixed(2)}</td>
                  <td className="px-4 py-3">{n.data_emissao?.slice(0,16)}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${STATUS_COLORS[n.status] || 'bg-slate-100 text-slate-600'}`}>{n.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Proposta */}
      {showProposta && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">Nova Proposta Comercial</h3>
            <form onSubmit={submitProposta} className="space-y-3">
              <select required className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={propForm.cliente_id} onChange={e => setPropForm(f => ({ ...f, cliente_id: e.target.value }))}>
                <option value="">Cliente...</option>
                {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Validade</label>
                  <input required type="date" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={propForm.validade} onChange={e => setPropForm(f => ({ ...f, validade: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Desconto Global %</label>
                  <input type="number" min="0" max="100" step="0.1" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={propForm.desconto_global_pct} onChange={e => setPropForm(f => ({ ...f, desconto_global_pct: e.target.value }))} />
                </div>
              </div>
              <input placeholder="Condição de Pagamento" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={propForm.condicao_pagamento} onChange={e => setPropForm(f => ({ ...f, condicao_pagamento: e.target.value }))} />
              <textarea placeholder="Observação" rows={2} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={propForm.observacao} onChange={e => setPropForm(f => ({ ...f, observacao: e.target.value }))} />
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowProposta(false)} className="flex-1 border border-slate-300 text-slate-700 py-2 rounded-xl font-medium hover:bg-slate-50">Cancelar</button>
                <button type="submit" className="flex-1 bg-brand-600 text-white py-2 rounded-xl font-medium hover:bg-brand-700">Criar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal NF Saída */}
      {showNF && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">Emitir NF de Saída</h3>
            <form onSubmit={submitNF} className="space-y-3">
              <select required className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={nfForm.pedido_venda_id} onChange={e => setNfForm(f => ({ ...f, pedido_venda_id: e.target.value }))}>
                <option value="">Pedido de Venda...</option>
                {pedidosVenda.map(p => <option key={p.id} value={p.id}>{p.id} — {p.cliente_nome || p.cliente_id}</option>)}
              </select>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2"><input required placeholder="Número NF" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={nfForm.numero_nf} onChange={e => setNfForm(f => ({ ...f, numero_nf: e.target.value }))} /></div>
                <input required placeholder="Série" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={nfForm.serie} onChange={e => setNfForm(f => ({ ...f, serie: e.target.value }))} />
              </div>
              <input required type="number" step="0.01" placeholder="Valor Total (R$)" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={nfForm.valor_total} onChange={e => setNfForm(f => ({ ...f, valor_total: e.target.value }))} />
              <div className="grid grid-cols-4 gap-2">
                {[['ICMS', 'valor_icms'], ['PIS', 'valor_pis'], ['COFINS', 'valor_cofins'], ['IPI', 'valor_ipi']].map(([label, key]) => (
                  <div key={key}>
                    <label className="block text-xs text-slate-500 mb-1">{label}</label>
                    <input type="number" step="0.01" min="0" className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-xs"
                      value={nfForm[key]} onChange={e => setNfForm(f => ({ ...f, [key]: e.target.value }))} />
                  </div>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowNF(false)} className="flex-1 border border-slate-300 text-slate-700 py-2 rounded-xl font-medium hover:bg-slate-50">Cancelar</button>
                <button type="submit" className="flex-1 bg-brand-600 text-white py-2 rounded-xl font-medium hover:bg-brand-700">Emitir</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
