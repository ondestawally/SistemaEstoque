import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const TIPO_COLORS = {
  ATIVO: 'bg-emerald-100 text-emerald-700',
  PASSIVO: 'bg-rose-100 text-rose-700',
  RECEITA: 'bg-blue-100 text-blue-700',
  DESPESA: 'bg-amber-100 text-amber-700',
  PATRIMONIO: 'bg-violet-100 text-violet-700',
};

const DC_COLOR = {
  D: 'bg-amber-100 text-amber-700',
  C: 'bg-blue-100 text-blue-700',
};

export default function Contabilidade({ setToast }) {
  const [activeTab, setActiveTab] = useState('plano');
  const [contas, setContas] = useState([]);
  const [lancamentos, setLancamentos] = useState([]);
  const [balancete, setBalancete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showConta, setShowConta] = useState(false);
  const [showLanc, setShowLanc] = useState(false);

  const today = new Date().toISOString().slice(0, 10);
  const firstOfMonth = `${today.slice(0, 7)}-01`;

  const [filtBalIni, setFiltBalIni] = useState(firstOfMonth);
  const [filtBalFim, setFiltBalFim] = useState(today);
  const [filtLancIni, setFiltLancIni] = useState(firstOfMonth);
  const [filtLancFim, setFiltLancFim] = useState(today);

  const [contaForm, setContaForm] = useState({ codigo: '', nome: '', tipo: 'ATIVO', natureza: 'DEVEDORA', descricao: '' });
  const [lancForm, setLancForm] = useState({
    data: today, historico: '', usuario: '',
    partidas: [
      { conta_codigo: '', valor: '', dc: 'D' },
      { conta_codigo: '', valor: '', dc: 'C' },
    ]
  });

  const load = async (tab) => {
    setLoading(true);
    try {
      if (tab === 'plano') setContas(await api.getContas());
      if (tab === 'lancamentos') setLancamentos(await api.getLancamentos(filtLancIni, filtLancFim));
      if (tab === 'balancete') setBalancete(await api.getBalancete(filtBalIni, filtBalFim));
    } catch (e) { setToast?.({ type: 'error', msg: e.message }); }
    setLoading(false);
  };

  useEffect(() => { load(activeTab); }, [activeTab]);

  const submitConta = async (e) => {
    e.preventDefault();
    try {
      await api.criarConta(contaForm);
      setToast?.({ type: 'success', msg: `Conta ${contaForm.codigo} criada!` });
      setShowConta(false); setContaForm({ codigo: '', nome: '', tipo: 'ATIVO', natureza: 'DEVEDORA', descricao: '' });
      setContas(await api.getContas());
    } catch (e) { setToast?.({ type: 'error', msg: e.message }); }
  };

  const addPartida = () => setLancForm(f => ({ ...f, partidas: [...f.partidas, { conta_codigo: '', valor: '', dc: 'D' }] }));
  const removePartida = (i) => setLancForm(f => ({ ...f, partidas: f.partidas.filter((_, idx) => idx !== i) }));
  const updatePartida = (i, key, val) => setLancForm(f => {
    const partidas = [...f.partidas];
    partidas[i] = { ...partidas[i], [key]: val };
    return { ...f, partidas };
  });

  const totalD = lancForm.partidas.filter(p => p.dc === 'D').reduce((s, p) => s + (parseFloat(p.valor) || 0), 0);
  const totalC = lancForm.partidas.filter(p => p.dc === 'C').reduce((s, p) => s + (parseFloat(p.valor) || 0), 0);
  const equilibrado = Math.abs(totalD - totalC) < 0.01;

  const submitLancamento = async (e) => {
    e.preventDefault();
    if (!equilibrado) { setToast?.({ type: 'error', msg: `Desequilibrado: Débito R$${totalD.toFixed(2)} ≠ Crédito R$${totalC.toFixed(2)}` }); return; }
    try {
      await api.criarLancamento({
        id: `LC-${Date.now()}`,
        data: lancForm.data,
        historico: lancForm.historico,
        usuario: lancForm.usuario || 'sistema',
        partidas: lancForm.partidas.map(p => ({ conta_codigo: p.conta_codigo, valor: parseFloat(p.valor), dc: p.dc })),
      });
      setToast?.({ type: 'success', msg: 'Lançamento registrado!' });
      setShowLanc(false);
      setLancForm({ data: today, historico: '', usuario: '', partidas: [{ conta_codigo: '', valor: '', dc: 'D' }, { conta_codigo: '', valor: '', dc: 'C' }] });
      if (activeTab === 'lancamentos') setLancamentos(await api.getLancamentos(filtLancIni, filtLancFim));
    } catch (e) { setToast?.({ type: 'error', msg: e.message }); }
  };

  const carregarBalancete = async () => {
    setLoading(true);
    try { setBalancete(await api.getBalancete(filtBalIni, filtBalFim)); }
    catch (e) { setToast?.({ type: 'error', msg: e.message }); }
    setLoading(false);
  };

  const carregarLancamentos = async () => {
    setLoading(true);
    try { setLancamentos(await api.getLancamentos(filtLancIni, filtLancFim)); }
    catch (e) { setToast?.({ type: 'error', msg: e.message }); }
    setLoading(false);
  };

  // Contas agrupadas por tipo
  const contasPorTipo = contas.reduce((acc, c) => {
    if (!acc[c.tipo]) acc[c.tipo] = [];
    acc[c.tipo].push(c);
    return acc;
  }, {});

  const tabs = [
    { id: 'plano', label: '🗂 Plano de Contas' },
    { id: 'lancamentos', label: '📝 Lançamentos' },
    { id: 'balancete', label: '📊 Balancete' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Contabilidade</h2>
          <p className="text-slate-500 text-sm mt-1">Plano de Contas · Lançamentos (Partidas Dobradas) · Balancete</p>
        </div>
        {activeTab === 'plano' && <button onClick={() => setShowConta(true)} className="bg-brand-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-brand-700 transition-all shadow-sm">+ Conta</button>}
        {activeTab === 'lancamentos' && <button onClick={() => setShowLanc(true)} className="bg-brand-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-brand-700 transition-all shadow-sm">+ Lançamento</button>}
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

      {/* PLANO DE CONTAS */}
      {activeTab === 'plano' && !loading && (
        <div className="space-y-4">
          {Object.keys(contasPorTipo).length === 0 && <div className="bg-slate-50 border rounded-2xl p-8 text-center text-slate-400">Nenhuma conta no plano de contas</div>}
          {Object.entries(contasPorTipo).map(([tipo, cs]) => (
            <div key={tipo} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${TIPO_COLORS[tipo]}`}>{tipo}</span>
                <span className="text-sm text-slate-500">{cs.length} conta(s)</span>
              </div>
              <table className="w-full text-sm">
                <thead><tr>{['Código', 'Nome', 'Natureza', 'Descrição'].map(h => <th key={h} className="px-4 py-2 text-left text-xs font-semibold text-slate-500">{h}</th>)}</tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {cs.map(c => (
                    <tr key={c.codigo} className="hover:bg-slate-50">
                      <td className="px-4 py-2 font-mono text-slate-600">{c.codigo}</td>
                      <td className="px-4 py-2 font-medium">{c.nome}</td>
                      <td className="px-4 py-2"><span className={`px-2 py-0.5 rounded-full text-xs ${c.natureza === 'DEVEDORA' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'}`}>{c.natureza}</span></td>
                      <td className="px-4 py-2 text-slate-400 text-xs">{c.descricao || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}

      {/* LANÇAMENTOS */}
      {activeTab === 'lancamentos' && !loading && (
        <div className="space-y-4">
          <div className="flex gap-3 items-center">
            <input type="date" className="border border-slate-300 rounded-lg px-3 py-2 text-sm" value={filtLancIni} onChange={e => setFiltLancIni(e.target.value)} />
            <span className="text-slate-400">até</span>
            <input type="date" className="border border-slate-300 rounded-lg px-3 py-2 text-sm" value={filtLancFim} onChange={e => setFiltLancFim(e.target.value)} />
            <button onClick={carregarLancamentos} className="bg-brand-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-brand-700">Filtrar</button>
          </div>
          {lancamentos.length === 0 && <div className="bg-slate-50 border rounded-2xl p-8 text-center text-slate-400">Nenhum lançamento no período</div>}
          {lancamentos.map(l => (
            <div key={l.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="font-mono text-xs text-slate-400">{l.id}</span>
                  <p className="font-semibold text-slate-800">{l.historico}</p>
                </div>
                <div className="text-right text-sm text-slate-500">
                  <p>{l.data}</p>
                  <p className="text-xs">{l.usuario}</p>
                </div>
              </div>
              <div className="mt-2 overflow-hidden rounded-xl border border-slate-200">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50"><tr>{['Conta', 'D/C', 'Valor'].map(h => <th key={h} className="px-3 py-1.5 text-left text-xs font-semibold text-slate-500">{h}</th>)}</tr></thead>
                  <tbody>
                    {l.partidas.map((p, i) => (
                      <tr key={i} className="border-t border-slate-100">
                        <td className="px-3 py-1.5 font-mono text-xs">{p.conta_codigo}</td>
                        <td className="px-3 py-1.5"><span className={`px-2 py-0.5 rounded text-xs font-bold ${DC_COLOR[p.dc]}`}>{p.dc === 'D' ? 'Débito' : 'Crédito'}</span></td>
                        <td className="px-3 py-1.5 font-medium">R$ {p.valor.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* BALANCETE */}
      {activeTab === 'balancete' && !loading && (
        <div className="space-y-4">
          <div className="flex gap-3 items-center">
            <input type="date" className="border border-slate-300 rounded-lg px-3 py-2 text-sm" value={filtBalIni} onChange={e => setFiltBalIni(e.target.value)} />
            <span className="text-slate-400">até</span>
            <input type="date" className="border border-slate-300 rounded-lg px-3 py-2 text-sm" value={filtBalFim} onChange={e => setFiltBalFim(e.target.value)} />
            <button onClick={carregarBalancete} className="bg-brand-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-brand-700">Gerar</button>
          </div>
          {balancete && (
            <>
              <div className={`flex gap-3 p-3 rounded-xl border ${balancete.totais.equilibrado ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
                <span className="text-sm font-medium">{balancete.totais.equilibrado ? '✅ Balancete equilibrado' : '⚠ Balancete desequilibrado'}</span>
                <span className="text-sm text-slate-600 ml-auto">Total D: <strong>R$ {balancete.totais.total_debito.toFixed(2)}</strong> | Total C: <strong>R$ {balancete.totais.total_credito.toFixed(2)}</strong></span>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>{['Código', 'Nome', 'Tipo', 'Total Débito', 'Total Crédito', 'Saldo'].map(h => <th key={h} className="px-4 py-3 text-left font-semibold text-slate-600">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {balancete.contas.length === 0 && <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-400">Sem movimentações no período</td></tr>}
                    {balancete.contas.map(c => (
                      <tr key={c.codigo} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-mono text-slate-500">{c.codigo}</td>
                        <td className="px-4 py-3 font-medium">{c.nome}</td>
                        <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${TIPO_COLORS[c.tipo] || ''}`}>{c.tipo}</span></td>
                        <td className="px-4 py-3">R$ {c.total_debito.toFixed(2)}</td>
                        <td className="px-4 py-3">R$ {c.total_credito.toFixed(2)}</td>
                        <td className="px-4 py-3 font-bold">{c.saldo >= 0 ? '' : '-'}R$ {Math.abs(c.saldo).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
          {!balancete && <div className="text-center py-8 text-slate-400">Selecione o período e clique em Gerar</div>}
        </div>
      )}

      {/* Modal Nova Conta */}
      {showConta && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">Nova Conta Contábil</h3>
            <form onSubmit={submitConta} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input required placeholder="Código (ex: 1.1.01)" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono" value={contaForm.codigo} onChange={e => setContaForm(f => ({ ...f, codigo: e.target.value }))} />
                <input required placeholder="Nome da Conta" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={contaForm.nome} onChange={e => setContaForm(f => ({ ...f, nome: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <select required className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={contaForm.tipo}
                  onChange={e => {
                    const tipo = e.target.value;
                    const natureza = ['ATIVO', 'DESPESA'].includes(tipo) ? 'DEVEDORA' : 'CREDORA';
                    setContaForm(f => ({ ...f, tipo, natureza }));
                  }}>
                  <option value="ATIVO">ATIVO</option>
                  <option value="PASSIVO">PASSIVO</option>
                  <option value="RECEITA">RECEITA</option>
                  <option value="DESPESA">DESPESA</option>
                  <option value="PATRIMONIO">PATRIMÔNIO</option>
                </select>
                <select required className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={contaForm.natureza} onChange={e => setContaForm(f => ({ ...f, natureza: e.target.value }))}>
                  <option value="DEVEDORA">DEVEDORA</option>
                  <option value="CREDORA">CREDORA</option>
                </select>
              </div>
              <input placeholder="Descrição (opcional)" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={contaForm.descricao} onChange={e => setContaForm(f => ({ ...f, descricao: e.target.value }))} />
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowConta(false)} className="flex-1 border border-slate-300 text-slate-700 py-2 rounded-xl font-medium hover:bg-slate-50">Cancelar</button>
                <button type="submit" className="flex-1 bg-brand-600 text-white py-2 rounded-xl font-medium hover:bg-brand-700">Criar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Lançamento */}
      {showLanc && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">Novo Lançamento Contábil</h3>
            <form onSubmit={submitLancamento} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input required type="date" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={lancForm.data} onChange={e => setLancForm(f => ({ ...f, data: e.target.value }))} />
                <input placeholder="Usuário" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={lancForm.usuario} onChange={e => setLancForm(f => ({ ...f, usuario: e.target.value }))} />
              </div>
              <input required placeholder="Histórico" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={lancForm.historico} onChange={e => setLancForm(f => ({ ...f, historico: e.target.value }))} />

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-slate-700">Partidas (Déb. = Créd.)</label>
                  <button type="button" onClick={addPartida} className="text-xs text-brand-600 hover:text-brand-700 font-medium">+ Linha</button>
                </div>
                <div className="space-y-2">
                  {lancForm.partidas.map((p, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input required placeholder="Cód. Conta" className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono" value={p.conta_codigo} onChange={e => updatePartida(i, 'conta_codigo', e.target.value)} />
                      <select className="border border-slate-300 rounded-lg px-2 py-2 text-xs" value={p.dc} onChange={e => updatePartida(i, 'dc', e.target.value)}>
                        <option value="D">D (Débito)</option>
                        <option value="C">C (Crédito)</option>
                      </select>
                      <input required type="number" step="0.01" min="0" placeholder="Valor" className="w-24 border border-slate-300 rounded-lg px-2 py-2 text-xs" value={p.valor} onChange={e => updatePartida(i, 'valor', e.target.value)} />
                      {lancForm.partidas.length > 2 && <button type="button" onClick={() => removePartida(i)} className="text-rose-400 hover:text-rose-600 text-sm">✕</button>}
                    </div>
                  ))}
                </div>
                <div className={`mt-2 px-3 py-2 rounded-lg text-xs font-medium flex justify-between ${equilibrado ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                  <span>Débitos: R$ {totalD.toFixed(2)} | Créditos: R$ {totalC.toFixed(2)}</span>
                  <span>{equilibrado ? '✅ Equilibrado' : '⚠ Desequilibrado'}</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowLanc(false)} className="flex-1 border border-slate-300 text-slate-700 py-2 rounded-xl font-medium hover:bg-slate-50">Cancelar</button>
                <button type="submit" disabled={!equilibrado} className={`flex-1 py-2 rounded-xl font-medium transition-all ${equilibrado ? 'bg-brand-600 text-white hover:bg-brand-700' : 'bg-slate-300 text-slate-500 cursor-not-allowed'}`}>Lançar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
