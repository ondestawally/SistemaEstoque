import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const STATUS_COLORS = {
  OK: 'bg-emerald-100 text-emerald-700',
  ATENCAO: 'bg-amber-100 text-amber-700',
  CRITICO: 'bg-rose-100 text-rose-700',
  SEM_ORCAMENTO: 'bg-slate-100 text-slate-500',
};

const TIPO_ICONS = {
  PRODUCAO: '🏭',
  ADMINISTRATIVO: '🏢',
  VENDAS: '💰',
  TI: '💻',
  LOGISTICA: '🚚',
  RH: '👥',
};

const MES_NAMES = ['', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export default function Controlling({ setToast }) {
  const [activeTab, setActiveTab] = useState('centros');
  const [centros, setCentros] = useState([]);
  const [orcamentos, setOrcamentos] = useState([]);
  const [variacoes, setVariacoes] = useState([]);
  const [resumo, setResumo] = useState(null);
  const [loading, setLoading] = useState(false);

  const anoAtual = new Date().getFullYear();
  const mesAtual = new Date().getMonth() + 1;

  const [filtAno, setFiltAno] = useState(anoAtual);
  const [filtMes, setFiltMes] = useState(mesAtual);
  const [filtCC, setFiltCC] = useState('');

  const [showCentro, setShowCentro] = useState(false);
  const [showOrc, setShowOrc] = useState(false);
  const [showReal, setShowReal] = useState(false);

  const [centroForm, setCentroForm] = useState({ codigo: '', nome: '', tipo: 'ADMINISTRATIVO', responsavel: '' });
  const [orcForm, setOrcForm] = useState({ ano: anoAtual, mes: mesAtual, centro_custo_id: '', conta_codigo: '', valor_orcado: '', observacao: '' });
  const [realForm, setRealForm] = useState({ ano: anoAtual, mes: mesAtual, centro_custo_id: '', conta_codigo: '', valor_realizado: '', descricao: '' });

  const load = async (tab) => {
    setLoading(true);
    try {
      const cs = await api.getCentrosCusto();
      setCentros(cs);
      if (tab === 'orcamento') setOrcamentos(await api.getOrcamento(filtAno, filtCC || null));
      if (tab === 'variacoes') {
        const [v, r] = await Promise.all([
          api.getVariacao(filtAno, filtMes || null, filtCC || null),
          api.getControllingResumo(filtAno),
        ]);
        setVariacoes(v); setResumo(r);
      }
    } catch (e) { setToast?.({ type: 'error', msg: e.message }); }
    setLoading(false);
  };

  useEffect(() => { load(activeTab); }, [activeTab]);

  const submitCentro = async (e) => {
    e.preventDefault();
    try {
      await api.criarCentroCusto({ id: `CC-${Date.now()}`, ...centroForm });
      setToast?.({ type: 'success', msg: 'Centro de custo criado!' });
      setShowCentro(false);
      setCentros(await api.getCentrosCusto());
    } catch (e) { setToast?.({ type: 'error', msg: e.message }); }
  };

  const submitOrc = async (e) => {
    e.preventDefault();
    try {
      await api.lancarOrcamento({ id: `ORC-${Date.now()}`, ...orcForm, valor_orcado: parseFloat(orcForm.valor_orcado), mes: parseInt(orcForm.mes), ano: parseInt(orcForm.ano) });
      setToast?.({ type: 'success', msg: 'Orçamento lançado!' });
      setShowOrc(false);
      setOrcamentos(await api.getOrcamento(filtAno, filtCC || null));
    } catch (e) { setToast?.({ type: 'error', msg: e.message }); }
  };

  const submitReal = async (e) => {
    e.preventDefault();
    try {
      await api.lancarRealizado({ id: `REAL-${Date.now()}`, ...realForm, valor_realizado: parseFloat(realForm.valor_realizado), mes: parseInt(realForm.mes), ano: parseInt(realForm.ano) });
      setToast?.({ type: 'success', msg: 'Realizado lançado!' });
      setShowReal(false);
    } catch (e) { setToast?.({ type: 'error', msg: e.message }); }
  };

  const recarregarVariacoes = async () => {
    setLoading(true);
    try {
      const [v, r] = await Promise.all([
        api.getVariacao(filtAno, filtMes || null, filtCC || null),
        api.getControllingResumo(filtAno),
      ]);
      setVariacoes(v); setResumo(r);
    } catch (e) { setToast?.({ type: 'error', msg: e.message }); }
    setLoading(false);
  };

  const tabs = [
    { id: 'centros', label: '🏢 Centros de Custo' },
    { id: 'orcamento', label: '📋 Orçamento' },
    { id: 'variacoes', label: '📊 Variações Real vs Orçado' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Controlling — Orçamento</h2>
          <p className="text-slate-500 text-sm mt-1">Centros de Custo · Plano Orçamentário · Variações Real vs Orçado</p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'centros' && <button onClick={() => setShowCentro(true)} className="bg-brand-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-brand-700 shadow-sm text-sm">+ Centro de Custo</button>}
          {activeTab === 'orcamento' && <>
            <button onClick={() => setShowReal(true)} className="border border-slate-300 text-slate-700 px-4 py-2 rounded-xl font-medium hover:bg-slate-50 text-sm">+ Realizado</button>
            <button onClick={() => setShowOrc(true)} className="bg-brand-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-brand-700 shadow-sm text-sm">+ Orçado</button>
          </>}
        </div>
      </div>

      {/* Resumo KPIs — só aparece na aba variações */}
      {activeTab === 'variacoes' && resumo && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: `Total Orçado ${resumo.ano}`, value: `R$ ${parseFloat(resumo.total_orcado || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`, icon: '📋', color: 'text-slate-700' },
            { label: 'Total Realizado', value: `R$ ${parseFloat(resumo.total_realizado || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`, icon: '✅', color: 'text-slate-700' },
            {
              label: 'Variação Total',
              value: `${(resumo.variacao_total || 0) >= 0 ? '+' : ''}R$ ${parseFloat(resumo.variacao_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`,
              icon: (resumo.variacao_total || 0) >= 0 ? '📈' : '📉',
              color: (resumo.variacao_total || 0) > 0 ? 'text-rose-600' : 'text-emerald-600',
            },
            { label: 'Centros de Custo', value: resumo.num_centros_custo, icon: '🏢', color: 'text-violet-600' },
          ].map(k => (
            <div key={k.label} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <div className="text-2xl mb-1">{k.icon}</div>
              <div className={`text-xl font-bold ${k.color}`}>{k.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{k.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 rounded-t-lg font-medium text-sm transition-all ${activeTab === t.id ? 'bg-white border border-b-white border-slate-200 text-brand-600 -mb-px' : 'text-slate-500 hover:text-slate-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading && <div className="text-center py-8 text-slate-400">Carregando...</div>}

      {/* CENTROS DE CUSTO */}
      {activeTab === 'centros' && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {centros.length === 0 && <div className="col-span-3 bg-slate-50 border rounded-2xl p-8 text-center text-slate-400">Nenhum centro de custo cadastrado</div>}
          {centros.map(c => (
            <div key={c.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{TIPO_ICONS[c.tipo] || '🏢'}</span>
                <div>
                  <p className="font-bold text-slate-800">{c.nome}</p>
                  <p className="text-xs font-mono text-slate-400">{c.codigo}</p>
                </div>
              </div>
              <div className="text-sm text-slate-600">
                <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600">{c.tipo}</span>
                {c.responsavel && <p className="mt-1 text-xs">👤 {c.responsavel}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ORÇAMENTO */}
      {activeTab === 'orcamento' && !loading && (
        <div className="space-y-4">
          <div className="flex gap-3 items-center flex-wrap">
            <input type="number" className="border border-slate-300 rounded-lg px-3 py-2 text-sm w-24" value={filtAno} onChange={e => setFiltAno(parseInt(e.target.value))} placeholder="Ano" />
            <select className="border border-slate-300 rounded-lg px-3 py-2 text-sm" value={filtCC} onChange={e => setFiltCC(e.target.value)}>
              <option value="">Todos os Centros</option>
              {centros.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
            <button onClick={async () => { setLoading(true); setOrcamentos(await api.getOrcamento(filtAno, filtCC || null)); setLoading(false); }} className="bg-brand-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-brand-700">Filtrar</button>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>{['Centro de Custo', 'Conta Contábil', 'Mês', 'Valor Orçado', 'Obs'].map(h => <th key={h} className="px-4 py-3 text-left font-semibold text-slate-600">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orcamentos.length === 0 && <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400">Nenhum orçamento lançado</td></tr>}
                {orcamentos.map(o => (
                  <tr key={o.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium">{centros.find(c => c.id === o.centro_custo_id)?.nome || o.centro_custo_id}</td>
                    <td className="px-4 py-3 font-mono text-slate-500">{o.conta_codigo}</td>
                    <td className="px-4 py-3">{MES_NAMES[o.mes]}/{o.ano}</td>
                    <td className="px-4 py-3 font-semibold text-violet-700">R$ {parseFloat(o.valor_orcado).toFixed(2)}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{o.observacao || ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VARIAÇÕES */}
      {activeTab === 'variacoes' && !loading && (
        <div className="space-y-4">
          <div className="flex gap-3 items-center flex-wrap">
            <input type="number" className="border border-slate-300 rounded-lg px-3 py-2 text-sm w-24" value={filtAno} onChange={e => setFiltAno(parseInt(e.target.value))} placeholder="Ano" />
            <select className="border border-slate-300 rounded-lg px-3 py-2 text-sm" value={filtMes} onChange={e => setFiltMes(parseInt(e.target.value))}>
              <option value="">Todos os Meses</option>
              {MES_NAMES.slice(1).map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
            </select>
            <select className="border border-slate-300 rounded-lg px-3 py-2 text-sm" value={filtCC} onChange={e => setFiltCC(e.target.value)}>
              <option value="">Todos os Centros</option>
              {centros.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
            <button onClick={recarregarVariacoes} className="bg-brand-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-brand-700">Calcular</button>
          </div>
          {variacoes.length === 0 && <div className="bg-slate-50 border rounded-2xl p-8 text-center text-slate-400">Nenhuma variação calculada. Lance orçamento e realizado primeiro.</div>}
          {variacoes.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>{['Centro de Custo', 'Conta', 'Mês', 'Orçado', 'Realizado', 'Variação', '%', 'Status'].map(h => <th key={h} className="px-3 py-3 text-left font-semibold text-slate-600">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {variacoes.map((v, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="px-3 py-3 font-medium">{v.centro_custo_nome}</td>
                      <td className="px-3 py-3 font-mono text-xs text-slate-500">{v.conta_codigo}</td>
                      <td className="px-3 py-3">{MES_NAMES[v.mes]}/{v.ano}</td>
                      <td className="px-3 py-3 text-violet-700">R$ {v.orcado.toFixed(2)}</td>
                      <td className="px-3 py-3 text-slate-700">R$ {v.realizado.toFixed(2)}</td>
                      <td className={`px-3 py-3 font-semibold ${v.variacao_absoluta > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {v.variacao_absoluta >= 0 ? '+' : ''}R$ {v.variacao_absoluta.toFixed(2)}
                      </td>
                      <td className="px-3 py-3">
                        {v.variacao_percentual != null ? (
                          <span className={`font-bold ${Math.abs(v.variacao_percentual) > 10 ? 'text-rose-600' : Math.abs(v.variacao_percentual) > 5 ? 'text-amber-600' : 'text-emerald-600'}`}>
                            {v.variacao_percentual >= 0 ? '+' : ''}{v.variacao_percentual}%
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-3 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${STATUS_COLORS[v.status] || ''}`}>{v.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal Centro de Custo */}
      {showCentro && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">Novo Centro de Custo</h3>
            <form onSubmit={submitCentro} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input required placeholder="Código (ex: CC-01)" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono" value={centroForm.codigo} onChange={e => setCentroForm(f => ({ ...f, codigo: e.target.value }))} />
                <input required placeholder="Nome" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={centroForm.nome} onChange={e => setCentroForm(f => ({ ...f, nome: e.target.value }))} />
              </div>
              <select required className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={centroForm.tipo} onChange={e => setCentroForm(f => ({ ...f, tipo: e.target.value }))}>
                {['PRODUCAO','ADMINISTRATIVO','VENDAS','TI','LOGISTICA','RH'].map(t => <option key={t} value={t}>{TIPO_ICONS[t]} {t}</option>)}
              </select>
              <input placeholder="Responsável (opcional)" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={centroForm.responsavel} onChange={e => setCentroForm(f => ({ ...f, responsavel: e.target.value }))} />
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCentro(false)} className="flex-1 border border-slate-300 text-slate-700 py-2 rounded-xl font-medium hover:bg-slate-50">Cancelar</button>
                <button type="submit" className="flex-1 bg-brand-600 text-white py-2 rounded-xl font-medium hover:bg-brand-700">Criar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Orçado */}
      {showOrc && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">Lançar Orçamento</h3>
            <form onSubmit={submitOrc} className="space-y-3">
              <select required className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={orcForm.centro_custo_id} onChange={e => setOrcForm(f => ({ ...f, centro_custo_id: e.target.value }))}>
                <option value="">Centro de Custo...</option>
                {centros.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
              <input required placeholder="Conta Contábil (ex: 3.1.01)" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono" value={orcForm.conta_codigo} onChange={e => setOrcForm(f => ({ ...f, conta_codigo: e.target.value }))} />
              <div className="grid grid-cols-3 gap-3">
                <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={orcForm.mes} onChange={e => setOrcForm(f => ({ ...f, mes: e.target.value }))}>
                  {MES_NAMES.slice(1).map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
                </select>
                <input type="number" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={orcForm.ano} onChange={e => setOrcForm(f => ({ ...f, ano: e.target.value }))} />
                <input required type="number" step="0.01" min="0" placeholder="Valor R$" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={orcForm.valor_orcado} onChange={e => setOrcForm(f => ({ ...f, valor_orcado: e.target.value }))} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowOrc(false)} className="flex-1 border border-slate-300 text-slate-700 py-2 rounded-xl font-medium hover:bg-slate-50">Cancelar</button>
                <button type="submit" className="flex-1 bg-brand-600 text-white py-2 rounded-xl font-medium hover:bg-brand-700">Lançar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Realizado */}
      {showReal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">Lançar Realizado</h3>
            <form onSubmit={submitReal} className="space-y-3">
              <select required className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={realForm.centro_custo_id} onChange={e => setRealForm(f => ({ ...f, centro_custo_id: e.target.value }))}>
                <option value="">Centro de Custo...</option>
                {centros.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
              <input required placeholder="Conta Contábil" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono" value={realForm.conta_codigo} onChange={e => setRealForm(f => ({ ...f, conta_codigo: e.target.value }))} />
              <div className="grid grid-cols-3 gap-3">
                <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={realForm.mes} onChange={e => setRealForm(f => ({ ...f, mes: e.target.value }))}>
                  {MES_NAMES.slice(1).map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
                </select>
                <input type="number" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={realForm.ano} onChange={e => setRealForm(f => ({ ...f, ano: e.target.value }))} />
                <input required type="number" step="0.01" min="0" placeholder="Valor R$" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={realForm.valor_realizado} onChange={e => setRealForm(f => ({ ...f, valor_realizado: e.target.value }))} />
              </div>
              <input placeholder="Descrição" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={realForm.descricao} onChange={e => setRealForm(f => ({ ...f, descricao: e.target.value }))} />
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowReal(false)} className="flex-1 border border-slate-300 text-slate-700 py-2 rounded-xl font-medium hover:bg-slate-50">Cancelar</button>
                <button type="submit" className="flex-1 bg-emerald-600 text-white py-2 rounded-xl font-medium hover:bg-emerald-700">Lançar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
