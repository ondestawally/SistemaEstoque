import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const STATUS_COLORS = {
  RASCUNHO: 'bg-slate-100 text-slate-600',
  APROVADA: 'bg-blue-100 text-blue-700',
  COTANDO: 'bg-amber-100 text-amber-700',
  PEDIDO_EMITIDO: 'bg-violet-100 text-violet-700',
  FINALIZADA: 'bg-emerald-100 text-emerald-700',
  ABERTA: 'bg-blue-100 text-blue-700',
};

const STEPS = ['RASCUNHO', 'APROVADA', 'COTANDO', 'PEDIDO_EMITIDO', 'FINALIZADA'];

function StatusStepper({ status }) {
  const idx = STEPS.indexOf(status);
  return (
    <div className="flex items-center gap-1">
      {STEPS.map((s, i) => (
        <React.Fragment key={s}>
          <div className={`w-2.5 h-2.5 rounded-full ${i <= idx ? 'bg-brand-600' : 'bg-slate-200'}`} title={s} />
          {i < STEPS.length - 1 && <div className={`h-0.5 w-4 ${i < idx ? 'bg-brand-600' : 'bg-slate-200'}`} />}
        </React.Fragment>
      ))}
    </div>
  );
}

export default function ComprasWorkflow({ setToast }) {
  const [activeTab, setActiveTab] = useState('solicitacoes');
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [cotacoes, setCotacoes] = useState([]);
  const [nfEntradas, setNfEntradas] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [loading, setLoading] = useState(false);

  const [solForm, setSolForm] = useState({ solicitante: '', produto_id: '', quantidade: '', justificativa: '', urgencia: 'NORMAL' });
  const [showSol, setShowSol] = useState(false);
  const [confForm, setConfForm] = useState({ pedido_id: '', produto_id: '', quantidade_pedida: '', quantidade_recebida: '', responsavel: '', observacao: '' });
  const [showConf, setShowConf] = useState(false);
  const [nfForm, setNfForm] = useState({ numero: '', serie: '1', emitente_cnpj: '', emitente_nome: '', pedido_id: '', valor_total: '', data_emissao: '', chave_acesso: '' });
  const [showNF, setShowNF] = useState(false);

  const load = async (tab) => {
    setLoading(true);
    try {
      const [p, f] = await Promise.all([api.getProdutos(), api.getFornecedores()]);
      setProdutos(p); setFornecedores(f);
      if (tab === 'solicitacoes') setSolicitacoes(await api.getSolicitacoes());
      if (tab === 'cotacoes') setCotacoes(await api.getCotacoes());
      if (tab === 'nf') setNfEntradas(await api.getNfEntrada());
    } catch (e) { setToast?.({ type: 'error', msg: e.message }); }
    setLoading(false);
  };

  useEffect(() => { load(activeTab); }, [activeTab]);

  const submitSolicitacao = async (e) => {
    e.preventDefault();
    try {
      await api.criarSolicitacao({ id: `SOL-${Date.now()}`, ...solForm, quantidade: parseFloat(solForm.quantidade) });
      setToast?.({ type: 'success', msg: 'Solicitação criada!' });
      setShowSol(false); setSolForm({ solicitante: '', produto_id: '', quantidade: '', justificativa: '', urgencia: 'NORMAL' });
      setSolicitacoes(await api.getSolicitacoes());
    } catch (e) { setToast?.({ type: 'error', msg: e.message }); }
  };

  const avancar = async (id) => {
    try {
      const r = await api.avancarSolicitacao(id);
      setToast?.({ type: 'success', msg: r.message });
      setSolicitacoes(await api.getSolicitacoes());
    } catch (e) { setToast?.({ type: 'error', msg: e.message }); }
  };

  const submitConf = async (e) => {
    e.preventDefault();
    try {
      await api.registrarConferencia({ id: `CONF-${Date.now()}`, ...confForm, quantidade_pedida: parseFloat(confForm.quantidade_pedida), quantidade_recebida: parseFloat(confForm.quantidade_recebida) });
      setToast?.({ type: 'success', msg: 'Conferência registrada!' });
      setShowConf(false);
    } catch (e) { setToast?.({ type: 'error', msg: e.message }); }
  };

  const submitNF = async (e) => {
    e.preventDefault();
    try {
      await api.registrarNfEntrada({ id: `NFE-${Date.now()}`, ...nfForm, valor_total: parseFloat(nfForm.valor_total) });
      setToast?.({ type: 'success', msg: 'NF de entrada registrada!' });
      setShowNF(false); setNfEntradas(await api.getNfEntrada());
    } catch (e) { setToast?.({ type: 'error', msg: e.message }); }
  };

  const tabs = [
    { id: 'solicitacoes', label: '📝 Solicitações' },
    { id: 'cotacoes', label: '💹 Cotações' },
    { id: 'conferencia', label: '🔍 Conferência' },
    { id: 'nf', label: '🧾 NF Entrada' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Compras — Workflow</h2>
          <p className="text-slate-500 text-sm mt-1">Solicitação → Cotação → Pedido → Aprovação → Conferência → NF</p>
        </div>
        {activeTab === 'solicitacoes' && <button onClick={() => setShowSol(true)} className="bg-brand-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-brand-700 transition-all shadow-sm">+ Solicitação</button>}
        {activeTab === 'conferencia' && <button onClick={() => setShowConf(true)} className="bg-brand-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-brand-700 transition-all shadow-sm">+ Conferência</button>}
        {activeTab === 'nf' && <button onClick={() => setShowNF(true)} className="bg-brand-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-brand-700 transition-all shadow-sm">+ NF Entrada</button>}
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

      {/* SOLICITAÇÕES */}
      {activeTab === 'solicitacoes' && !loading && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>{['Solicitante', 'Produto', 'Qtde', 'Urgência', 'Status', 'Progresso', 'Ação'].map(h => <th key={h} className="px-4 py-3 text-left font-semibold text-slate-600">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {solicitacoes.length === 0 && <tr><td colSpan={7} className="px-4 py-6 text-center text-slate-400">Nenhuma solicitação</td></tr>}
              {solicitacoes.map(s => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{s.solicitante}</td>
                  <td className="px-4 py-3">{s.produto_id}</td>
                  <td className="px-4 py-3">{s.quantidade}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${s.urgencia === 'ALTA' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'}`}>{s.urgencia}</span></td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${STATUS_COLORS[s.status] || ''}`}>{s.status}</span></td>
                  <td className="px-4 py-3"><StatusStepper status={s.status} /></td>
                  <td className="px-4 py-3">
                    {s.status !== 'FINALIZADA' && (
                      <button onClick={() => avancar(s.id)} className="text-xs bg-brand-50 text-brand-600 border border-brand-200 px-3 py-1 rounded-lg hover:bg-brand-100 transition-all">Avançar →</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* COTAÇÕES */}
      {activeTab === 'cotacoes' && !loading && (
        <div className="space-y-4">
          {cotacoes.length === 0 && <div className="bg-slate-50 border rounded-2xl p-8 text-center text-slate-400">Nenhuma cotação registrada</div>}
          {cotacoes.map(c => (
            <div key={c.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div><p className="font-semibold text-slate-800">Cotação {c.id}</p><p className="text-sm text-slate-500">Solicitação: {c.solicitacao_id}</p></div>
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[c.status] || 'bg-slate-100 text-slate-600'}`}>{c.status}</span>
              </div>
              {c.itens?.length > 0 && (
                <table className="w-full text-sm">
                  <thead className="bg-slate-50"><tr>{['Fornecedor', 'Preço Unit.', 'Prazo (dias)', 'Condição'].map(h => <th key={h} className="px-3 py-2 text-left text-slate-600 font-medium">{h}</th>)}</tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {c.itens.map((i, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="px-3 py-2">{i.fornecedor_nome}</td>
                        <td className="px-3 py-2 font-semibold">R$ {i.preco_unitario?.toFixed(2)}</td>
                        <td className="px-3 py-2">{i.prazo_entrega_dias}</td>
                        <td className="px-3 py-2">{i.condicao_pagamento}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ))}
        </div>
      )}

      {/* CONFERÊNCIA */}
      {activeTab === 'conferencia' && !loading && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center text-slate-500">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-semibold text-slate-700">Conferência Física de Recebimento</p>
          <p className="text-sm mt-1">Registre a conferência de mercadorias ao receber um pedido de compra.</p>
          <button onClick={() => setShowConf(true)} className="mt-4 bg-brand-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-brand-700 transition-all">+ Registrar Conferência</button>
        </div>
      )}

      {/* NF ENTRADA */}
      {activeTab === 'nf' && !loading && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>{['Número', 'Série', 'Emitente', 'Valor Total', 'Data Emissão', 'Pedido'].map(h => <th key={h} className="px-4 py-3 text-left font-semibold text-slate-600">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {nfEntradas.length === 0 && <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-400">Nenhuma NF de entrada</td></tr>}
              {nfEntradas.map(n => (
                <tr key={n.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono font-medium">{n.numero}</td>
                  <td className="px-4 py-3">{n.serie}</td>
                  <td className="px-4 py-3">{n.emitente_nome}</td>
                  <td className="px-4 py-3 font-semibold">R$ {n.valor_total?.toFixed(2)}</td>
                  <td className="px-4 py-3">{n.data_emissao?.slice(0, 10)}</td>
                  <td className="px-4 py-3 text-slate-400">{n.pedido_id || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Solicitação */}
      {showSol && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">Nova Solicitação de Compra</h3>
            <form onSubmit={submitSolicitacao} className="space-y-3">
              <input required placeholder="Solicitante" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={solForm.solicitante} onChange={e => setSolForm(f => ({ ...f, solicitante: e.target.value }))} />
              <select required className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={solForm.produto_id} onChange={e => setSolForm(f => ({ ...f, produto_id: e.target.value }))}>
                <option value="">Produto...</option>
                {produtos.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>
              <input required type="number" placeholder="Quantidade" min="0" step="0.01" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={solForm.quantidade} onChange={e => setSolForm(f => ({ ...f, quantidade: e.target.value }))} />
              <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={solForm.urgencia} onChange={e => setSolForm(f => ({ ...f, urgencia: e.target.value }))}>
                <option value="NORMAL">NORMAL</option><option value="ALTA">ALTA</option><option value="URGENTE">URGENTE</option>
              </select>
              <textarea placeholder="Justificativa" rows={2} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={solForm.justificativa} onChange={e => setSolForm(f => ({ ...f, justificativa: e.target.value }))} />
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowSol(false)} className="flex-1 border border-slate-300 text-slate-700 py-2 rounded-xl font-medium hover:bg-slate-50">Cancelar</button>
                <button type="submit" className="flex-1 bg-brand-600 text-white py-2 rounded-xl font-medium hover:bg-brand-700">Criar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Conferência */}
      {showConf && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">Conferência Física</h3>
            <form onSubmit={submitConf} className="space-y-3">
              <input required placeholder="ID do Pedido" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={confForm.pedido_id} onChange={e => setConfForm(f => ({ ...f, pedido_id: e.target.value }))} />
              <select required className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={confForm.produto_id} onChange={e => setConfForm(f => ({ ...f, produto_id: e.target.value }))}>
                <option value="">Produto...</option>
                {produtos.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <input required type="number" placeholder="Qtde Pedida" step="0.01" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={confForm.quantidade_pedida} onChange={e => setConfForm(f => ({ ...f, quantidade_pedida: e.target.value }))} />
                <input required type="number" placeholder="Qtde Recebida" step="0.01" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={confForm.quantidade_recebida} onChange={e => setConfForm(f => ({ ...f, quantidade_recebida: e.target.value }))} />
              </div>
              <input placeholder="Responsável" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={confForm.responsavel} onChange={e => setConfForm(f => ({ ...f, responsavel: e.target.value }))} />
              <textarea placeholder="Observação" rows={2} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={confForm.observacao} onChange={e => setConfForm(f => ({ ...f, observacao: e.target.value }))} />
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowConf(false)} className="flex-1 border border-slate-300 text-slate-700 py-2 rounded-xl font-medium hover:bg-slate-50">Cancelar</button>
                <button type="submit" className="flex-1 bg-brand-600 text-white py-2 rounded-xl font-medium hover:bg-brand-700">Registrar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal NF Entrada */}
      {showNF && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">Registrar NF de Entrada</h3>
            <form onSubmit={submitNF} className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2"><input required placeholder="Número" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={nfForm.numero} onChange={e => setNfForm(f => ({ ...f, numero: e.target.value }))} /></div>
                <input required placeholder="Série" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={nfForm.serie} onChange={e => setNfForm(f => ({ ...f, serie: e.target.value }))} />
              </div>
              <input required placeholder="CNPJ Emitente" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={nfForm.emitente_cnpj} onChange={e => setNfForm(f => ({ ...f, emitente_cnpj: e.target.value }))} />
              <input required placeholder="Nome Emitente" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={nfForm.emitente_nome} onChange={e => setNfForm(f => ({ ...f, emitente_nome: e.target.value }))} />
              <div className="grid grid-cols-2 gap-3">
                <input required type="number" step="0.01" placeholder="Valor Total (R$)" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={nfForm.valor_total} onChange={e => setNfForm(f => ({ ...f, valor_total: e.target.value }))} />
                <input required type="date" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={nfForm.data_emissao} onChange={e => setNfForm(f => ({ ...f, data_emissao: e.target.value }))} />
              </div>
              <input placeholder="Chave de Acesso (opcional)" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={nfForm.chave_acesso} onChange={e => setNfForm(f => ({ ...f, chave_acesso: e.target.value }))} />
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowNF(false)} className="flex-1 border border-slate-300 text-slate-700 py-2 rounded-xl font-medium hover:bg-slate-50">Cancelar</button>
                <button type="submit" className="flex-1 bg-brand-600 text-white py-2 rounded-xl font-medium hover:bg-brand-700">Registrar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
