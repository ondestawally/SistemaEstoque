import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const MES_NAMES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

export default function Fiscal({ setToast }) {
  const [activeTab, setActiveTab] = useState('regras');
  const [regras, setRegras] = useState([]);
  const [livro, setLivro] = useState([]);
  const [apuracao, setApuracao] = useState(null);
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tipoLivro, setTipoLivro] = useState('ENTRADA');
  const [mesSel, setMesSel] = useState(new Date().getMonth() + 1);
  const [anoSel, setAnoSel] = useState(new Date().getFullYear());
  const [showRegra, setShowRegra] = useState(false);

  const [regraForm, setRegraForm] = useState({
    produto_id: '', uf_origem: '', uf_destino: '', cfop: '',
    aliquota_icms: 0, aliquota_pis: 0.65, aliquota_cofins: 3, aliquota_ipi: 0
  });

  const load = async (tab) => {
    setLoading(true);
    try {
      const p = await api.getProdutos(); setProdutos(p);
      if (tab === 'regras') setRegras(await api.getRegrasFiscais());
      if (tab === 'livro') setLivro(await api.getLivroFiscal(tipoLivro));
      if (tab === 'apuracao') setApuracao(await api.getApuracaoFiscal(mesSel, anoSel));
    } catch (e) { setToast?.({ type: 'error', msg: e.message }); }
    setLoading(false);
  };

  useEffect(() => { load(activeTab); }, [activeTab]);

  const submitRegra = async (e) => {
    e.preventDefault();
    try {
      await api.criarRegraFiscal({
        id: `RF-${Date.now()}`,
        produto_id: regraForm.produto_id,
        uf_origem: regraForm.uf_origem.toUpperCase(),
        uf_destino: regraForm.uf_destino.toUpperCase(),
        cfop: regraForm.cfop,
        aliquota_icms: parseFloat(regraForm.aliquota_icms),
        aliquota_pis: parseFloat(regraForm.aliquota_pis),
        aliquota_cofins: parseFloat(regraForm.aliquota_cofins),
        aliquota_ipi: parseFloat(regraForm.aliquota_ipi),
      });
      setToast?.({ type: 'success', msg: 'Regra fiscal criada!' });
      setShowRegra(false);
      setRegras(await api.getRegrasFiscais());
    } catch (e) { setToast?.({ type: 'error', msg: e.message }); }
  };

  const loadLivro = async (tipo) => {
    setTipoLivro(tipo);
    try { setLivro(await api.getLivroFiscal(tipo)); } catch (e) {}
  };

  const loadApuracao = async () => {
    setLoading(true);
    try { setApuracao(await api.getApuracaoFiscal(mesSel, anoSel)); } catch (e) { setToast?.({ type: 'error', msg: e.message }); }
    setLoading(false);
  };

  const tabs = [
    { id: 'regras', label: '📋 Regras Fiscais' },
    { id: 'livro', label: '📖 Livro Fiscal' },
    { id: 'apuracao', label: '🧮 Apuração' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Fiscal</h2>
          <p className="text-slate-500 text-sm mt-1">Tributos · Livros Fiscais · Apuração ICMS/PIS/COFINS/IPI</p>
        </div>
        {activeTab === 'regras' && <button onClick={() => setShowRegra(true)} className="bg-brand-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-brand-700 transition-all shadow-sm">+ Regra Fiscal</button>}
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

      {/* REGRAS */}
      {activeTab === 'regras' && !loading && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>{['Produto', 'UF Orig.', 'UF Dest.', 'CFOP', 'ICMS%', 'PIS%', 'COFINS%', 'IPI%'].map(h => <th key={h} className="px-4 py-3 text-left font-semibold text-slate-600">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {regras.length === 0 && <tr><td colSpan={8} className="px-4 py-6 text-center text-slate-400">Nenhuma regra fiscal cadastrada</td></tr>}
              {regras.map(r => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">{r.produto_id}</td>
                  <td className="px-4 py-3 font-mono">{r.uf_origem}</td>
                  <td className="px-4 py-3 font-mono">{r.uf_destino}</td>
                  <td className="px-4 py-3 font-mono">{r.cfop}</td>
                  <td className="px-4 py-3">{r.aliquota_icms}%</td>
                  <td className="px-4 py-3">{r.aliquota_pis}%</td>
                  <td className="px-4 py-3">{r.aliquota_cofins}%</td>
                  <td className="px-4 py-3">{r.aliquota_ipi}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* LIVRO FISCAL */}
      {activeTab === 'livro' && !loading && (
        <div className="space-y-4">
          <div className="flex gap-2">
            {['ENTRADA', 'SAIDA'].map(tipo => (
              <button key={tipo} onClick={() => loadLivro(tipo)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tipoLivro === tipo ? 'bg-brand-600 text-white' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'}`}>
                {tipo === 'ENTRADA' ? '📥 Entradas' : '📤 Saídas'}
              </button>
            ))}
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>{['Data', 'NF', 'Participante', 'CFOP', 'Valor', 'ICMS', 'PIS', 'COFINS'].map(h => <th key={h} className="px-4 py-3 text-left font-semibold text-slate-600">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {livro.length === 0 && <tr><td colSpan={8} className="px-4 py-6 text-center text-slate-400">Nenhum lançamento no livro</td></tr>}
                {livro.map(l => (
                  <tr key={l.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">{l.data?.slice(0,10)}</td>
                    <td className="px-4 py-3 font-mono">{l.numero_nf}</td>
                    <td className="px-4 py-3">{l.participante_nome}</td>
                    <td className="px-4 py-3 font-mono">{l.cfop}</td>
                    <td className="px-4 py-3 font-semibold">R$ {parseFloat(l.valor_contabil || 0).toFixed(2)}</td>
                    <td className="px-4 py-3">R$ {parseFloat(l.valor_icms || 0).toFixed(2)}</td>
                    <td className="px-4 py-3">R$ {parseFloat(l.valor_pis || 0).toFixed(2)}</td>
                    <td className="px-4 py-3">R$ {parseFloat(l.valor_cofins || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* APURAÇÃO */}
      {activeTab === 'apuracao' && !loading && (
        <div className="space-y-4">
          <div className="flex gap-3 items-center">
            <select className="border border-slate-300 rounded-lg px-3 py-2 text-sm" value={mesSel} onChange={e => setMesSel(Number(e.target.value))}>
              {MES_NAMES.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
            </select>
            <select className="border border-slate-300 rounded-lg px-3 py-2 text-sm" value={anoSel} onChange={e => setAnoSel(Number(e.target.value))}>
              {[2024, 2025, 2026].map(a => <option key={a} value={a}>{a}</option>)}
            </select>
            <button onClick={loadApuracao} className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition-all">Calcular</button>
          </div>
          {apuracao && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'ICMS', value: apuracao.total_icms, color: 'from-violet-500 to-violet-700' },
                { label: 'PIS', value: apuracao.total_pis, color: 'from-blue-500 to-blue-700' },
                { label: 'COFINS', value: apuracao.total_cofins, color: 'from-sky-500 to-sky-700' },
                { label: 'IPI', value: apuracao.total_ipi, color: 'from-emerald-500 to-emerald-700' },
              ].map(k => (
                <div key={k.label} className={`bg-gradient-to-br ${k.color} rounded-2xl p-5 text-white shadow-lg`}>
                  <p className="text-sm font-medium opacity-80">{k.label}</p>
                  <p className="text-2xl font-bold mt-1">R$ {parseFloat(k.value || 0).toFixed(2)}</p>
                  <p className="text-xs opacity-70 mt-1">{MES_NAMES[mesSel-1]}/{anoSel}</p>
                </div>
              ))}
            </div>
          )}
          {!apuracao && <div className="text-center py-8 text-slate-400">Selecione o período e clique em Calcular</div>}
        </div>
      )}

      {/* Modal Regra */}
      {showRegra && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <h3 className="text-lg font-bold mb-4">Nova Regra Fiscal</h3>
            <form onSubmit={submitRegra} className="space-y-3">
              <select required className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={regraForm.produto_id} onChange={e => setRegraForm(f => ({ ...f, produto_id: e.target.value }))}>
                <option value="">Produto...</option>
                {produtos.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>
              <div className="grid grid-cols-3 gap-3">
                <input required placeholder="UF Origem (ex: SP)" maxLength={2} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm uppercase" value={regraForm.uf_origem} onChange={e => setRegraForm(f => ({ ...f, uf_origem: e.target.value }))} />
                <input required placeholder="UF Destino (ex: RJ)" maxLength={2} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm uppercase" value={regraForm.uf_destino} onChange={e => setRegraForm(f => ({ ...f, uf_destino: e.target.value }))} />
                <input required placeholder="CFOP (ex: 5102)" maxLength={4} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono" value={regraForm.cfop} onChange={e => setRegraForm(f => ({ ...f, cfop: e.target.value }))} />
              </div>
              <div className="grid grid-cols-4 gap-3">
                {[['ICMS%', 'aliquota_icms'], ['PIS%', 'aliquota_pis'], ['COFINS%', 'aliquota_cofins'], ['IPI%', 'aliquota_ipi']].map(([label, key]) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
                    <input type="number" step="0.01" min="0" max="100" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                      value={regraForm[key]} onChange={e => setRegraForm(f => ({ ...f, [key]: e.target.value }))} />
                  </div>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowRegra(false)} className="flex-1 border border-slate-300 text-slate-700 py-2 rounded-xl font-medium hover:bg-slate-50">Cancelar</button>
                <button type="submit" className="flex-1 bg-brand-600 text-white py-2 rounded-xl font-medium hover:bg-brand-700">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
